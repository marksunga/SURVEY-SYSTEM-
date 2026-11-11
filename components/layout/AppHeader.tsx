'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Profile } from '@/lib/types/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Bell,
  CheckCircle2,
  QrCode,
  Menu,
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  CheckCircle,
  MessageSquarePlus,
  User,
  PlusCircle,
  BarChart3,
  Send,
  History,
  LogOut,
  ChevronDown,
  Monitor,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { isStudentNavItemActive, isAdminNavItemActive } from '@/lib/navigation';

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

  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const activePath = optimisticPath || pathname;
  const isAdmin = user.role_id === 'ADMINISTRATOR';

  return (
    <>
      <header className="h-16 flex-shrink-0 w-full border-b border-slate-200/80 bg-white sticky top-0 z-30 shadow-xs select-none">
        <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
          {/* Left: University Seal, Branding & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open mobile navigation menu"
              className="md:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* University Seal */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-105 flex-shrink-0">
                <Image
                  src="/images/ua-seal.png"
                  alt="University of the Assumption Seal"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs sm:text-sm font-black text-[#0A2540] tracking-wider uppercase leading-tight truncate">
                  <span className="hidden sm:inline">UNIVERSITY OF THE ASSUMPTION</span>
                  <span className="sm:hidden font-extrabold">UA IT PORTAL</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wide hidden sm:block mt-0.5 leading-none truncate">
                  IT Department Portal
                </span>
              </div>
            </Link>

            {/* Breadcrumb & Security Status Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-200 ml-1">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                IT Department / {isAdmin ? 'Administrator Portal' : 'Student Portal'}
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold whitespace-nowrap">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Swift IDAC Active</span>
              </div>
            </div>
          </div>

          {/* Right: Scan QR & Notifications */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Scan QR Action Button for both Admin and Student */}
            <Link
              href="/scan"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200 bg-white hover:bg-blue-50 text-[#185A9D] text-xs font-bold shadow-2xs transition-colors"
            >
              <QrCode className="h-4 w-4 text-[#185A9D]" />
              <span>Scan QR</span>
            </Link>

            {/* Notification Bell with Badge */}
            <Link
              href={isAdmin ? '/admin/notifications/history' : '/notifications'}
              className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Modal */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="sm:max-w-xs p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col bg-[#08213B] text-white border border-[#0A2644]">
          <DialogHeader className="p-4 bg-[#08213B] text-white flex flex-row items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-[#38BDF8]">
                <Monitor className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-white">IT Dept Portal</DialogTitle>
                <p className="text-[10px] text-slate-300">
                  {isAdmin ? 'Administrator Portal' : 'Student Portal'}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* User Profile in Drawer */}
          <div className="p-3.5 border-b border-white/10 flex items-center gap-3 select-none">
            <div className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 bg-[#185A9D] text-white border border-white/20">
              {user.full_name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
              <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded uppercase bg-blue-500/20 text-[#38BDF8] border border-blue-400/30">
                {user.role_id}
              </span>
            </div>
          </div>

          {/* Navigation Links in Mobile Drawer */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isAdmin ? (
              <div className="space-y-1">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#38BDF8]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/surveys"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <ClipboardList className="h-4 w-4 text-[#38BDF8]" />
                  <span>Department Survey Management</span>
                </Link>
                <Link
                  href="/admin/feedback"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <MessageSquarePlus className="h-4 w-4 text-[#38BDF8]" />
                  <span>Feedback</span>
                </Link>
                <Link
                  href="/admin/reports"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <BarChart3 className="h-4 w-4 text-[#38BDF8]" />
                  <span>Analytics</span>
                </Link>
                <Link
                  href="/admin/qr-codes"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <QrCode className="h-4 w-4 text-[#38BDF8]" />
                  <span>QR Codes</span>
                </Link>
                <Link
                  href="/admin/notifications/history"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <Bell className="h-4 w-4 text-[#38BDF8]" />
                  <span>Notifications</span>
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <User className="h-4 w-4 text-[#38BDF8]" />
                  <span>Account Management</span>
                </Link>
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <ShieldAlert className="h-4 w-4 text-[#38BDF8]" />
                  <span>Audit Logs</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#38BDF8]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/surveys"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <ClipboardList className="h-4 w-4 text-[#38BDF8]" />
                  <span>Available Surveys</span>
                </Link>
                <Link
                  href="/surveys/history"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <CheckCircle className="h-4 w-4 text-[#38BDF8]" />
                  <span>My Submissions</span>
                </Link>
                <Link
                  href="/feedback"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <MessageSquarePlus className="h-4 w-4 text-[#38BDF8]" />
                  <span>Student Feedback</span>
                </Link>
                <Link
                  href="/scan"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <QrCode className="h-4 w-4 text-[#38BDF8]" />
                  <span>Scan Survey QR</span>
                </Link>
                <Link
                  href="/notifications"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  <Bell className="h-4 w-4 text-[#38BDF8]" />
                  <span>Notifications</span>
                </Link>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 cursor-pointer"
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
