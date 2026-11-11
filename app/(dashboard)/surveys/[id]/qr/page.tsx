import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';
import { ArrowLeft } from 'lucide-react';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export default async function SurveyQRPage({
  params,
}: {
  params: { id: string };
}) {
  let survey = MockAdapter.getSurveyById(params.id);
  let qr = MockAdapter.getQRCodeBySurveyId(params.id);

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: dbSurvey } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', params.id)
        .single();

      if (dbSurvey) {
        survey = dbSurvey as any;
        const { data: dbQr } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('survey_id', params.id)
          .single();
        if (dbQr) qr = dbQr as any;
      }
    } catch (err) {
      console.warn('Supabase survey QR page fallback:', err);
    }
  }

  if (!survey) notFound();

  if (!qr) {
    const code = `QR-SRV-${survey.title.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
    qr = MockAdapter.saveQRCode({
      survey_id: survey.id,
      code_data: code,
      access_url: `/surveys/${survey.id}`,
      qr_image_data: '',
      is_active: true,
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/surveys/${survey.id}`}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Survey
        </Link>
        <span className="text-xs text-slate-400">Scan Count: {qr.scans_count || 0} scans</span>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Official Survey QR Code</h1>
        <p className="text-xs text-slate-500">
          Share this code with students or faculty for direct smartphone survey access.
        </p>
      </div>

      <QRCodeDisplay
        codeData={qr.code_data}
        surveyTitle={survey.title}
        accessUrl={qr.access_url}
        surveyDescription={survey.description}
      />
    </div>
  );
}
