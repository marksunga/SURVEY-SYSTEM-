import { NextRequest, NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { toggleQRCodeActiveAction, deleteQRCodeAction, generateQRCodeAction } from '@/app/actions/qr';

export async function GET() {
  try {
    await requireRole(['ADMINISTRATOR']);

    let surveys = MockAdapter.getSurveys();
    let qrCodes = MockAdapter.getQRCodes();

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const [sRes, qRes] = await Promise.all([
          supabase.from('surveys').select('*').order('created_at', { ascending: false }),
          supabase.from('qr_codes').select('*'),
        ]);

        if (sRes.data) surveys = sRes.data;
        if (qRes.data) qrCodes = qRes.data;
      } catch (err) {
        console.warn('Supabase QR codes API error:', err);
      }
    }

    const items = qrCodes.map((qr) => {
      const survey = surveys.find((s) => s.id === qr.survey_id);
      return {
        ...qr,
        survey_title: survey?.title || 'Unknown Survey',
        survey_status: survey?.status || 'UNKNOWN',
      };
    });

    return NextResponse.json({ qrCodes: items, surveys });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole(['ADMINISTRATOR']);
    const body = await request.json();
    const { id, currentState } = body;

    if (!id) {
      return NextResponse.json({ error: 'QR Code ID is required.' }, { status: 400 });
    }

    const result = await toggleQRCodeActiveAction(id, typeof currentState === 'boolean' ? currentState : false);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMINISTRATOR']);
    const body = await request.json();
    const { surveyId } = body;

    if (!surveyId) {
      return NextResponse.json({ error: 'Survey ID is required.' }, { status: 400 });
    }

    const result = await generateQRCodeAction(surveyId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole(['ADMINISTRATOR']);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'QR Code ID is required.' }, { status: 400 });
    }

    const result = await deleteQRCodeAction(id);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 403 });
  }
}

