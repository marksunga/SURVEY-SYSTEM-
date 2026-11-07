'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { setSessionUser, clearSessionUser, getCurrentUser } from '@/lib/auth/session';

export async function adminLoginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Both email and password are required.' };
  }

  const profile = MockAdapter.getProfileByEmail(email);
  if (!profile) {
    return { error: 'Administrator account not found. Please verify your institutional email.' };
  }

  if (!profile.is_active) {
    return { error: 'This administrator account is deactivated. Contact Department Administration.' };
  }

  // Strict role enforcement: Only Administrator accounts can log in here
  if (profile.role_id !== 'ADMINISTRATOR') {
    return {
      error: 'Access denied. Only Administrator accounts can log in here. Students must log in at /student/login.',
    };
  }

  await setSessionUser(profile.id);

  MockAdapter.logAudit(profile.email, 'ADMIN_LOGIN', 'USER', profile.id, {
    method: 'PASSWORD',
    portal: 'ADMIN_PORTAL',
  });

  revalidatePath('/');
  redirect('/admin/dashboard');
}

export async function studentLoginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Both email and password are required.' };
  }

  const profile = MockAdapter.getProfileByEmail(email);
  if (!profile) {
    return { error: 'Student account not found. Please register or verify your email.' };
  }

  if (!profile.is_active) {
    return { error: 'This student account has been deactivated by the IT Administrator.' };
  }

  // Strict role enforcement: Only Student accounts can log in here
  if (profile.role_id !== 'STUDENT') {
    return {
      error: 'Access denied. Administrator accounts must log in through the Administrator portal at /admin/login.',
    };
  }

  await setSessionUser(profile.id);

  MockAdapter.logAudit(profile.email, 'STUDENT_LOGIN', 'USER', profile.id, {
    method: 'PASSWORD',
    portal: 'STUDENT_PORTAL',
  });

  revalidatePath('/');
  redirect('/student/dashboard');
}

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

  // 3. Password requirements validation
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
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
  // Role is strictly hardcoded to STUDENT; students cannot assign admin privileges
  const newProfile = MockAdapter.createUser({
    id,
    email,
    full_name: fullName,
    role_id: 'STUDENT',
    department,
    id_number: idNumber,
    is_active: true,
  });

  await setSessionUser(newProfile.id);

  MockAdapter.logAudit(newProfile.email, 'STUDENT_REGISTERED', 'USER', newProfile.id, {
    role: 'STUDENT',
    id_number: idNumber,
  });

  revalidatePath('/');
  redirect('/student/dashboard');
}

export async function loginAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const profile = MockAdapter.getProfileByEmail(email);
  if (!profile) {
    return { error: 'Account not found. Please verify your credentials or register.' };
  }

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

  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters long.' };
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    return { error: 'New passwords do not match.' };
  }

  MockAdapter.logAudit(user.email, 'PASSWORD_UPDATED', 'USER', user.id);
  revalidatePath('/profile');
  return { success: true, message: 'Password updated successfully!' };
}

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required.' };

  const profile = MockAdapter.getProfileByEmail(email);
  if (profile) {
    MockAdapter.logAudit(profile.email, 'PASSWORD_RESET_REQUESTED', 'USER', profile.id);
  }

  return { success: true, message: 'Password reset link has been dispatched to your email address.' };
}
