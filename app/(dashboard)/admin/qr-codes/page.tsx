import Link from 'next/link';
import { requireRole } from '@/lib/auth/session';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';
import { QrCode, ExternalLink, Eye, ArrowRight, Sparkles } from 'lucide-react';

export default async function AdminQRCodesPage() {
  await requireRole(['ADMINISTRATOR']);

  const surveys = MockAdapter.getSurveys();
  const qrList = surveys.map((s) => {
    let qr = MockAdapter.getQRCodeBySurveyId(s.id);
    if (!qr) {
      const code = `QR-SRV-${s.title.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
      qr = MockAdapter.saveQRCode({
        survey_id: s.id,
        code_data: code,
        access_url: `/surveys/${s.id}`,
        qr_image_data: '',
        is_active: true,
      });
    }
    return {
      survey: s,
      qr,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department QR Code Management Hub</h1>
          <p className="text-xs text-slate-500">
            Generate, download, print, and monitor QR code access for physical labs, notice boards, and student posters.
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="text-xs">
          <Link href="/scan">
            <QrCode className="h-4 w-4 mr-1.5 text-[#4682A9]" />
            Launch Scanner Test
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrList.map(({ survey, qr }) => (
          <div key={survey.id} className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {survey.status} • {qr.scans_count} Scans
              </span>
              <Link
                href={`/surveys/${survey.id}`}
                className="text-xs font-semibold text-[#4682A9] hover:underline flex items-center gap-1"
              >
                Survey <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <QRCodeDisplay
              codeData={qr.code_data}
              surveyTitle={survey.title}
              accessUrl={qr.access_url}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

