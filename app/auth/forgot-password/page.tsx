'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [devResetLink, setDevResetLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await forgotPasswordAction(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSubmitted(true);
      setMessage(res.message || 'Password reset instructions dispatched.');
      if (res.devResetLink) {
        setDevResetLink(res.devResetLink);
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Recovery</h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered institutional email to receive a secure password recovery link.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {submitted ? (
              <div className="text-center space-y-4 py-2">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">Check Your Inbox</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">{message}</p>
                </div>

                {devResetLink && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-left space-y-2 mt-4 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      <span>Development Recovery Direct Link</span>
                    </div>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      Outbound SMTP is not configured in this local environment. You can use the generated recovery link directly below:
                    </p>
                    <a
                      href={devResetLink}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 break-all underline text-xs pt-1"
                    >
                      <span>Open Reset Password Interface</span>
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    </a>
                  </div>
                )}

                <div className="pt-4 flex flex-col gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs h-9">
                    <Link href="/student/login">Back to Student Login</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="text-xs h-9 text-slate-600">
                    <Link href="/admin/login">Back to Administrator Login</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                    Institutional Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. student@itdept.edu or admin@itdept.edu"
                      className="pl-9 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A time-limited recovery link will be dispatched to this address.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-10 shadow-xs"
                >
                  {loading ? 'Dispatching Recovery Link...' : 'Send Recovery Link'}
                </Button>

                <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                  <Link
                    href="/student/login"
                    className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Student Login
                  </Link>
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Admin Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
