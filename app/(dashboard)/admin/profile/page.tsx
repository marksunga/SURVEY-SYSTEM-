import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { ProfileClient } from '@/components/auth/ProfileClient';
import { ShieldCheck, ShieldAlert, KeyRound, Server } from 'lucide-react';

export default async function AdminProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Strict RBAC: Only administrators allowed
  if (user.role_id !== 'ADMINISTRATOR') {
    redirect('/profile');
  }

  return (
    <div className="space-y-6">
      {/* Administrator Access Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Administrator Profile & Security Management</h2>
            <p className="text-xs text-slate-300">
              Authorized credentials for Department Administration, System Auditing, and Survey Management.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            Full Privileges
          </span>
        </div>
      </div>

      {/* Main Profile Client Interface */}
      <ProfileClient user={user} />
    </div>
  );
}

