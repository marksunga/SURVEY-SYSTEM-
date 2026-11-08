import { createClient } from '@supabase/supabase-js';

export function isLiveSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const useMock = process.env.USE_LOCAL_MOCK_STORAGE === 'true';

  if (useMock) return false;
  if (!url || url.includes('placeholder') || url.includes('your-project')) return false;
  if (!key || key.includes('demo_service_key') || key.includes('eyJhbGciOi...')) return false;

  return true;
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-itdept.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_key';

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

