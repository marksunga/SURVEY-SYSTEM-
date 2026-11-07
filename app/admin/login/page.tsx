'use client';

import { useState } from 'react';
import Link from 'next/link';
import { adminLoginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await adminLoginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">IT Dept Portal</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Administrator Authentication
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Authorized IT Department personnel and system administrators only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur">
          <CardHeader className="pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-[11px] font-semibold w-fit mb-1">
              <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
              <span>Strict Role-Restricted Portal</span>
            </div>
            <CardTitle className="text-lg text-white">Sign In to Admin Dashboard</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Only provisioned administrator credentials will be granted access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs text-slate-200 font-medium">
                  Administrator Email
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-10"
                    placeholder="admin@itdept.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password" className="text-xs text-slate-200 font-medium">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-10"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-11 min-h-[44px] cursor-pointer shadow-md transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-400">
                Are you a student looking to submit surveys or feedback?
              </p>
              <Link
                href="/student/login"
                className="inline-flex items-center justify-center text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline min-h-[44px] px-2"
              >
                Access Student Portal →
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          All administrator sign-in attempts are cryptographically timestamped and recorded in the audit log.
        </p>
      </div>
    </div>
  );
}

