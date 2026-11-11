'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { UserRole } from '@/lib/types/database';

/**
 * Role modifications are strictly prohibited.
 * Accounts are bound permanently to their provisioned role (ADMINISTRATOR or STUDENT).
 */
export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  return {
    error: 'Role modification is strictly prohibited. Account roles are permanently fixed upon provisioning.',
  };
}

export async function toggleUserActiveAction(userId: string) {
  const admin = await requireRole(['ADMINISTRATOR']);

  if (admin.id === userId) {
    return { error: 'You cannot deactivate your own active administrator account.' };
  }

  const updated = MockAdapter.toggleUserActive(userId);
  if (!updated) {
    return { error: 'User not found.' };
  }

  MockAdapter.logAudit(admin.email, 'USER_STATUS_TOGGLED', 'USER', userId, {
    is_active: updated.is_active,
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/dashboard');
  return { success: true, is_active: updated.is_active };
}

export async function createAdminUserAction(data: {
  email: string;
  fullName: string;
  category?: 'ADMINISTRATOR' | 'STUDENT';
  roleId?: UserRole;
  department?: string;
  idNumber: string;
}) {
  const admin = await requireRole(['ADMINISTRATOR']);

  // Server-side strict role determination based on account category
  const targetCategory = data.category || (data.roleId === 'ADMINISTRATOR' ? 'ADMINISTRATOR' : 'STUDENT');
  const assignedRole: UserRole = targetCategory === 'ADMINISTRATOR' ? 'ADMINISTRATOR' : 'STUDENT';

  const cleanEmail = data.email.trim().toLowerCase();
  const cleanId = data.idNumber.trim();
  const cleanFullName = data.fullName.trim();

  if (!cleanEmail || !cleanId || !cleanFullName) {
    return { error: 'All required fields (Full Name, Email, and ID Number) must be provided.' };
  }

  const existingEmail = MockAdapter.getProfileByEmail(cleanEmail);
  if (existingEmail) {
    return { error: 'An account with this institutional email already exists.' };
  }

  const existingId = MockAdapter.getProfiles().find(
    (p) => p.id_number && p.id_number.toLowerCase() === cleanId.toLowerCase()
  );
  if (existingId) {
    return { error: 'An account with this ID Number already exists.' };
  }

  const id = crypto.randomUUID();
  const created = MockAdapter.createUser({
    id,
    email: cleanEmail,
    full_name: cleanFullName,
    role_id: assignedRole,
    department: data.department?.trim() || (assignedRole === 'ADMINISTRATOR' ? 'IT Administration' : 'Information Technology'),
    id_number: cleanId,
    is_active: true,
  });

  MockAdapter.logAudit(admin.email, 'USER_CREATED_BY_ADMIN', 'USER', id, {
    role: assignedRole,
    category: targetCategory,
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin/dashboard');
  return { success: true, user: created };
}

export async function deleteUserAction(userId: string) {
  const admin = await requireRole(['ADMINISTRATOR']);

  if (admin.id === userId) {
    return { error: 'You cannot delete your own administrator account.' };
  }

  const success = MockAdapter.deleteUser(userId);
  if (!success) {
    return { error: 'User not found.' };
  }

  MockAdapter.logAudit(admin.email, 'USER_DELETED', 'USER', userId);

  revalidatePath('/admin/users');
  revalidatePath('/admin/dashboard');
  return { success: true };
}
