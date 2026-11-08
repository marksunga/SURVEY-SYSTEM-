'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { UserRole } from '@/lib/types/database';
import { setSessionUser, clearSessionUser, getCurrentUser } from '@/lib/auth/session';
import { validatePasswordStrength, verifyPassword, hashPassword } from '@/lib/crypto/passwords';
import { sendPasswordResetEmail } from '@/lib/email/mailer';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Strict Administrator Authentication
 * Verifies both email and one-way hashed password.
 * Only accounts with role 'ADMINISTRATOR' are permitted.
 */
export async function adminLoginAction(formData: FormData) {
  const username = ((formData.get('username') || formData.get('email')) as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Both administrator username and password are required.' };
  }

  // Safety check on production Vercel
  if (process.env.VERCEL === '1' && !isLiveSupabaseConfigured()) {
    return {
      error:
        'Vercel Configuration Required: Supabase environment variables are missing on Vercel. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY under Vercel Settings -> Environment Variables, then Redeploy.',
    };
  }

  // Live Supabase Authentication (when configured)
  if (isLiveSupabaseConfigured()) {
    try {
      const adminEmail = username.toLowerCase() === 'admin' ? 'admin@ua.edu.ph' : username;
      const supabaseAdmin = createAdminClient();

      // Check against Supabase auth
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password,
      });

      if (!authError && authData.user) {
        const { data: dbProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (dbProfile) {
          if (dbProfile.role_id !== 'ADMINISTRATOR') {
            return { error: 'Access denied. Only Administrator accounts can log in here.' };
          }
          if (!dbProfile.is_active) {
            return { error: 'This administrator account is deactivated. Contact Department Administration.' };
          }

          if (!MockAdapter.getProfileById(dbProfile.id)) {
            MockAdapter.createUser(dbProfile, password);
          }

          await setSessionUser(dbProfile.id);
          MockAdapter.logAudit(dbProfile.email, 'ADMIN_LOGIN', 'USER', dbProfile.id, {
            method: 'SUPABASE_AUTH',
            portal: 'ADMIN_PORTAL',
          });

          revalidatePath('/');
          redirect('/admin/dashboard');
        }
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT') throw err;
      console.warn('Supabase admin login fallback:', err?.message);
    }
  }

  // 1. Verify credentials via one-way password hashing (scrypt)
  const authResult = MockAdapter.verifyUserCredentials(username, password);
  if (!authResult.success || !authResult.user) {
    return { error: authResult.error || 'Invalid administrator username or password.' };
  }

  const profile = authResult.user;

  // 2. Strict Role Verification: Only ADMINISTRATOR role permitted
  if (profile.role_id !== 'ADMINISTRATOR') {
    return {
      error: 'Access denied. Only Administrator accounts can log in here. Students must log in at /student/login with their @ua.edu.ph email.',
    };
  }

  if (!profile.is_active) {
    return { error: 'This administrator account is deactivated. Contact Department Administration.' };
  }

  // 3. Establish authenticated session
  await setSessionUser(profile.id);

  MockAdapter.logAudit(profile.email, 'ADMIN_LOGIN', 'USER', profile.id, {
    method: 'PASSWORD',
    portal: 'ADMIN_PORTAL',
    username: username.toLowerCase(),
  });

  revalidatePath('/');
  redirect('/admin/dashboard');
}

/**
 * Strict Student Authentication
 * Verifies both email and one-way hashed password.
 * Only accounts with role 'STUDENT' are permitted.
 * Requires official University of the Assumption email ending with @ua.edu.ph.
 */
