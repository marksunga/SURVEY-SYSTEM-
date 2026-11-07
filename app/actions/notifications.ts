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

export async function deleteNotificationAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  const success = MockAdapter.deleteNotification(id);
  if (!success) {
    return { error: 'Notification not found.' };
  }

  revalidatePath('/notifications');
  revalidatePath('/admin/notifications');
  return { success: true };
}

export async function sendSurveyRemindersAction(surveyId: string) {
  const admin = await requireRole(['ADMINISTRATOR', 'IT_OFFICER']);
  const survey = MockAdapter.getSurveyById(surveyId);
  if (!survey) return { error: 'Survey not found.' };

  const notifsCreated: SystemNotification[] = [];
  for (const role of survey.target_roles) {
    const notif = MockAdapter.createNotification({
      target_role: role,
      title: 'Survey Deadline Approaching',
      message: `Reminder: The survey "${survey.title}" will close on ${new Date(survey.end_date).toLocaleDateString()}. Please submit your evaluation if you haven't done so.`,
      link: `/surveys/${survey.id}`,
      type: 'DEADLINE_REMINDER',
    });
    notifsCreated.push(notif);
  }

  MockAdapter.logAudit(admin.email, 'SURVEY_REMINDERS_SENT', 'SURVEY', survey.id, {
    roles: survey.target_roles,
    survey_title: survey.title,
  });

  revalidatePath('/notifications');
  revalidatePath('/admin/notifications');
  return { success: true, count: notifsCreated.length };
}
