'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  IdCard,
  ArrowLeft,
} from 'lucide-react';

export default function StudentRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);

    // Client-side quick validations
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Student Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Register with your institutional credentials to participate in evaluations and surveys.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                <BadgeCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Role: Student (Auto-Assigned)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Student Registration</span>
            </div>
            <CardTitle className="text-lg text-slate-900 mt-2">Student Information</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Only student accounts can self-register. Administrator accounts are strictly provisioned.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    className="pl-9 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                    placeholder="e.g. Samantha Hayes"
                  />
                </div>
              </div>

              {/* Student ID Number */}
              <div className="space-y-1">
                <Label htmlFor="idNumber" className="text-xs font-semibold text-slate-700">
                  Student ID Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <IdCard className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    id="idNumber"
                    name="idNumber"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="pl-9 text-xs h-10 border-slate-300 font-mono focus-visible:ring-blue-500"
                    placeholder="e.g. STU-2026-001"
                  />
                </div>
              </div>

              {/* Student Institutional Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Student Institutional Email <span className="text-rose-500">*</span>
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
                    className="pl-9 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                    placeholder="student@itdept.edu"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Must be a valid institutional student email.</p>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password (minimum 6 characters) <span className="text-rose-500">*</span>
                </Label>
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
                    className="pl-9 pr-10 text-xs h-10 border-slate-300 focus-visible:ring-blue-500"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-11 min-h-[44px] cursor-pointer shadow-sm transition-all mt-2"
              >
                {loading ? 'Creating Student Account...' : 'Create Account'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            {/* Back to Student Login */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                href="/student/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:underline min-h-[44px] py-2 px-1"
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
