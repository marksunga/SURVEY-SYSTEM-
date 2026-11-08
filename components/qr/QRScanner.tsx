'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Camera,
  QrCode,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Upload,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { validateQRCodeAction } from '@/app/actions/qr';

export function QRScanner() {
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanningFile, setScanningFile] = useState(false);

  const router = useRouter();
  const scannerInstanceRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleVerify(rawText: string) {
    if (!rawText || !rawText.trim() || isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      let cleanCode = rawText.trim();
      if (cleanCode.includes('/surveys/')) {
        const after = cleanCode.split('/surveys/')[1] || '';
        cleanCode = after.split('/')[0].split('?')[0].split('#')[0].trim();
      }

      const res = await validateQRCodeAction(cleanCode);
      if (res.valid && res.redirectUrl) {
        setSuccessMsg(`QR Code Verified! Redirecting to "${res.surveyTitle}"...`);
        setTimeout(() => {
          router.push(res.redirectUrl);
        }, 600);
      } else {
        setError(res.error || 'Invalid or inactive QR code. Please check the code and try again.');
        isProcessingRef.current = false;
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to validate QR code. Please try manual entry.');
      isProcessingRef.current = false;
    } finally {
      setLoading(false);
    }
  }

  // Safe camera lifecycle
  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!cameraActive) return;

      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!active) return;

        const container = document.getElementById('qr-reader-container');
        if (!container) return;

        const scanner = new Html5Qrcode('qr-reader-container');
        scannerInstanceRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText: string) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
              if (scanner.isScanning) {
                await scanner.stop();
                await scanner.clear();
              }
            } catch {
              // safe ignore
            }

            setCameraActive(false);
            isProcessingRef.current = false;
            handleVerify(decodedText);
          },
          () => {
            // Ignore frame decode errors
          }
        );
      } catch (err: any) {
        console.warn('Camera initiation notice:', err);
        setError('Could not access live camera. You can upload a QR image or enter the survey code manually.');
        setCameraActive(false);
      }
    }

    if (cameraActive) {
      startCamera();
    }

    return () => {
      active = false;
      if (scannerInstanceRef.current) {
        try {
          if (scannerInstanceRef.current.isScanning) {
            scannerInstanceRef.current.stop().catch(() => {}).finally(() => {
              try {
                scannerInstanceRef.current?.clear();
              } catch {}
            });
          }
        } catch {
          // ignore cleanup errors safely
        }
      }
    };
  }, [cameraActive]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningFile(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      // Create a temporary off-screen container if needed
      let tempContainer = document.getElementById('qr-temp-file-scanner');
      if (!tempContainer) {
        tempContainer = document.createElement('div');
        tempContainer.id = 'qr-temp-file-scanner';
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);
      }

      const scanner = new Html5Qrcode('qr-temp-file-scanner');
      const decodedText = await scanner.scanFile(file, true);
      await scanner.clear();

      if (decodedText) {
        handleVerify(decodedText);
      } else {
        setError('Could not detect a clear QR Code in this image. Please try another photo or enter the code.');
      }
    } catch (err: any) {
      setError('Unable to read QR Code from this image. Please position the code clearly and try again.');
    } finally {
      setScanningFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleStopCamera() {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          scannerInstanceRef.current.stop().catch(() => {}).finally(() => {
            try {
              scannerInstanceRef.current?.clear();
            } catch {}
          });
        }
      } catch {}
    }
    setCameraActive(false);
  }

  return (
    <Card className="max-w-xl mx-auto border-slate-200 shadow-xs">
      <CardContent className="p-6 space-y-6">
        {/* Camera Box */}
        <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-900 min-h-[260px] flex flex-col items-center justify-center p-4 text-white">
          <div id="qr-reader-container" className="w-full max-w-sm rounded-lg overflow-hidden" />

          {!cameraActive && (
            <div className="text-center space-y-3 p-6">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Camera className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">Live Camera Scanner</p>
                <p className="text-xs text-slate-400">Scan physical posters or flyer QR codes directly.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <Button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCameraActive(true);
                  }}
                  size="sm"
                  className="bg-[#4682A9] hover:bg-[#386B8C] text-white text-xs font-semibold"
                >
                  <Camera className="h-3.5 w-3.5 mr-1.5" />
                  Start Camera
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={scanningFile}
                  className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                  {scanningFile ? 'Scanning Image...' : 'Upload QR Image'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {cameraActive && (
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStopCamera}
                className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs"
              >
                Stop Camera
              </Button>
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
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
            <Button
              type="submit"
              disabled={loading || !manualCode.trim()}
              size="sm"
              className="text-xs bg-[#4682A9] hover:bg-[#386B8C] text-white font-semibold"
            >
              {loading ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>Verify</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Quick test pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Quick Test Codes:</span>
            <button
              type="button"
              onClick={() => {
                setManualCode('QR-SRV-MIDTERM-2026');
                handleVerify('QR-SRV-MIDTERM-2026');
              }}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 hover:bg-[#EAF2F8] hover:text-[#2C5E7D] transition-colors cursor-pointer font-mono"
            >
              QR-SRV-MIDTERM-2026
            </button>
            <button
              type="button"
              onClick={() => {
                setManualCode('QR-SRV-LABS-2026');
                handleVerify('QR-SRV-LABS-2026');
              }}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 hover:bg-[#EAF2F8] hover:text-[#2C5E7D] transition-colors cursor-pointer font-mono"
            >
              QR-SRV-LABS-2026
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
