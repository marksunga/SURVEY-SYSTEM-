import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { UALoginPortal } from '@/components/auth/UALoginPortal';

export default async function HomePage() {
  const user = await getCurrentUser();

  // If already authenticated, redirect straight to user's dashboard
  if (user) {
    if (user.role_id === 'ADMINISTRATOR') {
      redirect('/admin/dashboard');
    } else {
      redirect('/student/dashboard');
    }
  }

  return <UALoginPortal initialRole="STUDENT" />;
}
