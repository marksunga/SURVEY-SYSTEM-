import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';

export async function GET() {
  try {
    await requireRole(['ADMINISTRATOR']);
    const users = MockAdapter.getProfiles();
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

