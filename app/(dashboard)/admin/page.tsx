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
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const admin = await requireRole(['ADMINISTRATOR', 'IT_OFFICER']);

  const profiles = MockAdapter.getProfiles();
  const surveys = MockAdapter.getSurveys();
  const feedbacks = MockAdapter.getFeedbacks();
  const auditLogs = MockAdapter.getAuditLogs().slice(0, 6);

  const totalUsers = profiles.length;
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE').length;
  const expiredSurveys = surveys.filter((s) => s.status === 'EXPIRED').length;
  const totalSubmissions = surveys.reduce((acc, s) => acc + (s.responses_count || 0), 0);
  const pendingFeedback = feedbacks.filter((f) => f.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/30">
            <Sparkles className="h-3 w-3" />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            IT Department System Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor real-time survey participation, evaluate encrypted student feedback, manage role access,
            and audit all institutional changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs shadow-sm">
            <Link href="/admin/surveys/create">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create New Survey
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs">
            <Link href="/admin/reports">
              <BarChart3 className="h-4 w-4 mr-1.5 text-blue-400" />
              Generate Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Users"
          value={totalUsers}
          subtitle="Students, Faculty & Staff"
          icon={Users}
          color="indigo"
          trend={{ value: "+12%", isPositive: true }}
        />
        <StatCard
          title="Active Surveys"
          value={activeSurveys}
          subtitle={`${totalSurveys} total department surveys`}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          subtitle="Responses collected to date"
          icon={CheckCircle2}
          color="emerald"
          trend={{ value: "+28%", isPositive: true }}
        />
        <StatCard
          title="Pending Feedback"
          value={pendingFeedback}
          subtitle={`${feedbacks.length} total messages`}
          icon={MessageSquare}
          color="amber"
        />
      </div>

      {/* Main Grid: Surveys & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Surveys Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Department Surveys</h2>
              <p className="text-xs text-slate-500">Live surveys accepting student/faculty responses.</p>
            </div>
            <Link href="/admin/surveys" className="text-xs font-semibold text-blue-600 hover:underline">
              Manage All ({totalSurveys}) →
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5 pl-4">Survey Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Responses</th>
                    <th className="p-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {surveys.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 pl-4 font-semibold text-slate-900 max-w-xs truncate">
                        {s.title}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {s.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            s.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : s.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-700">
                        {s.responses_count}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2">
                            <Link href={`/admin/surveys/${s.id}/results`}>
                              Analytics
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
                            <Link href={`/admin/surveys/${s.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Security Audit Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Recent Audit Logs</span>
            </h2>
            <Link href="/admin/audit-logs" className="text-xs text-blue-600 hover:underline">
              View Log Stream
            </Link>
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800 uppercase tracking-wider">
                      {log.action.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400">{formatDateTime(log.created_at)}</span>
                  </div>
                  <div className="text-slate-600 truncate">{log.actor_email}</div>
                  <div className="text-[10px] text-slate-400">
                    Entity: {log.entity_type} {log.ip_address && `• IP: ${log.ip_address}`}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

