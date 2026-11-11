import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required to view survey details.' },
      { status: 401 }
    );
  }

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: dbSurvey, error: sErr } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!sErr && dbSurvey) {
        const { data: dbQuestions } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', params.id)
          .order('order_index', { ascending: true });

        let hasCompleted = false;
        if (user) {
          const { count } = await supabase
            .from('survey_participation_receipts')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', params.id)
            .eq('user_id', user.id);
          hasCompleted = (count || 0) > 0;
        }

        return NextResponse.json({
          survey: dbSurvey,
          questions: dbQuestions || [],
          hasCompleted,
        });
      }
    } catch (err) {
      console.warn('Supabase survey fetch fallback:', err);
    }
  }

  const survey = MockAdapter.getSurveyById(params.id);

  if (!survey) {
    return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
  }

  const questions = MockAdapter.getQuestionsBySurveyId(params.id);
  const hasCompleted = user
    ? MockAdapter.hasUserCompletedSurvey(user.id, params.id)
    : false;

  return NextResponse.json({
    survey,
    questions,
    hasCompleted,
  });
}
