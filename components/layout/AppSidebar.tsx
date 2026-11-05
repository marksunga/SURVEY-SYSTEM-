'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Profile, UserRole } from '@/lib/types/database';
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  MessageSquarePlus,
  QrCode,
  Bell,
  User,
  ShieldAlert,
  Users,
  PlusCircle,
  BarChart3,
  FileText,
  Database,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface AppSidebarProps {
  user: Profile;
  unreadNotificationsCount?: number;
}

export function AppSidebar({ user, unreadNotificationsCount = 0 }: AppSidebarProps) {
  const pathname = usePathname();

  const isStaff = user.role_id === 'ADMINISTRATOR' || user.role_id === 'IT_OFFICER';
  const isAdmin = user.role_id === 'ADMINISTRATOR';

  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/surveys', label: 'Available Surveys', icon: ClipboardList },
    { href: '/surveys/history', label: 'My Submissions', icon: CheckCircle2 },
    { href: '/feedback', label: 'Submit Feedback', icon: MessageSquarePlus },
    { href: '/scan', label: 'Scan Survey QR', icon: QrCode },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
    { href: '/profile', label: 'My Profile', icon: User },
  ];

  const adminNavItems = [
    { href: '/admin', label: 'Admin Overview', icon: LayoutDashboard },
    { href: '/admin/surveys', label: 'Manage Surveys', icon: ClipboardList },
    { href: '/admin/surveys/create', label: 'Create Survey', icon: PlusCircle },
    { href: '/admin/feedback', label: 'Feedback Records', icon: MessageSquarePlus },
    { href: '/admin/qr-codes', label: 'QR Code Hub', icon: QrCode },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ...(isAdmin
      ? [
          { href: '/admin/users', label: 'User RBAC', icon: Users },
          { href: '/admin/notifications', label: 'Broadcasts', icon: Bell },
          { href: '/admin/audit-logs', label: 'Security Audit', icon: ShieldAlert },
          { href: '/admin/backups', label: 'Database Backups', icon: Database },
        ]
      : []),
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 flex items-center px-4 gap-3 bg-slate-900 text-white">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight overflow-hidden">
          <div className="text-sm font-bold truncate">IT Dept Portal</div>
          <div className="text-[11px] text-slate-300 truncate">Feedback & Surveys</div>
        </div>
      </div>

      {/* Profile snippet */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
          {user.full_name.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800 truncate">{user.full_name}</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-medium rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
            {user.role_id.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Navigation Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* User portal section */}
        <div>
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isStaff ? 'Participant View' : 'Navigation'}
          </div>
          <nav className="space-y-1">
            {userNavItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Administration Section */}
        {isStaff && (
          <div>
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Department Administration
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

