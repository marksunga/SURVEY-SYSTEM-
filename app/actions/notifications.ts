'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { NotificationType, SystemNotification, UserRole } from '@/lib/types/database';

export async function markNotificationReadAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  MockAdapter.markNotificationAsRead(id);
  revalidatePath('/notifications');
  return { success: true };
}

export async function createBroadcastNotificationAction(data: {
  title: string;
  message: string;
  targetRole: UserRole | 'ALL';
  type: NotificationType;
  link?: string;
}): Promise<{ success: boolean; notification?: SystemNotification; error?: string }> {
  try {
    const admin = await requireRole(['ADMINISTRATOR']);

    const notif = MockAdapter.createNotification({
      user_id: null,
      target_role: data.targetRole === 'ALL' ? null : (data.targetRole as UserRole),
      title: data.title,
      message: data.message,
      link: data.link || null,
      type: data.type,
    });

    MockAdapter.logAudit(admin.email, 'NOTIFICATION_BROADCAST', 'NOTIFICATION', notif.id, {
      target: data.targetRole,
      title: data.title,
    });

    revalidatePath('/notifications');
    revalidatePath('/admin/notifications');
    return { success: true, notification: notif };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch notification' };
  }
}
