'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShieldAlert, Search, Eye, Filter, Code } from 'lucide-react';
import { AuditLog } from '@/lib/types/database';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.actor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Security & Audit Stream</h1>
          <p className="text-xs text-slate-500">
            Immutable tracking of user authentication, survey lifecycle events, role changes, and administrative actions.
          </p>
        </div>
      </div>

      {/* Search & Action Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by actor email, action, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs bg-white w-full"
          />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="flex h-10 rounded-md border border-input bg-white px-3 py-2 text-xs text-slate-700 w-full sm:w-56"
        >
          <option value="ALL">All Event Types</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="SURVEY_CREATED">SURVEY_CREATED</option>
          <option value="SURVEY_SUBMITTED">SURVEY_SUBMITTED</option>
          <option value="SURVEY_STATUS_CHANGED">SURVEY_STATUS_CHANGED</option>
          <option value="FEEDBACK_SUBMITTED">FEEDBACK_SUBMITTED</option>
          <option value="USER_ROLE_CHANGED">USER_ROLE_CHANGED</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-4">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity Type</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading audit stream...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {log.actor_email}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-800 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{log.entity_type}</td>
                    <td className="p-3.5 font-mono text-slate-500">{log.ip_address || '127.0.0.1'}</td>
                    <td className="p-3.5 pr-4 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                        className="h-7 text-xs px-2 text-blue-600 hover:bg-blue-50"
                      >
                        <Code className="h-3.5 w-3.5 mr-1" /> JSON
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Detail Inspector Modal */}
      {selectedLog && (
        <Dialog open={Boolean(selectedLog)} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-blue-600" />
                <span>Audit Event Payload: {selectedLog.action}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="text-xs text-slate-500 space-y-1">
                <div>Actor: <strong className="text-slate-800">{selectedLog.actor_email}</strong></div>
                <div>Entity: <strong className="text-slate-800">{selectedLog.entity_type}</strong> (ID: {selectedLog.entity_id || 'N/A'})</div>
                <div>Timestamp: <strong className="text-slate-800">{formatDateTime(selectedLog.created_at)}</strong></div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Metadata JSON
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-56">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

