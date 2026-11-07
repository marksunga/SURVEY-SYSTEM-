'use server';

import { revalidatePath } from 'next/cache';
import { MockAdapter } from '@/lib/supabase/mock-adapter';
import { getCurrentUser, requireRole } from '@/lib/auth/session';
import { FeedbackCategory, FeedbackStatus } from '@/lib/types/database';

export async function submitFeedbackAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Please log in to submit feedback.' };
  }

  const title = formData.get('title') as string;
  const category = formData.get('category') as FeedbackCategory;
  const content = formData.get('content') as string;
  const isAnonymous = formData.get('isAnonymous') === 'true';

  if (!title || !content) {
    return { error: 'Title and content are required.' };
  }

  const newFeedback = MockAdapter.submitFeedback({
    title,
    category: category || 'OTHER',
    content,
    is_anonymous: isAnonymous,
    user_id: user.id,
  });

  MockAdapter.logAudit(
    isAnonymous ? 'ANONYMOUS_USER' : user.email,
    'FEEDBACK_SUBMITTED',
    'FEEDBACK',
    newFeedback.id,
    { category, is_anonymous: isAnonymous }
  );

  // Notify officers/admins
  MockAdapter.createNotification({
    target_role: 'ADMINISTRATOR',
    title: 'New Feedback Submitted',
    message: `A new feedback "${title}" has been submitted in category ${category}.`,
    link: '/admin/feedback',
    type: 'FEEDBACK_UPDATE',
  });

  revalidatePath('/feedback');
  revalidatePath('/admin/feedback');
  return { success: true, id: newFeedback.id };
}

export async function updateFeedbackStatusAction(
  id: string,
  status: FeedbackStatus,
  adminNotes?: string
) {
  const user = await requireRole(['ADMINISTRATOR']);

  const updated = MockAdapter.updateFeedbackStatus(id, status, adminNotes);
  if (!updated) {
    return { error: 'Feedback record not found.' };
  }

  MockAdapter.logAudit(user.email, 'FEEDBACK_STATUS_UPDATED', 'FEEDBACK', id, {
    status,
    notes_added: Boolean(adminNotes),
  });

  // If user was not anonymous, notify them
  if (updated.user_id && !updated.is_anonymous) {
    MockAdapter.createNotification({
      user_id: updated.user_id,
      title: 'Feedback Status Updated',
      message: `Your feedback "${updated.title}" status is now ${status.replace('_', ' ')}.`,
      link: '/feedback',
      type: 'FEEDBACK_UPDATE',
    });
  }

  revalidatePath('/admin/feedback');
  revalidatePath('/feedback');
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

  const success = MockAdapter.deleteFeedback(id);
  if (!success) {
    return { error: 'Feedback record not found.' };
  }

  MockAdapter.logAudit(user.email, 'FEEDBACK_DELETED', 'FEEDBACK', id);

  revalidatePath('/admin/feedback');
  revalidatePath('/feedback');
  return { success: true };
}

export async function getUserFeedbacksAction() {
  const user = await getCurrentUser();
  if (!user) return { feedbacks: [] };
  const feedbacks = MockAdapter.getFeedbacks(user.id, user.role_id);
  return { feedbacks };
}

