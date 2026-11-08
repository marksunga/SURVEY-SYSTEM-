'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Percent,
} from 'lucide-react';
import { SurveyStatus } from '@/lib/types/database';

export default function AdminReportsPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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

  // Filter available surveys based on status
  const filteredSurveyOptions = useMemo(() => {
    return surveys.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [surveys, statusFilter]);

  // When filtered options change, update selected survey if current selection is invalid
  useEffect(() => {
    if (filteredSurveyOptions.length > 0) {
      const stillValid = filteredSurveyOptions.some((s) => s.id === selectedSurveyId);
      if (!stillValid) {
        setSelectedSurveyId(filteredSurveyOptions[0].id);
      }
    } else {
      setSelectedSurveyId('');
    }
  }, [filteredSurveyOptions, selectedSurveyId]);

  useEffect(() => {
    if (!selectedSurveyId) {
      setReportData(null);
      return;
    }
    setLoadingReport(true);
    fetch(`/api/admin/surveys/${selectedSurveyId}/results`)
      .then((res) => res.json())
      .then((data) => setReportData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingReport(false));
  }, [selectedSurveyId]);

  // Calculate participation rate
  const participationRate = useMemo(() => {
    if (!reportData?.totalResponses) return 0;
    // Estimated target audience pool based on roles
    const targetRoles = reportData.survey?.target_roles || [];
    const poolSize = targetRoles.length * 20; // benchmark student/faculty cohort pool
    return Math.min(100, Math.round((reportData.totalResponses / poolSize) * 100));
  }, [reportData]);

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
              className="bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs shadow-xs font-semibold"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Download PDF Report
            </Button>
          </div>
        )}
      </div>

      {/* Filtering Toolbar */}
      <Card className="border-slate-200 bg-white shadow-xs rounded-xl">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Survey Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Filter className="h-3 w-3 text-[#4682A9]" />
              <span>Select Survey:</span>
            </label>
            <select
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              disabled={loadingSurveys || filteredSurveyOptions.length === 0}
              className="flex h-9 w-full rounded-md border border-input bg-white px-2.5 py-1 text-xs text-slate-800 font-semibold"
            >
              {filteredSurveyOptions.length === 0 ? (
                <option value="">No surveys match filters</option>
              ) : (
                filteredSurveyOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.status})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-white px-2.5 py-1 text-xs text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="EXPIRED">Expired</option>
              <option value="CLOSED">Closed</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {loadingReport ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading automated report...</div>
      ) : !reportData?.survey ? (
        <div className="py-16 text-center text-xs text-slate-400">
          No survey selected or matching the filter criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner with Participation Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Submissions"
              value={reportData.totalResponses}
              subtitle="Completed evaluations"
              icon={CheckCircle2}
              color="blue"
            />
            <StatCard
              title="Participation Rate"
              value={`${participationRate}%`}
              subtitle={`Est. cohort participation`}
              icon={Percent}
              color="amber"
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
