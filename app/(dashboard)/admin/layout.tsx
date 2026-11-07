import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Strict role isolation: Only ADMINISTRATOR can access /admin/*
  if (user.role_id !== 'ADMINISTRATOR') {
    redirect('/student/dashboard');
  }

  return <>{children}</>;
}
