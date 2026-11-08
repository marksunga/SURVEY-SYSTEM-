'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Check,
  ArrowRight,
  Clock,
  AlertTriangle,
  Info,
  CheckCheck,
  Trash2,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { markNotificationReadAction, deleteNotificationAction } from '@/app/actions/notifications';
import { SystemNotification } from '@/lib/types/database';
import { formatDateTime } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
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

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const res = await deleteNotificationAction(id);
    if (res?.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }

  async function handleNotificationClick(n: SystemNotification) {
    if (!n.is_read) {
      handleMarkRead(n.id);
    }
    if (n.link) {
      router.push(n.link);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500">
            Survey invitations, active deadlines, and institutional announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs cursor-pointer min-h-[36px]"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400 space-y-2">
          <div className="h-6 w-6 rounded-full border-2 border-[#4682A9] border-t-transparent animate-spin mx-auto" />
          <p>Loading alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center space-y-3">
            <Bell className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400">
              You are all caught up on departmental updates and surveys.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isInvite = n.type === 'SURVEY_INVITE';
            const isReminder = n.type === 'DEADLINE_REMINDER';
            const isSurveyLink = n.link && n.link.startsWith('/surveys');

            return (
              <Card
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`border transition-all cursor-pointer group ${
                  !n.is_read
                    ? 'bg-blue-50/40 border-blue-200 hover:border-[#4682A9] hover:shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${
                        isInvite
                          ? 'bg-[#EAF2F8] text-[#2C5E7D]'
                          : isReminder
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isInvite ? (
                        <ClipboardList className="h-5 w-5" />
                      ) : isReminder ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Info className="h-5 w-5" />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {n.type.replace('_', ' ')}
                        </span>
                        {!n.is_read && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            New
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {formatDateTime(n.created_at)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#4682A9] transition-colors leading-snug">
                        {n.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                      {/* Interactive Survey Navigation CTA */}
                      {n.link && (
                        <div className="pt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4682A9] group-hover:translate-x-0.5 transition-transform">
                            {isSurveyLink ? 'Take Survey' : 'View Details'}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-1 sm:self-start flex-shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {!n.is_read && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(n.id);
                        }}
                        className="text-xs text-[#4682A9] hover:text-[#386B8C] hover:bg-blue-50 h-8 px-2.5 cursor-pointer min-h-[36px]"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Mark Read</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, n.id)}
                      className="text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 cursor-pointer min-h-[36px] min-w-[36px]"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
