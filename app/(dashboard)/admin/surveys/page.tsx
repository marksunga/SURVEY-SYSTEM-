'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ClipboardList,
  PlusCircle,
  BarChart3,
  Edit,
  Trash2,
  QrCode,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { updateSurveyStatusAction, deleteSurveyAction } from '@/app/actions/surveys';
import { Survey, SurveyStatus } from '@/lib/types/database';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/surveys')
      .then((res) => res.json())
      .then((data) => setSurveys(data.surveys || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, newStatus: SurveyStatus) {
    const res = await updateSurveyStatusAction(id, newStatus);
    if (res?.success) {
      setSurveys((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    }
  }

  async function handleConfirmDelete() {
    if (!surveyToDelete) return;
    setDeleting(true);
    const res = await deleteSurveyAction(surveyToDelete.id);
    if (res?.success) {
      setSurveys((prev) => prev.filter((s) => s.id !== surveyToDelete.id));
      setSurveyToDelete(null);
    }
    setDeleting(false);
  }

  const filteredSurveys = surveys.filter((s) => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department Survey Management</h1>
          <p className="text-xs text-slate-500">
            Create, schedule, activate, and monitor institutional evaluations and student surveys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-white px-3 py-1.5 text-xs text-slate-700 font-medium"
          >
            <option value="ALL">All Statuses ({surveys.length})</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EXPIRED">Expired</option>
            <option value="CLOSED">Closed</option>
            <option value="DRAFT">Draft</option>
          </select>

          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
            <Link href="/admin/surveys/create">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Create New Survey
            </Link>
          </Button>
        </div>
      </div>

      {/* Surveys Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-4">Survey Details</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Schedule / Deadline</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Submissions</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading surveys...
                  </td>
                </tr>
              ) : filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No surveys found matching the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-4 max-w-sm">
                      <div className="font-semibold text-slate-900 leading-snug">{s.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{s.description}</div>
                      <div className="text-[10px] text-slate-400 pt-0.5">
                        Target: {s.target_roles.join(', ')} • {s.questions_count} questions
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {s.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 space-y-0.5">
                      <div className="text-[11px] font-medium text-slate-800">Due: {formatDateTime(s.end_date)}</div>
                      <div className="text-[10px] text-slate-400">Created: {formatDate(s.created_at)}</div>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.id, e.target.value as SurveyStatus)}
                        className="h-8 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="EXPIRED">EXPIRED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>

                    <td className="p-3.5 font-bold text-slate-800">
                      {s.responses_count}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2" title="Analytics & Charts">
                          <Link href={`/admin/surveys/${s.id}/results`}>
                            <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                          </Link>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2" title="QR Code View">
                          <Link href={`/surveys/${s.id}/qr`}>
                            <QrCode className="h-3.5 w-3.5 text-slate-600" />
                          </Link>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="h-7 text-xs px-2" title="Edit Survey">
                          <Link href={`/admin/surveys/${s.id}/edit`}>
                            <Edit className="h-3.5 w-3.5 text-slate-600" />
                          </Link>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSurveyToDelete(s)}
                          className="h-7 text-xs px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Survey"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessible Confirmation Dialog for Deleting Survey */}
      <Dialog open={Boolean(surveyToDelete)} onOpenChange={(open) => !open && setSurveyToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Confirm Survey Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-slate-600">
            <p>
              Are you sure you want to delete the survey{' '}
              <strong className="text-slate-900">&quot;{surveyToDelete?.title}&quot;</strong>?
            </p>
            <p className="text-rose-600 font-medium">
              This will permanently delete all associated questions, answers, QR code records, and analytics. This operation cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => setSurveyToDelete(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              {deleting ? 'Deleting...' : 'Delete Survey Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

