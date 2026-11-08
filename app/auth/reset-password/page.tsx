'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { verifyResetTokenAction, resetPasswordWithTokenAction } from '@/app/actions/auth';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const defaultInvalidMessage =
    'Your password reset link is invalid or has expired. Please request a new recovery link.';

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenValid(false);
        setTokenError(defaultInvalidMessage);
        setVerifying(false);
        return;
      }

      const res = await verifyResetTokenAction(token);
      if (res.valid) {
        setTokenValid(true);
        setEmail(res.email || null);
      } else {
        setTokenValid(false);
        setTokenError(res.error || defaultInvalidMessage);
      }
      setVerifying(false);
    }

    checkToken();
  }, [token]);

  // Real-time password requirement checks
  const criteria = useMemo(() => {
    return {
      hasLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
      matches: newPassword.length > 0 && newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  // Calculate password strength score (0 to 100)
  const strengthScore = useMemo(() => {
    let score = 0;
    if (criteria.hasLength) score += 20;
    if (criteria.hasUpper) score += 20;
    if (criteria.hasLower) score += 20;
    if (criteria.hasNumber) score += 20;
    if (criteria.hasSpecial) score += 20;
    return score;
  }, [criteria]);

  const strengthLabel = useMemo(() => {
    if (strengthScore <= 20) return { text: 'Very Weak', color: 'bg-rose-500', textColor: 'text-rose-600' };
    if (strengthScore <= 40) return { text: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' };
    if (strengthScore <= 60) return { text: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600' };
    if (strengthScore <= 80) return { text: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' };
  }, [strengthScore]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please verify your confirmation input.');
      return;
    }

    if (strengthScore < 100) {
      setSubmitError('Please satisfy all password complexity requirements before continuing.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    const res = await resetPasswordWithTokenAction(formData);
    setSubmitting(false);

    if (res?.error) {
      setSubmitError(res.error);
    } else if (res?.success) {
      setSuccess(true);
      setSuccessMessage(
        res.message ||
          'Your password has been changed successfully. You may now log in with your new credentials.'
      );
    }
  }

  return (
    <Card className="border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF2F8] border border-[#D1E3EC] text-[#2C5E7D] text-[11px] font-semibold w-fit mb-1">
          <ShieldCheck className="h-3.5 w-3.5 text-[#4682A9]" />
          <span>Student Security & Recovery</span>
        </div>
        <CardTitle className="text-lg text-slate-900">
          Reset Student Password
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          {email ? `Verified Student Account: ${email}` : 'Enter your new student password below.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {verifying ? (
          <div className="text-center py-10 space-y-2 text-xs text-slate-400">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Verifying recovery token authenticity...</p>
          </div>
        ) : !tokenValid ? (
          <div className="text-center py-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900">Recovery Link Invalid or Expired</h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                {tokenError || defaultInvalidMessage}
              </p>
            </div>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
              <Link href="/auth/forgot-password">
                Request New Recovery Link
              </Link>
            </Button>
            <div className="pt-2 text-center text-xs text-slate-500">
              <Link href="/student/login" className="hover:text-slate-800 font-medium">
                Back to Student Login
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="text-center py-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Password Reset Successful</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {successMessage}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Single-Use Token Consumed</span>
              </div>
              <p>Your recovery link has been revoked and all existing sessions terminated.</p>
            </div>
            <div className="pt-2">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs h-11 min-h-[44px] font-semibold cursor-pointer shadow-xs">
                <Link href="/student/login">Sign In to Student Portal</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{submitError}</span>
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs font-semibold text-slate-700">
                New Student Password
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="pl-9 pr-10 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs font-semibold text-slate-700">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="pl-9 pr-10 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Password Strength:</span>
                <span className={`font-bold text-[11px] ${strengthLabel.textColor}`}>
                  {strengthLabel.text}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strengthLabel.color}`}
                  style={{ width: `${strengthScore}%` }}
                />
              </div>
            </div>

            {/* Password Requirements Checklist */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
              <p className="font-semibold text-slate-700 text-[11px]">Password Requirements:</p>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-1.5">
                  {criteria.hasLength ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={criteria.hasLength ? 'text-slate-900 font-medium' : ''}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  {criteria.hasUpper ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={criteria.hasUpper ? 'text-slate-900 font-medium' : ''}>
                    At least one uppercase letter (A-Z)
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  {criteria.hasLower ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={criteria.hasLower ? 'text-slate-900 font-medium' : ''}>
                    At least one lowercase letter (a-z)
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  {criteria.hasNumber ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={criteria.hasNumber ? 'text-slate-900 font-medium' : ''}>
                    At least one number (0-9)
                  </span>
                </li>
                <li className="flex items-center gap-1.5">
                  {criteria.hasSpecial ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className={criteria.hasSpecial ? 'text-slate-900 font-medium' : ''}>
                    At least one special character (!@#$%^&*)
                  </span>
                </li>
                {confirmPassword.length > 0 && (
                  <li className="flex items-center gap-1.5">
                    {criteria.matches ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                    )}
                    <span className={criteria.matches ? 'text-emerald-700 font-medium' : 'text-rose-600'}>
                      {criteria.matches ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <Button
              type="submit"
              disabled={submitting || strengthScore < 100 || !criteria.matches}
              className="w-full bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold h-11 min-h-[44px] shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Updating Credentials...' : 'Submit New Password'}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/student/login"
                className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-[#4682A9] min-h-[44px] px-2"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to Student Login
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
          <div className="relative w-12 h-12 drop-shadow-sm transition-transform group-hover:scale-105">
            <Image src="/images/ua-seal.png" alt="University of the Assumption Seal" width={48} height={48} className="object-contain" priority />
          </div>
          <div className="text-left">
            <span className="text-base font-extrabold text-[#103058] tracking-tight block leading-tight">UNIVERSITY OF THE ASSUMPTION</span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">IT Department Portal</span>
          </div>
        </Link>
        <h1 className="text-2xl font-extrabold text-[#103058] tracking-tight">
          Reset Your Password
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Establish new security credentials for your verified student account.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Loading recovery interface...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
