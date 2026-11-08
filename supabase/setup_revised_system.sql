-- ==============================================================================
-- UNIVERSITY OF THE ASSUMPTION - IT DEPARTMENT FEEDBACK & SURVEY SYSTEM
-- COMPLETE REVISED DATABASE SETUP & INITIALIZATION SCRIPT (SUPABASE)
-- ==============================================================================
-- Features included in this revised schema:
-- 1. Two-Role RBAC: Strictly ADMINISTRATOR and STUDENT.
-- 2. Immutable Roles: Trigger prevents role alterations after account creation.
-- 3. Anonymous Zero-Knowledge Surveys: Independent receipts & responses.
-- 4. AES-256-GCM Encrypted Feedback with Audit Trail.
-- 5. Dynamic QR Code Management for surveys.
-- 6. Targeted Notifications (Role-based and User-specific).
-- 7. Audit Logging for security and compliance.
-- 8. Complete Row Level Security (RLS) policies.
-- 9. Removed System Backup & Recovery as requested.
-- 10. Seed Accounts: Administrator ('admin@ua.edu.ph' / 'Admin123!') & Student.
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- CLEANUP PREVIOUS REVISIONS (Safely drop in reverse dependency order)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS system_backups CASCADE; -- Completely removed feature
DROP TABLE IF EXISTS audit_logs CASCADE;
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
-- 1. ROLES TABLE (Strictly ADMINISTRATOR and STUDENT)
-- ------------------------------------------------------------------------------
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
('STUDENT', 'Student', 'Enrolled IT student with survey participation & feedback rights (@ua.edu.ph)'),
('ADMINISTRATOR', 'Administrator', 'Full departmental control, user RBAC, audit logs, and survey management')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

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
    category TEXT NOT NULL DEFAULT 'ACADEMIC' CHECK (category IN ('ACADEMIC', 'FACILITY', 'IT_INFRASTRUCTURE', 'DEPARTMENT_SERVICES', 'GENERAL')),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'EXPIRED', 'CLOSED')),
    target_roles TEXT[] DEFAULT ARRAY['STUDENT']::TEXT[],
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
-- 4. SURVEY_QUESTIONS TABLE (6 Question Types)
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

CREATE INDEX idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX idx_survey_questions_order ON survey_questions(survey_id, order_index);

-- ------------------------------------------------------------------------------
-- 5. PARTICIPATION RECEIPTS TABLE (Zero-Knowledge Duplicate Prevention)
-- ------------------------------------------------------------------------------
CREATE TABLE survey_participation_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receipt_token TEXT NOT NULL UNIQUE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_survey_user_receipt UNIQUE (survey_id, user_id)
);

CREATE INDEX idx_receipts_survey_user ON survey_participation_receipts(survey_id, user_id);
CREATE INDEX idx_receipts_token ON survey_participation_receipts(receipt_token);

-- ------------------------------------------------------------------------------
-- 6. SURVEY_RESPONSES TABLE (Anonymous Answers Container)
-- ------------------------------------------------------------------------------
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    receipt_token TEXT NOT NULL UNIQUE,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_responses_token ON survey_responses(receipt_token);

-- ------------------------------------------------------------------------------
-- 7. RESPONSE_ANSWERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE response_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_numeric NUMERIC,
    answer_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_answers_response ON response_answers(response_id);
CREATE INDEX idx_answers_question ON response_answers(question_id);

-- ------------------------------------------------------------------------------
-- 8. FEEDBACK TABLE (AES-256-GCM Encrypted at Rest)
-- ------------------------------------------------------------------------------
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    title TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED', 'FLAGGED')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_user ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_category ON feedback(category);

-- ------------------------------------------------------------------------------
-- 9. QR_CODES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL UNIQUE REFERENCES surveys(id) ON DELETE CASCADE,
    code_data TEXT NOT NULL UNIQUE,
    access_url TEXT NOT NULL,
    qr_image_data TEXT,
    scans_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_survey ON qr_codes(survey_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code_data);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_role TEXT REFERENCES roles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'SURVEY_INVITE', 'DEADLINE_REMINDER', 'SYSTEM_ALERT', 'FEEDBACK_UPDATE')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_target_role ON notifications(target_role);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

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

