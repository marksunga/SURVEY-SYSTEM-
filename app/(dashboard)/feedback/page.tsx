'use client';

import { useState, useEffect } from 'react';
import { submitFeedbackAction, editUserFeedbackAction, getUserFeedbacksAction } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  MessageSquarePlus,
  ShieldCheck,
  Lock,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Edit3,
  Calendar,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Feedback, FeedbackCategory } from '@/lib/types/database';
import { formatDate } from '@/lib/utils';

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState('submit');
  const [category, setCategory] = useState<FeedbackCategory>('FACILITIES');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User feedback history state
  const [userFeedbacks, setUserFeedbacks] = useState<Feedback[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Edit feedback modal state
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<FeedbackCategory>('FACILITIES');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function loadUserFeedbacks() {
    setLoadingHistory(true);
    getUserFeedbacksAction()
      .then((res) => {
        setUserFeedbacks(res.feedbacks || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingHistory(false));
  }

  useEffect(() => {
    loadUserFeedbacks();
  }, []);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    formData.set('isAnonymous', isAnonymous ? 'true' : 'false');

    try {
      const res = await submitFeedbackAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        loadUserFeedbacks();
      }
    } catch (err: any) {
      setError(err?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenEdit(fb: Feedback) {
    setEditingFeedback(fb);
    setEditTitle(fb.title);
    setEditCategory(fb.category);
    setEditContent(fb.decrypted_content || '');
    setEditError(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingFeedback) return;
    if (!editTitle.trim() || !editContent.trim()) {
      setEditError('Subject and content are required.');
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    const res = await editUserFeedbackAction(editingFeedback.id, {
      title: editTitle.trim(),
      category: editCategory,
      content: editContent.trim(),
    });

    if (res?.error) {
      setEditError(res.error);
    } else if (res?.feedback) {
      setUserFeedbacks((prev) =>
        prev.map((f) => (f.id === editingFeedback.id ? { ...f, ...res.feedback } : f))
      );
      setEditingFeedback(null);
    }
    setSavingEdit(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Department Feedback Portal</h1>
        <p className="text-xs text-slate-500">
          Directly voice your observations, equipment complaints, or curriculum suggestions to the IT department.
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="submit" className="text-xs gap-1.5 font-semibold">
            <MessageSquarePlus className="h-4 w-4" />
            <span>Submit Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5 font-semibold">
            <History className="h-4 w-4" />
            <span>My Submitted Feedback ({userFeedbacks.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Submit Feedback Form */}
        <TabsContent value="submit" className="space-y-6">
          {/* Security Callout */}
          <div className="p-4 rounded-xl bg-[#EAF2F8] border border-[#D1E3EC] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#4682A9] text-white mt-0.5 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-0.5 text-xs text-slate-700">
              <span className="font-bold text-[#0F172A]">Cryptographically Protected Feedback</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All submitted messages are automatically encrypted with AES-256-GCM before storage. 
                When &quot;Anonymous Submission&quot; is selected, no user identifier is recorded in the feedback record.
              </p>
            </div>
          </div>

          {success && (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">Feedback Successfully Submitted!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your encrypted feedback has been delivered to IT officers.
                  {isAnonymous
                    ? ' Anonymous mode verified: No identifying details were linked.'
                    : ' You can track review progress and edit your submission in the "My Submitted Feedback" tab while pending.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setSuccess(false)}
                    className="text-xs"
                  >
                    Submit Another Feedback
                  </Button>
                  {!isAnonymous && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setSuccess(false);
                        setActiveTab('history');
                      }}
                      className="bg-blue-600 text-white text-xs"
                    >
                      View My Feedback
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!success && (
            <Card className="border-slate-200">
              <CardHeader className="p-6">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4 text-blue-600" />
                  <span>Submit New Feedback</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Fill out the details below. All fields marked with * are required.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-xs">Subject / Issue Summary *</Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      required
                      placeholder="e.g., Sluggish workstations and missing compilers in Lab 403"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <option value="FACILITIES">Facilities & Lab Equipment</option>
                      <option value="TECHNICAL_SUPPORT">Technical Support & Helpdesk</option>
                      <option value="NETWORK_LAB">Network & Wi-Fi Performance</option>
                      <option value="ACADEMIC">Academic & Course Pacing</option>
                      <option value="CURRICULUM">Curriculum & Software Tooling</option>
                      <option value="OTHER">Other Department Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="content" className="text-xs">Detailed Observations & Recommendations *</Label>
                    <Textarea
                      id="content"
                      name="content"
                      required
                      rows={5}
                      placeholder="Provide detailed description of the issue or feedback (e.g. room number, machine ID, specific software)..."
                      className="text-xs"
                    />
                  </div>

                  {/* Anonymity Toggle Box */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-slate-600" />
                        Submit as Anonymous Feedback
                      </span>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Your name and email will NOT be linked to this feedback row in the database.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold h-10 shadow-xs"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Encrypting via AES-256...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        Encrypt & Submit Feedback
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: User's Feedback History & Editing */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Submitted Feedback</h2>
              <p className="text-xs text-slate-500">
                Track status updates and review notes from IT administrators. You may edit feedback while in &quot;Pending&quot; status.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadUserFeedbacks}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>

          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your feedback records...</div>
          ) : userFeedbacks.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-10 text-center space-y-3">
                <MessageSquare className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-700">No Identified Feedback Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You haven&apos;t submitted any non-anonymous feedback. Anonymous feedback is not linked to accounts to guarantee confidentiality.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setActiveTab('submit')}
                  className="bg-blue-600 text-white text-xs"
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userFeedbacks.map((fb) => {
                const isPending = fb.status === 'PENDING';
                const isResolved = fb.status === 'RESOLVED';
                const isUnderReview = fb.status === 'UNDER_REVIEW';

                return (
                  <Card key={fb.id} className="border-slate-200">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                            {fb.category.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : isUnderReview
                                ? 'bg-indigo-100 text-indigo-800'
                                : isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {fb.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            Submitted {formatDate(fb.created_at)}
                          </span>
                          {isPending && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEdit(fb)}
                              className="h-7 text-xs px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{fb.title}</h3>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                        {fb.decrypted_content || '[Encrypted Content Protected]'}
                      </div>

                      {fb.admin_notes && (
                        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                          <span className="font-bold flex items-center gap-1 text-[11px] text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            IT Department Resolution / Admin Response:
                          </span>
                          <p className="text-[11px] text-emerald-800 leading-normal">{fb.admin_notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Feedback Dialog */}
      <Dialog open={Boolean(editingFeedback)} onOpenChange={(open) => !open && setEditingFeedback(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" />
              <span>Edit Pending Feedback</span>
            </DialogTitle>
          </DialogHeader>

          {editError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Subject / Issue Summary *</Label>
              <Input
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Category *</Label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as FeedbackCategory)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="FACILITIES">Facilities & Lab Equipment</option>
                <option value="TECHNICAL_SUPPORT">Technical Support & Helpdesk</option>
                <option value="NETWORK_LAB">Network & Wi-Fi Performance</option>
                <option value="ACADEMIC">Academic & Course Pacing</option>
                <option value="CURRICULUM">Curriculum & Software Tooling</option>
                <option value="OTHER">Other Department Inquiries</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Observations & Details *</Label>
              <Textarea
                required
                rows={5}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={savingEdit}
                onClick={() => setEditingFeedback(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingEdit}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
              >
                {savingEdit ? 'Re-encrypting...' : 'Save & Re-encrypt Feedback'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
