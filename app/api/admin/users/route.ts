import { NextRequest, NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { createAdminUserAction, toggleUserActiveAction, deleteUserAction } from '@/app/actions/users';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const admin = await requireRole(['ADMINISTRATOR']);
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');

    let users: any[] = [];
    let adminCount = 0;
    let studentCount = 0;

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data: allProfiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && allProfiles) {
          adminCount = allProfiles.filter((p: any) => p.role_id === 'ADMINISTRATOR').length;
          studentCount = allProfiles.filter((p: any) => p.role_id === 'STUDENT').length;

          if (roleParam === 'ADMINISTRATOR') {
            users = allProfiles.filter((u: any) => u.role_id === 'ADMINISTRATOR');
          } else if (roleParam === 'STUDENT') {
            users = allProfiles.filter((u: any) => u.role_id === 'STUDENT');
          } else {
            users = allProfiles;
          }

          return NextResponse.json({
            users,
            currentUserId: admin.id,
            adminCount,
            studentCount,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch users from live Supabase:', err);
      }
    }

    // Fallback to MockAdapter only if live Supabase is not configured
    const allMockProfiles = MockAdapter.getProfiles();
    adminCount = allMockProfiles.filter((p) => p.role_id === 'ADMINISTRATOR').length;
    studentCount = allMockProfiles.filter((p) => p.role_id === 'STUDENT').length;

    users = allMockProfiles;
    if (roleParam === 'ADMINISTRATOR') {
      users = users.filter((u) => u.role_id === 'ADMINISTRATOR');
    } else if (roleParam === 'STUDENT') {
      users = users.filter((u) => u.role_id === 'STUDENT');
    }

    return NextResponse.json({
      users,
      currentUserId: admin.id,
      adminCount,
      studentCount,
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
