'use client';

import { useState } from 'react';
import Link from 'next/link';
import { studentLoginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  GraduationCap,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await studentLoginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Portal Login
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to complete course evaluations, report lab issues, and view surveys.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold w-fit mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Student Authentication</span>
            </div>
            <CardTitle className="text-lg text-slate-900">Sign In to Student Dashboard</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your student institutional credentials to access your portal.
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
                <Label htmlFor="student-email" className="text-xs font-semibold text-slate-700">
                  Student Institutional Email
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="student-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                    placeholder="student@itdept.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="student-password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="student-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
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
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-11 min-h-[44px] cursor-pointer shadow-sm transition-all"
              >
                {loading ? 'Signing in...' : 'Sign In to Student Portal'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            {/* Registration Callout Section with Divider */}
            <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-1.5 text-center">
              <span className="text-xs text-slate-500">Don&apos;t have a student account?</span>
              <Button asChild variant="outline" className="w-full border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 text-xs font-bold min-h-[44px] cursor-pointer shadow-xs">
                <Link href="/student/register" className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Create Student Account</span>
                </Link>
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">IT Department Administrator? </span>
              <Link
                href="/admin/login"
                className="text-xs font-semibold text-slate-800 hover:text-blue-600 hover:underline inline-flex items-center min-h-[44px] py-2 px-1"
              >
                Department Administrator Access →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
