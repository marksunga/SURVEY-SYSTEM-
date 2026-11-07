'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { UserRole } from '@/lib/types/database';
import { setSessionUser, clearSessionUser, getCurrentUser } from '@/lib/auth/session';
import { validatePasswordStrength, verifyPassword, hashPassword } from '@/lib/crypto/passwords';
import { sendPasswordResetEmail } from '@/lib/email/mailer';

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * Strict Administrator Authentication
 * Verifies both email and one-way hashed password.
 * Only accounts with role 'ADMINISTRATOR' are permitted.
 */
export async function adminLoginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Both administrator email and password are required.' };
  }

  // 1. Verify credentials via one-way password hashing (scrypt)
  const authResult = MockAdapter.verifyUserCredentials(email, password);
  if (!authResult.success || !authResult.user) {
    return { error: authResult.error || 'Invalid administrator email or password.' };
  }

  const profile = authResult.user;

  // 2. Strict Role Verification: Only ADMINISTRATOR role permitted
  if (profile.role_id !== 'ADMINISTRATOR') {
    return {
      error: 'Access denied. Only Administrator accounts can log in here. Students must log in at /student/login.',
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
  });

  revalidatePath('/');
  redirect('/admin/dashboard');
}

/**
 * Strict Student Authentication
 * Verifies both email and one-way hashed password.
 * Only accounts with role 'STUDENT' are permitted.
 */
export async function studentLoginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Both student email and password are required.' };
  }

  // 1. Verify credentials via one-way password hashing (scrypt)
  const authResult = MockAdapter.verifyUserCredentials(email, password);
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
  if (!idNumber) {
    return { error: 'Student ID number is required.' };
  }
  if (!email) {
    return { error: 'Student institutional email is required.' };
  }
  if (!password) {
    return { error: 'Password is required.' };
  }

  // 2. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'Please enter a valid institutional email address (e.g. yourname@itdept.edu).' };
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

  const existingId = MockAdapter.getProfiles().find(
    (p) => p.id_number && p.id_number.trim().toLowerCase() === idNumber.toLowerCase()
  );
  if (existingId) {
    return { error: 'A student account with this Student ID Number is already registered.' };
  }

  const id = crypto.randomUUID();

  // Role is strictly hardcoded to STUDENT; password is one-way hashed with scrypt
  const newProfile = MockAdapter.createUser(
    {
      id,
      email,
      full_name: fullName,
      role_id: 'STUDENT',
      department,
      id_number: idNumber,
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
