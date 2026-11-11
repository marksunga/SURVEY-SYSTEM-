import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Calendar, ArrowRight, ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// Always fetch fresh data — never serve a cached empty-submissions page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SurveyHistoryPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  let completedIds: string[] = MockAdapter.getUserCompletedSurveyIds(user.id);
  let completedSurveys: any[] = [];

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: receipts } = await supabase
        .from('survey_participation_receipts')
        .select('survey_id')
        .eq('user_id', user.id);

      if (receipts && receipts.length > 0) {
        const dbReceiptIds = receipts.map((r: any) => r.survey_id);
        completedIds = Array.from(new Set([...completedIds, ...dbReceiptIds]));
      }

      if (completedIds.length > 0) {
        const { data: dbSurveys } = await supabase
          .from('surveys')
          .select('*')
          .in('id', completedIds);

        if (dbSurveys && dbSurveys.length > 0) {
          completedSurveys = dbSurveys;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch survey history from Supabase:', err);
    }
  }

  // Fallback / merge with MockAdapter if needed
  if (completedSurveys.length === 0 && completedIds.length > 0) {
    completedSurveys = completedIds
      .map((id) => MockAdapter.getSurveyById(id))
      .filter(Boolean);
  } else if (completedIds.length > completedSurveys.length) {
    const foundIds = new Set(completedSurveys.map((s) => s.id));
    for (const id of completedIds) {
      if (!foundIds.has(id)) {
        const mockS = MockAdapter.getSurveyById(id);
        if (mockS) completedSurveys.push(mockS);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Survey Submissions</h1>
          <p className="text-xs text-slate-500">
            Audit history of your completed departmental reviews and verified submission receipts.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="text-xs">
          <Link href="/surveys">Browse Active Surveys</Link>
        </Button>
      </div>

      {completedSurveys.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center space-y-3">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No Submissions Recorded</h3>
            <p className="text-xs text-slate-400">
              You have not submitted responses to any surveys yet.
            </p>
            <Button asChild size="sm" className="bg-blue-600 text-white text-xs mt-2">
              <Link href="/surveys">View Available Surveys</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {completedSurveys.map((survey: any) => (
            <Card key={survey.id} className="border-slate-200">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                      {survey.category.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" /> Participation Recorded
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{survey.title}</h3>
                  <p className="text-xs text-slate-500">{survey.description}</p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Receipt status: <span className="font-semibold text-emerald-600">Verified</span> • Closed {formatDate(survey.end_date)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="text-xs">
                    <Link href={`/surveys/${survey.id}`}>
                      View Survey Details
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

