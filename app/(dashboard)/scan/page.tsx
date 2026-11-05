import { QRScanner } from '@/components/qr/QRScanner';
import { QrCode, ShieldCheck } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
          <QrCode className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department QR Scanner</h1>
        <p className="text-xs text-slate-500">
          Point your device camera at an official IT survey QR code or input the survey reference code.
        </p>
      </div>

      <QRScanner />

      <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-600 text-[11px] flex items-center justify-center gap-2 text-center">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
        <span>Instant validation ensures you are redirected strictly to authorized IT surveys.</span>
      </div>
    </div>
  );
}

