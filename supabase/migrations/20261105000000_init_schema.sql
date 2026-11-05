-- ==============================================================================
-- IT DEPARTMENT FEEDBACK AND SURVEY SYSTEM
-- Initial PostgreSQL Migration Script (Supabase)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-running in development (cascade)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS system_backups CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS response_answers CASCADE;
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS survey_participation_receipts CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ------------------------------------------------------------------------------
-- 1. ROLES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert system default roles
INSERT INTO roles (id, name, description) VALUES
('STUDENT', 'Student', 'Enrolled IT student with survey participation & feedback rights'),
('IT_PROFESSOR', 'IT Professor', 'Faculty member with assigned survey participation & analytics rights'),
('IT_OFFICER', 'IT Officer', 'IT staff member managing surveys, questions, QR codes, and reports'),
('ADMINISTRATOR', 'Administrator', 'Full system control, user RBAC, audit logs, and database management')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL DEFAULT 'STUDENT' REFERENCES roles(id) ON UPDATE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT DEFAULT 'Information Technology',
    id_number TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- ------------------------------------------------------------------------------
-- 3. SURVEYS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'EXPIRED', 'CLOSED')),
    target_roles TEXT[] DEFAULT ARRAY['STUDENT', 'IT_PROFESSOR']::TEXT[],
    is_anonymous_allowed BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_dates ON surveys(start_date, end_date);
CREATE INDEX idx_surveys_created_by ON surveys(created_by);

-- ------------------------------------------------------------------------------
-- 4. SURVEY_QUESTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN (
        'MULTIPLE_CHOICE',
        'CHECKBOX',
        'SHORT_ANSWER',
        'PARAGRAPH',
        'RATING_SCALE',
        'YES_NO'
    )),
    options JSONB DEFAULT '[]'::JSONB,
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_survey ON survey_questions(survey_id);
CREATE INDEX idx_questions_order ON survey_questions(survey_id, order_index);

-- ------------------------------------------------------------------------------
-- 5. SURVEY_PARTICIPATION_RECEIPTS (Cryptographic Identity Separation)
-- Tracks that user X has completed survey Y to prevent duplicates.
-- Notice: Does NOT link to survey_responses table rows!
-- ------------------------------------------------------------------------------
CREATE TABLE survey_participation_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (survey_id, user_id)
);

CREATE INDEX idx_receipts_user_survey ON survey_participation_receipts(user_id, survey_id);

-- ------------------------------------------------------------------------------
-- 6. SURVEY_RESPONSES TABLE
-- Stores answers. In anonymous mode, user_id IS NULL and no link exists to receipts.
-- ------------------------------------------------------------------------------
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    submission_token TEXT UNIQUE NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_responses_token ON survey_responses(submission_token);

-- ------------------------------------------------------------------------------
-- 7. RESPONSE_ANSWERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE response_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    answer_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_answers_response ON response_answers(response_id);
CREATE INDEX idx_answers_question ON response_answers(question_id);

-- ------------------------------------------------------------------------------
-- 8. FEEDBACK TABLE (AES-256 Encrypted Payload)
-- ------------------------------------------------------------------------------
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'ACADEMIC',
        'FACILITIES',
        'TECHNICAL_SUPPORT',
        'NETWORK_LAB',
        'CURRICULUM',
        'OTHER'
    )),
    content_encrypted TEXT NOT NULL,
    content_iv TEXT NOT NULL,
    content_tag TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING',
        'UNDER_REVIEW',
        'RESOLVED',
        'REJECTED'
    )),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_category ON feedback(category);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_user ON feedback(user_id);

-- ------------------------------------------------------------------------------
-- 9. QR_CODES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID UNIQUE NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    code_data TEXT NOT NULL UNIQUE,
    access_url TEXT NOT NULL,
    qr_image_data TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    scans_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_survey ON qr_codes(survey_id);
CREATE INDEX idx_qr_code_data ON qr_codes(code_data);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_role TEXT REFERENCES roles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    type TEXT NOT NULL CHECK (type IN (
        'SURVEY_INVITE',
        'DEADLINE_REMINDER',
        'SYSTEM_ALERT',
        'FEEDBACK_UPDATE'
    )),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_role ON notifications(target_role);

