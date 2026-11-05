export type UserRole = 'STUDENT' | 'IT_PROFESSOR' | 'IT_OFFICER' | 'ADMINISTRATOR';

export interface Role {
  id: UserRole;
  name: string;
  description: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  role_id: UserRole;
  full_name: string;
  email: string;
  department: string;
  id_number?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SurveyCategory = 'ACADEMIC' | 'FACILITY' | 'IT_INFRASTRUCTURE' | 'DEPARTMENT_SERVICES' | 'GENERAL';

export type SurveyStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export interface Survey {
  id: string;
  title: string;
  description: string;
  category: SurveyCategory;
  status: SurveyStatus;
  target_roles: UserRole[];
  is_anonymous_allowed: boolean;
  start_date: string;
  end_date: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  questions_count?: number;
  responses_count?: number;
  qr_code?: QRCodeRecord;
}

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOX'
  | 'SHORT_ANSWER'
  | 'PARAGRAPH'
  | 'RATING_SCALE'
  | 'YES_NO';

export interface QuestionOptions {
  choices?: string[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: QuestionType;
  options: QuestionOptions | string[];
  is_required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyParticipationReceipt {
  id: string;
  survey_id: string;
  user_id: string;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id?: string | null;
  is_anonymous: boolean;
  submission_token: string;
  completed_at: string;
}

export interface ResponseAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer_value: string | string[] | number | boolean;
  created_at: string;
}

export type FeedbackCategory =
  | 'ACADEMIC'
  | 'FACILITIES'
  | 'TECHNICAL_SUPPORT'
  | 'NETWORK_LAB'
  | 'CURRICULUM'
  | 'OTHER';

export type FeedbackStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface Feedback {
  id: string;
  title: string;
  category: FeedbackCategory;
  content_encrypted: string;
  content_iv: string;
  content_tag: string;
  is_anonymous: boolean;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  status: FeedbackStatus;
  admin_notes?: string | null;
  decrypted_content?: string;
  created_at: string;
  updated_at: string;
}

export interface QRCodeRecord {
  id: string;
  survey_id: string;
  code_data: string;
  access_url: string;
  qr_image_data: string;
  is_active: boolean;
  scans_count: number;
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | 'SURVEY_INVITE'
  | 'DEADLINE_REMINDER'
  | 'SYSTEM_ALERT'
  | 'FEEDBACK_UPDATE';

export interface SystemNotification {
  id: string;
  user_id?: string | null;
  target_role?: UserRole | null;
  title: string;
  message: string;
  link?: string | null;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface SystemBackup {
  id: string;
  filename: string;
  size_bytes: number;
  backup_type: 'FULL' | 'SCHEMA_ONLY' | 'DATA_EXPORT';
  created_by?: string | null;
  created_at: string;
}

