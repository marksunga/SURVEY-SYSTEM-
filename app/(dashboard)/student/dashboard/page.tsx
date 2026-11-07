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
  Bell,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  const notifications = MockAdapter.getNotifications(user.id, 'STUDENT');
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  // Submissions comparison
  const submittedSurveyIds = new Set(completedSurveyIds);
  const pendingSurveys = activeSurveys.filter((s) => !submittedSurveyIds.has(s.id));
  const completedSurveysCount = completedSurveyIds.length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            <span>Student Academic Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
            Your voice directly influences IT curriculum pacing, laboratory hardware upgrades, and student support services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="bg-white text-blue-700 hover:bg-blue-50 text-xs font-semibold shadow-sm min-h-[38px]">
            <Link href="/scan">
              <QrCode className="h-4 w-4 mr-1.5 text-blue-600" />
              Scan Survey QR
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 text-xs min-h-[38px]">
            <Link href="/feedback">
              <MessageSquarePlus className="h-4 w-4 mr-1.5" />
              Submit Feedback
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

      {/* Main Student Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Surveys to Take */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-slate-900">Currently Active Surveys</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Live evaluations currently accepting student responses.</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-blue-600">
                <Link href="/surveys">
                  View All ({activeSurveys.length})
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingSurveys.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">You are completely up to date!</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    You have answered all currently active department surveys. Check back soon for new evaluations.
                  </p>
                </div>
              ) : (
                pendingSurveys.map((survey) => (
                  <div
                    key={survey.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
                          {survey.category.replace('_', ' ')}
                        </span>
                        {survey.is_anonymous_allowed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" />
                            Anonymous Allowed
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 leading-snug">{survey.title}</h2>
                      <p className="text-xs text-slate-500 line-clamp-2">{survey.description}</p>
                      <div className="text-[11px] text-slate-400 pt-0.5">
                        {survey.questions_count} questions • {survey.responses_count} submitted • Deadline: {formatDate(survey.end_date)}
                      </div>
                    </div>

                    <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs flex-shrink-0 min-h-[38px] w-full sm:w-auto">
                      <Link href={`/surveys/${survey.id}`}>
                        Take Survey
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Student's Feedback Inquiries */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base text-slate-900">Your Recent Feedback Submissions</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Track administrator review notes and resolution status</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-blue-600">
                <Link href="/feedback">
                  Manage Feedback
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {userFeedbacks.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  You have not submitted any feedback yet.{' '}
                  <Link href="/feedback" className="text-blue-600 hover:underline">
                    Submit one now.
                  </Link>
                </div>
              ) : (
                userFeedbacks.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{f.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            f.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : f.status === 'UNDER_REVIEW'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {f.category} • Submitted {formatDate(f.created_at)}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs flex-shrink-0">
                      <Link href="/feedback">View Details</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Hub */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900">Student Navigation Hub</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to student portal tools</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/scan"
                className="p-3 rounded-lg border border-slate-100 hover:bg-blue-50/60 hover:border-blue-200 flex items-center justify-between text-xs text-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Scan Survey QR Code</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/surveys/history"
                className="p-3 rounded-lg border border-slate-100 hover:bg-emerald-50/60 hover:border-emerald-200 flex items-center justify-between text-xs text-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">My Submission History</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600" />
              </Link>

              <Link
                href="/feedback"
                className="p-3 rounded-lg border border-slate-100 hover:bg-purple-50/60 hover:border-purple-200 flex items-center justify-between text-xs text-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <MessageSquarePlus className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Submit Anonymous Feedback</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-600" />
              </Link>

              <Link
                href="/profile"
                className="p-3 rounded-lg border border-slate-100 hover:bg-slate-100 flex items-center justify-between text-xs text-slate-800 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">My Profile & Security</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900" />
              </Link>
            </CardContent>
          </Card>

          {/* Department Announcements / Notifications */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-slate-900">Notifications</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Announcements & survey alerts</p>
              </div>
              <Bell className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.title}</span>
                    {!item.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{item.message}</p>
                  {item.link && (
                    <Link href={item.link} className="inline-block text-[11px] text-blue-600 hover:underline pt-1 font-medium">
                      Open Survey →
                    </Link>
                  )}
                </div>
              ))}

              <Button asChild variant="outline" size="sm" className="w-full text-xs mt-2 border-slate-200">
                <Link href="/notifications">
                  View All Notifications ({unreadNotifications.length} unread)
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
