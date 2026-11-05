import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
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

  const notifications = MockAdapter.getNotifications(user.id, user.role_id);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar user={user} unreadNotificationsCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader user={user} unreadCount={unreadCount} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

