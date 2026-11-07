'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, ShieldCheck, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';

export default function AuthLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">IT Dept Portal</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Select Your Login Portal
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          The IT Department system supports authenticated access for Students and Administrators.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg space-y-4">
        {/* Student Portal Card */}
        <Card className="border-slate-200 hover:border-blue-500 transition-all shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Student Portal</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    STUDENT
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Take active surveys, submit confidential feedback, and track evaluations.
                </p>
              </div>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold w-full sm:w-auto flex-shrink-0 min-h-[44px]">
              <Link href="/student/login">
                Enter Student Portal
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Administrator Portal Card */}
        <Card className="border-slate-200 hover:border-slate-800 transition-all shadow-sm bg-slate-900 text-white">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center flex-shrink-0 border border-slate-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Administrator Portal</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Manage surveys, moderate feedback, inspect audit logs, and export reports.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold w-full sm:w-auto flex-shrink-0 min-h-[44px]">
              <Link href="/admin/login">
                Enter Admin Portal
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center pt-4">
          <Link href="/student/register" className="text-xs font-medium text-blue-600 hover:underline">
            Need a student account? Register here →
          </Link>
        </div>
      </div>
    </div>
  );
}
