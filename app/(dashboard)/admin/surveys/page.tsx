'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { updateSurveyStatusAction, deleteSurveyAction } from '@/app/actions/surveys';
import { Survey, SurveyStatus } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
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

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete the survey "${title}"? All responses and questions will be permanently removed.`)) {
      return;
    }
    const res = await deleteSurveyAction(id);
    if (res?.success) {
      setSurveys((prev) => prev.filter((s) => s.id !== id));
    }
  }

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

        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
          <Link href="/admin/surveys/create">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create New Survey
          </Link>
        </Button>
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
              ) : surveys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No surveys created yet.
                  </td>
                </tr>
              ) : (
                surveys.map((s) => (
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
                      <div className="text-[11px]">Ends: {formatDate(s.end_date)}</div>
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
                          onClick={() => handleDelete(s.id, s.title)}
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
    </div>
  );
}

