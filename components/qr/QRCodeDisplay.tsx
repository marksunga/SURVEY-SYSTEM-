'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer, Copy, Check, ExternalLink, QrCode as QrIcon } from 'lucide-react';

interface QRCodeDisplayProps {
  codeData: string;
  surveyTitle: string;
  accessUrl: string;
}

export function QRCodeDisplay({ codeData, surveyTitle, accessUrl }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${accessUrl}`
    : accessUrl;

  useEffect(() => {
    // Generate QR Code data URL with dark blue coloring matching IT Dept palette
    QRCode.toDataURL(fullUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then(setDataUrl)
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [fullUrl]);

  function handleCopyUrl() {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR-${codeData}.png`;
    a.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <Card className="border-slate-200 overflow-hidden shadow-sm">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-xs flex flex-col items-center">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR Code for ${surveyTitle}`}
              className="w-56 h-56 object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center bg-slate-50 text-slate-400">
              <QrIcon className="h-10 w-10 animate-spin" />
            </div>
          )}
          <div className="mt-2 text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
            {codeData}
          </div>
        </div>

        <div className="space-y-1 max-w-sm">
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{surveyTitle}</h4>
          <p className="text-xs text-slate-500">Scan using any smartphone camera or the IT Dept scanner.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyUrl}
            className="text-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!dataUrl}
            className="text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1 text-blue-600" />
            Download PNG
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-xs"
          >
            <Printer className="h-3.5 w-3.5 mr-1 text-slate-600" />
            Print Flyer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

