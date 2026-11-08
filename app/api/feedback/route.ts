import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { decryptAES256 } from '@/lib/crypto/aes';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data: dbFeedbacks, error } = await supabase
          .from('feedback')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_anonymous', false)
          .order('created_at', { ascending: false });

        if (!error && dbFeedbacks && dbFeedbacks.length > 0) {
          const formatted = dbFeedbacks.map((f: any) => {
            const encrypted = f.encrypted_content || f.content_encrypted || '';
            const iv = f.iv || f.content_iv || '';
            const tag = f.auth_tag || f.content_tag || '';
            let decrypted = '[Encrypted Content Protected]';
            try {
              decrypted = decryptAES256(encrypted, iv, tag);
            } catch {
              decrypted = '[Protected Ciphertext]';
            }
            return {
              id: f.id,
              user_id: f.user_id,
              category: f.category,
              title: f.title,
              content_encrypted: encrypted,
              content_iv: iv,
              content_tag: tag,
              is_anonymous: false,
              status: f.status,
              admin_notes: f.admin_notes,
              created_at: f.created_at,
              updated_at: f.updated_at,
              decrypted_content: decrypted,
            };
          });
          return NextResponse.json({ feedbacks: formatted });
        }
      } catch (err) {
        console.warn('Supabase student feedbacks fetch fallback:', err);
      }
    }

    const feedbacks = MockAdapter.getFeedbacks(user.id, user.role_id);
    return NextResponse.json({ feedbacks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch feedback' }, { status: 500 });
  }
}
