-- ==============================================================================
-- IT DEPARTMENT FEEDBACK AND SURVEY SYSTEM
-- Initial Seed Data
-- ==============================================================================

-- 1. Create Demo Profiles (using deterministic UUIDs for test fixtures)
-- Note: In production Supabase, users are created in auth.users first.
-- These UUIDs represent demo users for local/staging verification.
INSERT INTO profiles (id, role_id, full_name, email, department, id_number, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'ADMINISTRATOR', 'Dr. Evelyn Vance (Admin)', 'admin@itdept.edu', 'IT Administration', 'ADMIN-001', TRUE),
('22222222-2222-2222-2222-222222222222', 'STUDENT', 'Marcus Brody (Student)', 'officer@itdept.edu', 'Network Operations', 'STU-OFF-104', TRUE),
('33333333-3333-3333-3333-333333333333', 'STUDENT', 'Raymond Cruz (Student)', 'professor@itdept.edu', 'Computer Science Dept', 'STU-FAC-802', TRUE),
('44444444-4444-4444-4444-444444444444', 'STUDENT', 'Samantha Hayes (Student)', 'student@itdept.edu', 'Information Technology', 'STU-2026-089', TRUE)
ON CONFLICT (id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  full_name = EXCLUDED.full_name,
  is_active = TRUE;

-- 2. Seed Surveys
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
 '11111111-1111-1111-1111-111111111111'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 
 'Annual IT Department Strategic Services Review', 
 'Comprehensive annual review of IT service desk tickets, lab maintenance SLAs, and student self-service tools.', 
 'DEPARTMENT_SERVICES', 
 'DRAFT', 
 ARRAY['STUDENT']::TEXT[], 
 FALSE, 
 NOW() + INTERVAL '30 days', 
 NOW() + INTERVAL '60 days', 
 '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Questions for Survey 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' (Mid-Term Course Eval)
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

-- Seed Questions for Survey 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' (Lab Readiness)
INSERT INTO survey_questions (id, survey_id, question_text, question_type, options, is_required, order_index) VALUES
('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
 'Rate the performance and speed of the lab workstations during coding sessions.', 
 'RATING_SCALE', 
 '{"min": 1, "max": 5, "minLabel": "Sluggish / Unusable", "maxLabel": "Lightning Fast"}'::JSONB, 
 TRUE, 0),

('b2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
 'Have you encountered any malfunctioning monitors or peripherals in the labs?', 
 'YES_NO', 
 '["Yes", "No"]'::JSONB, 
 TRUE, 1),

('b3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
 'Which developer utilities should be pre-installed on the lab image?', 
 'CHECKBOX', 
 '["Docker Desktop & Podman", "VS Code with Remote SSH", "Postman / Bruno API Client", "Node.js & Python SDKs", "PostgreSQL Admin GUI (DBeaver)"]'::JSONB, 
 TRUE, 2)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed QR Codes
INSERT INTO qr_codes (id, survey_id, code_data, access_url, qr_image_data, is_active, scans_count) VALUES
('q1111111-1111-1111-1111-111111111111', 
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'QR-SRV-MIDTERM-2026', 
 '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f1f5f9"/><text x="100" y="105" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%230f172a">QR-SRV-MIDTERM-2026</text></svg>', 
 TRUE, 18),

('q2222222-2222-2222-2222-222222222222', 
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
 'QR-SRV-LABS-2026', 
 '/surveys/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23f1f5f9"/><text x="100" y="105" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%230f172a">QR-SRV-LABS-2026</text></svg>', 
 TRUE, 9)
ON CONFLICT (survey_id) DO NOTHING;

-- 5. Seed Notifications
INSERT INTO notifications (user_id, target_role, title, message, link, type, is_read) VALUES
(NULL, 'STUDENT', 'New Mid-Term Survey Published', 'Please complete the Mid-Term IT Course Evaluation before the deadline.', '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'SURVEY_INVITE', FALSE),
(NULL, 'STUDENT', 'Laboratory Readiness Feedback Requested', 'Department has opened the IT Lab Hardware & Software survey.', '/surveys/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SURVEY_INVITE', FALSE),
('44444444-4444-4444-4444-444444444444', NULL, 'Survey Reminder', 'Only 5 days left to submit your responses for Course Evaluation.', '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DEADLINE_REMINDER', FALSE),
('11111111-1111-1111-1111-111111111111', NULL, 'System Health Normal', 'Automated nightly audit backup completed successfully.', '/admin/backups', 'SYSTEM_ALERT', TRUE);

-- 6. Seed Audit Logs
INSERT INTO audit_logs (actor_id, actor_email, action, entity_type, entity_id, details, ip_address) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@itdept.edu', 'SURVEY_CREATED', 'SURVEY', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"title": "Mid-Term IT Course & Instructor Evaluation"}'::JSONB, '127.0.0.1'),
('11111111-1111-1111-1111-111111111111', 'admin@itdept.edu', 'SURVEY_STATUS_CHANGED', 'SURVEY', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"from": "DRAFT", "to": "ACTIVE"}'::JSONB, '127.0.0.1'),
('22222222-2222-2222-2222-222222222222', 'officer@itdept.edu', 'QR_CODE_GENERATED', 'QR_CODE', 'q1111111-1111-1111-1111-111111111111', '{"survey_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}'::JSONB, '192.168.1.45');

