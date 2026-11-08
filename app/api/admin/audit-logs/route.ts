import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export async function GET() {
  try {
    await requireRole(['ADMINISTRATOR']);

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data: dbLogs, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && dbLogs && dbLogs.length > 0) {
          // Merge Supabase logs with any mock memory logs not in Supabase
          const mockLogs = MockAdapter.getAuditLogs();
          const dbIds = new Set(dbLogs.map((l: any) => l.id));
          const merged = [...dbLogs, ...mockLogs.filter((l) => !dbIds.has(l.id))];
          return NextResponse.json({ logs: merged });
        }
      } catch (err) {
        console.warn('Supabase audit logs fetch error:', err);
      }
    }

    const logs = MockAdapter.getAuditLogs();
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

