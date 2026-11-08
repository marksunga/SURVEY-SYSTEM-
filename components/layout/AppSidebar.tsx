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
  GraduationCap,
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

  // Synchronize optimistic state whenever pathname updates
  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const activePath = optimisticPath || pathname;

  // Determine if active route is under Survey Management dropdown
  const isSurveyRoute =
    activePath.startsWith('/admin/surveys') ||
    activePath.startsWith('/admin/feedback') ||
    activePath.startsWith('/admin/reports') ||
    activePath.startsWith('/admin/qr-codes');

  // Determine if active route is under Notifications dropdown
  const isNotificationsRoute = activePath.startsWith('/admin/notifications');

  // Maintain dropdowns open by default & auto-open when visiting sub-routes
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

  // Student navigation (Available surveys, history, feedback, QR scan, notifications)
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
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
    },
  ];

  // Specific Admin Survey Management Dropdown Items
  const surveyManagementSubItems = [
    {
      href: '/admin/surveys/create',
      label: 'Create Survey',
      sublabel: null,
      icon: PlusCircle,
    },
    {
      href: '/admin/feedback',
      label: 'Feedback Management',
      sublabel: 'Moderate Feedback',
      icon: MessageSquarePlus,
    },
    {
      href: '/admin/reports',
      label: 'Reports and Analytics',
      sublabel: null,
      icon: BarChart3,
    },
    {
      href: '/admin/qr-codes',
      label: 'QR Code Management',
      sublabel: null,
      icon: QrCode,
    },
  ];

  // Specific Admin Notifications Dropdown Items
  const notificationsSubItems = [
    {
      href: '/admin/notifications/send',
      label: 'Send Notifications',
      sublabel: null,
      icon: Send,
    },
    {
      href: '/admin/notifications/history',
      label: 'Notification History',
      sublabel: null,
      icon: History,
    },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col h-screen sticky top-0 z-30 select-none shadow-xs">
      {/* Brand Header - Academic School Identity */}
      <div className="h-16 border-b border-slate-200 flex items-center px-4 gap-3 bg-white text-[#0F172A]">
        <div className="h-9 w-9 rounded-lg bg-[#4682A9] flex items-center justify-center text-white shadow-xs flex-shrink-0">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="leading-tight overflow-hidden">
          <div className="text-sm font-bold text-[#0F172A] tracking-tight truncate">IT Dept Portal</div>
          <div className="text-[11px] font-medium text-slate-500 truncate">
            {isAdmin ? 'Administrator Portal' : 'Student Portal'}
          </div>
        </div>
      </div>

      {/* Profile snippet: Admin is clickable to /admin/profile; Student displays clean identity banner */}
      {isAdmin ? (
        <Link
          href="/admin/profile"
          onClick={() => setOptimisticPath('/admin/profile')}
          className={`p-3 border-b border-slate-200/70 transition-colors flex items-center gap-3 cursor-pointer group ${
            isAdminNavItemActive('/admin/profile', activePath)
              ? 'bg-[#EAF2F8] border-l-2 border-[#4682A9]'
              : 'bg-[#F3F5F7]/80 hover:bg-[#EAF2F8]/70'
          }`}
          title="View Administrator Profile"
        >
          <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 group-hover:scale-105 transition-transform bg-[#0F172A] text-white">
            {user.full_name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#0F172A] truncate group-hover:text-[#4682A9] transition-colors">
              {user.full_name}
            </p>
            <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded uppercase tracking-wide bg-[#0F172A] text-white">
              {user.role_id}
            </span>
          </div>
        </Link>
      ) : (
        <div className="p-3 border-b border-slate-200/70 bg-[#F3F5F7]/80 flex items-center gap-3 select-none">
          <div className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 bg-[#EAF2F8] text-[#2C5E7D] border border-[#D1E3EC]">
            {user.full_name.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#0F172A] truncate">
              {user.full_name}
            </p>
            <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded uppercase tracking-wide bg-[#EAF2F8] text-[#2C5E7D] border border-[#D1E3EC]">
              {user.role_id}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Administrator Navigation' : 'Student Navigation'}
          </div>

          <nav className="space-y-1">
            {isAdmin ? (
              <>
                {/* 1. Maintain Dashboard */}
                <Link
                  href="/admin/dashboard"
                  onClick={() => setOptimisticPath('/admin/dashboard')}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isAdminNavItemActive('/admin/dashboard', activePath)
                      ? 'bg-[#EAF2F8] text-[#2C5E7D] font-semibold border-l-2 border-[#4682A9]'
                      : 'text-slate-600 hover:bg-[#F3F5F7] hover:text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard
                      className={`h-4 w-4 ${
                        isAdminNavItemActive('/admin/dashboard', activePath) ? 'text-[#4682A9]' : 'text-slate-400'
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
                    aria-controls="admin-survey-management-menu"
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                      isSurveyRoute
                        ? 'bg-[#EAF2F8]/70 text-[#154675] font-semibold'
                        : 'text-slate-700 hover:bg-[#F3F5F7] hover:text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ClipboardList
                        className={`h-4 w-4 ${
                          isSurveyRoute ? 'text-[#4682A9]' : 'text-slate-500'
                        }`}
                      />
                      <span>Survey Management</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        surveyDropdownOpen ? 'rotate-180 text-[#4682A9]' : ''
                      }`}
                    />
                  </button>

                  {/* Collapsible Survey Sub-menu */}
                  {surveyDropdownOpen && (
                    <div
                      id="admin-survey-management-menu"
                      className="mt-1 ml-4 pl-2.5 border-l-2 border-slate-200 space-y-1 py-0.5 animate-in fade-in-50 duration-150"
                    >
                      {surveyManagementSubItems.map((subItem) => {
                        const active = isAdminNavItemActive(subItem.href, activePath);
                        const SubIcon = subItem.icon;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setOptimisticPath(subItem.href)}
                            className={`group flex items-start gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors min-h-[38px] ${
                              active
                                ? 'bg-[#EAF2F8] text-[#2C5E7D] font-semibold border-l-2 border-[#4682A9]'
                                : 'text-slate-600 hover:bg-[#F3F5F7] hover:text-[#0F172A]'
                            }`}
                          >
                            <SubIcon
                              className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                active
                                  ? 'text-[#4682A9]'
                                  : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="leading-tight truncate">{subItem.label}</div>
                              {subItem.sublabel && (
                                <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
                                  ({subItem.sublabel})
                                </div>
                              )}
                            </div>
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
                    aria-controls="admin-notifications-menu"
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                      isNotificationsRoute
                        ? 'bg-[#EAF2F8]/70 text-[#154675] font-semibold'
                        : 'text-slate-700 hover:bg-[#F3F5F7] hover:text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell
                        className={`h-4 w-4 ${
                          isNotificationsRoute ? 'text-[#4682A9]' : 'text-slate-500'
                        }`}
                      />
                      <span>Notifications</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        notificationsDropdownOpen ? 'rotate-180 text-[#4682A9]' : ''
                      }`}
                    />
                  </button>

                  {/* Collapsible Notifications Sub-menu */}
                  {notificationsDropdownOpen && (
                    <div
                      id="admin-notifications-menu"
                      className="mt-1 ml-4 pl-2.5 border-l-2 border-slate-200 space-y-1 py-0.5 animate-in fade-in-50 duration-150"
                    >
                      {notificationsSubItems.map((subItem) => {
                        const active = isAdminNavItemActive(subItem.href, activePath);
                        const SubIcon = subItem.icon;

                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setOptimisticPath(subItem.href)}
                            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors min-h-[38px] ${
                              active
                                ? 'bg-[#EAF2F8] text-[#2C5E7D] font-semibold border-l-2 border-[#4682A9]'
                                : 'text-slate-600 hover:bg-[#F3F5F7] hover:text-[#0F172A]'
                            }`}
                          >
                            <SubIcon
                              className={`h-4 w-4 flex-shrink-0 ${
                                active
                                  ? 'text-[#4682A9]'
                                  : 'text-slate-400 group-hover:text-slate-600'
                              }`}
                            />
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Bring back Audit Logs */}
                <div className="pt-1">
                  <Link
                    href="/admin/audit-logs"
                    onClick={() => setOptimisticPath('/admin/audit-logs')}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isAdminNavItemActive('/admin/audit-logs', activePath)
                        ? 'bg-[#EAF2F8] text-[#2C5E7D] font-semibold border-l-2 border-[#4682A9]'
                        : 'text-slate-600 hover:bg-[#F3F5F7] hover:text-[#0F172A]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert
                        className={`h-4 w-4 ${
                          isAdminNavItemActive('/admin/audit-logs', activePath) ? 'text-[#4682A9]' : 'text-slate-400'
                        }`}
                      />
                      <span>Audit Logs</span>
                    </div>
                  </Link>
                </div>
              </>
            ) : (
              // Student Nav Items
              studentNavItems.map((item) => {
                const active = isStudentNavItemActive(item.href, activePath);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOptimisticPath(item.href)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
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
              })
            )}
          </nav>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200 bg-[#F3F5F7]/50">
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
    </aside>
  );
}
