'use client';

import { useState } from 'react';
import Link from 'next/link';
import { adminLoginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-[#F3F5F7] text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-11 w-11 rounded-xl bg-[#4682A9] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-[#0F172A] tracking-tight">IT Dept Portal</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Administrator Authentication
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Authorized IT Department personnel and system administrators only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 bg-white shadow-sm rounded-xl">
          <CardHeader className="pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF2F8] border border-[#D1E3EC] text-[#2C5E7D] text-[11px] font-semibold w-fit mb-1">
              <ShieldAlert className="h-3.5 w-3.5 text-[#4682A9]" />
              <span>Strict Role-Restricted Portal</span>
            </div>
            <CardTitle className="text-lg text-[#0F172A]">Sign In to Admin Dashboard</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Only provisioned administrator credentials will be granted access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="text-xs text-slate-700 font-semibold">
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
                    className="pl-9 text-xs bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-[#4682A9] h-10"
                    placeholder="admin@itdept.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="text-xs text-slate-700 font-semibold">
                  Administrator Password
                </Label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="admin-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 text-xs bg-white border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus-visible:ring-[#4682A9] h-10"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold h-11 min-h-[44px] cursor-pointer shadow-xs transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center space-y-2">
              <p className="text-xs text-slate-500">
                Are you a student looking to submit surveys or feedback?
              </p>
              <Link
                href="/student/login"
                className="inline-flex items-center justify-center text-xs font-semibold text-[#4682A9] hover:text-[#386B8C] hover:underline min-h-[44px] px-2"
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

