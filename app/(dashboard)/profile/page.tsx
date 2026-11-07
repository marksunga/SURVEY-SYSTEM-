import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { ProfileClient } from '@/components/auth/ProfileClient';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/student/login');
  }

  // Strict route separation: Admin redirected to dedicated Admin Profile
  if (user.role_id === 'ADMINISTRATOR') {
    redirect('/admin/profile');
  }

  return <ProfileClient user={user} />;
}
