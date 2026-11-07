import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['ADMINISTRATOR']);
    const results = MockAdapter.getSurveyResults(params.id);
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

