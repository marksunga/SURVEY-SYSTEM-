'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { setSessionUser, clearSessionUser, getCurrentUser } from '@/lib/auth/session';
import { UserRole } from '@/lib/types/database';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email) {
    return { error: 'Email is required.' };
  }

  const profile = MockAdapter.getProfileByEmail(email);
  if (!profile) {
    return { error: 'User not found. Check demo accounts or register.' };
  }

  if (!profile.is_active) {
    return { error: 'This account has been deactivated by the IT Administrator.' };
  }

  // Set session user
  await setSessionUser(profile.id);

  // Log audit
  MockAdapter.logAudit(profile.email, 'USER_LOGIN', 'USER', profile.id, {
    method: 'PASSWORD',
  });

  revalidatePath('/');
  
  if (profile.role_id === 'ADMINISTRATOR') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const fullName = formData.get('fullName') as string;
  const roleId = (formData.get('roleId') as UserRole) || 'STUDENT';
  const department = (formData.get('department') as string) || 'Information Technology';
  const idNumber = formData.get('idNumber') as string;

  if (!email || !fullName) {
    return { error: 'Name and Email are required.' };
  }

  const existing = MockAdapter.getProfileByEmail(email);
  if (existing) {
    return { error: 'An account with this email already exists.' };
  }

  const id = crypto.randomUUID();
  const newProfile = MockAdapter.createUser({
    id,
    email,
    full_name: fullName,
    role_id: roleId,
    department,
    id_number: idNumber || `ID-${Math.floor(Math.random() * 90000 + 10000)}`,
    is_active: true,
  });

  await setSessionUser(newProfile.id);

  MockAdapter.logAudit(newProfile.email, 'USER_REGISTERED', 'USER', newProfile.id, {
    role: roleId,
  });

  revalidatePath('/');
  redirect('/dashboard');
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) {
    MockAdapter.logAudit(user.email, 'USER_LOGOUT', 'USER', user.id);
  }
  await clearSessionUser();
  revalidatePath('/');
  redirect('/auth/login');
}

export async function switchDemoUserAction(role: UserRole) {
  const profiles = MockAdapter.getProfiles();
  const target = profiles.find((p) => p.role_id === role && p.is_active);
  if (target) {
    await setSessionUser(target.id);
    MockAdapter.logAudit(target.email, 'DEMO_USER_SWITCH', 'USER', target.id, {
      switched_to_role: role,
    });
    revalidatePath('/');
  }
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

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required.' };

  const profile = MockAdapter.getProfileByEmail(email);
  if (profile) {
    MockAdapter.logAudit(profile.email, 'PASSWORD_RESET_REQUESTED', 'USER', profile.id);
  }

  return { success: true, message: 'Password reset link has been dispatched to your email address.' };
}

