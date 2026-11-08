import { requireRole } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { QRCodeManager } from '@/components/qr/QRCodeManager';
import { QRCodeRecord } from '@/lib/types/database';

export const metadata = {
  title: 'QR Code Management | IT Department Survey System',
};

export default async function AdminQRCodesPage() {
  await requireRole(['ADMINISTRATOR']);

  const surveys = MockAdapter.getSurveys();
  let qrCodes: QRCodeRecord[] = MockAdapter.getQRCodes();

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('survey_qr_codes').select('*');
      if (!error && data && data.length > 0) {
        qrCodes = data as QRCodeRecord[];
      }
    } catch (err) {
      console.error('Failed to fetch live Supabase QR codes:', err);
    }
  }

  return <QRCodeManager initialSurveys={surveys} initialQRCodes={qrCodes} />;
}
