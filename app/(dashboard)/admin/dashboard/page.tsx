import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const admin = await requireRole(['ADMINISTRATOR']);

  const profiles = MockAdapter.getProfiles();
  const surveys = MockAdapter.getSurveys();
  const feedbacks = MockAdapter.getFeedbacks();

  const studentCount = profiles.filter((p) => p.role_id === 'STUDENT').length;
  const totalUsers = profiles.length;
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE').length;
  const expiredSurveys = surveys.filter((s) => s.status === 'EXPIRED').length;
  const totalSubmissions = surveys.reduce((acc, s) => acc + (s.responses_count || 0), 0);
  const pendingFeedback = feedbacks.filter((f) => f.status === 'PENDING').length;
  const participationRate =
    studentCount > 0 ? Math.min(100, Math.round((totalSubmissions / Math.max(1, studentCount * (activeSurveys || 1))) * 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Header Banner - School Institutional Identity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#2C5E7D] text-xs font-semibold border border-[#D1E3EC]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#4682A9]" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Manage students, create and schedule academic surveys, and moderate encrypted feedback
            under strict role isolation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button asChild size="sm" className="bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold shadow-xs min-h-[38px]">
            <Link href="/admin/surveys/create">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Survey
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-slate-300 bg-white text-[#0F172A] hover:bg-[#F3F5F7] text-xs font-semibold min-h-[38px]">
            <Link href="/admin/reports">
              <BarChart3 className="h-4 w-4 mr-1.5 text-[#4682A9]" />
              Analytics & Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Students"
          value={studentCount}
          subtitle={`Total accounts: ${totalUsers}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Surveys"
          value={activeSurveys}
          subtitle={`${expiredSurveys} expired • ${totalSurveys} total`}
          icon={ClipboardList}
          color="emerald"
        />
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          subtitle={`~${participationRate}% est. student participation`}
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          title="Pending Feedback"
          value={pendingFeedback}
          subtitle="Awaiting moderation"
          icon={MessageSquare}
          color="amber"
        />
      </div>

      {/* Active Academic Surveys - Full Width Primary Section */}
      <div className="w-full space-y-6">
        <Card className="border-slate-200 bg-white shadow-xs rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-[#0F172A]">
                Active Academic Surveys
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveys currently open for student submissions and evaluations
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-[#4682A9] hover:text-[#386B8C]">
              <Link href="/admin/surveys">
                View All Surveys ({surveys.length})
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {surveys.filter((s) => s.status === 'ACTIVE').length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No active surveys. Click Create Survey above to publish one.
              </div>
            ) : (
              surveys
                .filter((s) => s.status === 'ACTIVE')
                .map((survey) => (
                  <div
                    key={survey.id}
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-[#85B5D2] hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#0F172A]">
                          {survey.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3F5F7] text-slate-700 border border-slate-200">
                          {survey.category}
                        </span>
                      </div>
                      {survey.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {survey.description}
                        </p>
                      )}
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                        <span className="font-medium text-slate-700">{survey.questions_count} Questions</span>
                        <span>•</span>
                        <span className="font-semibold text-[#4682A9]">
                          {survey.responses_count} Responses
                        </span>
                        <span>•</span>
                        <span>Closes {formatDate(survey.end_date)}</span>
                        {survey.is_anonymous_allowed && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Anonymous Submissions Allowed</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                      <Button asChild variant="outline" size="sm" className="h-9 px-3.5 text-xs border-slate-300 hover:bg-[#F3F5F7]">
                        <Link href={`/admin/surveys/${survey.id}/results`}>
                          Results
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="h-9 px-3.5 text-xs bg-[#0F172A] hover:bg-[#1E293B] text-white">
                        <Link href={`/admin/surveys/${survey.id}/edit`}>
                          Edit
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
