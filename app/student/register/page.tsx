'use client';

import { useState, useRef } from 'react';
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
  CheckCircle2,
  Zap,
  Monitor,
  GraduationCap,
  UserPlus,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);

  function scrollToCard() {
    setMobileMenuOpen(false);
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        fullNameInputRef.current?.focus();
      }, 400);
    }
  }

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
      setError(
        'Registration requires an official University of the Assumption email ending with @ua.edu.ph (e.g. yourname@ua.edu.ph).'
      );
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
    <div className="min-h-screen w-full bg-[#F4F9FD] flex flex-col justify-between overflow-x-hidden text-slate-800 antialiased selection:bg-[#185A9D] selection:text-white">
      {/* ════════════════════════════════════════════════════════════════════
          1. TOP NAVIGATION BAR (Exact Match to Portal Design)
          - White horizontal navbar
          - University logo + "University of the Assumption" / "IT Department Portal"
          - Desktop: Admin text link + "Student Login" blue pill button
          - Mobile: Compact header with Hamburger menu button
         ════════════════════════════════════════════════════════════════════ */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: University Seal & Typography */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
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
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-bold text-[#0E2F52] tracking-tight leading-tight group-hover:text-[#185A9D] transition-colors">
                University of the Assumption
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                IT Department Portal
              </span>
            </div>
          </Link>

          {/* Desktop Right: Admin link + Student Login button */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/auth/login?role=admin"
              className="text-xs font-semibold text-slate-600 hover:text-[#185A9D] transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/student/login"
              className="rounded-full bg-[#185A9D] hover:bg-[#124578] text-white text-xs font-semibold px-4 py-2 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Student Login</span>
            </Link>
          </nav>

          {/* Mobile Right: Hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/student/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#EAF2F8] text-[#185A9D] font-bold text-xs"
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Student Login Portal</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/auth/login?role=admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#4682A9]" />
                <span>Administrator Login</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
            <button
              type="button"
              onClick={scrollToCard}
              className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#4682A9]" />
                <span>Create Student Account</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          2. HERO SECTION WITH CAMPUS & FOUNTAIN BACKGROUND
          - Real campus & fountain photography
          - Information Technology Department chip
          - Heading: "IT Department Portal" (Portal in cyan #38BDF8)
          - Subtitle: Course evaluations, surveys, feedback system
          - Buttons: "-> Login to Portal" & "Create Student Account"
          - Informational badges: 24/7 IT Access, Fast & Reliable, Official UA
          - Desktop: Large gold UA circular seal on right
         ════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-[#0A2644] text-white pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-28 sm:pb-36 lg:pb-44">
        {/* Real Campus Photo Background with Deep Navy Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/ua-building.jpg"
            alt="University of the Assumption Campus Facade and Fountain"
            fill
            className="object-cover object-[center_30%] sm:object-[center_35%] filter contrast-110 brightness-95"
            priority
          />
          {/* Deep Navy/Blue Atmospheric Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C2B4E]/95 via-[#11406E]/88 to-[#09223D]/92 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2644]/40 via-transparent to-[#0A2644]/80" />

          {/* Diagonal Stone Watermark Texture */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
            <span className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-widest text-white uppercase transform -rotate-12 whitespace-nowrap">
              UNIVERSITY OF THE ASSUMPTION
            </span>
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading, Subtitle, Actions, Badges */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-5 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Category Pill Chip */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-white shadow-xs">
                <Monitor className="h-3 w-3 text-[#38BDF8]" />
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
                <Link
                  href="/student/login"
                  className="w-full sm:w-auto rounded-full bg-white/10 border border-white/40 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold px-6 py-2.5 sm:py-3 backdrop-blur-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Login to Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={scrollToCard}
                  className="w-full sm:w-auto rounded-full bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs sm:text-sm font-bold px-5 py-2.5 sm:py-3 shadow-md shadow-blue-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UserPlus className="h-4 w-4 text-sky-200" />
                  <span>Create Student Account</span>
                </button>
              </div>

              {/* 3 Informational Badges Row */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[11px] sm:text-xs text-white/80 font-medium flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>24/7 IT Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>Fast & Reliable</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>Official UA System</span>
                </div>
              </div>
            </div>

            {/* Right Column (Desktop): Iconic Large Circular Seal */}
            <div className="hidden lg:col-span-4 lg:flex justify-end items-center">
              <div className="relative w-44 h-44 xl:w-52 xl:h-52 drop-shadow-[0_15px_30px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 duration-300">
                <Image
                  src="/images/ua-seal.png"
                  alt="University of the Assumption Circular Seal"
                  width={208}
                  height={208}
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
            - Smooth overlapping effect between the blue hero & lower section
            - Light-blue decorative curved shapes
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
              opacity="0.7"
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
          3. CENTERED REGISTRATION CARD SECTION
          - Overlaps the hero and lower section
          - Pure white background, rounded-3xl, subtle shadow
          - Matches the exact registration fields & styling
         ════════════════════════════════════════════════════════════════════ */}
      <main className="relative z-20 w-full px-4 sm:px-6 -mt-16 sm:-mt-24 md:-mt-28 lg:-mt-32 pb-8 flex-1 flex flex-col items-center">
        <div
          ref={cardRef}
          className="w-full max-w-[480px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100/90 p-6 sm:p-8 backdrop-blur-xs transition-all"
        >
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Student Full Name */}
            <div className="space-y-1">
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
                Student Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  ref={fullNameInputRef}
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-11 pr-4 text-slate-800 placeholder:text-slate-400 transition-colors shadow-2xs"
                  placeholder="e.g. Samantha Hayes"
                />
              </div>
            </div>

            {/* Student Institutional Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Student Institutional Email (@ua.edu.ph) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-11 pr-4 text-slate-800 placeholder:text-slate-400 transition-colors shadow-2xs"
                  placeholder="student@ua.edu.ph"
                />
              </div>
              <p className="text-[11px] text-slate-400 pt-0.5">
                Must be a valid University of the Assumption student email ending with <strong className="text-slate-600 font-semibold">@ua.edu.ph</strong>
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-11 pr-11 text-slate-800 placeholder:text-slate-400 transition-colors shadow-2xs"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
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
            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 focus:border-[#15538C] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#15538C] rounded-xl h-11 text-xs sm:text-sm pl-11 pr-11 text-slate-800 placeholder:text-slate-400 transition-colors shadow-2xs"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Create Account Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#185A9D] hover:bg-[#124578] active:bg-[#0C3052] text-white font-bold text-xs sm:text-sm h-11 min-h-[44px] rounded-xl shadow-md shadow-blue-900/15 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
          <div className="pt-4 mt-3 border-t border-slate-100 text-center">
            <Link
              href="/student/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#185A9D] hover:underline transition-colors min-h-[36px] py-1 px-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Student Login</span>
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            E. LOWER SECTION & MOTTO
            - University motto: "Biasa, Maganaca, Mayap."
            - University values: "SCIENTIA · VIRTUS · COMMUNITAS"
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
