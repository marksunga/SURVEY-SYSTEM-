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

  let surveys = MockAdapter.getSurveys().filter((s) => s.status === 'ACTIVE');
  let qrCodes: QRCodeRecord[] = MockAdapter.getQRCodes();

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const [sRes, qRes] = await Promise.all([
        supabase
          .from('surveys')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false }),
        supabase.from('qr_codes').select('*'),
      ]);

      if (sRes.data && sRes.data.length > 0) {
        surveys = sRes.data;
      }
      if (qRes.data && qRes.data.length > 0) {
        qrCodes = qRes.data as QRCodeRecord[];
      }
    } catch (err) {
      console.error('Failed to fetch live Supabase QR codes:', err);
    }
  }

  return <QRCodeManager initialSurveys={surveys} initialQRCodes={qrCodes} />;
}
