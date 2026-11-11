import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  QrCode,
  ArrowRight,
  Boxes,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

// Always render fresh — survey counts and submission status must be live
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/student/login');
  }

  // If administrator arrives here, redirect to their dedicated dashboard
  if (user.role_id === 'ADMINISTRATOR') {
    redirect('/admin/dashboard');
  }

  let surveys = MockAdapter.getSurveys('STUDENT');
  let completedSurveyIds = MockAdapter.getUserCompletedSurveyIds(user.id);
  let userFeedbacks = MockAdapter.getFeedbacks().filter((f) => f.user_id === user.id);

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      const [surveysRes, receiptsRes, feedbackRes] = await Promise.all([
        supabase
          .from('surveys')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('survey_participation_receipts')
          .select('survey_id')
          .eq('user_id', user.id),
        supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_anonymous', false),
      ]);

      if (surveysRes.data && surveysRes.data.length > 0) {
        const enriched = await Promise.all(
          surveysRes.data.map(async (s: any) => {
            const [qRes, rRes, rcRes] = await Promise.all([
              supabase.from('survey_questions').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
              supabase.from('survey_responses').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
              supabase.from('survey_participation_receipts').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
            ]);
            return {
              ...s,
              questions_count: qRes.count || 0,
              responses_count: Math.max(rRes.count || 0, rcRes.count || 0),
            };
          })
        );
        surveys = enriched.filter((s: any) => !s.target_roles || s.target_roles.includes('STUDENT'));
      }

      if (receiptsRes.data) {
        const dbReceiptIds = receiptsRes.data.map((r: any) => r.survey_id);
        completedSurveyIds = Array.from(new Set([...completedSurveyIds, ...dbReceiptIds]));
      }

      if (feedbackRes.data) {
        userFeedbacks = feedbackRes.data;
      }
    } catch (err) {
      console.warn('Failed to fetch student dashboard live data from Supabase:', err);
    }
  }

  const activeSurveys = surveys.filter((s) => s.status === 'ACTIVE');

  // Submissions comparison
  const submittedSurveyIds = new Set(completedSurveyIds);
  const pendingSurveys = activeSurveys.filter((s) => !submittedSurveyIds.has(s.id));
  const completedSurveysCount = completedSurveyIds.length;

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* ════════════════════════════════════════════════════════════════════
          1. HERO BANNER - Exact match to user's design reference
          - Real campus facade & fountain photo background
          - Deep navy gradient overlay with diagonal watermark
          - Student Academic Portal pill chip
          - "Welcome back, {user.full_name}!" with cyan highlight
          - Subtitle: "Your portal for course evaluations, academic surveys..."
          - Action buttons: "Scan Survey QR" & "Submit Feedback"
          - Bottom curved wave transition
         ════════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0A2644] text-white shadow-md border border-slate-200/50">
        {/* Background Image with Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/ua-building.jpg"
            alt="University of the Assumption Campus & Fountain"
            fill
            className="object-cover object-[center_35%] filter contrast-110 brightness-95"
            priority
          />
          {/* Deep Navy/Blue Atmospheric Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071E36] via-[#0C2F55]/95 to-[#0A2644]/75 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 pb-12 sm:pb-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Pill Chip */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-xs font-semibold text-white shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#38BDF8]" />
              <span>Student Academic Portal</span>
            </div>

            {/* Main Greeting */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, <span className="text-[#38BDF8]">{user.full_name}!</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-100/90 leading-relaxed font-normal max-w-xl">
              Your portal for course evaluations, academic surveys, and departmental feedback services.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Button 1: Scan Survey QR */}
            <Link
              href="/scan"
              className="rounded-full bg-white hover:bg-slate-100 text-[#185A9D] text-xs font-bold px-4 py-2.5 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-white active:scale-95"
            >
              <QrCode className="h-4 w-4 text-[#185A9D]" />
              <span>Scan Survey QR</span>
            </Link>

            {/* Button 2: Submit Feedback */}
            <Link
              href="/feedback"
              className="rounded-full bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-bold px-4 py-2.5 shadow-md backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <MessageSquarePlus className="h-4 w-4 text-sky-300" />
              <span>Submit Feedback</span>
            </Link>
          </div>
        </div>

        {/* Curved Wave Transition SVG inside hero - Blue and Gray styling */}
        <div className="absolute bottom-0 inset-x-0 overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            className="w-full h-8 sm:h-12"
            viewBox="0 0 1440 60"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Blue Wave Layer */}
            <path
              d="M0,20 C360,60 720,0 1080,40 C1260,60 1380,30 1440,35 L1440,60 L0,60 Z"
              fill="#1E88E5"
              opacity="0.85"
            />
            {/* Gray Wave Layer */}
            <path
              d="M0,35 C420,10 840,55 1200,25 C1320,15 1400,30 1440,30 L1440,60 L0,60 Z"
              fill="#64748B"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          2. OVERVIEW KPI STAT CARDS (4 Columns)
          - AVAILABLE SURVEYS (2 active in department)
          - SURVEYS COMPLETED (Your recorded submissions)
          - PENDING ACTION (Surveys awaiting response)
          - MY FEEDBACK (Submitted inquiries & notes)
         ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="AVAILABLE SURVEYS"
          value={activeSurveys.length}
          subtitle={`${activeSurveys.length} active in department`}
          icon={ClipboardList}
          color="blue"
          iconShape="rounded"
        />
        <StatCard
          title="SURVEYS COMPLETED"
          value={completedSurveysCount}
          subtitle="Your recorded submissions"
          icon={CheckCircle2}
          color="emerald"
          iconShape="circle"
        />
        <StatCard
          title="PENDING ACTION"
          value={pendingSurveys.length}
          subtitle="Surveys awaiting response"
          icon={Clock}
          color="amber"
          iconShape="circle"
        />
        <StatCard
          title="MY FEEDBACK"
          value={userFeedbacks.length}
          subtitle="Submitted inquiries & notes"
          icon={MessageSquarePlus}
          color="purple"
          iconShape="rounded"
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          3. CURRENTLY ACTIVE SURVEYS SECTION
          - White card container with rounded-2xl & subtle border
          - Section header with Clipboard icon & "View All (2) >" link
          - Clean survey item cards with Category pill, "Acceptance of Answers"
            badge, Title, Description, metadata, and "Take Survey ->" button
         ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-5">
        {/* Section Header */}
        <div className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#185A9D] border border-blue-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0A2540]">
                Currently Active Surveys
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveys currently open for student submissions and evaluations.
              </p>
            </div>
          </div>
          <Link
            href="/surveys"
            className="text-xs font-bold text-[#185A9D] hover:text-[#124578] flex items-center gap-1 transition-colors"
          >
            <span>View All ({activeSurveys.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Survey Items List */}
        <div className="space-y-3.5">
          {activeSurveys.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2.5" />
              <p className="text-sm font-bold text-[#0A2540]">No active surveys at this time</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Check back soon for upcoming department evaluations and course surveys.
              </p>
            </div>
          ) : (
            activeSurveys.map((survey) => {
              const isCompleted = submittedSurveyIds.has(survey.id);
              const categoryLabel = (survey.category || 'ACADEMIC').replace('_', ' ').toUpperCase();

              return (
                <div
                  key={survey.id}
                  className="p-5 rounded-xl border border-slate-200/80 hover:border-blue-300 bg-white hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        categoryLabel === 'ACADEMIC'
                          ? 'bg-[#E0F2FE] text-[#0284C7]'
                          : categoryLabel === 'FACILITY'
                          ? 'bg-[#E0F7FA] text-[#00838F]'
                          : 'bg-blue-100 text-[#185A9D]'
                      }`}>
                        {categoryLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Acceptance of Answers</span>
                      </span>
                    </div>

                    {/* Survey Title */}
                    <h3 className="text-sm sm:text-base font-bold text-[#0A2540] leading-snug">
                      {survey.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {survey.description}
                    </p>

                    {/* Metadata Row */}
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 font-medium">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Boxes className="h-3.5 w-3.5 text-slate-400" />
                        <span>{survey.questions_count || 6} questions</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{survey.responses_count || 0} submitted</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Deadline: {formatDateTime(survey.end_date)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center w-full sm:w-auto">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold w-full sm:w-auto justify-center">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <Link
                        href={`/surveys/${survey.id}`}
                        className="rounded-full bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold px-5 py-2.5 shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto cursor-pointer active:scale-95"
                      >
                        <span>Take Survey</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
