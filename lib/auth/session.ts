import { cookies } from 'next/headers';
import { Profile, UserRole } from '@/lib/types/database';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

const SESSION_COOKIE_NAME = 'it_dept_session_user';

export async function getCurrentUser(): Promise<Profile | null> {
  const cookieStore = cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!userId) {
    return null;
  }

  // 1. Live Supabase profile check (persists across all serverless lambda containers)
  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: dbProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && dbProfile) {
        if (!dbProfile.is_active) return null;
        // Sync profile into in-memory MockAdapter if missing in this process
        if (!MockAdapter.getProfileById(dbProfile.id)) {
          MockAdapter.createUser(dbProfile as Profile, 'SupabaseUser123!');
        }
        return dbProfile as Profile;
      }
    } catch (err) {
      console.warn('Supabase session user lookup error:', err);
    }
  }

  // 2. Local mock adapter fallback
  const profile = MockAdapter.getProfileById(userId);
  if (!profile || !profile.is_active) {
    return null;
  }
  return profile;
}

export async function setSessionUser(userId: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days persistent session
  });
}

export async function clearSessionUser() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireRole(allowedRoles: UserRole[]): Promise<Profile> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized - Please log in');
  }
  if (!allowedRoles.includes(user.role_id)) {
    throw new Error(`Forbidden - Access requires role [${allowedRoles.join(', ')}]`);
  }
  return user;
}
