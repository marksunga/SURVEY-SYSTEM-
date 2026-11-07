'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { SurveyCategory, SurveyStatus, UserRole } from '@/lib/types/database';
import { DraftQuestion } from '@/components/surveys/QuestionBuilder';

export async function createSurveyAction(data: {
  title: string;
  description: string;
  category: SurveyCategory;
  status: SurveyStatus;
  target_roles: UserRole[];
  is_anonymous_allowed: boolean;
  start_date: string;
  end_date: string;
  questions: DraftQuestion[];
}): Promise<{ success: boolean; surveyId?: string; error?: string }> {
  try {
    const user = await requireRole(['ADMINISTRATOR']);

    // 1. Create survey
    const newSurvey = MockAdapter.createSurvey({
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      target_roles: data.target_roles,
      is_anonymous_allowed: data.is_anonymous_allowed,
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date,
      created_by: user.id,
      creator_name: user.full_name,
    });

    // 2. Insert questions
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      MockAdapter.createQuestion({
        survey_id: newSurvey.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        is_required: q.is_required,
        order_index: i,
      });
    }

    // 3. Automatically generate a unique QR code record
    const codeData = `QR-SRV-${newSurvey.title.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    MockAdapter.saveQRCode({
      survey_id: newSurvey.id,
      code_data: codeData,
      access_url: `/surveys/${newSurvey.id}`,
      qr_image_data: '',
      is_active: true,
    });

    // 4. Log audit
    MockAdapter.logAudit(user.email, 'SURVEY_CREATED', 'SURVEY', newSurvey.id, {
      title: newSurvey.title,
      questions_count: data.questions.length,
      status: newSurvey.status,
    });

    // 5. Notify target audience if ACTIVE
    if (newSurvey.status === 'ACTIVE') {
      for (const role of data.target_roles) {
        MockAdapter.createNotification({
          target_role: role,
          title: 'New Survey Available',
          message: `A new survey "${newSurvey.title}" is now open for your response.`,
          link: `/surveys/${newSurvey.id}`,
          type: 'SURVEY_INVITE',
        });
      }
    }

    revalidatePath('/surveys');
    revalidatePath('/admin/surveys');
    return { success: true, surveyId: newSurvey.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create survey.' };
  }
}

export async function updateSurveyAction(
  id: string,
  updates: any,
  questions?: DraftQuestion[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(['ADMINISTRATOR']);

    MockAdapter.updateSurvey(id, updates);

    if (questions) {
      // Delete existing questions and replace
      const existing = MockAdapter.getQuestionsBySurveyId(id);
      for (const q of existing) {
        MockAdapter.deleteQuestion(q.id);
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        MockAdapter.createQuestion({
          survey_id: id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          is_required: q.is_required,
          order_index: i,
        });
      }
    }

    MockAdapter.logAudit(user.email, 'SURVEY_UPDATED', 'SURVEY', id, { updates });

    revalidatePath(`/surveys/${id}`);
    revalidatePath('/admin/surveys');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update survey.' };
  }
}

export async function updateSurveyStatusAction(id: string, status: SurveyStatus) {
  const user = await requireRole(['ADMINISTRATOR']);

  const updated = MockAdapter.updateSurvey(id, { status });

  MockAdapter.logAudit(user.email, 'SURVEY_STATUS_CHANGED', 'SURVEY', id, { status });

  revalidatePath('/admin/surveys');
  revalidatePath('/surveys');
  return { success: true, status: updated?.status };
}

export async function deleteSurveyAction(id: string) {
  const user = await requireRole(['ADMINISTRATOR']);

  MockAdapter.deleteSurvey(id);

  MockAdapter.logAudit(user.email, 'SURVEY_DELETED', 'SURVEY', id);

  revalidatePath('/admin/surveys');
  revalidatePath('/surveys');
  return { success: true };
}

export async function submitSurveyAnswersAction(
  surveyId: string,
  isAnonymous: boolean,
  answers: Record<string, any>
) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Please log in to submit this survey.' };
  }

  const survey = MockAdapter.getSurveyById(surveyId);
  if (!survey) {
    return { error: 'Survey not found.' };
  }

  if (survey.status !== 'ACTIVE') {
    return { error: `This survey is currently ${survey.status}. Submissions are not accepted.` };
  }

  // Validate required questions
  const questions = MockAdapter.getQuestionsBySurveyId(surveyId);
  for (const q of questions) {
    if (q.is_required) {
      const val = answers[q.id];
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        return { error: `Please answer required question: "${q.question_text}"` };
      }
    }
  }

  try {
    const result = MockAdapter.submitSurveyAnswers(
      surveyId,
      user.id,
      isAnonymous,
      answers
    );

    // Audit log (Without logging answers to maintain privacy)
    MockAdapter.logAudit(
      isAnonymous ? 'ANONYMOUS_PARTICIPANT' : user.email,
      'SURVEY_SUBMITTED',
      'SURVEY',
      surveyId,
      { is_anonymous: isAnonymous, token: result.token }
    );

    revalidatePath('/surveys');
    revalidatePath('/surveys/history');
    revalidatePath(`/admin/surveys/${surveyId}/results`);

    return { success: true, token: result.token };
  } catch (err: any) {
    return { error: err.message || 'Submission failed.' };
  }
}

