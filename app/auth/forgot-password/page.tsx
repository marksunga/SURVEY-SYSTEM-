'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  GraduationCap,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const enteredEmail = (formData.get('email') as string)?.trim();
    const res = await forgotPasswordAction(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      setSubmitted(true);
      setSubmittedEmail(enteredEmail);
      setMessage(
        res.message ||
          'A secure recovery link has been dispatched to your student email. Please check your inbox within 20 minutes.'
      );
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Account Recovery
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered student email to receive a secure password recovery link.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="pb-3 pt-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit mb-1 border bg-blue-50 text-blue-700 border-blue-200">
              <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
              <span>Student Self-Service Recovery</span>
            </div>
            <CardTitle className="text-base text-slate-900">
              Reset Student Password
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Password recovery is verified through your registered institutional student email address.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-2 space-y-4">
            {submitted ? (
              <div className="text-center space-y-4 py-2">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">Recovery Email Dispatched</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">{message}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 mt-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Lock className="h-4 w-4 text-blue-600" />
                    <span>Email Verification Enforced</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    For your security, accounts cannot be recovered without opening the link delivered to{' '}
                    <strong>{submittedEmail}</strong>. The reset link is single-use and will expire in 20 minutes.
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs h-11 min-h-[44px] font-semibold cursor-pointer shadow-xs">
                    <Link href="/student/login">Back to Student Login</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSubmitted(false);
                      setError(null);
                    }}
                    className="text-xs text-slate-500 min-h-[44px] cursor-pointer"
                  >
                    Resend or enter another email
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
                    <div className="space-y-1">
                      <p className="font-semibold">Unable to dispatch recovery link</p>
                      <p className="text-[11px] leading-relaxed text-rose-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="recovery-email" className="text-xs font-semibold text-slate-700">
                    Student Institutional Email
                  </Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3.5 text-slate-400" />
                    <Input
                      id="recovery-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@itdept.edu"
                      className="pl-9 text-xs h-11 border-slate-300 focus-visible:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Self-service recovery is exclusively available for enrolled student accounts.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-11 min-h-[44px] shadow-xs cursor-pointer"
                >
                  {loading ? 'Validating & Dispatching...' : 'Send Password Recovery Email'}
                </Button>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <Link
                    href="/student/login"
                    className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800 font-medium min-h-[44px] px-2"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back to Student Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          IT Department Portal • Student Password Recovery
        </p>
      </div>
    </div>
  );
}
