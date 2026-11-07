import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role_id !== 'ADMINISTRATOR' && user.role_id !== 'IT_OFFICER') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}

