'use client';

import { useState, useRef } from 'react';
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
  Monitor,
  CheckCircle2,
  Zap,
  Menu,
  X,
  Shield,
  HelpCircle,
  Hexagon,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const identifierInputRef = useRef<HTMLInputElement>(null);

  function scrollToLoginCard(targetRole?: 'STUDENT' | 'ADMINISTRATOR') {
    if (targetRole) {
      setRole(targetRole);
    }
    setError(null);
    setMobileMenuOpen(false);
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        identifierInputRef.current?.focus();
      }, 400);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side institutional email validation check for students
    if (
      role === 'STUDENT' &&
      identifier.includes('@') &&
      !identifier.toLowerCase().endsWith('@ua.edu.ph')
    ) {
      setError(
        'Student login requires an official University of the Assumption email ending with @ua.edu.ph (e.g. student@ua.edu.ph).'
      );
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
    <div className="min-h-screen w-full bg-[#F4F9FD] flex flex-col justify-between overflow-x-hidden text-slate-800 antialiased selection:bg-[#185A9D] selection:text-white">
      {/* ════════════════════════════════════════════════════════════════════
          1. TOP NAVIGATION BAR (Exact Match to Inspiration Reference)
          - White horizontal navbar
          - University seal + "University of the Assumption" / "IT Department Portal"
          - Desktop: Admin text link + "Student Login" blue pill button
          - Mobile: Compact header with Hamburger menu button
         ════════════════════════════════════════════════════════════════════ */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Left: University Seal & Typography */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/images/ua-seal.png"
                alt="University of the Assumption Seal"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs sm:text-sm font-bold text-[#0E2F52] tracking-tight leading-tight group-hover:text-[#185A9D] transition-colors truncate">
                University of the Assumption
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5 truncate">
                IT Department Portal
              </span>
            </div>
          </Link>

          {/* Desktop Right: Admin link + Student Login button */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollToLoginCard('ADMINISTRATOR')}
              className={`text-xs font-semibold transition-colors cursor-pointer ${
                role === 'ADMINISTRATOR'
                  ? 'text-[#185A9D] font-bold underline underline-offset-4'
                  : 'text-slate-600 hover:text-[#185A9D]'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => scrollToLoginCard('STUDENT')}
              className="rounded-full bg-[#185A9D] hover:bg-[#124578] text-white text-xs font-semibold px-4 py-2 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Student Login</span>
            </button>
          </nav>

          {/* Mobile Right: Hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={() => scrollToLoginCard('STUDENT')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#EAF2F8] text-[#185A9D] font-bold text-xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Student Login Portal</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToLoginCard('ADMINISTRATOR')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#4682A9]" />
                <span>Administrator Login</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <Link
              href="/student/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#4682A9]" />
                <span>Create Student Account</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          2. HERO SECTION WITH CAMPUS & FOUNTAIN BACKGROUND
          - Real Campus & Statue Fountain photography clearly visible
          - Smooth horizontal gradient overlay (dark royal blue on left for text contrast,
            fading to transparent on center/right so statue & building shine naturally)
          - Information Technology Department chip
          - Heading: "IT Department Portal" (Portal in cyan #38BDF8)
          - Subtitle: Course evaluations, academic surveys, and departmental feedback system.
          - Buttons: "-> Login to Portal" (blue) & "Create Student Account" (glass)
          - Badges: "Secure Access", "Fast & Reliable", "Official UA System"
          - Desktop: Large gold UA circular seal floating on right
         ════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-[#073663] text-white pt-6 sm:pt-10 md:pt-12 lg:pt-14 pb-28 sm:pb-36 lg:pb-44">
        {/* Real Campus Photo Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/ua-building.jpg"
            alt="University of the Assumption Campus Facade and Fountain"
            fill
            className="object-cover object-[center_25%] sm:object-[center_28%] lg:object-[center_25%] filter contrast-105 brightness-100"
            priority
          />

          {/* Desktop Gradient Overlay: Solid royal navy on left for readability, fading to transparent on right so statue & building are crisp */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06315A] via-[#084277]/80 via-50% to-transparent hidden md:block" />

          {/* Mobile Gradient: Stronger on the left for text legibility, translucent on right so fountain statue stays visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06315A]/95 via-[#073A6B]/80 to-[#073A6B]/30 md:hidden" />

          {/* Subtle top & bottom shadow gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#073663]/60" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading, Subtitle, Actions, Badges */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Category Pill Chip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/30 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-white shadow-xs">
                <Monitor className="h-3.5 w-3.5 text-[#38BDF8]" />
                <span>INFORMATION TECHNOLOGY DEPARTMENT</span>
              </div>

              {/* Main Heading: IT Department Portal */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.1]">
                IT Department <span className="text-[#38BDF8]">Portal</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-xs sm:text-sm md:text-base text-slate-100/90 max-w-xl leading-relaxed font-normal">
                Course evaluations, academic surveys, and departmental feedback system.
              </p>

              {/* Action Buttons: "-> Login to Portal" & "Create Student Account" */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => scrollToLoginCard('STUDENT')}
                  className="w-full sm:w-auto rounded-full bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs sm:text-sm font-bold px-6 py-2.5 sm:py-3 shadow-md shadow-blue-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Login to Portal</span>
                </button>
                <Link
                  href="/student/register"
                  className="w-full sm:w-auto rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 sm:py-3 backdrop-blur-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UserPlus className="h-4 w-4 text-sky-200" />
                  <span>Create Student Account</span>
                </Link>
              </div>

              {/* 3 Informational Badges Row (Secure Access, Fast & Reliable, Official UA System) */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-white/90 font-medium flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>
                    <span className="hidden sm:inline">Secure Access</span>
                    <span className="sm:hidden">Secure</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>
                    <span className="hidden sm:inline">Fast & Reliable</span>
                    <span className="sm:hidden">Reliable</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>
                    <span className="hidden sm:inline">Official UA System</span>
                    <span className="sm:hidden">Official</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (Desktop): Iconic Large Circular Seal */}
            <div className="hidden lg:col-span-4 lg:flex justify-end items-center">
              <div className="relative w-48 h-48 xl:w-56 xl:h-56 drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 duration-300">
                <Image
                  src="/images/ua-seal.png"
                  alt="University of the Assumption Circular Seal"
                  width={224}
                  height={224}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            C. HERO-TO-CONTENT TRANSITION
            - Large curved organic SVG wave transition
            - Light cyan accent wave + clean white main wave
           ════════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-0 inset-x-0 overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            className="relative block w-full h-14 sm:h-20 md:h-28 lg:h-36"
            viewBox="0 0 1440 140"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Outer light cyan curved accent */}
            <path
              d="M0,35 C320,115 520,140 720,125 C920,110 1140,45 1440,65 L1440,140 L0,140 Z"
              fill="#D6E8F6"
              opacity="0.75"
            />
            {/* Main clean white bottom transition wave */}
            <path
              d="M0,65 C340,145 520,135 720,138 C920,142 1160,75 1440,105 L1440,140 L0,140 Z"
              fill="#F4F9FD"
            />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          3. CENTERED LOGIN CARD SECTION
          - Overlaps the hero and lower section
          - Pure white background, rounded-3xl, subtle shadow
          - Student & Administrator pill selectors side-by-side
          - Username or Institutional Email pill input
          - Password pill input with toggle
          - Full-width blue Login button
          - Forgot Password & Create Student Account links
         ════════════════════════════════════════════════════════════════════ */}
      <main className="relative z-20 w-full px-4 sm:px-6 -mt-16 sm:-mt-24 md:-mt-28 lg:-mt-32 pb-8 flex-1 flex flex-col items-center">
        <div
          ref={cardRef}
          className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100/90 p-6 sm:p-8 backdrop-blur-xs transition-all"
        >
          {/* Role Selector: Student vs Administrator Pills */}
          <div className="bg-[#F1F5F9] p-1 rounded-full flex gap-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setRole('STUDENT');
                setError(null);
              }}
              className={`flex-1 rounded-full py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'STUDENT'
                  ? 'bg-[#185A9D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('ADMINISTRATOR');
                setError(null);
              }}
              className={`flex-1 rounded-full py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                role === 'ADMINISTRATOR'
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Administrator</span>
            </button>
          </div>

          {/* Error Alert Display */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Input 1: Username or Institutional Email */}
            <div className="space-y-1">
              <div className="relative">
                <User className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  ref={identifierInputRef}
                  name="identifier"
                  type={role === 'STUDENT' ? 'email' : 'text'}
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    role === 'STUDENT'
                      ? 'Username or Institutional Email'
                      : 'Admin Username or Email'
                  }
                  className="pl-11 pr-4 text-xs h-11 bg-white border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#185A9D] shadow-2xs"
                />
              </div>
            </div>

            {/* Input 2: Password with Eye Toggle */}
            <div className="space-y-1">
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="pl-11 pr-11 text-xs h-11 bg-white border border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#185A9D] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Full-width Blue Login Button with Right Arrow */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#185A9D] hover:bg-[#124578] text-white font-bold text-xs sm:text-sm h-11 shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4 active:scale-95"
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

          {/* Card Footer Links */}
          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-xs text-slate-500">
            <Link
              href={
                role === 'ADMINISTRATOR'
                  ? '/auth/forgot-password?portal=admin'
                  : '/auth/forgot-password?portal=student'
              }
              className="text-[#185A9D] hover:underline font-medium"
            >
              Forgot password?
            </Link>
            {role === 'STUDENT' && (
              <>
                <span className="text-slate-300">|</span>
                <Link
                  href="/student/register"
                  className="text-[#185A9D] hover:underline font-semibold flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create Student Account</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            E. LOWER SECTION & MOTTO
            - University motto: "Biasa, Maganaca, Mayap."
            - University values: "SCIENTIA · VIRTUS · COMMUNITAS"
            - Decorative curved wave background
           ════════════════════════════════════════════════════════════════════ */}
        <div className="pt-8 pb-4 text-center space-y-2">
          <p
            className="text-xl sm:text-2xl font-serif italic font-extrabold text-[#103E6C] tracking-wide"
            style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
          >
            Biasa, Maganaca, Mayap.
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            <div className="h-px w-8 sm:w-16 bg-slate-200" />
            <span>SCIENTIA · VIRTUS · COMMUNITAS</span>
            <div className="h-px w-8 sm:w-16 bg-slate-200" />
          </div>
        </div>
      </main>

      {/* Decorative Bottom Wave */}
      <div className="w-full overflow-hidden leading-none pointer-events-none mt-auto">
        <svg
          className="w-full h-8 sm:h-12"
          viewBox="0 0 1440 60"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C360,60 720,0 1080,40 C1260,60 1380,30 1440,35 L1440,60 L0,60 Z"
            fill="#D9EBF8"
            opacity="0.7"
          />
          <path
            d="M0,35 C420,10 840,55 1200,25 C1320,15 1400,30 1440,30 L1440,60 L0,60 Z"
            fill="#185A9D"
            opacity="0.15"
          />
        </svg>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full py-2.5 px-4 text-center text-[10px] sm:text-[11px] text-slate-400 bg-white/70 border-t border-slate-100">
        <p>© 2026 University of the Assumption — IT Department Portal. All rights reserved.</p>
      </footer>
    </div>
  );
}
