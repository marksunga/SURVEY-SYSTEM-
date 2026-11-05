import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';

export async function GET() {
  try {
    await requireRole(['ADMINISTRATOR']);
    const logs = MockAdapter.getAuditLogs();
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

