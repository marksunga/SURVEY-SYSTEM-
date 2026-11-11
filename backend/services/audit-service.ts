import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export interface AuditEventPayload {
  action: string;
  userId?: string | null;
  targetId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

export class AuditService {
  static async logEvent(payload: AuditEventPayload): Promise<void> {
    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('audit_logs').insert({
          action: payload.action,
          user_id: payload.userId || null,
          target_id: payload.targetId || null,
          details: payload.details || {},
          ip_address: payload.ipAddress || null,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('AuditService error:', err);
      }
    }
  }

  static getAuditLogs() {
    return MockAdapter.getAuditLogs();
  }
}
