import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default async function HomePage() {
  const user = await getCurrentUser();

  // If already authenticated, redirect straight to the user's dashboard
  if (user) {
    if (user.role_id === 'ADMINISTRATOR') {
      redirect('/admin/dashboard');
    } else {
      redirect('/student/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm leading-tight block">
              IT Department
            </span>
            <span className="text-xs text-slate-500">
              Feedback & Survey System
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Secure Institutional Portal</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* System Identity & Description */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mx-auto mb-2">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              IT Department System
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Academic survey evaluations and confidential departmental feedback platform. Please select your login access below.
            </p>
          </div>

          {/* Authentication Access Container */}
          <Card className="border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="text-center pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select Account Access
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
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 px-4">
        <p>© 2026 IT Department Feedback and Survey System. All rights reserved.</p>
      </footer>
    </div>
  );
}
