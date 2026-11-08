import { Suspense } from 'react';
import { AdminNotificationsView } from '@/components/admin/notifications/AdminNotificationsView';

export default function AdminNotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">Loading notifications center...</div>
      }
    >
      <AdminNotificationsView initialTab="compose" />
    </Suspense>
  );
}
