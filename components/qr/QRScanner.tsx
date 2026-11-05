'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, QrCode, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { validateQRCodeAction } from '@/app/actions/qr';

export function QRScanner() {
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const router = useRouter();
  const scannerRef = useRef<any>(null);

  async function handleVerify(code: string) {
    if (!code.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await validateQRCodeAction(code);
      if (res.valid && res.redirectUrl) {
        setSuccessMsg(`Valid QR Code! Redirecting to "${res.surveyTitle}"...`);
        setTimeout(() => {
          router.push(res.redirectUrl);
        }, 800);
      } else {
        setError(res.error || 'Invalid or inactive QR code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to validate QR code.');
    } finally {
      setLoading(false);
    }
  }

  // Camera scanner lifecycle using html5-qrcode
  useEffect(() => {
    let html5QrCode: any = null;

    if (cameraActive) {
      import('html5-qrcode')
        .then((module) => {
          const Html5Qrcode = module.Html5Qrcode;
          html5QrCode = new Html5Qrcode('qr-reader-container');
          scannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              (decodedText: string) => {
                // Check if decoded text is a full URL or direct code
                let code = decodedText;
                if (decodedText.includes('/surveys/')) {
                  const parts = decodedText.split('/surveys/');
                  code = parts[1];
                }
                html5QrCode.stop().then(() => {
                  setCameraActive(false);
                  handleVerify(code);
                });
              },
              () => {
                // parse error ignore
              }
            )
            .catch((err: any) => {
              console.warn('Camera start error:', err);
              setError('Could not access camera. Please enter survey code manually.');
              setCameraActive(false);
            });
        })
        .catch(() => {
          setError('QR Scanner library failed to load. Use manual code.');
        });
    }

    return () => {
      if (scannerRef.current && cameraActive) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [cameraActive]);

  return (
    <Card className="max-w-xl mx-auto border-slate-200">
      <CardContent className="p-6 space-y-6">
        {/* Camera Box */}
        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-900 min-h-[260px] flex flex-col items-center justify-center p-4 text-white">
          <div id="qr-reader-container" className="w-full max-w-sm rounded-lg overflow-hidden" />

          {!cameraActive && (
            <div className="text-center space-y-3 p-6">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">Live Camera Scanner</p>
                <p className="text-xs text-slate-400">Position the QR code within your camera lens.</p>
              </div>
              <Button
                type="button"
                onClick={() => setCameraActive(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Start Camera
              </Button>
            </div>
          )}

          {cameraActive && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCameraActive(false)}
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
              >
                Stop Camera
              </Button>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Manual Code Fallback */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Or Enter Survey Code Manually
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(manualCode);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <QrCode className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <Input
                type="text"
                placeholder="e.g., QR-SRV-MIDTERM-2026 or Survey ID"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <Button type="submit" disabled={loading || !manualCode.trim()} size="sm" className="text-xs">
              <span>Verify</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </form>

          {/* Quick test pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400">Quick Test Codes:</span>
            <button
              type="button"
              onClick={() => {
                setManualCode('QR-SRV-MIDTERM-2026');
                handleVerify('QR-SRV-MIDTERM-2026');
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              QR-SRV-MIDTERM-2026
            </button>
            <button
              type="button"
              onClick={() => {
                setManualCode('QR-SRV-LABS-2026');
                handleVerify('QR-SRV-LABS-2026');
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              QR-SRV-LABS-2026
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