-- ==============================================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. Automatic Timestamp Updater
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_surveys_updated_at BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON survey_questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_qr_codes_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 2. Permanent Role Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_role_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role_id IS NOT NULL AND NEW.role_id <> OLD.role_id THEN
        RAISE EXCEPTION 'Role modification is strictly prohibited. Account roles are permanent.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_role_modification ON public.profiles;
CREATE TRIGGER trg_prevent_role_modification
BEFORE UPDATE OF role_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_modification();

-- 3. Automatic Synchronization from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_id_number TEXT;
    v_dept TEXT;
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role_id', 'STUDENT');
    IF v_role NOT IN ('ADMINISTRATOR', 'STUDENT') THEN
        v_role := 'STUDENT';
    END IF;

    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    v_id_number := NEW.raw_user_meta_data->>'id_number';
    v_dept := COALESCE(NEW.raw_user_meta_data->>'department', 'Information Technology');

    INSERT INTO public.profiles (id, email, full_name, role_id, id_number, department)
    VALUES (NEW.id, NEW.email, v_full_name, v_role, v_id_number, v_dept)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        department = EXCLUDED.department,
        id_number = COALESCE(EXCLUDED.id_number, profiles.id_number);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Helper: Get Current User Role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
    SELECT role_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

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

-- Profiles Policies
DROP POLICY IF EXISTS "Role isolated profile reading" ON profiles;
CREATE POLICY "Role isolated profile reading"
ON profiles FOR SELECT TO authenticated
USING (
    public.get_current_role() = 'ADMINISTRATOR'
    OR (public.get_current_role() = 'STUDENT' AND role_id = 'STUDENT')
    OR (auth.uid() = id)
);

DROP POLICY IF EXISTS "Users can update their own non-role fields" ON profiles;
CREATE POLICY "Users can update their own non-role fields"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id
    AND (role_id = (SELECT role_id FROM public.profiles WHERE id = auth.uid()))
);

DROP POLICY IF EXISTS "Admins have account management control" ON profiles;
CREATE POLICY "Admins have account management control"
ON profiles FOR ALL TO authenticated
USING (public.get_current_role() = 'ADMINISTRATOR')
WITH CHECK (public.get_current_role() = 'ADMINISTRATOR');

-- Surveys Policies
DROP POLICY IF EXISTS "Active surveys are readable by authorized target roles" ON surveys;
CREATE POLICY "Active surveys are readable by authorized target roles"
ON surveys FOR SELECT TO authenticated USING (
    (status = 'ACTIVE' AND public.get_current_role() = ANY(target_roles))
    OR public.get_current_role() = 'ADMINISTRATOR'
);

DROP POLICY IF EXISTS "Admins can manage surveys" ON surveys;
CREATE POLICY "Admins can manage surveys"
ON surveys FOR ALL TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

-- Survey Questions Policies
DROP POLICY IF EXISTS "Questions readable by anyone who can read survey" ON survey_questions;
CREATE POLICY "Questions readable by anyone who can read survey"
ON survey_questions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM surveys s WHERE s.id = survey_questions.survey_id)
);

DROP POLICY IF EXISTS "Admins can manage questions" ON survey_questions;
CREATE POLICY "Admins can manage questions"
ON survey_questions FOR ALL TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

-- Participation Receipts Policies
DROP POLICY IF EXISTS "Users can see their own receipts" ON survey_participation_receipts;
CREATE POLICY "Users can see their own receipts"
ON survey_participation_receipts FOR SELECT TO authenticated USING (
    auth.uid() = user_id OR public.get_current_role() = 'ADMINISTRATOR'
);

DROP POLICY IF EXISTS "Users can insert their own receipt" ON survey_participation_receipts;
CREATE POLICY "Users can insert their own receipt"
ON survey_participation_receipts FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
);

-- Survey Responses Policies
DROP POLICY IF EXISTS "Admins can read all responses" ON survey_responses;
CREATE POLICY "Admins can read all responses"
ON survey_responses FOR SELECT TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
    OR (auth.uid() = user_id AND is_anonymous = FALSE)
);

DROP POLICY IF EXISTS "Authenticated users can submit survey responses" ON survey_responses;
CREATE POLICY "Authenticated users can submit survey responses"
ON survey_responses FOR INSERT TO authenticated WITH CHECK (true);

