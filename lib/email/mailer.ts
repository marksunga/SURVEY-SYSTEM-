import * as net from 'net';
import * as tls from 'tls';
import { createAdminClient } from '@/lib/supabase/admin';

interface SendResetEmailParams {
  email: string;
  resetLink: string;
  recipientName?: string;
  roleName?: string;
  expiresInMinutes?: number;
}

export interface MailerResult {
  sent: boolean;
  provider: 'supabase' | 'smtp' | 'none';
  error?: string;
  missingConfig?: string[];
}

/**
 * Checks if Supabase has live production credentials configured
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return !url.includes('placeholder') && key.length > 30 && !key.includes('demo_');
}

/**
 * Sends a password reset email using Supabase Auth or configured SMTP server.
 * Returns sent: false with clear error if delivery fails.
 * NEVER pretends delivery succeeded if no email was transmitted.
 */
export async function sendPasswordResetEmail(params: SendResetEmailParams): Promise<MailerResult> {
  const {
    email,
    resetLink,
    recipientName = 'User',
    roleName = 'Student',
    expiresInMinutes = 20,
  } = params;

  // 1. Attempt Supabase Auth email recovery if Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetLink,
      });

      if (error) {
        console.error('[Supabase Auth] resetPasswordForEmail error:', error.message);
        return {
          sent: false,
          provider: 'supabase',
          error: `Supabase Auth recovery error: ${error.message}`,
        };
      }

      return { sent: true, provider: 'supabase' };
    } catch (err: any) {
      console.error('[Supabase Auth] Exception during password reset dispatch:', err);
      return {
        sent: false,
        provider: 'supabase',
        error: `Supabase Auth error: ${err.message}`,
      };
    }
  }

  // 2. Check for SMTP configuration (Supports SendGrid, Mailgun, AWS SES, Mailtrap, local test mailer)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || 'IT Department Portal <noreply@itdept.edu>';

  const missingSmtp: string[] = [];
  if (!smtpHost) missingSmtp.push('SMTP_HOST');

  if (missingSmtp.length === 0 && smtpHost) {
    try {
      await sendSmtpMail({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser || '',
        pass: smtpPassword || '',
        from: smtpFrom,
        to: email,
        subject: `IT Department Portal - ${roleName} Password Recovery`,
        text: `Hello ${recipientName},\n\nA password recovery request was initiated for your ${roleName} institutional account.\n\nPlease reset your password using the secure link below:\n${resetLink}\n\nThis recovery link will expire in ${expiresInMinutes} minutes.\n\nIf you did not request this recovery, please contact IT Administration immediately.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px;">
              <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700;">IT Department Feedback & Survey Portal</h1>
            </div>
            <h2 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">${roleName} Password Recovery</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">A password reset was requested for your <strong>${roleName}</strong> account (<code>${email}</code>). Click the button below to establish a new password:</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This recovery link is single-use and will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not initiate this request, your account remains secure and no action is required.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">IT Department Portal • Confidential Institutional Notification</p>
          </div>
        `,
      });

      return { sent: true, provider: 'smtp' };
    } catch (smtpErr: any) {
      console.error('[SMTP] Failed to send email via SMTP server:', smtpErr.message);
      return {
        sent: false,
        provider: 'smtp',
        error: `SMTP server delivery failure: ${smtpErr.message}`,
      };
    }
  }

  // 3. Neither Supabase Auth nor SMTP is configured
  const missing = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
  return {
    sent: false,
    provider: 'none',
    error: 'Outbound email delivery service is not configured. Please configure SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD) in your environment.',
    missingConfig: missing,
  };
}

/**
 * Robust SMTP client via Node.js net/tls socket supporting SSL, local test mailers, and standard auth
 */
function sendSmtpMail(options: {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const isTls = options.port === 465;
    const socket = isTls
      ? tls.connect(options.port, options.host, { rejectUnauthorized: false })
      : net.createConnection(options.port, options.host);

    let stage = 0;
    const boundary = '----=_Part_' + Date.now();
    const hasAuth = Boolean(options.user && options.pass);

    socket.setEncoding('utf8');
    socket.setTimeout(12000);

    socket.on('error', (err) => {
      reject(err);
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out'));
    });

    socket.on('data', (data) => {
      const response = data.toString();
      const code = parseInt(response.substring(0, 3), 10);

      if (code >= 400) {
        socket.end('QUIT\r\n');
        return reject(new Error(`SMTP server responded with error: ${response.trim()}`));
      }

      switch (stage) {
        case 0: // Greeting received
          stage = 1;
          socket.write(`EHLO itdept.local\r\n`);
          break;
        case 1: // EHLO response
          if (hasAuth) {
            stage = 2;
            socket.write(`AUTH LOGIN\r\n`);
          } else {
            // Unauthenticated local SMTP (e.g. MailHog / smtp4dev)
            stage = 5;
            const fromAddr = options.from.includes('<')
              ? options.from.replace(/.*<([^>]+)>.*/, '$1')
              : options.from;
            socket.write(`MAIL FROM:<${fromAddr}>\r\n`);
          }
          break;
        case 2: // Username prompt
          stage = 3;
          socket.write(Buffer.from(options.user).toString('base64') + '\r\n');
          break;
        case 3: // Password prompt
          stage = 4;
          socket.write(Buffer.from(options.pass).toString('base64') + '\r\n');
          break;
        case 4: // Authenticated
          stage = 5;
          const fromAddr = options.from.includes('<')
            ? options.from.replace(/.*<([^>]+)>.*/, '$1')
            : options.from;
          socket.write(`MAIL FROM:<${fromAddr}>\r\n`);
          break;
        case 5: // MAIL FROM ok
          stage = 6;
          socket.write(`RCPT TO:<${options.to}>\r\n`);
          break;
        case 6: // RCPT TO ok
          stage = 7;
          socket.write(`DATA\r\n`);
          break;
        case 7: // DATA prompt (354)
          stage = 8;
          const rawMessage = [
            `From: ${options.from}`,
            `To: ${options.to}`,
            `Subject: ${options.subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            ``,
            `--${boundary}`,
            `Content-Type: text/plain; charset=utf-8`,
            ``,
            options.text,
            ``,
            `--${boundary}`,
            `Content-Type: text/html; charset=utf-8`,
            ``,
            options.html,
            ``,
            `--${boundary}--`,
            `.`,
            ``,
          ].join('\r\n');
          socket.write(rawMessage);
          break;
        case 8: // Sent ok
          stage = 9;
          socket.write(`QUIT\r\n`);
          resolve();
          break;
      }
    });
  });
}
