'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuthLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md mx-auto w-full space-y-6 my-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to IT Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Welcome to the IT Department Feedback and Survey System. Please select your account type to proceed.
          </p>
        </div>

        <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="text-center pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Choose Access Type
              </span>
            </div>

            {/* Button 1: Student Login */}
            <Button
              asChild
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm h-12 min-h-[48px] shadow-sm transition-all flex items-center justify-between px-5"
            >
              <Link href="/student/login">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-blue-100" />
                  <span>Student Login</span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-200" />
              </Link>
            </Button>

            {/* Button 2: Admin Login */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-slate-300 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm h-12 min-h-[48px] shadow-sm transition-all flex items-center justify-between px-5"
            >
              <Link href="/admin/login">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                  <span>Admin Login</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-400">
          Authorized institutional access only. Authentication is verified and role-enforced on the server.
        </p>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400">
        <p>© 2026 IT Department Feedback and Survey System. All rights reserved.</p>
      </footer>
    </div>
  );
}
