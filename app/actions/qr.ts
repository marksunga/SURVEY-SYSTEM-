'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

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
  await requireRole(['ADMINISTRATOR']);
  // update
  revalidatePath('/admin/qr-codes');
  return { success: true };
}

export async function deleteQRCodeAction(id: string) {
  try {
    const admin = await requireRole(['ADMINISTRATOR']);

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('survey_qr_codes').delete().or(`id.eq.${id},survey_id.eq.${id}`);
      } catch (err) {
        console.error('Supabase QR code delete error:', err);
      }
    }

    const removed = MockAdapter.deleteQRCode(id);

    MockAdapter.logAudit(admin.email, 'QR_CODE_DELETED', 'QR_CODE', id, {
      deleted_by: admin.email,
    });

    revalidatePath('/admin/qr-codes');
    return { success: true, removed };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete QR code.' };
  }
}

export async function generateQRCodeAction(surveyId: string) {
  try {
    const admin = await requireRole(['ADMINISTRATOR']);
    const survey = MockAdapter.getSurveyById(surveyId);
    if (!survey) {
      return { error: 'Survey not found.' };
    }

    const cleanName = survey.title.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const code = `QR-SRV-${cleanName}-${Date.now().toString().slice(-4)}`;

    const newQr = MockAdapter.saveQRCode({
      survey_id: survey.id,
      code_data: code,
      access_url: `/surveys/${survey.id}`,
      qr_image_data: '',
      is_active: true,
    });

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('survey_qr_codes').upsert({
          id: newQr.id,
          survey_id: survey.id,
          code_data: code,
          access_url: `/surveys/${survey.id}`,
          is_active: true,
        });
      } catch (err) {
        console.error('Supabase QR code save error:', err);
      }
    }

    MockAdapter.logAudit(admin.email, 'QR_CODE_GENERATED', 'QR_CODE', newQr.id, {
      survey_id: survey.id,
      code_data: code,
    });

    revalidatePath('/admin/qr-codes');
    return { success: true, qr: newQr };
  } catch (err: any) {
    return { error: err.message || 'Failed to generate QR code.' };
  }
}

