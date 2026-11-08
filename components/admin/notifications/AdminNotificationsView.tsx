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
  GraduationCap,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';
import { NotificationType, SystemNotification, Survey } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';

interface AdminNotificationsViewProps {
  initialTab?: 'compose' | 'manage';
}

export function AdminNotificationsView({ initialTab = 'compose' }: AdminNotificationsViewProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const resolvedInitialTab =
    tabParam === 'history' || tabParam === 'manage'
      ? 'manage'
      : initialTab;

  const [activeTab, setActiveTab] = useState<'compose' | 'manage'>(resolvedInitialTab);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('SURVEY_INVITE');
  const [link, setLink] = useState('');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active surveys for auto-population and quick linking
  const [surveys, setSurveys] = useState<Survey[]>([]);

  // Manage notifications list
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    if (tabParam === 'history' || tabParam === 'manage') {
      setActiveTab('manage');
    } else if (tabParam === 'compose' || tabParam === 'send') {
      setActiveTab('compose');
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

  function handleSurveySelect(surveyId: string) {
    setSelectedSurveyId(surveyId);
    if (!surveyId) return;

    const survey = surveys.find((s) => s.id === surveyId);
    if (survey) {
      if (type === 'DEADLINE_REMINDER') {
        setTitle(`Deadline Reminder: ${survey.title}`);
        setMessage(
          `Reminder: The survey "${survey.title}" will close on ${new Date(
            survey.end_date
          ).toLocaleDateString()}. Please submit your evaluation before the deadline.`
        );
      } else {
        setTitle(`New Survey: ${survey.title}`);
        setMessage(
          `A new survey "${survey.title}" is now open for your response. Please participate and share your valuable feedback.`
        );
      }
      setLink(`/surveys/${survey.id}`);
    }
  }

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
        title: title.trim(),
        message: message.trim(),
        targetRole: 'STUDENT',
        type,
        link: link.trim() || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess('Notification dispatched successfully to all enrolled students!');
        setTitle('');
        setMessage('');
        setLink('');
        setSelectedSurveyId('');
        loadData();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch notification.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteNotification(id: string) {
    const res = await deleteNotificationAction(id);
    if (res?.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }

  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE');

  const filteredHistory = notifications.filter((n) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      n.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
        <p className="text-xs text-slate-500">
          Dispatch student announcements, survey invitations, and review complete sent notification history.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="text-[11px] underline font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as 'compose' | 'manage')}
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
        </TabsList>

        {/* Tab 1: Send Notifications */}
        <TabsContent value="compose">
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-6">
              <CardTitle className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Send className="h-4 w-4 text-[#4682A9]" />
                <span>Send Student Notification</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipient Audience - Strictly Students */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Recipient Audience</Label>
                    <div className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-[#4682A9]" />
                        <span>Students</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Enrolled Students
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Notification Category</Label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const newType = e.target.value as NotificationType;
                        setType(newType);
                        if (selectedSurveyId) {
                          handleSurveySelect(selectedSurveyId);
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="SURVEY_INVITE">Survey Invitation</option>
                      <option value="DEADLINE_REMINDER">Deadline Reminder</option>
                      <option value="SYSTEM_ALERT">System Alert</option>
                      <option value="FEEDBACK_UPDATE">Feedback Notice</option>
                    </select>
                  </div>
                </div>

                {/* Optional Survey Quick Link for Invites & Reminders */}
                {(type === 'SURVEY_INVITE' || type === 'DEADLINE_REMINDER') && activeSurveys.length > 0 && (
                  <div className="p-3.5 rounded-lg bg-[#EAF2F8]/60 border border-[#D1E3EC] space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#4682A9]" />
                        <span>Link to Active Survey</span>
                      </Label>
                      <span className="text-[10px] text-slate-500 font-medium">Auto-populates title & URL</span>
                    </div>
                    <select
                      value={selectedSurveyId}
                      onChange={(e) => handleSurveySelect(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-xs text-slate-800 font-medium"
                    >
                      <option value="">-- Choose an Active Survey to Link --</option>
                      {activeSurveys.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} (Closes: {new Date(s.end_date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Alert Title *</Label>
                  <Input
                    required
                    placeholder="e.g., Mid-Term IT Course Evaluation Open"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Message Content *</Label>
                  <Textarea
                    rows={4}
                    required
                    placeholder="Explain the alert or survey invitation clearly to students..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Destination Survey Link (Optional)</Label>
                  <Input
                    placeholder="e.g., /surveys or /surveys/uuid"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    When students tap this notification, they will be navigated directly to this survey.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold h-10 shadow-xs cursor-pointer min-h-[44px]"
                >
                  {loading ? (
                    'Dispatching Notification...'
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5" />
                      Send Notification to Students
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Notification History (Only Notification History) */}
        <TabsContent value="manage" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Notification History</h2>
              <p className="text-xs text-slate-500">
                Log of all sent survey invitations, deadline reminders, and broadcasts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Filter history..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="h-8 pl-8 text-xs w-48 sm:w-56"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadData}
                className="text-xs min-h-[32px] cursor-pointer"
              >
                Refresh
              </Button>
            </div>
          </div>

          {loadingNotifs ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading notification history...</div>
          ) : filteredHistory.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-10 text-center text-xs text-slate-400 space-y-2">
                <Bell className="h-8 w-8 text-slate-300 mx-auto" />
                <p>No notifications recorded in history.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {filteredHistory.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4 text-xs shadow-2xs hover:border-[#85B5D2] transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF2F8] text-[#2C5E7D] uppercase">
                        {n.type.replace('_', ' ')}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        <GraduationCap className="h-3 w-3" />
                        Students
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {formatDate(n.created_at)}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{n.title}</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">{n.message}</p>

                    {n.link && (
                      <div className="pt-1">
                        <span className="text-[11px] font-mono text-[#4682A9] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          Target URL: {n.link}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNotification(n.id)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex-shrink-0 cursor-pointer min-h-[32px] min-w-[32px]"
                    title="Delete from History"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
