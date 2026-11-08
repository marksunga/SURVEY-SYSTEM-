import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      if (user.role_id === 'ADMINISTRATOR') {
        // Administrators see all dispatched notifications in Notification History
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json({ notifications: data });
        }
      } else {
        // Students: fetch user-targeted or STUDENT broadcast notifications
        const [notifsRes, receiptsRes] = await Promise.all([
          supabase
            .from('notifications')
            .select('*')
            .or(`user_id.eq.${user.id},and(user_id.is.null,or(target_role.is.null,target_role.eq.${user.role_id}))`)
            .order('created_at', { ascending: false }),
          supabase
            .from('survey_participation_receipts')
            .select('survey_id')
            .eq('user_id', user.id),
        ]);

        if (!notifsRes.error && notifsRes.data) {
          const completedIds = (receiptsRes.data || []).map((r: any) => r.survey_id);

          // Requirement 10: Once a survey is answered, remove it from the notification center
          const filtered = notifsRes.data.filter((n: any) => {
            if (n.link && completedIds.length > 0) {
              const match = n.link.match(/\/surveys\/([a-zA-Z0-9_-]+)/);
              if (match && completedIds.includes(match[1])) {
                return false;
              }
            }
            return true;
          });

          return NextResponse.json({ notifications: filtered });
        }
      }
    } catch (err) {
      console.error('Supabase notifications GET error:', err);
    }
  }

  const notifications = MockAdapter.getNotifications(user.id, user.role_id);
  return NextResponse.json({ notifications });
}
