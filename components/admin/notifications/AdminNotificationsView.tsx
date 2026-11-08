'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  createBroadcastNotificationAction,
  deleteNotificationAction,
  sendSurveyRemindersAction,
} from '@/app/actions/notifications';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Calendar,
  History,
  Radio,
} from 'lucide-react';
import { NotificationType, SystemNotification, UserRole, Survey } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';

interface AdminNotificationsViewProps {
  initialTab?: 'compose' | 'reminders' | 'manage';
}

export function AdminNotificationsView({ initialTab = 'compose' }: AdminNotificationsViewProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const resolvedInitialTab =
    tabParam === 'history' || tabParam === 'manage'
      ? 'manage'
      : tabParam === 'reminders'
      ? 'reminders'
      : tabParam === 'compose' || tabParam === 'send'
      ? 'compose'
      : initialTab;

  const [activeTab, setActiveTab] = useState(resolvedInitialTab);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole | 'ALL'>('ALL');
  const [type, setType] = useState<NotificationType>('SURVEY_INVITE');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active surveys for reminders
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  // Manage notifications list
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (tabParam === 'history' || tabParam === 'manage') {
      setActiveTab('manage');
    } else if (tabParam === 'compose' || tabParam === 'send') {
      setActiveTab('compose');
    } else if (tabParam === 'reminders') {
      setActiveTab('reminders');
    }
  }, [tabParam]);

  function loadData() {
    fetch('/api/admin/surveys')
      .then((res) => res.json())
      .then((data) => setSurveys(data.surveys || []))
      .catch((err) => console.error(err));

    setLoadingNotifs(true);
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => console.error(err))
      .finally(() => setLoadingNotifs(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await createBroadcastNotificationAction({
        title,
        message,
        targetRole,
        type,
        link: link.trim() || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess('Notification dispatched successfully to targeted recipients!');
        setTitle('');
        setMessage('');
        setLink('');
        loadData();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch broadcast.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReminder(surveyId: string) {
    setSendingReminderId(surveyId);
    setError(null);
    setSuccess(null);

    try {
      const res = await sendSurveyRemindersAction(surveyId);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(`Automated survey deadline reminder dispatched to ${res.count} audience groups!`);
        loadData();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reminders.');
    } finally {
      setSendingReminderId(null);
    }
  }

  async function handleDeleteNotification(id: string) {
    const res = await deleteNotificationAction(id);
    if (res?.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }

  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification & Reminder Center</h1>
        <p className="text-xs text-slate-500">
          Dispatch announcements, survey alerts, and inspect sent notification history across the institution.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="text-[11px] underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'compose' | 'reminders' | 'manage')}
        className="space-y-6"
      >
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="compose" className="text-xs gap-1.5 font-semibold">
            <Send className="h-4 w-4 text-[#4682A9]" />
            <span>Send Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="text-xs gap-1.5 font-semibold">
            <History className="h-4 w-4 text-[#4682A9]" />
            <span>Notification History ({notifications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs gap-1.5 font-semibold">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Deadline Reminders ({activeSurveys.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Send Notifications */}
        <TabsContent value="compose">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-6">
              <CardTitle className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Send className="h-4 w-4 text-[#4682A9]" />
                <span>Send Departmental Notification</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Alert Title *</Label>
                  <Input
                    required
                    placeholder="e.g., Mandatory Course Evaluation Deadline Approaching"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Recipient Audience</Label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value as any)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="ALL">All Users (Campus-Wide)</option>
                      <option value="STUDENT">Students Only</option>
                      <option value="ADMINISTRATOR">Administrators Only</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Notification Category</Label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as NotificationType)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="SURVEY_INVITE">Survey Invitation</option>
                      <option value="DEADLINE_REMINDER">Deadline Reminder</option>
                      <option value="SYSTEM_ALERT">System Alert</option>
                      <option value="FEEDBACK_UPDATE">Feedback Status Notice</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Message Content *</Label>
                  <Textarea
                    rows={4}
                    required
                    placeholder="Explain the alert or reminder clearly to users..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Destination Link (Optional)</Label>
                  <Input
                    placeholder="e.g. /surveys or /feedback"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold h-10 shadow-xs cursor-pointer"
                >
                  {loading ? (
                    'Dispatching...'
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5" />
                      Send Notification
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Notification History */}
        <TabsContent value="manage" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Sent Notification History</h2>
            <Button type="button" variant="outline" size="sm" onClick={loadData} className="text-xs">
              Refresh History
            </Button>
          </div>

          {loadingNotifs ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading notification history...</div>
          ) : notifications.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-10 text-center text-xs text-slate-400">
                No notifications recorded in history yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs shadow-2xs hover:border-[#85B5D2] transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF2F8] text-[#2C5E7D] uppercase">
                        {n.type.replace('_', ' ')}
                      </span>
                      {n.target_role ? (
                        <span className="text-[10px] text-blue-600 font-semibold">
                          Target: {n.target_role}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Campus-Wide</span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        • {formatDate(n.created_at)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 truncate">{n.title}</h4>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                    {n.link && (
                      <p className="text-[10px] text-[#4682A9] font-mono underline">{n.link}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNotification(n.id)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex-shrink-0 cursor-pointer"
                    title="Delete from History"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Survey Deadline Reminders */}
        <TabsContent value="reminders" className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Automated Deadline Reminders</span>
              <p className="text-[11px] text-amber-800">
                Send an instant survey reminder notification to all targeted cohort roles for active surveys approaching their scheduled close date.
              </p>
            </div>
          </div>

          {activeSurveys.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-10 text-center text-xs text-slate-400">
                No active surveys currently available to send reminders for.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeSurveys.map((survey) => (
                <Card key={survey.id} className="border-slate-200">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                          {survey.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Target Roles: {survey.target_roles.join(', ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{survey.title}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Closing Deadline: <strong>{formatDate(survey.end_date)}</strong></span>
                        <span>•</span>
                        <span>{survey.responses_count} Submissions</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSendReminder(survey.id)}
                      disabled={sendingReminderId === survey.id}
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs flex-shrink-0 cursor-pointer"
                    >
                      {sendingReminderId === survey.id ? (
                        'Dispatching...'
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Bell className="h-3.5 w-3.5" />
                          Send Survey Reminder
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

