import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export interface DispatchNotificationPayload {
  title: string;
  message: string;
  targetRole?: 'ADMINISTRATOR' | 'STUDENT' | null;
  userId?: string | null;
  link?: string | null;
}

export class NotificationService {
  static async dispatch(payload: DispatchNotificationPayload): Promise<void> {
    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('notifications').insert({
          title: payload.title,
          message: payload.message,
          target_role: payload.targetRole || null,
          user_id: payload.userId || null,
          link: payload.link || null,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('NotificationService error:', err);
      }
    }
  }

  static getNotifications(userId: string, roleId?: 'ADMINISTRATOR' | 'STUDENT') {
    return MockAdapter.getNotifications(userId, roleId);
  }
}
