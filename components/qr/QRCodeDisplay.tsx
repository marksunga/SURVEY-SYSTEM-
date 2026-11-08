'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Printer, Copy, Check, QrCode as QrIcon, Trash2, AlertTriangle } from 'lucide-react';

interface QRCodeDisplayProps {
  codeData: string;
  surveyTitle: string;
  accessUrl: string;
  surveyDescription?: string;
  qrId?: string;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function QRCodeDisplay({
  codeData,
  surveyTitle,
  accessUrl,
  surveyDescription,
  qrId,
  onDelete,
  isDeleting = false,
}: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${accessUrl}`
    : accessUrl;

  useEffect(() => {
    // Generate high-resolution QR Code data URL matching UA IT Dept palette
    QRCode.toDataURL(fullUrl, {
      width: 400,
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

  // Isolated flyer printing: prints strictly THIS flyer with UA IT branding on a single clean page
  function handlePrintFlyer() {
    if (!dataUrl) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const cleanDesc = surveyDescription
      ? surveyDescription.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      : 'Scan the official QR code below using your smartphone camera or any QR scanner to participate in this departmental survey.';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Survey QR Flyer - ${surveyTitle}</title>
        <style>
          @page {
            size: portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0F172A;
            margin: 0;
            padding: 16px 20px;
            text-align: center;
            background: #FFFFFF;
          }
          .header {
            border-bottom: 2.5px solid #2C5E7D;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .brand-ua {
            font-size: 20px;
            font-weight: 800;
            color: #2C5E7D;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .brand-sub {
            font-size: 12px;
            font-weight: 600;
            color: #64748B;
            margin-top: 3px;
            letter-spacing: 0.04em;
          }
          .flyer-badge {
            display: inline-block;
            margin-top: 10px;
            padding: 4px 14px;
            background: #EAF2F8;
            color: #2C5E7D;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .title {
            font-size: 22px;
            font-weight: 800;
            color: #0F172A;
            margin: 12px auto 6px;
            line-height: 1.25;
            max-width: 520px;
          }
          .desc {
            font-size: 13px;
            color: #475569;
            max-width: 500px;
            margin: 0 auto 16px;
            line-height: 1.45;
          }
          .qr-box {
            display: inline-block;
            padding: 16px 20px 12px;
            border: 2px solid #CBD5E1;
            border-radius: 16px;
            background: #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }
          .qr-img {
            width: 250px;
            height: 250px;
            display: block;
            margin: 0 auto;
          }
          .code-label {
            margin-top: 8px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 13px;
            font-weight: 800;
            color: #1E293B;
            letter-spacing: 0.06em;
          }
          .instructions {
            margin: 20px auto 0;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 12px 18px;
            max-width: 480px;
            text-align: left;
          }
          .instructions-title {
            font-size: 11px;
            font-weight: 700;
            color: #1E293B;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .instructions-list {
            margin: 0;
            padding-left: 18px;
            font-size: 12px;
            color: #475569;
            line-height: 1.5;
          }
          .url-box {
            margin-top: 14px;
            font-size: 11px;
            color: #64748B;
          }
          .url-link {
            color: #2C5E7D;
            font-weight: 700;
            word-break: break-all;
          }
          .footer {
            margin-top: 24px;
            border-top: 1px solid #E2E8F0;
            padding-top: 8px;
            font-size: 10px;
            color: #94A3B8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand-ua">University of the Assumption</div>
          <div class="brand-sub">Information Technology Department • Academic Evaluation System</div>
        </div>

        <div class="flyer-badge">Department Survey Access Flyer</div>
        <h1 class="title">${surveyTitle}</h1>
        <p class="desc">${cleanDesc}</p>

        <div class="qr-box">
          <img class="qr-img" src="${dataUrl}" alt="QR Code" />
          <div class="code-label">${codeData}</div>
        </div>

        <div class="instructions">
          <div class="instructions-title">Quick Scanning Steps</div>
          <ol class="instructions-list">
            <li>Open the camera on your smartphone or scan through the UA Student Portal.</li>
            <li>Align your camera lens with the QR Code.</li>
            <li>Tap the link banner to complete and submit your confidential evaluation.</li>
          </ol>
        </div>

        <div class="url-box">
          Direct Link: <span class="url-link">${fullUrl}</span>
        </div>

        <div class="footer">
          University of the Assumption IT Department • Official Flyer • Biasa, Maganaca, Mayap.
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 250);
  }

  return (
    <>
      <Card className="border-slate-200 overflow-hidden shadow-xs hover:shadow-sm transition-shadow">
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
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyUrl}
              className="text-xs"
              title="Copy direct survey link"
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
              title="Download high-resolution PNG image"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-blue-600" />
              Download PNG
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintFlyer}
              disabled={!dataUrl}
              className="text-xs"
              title="Print single-page announcement flyer for this QR code"
            >
              <Printer className="h-3.5 w-3.5 mr-1 text-slate-700" />
              Print Flyer
            </Button>

            {onDelete && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                title="Remove or delete this QR code"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1 text-rose-600" />
                Remove QR
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle className="text-base font-bold text-slate-900">Remove QR Code</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to remove the QR Code <strong className="text-slate-800 font-mono">{codeData}</strong> for{' '}
              <strong className="text-slate-800">{surveyTitle}</strong>?
              <span className="block mt-1 text-rose-600">
                Printed physical flyers or saved images with this code will no longer redirect students to this survey.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete?.();
              }}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete QR Code'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
