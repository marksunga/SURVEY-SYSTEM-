import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { createSurveyAction } from '@/app/actions/surveys';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await requireRole(['ADMINISTRATOR']);

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data: dbSurveys, error } = await supabase
          .from('surveys')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbSurveys && dbSurveys.length > 0) {
          const surveysWithCounts = await Promise.all(
            dbSurveys.map(async (s: any) => {
              const [qRes, rRes, rcRes] = await Promise.all([
                supabase.from('survey_questions').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
                supabase.from('survey_responses').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
                supabase.from('survey_participation_receipts').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
              ]);
              const mockS = MockAdapter.getSurveyById(s.id);
              const totalResponses = Math.max(rRes.count || 0, rcRes.count || 0, mockS?.responses_count || 0);
              return {
                ...s,
                questions_count: qRes.count || (mockS?.questions_count || 0),
                responses_count: totalResponses,
              };
            })
          );
          return NextResponse.json({ surveys: surveysWithCounts });
        }
      } catch (err) {
        console.warn('Supabase admin surveys list error:', err);
      }
    }

    const surveys = MockAdapter.getSurveys();
    return NextResponse.json({ surveys });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMINISTRATOR']);
    const body = await request.json();
    const result = await createSurveyAction(body);

    if (result.error || !result.success) {
      return NextResponse.json({ error: result.error || 'Failed to create survey' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 403 });
  }
}
