import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  let unreadCount = 0;
  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      if (user.role_id === 'ADMINISTRATOR') {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
        unreadCount = (!error && count !== null) ? count : 0;
      } else {
        const [notifsRes, receiptsRes] = await Promise.all([
          supabase
            .from('notifications')
            .select('id, link, is_read')
            .eq('is_read', false)
            .or(`user_id.eq.${user.id},and(user_id.is.null,or(target_role.is.null,target_role.eq.${user.role_id}))`),
          supabase
            .from('survey_participation_receipts')
            .select('survey_id')
            .eq('user_id', user.id),
        ]);

        if (!notifsRes.error && notifsRes.data) {
          const completedIds = (receiptsRes.data || []).map((r: any) => r.survey_id);
          const activeUnread = notifsRes.data.filter((n: any) => {
            if (n.link && completedIds.length > 0) {
              const match = n.link.match(/\/surveys\/([a-zA-Z0-9_-]+)/);
              if (match && completedIds.includes(match[1])) {
                return false;
              }
            }
            return true;
          });
          unreadCount = activeUnread.length;
        } else {
          const notifications = MockAdapter.getNotifications(user.id, user.role_id);
          unreadCount = notifications.filter((n) => !n.is_read).length;
        }
      }
    } catch {
      const notifications = MockAdapter.getNotifications(user.id, user.role_id);
      unreadCount = notifications.filter((n) => !n.is_read).length;
    }
  } else {
    const notifications = MockAdapter.getNotifications(user.id, user.role_id);
    unreadCount = notifications.filter((n) => !n.is_read).length;
  }

  return (
    <div className="flex min-h-screen bg-[#F4F8FC] text-slate-800 antialiased">
      <AppSidebar user={user} unreadNotificationsCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader user={user} unreadCount={unreadCount} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
