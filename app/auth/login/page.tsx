import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { UALoginPortal } from '@/components/auth/UALoginPortal';

export default async function AuthLoginPage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role_id === 'ADMINISTRATOR') {
      redirect('/admin/dashboard');
    } else {
      redirect('/student/dashboard');
    }
  }

  return <UALoginPortal initialRole="STUDENT" />;
}
