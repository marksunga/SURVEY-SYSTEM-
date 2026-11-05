'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { SystemBackup } from '@/lib/types/database';

export async function createBackupAction(type: SystemBackup['backup_type']) {
  const admin = await requireRole(['ADMINISTRATOR']);

  const { backup, data } = MockAdapter.createBackup(type, admin.id);

  MockAdapter.logAudit(admin.email, 'BACKUP_CREATED', 'SYSTEM', backup.id, {
    filename: backup.filename,
    size_bytes: backup.size_bytes,
    type,
  });

  revalidatePath('/admin/backups');
  return { success: true, backup, data };
}

