import { Suspense } from 'react';
import { AdminNotificationsView } from '@/components/admin/notifications/AdminNotificationsView';

export default function AdminSendNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">Loading notification dispatcher...</div>
      }
    >
      <AdminNotificationsView initialTab="compose" />
    </Suspense>
  );
}

