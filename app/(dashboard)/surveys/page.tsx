import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

export default async function AvailableSurveysPage({
  searchParams,
}: {
  searchParams: { category?: string; status?: string };
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const allSurveys = MockAdapter.getSurveys(user.role_id);
  const completedIds = MockAdapter.getUserCompletedSurveyIds(user.id);

  const selectedCategory = searchParams.category;

  const filtered = allSurveys.filter((s) => {
    if (selectedCategory && selectedCategory !== 'ALL' && s.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const categories = ['ALL', 'ACADEMIC', 'FACILITY', 'IT_INFRASTRUCTURE', 'DEPARTMENT_SERVICES', 'GENERAL'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Available Surveys</h1>
          <p className="text-xs text-slate-500">
            Participate in active departmental reviews and course evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/scan">
              <QrCode className="h-4 w-4 mr-1.5 text-[#4682A9]" />
              Scan QR Code
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/surveys/history">
              <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />
              My History
            </Link>
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <Filter className="h-3.5 w-3.5 text-slate-400 mr-1 flex-shrink-0" />
        {categories.map((cat) => {
          const active = (!selectedCategory && cat === 'ALL') || selectedCategory === cat;
          return (
            <Link
              key={cat}
              href={cat === 'ALL' ? '/surveys' : `/surveys?category=${cat}`}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.replace('_', ' ')}
            </Link>
          );
        })}
      </div>

      {/* Survey Cards Grid */}
      {filtered.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-12 text-center space-y-3">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-700">No surveys found</h3>
            <p className="text-xs text-slate-400">Try selecting a different category filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((survey) => {
            const isCompleted = completedIds.includes(survey.id);

            return (
              <Card
                key={survey.id}
                className={`border-slate-200 transition-all ${
                  isCompleted ? 'bg-slate-50/60 opacity-90' : 'hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                          {survey.category.replace('_', ' ')}
                        </span>
                        {survey.is_anonymous_allowed && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" /> Anonymous
                          </span>
                        )}
                      </div>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                          <Clock className="h-3.5 w-3.5" /> Active
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{survey.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{survey.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <div className="text-slate-400 text-[11px] space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" /> Deadline: {formatDateTime(survey.end_date)}
                      </div>
                      <div>{survey.questions_count} questions configured</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" className="text-xs px-2.5">
                        <Link href={`/surveys/${survey.id}/qr`} title="View QR Code">
                          <QrCode className="h-3.5 w-3.5 text-slate-600" />
                        </Link>
                      </Button>

                      {isCompleted ? (
                        <Button disabled size="sm" variant="secondary" className="text-xs">
                          Submitted
                        </Button>
                      ) : (
                        <Button asChild size="sm" className="bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs shadow-xs font-semibold">
                          <Link href={`/surveys/${survey.id}`}>
                            Take Survey
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

