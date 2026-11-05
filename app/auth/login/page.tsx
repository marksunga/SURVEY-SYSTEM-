'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction, switchDemoUserAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/lib/types/database';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const demoParam = searchParams.get('demo');

  const [email, setEmail] = useState('student@itdept.edu');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (demoParam) {
      if (demoParam === 'admin') setEmail('admin@itdept.edu');
      else if (demoParam === 'officer') setEmail('officer@itdept.edu');
      else if (demoParam === 'professor') setEmail('professor@itdept.edu');
      else setEmail('student@itdept.edu');
    }
  }, [demoParam]);

  async function handleDemoSwitch(role: UserRole) {
    setLoading(true);
    await switchDemoUserAction(role);
    if (role === 'ADMINISTRATOR') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await loginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your institutional credentials or select a demo role below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Institutional Email</Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs"
                    placeholder="student@itdept.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-10"
              >
                Sign In to Department System
              </Button>
            </form>

            {/* Quick Demo Switcher Container */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                Or Quick 1-Click Demo Login
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('STUDENT')}
                  className="p-2 border rounded-lg hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-emerald-700 text-xs">Student</div>
                  <div className="text-[10px] text-slate-400">student@itdept.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('IT_PROFESSOR')}
                  className="p-2 border rounded-lg hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-indigo-700 text-xs">IT Professor</div>
                  <div className="text-[10px] text-slate-400">professor@itdept.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('IT_OFFICER')}
                  className="p-2 border rounded-lg hover:bg-sky-50 hover:border-sky-300 text-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-sky-700 text-xs">IT Officer</div>
                  <div className="text-[10px] text-slate-400">officer@itdept.edu</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('ADMINISTRATOR')}
                  className="p-2 border rounded-lg hover:bg-rose-50 hover:border-rose-300 text-slate-700 transition-colors text-left"
                >
                  <div className="font-bold text-rose-700 text-xs">Administrator</div>
                  <div className="text-[10px] text-slate-400">admin@itdept.edu</div>
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 pt-2">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="font-semibold text-blue-600 hover:underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

