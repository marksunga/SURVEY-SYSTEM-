import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
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

