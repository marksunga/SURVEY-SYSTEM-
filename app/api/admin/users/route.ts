import { NextRequest, NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminUserAction, toggleUserActiveAction, deleteUserAction } from '@/app/actions/users';

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

export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMINISTRATOR']);
    const body = await request.json();
    const result = await createAdminUserAction(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 403 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole(['ADMINISTRATOR']);
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const result = await toggleUserActiveAction(userId);
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
    const userId = searchParams.get('userId') || searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const result = await deleteUserAction(userId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: 403 });
  }
}
