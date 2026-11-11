'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
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

    // Validate due date & time
    const startDate = data.start_date || new Date().toISOString();
    if (new Date(data.end_date).getTime() <= new Date(startDate).getTime()) {
      return { success: false, error: 'Survey Due Date & Time cannot be earlier than or equal to Start Date & Time.' };
    }

    // 1. Create survey
    const newSurvey = MockAdapter.createSurvey({
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      target_roles: data.target_roles,
      is_anonymous_allowed: data.is_anonymous_allowed,
      start_date: startDate,
      end_date: data.end_date,
      created_by: user.id,
      creator_name: user.full_name,
    });

    // 2. Insert questions with consistent UUIDs
    const preparedQuestions = data.questions.map((q, idx) => ({
      id: crypto.randomUUID(),
      survey_id: newSurvey.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || [],
      is_required: q.is_required,
      order_index: idx,
    }));

    for (const q of preparedQuestions) {
      MockAdapter.createQuestion({
        survey_id: q.survey_id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        is_required: q.is_required,
        order_index: q.order_index,
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

    // 6. Persist to live Supabase if configured (persists across serverless instances)
    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('surveys').insert({
          id: newSurvey.id,
          title: newSurvey.title,
          description: newSurvey.description,
          category: newSurvey.category,
          status: newSurvey.status,
          target_roles: newSurvey.target_roles,
          is_anonymous_allowed: newSurvey.is_anonymous_allowed,
          start_date: startDate,
          end_date: data.end_date,
          created_by: user.id,
        });

        if (preparedQuestions.length > 0) {
          await supabase.from('survey_questions').insert(preparedQuestions);
        }

        await supabase.from('qr_codes').insert({
          survey_id: newSurvey.id,
          code_data: codeData,
          access_url: `/surveys/${newSurvey.id}`,
          is_active: true,
        });

        if (newSurvey.status === 'ACTIVE') {
          for (const role of data.target_roles) {
            await supabase.from('notifications').insert({
              id: crypto.randomUUID(),
              target_role: role,
              title: 'New Survey Available',
              message: `A new survey "${newSurvey.title}" is now open for your response.`,
              link: `/surveys/${newSurvey.id}`,
              type: 'SURVEY_INVITE',
              is_read: false,
            });
          }
        }
      } catch (dbErr) {
        console.error('Supabase survey creation error:', dbErr);
      }
    }

    revalidatePath('/surveys');
    revalidatePath('/admin/surveys');
    revalidatePath('/admin/dashboard');
    revalidatePath('/student/dashboard');
    revalidatePath('/dashboard');
    revalidatePath('/notifications');
    revalidatePath('/admin/notifications');
    revalidatePath('/admin/notifications/history');
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

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('surveys').update(updates).eq('id', id);

        if (questions) {
          await supabase.from('survey_questions').delete().eq('survey_id', id);
          const questionRows = questions.map((q, idx) => ({
            survey_id: id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options || [],
            is_required: q.is_required,
            order_index: idx,
          }));
          await supabase.from('survey_questions').insert(questionRows);
        }
      } catch (dbErr) {
        console.error('Supabase update survey error:', dbErr);
      }
    }

    revalidatePath(`/surveys/${id}`);
    revalidatePath('/admin/surveys');
    revalidatePath('/admin/dashboard');
    revalidatePath('/surveys');
    revalidatePath('/student/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update survey.' };
  }
}

export async function updateSurveyStatusAction(id: string, status: SurveyStatus) {
  const user = await requireRole(['ADMINISTRATOR']);

  const updated = MockAdapter.updateSurvey(id, { status });

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('surveys').update({ status }).eq('id', id);
    } catch (dbErr) {
      console.error('Supabase survey status update error:', dbErr);
    }
  }

  MockAdapter.logAudit(user.email, 'SURVEY_STATUS_CHANGED', 'SURVEY', id, { status });

  revalidatePath('/admin/surveys');
  revalidatePath('/admin/dashboard');
  revalidatePath('/surveys');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
  return { success: true, status: updated?.status };
}

