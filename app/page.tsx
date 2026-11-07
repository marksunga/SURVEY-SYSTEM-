import Link from 'next/link';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  QrCode,
  ArrowRight,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

export default async function HomePage() {
  const user = await getCurrentUser();
  const activeSurveys = MockAdapter.getSurveys().filter((s) => s.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm leading-tight block">IT Department</span>
              <span className="text-xs text-slate-500">Feedback & Survey System</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white min-h-[44px]">
                <Link href={user.role_id === 'ADMINISTRATOR' ? '/admin/dashboard' : '/student/dashboard'}>
                  Go to {user.role_id === 'ADMINISTRATOR' ? 'Admin Dashboard' : 'Student Dashboard'}
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white min-h-[44px]">
                <Link href="/student/login">
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-blue-50/60 via-slate-50/30 to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Official Academic Survey & Feedback Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Empowering Continuous Improvement in <span className="text-blue-600">IT Education</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Participate in active IT curriculum reviews, evaluate laboratory facilities, and provide confidential departmental feedback.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-md text-sm min-h-[44px]">
              <Link href={user ? (user.role_id === 'ADMINISTRATOR' ? '/admin/dashboard' : '/student/dashboard') : '/student/login'}>
                {user ? 'Open Student Portal' : 'Access Surveys'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 text-sm min-h-[44px]">
              <Link href="/scan">
                <QrCode className="h-4 w-4 mr-2 text-blue-600" />
                Scan Survey QR
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Currently Active Surveys Section - Moved Upward as Primary Focus */}
      <section className="py-10 md:py-12 bg-white flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Currently Active Surveys
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Live evaluations currently accepting student responses.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs border-slate-200 self-start sm:self-auto min-h-[38px]">
              <Link href="/surveys">
                View All ({activeSurveys.length})
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSurveys.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No active surveys at this time.</p>
                <p className="text-xs text-slate-400 mt-1">Please check back soon for upcoming department evaluations.</p>
              </div>
            ) : (
              activeSurveys.map((survey) => (
                <Card key={survey.id} className="border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all">
                  <CardContent className="p-5 flex flex-col justify-between gap-4 h-full">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                          Active
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {survey.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {survey.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {survey.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div className="text-[11px] text-slate-400 font-medium">
                        <span>{survey.questions_count} questions</span>
                        <span className="mx-1.5">•</span>
                        <span>{survey.responses_count} submitted</span>
                      </div>
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs min-h-[38px] flex-shrink-0">
                        <Link href={`/surveys/${survey.id}`}>
                          Take Survey
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 IT Department Feedback and Survey System. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs font-medium text-slate-600">
            <Link href="/surveys" className="hover:text-blue-600">Surveys</Link>
            <Link href="/scan" className="hover:text-blue-600">QR Scanner</Link>
            <Link href="/feedback" className="hover:text-blue-600">Submit Feedback</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
