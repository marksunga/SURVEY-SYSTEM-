import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  QrCode,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Fetch surveys targeting user's role
  const allSurveys = MockAdapter.getSurveys(user.role_id);
  const completedSurveyIds = MockAdapter.getUserCompletedSurveyIds(user.id);

  const availableSurveys = allSurveys.filter(
    (s) => s.status === 'ACTIVE' && !completedSurveyIds.includes(s.id)
  );
  const completedSurveys = allSurveys.filter((s) => completedSurveyIds.includes(s.id));
  const pendingCount = availableSurveys.length;

  const notifications = MockAdapter.getNotifications(user.id, user.role_id).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/30">
            <Sparkles className="h-3 w-3" />
            <span>IT Department Student & Faculty Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Your voice drives excellence. Complete active departmental evaluations, provide encrypted feedback,
            and view verified submission receipts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs shadow-sm">
            <Link href="/surveys">
              <ClipboardList className="h-4 w-4 mr-1.5" />
              View Active Surveys ({availableSurveys.length})
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs">
            <Link href="/scan">
              <QrCode className="h-4 w-4 mr-1.5 text-blue-400" />
              Scan QR
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Surveys"
          value={availableSurveys.length}
          subtitle="Open for your participation"
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Pending Action"
          value={pendingCount}
          subtitle="Awaiting your response"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Completed Surveys"
          value={completedSurveys.length}
          subtitle="Receipts cryptographically verified"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Recent Alerts"
          value={notifications.length}
          subtitle="Department notifications"
          icon={Bell}
          color="indigo"
        />
      </div>

      {/* Two Column Layout: Surveys and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Available Surveys */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Urgent & Active Surveys</h2>
              <p className="text-xs text-slate-500">Evaluations currently accepting responses.</p>
            </div>
            <Link href="/surveys" className="text-xs font-semibold text-blue-600 hover:underline">
              Browse All →
            </Link>
          </div>

          {availableSurveys.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">You&apos;re All Caught Up!</p>
                <p className="text-xs text-slate-500">
                  No pending surveys require your attention at this moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {availableSurveys.map((survey) => (
                <Card key={survey.id} className="border-slate-200 hover:border-blue-400 transition-all">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                          {survey.category.replace('_', ' ')}
                        </span>
                        {survey.is_anonymous_allowed && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" /> Anonymous Allowed
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{survey.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{survey.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Ends: {formatDate(survey.end_date)}
                        </span>
                        <span>•</span>
                        <span>{survey.questions_count} questions</span>
                      </div>
                    </div>

                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs flex-shrink-0">
                      <Link href={`/surveys/${survey.id}`}>
                        Take Survey
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Completed Surveys Quick List */}
          {completedSurveys.length > 0 && (
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Your Survey History</h3>
                <Link href="/surveys/history" className="text-xs font-semibold text-blue-600 hover:underline">
                  Full History ({completedSurveys.length}) →
                </Link>
              </div>
              <div className="space-y-2">
                {completedSurveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-800">{survey.title}</div>
                        <div className="text-[10px] text-slate-400">Response submitted & recorded</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Notifications & Quick Feedback */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <span>Department Alerts</span>
              </CardTitle>
              <Link href="/notifications" className="text-xs text-blue-600 hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No recent notifications</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border text-xs space-y-1 transition-colors ${
                      !n.is_read ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(n.created_at)}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline pt-0.5"
                      >
                        Open Survey <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Feedback Card */}
          <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50/50">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Confidential Feedback</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Have an urgent facility complaint or laboratory recommendation? Submit direct encrypted feedback.
              </p>
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs">
                <Link href="/feedback">Submit Feedback Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

