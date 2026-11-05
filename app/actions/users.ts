'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { UserRole } from '@/lib/types/database';

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  const admin = await requireRole(['ADMINISTRATOR']);

  const updated = MockAdapter.updateUserRole(userId, newRole);
  if (!updated) {
    return { error: 'User not found.' };
  }

  MockAdapter.logAudit(admin.email, 'USER_ROLE_CHANGED', 'USER', userId, {
    new_role: newRole,
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function toggleUserActiveAction(userId: string) {
  const admin = await requireRole(['ADMINISTRATOR']);

  const updated = MockAdapter.toggleUserActive(userId);
  if (!updated) {
    return { error: 'User not found.' };
  }

  MockAdapter.logAudit(admin.email, 'USER_STATUS_TOGGLED', 'USER', userId, {
    is_active: updated.is_active,
  });

  revalidatePath('/admin/users');
  return { success: true, is_active: updated.is_active };
}

export async function createAdminUserAction(data: {
  email: string;
  fullName: string;
  roleId: UserRole;
  department: string;
  idNumber: string;
}) {
  const admin = await requireRole(['ADMINISTRATOR']);

  const existing = MockAdapter.getProfileByEmail(data.email);
  if (existing) {
    return { error: 'A user with this email already exists.' };
  }

  const id = crypto.randomUUID();
  const created = MockAdapter.createUser({
    id,
    email: data.email,
    full_name: data.fullName,
    role_id: data.roleId,
    department: data.department || 'Information Technology',
    id_number: data.idNumber,
    is_active: true,
  });

  MockAdapter.logAudit(admin.email, 'USER_CREATED_BY_ADMIN', 'USER', id, {
    role: data.roleId,
  });

  revalidatePath('/admin/users');
  return { success: true, user: created };
}

