'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { QuestionBuilder, DraftQuestion } from '@/components/surveys/QuestionBuilder';
import { updateSurveyAction } from '@/app/actions/surveys';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { SurveyCategory, SurveyStatus, UserRole } from '@/lib/types/database';

interface EditSurveyPageProps {
  params: { id: string };
}

export default function EditSurveyPage({ params }: EditSurveyPageProps) {
  const router = useRouter();
  const [survey, setSurvey] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SurveyCategory>('ACADEMIC');
  const [status, setStatus] = useState<SurveyStatus>('ACTIVE');
  const [targetRoles, setTargetRoles] = useState<UserRole[]>(['STUDENT']);
  const [isAnonymousAllowed, setIsAnonymousAllowed] = useState(true);
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/surveys/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.survey) {
          setSurvey(data.survey);
          setTitle(data.survey.title);
          setDescription(data.survey.description || '');
          setCategory(data.survey.category);
          setStatus(data.survey.status);
          setTargetRoles(data.survey.target_roles || ['STUDENT']);
          setIsAnonymousAllowed(data.survey.is_anonymous_allowed);
          setEndDate(data.survey.end_date ? data.survey.end_date.split('T')[0] : '');
          setQuestions(
            (data.questions || []).map((q: any) => ({
              id: q.id,
              question_text: q.question_text,
              question_type: q.question_type,
              options: q.options,
              is_required: q.is_required,
              order_index: q.order_index,
            }))
          );
        } else {
          setError('Survey not found.');
        }
      })
      .catch(() => setError('Failed to load survey.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a survey title.');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const res = await updateSurveyAction(
        params.id,
        {
          title,
          description,
          category,
          status,
          target_roles: targetRoles,
          is_anonymous_allowed: isAnonymousAllowed,
          end_date: new Date(endDate).toISOString(),
        },
        questions
      );

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/admin/surveys');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update survey.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading survey...</div>;
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Survey & Questions</h1>
        <p className="text-xs text-slate-500">Modify survey settings and update question details.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200">
          <CardHeader className="p-6">
            <CardTitle className="text-base font-bold text-slate-900">Survey Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <Label className="text-xs">Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SurveyStatus)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Expiration Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <QuestionBuilder questions={questions} onChange={setQuestions} />
          </CardContent>
        </Card>

        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between sticky bottom-4 z-10 shadow-sm">
          <Button asChild type="button" variant="outline" size="sm" className="text-xs">
            <Link href="/admin/surveys">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 h-10"
          >
            {saving ? 'Saving Changes...' : 'Save Survey Updates'}
          </Button>
        </div>
      </form>
    </div>
  );
}