export async function studentLoginAction(formData: FormData) {
  const identifier = ((formData.get('email') || formData.get('username')) as string)?.trim();
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { error: 'Both student email and password are required.' };
  }

  // If email domain entered, enforce @ua.edu.ph
  const cleanId = identifier.toLowerCase();
  if (cleanId.includes('@') && !cleanId.endsWith('@ua.edu.ph') && !cleanId.endsWith('@itdept.edu')) {
    return { error: 'Student login requires an official @ua.edu.ph institutional email (e.g. student@ua.edu.ph).' };
  }

  // Safety check on production Vercel
  if (process.env.VERCEL === '1' && !isLiveSupabaseConfigured()) {
    return {
      error:
        'Vercel Configuration Required: Supabase environment variables are missing on Vercel. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY under Vercel Settings -> Environment Variables, then Redeploy.',
    };
  }

  // Live Supabase Authentication (when configured)
  if (isLiveSupabaseConfigured()) {
    try {
      const supabaseAdmin = createAdminClient();
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanId,
        password,
      });

      if (!authError && authData.user) {
        const { data: dbProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (dbProfile) {
          if (dbProfile.role_id !== 'STUDENT') {
            return {
              error: 'Access denied. Administrator accounts must log in through the Administrator portal at /admin/login.',
            };
          }
          if (!dbProfile.is_active) {
            return { error: 'This student account has been deactivated by the IT Administrator.' };
          }

          if (!MockAdapter.getProfileById(dbProfile.id)) {
            MockAdapter.createUser(dbProfile, password);
          }

          await setSessionUser(dbProfile.id);
          MockAdapter.logAudit(dbProfile.email, 'STUDENT_LOGIN', 'USER', dbProfile.id, {
            method: 'SUPABASE_AUTH',
            portal: 'STUDENT_PORTAL',
          });

          revalidatePath('/');
          redirect('/student/dashboard');
        }
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT') throw err;
      console.warn('Supabase student login fallback:', err?.message);
    }
  }

  // 1. Verify credentials via one-way password hashing (scrypt)
  const authResult = MockAdapter.verifyUserCredentials(identifier, password);
  if (!authResult.success || !authResult.user) {
    return { error: authResult.error || 'Invalid student email or password.' };
  }

  const profile = authResult.user;

  // 2. Strict Role Verification: Only STUDENT role permitted
  if (profile.role_id !== 'STUDENT') {
    return {
      error: 'Access denied. Administrator accounts must log in through the Administrator portal at /admin/login.',
    };
  }

  if (!profile.is_active) {
    return { error: 'This student account has been deactivated by the IT Administrator.' };
  }

  // 3. Establish authenticated session
  await setSessionUser(profile.id);

  MockAdapter.logAudit(profile.email, 'STUDENT_LOGIN', 'USER', profile.id, {
    method: 'PASSWORD',
    portal: 'STUDENT_PORTAL',
  });

  revalidatePath('/');
  redirect('/student/dashboard');
}

/**
 * Student Self-Registration
 * Automatically assigns role 'STUDENT' and securely hashes passwords.
 * Requires institutional student email ending with @ua.edu.ph.
 */
