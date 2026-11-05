'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createBroadcastNotificationAction } from '@/app/actions/notifications';
import { Bell, Send, CheckCircle2, AlertCircle, Radio } from 'lucide-react';
import { NotificationType, UserRole } from '@/lib/types/database';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<UserRole | 'ALL'>('ALL');
  const [type, setType] = useState<NotificationType>('SURVEY_INVITE');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

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
        setSuccess(true);
        setTitle('');
        setMessage('');
        setLink('');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch broadcast.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification & Reminder Dispatcher</h1>
        <p className="text-xs text-slate-500">
          Broadcast departmental alerts, survey deadlines, and system announcements to targeted roles.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>Broadcast dispatched successfully to targeted recipients!</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
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

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Radio className="h-4 w-4 text-blue-600" />
            <span>Compose Institutional Broadcast</span>
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
                  <option value="IT_PROFESSOR">IT Professors Only</option>
                  <option value="IT_OFFICER">IT Officers Only</option>
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-10"
            >
              {loading ? (
                'Dispatching...'
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Send Institutional Broadcast
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

