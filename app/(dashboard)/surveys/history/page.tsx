import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Calendar, ArrowRight, ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function SurveyHistoryPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const completedIds = MockAdapter.getUserCompletedSurveyIds(user.id);
  const completedSurveys = completedIds
    .map((id) => MockAdapter.getSurveyById(id))
    .filter(Boolean);

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