export async function studentRegisterAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const fullName = (formData.get('fullName') as string)?.trim();
  const idNumber = (formData.get('idNumber') as string)?.trim();
  const department = (formData.get('department') as string)?.trim() || 'Information Technology';
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // 1. Required fields validation
  if (!fullName) {
    return { error: 'Student full name is required.' };
  }
  if (!email) {
    return { error: 'Student institutional email is required.' };
  }
  if (!password) {
    return { error: 'Password is required.' };
  }

  // 2. Institutional Email domain validation (@ua.edu.ph required)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || !email.endsWith('@ua.edu.ph')) {
    return {
      error:
        'Registration requires an official University of the Assumption email ending with @ua.edu.ph (e.g. yourname@ua.edu.ph).',
    };
  }

  // 3. Password requirements validation (at least 8 chars, mixed case, numbers, special)
  const strengthCheck = validatePasswordStrength(password);
  if (!strengthCheck.valid) {
    return { error: strengthCheck.errors[0] };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { error: 'Passwords do not match. Please ensure both password fields match.' };
  }

  // 4. Duplicate checks
  const existingEmail = MockAdapter.getProfileByEmail(email);
  if (existingEmail) {
    return { error: 'An account with this institutional email already exists. Please sign in.' };
  }

  if (idNumber) {
    const existingId = MockAdapter.getProfiles().find(
      (p) => p.id_number && p.id_number.trim().toLowerCase() === idNumber.toLowerCase()
    );
    if (existingId) {
      return { error: 'A student account with this Student ID Number is already registered.' };
    }
  }

  let id = crypto.randomUUID();

  // Safety check on production Vercel
  if (process.env.VERCEL === '1' && !isLiveSupabaseConfigured()) {
    return {
      error:
        'Vercel Configuration Required: Supabase environment variables are missing on Vercel. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY under Vercel Settings -> Environment Variables, then Redeploy.',
    };
  }

  // 5. Create in Live Supabase database if configured
  if (isLiveSupabaseConfigured()) {
    try {
      const supabaseAdmin = createAdminClient();

      // Check if duplicate exists in Supabase
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        return { error: 'An account with this institutional email already exists in the system.' };
      }

      if (idNumber) {
        const { data: existingIdRec } = await supabaseAdmin
          .from('profiles')
          .select('id, id_number')
          .eq('id_number', idNumber)
          .maybeSingle();

        if (existingIdRec) {
          return { error: 'A student account with this Student ID Number is already registered.' };
        }
      }

      // Create in Supabase Auth (auth.users)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role_id: 'STUDENT',
          id_number: idNumber || null,
          department,
        },
      });

      if (authError || !authData?.user) {
        return { error: authError?.message || 'Failed to create student account on Supabase Auth.' };
      }

      id = authData.user.id;

      // Upsert into public.profiles
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id,
        email,
        full_name: fullName,
        role_id: 'STUDENT',
        id_number: idNumber || null,
        department,
        is_active: true,
      });

      if (profileError) {
        console.error('Error inserting into public.profiles:', profileError);
      }

      // Record audit log
      await supabaseAdmin.from('audit_logs').insert({
        actor_id: id,
        actor_email: email,
        action: 'STUDENT_REGISTERED',
        entity_type: 'USER',
        entity_id: id,
        details: { role: 'STUDENT', id_number: idNumber },
      });
    } catch (err: any) {
      console.error('Supabase registration error:', err);
      return { error: err?.message || 'Failed to connect to Supabase. Please check your credentials.' };
    }
  }

  // Role is strictly hardcoded to STUDENT; password is one-way hashed with scrypt
  const newProfile = MockAdapter.createUser(
    {
      id,
      email,
      full_name: fullName,
      role_id: 'STUDENT',
      department,
      id_number: idNumber || '',
      is_active: true,
    },
    password
  );

  await setSessionUser(newProfile.id);

  MockAdapter.logAudit(newProfile.email, 'STUDENT_REGISTERED', 'USER', newProfile.id, {
    role: 'STUDENT',
    id_number: idNumber,
  });

  revalidatePath('/');
  redirect('/student/dashboard');
}

/**
 * General Login Action (Redirects based on verified role)
 */
export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Both email and password are required.' };
  }

  const authResult = MockAdapter.verifyUserCredentials(email, password);
  if (!authResult.success || !authResult.user) {
    return { error: authResult.error || 'Invalid email or password.' };
  }

  const profile = authResult.user;

  if (!profile.is_active) {
    return { error: 'This account has been deactivated by the IT Administrator.' };
  }

  await setSessionUser(profile.id);

  MockAdapter.logAudit(profile.email, 'USER_LOGIN', 'USER', profile.id, {
    method: 'PASSWORD',
  });

  revalidatePath('/');

  if (profile.role_id === 'ADMINISTRATOR') {
    redirect('/admin/dashboard');
  } else {
    redirect('/student/dashboard');
  }
}

export async function registerAction(formData: FormData) {
  return studentRegisterAction(formData);
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    MockAdapter.logAudit(user.email, 'USER_LOGOUT', 'USER', user.id);
  }
  await clearSessionUser();
  revalidatePath('/');
  redirect('/');
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const fullName = formData.get('fullName') as string;
  const department = formData.get('department') as string;
  const idNumber = formData.get('idNumber') as string;

  MockAdapter.updateProfile(user.id, {
    full_name: fullName || user.full_name,
    department: department || user.department,
    id_number: idNumber || user.id_number,
  });

  MockAdapter.logAudit(user.email, 'PROFILE_UPDATED', 'USER', user.id);
  revalidatePath('/profile');
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (currentPassword) {
    const authCheck = MockAdapter.verifyUserCredentials(user.email, currentPassword);
    if (!authCheck.success) {
      return { error: 'Current password entered is incorrect.' };
    }
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return { error: strength.errors[0] };
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  MockAdapter.setUserPassword(user.id, newPassword);

  MockAdapter.logAudit(user.email, 'PASSWORD_UPDATED', 'USER', user.id);
  revalidatePath('/profile');
  return { success: true, message: 'Password updated successfully!' };
}

