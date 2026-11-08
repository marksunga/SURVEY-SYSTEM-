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
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},and(user_id.is.null,or(target_role.is.null,target_role.eq.${user.role_id}))`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ notifications: data });
      }
    } catch (err) {
      console.error('Supabase notifications GET error:', err);
    }
  }

  const notifications = MockAdapter.getNotifications(user.id, user.role_id);
  return NextResponse.json({ notifications });
}
