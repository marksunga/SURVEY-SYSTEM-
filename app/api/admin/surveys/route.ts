import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

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
              const [qRes, rRes] = await Promise.all([
                supabase.from('survey_questions').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
                supabase.from('survey_responses').select('*', { count: 'exact', head: true }).eq('survey_id', s.id),
              ]);
              return {
                ...s,
                questions_count: qRes.count || 0,
                responses_count: rRes.count || 0,
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
