import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await requireRole(['ADMINISTRATOR']);
    const feedbacks = MockAdapter.getFeedbacks(user.id, user.role_id);
    return NextResponse.json({ feedbacks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

