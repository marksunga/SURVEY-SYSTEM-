'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { NotificationType, SystemNotification, UserRole } from '@/lib/types/database';

export async function markNotificationReadAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.error('Supabase markNotificationRead error:', err);
    }
  }

  MockAdapter.markNotificationAsRead(id);
  revalidatePath('/notifications');
  revalidatePath('/admin/notifications');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
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

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('notifications').insert({
          id: notif.id,
          user_id: null,
          target_role: data.targetRole === 'ALL' ? null : data.targetRole,
          title: data.title,
          message: data.message,
          link: data.link || null,
          type: data.type,
          is_read: false,
        });
      } catch (err) {
        console.error('Supabase broadcast notification insert error:', err);
      }
    }

    MockAdapter.logAudit(admin.email, 'NOTIFICATION_SENT', 'NOTIFICATION', notif.id, {
      target: data.targetRole,
      title: data.title,
    });

    revalidatePath('/notifications');
    revalidatePath('/admin/notifications');
    revalidatePath('/admin/notifications/history');
    revalidatePath('/admin/notifications/send');
    revalidatePath('/admin/dashboard');
    revalidatePath('/student/dashboard');
    revalidatePath('/dashboard');
    return { success: true, notification: notif };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch notification' };
  }
}

export async function deleteNotificationAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('notifications').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase delete notification error:', err);
    }
  }

  const success = MockAdapter.deleteNotification(id);
  if (!success && !isLiveSupabaseConfigured()) {
    return { error: 'Notification not found.' };
  }

  revalidatePath('/notifications');
  revalidatePath('/admin/notifications');
  revalidatePath('/admin/notifications/history');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated.' };

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user.id},and(user_id.is.null,or(target_role.is.null,target_role.eq.${user.role_id}))`);
    } catch (err) {
      console.error('Supabase markAllRead error:', err);
    }
  }

  const userNotifs = MockAdapter.getNotifications(user.id, user.role_id);
  for (const n of userNotifs) {
    MockAdapter.markNotificationAsRead(n.id);
  }

  revalidatePath('/notifications');
  revalidatePath('/admin/notifications');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function sendSurveyRemindersAction(surveyId: string) {
  const admin = await requireRole(['ADMINISTRATOR']);

  let survey = MockAdapter.getSurveyById(surveyId);
  if (!survey && isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: dbSurvey } = await supabase.from('surveys').select('*').eq('id', surveyId).single();
      if (dbSurvey) {
        MockAdapter.upsertSurveyFromDb(dbSurvey);
        survey = MockAdapter.getSurveyById(surveyId);
      }
    } catch (dbErr) {
      console.warn('Failed to fetch survey from Supabase during reminder dispatch:', dbErr);
    }
  }

  if (!survey) return { error: 'Survey not found.' };

  const notifsCreated: SystemNotification[] = [];
  const targetRoles = (survey.target_roles && survey.target_roles.length > 0)
    ? survey.target_roles
    : (['STUDENT'] as UserRole[]);

  for (const role of targetRoles) {
    const notif = MockAdapter.createNotification({
      target_role: role,
      title: 'Survey Deadline Approaching',
      message: `Reminder: The survey "${survey.title}" will close on ${new Date(survey.end_date).toLocaleDateString()}. Please submit your evaluation if you haven't done so.`,
      link: `/surveys/${survey.id}`,
      type: 'DEADLINE_REMINDER',
    });

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('notifications').insert({
          id: notif.id,
          target_role: role,
          title: notif.title,
          message: notif.message,
          link: notif.link,
          type: notif.type,
          is_read: false,
        });
      } catch (err) {
        console.error('Supabase reminder insert error:', err);
      }
    }

    notifsCreated.push(notif);
  }

  MockAdapter.logAudit(admin.email, 'NOTIFICATION_SENT', 'SURVEY', survey.id, {
    action_type: 'SURVEY_REMINDER',
    roles: targetRoles,
    survey_title: survey.title,
  });

  revalidatePath('/notifications');
  revalidatePath('/admin/notifications');
  revalidatePath('/admin/notifications/history');
  revalidatePath('/admin/notifications/send');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
  return { success: true, count: notifsCreated.length };
}