export async function deleteSurveyAction(id: string) {
  const user = await requireRole(['ADMINISTRATOR']);

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('surveys').delete().eq('id', id);
    } catch (dbErr) {
      console.error('Supabase survey delete error:', dbErr);
    }
  }

  MockAdapter.deleteSurvey(id);

  MockAdapter.logAudit(user.email, 'SURVEY_DELETED', 'SURVEY', id);

  revalidatePath('/admin/surveys');
  revalidatePath('/admin/dashboard');
  revalidatePath('/surveys');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
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

  let survey = MockAdapter.getSurveyById(surveyId);
  if (!survey && isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: dbSurvey } = await supabase.from('surveys').select('*').eq('id', surveyId).single();
      if (dbSurvey) {
        const { data: dbQuestions } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', surveyId)
          .order('order_index', { ascending: true });
        MockAdapter.upsertSurveyFromDb(dbSurvey, dbQuestions || []);
        survey = MockAdapter.getSurveyById(surveyId);
      }
    } catch (dbErr) {
      console.warn('Failed to fetch survey from Supabase during submission:', dbErr);
    }
  }

  if (!survey) {
    return { error: 'Survey not found.' };
  }

  // Exact server-side deadline verification using server time
  const now = Date.now();
  const deadlineTime = new Date(survey.end_date).getTime();
  if (now > deadlineTime || survey.status === 'EXPIRED') {
    return { error: 'This survey has passed its scheduled deadline and is no longer accepting responses.' };
  }

  if (survey.status !== 'ACTIVE') {
    return { error: `This survey is currently ${survey.status}. Submissions are not accepted.` };
  }

  // Validate required questions
  let questions = MockAdapter.getQuestionsBySurveyId(surveyId);
  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: dbQuestions } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true });
      if (dbQuestions && dbQuestions.length > 0) {
        questions = dbQuestions;
        MockAdapter.upsertSurveyFromDb(survey, dbQuestions);
      }
    } catch (qErr) {
      console.warn('Supabase questions fetch error in submit:', qErr);
    }
  }

  // Normalize answers dictionary in case client used index or text key
  const normalizedAnswers: Record<string, any> = { ...answers };
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    let val = normalizedAnswers[q.id];

    if (val === undefined || val === null || val === '') {
      // Check if client submitted with numerical index or string index
      val = normalizedAnswers[i] ?? normalizedAnswers[String(i)] ?? normalizedAnswers[q.question_text];
    }

    if (val === undefined || val === null || val === '') {
      // Case-insensitive ID or question text match
      const matchingKey = Object.keys(normalizedAnswers).find(
        (k) =>
          k.toLowerCase() === q.id.toLowerCase() ||
          k.trim().toLowerCase() === q.question_text.trim().toLowerCase()
      );
      if (matchingKey) {
        val = normalizedAnswers[matchingKey];
      }
    }

    if (val !== undefined && val !== null && val !== '') {
      normalizedAnswers[q.id] = val;
    }

    if (q.is_required) {
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
      normalizedAnswers
    );

    // If live Supabase is configured, persist response, answers and participation receipt
    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const responseId = crypto.randomUUID();

        const { error: respErr } = await supabase.from('survey_responses').insert({
          id: responseId,
          survey_id: surveyId,
          user_id: isAnonymous ? null : user.id,
          is_anonymous: isAnonymous,
          receipt_token: result.token,
        });
        if (respErr) {
          console.error('Supabase survey_responses insert error:', respErr);
        }

        const answerRows = Object.entries(normalizedAnswers).map(([qId, val]) => ({
          id: crypto.randomUUID(),
          response_id: responseId,
          question_id: qId,
          answer_text: typeof val === 'object' ? JSON.stringify(val) : String(val),
          answer_numeric: typeof val === 'number' ? val : (!isNaN(Number(val)) && val !== '' ? Number(val) : null),
          answer_json: typeof val === 'object' ? val : null,
        }));

        if (answerRows.length > 0) {
          const { error: ansErr } = await supabase.from('response_answers').insert(answerRows);
          if (ansErr) {
            console.error('Supabase response_answers insert error:', ansErr);
          }
        }

        const { error: recErr } = await supabase.from('survey_participation_receipts').insert({
          id: crypto.randomUUID(),
          survey_id: surveyId,
          user_id: user.id,
          receipt_token: result.token,
        });
        if (recErr) {
          console.error('Supabase survey_participation_receipts insert error:', recErr);
        }
      } catch (dbErr) {
        console.error('Failed to persist survey response to Supabase:', dbErr);
      }
    }

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
    revalidatePath('/student/dashboard');
    revalidatePath('/dashboard');
    revalidatePath('/notifications');
    revalidatePath('/admin/notifications');
    revalidatePath('/admin/notifications/history');
    revalidatePath('/admin/surveys');
    revalidatePath('/admin/reports');
    revalidatePath(`/admin/surveys/${surveyId}/results`);
    revalidatePath('/admin/dashboard');

    return { success: true, token: result.token };
  } catch (err: any) {
    return { error: err.message || 'Submission failed.' };
  }
}

