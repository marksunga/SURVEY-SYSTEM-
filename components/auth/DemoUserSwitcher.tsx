'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/types/database';
import { switchDemoUserAction } from '@/app/actions/auth';
import { Users, ChevronDown, Check } from 'lucide-react';

interface DemoUserSwitcherProps {
  currentRole: UserRole;
  currentEmail: string;
}

const DEMO_ROLES: { role: UserRole; label: string; email: string; color: string }[] = [
  { role: 'STUDENT', label: 'Student', email: 'student@itdept.edu', color: 'bg-emerald-500' },
  { role: 'IT_PROFESSOR', label: 'IT Professor', email: 'professor@itdept.edu', color: 'bg-indigo-500' },
  { role: 'IT_OFFICER', label: 'IT Officer', email: 'officer@itdept.edu', color: 'bg-sky-500' },
  { role: 'ADMINISTRATOR', label: 'Administrator', email: 'admin@itdept.edu', color: 'bg-rose-500' },
];

export function DemoUserSwitcher({ currentRole, currentEmail }: DemoUserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSwitch(role: UserRole) {
    try {
      setLoading(true);
      await switchDemoUserAction(role);
      setIsOpen(false);
      router.refresh();
      if (role === 'ADMINISTRATOR') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const current = DEMO_ROLES.find((r) => r.role === currentRole) || DEMO_ROLES[0];

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        title="Switch demo user role"
      >
        <span className={`h-2 w-2 rounded-full ${current.color}`} />
        <span className="font-semibold">{current.label}</span>
        <span className="text-slate-400">({currentEmail})</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg z-50">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Role Switcher
            </div>
            {DEMO_ROLES.map((item) => (
              <button
                key={item.role}
                onClick={() => handleSwitch(item.role)}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-md transition-colors ${
                  currentRole === item.role
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <div className="text-left">
                    <div>{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.email}</div>
                  </div>
                </div>
                {currentRole === item.role && <Check className="h-3.5 w-3.5 text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