-- Response Answers Policies
DROP POLICY IF EXISTS "Authorized roles can read response answers" ON response_answers;
CREATE POLICY "Authorized roles can read response answers"
ON response_answers FOR SELECT TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

DROP POLICY IF EXISTS "Users can insert response answers" ON response_answers;
CREATE POLICY "Users can insert response answers"
ON response_answers FOR INSERT TO authenticated WITH CHECK (true);

-- Feedback Policies
DROP POLICY IF EXISTS "Users can read their own non-anonymous feedback" ON feedback;
CREATE POLICY "Users can read their own non-anonymous feedback"
ON feedback FOR SELECT TO authenticated USING (
    (auth.uid() = user_id AND is_anonymous = FALSE)
    OR public.get_current_role() = 'ADMINISTRATOR'
);

DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON feedback;
CREATE POLICY "Authenticated users can insert feedback"
ON feedback FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update feedback status" ON feedback;
CREATE POLICY "Admins can update feedback status"
ON feedback FOR UPDATE TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
) WITH CHECK (
    public.get_current_role() = 'ADMINISTRATOR'
);

-- QR Codes Policies
DROP POLICY IF EXISTS "QR codes are viewable by authenticated users" ON qr_codes;
CREATE POLICY "QR codes are viewable by authenticated users"
ON qr_codes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage QR codes" ON qr_codes;
CREATE POLICY "Admins can manage QR codes"
ON qr_codes FOR ALL TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

-- Notifications Policies
DROP POLICY IF EXISTS "Users can view notifications directed to them or their role" ON notifications;
CREATE POLICY "Users can view notifications directed to them or their role"
ON notifications FOR SELECT TO authenticated USING (
    auth.uid() = user_id
    OR target_role = public.get_current_role()
    OR (user_id IS NULL AND target_role IS NULL)
);

