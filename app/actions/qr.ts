'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';

export async function validateQRCodeAction(codeOrSurveyId: string) {
  const trimmed = codeOrSurveyId.trim();

  // 1. Try finding by code_data
  let qr = MockAdapter.getQRCodeByCodeData(trimmed);

  // 2. Fallback: try finding by survey ID
  if (!qr) {
    qr = MockAdapter.getQRCodeBySurveyId(trimmed);
  }

  if (!qr) {
    return { valid: false, error: 'QR Code not found in system database.' };
  }

  if (!qr.is_active) {
    return { valid: false, error: 'This QR Code has been deactivated by the IT Administrator.' };
  }

  const survey = MockAdapter.getSurveyById(qr.survey_id);
  if (!survey) {
    return { valid: false, error: 'Target survey no longer exists.' };
  }

  if (survey.status !== 'ACTIVE') {
    return {
      valid: false,
      error: `Survey is currently "${survey.status}". Responses are only permitted for ACTIVE surveys.`,
    };
  }

  // Increment scan count
  MockAdapter.incrementQRScan(qr.id);

  return {
    valid: true,
    surveyId: survey.id,
    surveyTitle: survey.title,
    redirectUrl: `/surveys/${survey.id}`,
  };
}

export async function toggleQRCodeActiveAction(id: string, currentState: boolean) {
  const user = await requireRole(['ADMINISTRATOR']);
  const qrCodes = MockAdapter.getQRCodeByCodeData(id); // helper
  // update
  revalidatePath('/admin/qr-codes');
  return { success: true };
}

