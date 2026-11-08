'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { deleteQRCodeAction, generateQRCodeAction } from '@/app/actions/qr';
import { Survey, QRCodeRecord } from '@/lib/types/database';
import {
  QrCode,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface QRCodeManagerProps {
  initialSurveys: Survey[];
  initialQRCodes: QRCodeRecord[];
}

export function QRCodeManager({ initialSurveys, initialQRCodes }: QRCodeManagerProps) {
  const [surveys] = useState<Survey[]>(initialSurveys);
  const [qrCodes, setQrCodes] = useState<QRCodeRecord[]>(initialQRCodes);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingSurveyId, setGeneratingSurveyId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  function showToast(text: string, type: 'success' | 'error' = 'success') {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }

  async function handleDelete(qrId: string, surveyTitle: string) {
    setDeletingId(qrId);
    try {
      const res = await deleteQRCodeAction(qrId);
      if (res.success) {
        setQrCodes((prev) => prev.filter((q) => q.id !== qrId && q.survey_id !== qrId));
        showToast(`QR Code for "${surveyTitle}" was successfully removed.`);
      } else {
        showToast(res.error || 'Failed to remove QR Code.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting QR Code.', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleGenerate(surveyId: string, surveyTitle: string) {
    setGeneratingSurveyId(surveyId);
    try {
      const res = await generateQRCodeAction(surveyId);
      if (res.success && res.qr) {
        setQrCodes((prev) => {
          const filtered = prev.filter((q) => q.survey_id !== surveyId);
          return [...filtered, res.qr!];
        });
        showToast(`New QR Code created for "${surveyTitle}".`);
      } else {
        showToast(res.error || 'Failed to generate QR Code.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error generating QR Code.', 'error');
    } finally {
      setGeneratingSurveyId(null);
    }
  }

  // Map each survey to its active QR code (if any)
  const items = surveys.map((s) => ({
    survey: s,
    qr: qrCodes.find((q) => q.survey_id === s.id),
  }));

  const totalQRs = qrCodes.length;
  const totalScans = qrCodes.reduce((acc, q) => acc + (q.scans_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-xs transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#2C5E7D] text-[11px] font-semibold border border-[#D1E3EC]">
              <QrCode className="h-3 w-3 text-[#4682A9]" />
              Physical & Poster Access
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {totalQRs} Active {totalQRs === 1 ? 'QR' : 'QRs'} • {totalScans} Total Scans
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Code Management Hub</h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Generate, download, print individual flyers, or remove access QR codes for campus laboratories and student boards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="/scan">
              <QrCode className="h-4 w-4 mr-1.5 text-[#4682A9]" />
              Launch Scanner
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid of QR Code Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ survey, qr }) => (
          <div key={survey.id} className="space-y-2 flex flex-col">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                {survey.status} {qr ? `• ${qr.scans_count} Scans` : '• No QR Assigned'}
              </span>
              <Link
                href={`/surveys/${survey.id}`}
                className="text-xs font-semibold text-[#4682A9] hover:underline flex items-center gap-1"
              >
                Survey <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {qr ? (
              <QRCodeDisplay
                codeData={qr.code_data}
                surveyTitle={survey.title}
                accessUrl={qr.access_url}
                surveyDescription={survey.description}
                qrId={qr.id}
                onDelete={() => handleDelete(qr.id, survey.title)}
                isDeleting={deletingId === qr.id}
              />
            ) : (
              <Card className="border-slate-200 border-dashed bg-slate-50/50 flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[360px]">
                <CardContent className="p-0 flex flex-col items-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">{survey.title}</h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      No active QR code assigned to this survey. Students cannot access it via flyer scan.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleGenerate(survey.id, survey.title)}
                    disabled={generatingSurveyId === survey.id}
                    className="bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold shadow-xs"
                  >
                    {generatingSurveyId === survey.id ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <PlusCircle className="h-3.5 w-3.5" />
                        Generate QR Code
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

