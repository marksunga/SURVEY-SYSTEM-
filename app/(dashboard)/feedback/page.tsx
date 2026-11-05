'use client';

import { useState } from 'react';
import { submitFeedbackAction } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquarePlus,
  ShieldCheck,
  Lock,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { FeedbackCategory } from '@/lib/types/database';

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory>('FACILITIES');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      }
    } catch (err: any) {
      setError(err?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Department Feedback Portal</h1>
        <p className="text-xs text-slate-500">
          Directly voice your observations, equipment complaints, or curriculum suggestions to the IT department.
        </p>
      </div>

      {/* Security Callout */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-600 text-white mt-0.5">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-0.5 text-xs text-slate-700">
          <span className="font-bold text-blue-900">Cryptographically Protected Feedback</span>
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
                : ' You will receive in-app notifications as administrators review your feedback.'}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSuccess(false)}
              className="text-xs"
            >
              Submit Another Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form */}
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
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-10 shadow-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Encrypting via AES-256...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Encrypt & Submit Feedback
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

