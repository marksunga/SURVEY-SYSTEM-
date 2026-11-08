'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ShieldAlert,
  Search,
  Code,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  Layers,
  FileText,
} from 'lucide-react';
import { AuditLog } from '@/lib/types/database';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  function loadLogs() {
    setLoading(true);
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => setLogs(data.logs || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.actor_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ip_address && log.ip_address.includes(searchTerm));
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    return matchesSearch && matchesAction;
  });

  // Action badge color mapping
  function getActionBadgeClass(action: string) {
    if (action.includes('LOGIN')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('SURVEY')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('FEEDBACK')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (action.includes('SECURITY') || action.includes('DENIED') || action.includes('BLOCKED'))
      return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('ROLE')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#2C5E7D] text-xs font-semibold border border-[#D1E3EC]">
            <ShieldAlert className="h-3.5 w-3.5 text-[#4682A9]" />
            <span>Immutable Security Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
            Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Tamper-resistant tracking of administrator and student authentication, survey lifecycle events,
            feedback submissions, and departmental access attempts.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadLogs}
          disabled={loading}
          className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-[#F3F5F7] min-h-[38px] cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-[#4682A9] ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Stream
        </Button>
      </div>

      {/* Search & Action Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by actor email, action, entity type, or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs bg-white border-slate-200 rounded-lg w-full h-10 shadow-xs focus-visible:ring-[#4682A9]"
          />
        </div>

        <div className="w-full sm:w-64 flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:block flex-shrink-0" />
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4682A9] cursor-pointer"
          >
            <option value="ALL">All Event Types ({logs.length})</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
            <option value="SURVEY_CREATED">SURVEY_CREATED</option>
            <option value="SURVEY_SUBMITTED">SURVEY_SUBMITTED</option>
            <option value="SURVEY_STATUS_CHANGED">SURVEY_STATUS_CHANGED</option>
            <option value="FEEDBACK_SUBMITTED">FEEDBACK_SUBMITTED</option>
            <option value="FEEDBACK_STATUS_UPDATED">FEEDBACK_STATUS_UPDATED</option>
            <option value="QR_CODE_GENERATED">QR_CODE_GENERATED</option>
            <option value="NOTIFICATION_SENT">NOTIFICATION_SENT</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity Type</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 pr-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-xs">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#4682A9]" />
                    <span>Loading verified audit stream...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-xs">
                    No audit records matching query or filter.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-mono text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="p-3.5 font-semibold text-[#0F172A]">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{log.actor_email}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${getActionBadgeClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-slate-400" />
                        <span>{log.entity_type}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 text-xs px-2.5 text-[#2C5E7D] hover:bg-[#EAF2F8] hover:text-[#154675] cursor-pointer"
                        title="View Event Details"
                      >
                        <Code className="h-3.5 w-3.5 mr-1 text-[#4682A9]" />
                        <span>Inspect</span>
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
              <DialogTitle className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#4682A9]" />
                <span>Audit Event Payload: {selectedLog.action}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Actor Email:</span>
                  <strong className="text-[#0F172A]">{selectedLog.actor_email}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entity:</span>
                  <span className="font-medium text-slate-700">
                    {selectedLog.entity_type} ({selectedLog.entity_id || 'N/A'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="font-mono text-slate-700">
                    {formatDateTime(selectedLog.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IP Address:</span>
                  <span className="font-mono text-slate-700">
                    {selectedLog.ip_address || '127.0.0.1'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Metadata JSON Payload
                </div>
                <pre className="p-3 rounded-lg bg-[#0F172A] text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed">
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
