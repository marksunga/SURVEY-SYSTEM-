'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { FeedbackCategory, FeedbackStatus } from '@/lib/types/database';
import { createAdminClient, isLiveSupabaseConfigured } from '@/lib/supabase/admin';

export async function submitFeedbackAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Please log in to submit feedback.' };
  }

  const title = (formData.get('title') as string)?.trim();
  const category = (formData.get('category') as FeedbackCategory) || 'OTHER';
  const content = (formData.get('content') as string)?.trim();
  const isAnonymous = formData.get('isAnonymous') === 'true';

  if (!title || !content) {
    return { error: 'Both subject title and feedback content are required.' };
  }

  const newFeedback = MockAdapter.submitFeedback({
    title,
    category,
    content,
    is_anonymous: isAnonymous,
    user_id: user.id,
  });

  // Persist to live Supabase (persists across serverless instances)
  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('feedback').insert({
        id: newFeedback.id,
        user_id: isAnonymous ? null : user.id,
        category,
        title,
        encrypted_content: newFeedback.content_encrypted,
        iv: newFeedback.content_iv,
        auth_tag: newFeedback.content_tag,
        is_anonymous: isAnonymous,
        status: 'PENDING',
        admin_notes: null,
      });

      await supabase.from('notifications').insert({
        target_role: 'ADMINISTRATOR',
        title: 'New Feedback Submitted',
        message: `A new feedback "${title}" has been submitted in category ${category}.`,
        link: '/admin/feedback',
        type: 'FEEDBACK_UPDATE',
        is_read: false,
      });
    } catch (dbErr) {
      console.error('Supabase feedback insertion error:', dbErr);
    }
  }

  MockAdapter.logAudit(
    isAnonymous ? 'ANONYMOUS_USER' : user.email,
    'FEEDBACK_SUBMITTED',
    'FEEDBACK',
    newFeedback.id,
    { category, is_anonymous: isAnonymous }
  );

  MockAdapter.createNotification({
    target_role: 'ADMINISTRATOR',
    title: 'New Feedback Submitted',
    message: `A new feedback "${title}" has been submitted in category ${category}.`,
    link: '/admin/feedback',
    type: 'FEEDBACK_UPDATE',
  });

  revalidatePath('/feedback');
  revalidatePath('/admin/feedback');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
  return { success: true, id: newFeedback.id };
}

export async function updateFeedbackStatusAction(
  id: string,
  status: FeedbackStatus,
  adminNotes?: string
) {
  const user = await requireRole(['ADMINISTRATOR']);

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase
        .from('feedback')
        .update({
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (dbErr) {
      console.error('Supabase update feedback status error:', dbErr);
    }
  }

  const updated = MockAdapter.updateFeedbackStatus(id, status, adminNotes);
  if (!updated && !isLiveSupabaseConfigured()) {
    return { error: 'Feedback record not found.' };
  }

  MockAdapter.logAudit(user.email, 'FEEDBACK_STATUS_UPDATED', 'FEEDBACK', id, {
    status,
    notes_added: Boolean(adminNotes),
  });

  if (updated?.user_id && !updated.is_anonymous) {
    MockAdapter.createNotification({
      user_id: updated.user_id,
      title: 'Feedback Status Updated',
      message: `Your feedback "${updated.title}" status is now ${status.replace('_', ' ')}.`,
      link: '/feedback',
      type: 'FEEDBACK_UPDATE',
    });

    if (isLiveSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from('notifications').insert({
          user_id: updated.user_id,
          title: 'Feedback Status Updated',
          message: `Your feedback "${updated.title}" status is now ${status.replace('_', ' ')}.`,
          link: '/feedback',
          type: 'FEEDBACK_UPDATE',
          is_read: false,
        });
      } catch (err) {
        console.error('Supabase notification insert error:', err);
      }
    }
  }

  revalidatePath('/admin/feedback');
  revalidatePath('/feedback');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function editUserFeedbackAction(
  id: string,
  data: { title?: string; category?: FeedbackCategory; content?: string }
) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Please log in to edit feedback.' };
  }

  const updated = MockAdapter.updateUserFeedback(id, user.id, data);
  if (!updated) {
    return {
      error: 'Cannot edit feedback. Either it was not found, you are not the author, or it is already being reviewed.',
    };
  }

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase
        .from('feedback')
        .update({
          title: updated.title,
          category: updated.category,
          encrypted_content: updated.content_encrypted,
          iv: updated.content_iv,
          auth_tag: updated.content_tag,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Supabase edit feedback error:', err);
    }
  }

  MockAdapter.logAudit(user.email, 'FEEDBACK_EDITED', 'FEEDBACK', id, {
    category: updated.category,
    title: updated.title,
  });

  revalidatePath('/feedback');
  revalidatePath('/admin/feedback');
  return { success: true, feedback: updated };
}

export async function deleteFeedbackAction(id: string) {
  const user = await requireRole(['ADMINISTRATOR']);

  if (isLiveSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      await supabase.from('feedback').delete().eq('id', id);
    } catch (dbErr) {
      console.error('Supabase delete feedback error:', dbErr);
    }
  }

  const success = MockAdapter.deleteFeedback(id);
  if (!success && !isLiveSupabaseConfigured()) {
    return { error: 'Feedback record not found.' };
  }

  MockAdapter.logAudit(user.email, 'FEEDBACK_DELETED', 'FEEDBACK', id);

  revalidatePath('/admin/feedback');
  revalidatePath('/feedback');
  revalidatePath('/admin/dashboard');
  revalidatePath('/student/dashboard');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getUserFeedbacksAction() {
  const user = await getCurrentUser();
  if (!user) return { feedbacks: [] };
  const feedbacks = MockAdapter.getFeedbacks(user.id, user.role_id);
  return { feedbacks };
}