/**
 * Student Forgot Password Action
 * Generates a cryptographically secure, time-limited recovery link for Student accounts
 * and dispatches via configured email service (Supabase Auth / SMTP).
 * Administrator account recovery is disabled by design.
 */
export async function forgotPasswordAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email) {
    return { error: 'Student institutional email address is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid institutional email address (e.g. yourname@itdept.edu).' };
  }

  const profile = MockAdapter.getProfileByEmail(email);

  if (!profile) {
    return { error: 'No active student account found with this institutional email address.' };
  }

  if (!profile.is_active) {
    return { error: 'This account has been deactivated. Please contact IT Administration.' };
  }

  // Administrator accounts cannot be reset via online self-service
  if (profile.role_id === 'ADMINISTRATOR') {
    return {
      error: 'Administrator accounts cannot be reset via online self-service. Please contact IT Department Administration directly.',
    };
  }

  const tokenResult = MockAdapter.createPasswordResetToken(profile.email, 'STUDENT');

  if (tokenResult.error || !tokenResult.token) {
    return { error: tokenResult.error || 'Failed to generate recovery token.' };
  }

  const baseUrl = getAppBaseUrl();
  const resetLink = `${baseUrl}/auth/reset-password?token=${tokenResult.token}`;

  // Dispatch recovery email through configured email delivery service
  const mailerResult = await sendPasswordResetEmail({
    email: profile.email,
    resetLink,
    recipientName: profile.full_name,
    roleName: 'Student',
    expiresInMinutes: 20,
  });

  MockAdapter.logAudit(profile.email, 'PASSWORD_RESET_REQUESTED', 'USER', profile.id, {
    provider: mailerResult.provider,
    sent: mailerResult.sent,
    portal: 'STUDENT',
  });

  // CRITICAL: Do not display fake success if email was not transmitted
  if (!mailerResult.sent) {
    return {
      error:
        mailerResult.error ||
        'Failed to dispatch recovery email. Outbound email service is not configured. Please verify your SMTP settings in environment variables.',
    };
  }

  return {
    success: true,
    message: `A secure password recovery email has been successfully dispatched to ${profile.email}. Please open the link in your email within 20 minutes to reset your password.`,
  };
}

/**
 * Verify Recovery Token Action (Used by /auth/reset-password page)
 * Enforces token validity, expiration (20 min), single-use status, and student-only scope.
 */
export async function verifyResetTokenAction(token: string) {
  const invalidMessage = 'Your password reset link is invalid or has expired. Please request a new recovery link.';

  if (!token || typeof token !== 'string') {
    return { valid: false, error: invalidMessage };
  }

  const result = MockAdapter.verifyPasswordResetToken(token, 'STUDENT');
  if (!result.valid) {
    return { valid: false, error: result.error || invalidMessage };
  }

  return {
    valid: true,
    email: result.email,
    roleId: result.roleId,
  };
}

/**
 * Reset Password with Token Action
 * Consumes the recovery token (single-use), updates the password hash, and revokes sessions.
 * Exclusively permits Student accounts.
 */
export async function resetPasswordWithTokenAction(formData: FormData) {
  const token = (formData.get('token') as string)?.trim();
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const invalidMessage = 'Your password reset link is invalid or has expired. Please request a new recovery link.';

  if (!token) {
    return { error: invalidMessage };
  }

  if (!newPassword || !confirmPassword) {
    return { error: 'Both password and confirmation fields are required.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match. Please ensure both passwords match exactly.' };
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return { error: strength.errors[0] };
  }

  const consumeResult = MockAdapter.consumePasswordResetToken(token, newPassword, 'STUDENT');
  if (!consumeResult.success) {
    return { error: consumeResult.error || invalidMessage };
  }

  // Revoke existing sessions
  await clearSessionUser();

  return {
    success: true,
    roleId: consumeResult.roleId,
    message: 'Your password has been changed successfully. You may now log in with your new credentials.',
  };
}
