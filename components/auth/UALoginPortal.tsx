'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { studentLoginAction, adminLoginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

interface UALoginPortalProps {
  initialRole?: 'STUDENT' | 'ADMINISTRATOR';
}

export function UALoginPortal({ initialRole = 'STUDENT' }: UALoginPortalProps) {
  const [role, setRole] = useState<'STUDENT' | 'ADMINISTRATOR'>(initialRole);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Quick client-side check for student email domain
    if (role === 'STUDENT' && identifier.includes('@') && !identifier.toLowerCase().endsWith('@ua.edu.ph')) {
      setError('Student login requires an official University of the Assumption email ending with @ua.edu.ph (e.g. student@ua.edu.ph).');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (role === 'ADMINISTRATOR') {
      formData.append('username', identifier);
      formData.append('email', identifier);
    } else {
      formData.append('email', identifier);
      formData.append('username', identifier);
    }
    formData.append('password', password);

    const res =
      role === 'ADMINISTRATOR'
        ? await adminLoginAction(formData)
        : await studentLoginAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F4F7FB] flex flex-col justify-between select-none">
      {/* ── Background Layer 1: Left Blue Gradient & Geometric Polygon Shapes ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep blue gradient on the left third, smoothly fading into the light gray on the right */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[48%] bg-gradient-to-r from-[#123860] via-[#1E5285] to-transparent z-0 opacity-95" />

        {/* Top-Left Crisp Geometric Angled Polygons (Matching Reference Image 1) */}
        <svg
          className="absolute top-0 left-0 w-[420px] sm:w-[540px] h-[340px] z-10 opacity-90"
          viewBox="0 0 540 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Darkest accent chevron */}
          <polygon points="0,0 360,0 180,260 0,140" fill="#0E2F52" opacity="0.85" />
          {/* Middle blue angled polygon */}
          <polygon points="0,0 480,0 260,310 0,220" fill="#184878" opacity="0.65" />
          {/* Bright pacific blue outer diagonal shard */}
          <polygon points="60,0 540,0 320,340 180,260" fill="#296EA8" opacity="0.45" />
        </svg>

        {/* ── Left Lower Background: UA Building (Reference 2 in Reference 3 Blueprint Style) ── */}
        <div className="absolute bottom-0 left-0 w-[85%] sm:w-[65%] lg:w-[42%] h-[42%] sm:h-[50%] lg:h-[58%] z-5 opacity-40 mix-blend-multiply pointer-events-none">
          <Image
            src="/images/ua-blueprint-facade.png"
            alt="University of the Assumption Building Facade"
            fill
            className="object-contain object-bottom-left filter contrast-125"
            priority
          />
        </div>

        {/* Left soft fade gradient mask over building for smooth blend into the card */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-[50%] bg-gradient-to-t from-[#123860]/80 via-transparent to-transparent z-6 pointer-events-none" />

        {/* ── Right Background: Subtle University Seal Watermark (Reference Image 1) ── */}
        <div className="hidden lg:block absolute -right-20 -bottom-20 w-[620px] h-[620px] opacity-[0.06] pointer-events-none z-0">
          <Image
            src="/images/ua-seal.png"
            alt="University of the Assumption Watermark"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* ── Main Content Container: Left Branding, Center Card, Right Motto ── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between py-6 sm:py-10 gap-8 lg:gap-4">
        {/* ════════════════════════════════════════════════════════════════════
            LEFT SECTION – School Identification & Department Tagline
            - Displays ONLY text "UNIVERSITY OF THE ASSUMPTION" (school logo removed)
            - Replaces "IT DEPARTMENT ng UA Transforms You" with clean IT tagline
            - "Feedback Today, A Better Tomorrow" removed completely
           ════════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[32%] text-center lg:text-left pt-2 lg:pt-0">
          <div className="inline-block space-y-1.5 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl xl:text-3xl font-extrabold tracking-wider text-white uppercase font-sans drop-shadow-md leading-tight">
              UNIVERSITY OF THE ASSUMPTION
            </h1>
            <div className="h-0.5 w-16 bg-[#85B5D2] rounded-full mx-auto lg:mx-0 my-1 opacity-90" />
            <p className="text-sm sm:text-base font-semibold text-blue-100 tracking-wide drop-shadow-xs">
              Information Technology Department
            </p>
            <p className="text-xs text-blue-200/90 font-light tracking-wider drop-shadow-xs">
              Excellence in Computing, Character & Innovation
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            CENTER SECTION – Main IT Department Portal Login Card
            - Retains layout and visual structure of Reference Image 1
            - Retains existing logo in the middle login section (Reference Image 5)
            - Updated Title: "IT DEPARTMENT PORTAL"
            - Subtitle from Reference Image 4
            - Username, Password, and Login Button arrangement from Reference Image 1
           ════════════════════════════════════════════════════════════════════ */}
        <div className="w-full max-w-[430px] mx-auto z-20">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5 transition-all">
            {/* Middle Logo: University of the Assumption Official Seal */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 mb-3 drop-shadow-md transition-transform hover:scale-105 duration-200">
                <Image
                  src="/images/ua-seal.png"
                  alt="University of the Assumption Seal"
                  width={88}
                  height={88}
                  className="object-contain"
                  priority
                />
              </div>

              {/* Title from prompt: "IT DEPARTMENT PORTAL" */}
              <h2 className="text-xl sm:text-2xl font-black text-[#103058] tracking-tight uppercase">
                IT DEPARTMENT PORTAL
              </h2>

              {/* Subtitle from Reference Image 4 */}
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Course evaluations, academic surveys, and departmental feedback system.
              </p>
            </div>

            {/* Role Switcher Pill: Student Access & Admin Access */}
            <div className="p-1 bg-[#F1F4F8] rounded-xl flex items-center gap-1 border border-slate-200/70">
              <button
                type="button"
                onClick={() => {
                  setRole('STUDENT');
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-white text-[#154675] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('ADMINISTRATOR');
                  setError(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'ADMINISTRATOR'
                    ? 'bg-[#123860] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Administrator</span>
              </button>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {/* Form: Username/Email and Password Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Username / Email Input */}
              <div className="space-y-1">
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    name={role === 'ADMINISTRATOR' ? 'username' : 'email'}
                    type={role === 'ADMINISTRATOR' ? 'text' : 'email'}
                    required
                    autoComplete={role === 'ADMINISTRATOR' ? 'username' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      role === 'ADMINISTRATOR'
                        ? 'Username (e.g. admin)'
                        : 'Student Email (@ua.edu.ph)'
                    }
                    className="pl-10 text-xs h-11 bg-slate-50/70 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#2563A6] focus-visible:bg-white transition-colors"
                  />
                </div>
                {role === 'ADMINISTRATOR' ? (
                  <p className="text-[10px] text-slate-400 pl-1">
                    Single Administrator Account • Username: <strong className="text-slate-700">admin</strong>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 pl-1">
                    Enter your official <strong className="text-slate-700">@ua.edu.ph</strong> student email.
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="pl-10 pr-10 text-xs h-11 bg-slate-50/70 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-[#2563A6] focus-visible:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Action Button: Solid Blue with Right Arrow (Reference Image 1) */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#205A93] hover:bg-[#184878] text-white font-bold text-xs sm:text-sm h-11 rounded-xl shadow-md shadow-blue-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    <span>Login</span>
                  </>
                )}
              </Button>
            </form>

            {/* Quick Links & Information */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              {role === 'STUDENT' ? (
                <>
                  <Link
                    href="/auth/forgot-password?portal=student"
                    className="hover:text-[#205A93] hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                  <Link
                    href="/student/register"
                    className="font-semibold text-[#205A93] hover:underline flex items-center gap-1"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>Create Student Account</span>
                  </Link>
                </>
              ) : (
                <div className="w-full text-center text-slate-400 text-[10px]">
                  Institutional Administrator Access • Managed by IT Department
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-1 text-center">
              <p className="text-[11px] font-bold text-slate-700">
                University of the Assumption
              </p>
              <p className="text-[10px] text-slate-400">IT Department</p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            RIGHT SECTION – Core Institutional Values & Motto
            - Replaces "Learn, Grow, Serve" with exact phrase:
              "Biasa, Maganaca, Mayap."
            - Maintains original positioning, visual balance, and deep blue color
           ════════════════════════════════════════════════════════════════════ */}
        <div className="w-full lg:w-[32%] text-center lg:text-right pb-4 lg:pb-0">
          <div className="inline-block space-y-1">
            <p
              className="text-2xl sm:text-3xl xl:text-4xl font-serif italic font-extrabold text-[#173F6A] tracking-wide drop-shadow-xs"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              Biasa, Maganaca, Mayap.
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Wise • Courteous • Good
            </p>
          </div>
        </div>
      </main>

      {/* ── Minimal Bottom Footer ── */}
      <footer className="relative z-10 w-full py-3 px-4 text-center text-[11px] text-slate-400 border-t border-slate-200/50 bg-white/40 backdrop-blur-xs">
        <p>© 2026 University of the Assumption — IT Department Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}

