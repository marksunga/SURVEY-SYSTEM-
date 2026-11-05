'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, ArrowRight, Clock, AlertTriangle, Info, CheckCheck } from 'lucide-react';
import { markNotificationReadAction } from '@/app/actions/notifications';
import { SystemNotification } from '@/lib/types/database';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkRead(id: string) {
    await markNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function handleMarkAllRead() {
    const unread = notifications.filter((n) => !n.is_read);
    for (const n of unread) {
      await markNotificationReadAction(n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500">
            Survey invites, deadline reminders, and feedback review notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading alerts...</div>
      ) : notifications.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center space-y-3">
            <Bell className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400">You are all caught up on departmental updates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isInvite = n.type === 'SURVEY_INVITE';
            const isReminder = n.type === 'DEADLINE_REMINDER';

            return (
              <Card
                key={n.id}
                className={`border-slate-200 transition-colors ${
                  !n.is_read ? 'bg-blue-50/40 border-blue-200' : 'bg-white'
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        isInvite
                          ? 'bg-blue-100 text-blue-700'
                          : isReminder
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isInvite ? (
                        <Bell className="h-4 w-4" />
                      ) : isReminder ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 inline-block" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                        {n.link && (
                          <Link
                            href={n.link}
                            className="inline-flex items-center text-blue-600 font-semibold hover:underline"
                          >
                            Open Link <ArrowRight className="h-3 w-3 ml-0.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {!n.is_read && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-slate-400 hover:text-slate-700 h-8 px-2 flex-shrink-0"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

