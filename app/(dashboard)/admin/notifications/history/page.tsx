import { Suspense } from 'react';
import { AdminNotificationsView } from '@/components/admin/notifications/AdminNotificationsView';

export default function AdminNotificationHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">Loading notification history...</div>
      }
    >
      <AdminNotificationsView initialTab="manage" />
    </Suspense>
  );
}
