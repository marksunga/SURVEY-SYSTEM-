-- ==============================================================================
-- MIGRATION: Simplify User Roles to ADMINISTRATOR and STUDENT Only
-- Preserves all user data, surveys, responses, and feedback
-- ==============================================================================

-- 1. Safely migrate existing IT_OFFICER and IT_PROFESSOR accounts to STUDENT
UPDATE public.profiles
SET role_id = 'STUDENT'
WHERE role_id IN ('IT_OFFICER', 'IT_PROFESSOR');

-- 2. Safely update survey target_roles arrays to STUDENT only
UPDATE public.surveys
SET target_roles = ARRAY['STUDENT']::TEXT[]
WHERE 'IT_OFFICER' = ANY(target_roles) OR 'IT_PROFESSOR' = ANY(target_roles);

-- 3. Safely update notifications targeted to legacy roles
UPDATE public.notifications
SET target_role = 'STUDENT'
WHERE target_role IN ('IT_OFFICER', 'IT_PROFESSOR');

-- 4. Delete legacy roles from roles lookup table
DELETE FROM public.roles
WHERE id IN ('IT_OFFICER', 'IT_PROFESSOR');

-- 5. Update RLS policies to enforce strict ADMINISTRATOR-only admin access

-- Surveys
DROP POLICY IF EXISTS "Admins and IT Officers can manage surveys" ON public.surveys;
CREATE POLICY "Admins can manage surveys"
    ON public.surveys FOR ALL
    USING (public.get_current_role() = 'ADMINISTRATOR')
    WITH CHECK (public.get_current_role() = 'ADMINISTRATOR');

-- Questions
DROP POLICY IF EXISTS "Admins and IT Officers can manage questions" ON public.questions;
CREATE POLICY "Admins can manage questions"
    ON public.questions FOR ALL
    USING (public.get_current_role() = 'ADMINISTRATOR')
    WITH CHECK (public.get_current_role() = 'ADMINISTRATOR');

-- Responses
DROP POLICY IF EXISTS "Admins and IT Officers can read all responses" ON public.survey_responses;
CREATE POLICY "Admins can read all responses"
    ON public.survey_responses FOR SELECT
    USING (public.get_current_role() = 'ADMINISTRATOR');

DROP POLICY IF EXISTS "Admins and IT Officers can read all question responses" ON public.survey_question_responses;
CREATE POLICY "Admins can read all question responses"
    ON public.survey_question_responses FOR SELECT
    USING (public.get_current_role() = 'ADMINISTRATOR');

-- Feedback
DROP POLICY IF EXISTS "Admins and Officers can update feedback status" ON public.feedback;
CREATE POLICY "Admins can update feedback status"
    ON public.feedback FOR UPDATE
    USING (public.get_current_role() = 'ADMINISTRATOR')
    WITH CHECK (public.get_current_role() = 'ADMINISTRATOR');

-- QR Codes
DROP POLICY IF EXISTS "Admins and Officers can manage QR codes" ON public.survey_qr_codes;
CREATE POLICY "Admins can manage QR codes"
    ON public.survey_qr_codes FOR ALL
    USING (public.get_current_role() = 'ADMINISTRATOR')
    WITH CHECK (public.get_current_role() = 'ADMINISTRATOR');

-- Audit Logs
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.get_current_role() = 'ADMINISTRATOR');

