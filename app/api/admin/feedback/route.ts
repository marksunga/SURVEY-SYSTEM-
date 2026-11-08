import { NextResponse } from 'next/server';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { requireRole } from '@/lib/auth/session';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';
import { decryptAES256 } from '@/lib/crypto/aes';

export async function GET() {
  try {
    const user = await requireRole(['ADMINISTRATOR']);

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data: dbFeedbacks, error } = await supabase
          .from('feedback')
          .select('*, profiles:user_id(email, full_name)')
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
              user_id: f.is_anonymous ? null : f.user_id,
              user_email: f.is_anonymous ? null : (f.profiles?.email || null),
              user_name: f.is_anonymous ? null : (f.profiles?.full_name || 'Enrolled Student'),
              category: f.category,
              title: f.title,
              content_encrypted: encrypted,
              content_iv: iv,
              content_tag: tag,
              is_anonymous: f.is_anonymous,
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
        console.warn('Supabase admin feedbacks fetch fallback:', err);
      }
    }

    const feedbacks = MockAdapter.getFeedbacks(user.id, user.role_id);
    return NextResponse.json({ feedbacks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
