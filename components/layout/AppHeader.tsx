'use client';

import Link from 'next/link';
import { Profile } from '@/lib/types/database';
import { DemoUserSwitcher } from '@/components/auth/DemoUserSwitcher';
import { Bell, ShieldCheck, QrCode } from 'lucide-react';

interface AppHeaderProps {
  user: Profile;
  unreadCount?: number;
}

export function AppHeader({ user, unreadCount = 0 }: AppHeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-900">IT Department</span>
          <span>/</span>
          <span>College of Information & Computing Sciences</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
          <ShieldCheck className="h-3 w-3" />
          <span>AES-256 Encrypted & RLS Protected</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick QR scanner launcher */}
        <Link
          href="/scan"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          title="Scan survey QR Code"
        >
          <QrCode className="h-3.5 w-3.5 text-blue-600" />
          <span className="hidden sm:inline">Scan QR</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </Link>

        {/* Demo User Switcher */}
        <DemoUserSwitcher
          currentRole={user.role_id}
          currentEmail={user.email}
        />
      </div>
    </header>
  );
}