DROP POLICY IF EXISTS "Users can update their own notification read status" ON notifications;
CREATE POLICY "Users can update their own notification read status"
ON notifications FOR UPDATE TO authenticated USING (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications"
ON notifications FOR ALL TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

-- Audit Logs Policies
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT TO authenticated USING (
    public.get_current_role() = 'ADMINISTRATOR'
);

DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA (ACCOUNTS & DEMO DATA)
-- ==============================================================================

-- 1. Create Seed Auth Users (in auth.users)
-- Default Seed Credentials:
-- Administrator: admin@ua.edu.ph (Username: admin) | Password: Admin123!
-- Student:       student@ua.edu.ph                 | Password: Student123!

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@ua.edu.ph',
    crypt('Admin123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Administrator","role_id":"ADMINISTRATOR","id_number":"admin","department":"IT Administration"}',
    NOW(),
    NOW(),
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'student@ua.edu.ph',
    crypt('Student123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Samantha Hayes","role_id":"STUDENT","id_number":"STU-2026-089","department":"Information Technology"}',
    NOW(),
    NOW(),
    ''
)
ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = NOW();

-- 2. Populate Corresponding Public Profiles
INSERT INTO profiles (id, role_id, full_name, email, department, id_number, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'ADMINISTRATOR', 'System Administrator', 'admin@ua.edu.ph', 'IT Administration', 'admin', TRUE),
('44444444-4444-4444-4444-444444444444', 'STUDENT', 'Samantha Hayes', 'student@ua.edu.ph', 'Information Technology', 'STU-2026-089', TRUE)
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    id_number = EXCLUDED.id_number,
    department = EXCLUDED.department,
    is_active = TRUE;

-- 3. Seed Surveys
INSERT INTO surveys (id, title, description, category, status, target_roles, is_anonymous_allowed, start_date, end_date, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'Mid-Term IT Course & Instructor Evaluation', 
 'Please provide objective evaluation on IT curriculum pacing, instructor guidance, and clarity of laboratory instructions.', 
 'ACADEMIC', 
 'ACTIVE', 
 ARRAY['STUDENT']::TEXT[], 
 TRUE, 
 NOW() - INTERVAL '3 days', 
 NOW() + INTERVAL '14 days', 
 '11111111-1111-1111-1111-111111111111'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
 'IT Laboratory Hardware & Software Readiness', 
 'Survey on the reliability of workstation hardware, Linux dual-boot setups, and developer tooling in Labs 401-404.', 
 'FACILITY', 
 'ACTIVE', 
 ARRAY['STUDENT']::TEXT[], 
 TRUE, 
 NOW() - INTERVAL '1 day', 
 NOW() + INTERVAL '10 days', 
 '11111111-1111-1111-1111-111111111111'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 
 'Campus Wi-Fi 6 & VPN Infrastructure Assessment', 
 'Feedback on coverage gaps, connection stability during exam hours, and multi-factor authentication responsiveness.', 
 'IT_INFRASTRUCTURE', 
 'SCHEDULED', 
 ARRAY['STUDENT']::TEXT[], 
 TRUE, 
 NOW() + INTERVAL '2 days', 
 NOW() + INTERVAL '20 days', 
 '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Questions for Survey 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' (6 Question Types)
INSERT INTO survey_questions (id, survey_id, question_text, question_type, options, is_required, order_index) VALUES
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'Overall, how would you rate the effectiveness and clarity of the course instruction?', 
 'RATING_SCALE', 
 '{"min": 1, "max": 5, "minLabel": "Needs Improvement", "maxLabel": "Exceptional"}'::JSONB, 
 TRUE, 0),

('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'Which major course modules did you find most engaging and informative?', 
 'CHECKBOX', 
 '["Cloud Architecture & DevOps", "Full-Stack Web Engineering", "Database Systems & SQL Optimization", "Cybersecurity & Cryptography"]'::JSONB, 
 TRUE, 1),

('a3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'Did you receive timely constructive feedback on your weekly lab assignments?', 
 'YES_NO', 
 '["Yes", "No"]'::JSONB, 
 TRUE, 2),

('a4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'What was your primary learning environment during this semester?', 
 'MULTIPLE_CHOICE', 
 '["Campus Computer Labs", "Personal Laptop (Mac/Windows)", "Virtual Desktop Infrastructure (VDI)", "Hybrid"]'::JSONB, 
 TRUE, 3),

('a5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'What was the single most valuable technical skill you gained from this course?', 
 'SHORT_ANSWER', 
 '{"placeholder": "e.g., PostgreSQL query tuning or Next.js server actions"}'::JSONB, 
 FALSE, 4),

('a6666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'Please provide recommendations to improve subsequent iterations of this curriculum.', 
 'PARAGRAPH', 
 '{"placeholder": "Type your detailed thoughts and recommendations here..."}'::JSONB, 
 FALSE, 5)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed QR Codes
INSERT INTO qr_codes (id, survey_id, code_data, access_url, qr_image_data, is_active, scans_count) VALUES
('q1111111-1111-1111-1111-111111111111', 
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'QR-SRV-MIDTERM-2026', 
 '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f1f5f9"/><text x="100" y="105" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%230f172a">QR-SRV-MIDTERM-2026</text></svg>', 
 TRUE, 24)
ON CONFLICT (survey_id) DO NOTHING;

-- 6. Seed Notifications
INSERT INTO notifications (user_id, target_role, title, message, link, type, is_read) VALUES
(NULL, 'STUDENT', 'New Mid-Term Survey Published', 'Please complete the Mid-Term IT Course Evaluation before the deadline.', '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SURVEY_INVITE', FALSE),
('44444444-4444-4444-4444-444444444444', NULL, 'Survey Reminder', 'Only 5 days left to submit your responses for Course Evaluation.', '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DEADLINE_REMINDER', FALSE),
('11111111-1111-1111-1111-111111111111', NULL, 'System Health Normal', 'Automated security checks and audit log synchronization completed successfully.', '/admin/dashboard', 'SYSTEM_ALERT', TRUE);

-- 7. Seed Audit Logs
INSERT INTO audit_logs (actor_id, actor_email, action, entity_type, entity_id, details, ip_address) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@ua.edu.ph', 'SYSTEM_INITIALIZED', 'DATABASE', 'SCHEMA_V2', '{"message": "Revised IT Department Portal schema initialized"}'::JSONB, '127.0.0.1'),
('11111111-1111-1111-1111-111111111111', 'admin@ua.edu.ph', 'SURVEY_PUBLISHED', 'SURVEY', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"title": "Mid-Term IT Course & Instructor Evaluation"}'::JSONB, '127.0.0.1');

-- Done
SELECT 'Database schema and seed data setup completed successfully!' AS status;
