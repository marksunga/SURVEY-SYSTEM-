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
  BarChart3,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loadingSurveys, setLoadingSurveys] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetch('/api/admin/surveys')
      .then((res) => res.json())
      .then((data) => {
        const list = data.surveys || [];
        setSurveys(list);
        if (list.length > 0) {
          setSelectedSurveyId(list[0].id);
        }
      })
      .finally(() => setLoadingSurveys(false));
  }, []);

  useEffect(() => {
    if (!selectedSurveyId) return;
    setLoadingReport(true);
    fetch(`/api/admin/surveys/${selectedSurveyId}/results`)
      .then((res) => res.json())
      .then((data) => setReportData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingReport(false));
  }, [selectedSurveyId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department Reports & Analytics</h1>
          <p className="text-xs text-slate-500">
            Generate official PDF summaries, download CSV records, and analyze student response metrics.
          </p>
        </div>

        {reportData?.survey && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportSurveyCSV(reportData.survey, reportData)}
              className="text-xs"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
              Export CSV
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => generateSurveyPDF(reportData.survey, reportData)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Download PDF Report
            </Button>
          </div>
        )}
      </div>

      {/* Filter Selector */}
      <Card className="border-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 whitespace-nowrap">
            <Filter className="h-4 w-4 text-blue-600" />
            <span>Select Survey Report:</span>
          </div>

          <select
            value={selectedSurveyId}
            onChange={(e) => setSelectedSurveyId(e.target.value)}
            disabled={loadingSurveys}
            className="flex h-10 w-full sm:flex-1 rounded-md border border-input bg-white px-3 py-2 text-xs text-slate-800 font-semibold"
          >
            {surveys.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.category} • {s.responses_count} submissions)
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Report Content */}
      {loadingReport ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading automated report...</div>
      ) : !reportData?.survey ? (
        <div className="py-16 text-center text-xs text-slate-400">No report data found.</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Submissions"
              value={reportData.totalResponses}
              subtitle="Completed evaluations"
              icon={CheckCircle2}
              color="blue"
            />
            <StatCard
              title="Anonymous Submissions"
              value={reportData.anonymousResponses}
              subtitle="Decoupled zero-knowledge"
              icon={ShieldCheck}
              color="emerald"
            />
            <StatCard
              title="Identified Submissions"
              value={reportData.identifiedResponses}
              subtitle="User-verified receipts"
              icon={Users}
              color="indigo"
            />
          </div>

          {/* Interactive Question Charts */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Statistical Analysis & Visualizations</h2>
            <SurveyAnalyticsCharts questions={reportData.aggregatedQuestions} />
          </div>
        </div>
      )}
    </div>
  );
}

