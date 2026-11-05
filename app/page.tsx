import Link from 'next/link';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser } from '@/lib/auth/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  ShieldCheck,
  QrCode,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  CheckCircle,
  Users,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

export default async function HomePage() {
  const user = await getCurrentUser();
  const activeSurveys = MockAdapter.getSurveys().filter((s) => s.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
                <Link href={user.role_id === 'ADMINISTRATOR' ? '/admin' : '/dashboard'}>
                  Go to Portal ({user.full_name.split(' ')[0]})
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
                  <Link href="/auth/register">Create Account</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50/50 via-slate-50/30 to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Official Academic Survey & Feedback Platform</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Empowering Continuous Improvement in <span className="text-blue-600">IT Education</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, secure portal for students, faculty, and administrators to evaluate curriculum,
            report lab issues, and shape departmental decisions with cryptographically protected privacy.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-md text-sm">
              <Link href="/auth/login">
                Access Department Portal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-700 text-sm">
              <Link href="/scan">
                <QrCode className="h-4 w-4 mr-2 text-blue-600" />
                Scan Survey QR
              </Link>
            </Button>
          </div>

          {/* Quick Demo Login Pills */}
          <div className="pt-8 max-w-xl mx-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              1-Click Interactive Demo Access
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Link
                href="/auth/login?demo=student"
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 transition-all text-center"
              >
                🎓 Student
              </Link>
              <Link
                href="/auth/login?demo=professor"
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 transition-all text-center"
              >
                👨‍🏫 IT Professor
              </Link>
              <Link
                href="/auth/login?demo=officer"
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 transition-all text-center"
              >
                🛠️ IT Officer
              </Link>
              <Link
                href="/auth/login?demo=admin"
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 transition-all text-center"
              >
                🛡️ Administrator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Engineered for Academic Integrity & Privacy</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Full-stack design ensuring confidential responses, auditable actions, and actionable analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero-Knowledge Anonymity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Participation receipts ensure single submissions per student without storing any link to individual response payloads.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AES-256 Encrypted Feedback</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sensitive feedback regarding facilities or faculty is encrypted using AES-256-GCM authenticated cipher before reaching storage.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Automated Reports & QR Hub</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant PDF report generation with charts and tables, direct CSV data exports, and auto-generated printable survey QR codes.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Active Surveys Preview */}
      <section className="py-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Currently Active Surveys</h3>
              <p className="text-xs text-slate-500">Live evaluations currently accepting departmental responses.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/surveys">View All ({activeSurveys.length})</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSurveys.map((survey) => (
              <Card key={survey.id} className="border-slate-200 hover:border-blue-400 transition-all">
                <CardContent className="p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        Active
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">{survey.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{survey.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{survey.description}</p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      {survey.questions_count} questions • {survey.responses_count} submitted
                    </div>
                  </div>
                  <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs flex-shrink-0">
                    <Link href={`/surveys/${survey.id}`}>
                      Take Survey
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 IT Department Feedback and Survey System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/auth/login" className="hover:text-blue-600">Sign In</Link>
            <Link href="/scan" className="hover:text-blue-600">QR Scanner</Link>
            <Link href="/auth/register" className="hover:text-blue-600">Registration</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

