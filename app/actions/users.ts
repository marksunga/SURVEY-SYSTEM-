'use server';

import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
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

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: profile, error: fetchErr } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', userId)
        .single();

      if (fetchErr || !profile) {
        return { error: 'User not found in database.' };
      }

      const newIsActive = !profile.is_active;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          is_active: newIsActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateErr) {
        return { error: updateErr.message || 'Failed to update user status.' };
      }

      await supabase.from('audit_logs').insert({
        actor_id: admin.id,
        actor_email: admin.email,
        action: 'USER_STATUS_TOGGLED',
        entity_type: 'USER',
        entity_id: userId,
        details: { is_active: newIsActive },
      });

      // Keep MockAdapter in sync
      MockAdapter.toggleUserActive(userId);

      revalidatePath('/admin/users');
      revalidatePath('/admin/dashboard');
      return { success: true, is_active: newIsActive };
    } catch (err: any) {
      console.error('Error toggling user status in Supabase:', err);
      return { error: err.message || 'Failed to update user status.' };
    }
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
  const cleanDept =
    data.department?.trim() ||
    (assignedRole === 'ADMINISTRATOR' ? 'IT Administration' : 'Information Technology');

  if (!cleanEmail || !cleanId || !cleanFullName) {
    return { error: 'All required fields (Full Name, Email, and ID Number) must be provided.' };
  }

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      // Check existing email in profiles
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        return { error: 'An account with this institutional email already exists.' };
      }

      // Check existing ID number in profiles
      const { data: existingId } = await supabase
        .from('profiles')
        .select('id')
        .ilike('id_number', cleanId)
        .maybeSingle();

      if (existingId) {
        return { error: 'An account with this ID Number already exists.' };
      }

      // Create user in Supabase Auth
      const defaultPassword = assignedRole === 'ADMINISTRATOR' ? 'Admin123!' : 'Student123!';
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: cleanFullName,
          role_id: assignedRole,
        },
      });

      let userId = authData?.user?.id;
      if (authErr || !userId) {
        // If auth user already exists in auth.users, retrieve the existing id
        const { data: listData } = await supabase.auth.admin.listUsers();
        const found = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (found) {
          userId = found.id;
        } else {
          return { error: authErr?.message || 'Failed to create user credentials.' };
        }
      }

      const newProfile: any = {
        id: userId,
        email: cleanEmail,
        full_name: cleanFullName,
        role_id: assignedRole,
        department: cleanDept,
        id_number: cleanId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: insertErr } = await supabase.from('profiles').upsert(newProfile);
      if (insertErr) {
        return { error: insertErr.message || 'Failed to create user profile in database.' };
      }

      await supabase.from('audit_logs').insert({
        actor_id: admin.id,
        actor_email: admin.email,
        action: 'USER_CREATED_BY_ADMIN',
        entity_type: 'USER',
        entity_id: userId,
        details: { role: assignedRole, category: targetCategory },
      });

      // Keep MockAdapter in sync
      MockAdapter.createUser(newProfile);

      revalidatePath('/admin/users');
      revalidatePath('/admin/dashboard');
      return { success: true, user: newProfile };
    } catch (err: any) {
      console.error('Error creating user in Supabase:', err);
      return { error: err.message || 'Failed to create user.' };
    }
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
    department: cleanDept,
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

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      const { error: profileErr } = await supabase.from('profiles').delete().eq('id', userId);
      if (profileErr) {
        return { error: profileErr.message || 'Failed to delete user profile.' };
      }

      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (authErr) {
        console.warn('Could not delete auth user (may not exist in auth.users):', authErr);
      }

      await supabase.from('audit_logs').insert({
        actor_id: admin.id,
        actor_email: admin.email,
        action: 'USER_DELETED',
        entity_type: 'USER',
        entity_id: userId,
      });

      // Keep MockAdapter in sync
      MockAdapter.deleteUser(userId);

      revalidatePath('/admin/users');
      revalidatePath('/admin/dashboard');
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting user in Supabase:', err);
      return { error: err.message || 'Failed to delete user.' };
    }
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
