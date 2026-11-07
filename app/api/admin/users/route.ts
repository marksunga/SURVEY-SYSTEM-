import { NextRequest, NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMINISTRATOR']);
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');

    let users = MockAdapter.getProfiles();

    if (roleParam === 'ADMINISTRATOR') {
      users = users.filter((u) => u.role_id === 'ADMINISTRATOR');
    } else if (roleParam === 'STUDENT') {
      users = users.filter((u) => u.role_id === 'STUDENT');
    }

    return NextResponse.json({
      users,
      currentUserId: admin.id,
      adminCount: MockAdapter.getProfiles().filter((p) => p.role_id === 'ADMINISTRATOR').length,
      studentCount: MockAdapter.getProfiles().filter((p) => p.role_id === 'STUDENT').length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
