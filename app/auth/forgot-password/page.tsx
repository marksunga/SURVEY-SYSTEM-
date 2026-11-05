'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    const res = await forgotPasswordAction(formData);
    if (res.success) {
      setSubmitted(true);
      setMessage(res.message || 'Password reset link sent.');
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
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your institutional email to receive a password recovery link.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-5">
            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Check Your Email</h3>
                  <p className="text-xs text-slate-500">{message}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href="/auth/login">Back to Sign In</Link>
                </Button>
              </div>
            ) : (
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
                      placeholder="student@itdept.edu"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-10"
                >
                  Send Recovery Link
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Return to Sign In
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

