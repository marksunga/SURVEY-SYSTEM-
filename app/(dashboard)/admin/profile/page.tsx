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
      {/* Administrator Access Notice Banner - School Institutional Identity */}
      <div className="p-5 rounded-xl border border-slate-200 bg-white text-[#0F172A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-[#4682A9] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Administrator Profile & Security Management</h2>
            <p className="text-xs text-slate-500">
              Authorized credentials for Department Administration, System Auditing, and Survey Management.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF2F8] text-[#2C5E7D] border border-[#D1E3EC]">
            Full Privileges
          </span>
        </div>
      </div>

      {/* Main Profile Client Interface */}
      <ProfileClient user={user} />
    </div>
  );
}

