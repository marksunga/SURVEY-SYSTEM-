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
  Clock,
  MessageSquare,
  ArrowRight,
  PlusCircle,
  FileText,
  BarChart3,
  QrCode,
  Sparkles,
  Settings,
  Bell,
  Database,
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
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/30">
            <Sparkles className="h-3 w-3" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage students, create and schedule academic surveys, and moderate encrypted feedback
            under strict role isolation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs shadow-sm min-h-[38px]">
            <Link href="/admin/surveys/create">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create Survey
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 text-xs min-h-[38px]">
            <Link href="/admin/reports">
              <BarChart3 className="h-4 w-4 mr-1.5 text-blue-400" />
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

      {/* Quick Administrative Management Hub */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Administrator Management Modules
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/users"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Manage Students</div>
              <div className="text-[11px] text-slate-500">View & manage student accounts</div>
            </div>
          </Link>

          <Link
            href="/admin/surveys"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Manage Surveys</div>
              <div className="text-[11px] text-slate-500">Create, edit, and schedule surveys</div>
            </div>
          </Link>

          <Link
            href="/admin/feedback"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Moderate Feedback</div>
              <div className="text-[11px] text-slate-500">Review encrypted feedback</div>
            </div>
          </Link>

          <Link
            href="/admin/qr-codes"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">QR Code Hub</div>
              <div className="text-[11px] text-slate-500">Generate & download QR cards</div>
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Reports & Analytics</div>
              <div className="text-[11px] text-slate-500">Export CSV & PDF results</div>
            </div>
          </Link>

          <Link
            href="/admin/notifications"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Broadcasts & Reminders</div>
              <div className="text-[11px] text-slate-500">Broadcast alerts & deadlines</div>
            </div>
          </Link>

          <Link
            href="/admin/backups"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Database Backups</div>
              <div className="text-[11px] text-slate-500">Export & restore snapshots</div>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">System Settings</div>
              <div className="text-[11px] text-slate-500">Security & server parameters</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Active Academic Surveys - Full Width Primary Section */}
      <div className="w-full space-y-6">
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Active Academic Surveys
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveys currently open for student submissions and evaluations
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
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
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {survey.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
                        <span className="font-semibold text-blue-600">
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
                      <Button asChild variant="outline" size="sm" className="h-9 px-3.5 text-xs border-slate-300 hover:bg-slate-50">
                        <Link href={`/admin/surveys/${survey.id}/results`}>
                          Results
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="h-9 px-3.5 text-xs bg-slate-900 hover:bg-slate-800 text-white">
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
