import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { UALoginPortal } from '@/components/auth/UALoginPortal';

export default async function AuthLoginPage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  const user = await getCurrentUser();

  if (user) {
    if (user.role_id === 'ADMINISTRATOR') {
      redirect('/admin/dashboard');
    } else {
      redirect('/student/dashboard');
    }
  }

  const roleParam = searchParams?.role?.toLowerCase().trim();
  const initialRole = roleParam === 'admin' || roleParam === 'administrator' ? 'ADMINISTRATOR' : 'STUDENT';

  return <UALoginPortal initialRole={initialRole} />;
}
