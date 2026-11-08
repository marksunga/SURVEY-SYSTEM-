'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { studentRegisterAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  Check,
  Info,
} from 'lucide-react';

export default function StudentRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live password validation criteria
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const allCriteriaMet = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  async function handleSubmit(formData: FormData) {
    setError(null);

    // Client-side quick validations
    if (!email.toLowerCase().endsWith('@ua.edu.ph')) {
      setError('Registration requires an official University of the Assumption email ending with @ua.edu.ph (e.g. yourname@ua.edu.ph).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!hasUppercase) {
      setError('Password must contain at least one uppercase letter (A-Z).');
      return;
    }

    if (!hasLowercase) {
      setError('Password must contain at least one lowercase letter (a-z).');
      return;
    }

    if (!hasNumber) {
      setError('Password must contain at least one number (0-9).');
      return;
    }

    if (!hasSpecial) {
      setError('Password must contain at least one special character (e.g. !@#$%^&*).');
      return;
    }

    setLoading(true);
    const res = await studentRegisterAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#0F172A] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
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
          Create Student Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Register with your institutional credentials to participate in evaluations and surveys.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200/80 bg-white shadow-md shadow-slate-900/5 rounded-2xl">
          <CardHeader className="pb-3 pt-6 px-6 sm:px-8">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF2F8] border border-[#D1E3EC] text-[#185A9D] text-[11px] font-semibold">
                <BadgeCheck className="h-3.5 w-3.5 text-[#185A9D]" />
                <span>Role: Student (Auto-Assigned)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Student Registration</span>
            </div>
            <CardTitle className="text-lg font-bold text-[#0F172A] mt-3">Student Information</CardTitle>
            <CardDescription className="text-xs text-slate-500 leading-relaxed">
              Only student accounts can self-register. Administrator accounts are strictly provisioned.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-8 pb-6 sm:pb-8">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form action={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                  Student Full Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 text-xs h-10 border-slate-300 focus-visible:ring-[#4682A9]"
                    placeholder="e.g. Samantha Hayes"
                  />
                </div>
              </div>

              {/* Student Institutional Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Student Institutional Email (@ua.edu.ph) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs h-10 border-slate-300 focus-visible:ring-[#4682A9]"
                    placeholder="student@ua.edu.ph"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Must be a valid University of the Assumption student email ending with <strong className="text-slate-600">@ua.edu.ph</strong>
                </p>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </Label>
                  {password.length > 0 && allCriteriaMet && (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Requirements met
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 text-xs h-10 border-slate-300 focus-visible:ring-[#4682A9]"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Complexity Requirement Helper Text */}
                <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5 flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#4682A9] flex-shrink-0 mt-0.5" />
                  <span>
                    Must contain at least one number, one lowercase letter, one uppercase letter, one special character, and be at least 6 characters long.
                  </span>
                </p>

                {/* Real-time Interactive Password Criteria Checklist */}
                {password.length > 0 && (
                  <div className="pt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hasMinLength
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Check className={`h-3 w-3 ${hasMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                      6+ Characters
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hasUppercase
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Check className={`h-3 w-3 ${hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Uppercase (A-Z)
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hasLowercase
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Check className={`h-3 w-3 ${hasLowercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Lowercase (a-z)
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hasNumber
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Check className={`h-3 w-3 ${hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Number (0-9)
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hasSpecial
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Check className={`h-3 w-3 ${hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                      Special (!@#...)
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                  Confirm Password <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 pr-10 text-xs h-10 border-slate-300 focus-visible:ring-[#4682A9]"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#185A9D] hover:bg-[#124578] text-white font-bold text-xs sm:text-sm h-11 min-h-[44px] rounded-xl cursor-pointer shadow-md shadow-blue-900/10 transition-all flex items-center justify-center gap-2 mt-4 active:scale-98"
              >
                {loading ? (
                  <span>Creating Student Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Back to Student Login */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                href="/student/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#185A9D] hover:underline min-h-[44px] py-2 px-3 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Student Login</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