-- ------------------------------------------------------------------------------
-- 11. AUDIT_LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ------------------------------------------------------------------------------
-- 12. SYSTEM_BACKUPS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE system_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    backup_type TEXT NOT NULL DEFAULT 'FULL' CHECK (backup_type IN ('FULL', 'SCHEMA_ONLY', 'DATA_EXPORT')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS & FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_surveys_updated_at
BEFORE UPDATE ON surveys
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_questions_updated_at
BEFORE UPDATE ON survey_questions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_feedback_updated_at
BEFORE UPDATE ON feedback
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_qr_codes_updated_at
BEFORE UPDATE ON qr_codes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-sync Supabase auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role_id, id_number, department)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role_id', 'STUDENT'),
        COALESCE(NEW.raw_user_meta_data->>'id_number', 'ID-' || floor(random() * 90000 + 10000)::text),
        COALESCE(NEW.raw_user_meta_data->>'department', 'Information Technology')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role_id = EXCLUDED.role_id,
        id_number = EXCLUDED.id_number,
        department = EXCLUDED.department;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_participation_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user role from auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
    SELECT role_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins have full profile control"
ON profiles FOR ALL TO authenticated USING (public.get_current_role() = 'ADMINISTRATOR');

-- Surveys Policies
CREATE POLICY "Active surveys are readable by authorized target roles"
ON surveys FOR SELECT TO authenticated USING (
    (status = 'ACTIVE' AND public.get_current_role() = ANY(target_roles))
    OR public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER')
);

CREATE POLICY "Admins and IT Officers can manage surveys"
ON surveys FOR ALL TO authenticated USING (
    public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER')
);

-- Survey Questions Policies
CREATE POLICY "Questions readable by anyone who can read survey"
ON survey_questions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM surveys s WHERE s.id = survey_questions.survey_id)
);

CREATE POLICY "Admins and IT Officers can manage questions"
ON survey_questions FOR ALL TO authenticated USING (
    public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER')
);

-- Participation Receipts Policies
CREATE POLICY "Users can see their own receipts"
ON survey_participation_receipts FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR public.get_current_role() = 'ADMINISTRATOR'
);

CREATE POLICY "Users can insert their own receipt"
ON survey_participation_receipts FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
);

-- Survey Responses Policies
CREATE POLICY "Admins and IT Officers can read all responses"
ON survey_responses FOR SELECT TO authenticated USING (
    public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER', 'IT_PROFESSOR')
    OR (auth.uid() = user_id AND is_anonymous = FALSE)
);

CREATE POLICY "Authenticated users can submit survey responses"
ON survey_responses FOR INSERT TO authenticated WITH CHECK (true);

-- Response Answers Policies
CREATE POLICY "Authorized roles can read response answers"
ON response_answers FOR SELECT TO authenticated USING (
    public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER', 'IT_PROFESSOR')
);

CREATE POLICY "Users can insert response answers"
ON response_answers FOR INSERT TO authenticated WITH CHECK (true);

-- Feedback Policies
CREATE POLICY "Users can read their own non-anonymous feedback"
ON feedback FOR SELECT TO authenticated USING (
    (auth.uid() = user_id AND is_anonymous = FALSE)
    OR public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER')
);

CREATE POLICY "Authenticated users can insert feedback"
ON feedback FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins and Officers can update feedback status"
ON feedback FOR UPDATE TO authenticated USING (
    public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER')
);

-- QR Codes Policies
CREATE POLICY "QR codes are viewable by authenticated users"
ON qr_codes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and Officers can manage QR codes"
ON qr_codes FOR ALL TO authenticated USING (
    public.get_current_role() IN ('ADMINISTRATOR', 'IT_OFFICER')
);

-- Notifications Policies
CREATE POLICY "Users can view notifications directed to them or their role"
ON notifications FOR SELECT TO authenticated USING (
    auth.uid() = user_id
    OR target_role = public.get_current_role()
    OR (user_id IS NULL AND target_role IS NULL)
);

CREATE POLICY "Users can update their own notification read status"
ON notifications FOR UPDATE TO authenticated USING (
    auth.uid() = user_id
);

CREATE POLICY "Admins can manage all notifications"
ON notifications FOR ALL TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

-- Audit Logs Policies
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- System Backups Policies
CREATE POLICY "Only admins can view and create backups"
ON system_backups FOR ALL TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

