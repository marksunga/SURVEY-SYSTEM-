'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QuestionBuilder, DraftQuestion } from '@/components/surveys/QuestionBuilder';
import { createSurveyAction } from '@/app/actions/surveys';
import { ArrowLeft, Save, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';
import { SurveyCategory, SurveyStatus, UserRole } from '@/lib/types/database';

function toLocalDateTimeString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SurveyCategory>('ACADEMIC');
  const [status, setStatus] = useState<SurveyStatus>('ACTIVE');
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(['STUDENT']);
  const [isAnonymousAllowed, setIsAnonymousAllowed] = useState(true);

  // Initialize start date-time to current moment
  const [startDate, setStartDate] = useState(() => toLocalDateTimeString(new Date()));

  // Initialize due date-time to 14 days from now at 11:59 PM (23:59)
  const [endDate, setEndDate] = useState(() => {
    const end = new Date(Date.now() + 14 * 86400000);
    end.setHours(23, 59, 0, 0);
    return toLocalDateTimeString(end);
  });
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    {
      question_text: 'Overall, how would you rate the effectiveness of this program/course?',
      question_type: 'RATING_SCALE',
      options: { min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Outstanding' },
      is_required: true,
      order_index: 0,
    },
    {
      question_text: 'Did the department provide adequate laboratory tooling and equipment?',
      question_type: 'YES_NO',
      options: ['Yes', 'No'],
      is_required: true,
      order_index: 1,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(role: UserRole) {
    if (targetRoles.includes(role)) {
      if (targetRoles.length > 1) {
        setTargetRoles(targetRoles.filter((r) => r !== role));
      }
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a survey title.');
      return;
    }
    if (questions.length === 0) {
      setError('Please add at least one question.');
      return;
    }

    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      setError('Survey Due Date & Time cannot be earlier than or equal to Start Date & Time.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createSurveyAction({
        title,
        description,
        category,
        status,
        target_roles: targetRoles,
        is_anonymous_allowed: isAnonymousAllowed,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        questions,
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.surveyId) {
        router.push(`/admin/surveys/${res.surveyId}/results`);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create survey.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/surveys"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Surveys
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Department Survey</h1>
        <p className="text-xs text-slate-500">
          Configure survey metadata, scheduling dates, target roles, and build interactive questions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Survey Basic Information Card */}
        <Card className="border-slate-200">
          <CardHeader className="p-6">
            <CardTitle className="text-base font-bold text-slate-900">1. Survey Information & Parameters</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Survey Title *</Label>
              <Input
                required
                placeholder="e.g. End-of-Term IT Laboratory & Infrastructure Evaluation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description & Instructions</Label>
              <Textarea
                rows={3}
                placeholder="Explain the purpose of this survey and instructions for participants..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SurveyCategory)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="ACADEMIC">Academic</option>
                  <option value="FACILITY">Facility</option>
                  <option value="IT_INFRASTRUCTURE">IT Infrastructure</option>
                  <option value="DEPARTMENT_SERVICES">Department Services</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Initial Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SurveyStatus)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="ACTIVE">ACTIVE (Open Now)</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Start Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Due Date & Time (Deadline) *</Label>
                <Input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Target Audience & Privacy toggles */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Target Participant Roles:</Label>
                <div className="flex items-center gap-3">
                  {(['STUDENT', 'ADMINISTRATOR'] as UserRole[]).map((r) => (
                    <label key={r} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={targetRoles.includes(r)}
                        onChange={() => toggleRole(r)}
                        className="rounded text-blue-600 border-slate-300"
                      />
                      <span>{r.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">Privacy & Anonymity:</Label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymousAllowed}
                    onChange={(e) => setIsAnonymousAllowed(e.target.checked)}
                    className="rounded text-blue-600 border-slate-300"
                  />
                  <span>Allow participants to submit anonymously</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Builder */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <QuestionBuilder questions={questions} onChange={setQuestions} />
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm sticky bottom-4 z-10">
          <Button asChild type="button" variant="outline" size="sm" className="text-xs">
            <Link href="/admin/surveys">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 h-10 shadow-sm"
          >
            {loading ? 'Creating Survey...' : 'Publish Survey & Generate QR'}
          </Button>
        </div>
      </form>
    </div>
  );
}

