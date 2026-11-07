import * as net from 'net';
import * as tls from 'tls';
import { createAdminClient } from '@/lib/supabase/admin';

interface SendResetEmailParams {
  email: string;
  resetLink: string;
  recipientName?: string;
  expiresInMinutes?: number;
}

export interface MailerResult {
  sent: boolean;
  provider: 'supabase' | 'smtp' | 'none';
  error?: string;
  missingConfig?: string[];
}

/**
 * Checks if Supabase has real production credentials configured
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return !url.includes('placeholder') && key.length > 30 && !key.includes('demo_');
}

/**
 * Sends a password reset email using Supabase Auth or configured SMTP.
 * Never silently simulates delivery if an error occurs.
 */
export async function sendPasswordResetEmail(params: SendResetEmailParams): Promise<MailerResult> {
  const { email, resetLink, recipientName = 'User', expiresInMinutes = 15 } = params;

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
          error: error.message,
        };
      }

      return { sent: true, provider: 'supabase' };
    } catch (err: any) {
      console.error('[Supabase Auth] Exception during password reset dispatch:', err);
    }
  }

  // 2. Check for SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || 'IT Department Portal <noreply@itdept.edu>';

  const missingSmtp: string[] = [];
  if (!smtpHost) missingSmtp.push('SMTP_HOST');
  if (!smtpUser) missingSmtp.push('SMTP_USER');
  if (!smtpPassword) missingSmtp.push('SMTP_PASSWORD');

  if (missingSmtp.length === 0 && smtpHost && smtpUser && smtpPassword) {
    try {
      await sendSmtpMail({
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPassword,
        from: smtpFrom,
        to: email,
        subject: 'IT Department Portal - Password Recovery Request',
        text: `Hello ${recipientName},\n\nA password recovery request was initiated for your institutional account.\n\nPlease reset your password using the secure link below:\n${resetLink}\n\nThis recovery link will expire in ${expiresInMinutes} minutes.\n\nIf you did not request this recovery, please contact IT Administration immediately.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <div style="background: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 24px;">
              <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700;">IT Department Feedback & Survey Portal</h1>
            </div>
            <h2 style="color: #0f172a; font-size: 16px; margin-bottom: 12px;">Password Recovery Request</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello <strong>${recipientName}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">A password reset was requested for your institutional account (<code>${email}</code>). Click the button below to establish a new password:</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">Reset My Password</a>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This recovery link is strictly time-limited and will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not initiate this request, your account remains secure and no action is required.</p>
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
        error: smtpErr.message,
      };
    }
  }

  // 3. Neither Supabase nor SMTP configured: Document missing variables
  const missing = isSupabaseConfigured() ? missingSmtp : ['NEXT_PUBLIC_SUPABASE_URL', ...missingSmtp];
  console.warn(
    `[Mailer] Outbound email service is not configured. Missing parameters: ${missing.join(', ')}.`
  );

  return {
    sent: false,
    provider: 'none',
    missingConfig: missing,
  };
}

/**
 * Lightweight, zero-dependency SMTP client via Node.js net/tls socket
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
    const socket = options.port === 465
      ? tls.connect(options.port, options.host)
      : net.createConnection(options.port, options.host);

    let stage = 0;
    const boundary = '----=_Part_' + Date.now();

    socket.setEncoding('utf8');
    socket.setTimeout(15000);

    socket.on('error', (err) => {
      reject(err);
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out after 15 seconds'));
    });

    socket.on('data', (data) => {
      const response = data.toString();
      const code = parseInt(response.substring(0, 3), 10);

      if (code >= 400) {
        socket.end('QUIT\r\n');
        return reject(new Error(`SMTP server rejected command: ${response.trim()}`));
      }

      switch (stage) {
        case 0: // Greeting received
          stage = 1;
          socket.write(`EHLO itdept.local\r\n`);
          break;
        case 1: // EHLO response
          stage = 2;
          socket.write(`AUTH LOGIN\r\n`);
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
          const fromAddr = options.from.includes('<') ? options.from.replace(/.*<([^>]+)>.*/, '$1') : options.from;
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

