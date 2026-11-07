import { getCurrentUser } from '@/lib/auth/session';
import { ProfileClient } from '@/components/auth/ProfileClient';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return <ProfileClient user={user} />;
}
