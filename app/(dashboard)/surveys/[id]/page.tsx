'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuestionRenderer } from '@/components/surveys/QuestionRenderer';
import { submitSurveyAnswersAction } from '@/app/actions/surveys';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  Send,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface SurveyTakingPageProps {
  params: { id: string };
}

export default function SurveyTakingPage({ params }: SurveyTakingPageProps) {
  const router = useRouter();
  const [survey, setSurvey] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptToken, setReceiptToken] = useState<string | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Fetch survey details from API route or server action
    fetch(`/api/surveys/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.survey) {
          setSurvey(data.survey);
          setQuestions(data.questions || []);
          setHasCompleted(data.hasCompleted || false);
        } else {
          setError(data.error || 'Survey not found.');
        }
      })
      .catch((err) => setError('Failed to load survey details.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleAnswerChange(questionId: string, value: any) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }

  // Calculate completion percentage
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== '' && (!Array.isArray(answers[k]) || answers[k].length > 0)
  ).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await submitSurveyAnswersAction(params.id, isAnonymous, answers);
      if (res.error) {
        setError(res.error);
      } else if (res.token) {
        setReceiptToken(res.token);
      }
    } catch (err: any) {
      setError(err?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading survey questions...</p>
      </div>
    );
  }

  if (error && !survey) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-rose-200">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Survey Unavailable</h3>
            <p className="text-xs text-slate-500">{error}</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/surveys">Back to Surveys</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already Completed View
  if (hasCompleted && !receiptToken) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-emerald-200 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Survey Already Submitted</h2>
              <p className="text-xs text-slate-500">
                You have already provided your response for &quot;{survey.title}&quot;.
                To prevent duplicate voting bias, responses can only be submitted once.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/surveys">Browse Other Surveys</Link>
              </Button>
              <Button asChild size="sm" className="text-xs bg-blue-600 text-white">
                <Link href="/surveys/history">View My Receipts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success Receipt Screen
  if (receiptToken) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Card className="border-emerald-200 shadow-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Submission Confirmed!</h2>
              <p className="text-xs text-slate-500">
                Thank you for contributing to the IT Department continuous quality evaluation.
              </p>
            </div>

            {/* Cryptographic Zero-Knowledge Token Receipt */}
            <div className="p-4 rounded-xl bg-slate-900 text-white text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Cryptographic Submission Receipt
                </span>
                <span className="uppercase font-bold text-blue-400">
                  {isAnonymous ? 'Anonymous' : 'Verified ID'}
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400 break-all select-all">
                {receiptToken}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {isAnonymous
                  ? 'Zero-Knowledge Protection Active: Your identity has been decoupled from this response payload.'
                  : 'Your response was authenticated and submitted under your institutional account.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/surveys">Available Surveys</Link>
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Return button */}
      <div>
        <Link
          href="/surveys"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Available Surveys
        </Link>
      </div>

      {/* Survey Title & Header */}
      <Card className="border-slate-200">
        <CardHeader className="p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase">
              {survey.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400">
              Closes {new Date(survey.end_date).toLocaleDateString()}
            </span>
          </div>

          <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {survey.title}
          </CardTitle>

          <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {survey.description}
          </CardDescription>

          {/* Anonymity Option Banner */}
          {survey.is_anonymous_allowed && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 mt-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900">Anonymous Mode Option</span>
                  <p className="text-[11px] text-slate-500">
                    When enabled, zero foreign keys connect your user record to your response. Only completion status is verified.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span>Submit Anonymously</span>
              </label>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Completion Progress</span>
          <span>
            {answeredCount} of {questions.length} answered ({progressPercent}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-slate-200">
              <CardContent className="p-6">
                <QuestionRenderer
                  question={q}
                  index={idx}
                  value={answers[q.id]}
                  onChange={(val) => handleAnswerChange(q.id, val)}
                  disabled={submitting}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-10 shadow-lg">
          <div className="text-xs text-slate-500">
            {isAnonymous ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Lock className="h-3.5 w-3.5" /> Submitting in Anonymous Zero-Knowledge Mode
              </span>
            ) : (
              <span>Your response will be associated with your student ID receipt.</span>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 h-10 shadow-sm"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Encrypting & Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Submit Survey Response
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

