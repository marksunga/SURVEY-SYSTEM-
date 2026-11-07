import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  QrCode,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/student/login');
  }

  // If administrator arrives here, redirect to their dedicated dashboard
  if (user.role_id === 'ADMINISTRATOR') {
    redirect('/admin/dashboard');
  }

  const surveys = MockAdapter.getSurveys('STUDENT');
  const completedSurveyIds = MockAdapter.getUserCompletedSurveyIds(user.id);
  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE');
  const userFeedbacks = MockAdapter.getFeedbacks().filter((f) => f.user_id === user.id);

  // Submissions comparison
  const submittedSurveyIds = new Set(completedSurveyIds);
  const pendingSurveys = activeSurveys.filter((s) => !submittedSurveyIds.has(s.id));
  const completedSurveysCount = completedSurveyIds.length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner - Blue Gradient Header Design with High-Contrast Visible Action Buttons */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/30">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
            <span>Student Academic Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Your voice directly influences IT curriculum pacing, laboratory hardware upgrades, and student support services.
          </p>
        </div>

        {/* Action Buttons: Prominently displayed, responsive, properly aligned */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
          {/* Button 1: Scan Survey QR */}
          <Button
            asChild
            size="sm"
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md min-h-[42px] px-4 cursor-pointer transition-all border border-white flex items-center justify-center gap-2"
          >
            <Link href="/scan">
              <QrCode className="h-4 w-4 text-blue-600" />
              <span>Scan Survey QR</span>
            </Link>
          </Button>

          {/* Button 2: Submit Feedback - Visible, high contrast, readable */}
          <Button
            asChild
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md min-h-[42px] px-4 cursor-pointer transition-all border border-white/20 flex items-center justify-center gap-2"
          >
            <Link href="/feedback">
              <MessageSquarePlus className="h-4 w-4 text-blue-300" />
              <span>Submit Feedback</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Surveys"
          value={pendingSurveys.length}
          subtitle={`${activeSurveys.length} active in department`}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Surveys Completed"
          value={completedSurveysCount}
          subtitle="Your recorded submissions"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Action"
          value={pendingSurveys.length}
          subtitle="Surveys awaiting response"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="My Feedback"
          value={userFeedbacks.length}
          subtitle="Submitted inquiries & tickets"
          icon={MessageSquarePlus}
          color="indigo"
        />
      </div>

      {/* Currently Active Surveys - Full Width Primary Section */}
      <div className="w-full space-y-6">
        <Card className="border-slate-200 bg-white shadow-xs rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A]">
                Currently Active Surveys
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Live evaluations currently accepting student responses.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[#4682A9] hover:text-[#386B8C]">
              <Link href="/surveys">
                View All ({activeSurveys.length})
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {pendingSurveys.length === 0 ? (
              <div className="text-center py-12 bg-[#F3F5F7]/50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2.5" />
                <p className="text-sm font-bold text-[#0F172A]">You are completely up to date!</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  You have answered all currently active department surveys. Check back soon for new evaluations.
                </p>
              </div>
            ) : (
              pendingSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-[#85B5D2] hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF2F8] text-[#2C5E7D] uppercase border border-[#D1E3EC]">
                        {survey.category.replace('_', ' ')}
                      </span>
                      {survey.is_anonymous_allowed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          Anonymous Allowed
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0F172A] leading-snug">
                      {survey.title}
                    </h2>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {survey.description}
                    </p>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                      <span className="font-medium text-slate-700">{survey.questions_count} questions</span>
                      <span>•</span>
                      <span>{survey.responses_count} submitted</span>
                      <span>•</span>
                      <span>Deadline: {formatDateTime(survey.end_date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center w-full sm:w-auto">
                    <Button asChild size="sm" className="bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs flex-shrink-0 min-h-[38px] w-full sm:w-auto px-4 shadow-xs">
                      <Link href={`/surveys/${survey.id}`}>
                        Take Survey
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
