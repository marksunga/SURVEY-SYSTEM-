'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Profile } from '@/lib/types/database';
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  MessageSquarePlus,
  QrCode,
  Bell,
  User,
  PlusCircle,
  BarChart3,
  Send,
  History,
  ShieldAlert,
  LogOut,
  Monitor,
  ChevronDown,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { isStudentNavItemActive, isAdminNavItemActive } from '@/lib/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: number | null;
}

interface AppSidebarProps {
  user: Profile;
  unreadNotificationsCount?: number;
}

export function AppSidebar({ user, unreadNotificationsCount = 0 }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role_id === 'ADMINISTRATOR';

  // Optimistic navigation state for immediate, single-click visual feedback
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const activePath = optimisticPath || pathname;

  const isSurveyRoute =
    activePath.startsWith('/admin/surveys') ||
    activePath.startsWith('/admin/feedback') ||
    activePath.startsWith('/admin/reports') ||
    activePath.startsWith('/admin/qr-codes');

  const isNotificationsRoute = activePath.startsWith('/admin/notifications');

  const [surveyDropdownOpen, setSurveyDropdownOpen] = useState(true);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(true);

  useEffect(() => {
    if (isSurveyRoute) {
      setSurveyDropdownOpen(true);
    }
  }, [activePath, isSurveyRoute]);

  useEffect(() => {
    if (isNotificationsRoute) {
      setNotificationsDropdownOpen(true);
    }
  }, [activePath, isNotificationsRoute]);

  // Student navigation matching the reference
  const studentNavItems: NavItem[] = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/surveys', label: 'Available Surveys', icon: ClipboardList },
    { href: '/surveys/history', label: 'My Submissions', icon: CheckCircle2 },
    { href: '/feedback', label: 'Student Feedback', icon: MessageSquarePlus },
    { href: '/scan', label: 'Scan Survey QR', icon: QrCode },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
  ];

  const surveyManagementSubItems = [
    {
      href: '/admin/surveys/create',
      label: 'Create Survey',
      icon: PlusCircle,
    },
    {
      href: '/admin/feedback',
      label: 'Feedback Management',
      icon: MessageSquarePlus,
    },
    {
      href: '/admin/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      href: '/admin/qr-codes',
      label: 'QR Code Management',
      icon: QrCode,
    },
  ];

  const notificationsSubItems = [
    {
      href: '/admin/notifications/send',
      label: 'Send Notifications',
      icon: Send,
    },
    {
      href: '/admin/notifications/history',
      label: 'Notification History',
      icon: History,
    },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#08213B] text-white flex-col h-screen sticky top-0 z-30 select-none shadow-xl border-r border-[#0A2644]">
      {/* Brand Header */}
      <div className="h-16 border-b border-white/10 flex items-center px-4 gap-3 bg-[#08213B]">
        <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-[#38BDF8] shadow-xs flex-shrink-0 border border-white/10">
          <Monitor className="h-5 w-5" />
        </div>
        <div className="leading-tight overflow-hidden">
          <div className="text-sm font-bold text-white tracking-tight truncate">IT Department Portal</div>
          <div className="text-[11px] font-medium text-slate-300 truncate">
            {isAdmin ? 'Administrator Portal' : 'Student Portal'}
          </div>
        </div>
      </div>

      {/* User Profile Snippet */}
      {isAdmin ? (
        <Link
          href="/admin/profile"
          onClick={() => setOptimisticPath('/admin/profile')}
          className={`p-3.5 border-b border-white/10 transition-colors flex items-center gap-3 cursor-pointer group ${
            isAdminNavItemActive('/admin/profile', activePath)
              ? 'bg-white/10 border-l-2 border-[#38BDF8]'
              : 'hover:bg-white/5'
          }`}
          title="View Administrator Profile"
        >
          <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 bg-[#185A9D] text-white border border-white/20 group-hover:scale-105 transition-transform">
            {user.full_name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate group-hover:text-[#38BDF8] transition-colors">
              {user.full_name}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide bg-blue-500/20 text-[#38BDF8] border border-blue-400/30">
              {user.role_id}
            </span>
          </div>
        </Link>
      ) : (
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3 select-none">
          <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 bg-[#185A9D] text-white border border-white/20">
            {user.full_name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {user.full_name}
            </p>
            <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wide bg-blue-500/20 text-[#38BDF8] border border-blue-400/30">
              {user.role_id}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'ADMINISTRATOR NAVIGATION' : 'STUDENT NAVIGATION'}
          </div>

          <nav className="space-y-1">
            {isAdmin ? (
              <>
                {/* 1. Dashboard */}
                <Link
                  href="/admin/dashboard"
                  onClick={() => setOptimisticPath('/admin/dashboard')}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isAdminNavItemActive('/admin/dashboard', activePath)
                      ? 'bg-white text-[#0A2540] shadow-sm font-bold'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard
                      className={`h-4 w-4 ${
                        isAdminNavItemActive('/admin/dashboard', activePath) ? 'text-[#0A2540]' : 'text-slate-400'
                      }`}
                    />
                    <span>Dashboard</span>
                  </div>
                </Link>

                {/* 2. Survey Management (Dropdown) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSurveyDropdownOpen(!surveyDropdownOpen)}
                    aria-expanded={surveyDropdownOpen}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                      isSurveyRoute
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ClipboardList
                        className={`h-4 w-4 ${
                          isSurveyRoute ? 'text-[#38BDF8]' : 'text-slate-400'
                        }`}
                      />
                      <span>Survey Management</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        surveyDropdownOpen ? 'rotate-180 text-[#38BDF8]' : ''
                      }`}
                    />
                  </button>

                  {surveyDropdownOpen && (
                    <div className="mt-1 ml-4 pl-2 border-l border-white/15 space-y-1">
                      {surveyManagementSubItems.map((item) => {
                        const Icon = item.icon;
                        const active = isAdminNavItemActive(item.href, activePath);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOptimisticPath(item.href)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              active
                                ? 'bg-[#EAF3FA] text-[#0A2540] font-bold shadow-xs'
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#0A2540]' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Notifications (Dropdown) */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                    aria-expanded={notificationsDropdownOpen}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                      isNotificationsRoute
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell
                        className={`h-4 w-4 ${
                          isNotificationsRoute ? 'text-[#38BDF8]' : 'text-slate-400'
                        }`}
                      />
                      <span>Notifications</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        notificationsDropdownOpen ? 'rotate-180 text-[#38BDF8]' : ''
                      }`}
                    />
                  </button>

                  {notificationsDropdownOpen && (
                    <div className="mt-1 ml-4 pl-2 border-l border-white/15 space-y-1">
                      {notificationsSubItems.map((item) => {
                        const Icon = item.icon;
                        const active = isAdminNavItemActive(item.href, activePath);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOptimisticPath(item.href)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              active
                                ? 'bg-[#EAF3FA] text-[#0A2540] font-bold shadow-xs'
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#0A2540]' : 'text-slate-400'}`} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Student Accounts Management */}
                <Link
                  href="/admin/users"
                  onClick={() => setOptimisticPath('/admin/users')}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isAdminNavItemActive('/admin/users', activePath)
                      ? 'bg-[#EAF3FA] text-[#0A2540] shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User
                      className={`h-4 w-4 ${
                        isAdminNavItemActive('/admin/users', activePath) ? 'text-[#0A2540]' : 'text-slate-400'
                      }`}
                    />
                    <span>Account Management</span>
                  </div>
                </Link>

                {/* 5. Audit & Compliance Logs */}
                <Link
                  href="/admin/audit-logs"
                  onClick={() => setOptimisticPath('/admin/audit-logs')}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isAdminNavItemActive('/admin/audit-logs', activePath)
                      ? 'bg-[#EAF3FA] text-[#0A2540] shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert
                      className={`h-4 w-4 ${
                        isAdminNavItemActive('/admin/audit-logs', activePath) ? 'text-[#0A2540]' : 'text-slate-400'
                      }`}
                    />
                    <span>Audit & Login Logs</span>
                  </div>
                </Link>
              </>
            ) : (
              /* Student Navigation Links */
              studentNavItems.map((item) => {
                const Icon = item.icon;
                const active = isStudentNavItemActive(item.href, activePath);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOptimisticPath(item.href)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-white text-[#0A2540] shadow-sm font-bold'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          active ? 'text-[#0A2540]' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })
            )}
          </nav>
        </div>
      </div>

      {/* Decorative Wave at the Bottom of Sidebar matching reference image */}
      <div className="relative w-full overflow-hidden leading-none pointer-events-none mt-auto">
        <svg
          className="w-full h-16"
          viewBox="0 0 256 64"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C60,45 180,10 256,40 L256,64 L0,64 Z"
            fill="#0F3B69"
            opacity="0.7"
          />
          <path
            d="M0,32 C80,12 160,52 256,30 L256,64 L0,64 Z"
            fill="#1E65A6"
            opacity="0.8"
          />
          <path
            d="M0,44 C90,24 180,56 256,46 L256,64 L0,64 Z"
            fill="#2196F3"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Bottom Sign Out Action */}
      <div className="p-3 border-t border-white/10 bg-[#061C33]/90 relative z-10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-white" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
