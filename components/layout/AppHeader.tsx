'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Profile } from '@/lib/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Bell,
  ShieldCheck,
  QrCode,
  Menu,
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  MessageSquarePlus,
  User,
  Users,
  PlusCircle,
  BarChart3,
  Database,
  LogOut,
  Settings,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: number | null;
}

interface AppHeaderProps {
  user: Profile;
  unreadCount?: number;
}

export function AppHeader({ user, unreadCount = 0 }: AppHeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const isAdmin = user.role_id === 'ADMINISTRATOR';

  const studentNavItems: NavItem[] = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/surveys', label: 'Available Surveys', icon: ClipboardList },
    { href: '/surveys/history', label: 'My Submissions', icon: CheckCircle2 },
    { href: '/feedback', label: 'Submit Feedback', icon: MessageSquarePlus },
    { href: '/scan', label: 'Scan Survey QR', icon: QrCode },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { href: '/profile', label: 'My Profile', icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Manage Students', icon: Users },
    { href: '/admin/surveys', label: 'Manage Surveys', icon: ClipboardList },
    { href: '/admin/surveys/create', label: 'Create Survey', icon: PlusCircle },
    { href: '/admin/feedback', label: 'Moderate Feedback', icon: MessageSquarePlus },
    { href: '/admin/qr-codes', label: 'QR Code Hub', icon: QrCode },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { href: '/admin/notifications', label: 'Broadcasts & Reminders', icon: Bell },
    { href: '/admin/profile', label: 'My Profile', icon: User },
    { href: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const currentNavItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Navigation Trigger */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">IT Department</span>
            <span className="hidden sm:inline">/</span>
            <span className="hidden sm:inline">
              {isAdmin ? 'Administrator Portal' : 'Student Portal'}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            <span>Strict RBAC Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick QR scanner launcher for students */}
          {!isAdmin && (
            <Link
              href="/scan"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-[#F3F5F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4682A9] cursor-pointer min-h-[36px]"
              title="Scan survey QR Code"
            >
              <QrCode className="h-3.5 w-3.5 text-[#4682A9]" />
              <span className="hidden sm:inline">Scan QR</span>
            </Link>
          )}

          {/* Notifications Icon with accessible label */}
          <Link
            href={isAdmin ? '/admin/notifications' : '/notifications'}
            className="relative p-2 rounded-md text-slate-500 hover:bg-[#F3F5F7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4682A9] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Notifications, ${unreadCount} unread`}
            title={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </Link>

          {/* Authenticated User Badge (Clickable to My Profile) & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Link
              href={isAdmin ? '/admin/profile' : '/profile'}
              className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
              title="View My Profile"
            >
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-bold text-[#0F172A] truncate max-w-[140px] group-hover:text-[#4682A9] transition-colors">
                  {user.full_name}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isAdmin
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-[#EAF2F8] text-[#2C5E7D] border border-[#D1E3EC]'
                  }`}
                >
                  {user.role_id}
                </span>
              </div>

              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 group-hover:scale-105 transition-transform ${
                  isAdmin
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#4682A9] text-white'
                }`}
              >
                {user.full_name.slice(0, 2)}
              </div>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign Out"
                title="Sign Out of Session"
                className="p-2 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Modal */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="sm:max-w-xs p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="p-4 bg-white text-[#0F172A] flex flex-row items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#4682A9] flex items-center justify-center text-white">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-[#0F172A]">IT Dept Portal</DialogTitle>
                <p className="text-[10px] text-slate-500">
                  {isAdmin ? 'Administrator Portal' : 'Student Portal'}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* User profile banner in drawer (Clickable) */}
          <Link
            href={isAdmin ? '/admin/profile' : '/profile'}
            onClick={() => setMobileNavOpen(false)}
            className="p-3 border-b border-slate-200/80 bg-[#F3F5F7]/80 hover:bg-[#EAF2F8]/70 flex items-center gap-3 transition-colors cursor-pointer"
            title="View My Profile"
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${
                isAdmin
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#EAF2F8] text-[#2C5E7D] border border-[#D1E3EC]'
              }`}
            >
              {user.full_name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#0F172A] truncate">{user.full_name}</p>
              <span
                className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded uppercase ${
                  isAdmin
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#EAF2F8] text-[#2C5E7D] border border-[#D1E3EC]'
                }`}
              >
                {user.role_id}
              </span>
            </div>
          </Link>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            <div>
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isAdmin ? 'Administrator Navigation' : 'Student Navigation'}
              </div>
              <nav className="space-y-1">
                {currentNavItems.map((item) => {
                  const active = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/student/dashboard' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#EAF2F8] text-[#2C5E7D] font-semibold border-l-2 border-[#4682A9]'
                          : 'text-slate-600 hover:bg-[#F3F5F7] hover:text-[#0F172A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${active ? 'text-[#4682A9]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Drawer Sign Out Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer min-h-[44px]"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
