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
  ShieldAlert,
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
import { formatDate, formatDateTime } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const admin = await requireRole(['ADMINISTRATOR']);

  const profiles = MockAdapter.getProfiles();
  const surveys = MockAdapter.getSurveys();
  const feedbacks = MockAdapter.getFeedbacks();
  const auditLogs = MockAdapter.getAuditLogs().slice(0, 6);

  const studentCount = profiles.filter((p) => p.role_id === 'STUDENT').length;
  const totalUsers = profiles.length;
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE').length;
  const expiredSurveys = surveys.filter((s) => s.status === 'EXPIRED').length;
  const totalSubmissions = surveys.reduce((acc, s) => acc + (s.responses_count || 0), 0);
  const pendingFeedback = feedbacks.filter((f) => f.status === 'PENDING').length;
  const recentFeedbacks = feedbacks.slice(0, 3);
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
            Manage students, create and schedule academic surveys, moderate encrypted feedback,
            and inspect system audits under strict role isolation.
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
            href="/admin/audit-logs"
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col justify-between"
          >
            <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Security Audit Logs</div>
              <div className="text-[11px] text-slate-500">Track system events</div>
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

      {/* Main Grid: Surveys & Feedback Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Surveys Monitoring */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-slate-900">Active Academic Surveys</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Surveys currently open for student submissions</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-blue-600">
                <Link href="/admin/surveys">
                  View All Surveys ({surveys.length})
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {surveys.filter((s) => s.status === 'ACTIVE').length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No active surveys. Click Create Survey above to publish one.
                </div>
              ) : (
                surveys
                  .filter((s) => s.status === 'ACTIVE')
                  .slice(0, 4)
                  .map((survey) => (
                    <div
                      key={survey.id}
                      className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {survey.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            ACTIVE
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>{survey.questions_count} Questions</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-600">
                            {survey.responses_count} Responses
                          </span>
                          <span>•</span>
                          <span>Closes {formatDate(survey.end_date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                          <Link href={`/admin/surveys/${survey.id}/results`}>
                            Results
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white">
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

          {/* Recent Student Feedback */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-slate-900">Recent Student Feedback</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Encrypted student inquiries requiring moderation</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-blue-600">
                <Link href="/admin/feedback">
                  Moderate Feedback
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentFeedbacks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">No recent feedback records.</div>
              ) : (
                recentFeedbacks.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{f.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          f.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : f.status === 'UNDER_REVIEW'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.status}
                        </span>
                        {f.is_anonymous && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700 font-medium">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{f.category}</span>
                        <span>•</span>
                        <span>Submitted {formatDate(f.created_at)}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs flex-shrink-0">
                      <Link href="/admin/feedback">Review</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Stream */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-900">Security Audit Trail</CardTitle>
                <ShieldAlert className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time log of administrative and auth events</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="truncate max-w-[160px]">{log.actor_email || 'System'}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-mono text-[9px]">
                      {log.entity_type}
                    </span>
                  </div>
                </div>
              ))}

              <Button asChild variant="outline" size="sm" className="w-full text-xs mt-2 border-slate-200">
                <Link href="/admin/audit-logs">
                  View Full Audit Log
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
