import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function DashboardRedirect() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role_id === 'ADMINISTRATOR') {
    redirect('/admin/dashboard');
  } else {
    redirect('/student/dashboard');
  }
}
