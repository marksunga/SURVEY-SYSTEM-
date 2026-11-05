'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/StatCard';
import { SurveyAnalyticsCharts } from '@/components/charts/SurveyAnalyticsCharts';
import { generateSurveyPDF } from '@/lib/reports/pdf-generator';
import { exportSurveyCSV } from '@/lib/reports/csv-generator';
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ResultsPageProps {
  params: { id: string };
}

export default function SurveyResultsPage({ params }: ResultsPageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/surveys/${params.id}/results`)
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading survey analytics...</div>;
  }

  if (!data?.survey) {
    return <div className="py-12 text-center text-xs text-rose-500">Survey results not found.</div>;
  }

  const { survey, totalResponses, anonymousResponses, identifiedResponses, aggregatedQuestions } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/surveys"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Surveys
        </Link>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => exportSurveyCSV(survey, data)}
            className="text-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Export CSV
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => generateSurveyPDF(survey, data)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase">
            {survey.category.replace('_', ' ')}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              survey.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {survey.status}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 leading-snug">{survey.title}</h1>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{survey.description}</p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-100">
          <span>Target Audience: {survey.target_roles.join(', ')}</span>
          <span>•</span>
          <span>Created by: {survey.creator_name || 'Administrator'}</span>
          <span>•</span>
          <span>Ends: {formatDate(survey.end_date)}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Submissions"
          value={totalResponses}
          subtitle="Participant answers recorded"
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Anonymous Submissions"
          value={anonymousResponses}
          subtitle="Zero-knowledge decoupled"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Identified Submissions"
          value={identifiedResponses}
          subtitle="Linked with student accounts"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Question Visualizations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Question-by-Question Analysis</h2>
          <span className="text-xs text-slate-500">{aggregatedQuestions.length} questions evaluated</span>
        </div>

        <SurveyAnalyticsCharts questions={aggregatedQuestions} />
      </div>
    </div>
  );
}

