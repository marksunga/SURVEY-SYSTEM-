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
    <div className="relative flex min-h-screen bg-[#F0F6FB] text-slate-800 antialiased overflow-x-hidden">
      {/* Soft Ambient Organic Curved Background Accents matching reference image */}
      <div className="fixed inset-y-0 right-0 w-[420px] pointer-events-none z-0 overflow-hidden hidden xl:block opacity-60">
        <svg
          className="absolute right-0 top-0 h-full w-[420px]"
          viewBox="0 0 420 1080"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M200,0 C280,320 140,680 340,1080 L420,1080 L420,0 Z"
            fill="#E1EEF8"
            opacity="0.45"
          />
          <path
            d="M280,0 C360,380 220,720 380,1080 L420,1080 L420,0 Z"
            fill="#D5E8F6"
            opacity="0.5"
          />
        </svg>
      </div>

      <AppSidebar user={user} unreadNotificationsCount={unreadCount} />
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <AppHeader user={user} unreadCount={unreadCount} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
