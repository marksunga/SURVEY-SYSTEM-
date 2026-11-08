'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MessageSquare,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  Trash2,
  UserX,
} from 'lucide-react';
import { updateFeedbackStatusAction, deleteFeedbackAction } from '@/app/actions/feedback';
import { Feedback, FeedbackStatus } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feedbackToDelete, setFeedbackToDelete] = useState<Feedback | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then((res) => res.json())
      .then((data) => setFeedbacks(data.feedbacks || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusUpdate(id: string, newStatus: FeedbackStatus) {
    setUpdating(true);
    const res = await updateFeedbackStatusAction(id, newStatus, adminNotes);
    if (res?.success) {
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: newStatus, admin_notes: adminNotes } : f))
      );
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus, admin_notes: adminNotes });
      }
    }
    setUpdating(false);
  }

  async function handleConfirmDeleteFeedback() {
    if (!feedbackToDelete) return;
    setDeleting(true);
    const res = await deleteFeedbackAction(feedbackToDelete.id);
    if (res?.success) {
      setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackToDelete.id));
      if (selectedFeedback?.id === feedbackToDelete.id) {
        setSelectedFeedback(null);
      }
      setFeedbackToDelete(null);
    }
    setDeleting(false);
  }

  const filtered = feedbacks.filter((f) => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback & Complaint Management</h1>
          <p className="text-xs text-slate-500">
            Review AES-256 encrypted messages, manage resolutions, and inspect anonymous student submissions.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-white px-3 py-1.5 text-xs text-slate-700 w-44"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 pl-4">Feedback Subject</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Submitter Identity</th>
                <th className="p-3.5">Security / Encryption</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading feedbacks...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    No feedback records found.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 pl-4 max-w-xs">
                      <div className="font-semibold text-slate-900 leading-snug">{f.title}</div>
                      <div className="text-[10px] text-slate-400">{formatDate(f.created_at)}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {f.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {f.is_anonymous ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                          <UserX className="h-3 w-3 text-slate-500" /> Anonymous Student
                        </span>
                      ) : (
                        <div>
                          <div className="font-semibold text-slate-800">{f.user_name || 'Enrolled Student'}</div>
                          <div className="text-[10px] text-slate-400">{f.user_email}</div>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200" title="Payload is cryptographically encrypted using AES-256-GCM">
                        <Lock className="h-3 w-3 text-emerald-600" /> AES-256-GCM Encrypted
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${f.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.status === 'UNDER_REVIEW'
                            ? 'bg-blue-100 text-blue-800'
                            : f.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                      >
                        {f.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFeedback(f);
                            setAdminNotes(f.admin_notes || '');
                          }}
                          className="h-7 text-xs px-2.5 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                          title="Decrypt ciphertext with server key and inspect feedback"
                        >
                          <Unlock className="h-3.5 w-3.5 mr-1 text-blue-600" />
                          Decrypt & Review
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFeedbackToDelete(f)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Feedback Record"
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

      {/* Decrypt & Review Dialog */}
      {selectedFeedback && (
        <Dialog open={Boolean(selectedFeedback)} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Unlock className="h-4 w-4 text-emerald-600" />
                <span>Decrypted Feedback Inspector</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Subject: <strong className="text-slate-900">{selectedFeedback.title}</strong></span>
                  <span className="text-[10px]">{formatDate(selectedFeedback.created_at)}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Category: <span className="font-semibold text-slate-700">{selectedFeedback.category}</span> •{' '}
                  Submitter: <span className="font-semibold text-slate-700">
                    {selectedFeedback.is_anonymous ? 'Anonymous User' : selectedFeedback.user_email}
                  </span>
                </div>
              </div>

              {/* Decrypted Payload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                  Decrypted Message Content (Plaintext):
                </Label>
                <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedFeedback.decrypted_content}
                </div>
              </div>

              {/* Administrative Resolution Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Administrative Notes / Action Taken:</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. Dispatched lab technician to inspect ethernet ports on Nov 4."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Status Update Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Change Status:</span>
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => handleStatusUpdate(selectedFeedback.id, e.target.value as FeedbackStatus)}
                    className="h-8 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedFeedback.id, selectedFeedback.status)}
                  disabled={updating}
                  className="bg-blue-600 text-white text-xs"
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirmation Dialog for Deleting Feedback */}
      <Dialog open={Boolean(feedbackToDelete)} onOpenChange={(open) => !open && setFeedbackToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Confirm Feedback Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-slate-600">
            <p>
              Are you sure you want to permanently delete feedback record{' '}
              <strong className="text-slate-900">&quot;{feedbackToDelete?.title}&quot;</strong>?
            </p>
            <p className="text-rose-600 font-medium">
              This will permanently delete the encrypted message and any administrative notes. This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => setFeedbackToDelete(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleting}
              onClick={handleConfirmDeleteFeedback}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
            >
              {deleting ? 'Deleting...' : 'Delete Feedback Permanently'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

