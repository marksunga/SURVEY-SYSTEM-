import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${user.id},and(user_id.is.null,or(target_role.is.null,target_role.eq.${user.role_id}))`)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json({ notifications: data });
        }
      }
    } catch (err) {
      console.error('Supabase notifications GET error:', err);
    }
  }

  const notifications = MockAdapter.getNotifications(user.id, user.role_id);
  return NextResponse.json({ notifications });
}
