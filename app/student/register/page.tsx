'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { studentRegisterAction } from '@/app/actions/auth';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  ShieldCheck,
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

  // Live password validation criteria (minimum 6 characters)
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    const formData = new FormData(e.currentTarget);
    const res = await studentRegisterAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top University Branding Header */}
      <div className="w-full max-w-[500px] text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group transition-opacity hover:opacity-90">
          <div className="relative w-10 h-10 drop-shadow-sm flex-shrink-0">
            <Image
              src="/images/ua-seal.png"
              alt="University of the Assumption Seal"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="text-left">
            <span className="text-xs sm:text-sm font-black text-[#0F2C59] tracking-wider block uppercase leading-none">
              UNIVERSITY OF THE ASSUMPTION
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-widest block mt-1.5 leading-none">
              IT DEPARTMENT PORTAL
            </span>
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2C59] tracking-tight">
          Create Student Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Register with your institutional credentials to participate in evaluations and surveys.
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="mt-6 sm:mt-7 w-full max-w-[500px]">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-9">
          {/* Card Meta Header */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>Role: Student (Auto-Assigned)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Student Registration
            </span>
          </div>

          <div className="mb-5">
            <h2 className="text-base sm:text-lg font-bold text-[#0F2C59]">
              Student Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Only student accounts can self-register. Administrator accounts are strictly provisioned.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-10 pr-4 text-slate-800 placeholder:text-slate-400 transition-colors"
                  placeholder="e.g. Samantha Hayes"
                />
              </div>
            </div>

            {/* Student Institutional Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Student Institutional Email (@ua.edu.ph) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-10 pr-4 text-slate-800 placeholder:text-slate-400 transition-colors"
                  placeholder="student@ua.edu.ph"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Must be a valid University of the Assumption student email ending with <strong className="text-slate-600 font-semibold">@ua.edu.ph</strong>
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-10 pr-10 text-slate-800 placeholder:text-slate-400 transition-colors"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirement Notice */}
              <div className="flex items-start gap-1.5 pt-0.5 text-[11px] text-slate-500 leading-snug">
                <Info className="h-3.5 w-3.5 text-[#15538C] flex-shrink-0 mt-0.5" />
                <span>
                  Must contain at least one number, one lowercase letter, one uppercase letter, one special character, and be at least 6 characters long.
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-10 pr-10 text-slate-800 placeholder:text-slate-400 transition-colors"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Create Account Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#15538C] hover:bg-[#0F3C66] active:bg-[#0C3052] text-white font-semibold text-sm h-11 min-h-[44px] rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Creating Student Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Back Navigation */}
          <div className="mt-5 text-center">
            <Link
              href="/student/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15538C] hover:underline transition-colors min-h-[36px] py-1 px-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Student Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
