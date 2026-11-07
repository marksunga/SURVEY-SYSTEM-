'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  ShieldCheck,
  ShieldAlert,
  Lock,
} from 'lucide-react';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const initialPortal = searchParams.get('portal') === 'admin' ? 'admin' : 'student';

  const [activePortal, setActivePortal] = useState<'student' | 'admin'>(initialPortal);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set('portal', activePortal);
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
          'A secure recovery link has been dispatched to your institutional email. Please check your inbox within 20 minutes.'
      );
    }
  }

  const isStudent = activePortal === 'student';

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
          Institutional password recovery requires verified email ownership.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Recovery Portal Role Selector Tabs */}
          {!submitted && (
            <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActivePortal('student');
                  setError(null);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isStudent
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePortal('admin');
                  setError(null);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  !isStudent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Administrator</span>
              </button>
            </div>
          )}

          <CardHeader className="pb-3 pt-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit mb-1 border bg-slate-50 text-slate-700 border-slate-200">
              {isStudent ? (
                <>
                  <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                  <span>Student Account Recovery</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>Administrator Account Recovery</span>
                </>
              )}
            </div>
            <CardTitle className="text-base text-slate-900">
              {isStudent ? 'Reset Student Password' : 'Reset Administrator Password'}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {isStudent
                ? 'Enter your student institutional email to receive a secure, single-use recovery link.'
                : 'Enter your administrator institutional email to receive authorized recovery credentials.'}
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
                    For your security, accounts cannot be recovered without clicking the link delivered to{' '}
                    <strong>{submittedEmail}</strong>. The reset link is single-use and will expire in 20 minutes.
                  </p>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  {isStudent ? (
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs h-10 font-semibold">
                      <Link href="/student/login">Back to Student Login</Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs h-10 font-semibold">
                      <Link href="/admin/login">Back to Administrator Login</Link>
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSubmitted(false);
                      setError(null);
                    }}
                    className="text-xs text-slate-500"
                  >
                    Resend or use another email
                  </Button>
                </div>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-4">
                <input type="hidden" name="portal" value={activePortal} />

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
                    {isStudent ? 'Student Institutional Email' : 'Administrator Institutional Email'}
                  </Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      id="recovery-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isStudent ? 'student@itdept.edu' : 'admin@itdept.edu'}
                      className="pl-9 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isStudent
                      ? 'Recovery is restricted to registered student accounts.'
                      : 'Recovery is restricted to provisioned administrator accounts.'}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white text-xs font-semibold h-10 shadow-xs cursor-pointer ${
                    isStudent ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  {loading ? 'Validating & Dispatching...' : 'Send Password Recovery Email'}
                </Button>

                <div className="flex items-center justify-between pt-3 text-xs border-t border-slate-100">
                  <Link
                    href={isStudent ? '/student/login' : '/admin/login'}
                    className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    {isStudent ? 'Back to Student Login' : 'Back to Admin Login'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal(isStudent ? 'admin' : 'student');
                      setError(null);
                    }}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Switch to {isStudent ? 'Admin' : 'Student'} Recovery
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-[11px] text-slate-400">
          IT Department Portal • Cryptographic One-Way Hashed Authentication
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
