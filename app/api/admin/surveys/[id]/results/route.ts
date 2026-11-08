import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['ADMINISTRATOR']);

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

          const { data: dbResponses } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('survey_id', params.id);

          const responses = dbResponses || [];
          const responseIds = responses.map((r: any) => r.id);

          let answers: any[] = [];
          if (responseIds.length > 0) {
            const { data: dbAnswers } = await supabase
              .from('response_answers')
              .select('*')
              .in('response_id', responseIds);
            answers = dbAnswers || [];
          }

          // Aggregate statistics per question
          const aggregatedQuestions = (dbQuestions || []).map((q: any) => {
            const qAnswers = answers.filter((a: any) => a.question_id === q.id);
            const totalAnswers = qAnswers.length;

            let distribution: Record<string, number> = {};
            let averageRating: number | null = null;
            let textResponses: string[] = [];

            if (q.question_type === 'RATING_SCALE') {
              let sum = 0;
              let count = 0;
              for (const ans of qAnswers) {
                const num = Number(ans.answer_value);
                if (!isNaN(num)) {
                  sum += num;
                  count++;
                  distribution[num] = (distribution[num] || 0) + 1;
                }
              }
              averageRating = count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
            } else if (
              q.question_type === 'MULTIPLE_CHOICE' ||
              q.question_type === 'YES_NO'
            ) {
              for (const ans of qAnswers) {
                const val = String(ans.answer_value);
                distribution[val] = (distribution[val] || 0) + 1;
              }
            } else if (q.question_type === 'CHECKBOX') {
              for (const ans of qAnswers) {
                let arr: string[] = [];
                try {
                  arr = typeof ans.answer_value === 'string' && ans.answer_value.startsWith('[')
                    ? JSON.parse(ans.answer_value)
                    : Array.isArray(ans.answer_value)
                    ? ans.answer_value
                    : [String(ans.answer_value)];
                } catch {
                  arr = [String(ans.answer_value)];
                }
                for (const item of arr) {
                  distribution[item] = (distribution[item] || 0) + 1;
                }
              }
            } else {
              textResponses = qAnswers.map((a: any) => String(a.answer_value));
            }

            return {
              question: q,
              totalAnswers,
              distribution,
              averageRating,
              textResponses,
            };
          });

          return NextResponse.json({
            survey: dbSurvey,
            totalResponses: responses.length,
            anonymousResponses: responses.filter((r: any) => r.is_anonymous).length,
            identifiedResponses: responses.filter((r: any) => !r.is_anonymous).length,
            aggregatedQuestions,
            responses,
          });
        }
      } catch (err) {
        console.warn('Supabase survey results calculation error:', err);
      }
    }

    const results = MockAdapter.getSurveyResults(params.id);
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
