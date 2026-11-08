'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export async function validateQRCodeAction(codeOrSurveyId: string) {
  let trimmed = codeOrSurveyId.trim();

  // 1. Extract survey ID or code data if a full URL or relative path was scanned
  if (trimmed.includes('/surveys/')) {
    const after = trimmed.split('/surveys/')[1] || '';
    trimmed = after.split('/')[0].split('?')[0].split('#')[0].trim();
  }

  // Live Supabase lookup
  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();

      // Check survey_qr_codes by code_data or survey_id
      const { data: dbQr } = await supabase
        .from('survey_qr_codes')
        .select('*')
        .or(`code_data.ilike.${trimmed},survey_id.eq.${trimmed}`)
        .single();

      const surveyId = dbQr ? dbQr.survey_id : trimmed;

      const { data: dbSurvey } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (dbSurvey) {
        if (dbQr && !dbQr.is_active) {
          return { valid: false, error: 'This QR Code has been deactivated by the IT Administrator.' };
        }
        if (dbSurvey.status !== 'ACTIVE') {
          return {
            valid: false,
            error: `Survey "${dbSurvey.title}" is currently "${dbSurvey.status}". Only ACTIVE surveys accept submissions.`,
          };
        }

        // Increment scan count in Supabase
        if (dbQr) {
          await supabase
            .from('survey_qr_codes')
            .update({ scans_count: (dbQr.scans_count || 0) + 1 })
            .eq('id', dbQr.id);
        }

        return {
          valid: true,
          surveyId: dbSurvey.id,
          surveyTitle: dbSurvey.title,
          redirectUrl: `/surveys/${dbSurvey.id}`,
        };
      }
    } catch (err) {
      console.warn('Supabase QR validation fallback:', err);
    }
  }

  // MockAdapter fallback
  // 1. Try finding by code_data
  let qr = MockAdapter.getQRCodeByCodeData(trimmed);

  // 2. Fallback: try finding by survey ID
  if (!qr) {
    qr = MockAdapter.getQRCodeBySurveyId(trimmed);
  }

  // 3. Fallback: check if trimmed is directly a valid survey ID
  let survey = qr ? MockAdapter.getSurveyById(qr.survey_id) : MockAdapter.getSurveyById(trimmed);

  if (!survey) {
    return { valid: false, error: 'QR Code or Survey not found in system database.' };
  }

  if (qr && !qr.is_active) {
    return { valid: false, error: 'This QR Code has been deactivated by the IT Administrator.' };
  }

  if (survey.status !== 'ACTIVE') {
    return {
      valid: false,
      error: `Survey "${survey.title}" is currently "${survey.status}". Responses are only permitted for ACTIVE surveys.`,
    };
  }

  // Increment scan count
  if (qr) {
    MockAdapter.incrementQRScan(qr.id);
  }

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

