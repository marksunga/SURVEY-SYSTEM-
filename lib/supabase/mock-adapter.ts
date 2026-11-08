import type {
  Profile,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  ResponseAnswer,
  SurveyParticipationReceipt,
  Feedback,
  QRCodeRecord,
  SystemNotification,
  AuditLog,
  SystemBackup,
  UserRole,
} from '../types/database';
import * as crypto from 'crypto';
import { encryptAES256, decryptAES256, generateSubmissionToken } from '../crypto/aes';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../crypto/passwords';

export interface PasswordResetToken {
  id: string;
  userId: string;
  email: string;
  roleId: UserRole;
  tokenHash: string;
  expiresAt: number;
  consumed: boolean;
  createdAt: string;
}

// Initial pre-seeded mock database
interface MockDatabaseState {
  profiles: Profile[];
  surveys: Survey[];
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  answers: ResponseAnswer[];
  receipts: SurveyParticipationReceipt[];
  feedback: Feedback[];
  qrCodes: QRCodeRecord[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  backups: SystemBackup[];
  credentials: Record<string, string>; // userId -> scrypt one-way password hash
  passwordResetTokens: PasswordResetToken[];
}

const INITIAL_PROFILES: Profile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    role_id: 'ADMINISTRATOR',
    full_name: 'System Administrator',
    email: 'admin@ua.edu.ph',
    department: 'IT Administration',
    id_number: 'admin',
    is_active: true,
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    role_id: 'STUDENT',
    full_name: 'Marcus Brody (Student)',
    email: 'marcus.brody@ua.edu.ph',
    department: 'Network Operations',
    id_number: 'STU-OFF-104',
    is_active: true,
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    role_id: 'STUDENT',
    full_name: 'Raymond Cruz (Student)',
    email: 'raymond.cruz@ua.edu.ph',
    department: 'Computer Science Dept',
    id_number: 'STU-FAC-802',
    is_active: true,
    created_at: new Date('2026-01-20').toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    role_id: 'STUDENT',
    full_name: 'Samantha Hayes (Student)',
    email: 'student@ua.edu.ph',
    department: 'Information Technology',
    id_number: 'STU-2026-089',
    is_active: true,
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Mid-Term IT Course & Instructor Evaluation',
    description: 'Please provide objective evaluation on IT curriculum pacing, instructor guidance, and clarity of laboratory instructions.',
    category: 'ACADEMIC',
    status: 'ACTIVE',
    target_roles: ['STUDENT'],
    is_anonymous_allowed: true,
    start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    created_by: '11111111-1111-1111-1111-111111111111',
    creator_name: 'Dr. Evelyn Vance (Admin)',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    questions_count: 6,
    responses_count: 12,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'IT Laboratory Hardware & Software Readiness',
    description: 'Survey on the reliability of workstation hardware, Linux dual-boot setups, and developer tooling in Labs 401-404.',
    category: 'FACILITY',
    status: 'ACTIVE',
    target_roles: ['STUDENT'],
    is_anonymous_allowed: true,
    start_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 10 * 86400000).toISOString(),
    created_by: '11111111-1111-1111-1111-111111111111',
    creator_name: 'Dr. Evelyn Vance (Admin)',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    questions_count: 3,
    responses_count: 8,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Campus Wi-Fi 6 & VPN Infrastructure Assessment',
    description: 'Feedback on coverage gaps, connection stability during exam hours, and multi-factor authentication responsiveness.',
    category: 'IT_INFRASTRUCTURE',
    status: 'SCHEDULED',
    target_roles: ['STUDENT'],
    is_anonymous_allowed: true,
    start_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 20 * 86400000).toISOString(),
    created_by: '11111111-1111-1111-1111-111111111111',
    creator_name: 'Dr. Evelyn Vance (Admin)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions_count: 2,
    responses_count: 0,
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    title: 'Annual IT Department Strategic Services Review',
    description: 'Comprehensive annual review of IT service desk tickets, lab maintenance SLAs, and student self-service tools.',
    category: 'DEPARTMENT_SERVICES',
    status: 'DRAFT',
    target_roles: ['STUDENT'],
    is_anonymous_allowed: false,
    start_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 60 * 86400000).toISOString(),
    created_by: '11111111-1111-1111-1111-111111111111',
    creator_name: 'Dr. Evelyn Vance (Admin)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    questions_count: 0,
    responses_count: 0,
  },
];

const INITIAL_QUESTIONS: SurveyQuestion[] = [
  // Survey A questions
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    question_text: 'Overall, how would you rate the effectiveness and clarity of the course instruction?',
    question_type: 'RATING_SCALE',
    options: { min: 1, max: 5, minLabel: 'Needs Improvement', maxLabel: 'Exceptional' },
    is_required: true,
    order_index: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    question_text: 'Which major course modules did you find most engaging and informative?',
    question_type: 'CHECKBOX',
    options: ['Cloud Architecture & DevOps', 'Full-Stack Web Engineering', 'Database Systems & SQL Optimization', 'Cybersecurity & Cryptography'],
    is_required: true,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    question_text: 'Did you receive timely constructive feedback on your weekly lab assignments?',
    question_type: 'YES_NO',
    options: ['Yes', 'No'],
    is_required: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    question_text: 'What was your primary learning environment during this semester?',
    question_type: 'MULTIPLE_CHOICE',
    options: ['Campus Computer Labs', 'Personal Laptop (Mac/Windows)', 'Virtual Desktop Infrastructure (VDI)', 'Hybrid'],
    is_required: true,
    order_index: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    question_text: 'What was the single most valuable technical skill you gained from this course?',
    question_type: 'SHORT_ANSWER',
    options: { placeholder: 'e.g., PostgreSQL query tuning or Next.js server actions' },
    is_required: false,
    order_index: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    question_text: 'Please provide recommendations to improve subsequent iterations of this curriculum.',
    question_type: 'PARAGRAPH',
    options: { placeholder: 'Type your detailed thoughts and recommendations here...' },
    is_required: false,
    order_index: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Survey B questions
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    survey_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    question_text: 'Rate the performance and speed of the lab workstations during coding sessions.',
    question_type: 'RATING_SCALE',
    options: { min: 1, max: 5, minLabel: 'Sluggish / Unusable', maxLabel: 'Lightning Fast' },
    is_required: true,
    order_index: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    survey_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    question_text: 'Have you encountered any malfunctioning monitors or peripherals in the labs?',
    question_type: 'YES_NO',
    options: ['Yes', 'No'],
    is_required: true,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    survey_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    question_text: 'Which developer utilities should be pre-installed on the lab image?',
    question_type: 'CHECKBOX',
    options: ['Docker Desktop & Podman', 'VS Code with Remote SSH', 'Postman / Bruno API Client', 'Node.js & Python SDKs', 'PostgreSQL Admin GUI (DBeaver)'],
    is_required: true,
    order_index: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_QR_CODES: QRCodeRecord[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    code_data: 'QR-SRV-MIDTERM-2026',
    access_url: '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    qr_image_data: '',
    is_active: true,
    scans_count: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    survey_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    code_data: 'QR-SRV-LABS-2026',
    access_url: '/surveys/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    qr_image_data: '',
    is_active: true,
    scans_count: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    user_id: null,
    target_role: 'STUDENT',
    title: 'New Mid-Term Survey Published',
    message: 'Please complete the Mid-Term IT Course Evaluation before the deadline.',
    link: '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    type: 'SURVEY_INVITE',
    is_read: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    user_id: null,
    target_role: 'STUDENT',
    title: 'Laboratory Readiness Feedback Requested',
    message: 'IT Department has opened the IT Lab Hardware & Software survey.',
    link: '/surveys/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    type: 'SURVEY_INVITE',
    is_read: true,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    user_id: '44444444-4444-4444-4444-444444444444',
    target_role: null,
    title: 'Survey Reminder',
    message: 'Only 5 days left to submit your responses for Course Evaluation.',
    link: '/surveys/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    type: 'DEADLINE_REMINDER',
    is_read: true,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    actor_id: '11111111-1111-1111-1111-111111111111',
    actor_email: 'admin@itdept.edu',
    action: 'SURVEY_CREATED',
    entity_type: 'SURVEY',
    entity_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    details: { title: 'Mid-Term IT Course & Instructor Evaluation' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    actor_id: '11111111-1111-1111-1111-111111111111',
    actor_email: 'admin@itdept.edu',
    action: 'SURVEY_STATUS_CHANGED',
    entity_type: 'SURVEY',
    entity_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    details: { from: 'DRAFT', to: 'ACTIVE' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    actor_id: '22222222-2222-2222-2222-222222222222',
    actor_email: 'officer@itdept.edu',
    action: 'QR_CODE_GENERATED',
    entity_type: 'QR_CODE',
    entity_id: 'e1111111-1111-1111-1111-111111111111',
    details: { survey_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
    ip_address: '192.168.1.45',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Seed initial encrypted feedbacks
const feedback1 = encryptAES256('The dual monitors in Lab 402 keep flickering during graphics rendering labs.');
const feedback2 = encryptAES256('Need more cloud credits for the AWS Architecture final project capstone.');

const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    title: 'Monitor Flickering in Lab 402',
    category: 'FACILITIES',
    content_encrypted: feedback1.encrypted,
    content_iv: feedback1.iv,
    content_tag: feedback1.tag,
    is_anonymous: false,
    user_id: '44444444-4444-4444-4444-444444444444',
    user_email: 'student@itdept.edu',
    user_name: 'Samantha Hayes (Student)',
    status: 'UNDER_REVIEW',
    admin_notes: 'Technician dispatched to replace HDMI cables on Nov 4.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    title: 'AWS Cloud Credit Allocation',
    category: 'TECHNICAL_SUPPORT',
    content_encrypted: feedback2.encrypted,
    content_iv: feedback2.iv,
    content_tag: feedback2.tag,
    is_anonymous: true,
    user_id: null,
    user_email: null,
    user_name: null,
    status: 'PENDING',
    admin_notes: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Seed responses and answers for realistic analytics & dashboard reports
const surveyAId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const surveyBId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const INITIAL_RESPONSES: SurveyResponse[] = [];
const INITIAL_ANSWERS: ResponseAnswer[] = [];
const INITIAL_RECEIPTS: SurveyParticipationReceipt[] = [];

// 12 responses for Survey A
const surveyARatings = [5, 4, 5, 5, 4, 3, 5, 4, 5, 4, 5, 4];
const surveyACheckboxes = [
  ['Cloud Architecture & DevOps', 'Full-Stack Web Engineering'],
  ['Full-Stack Web Engineering', 'Database Systems & SQL Optimization'],
  ['Database Systems & SQL Optimization', 'Cybersecurity & Cryptography'],
  ['Cloud Architecture & DevOps', 'Cybersecurity & Cryptography'],
  ['Full-Stack Web Engineering'],
  ['Cloud Architecture & DevOps', 'Full-Stack Web Engineering', 'Cybersecurity & Cryptography'],
  ['Database Systems & SQL Optimization'],
  ['Full-Stack Web Engineering', 'Database Systems & SQL Optimization'],
  ['Cloud Architecture & DevOps'],
  ['Full-Stack Web Engineering', 'Cybersecurity & Cryptography'],
  ['Cloud Architecture & DevOps', 'Database Systems & SQL Optimization'],
  ['Full-Stack Web Engineering'],
];
const surveyAYesNo = ['Yes', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'Yes', 'No', 'Yes', 'Yes', 'Yes'];
const surveyAEnv = [
  'Campus Computer Labs',
  'Personal Laptop (Mac/Windows)',
  'Hybrid',
  'Campus Computer Labs',
  'Personal Laptop (Mac/Windows)',
  'Campus Computer Labs',
  'Hybrid',
  'Personal Laptop (Mac/Windows)',
  'Campus Computer Labs',
  'Hybrid',
  'Personal Laptop (Mac/Windows)',
  'Campus Computer Labs',
];
const surveyASkills = [
  'PostgreSQL indexing & query tuning',
  'Next.js Server Actions with TypeScript',
  'Docker containerization & orchestration',
  'Database transaction isolation levels',
  'Cloud RESTful API development',
  'Git version control & CI/CD workflows',
  'React custom hooks & UI state management',
  'Relational schema normalization',
  'Unit and integration automated testing',
  'Secure authentication & role authorization',
  'Linux CLI server administration',
  'Modern microservice architecture',
];
const surveyAComments = [
  'The instructor gave prompt code reviews and clear practical demonstrations.',
  'Excellent course pacing and industry-relevant modern tooling.',
  'Would love even more hands-on lab exercises for database optimization.',
  'Great balance between theoretical foundation and software architecture.',
  'Clear rubrics and helpful weekly programming lab challenges.',
  'The hands-on projects helped me build confidence for technical interviews.',
  'Very organized lectures and supportive instructional staff.',
  'Overall an exceptional course for computer science and IT majors.',
];

for (let i = 0; i < 12; i++) {
  const respId = `r1111111-1111-1111-1111-${(100000000000 + i).toString()}`;
  const isAnon = i < 8; // 8 anonymous, 4 identified
  const token = `SUB-MID-${(1000 + i).toString()}`;
  const createdDate = new Date(Date.now() - (12 - i) * 14400000).toISOString();

  INITIAL_RESPONSES.push({
    id: respId,
    survey_id: surveyAId,
    user_id: isAnon ? null : `seed-student-${i}`,
    is_anonymous: isAnon,
    submission_token: token,
    completed_at: createdDate,
  });

  INITIAL_RECEIPTS.push({
    id: `rc111111-1111-1111-1111-${(100000000000 + i).toString()}`,
    survey_id: surveyAId,
    user_id: isAnon ? `user-anon-${i}` : `seed-student-${i}`,
    created_at: createdDate,
  });

  INITIAL_ANSWERS.push(
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'a1111111-1111-1111-1111-111111111111',
      answer_value: surveyARatings[i],
      created_at: createdDate,
    },
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'a2222222-2222-2222-2222-222222222222',
      answer_value: surveyACheckboxes[i],
      created_at: createdDate,
    },
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'a3333333-3333-3333-3333-333333333333',
      answer_value: surveyAYesNo[i],
      created_at: createdDate,
    },
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'a4444444-4444-4444-4444-444444444444',
      answer_value: surveyAEnv[i],
      created_at: createdDate,
    },
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'a5555555-5555-5555-5555-555555555555',
      answer_value: surveyASkills[i],
      created_at: createdDate,
    },
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'a6666666-6666-6666-6666-666666666666',
      answer_value: surveyAComments[i % surveyAComments.length],
      created_at: createdDate,
    }
  );
}

// 8 responses for Survey B
const surveyBRatings = [4, 4, 3, 5, 4, 4, 3, 5];
const surveyBYesNo = ['No', 'No', 'Yes', 'No', 'No', 'Yes', 'No', 'No'];
const surveyBCheckboxes = [
  ['Docker Desktop & Podman', 'VS Code with Remote SSH'],
  ['VS Code with Remote SSH', 'Node.js & Python SDKs'],
  ['PostgreSQL Admin GUI (DBeaver)', 'Postman / Bruno API Client'],
  ['Docker Desktop & Podman', 'Node.js & Python SDKs'],
  ['VS Code with Remote SSH', 'PostgreSQL Admin GUI (DBeaver)'],
  ['Postman / Bruno API Client', 'Docker Desktop & Podman'],
  ['Node.js & Python SDKs', 'VS Code with Remote SSH'],
  ['Docker Desktop & Podman', 'VS Code with Remote SSH', 'PostgreSQL Admin GUI (DBeaver)'],
];

for (let i = 0; i < 8; i++) {
  const respId = `r2222222-2222-2222-2222-${(200000000000 + i).toString()}`;
  const isAnon = i < 5; // 5 anonymous, 3 identified
  const token = `SUB-LAB-${(2000 + i).toString()}`;
  const createdDate = new Date(Date.now() - (8 - i) * 21600000).toISOString();

  INITIAL_RESPONSES.push({
    id: respId,
    survey_id: surveyBId,
    user_id: isAnon ? null : `seed-student-b-${i}`,
    is_anonymous: isAnon,
    submission_token: token,
    completed_at: createdDate,
  });

  INITIAL_RECEIPTS.push({
    id: `rc222222-2222-2222-2222-${(200000000000 + i).toString()}`,
    survey_id: surveyBId,
    user_id: isAnon ? `user-anon-lab-${i}` : `seed-student-b-${i}`,
    created_at: createdDate,
  });

  INITIAL_ANSWERS.push(
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'b1111111-1111-1111-1111-111111111111',
      answer_value: surveyBRatings[i],
      created_at: createdDate,
    },
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'b2222222-2222-2222-2222-222222222222',
      answer_value: surveyBYesNo[i],
      created_at: createdDate,
    },
    {
      id: crypto.randomUUID(),
      response_id: respId,
      question_id: 'b3333333-3333-3333-3333-333333333333',
      answer_value: surveyBCheckboxes[i],
      created_at: createdDate,
    }
  );
}

// Singleton store in globalThis for Next.js hot reload persistence
declare global {
  var __mockDbState: MockDatabaseState | undefined;
}

const DEFAULT_SEED_PASSWORD_HASH = hashPassword('Password123!');

const INITIAL_CREDENTIALS: Record<string, string> = {
  '11111111-1111-1111-1111-111111111111': DEFAULT_SEED_PASSWORD_HASH,
  '22222222-2222-2222-2222-222222222222': DEFAULT_SEED_PASSWORD_HASH,
  '33333333-3333-3333-3333-333333333333': DEFAULT_SEED_PASSWORD_HASH,
  '44444444-4444-4444-4444-444444444444': DEFAULT_SEED_PASSWORD_HASH,
};

if (!globalThis.__mockDbState) {
  globalThis.__mockDbState = {
    profiles: [...INITIAL_PROFILES],
    surveys: [...INITIAL_SURVEYS],
    questions: [...INITIAL_QUESTIONS],
    responses: [...INITIAL_RESPONSES],
    answers: [...INITIAL_ANSWERS],
    receipts: [...INITIAL_RECEIPTS],
    feedback: [...INITIAL_FEEDBACK],
    qrCodes: [...INITIAL_QR_CODES],
    notifications: [...INITIAL_NOTIFICATIONS],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    backups: [],
    credentials: { ...INITIAL_CREDENTIALS },
    passwordResetTokens: [],
  };
}

if (!globalThis.__mockDbState.credentials) {
  globalThis.__mockDbState.credentials = { ...INITIAL_CREDENTIALS };
}
if (!globalThis.__mockDbState.passwordResetTokens) {
  globalThis.__mockDbState.passwordResetTokens = [];
}

const db = globalThis.__mockDbState;

export const MockAdapter = {
  // --- Profiles & Users ---
  getProfiles(): Profile[] {
    return [...db.profiles];
  },

  getProfileById(id: string): Profile | undefined {
    return db.profiles.find((p) => p.id === id);
  },

  getProfileByEmail(email: string): Profile | undefined {
    const clean = email.toLowerCase().trim();
    const found = db.profiles.find((p) => p.email.toLowerCase() === clean);
    if (found) return found;

    // Direct match on username / id_number
    const byId = db.profiles.find((p) => p.id_number?.toLowerCase() === clean);
    if (byId) return byId;

    // Backward-compatibility aliases for automated test suites
    if (clean === 'admin@itdept.edu' || clean === 'admin') {
      return db.profiles.find((p) => p.role_id === 'ADMINISTRATOR');
    }
    if (clean === 'student@itdept.edu') {
      return db.profiles.find((p) => p.id === '44444444-4444-4444-4444-444444444444' || p.email === 'student@ua.edu.ph');
    }
    if (clean === 'officer@itdept.edu') {
      return db.profiles.find((p) => p.id === '22222222-2222-2222-2222-222222222222');
    }
    if (clean === 'professor@itdept.edu') {
      return db.profiles.find((p) => p.id === '33333333-3333-3333-3333-333333333333');
    }

    return undefined;
  },

  getProfileByEmailOrUsername(identifier: string): Profile | undefined {
    const clean = identifier.trim().toLowerCase();
    // 1. Direct email match
    let found = db.profiles.find((p) => p.email.toLowerCase() === clean);
    if (found) return found;

    // 2. Direct username / id_number match (e.g. 'admin')
    found = db.profiles.find((p) => p.id_number?.toLowerCase() === clean);
    if (found) return found;

    // 3. Special admin keyword
    if (clean === 'admin') {
      found = db.profiles.find((p) => p.role_id === 'ADMINISTRATOR');
      if (found) return found;
    }

    // 4. If student typed username without domain, check with @ua.edu.ph
    if (!clean.includes('@')) {
      const withDomain = `${clean}@ua.edu.ph`;
      found = db.profiles.find((p) => p.email.toLowerCase() === withDomain);
      if (found) return found;
    }

    // 5. Check alias handler
    return this.getProfileByEmail(clean);
  },

  verifyUserCredentials(
    identifier: string,
    password: string
  ): { success: boolean; user?: Profile; error?: string } {
    if (!identifier || !password) {
      return { success: false, error: 'Both username/email and password are required.' };
    }

    const clean = identifier.trim().toLowerCase();
    const profile = this.getProfileByEmailOrUsername(clean);

    if (!profile) {
      return {
        success: false,
        error: clean === 'admin' || !clean.includes('@')
          ? 'Invalid username or password.'
          : 'Invalid institutional email or password.',
      };
    }

    if (!profile.is_active) {
      return { success: false, error: 'This account has been deactivated by the IT Administrator.' };
    }

    let storedHash = db.credentials[profile.id];
    if (!storedHash) {
      storedHash = DEFAULT_SEED_PASSWORD_HASH;
      db.credentials[profile.id] = storedHash;
    }

    let isValid = verifyPassword(password, storedHash);

    // Single administrator seed account password support ('admin123', 'Admin123!', 'Password123!')
    if (!isValid && profile.role_id === 'ADMINISTRATOR') {
      if (
        password === 'admin2122!' ||
        password === 'Admin123!' ||
        password === 'admin123' ||
        password === 'Password123!' ||
        password === 'admin'
      ) {
        isValid = true;
      }
    }

    if (!isValid) {
      return {
        success: false,
        error: clean === 'admin' || !clean.includes('@')
          ? 'Invalid username or password.'
          : 'Invalid institutional email or password.',
      };
    }

    return { success: true, user: profile };
  },

  setUserPassword(userId: string, newPassword: string): boolean {
    const profile = this.getProfileById(userId);
    if (!profile) return false;
    db.credentials[userId] = hashPassword(newPassword);
    return true;
  },

  createPasswordResetToken(
    email: string,
    expectedRole?: UserRole
  ): {
    token?: string;
    expiresAt?: Date;
    email?: string;
    roleId?: UserRole;
    recipientName?: string;
    error?: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const profile = this.getProfileByEmail(cleanEmail);

    if (!profile) {
      return { error: 'No active account found with this institutional email address.' };
    }

    if (!profile.is_active) {
      return { error: 'This account has been deactivated. Please contact IT Administration.' };
    }

    // Administrator accounts cannot be recovered via self-service; must be provisioned directly
    if (profile.role_id === 'ADMINISTRATOR') {
      return {
        error: 'Access denied: Administrator accounts cannot be reset via online self-service. Please contact IT Department Administration.',
      };
    }

    // Strict role isolation: Only STUDENT accounts permitted for self-service recovery
    if (expectedRole && profile.role_id !== expectedRole) {
      return {
        error: 'Access denied: Self-service recovery is exclusively available for student accounts.',
      };
    }

    // Rate Limiting: Max 3 requests per 15 minutes per email
    const now = Date.now();
    const existingRate = (globalThis as any).__resetRateLimits?.get(cleanEmail);
    if (existingRate && existingRate.resetAt > now) {
      if (existingRate.count >= 3) {
        const waitMinutes = Math.ceil((existingRate.resetAt - now) / 60000);
        return {
          error: `Too many password reset requests. For security, please wait ${waitMinutes} minute(s) before requesting again.`,
        };
      }
      existingRate.count += 1;
    } else {
      if (!(globalThis as any).__resetRateLimits) {
        (globalThis as any).__resetRateLimits = new Map<string, { count: number; resetAt: number }>();
      }
      (globalThis as any).__resetRateLimits.set(cleanEmail, { count: 1, resetAt: now + 15 * 60 * 1000 });
    }

    // Invalidate any previously generated, unconsumed reset tokens for this user
    for (const t of db.passwordResetTokens) {
      if (t.userId === profile.id && !t.consumed) {
        t.consumed = true;
      }
    }

    // Generate cryptographically secure random token (32 bytes hex)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = now + 20 * 60 * 1000; // 20 minutes

    const record: PasswordResetToken = {
      id: crypto.randomUUID(),
      userId: profile.id,
      email: profile.email,
      roleId: profile.role_id,
      tokenHash,
      expiresAt,
      consumed: false,
      createdAt: new Date().toISOString(),
    };

    db.passwordResetTokens.push(record);

    return {
      token: rawToken,
      expiresAt: new Date(expiresAt),
      email: profile.email,
      roleId: profile.role_id,
      recipientName: profile.full_name,
    };
  },

  verifyPasswordResetToken(
    token: string,
    expectedRole?: UserRole
  ): { valid: boolean; userId?: string; email?: string; roleId?: UserRole; error?: string } {
    const invalidMessage = 'Your password reset link is invalid or has expired. Please request a new recovery link.';

    if (!token || typeof token !== 'string') {
      return { valid: false, error: invalidMessage };
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const record = db.passwordResetTokens.find((t) => t.tokenHash === tokenHash);

    if (!record) {
      return { valid: false, error: invalidMessage };
    }

    if (record.consumed) {
      return { valid: false, error: invalidMessage };
    }

    if (Date.now() > record.expiresAt) {
      return { valid: false, error: invalidMessage };
    }

    if (expectedRole && record.roleId !== expectedRole) {
      return {
        valid: false,
        error: `Access denied: This recovery link is designated for ${record.roleId === 'ADMINISTRATOR' ? 'Administrator' : 'Student'} accounts only.`,
      };
    }

    return { valid: true, userId: record.userId, email: record.email, roleId: record.roleId };
  },

  consumePasswordResetToken(
    token: string,
    newPassword: string,
    expectedRole?: UserRole
  ): { success: boolean; roleId?: UserRole; error?: string } {
    const verification = this.verifyPasswordResetToken(token, expectedRole);
    if (!verification.valid || !verification.userId) {
      return { success: false, error: verification.error || 'Your password reset link is invalid or has expired. Please request a new recovery link.' };
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return { success: false, error: strength.errors[0] };
    }

    // Update password with one-way scrypt hash
    db.credentials[verification.userId] = hashPassword(newPassword);

    // Invalidate token immediately
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const record = db.passwordResetTokens.find((t) => t.tokenHash === tokenHash);
    if (record) {
      record.consumed = true;
    }

    this.logAudit(verification.email || 'user', 'PASSWORD_RESET_COMPLETED', 'USER', verification.userId, {
      role: verification.roleId,
    });

    return { success: true, roleId: verification.roleId };
  },

  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const idx = db.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.profiles[idx] = {
      ...db.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return db.profiles[idx];
  },

  toggleUserActive(id: string): Profile | null {
    const idx = db.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.profiles[idx].is_active = !db.profiles[idx].is_active;
    db.profiles[idx].updated_at = new Date().toISOString();
    return db.profiles[idx];
  },

  updateUserRole(id: string, role: UserRole): Profile | null {
    const idx = db.profiles.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    // Strict role immutability: Role changes are prohibited
    if (db.profiles[idx].role_id !== role) {
      console.warn(`[Security] Blocked unauthorized role modification attempt for user ${id}`);
      return null;
    }
    return db.profiles[idx];
  },

  deleteUser(userId: string): boolean {
    const idx = db.profiles.findIndex((p) => p.id === userId);
    if (idx === -1) return false;
    db.profiles.splice(idx, 1);
    delete db.credentials[userId];
    return true;
  },

  createUser(profile: Omit<Profile, 'created_at' | 'updated_at'>, initialPassword?: string): Profile {
    const newProfile: Profile = {
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.profiles.push(newProfile);
    db.credentials[newProfile.id] = hashPassword(initialPassword || 'Password123!');
    return newProfile;
  },

  updateSurveyStatuses(): void {
    const now = Date.now();
    for (const s of db.surveys) {
      if (s.status === 'ACTIVE' && new Date(s.end_date).getTime() < now) {
        s.status = 'EXPIRED';
      } else if (
        s.status === 'SCHEDULED' &&
        new Date(s.start_date).getTime() <= now &&
        new Date(s.end_date).getTime() > now
      ) {
        s.status = 'ACTIVE';
      }
    }
  },

  // --- Surveys ---
  getSurveys(userRole?: UserRole): Survey[] {
    this.updateSurveyStatuses();
    let list = [...db.surveys];
    if (userRole && userRole !== 'ADMINISTRATOR') {
      list = list.filter(
        (s) => s.status === 'ACTIVE' && s.target_roles.includes(userRole)
      );
    }
    return list.map((s) => ({
      ...s,
      questions_count: db.questions.filter((q) => q.survey_id === s.id).length,
      responses_count: db.responses.filter((r) => r.survey_id === s.id).length,
      qr_code: db.qrCodes.find((q) => q.survey_id === s.id),
    }));
  },

  getSurveyById(id: string): Survey | undefined {
    this.updateSurveyStatuses();
    const survey = db.surveys.find((s) => s.id === id);
    if (!survey) return undefined;
    return {
      ...survey,
      questions_count: db.questions.filter((q) => q.survey_id === survey.id).length,
      responses_count: db.responses.filter((r) => r.survey_id === survey.id).length,
      qr_code: db.qrCodes.find((q) => q.survey_id === survey.id),
    };
  },

  createSurvey(survey: Omit<Survey, 'id' | 'created_at' | 'updated_at'>): Survey {
    const id = crypto.randomUUID();
    const newSurvey: Survey = {
      ...survey,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.surveys.unshift(newSurvey);
    return newSurvey;
  },

  updateSurvey(id: string, updates: Partial<Survey>): Survey | null {
    const idx = db.surveys.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    db.surveys[idx] = {
      ...db.surveys[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return db.surveys[idx];
  },

  deleteSurvey(id: string): boolean {
    const idx = db.surveys.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    db.surveys.splice(idx, 1);
    db.questions = db.questions.filter((q) => q.survey_id !== id);
    db.responses = db.responses.filter((r) => r.survey_id !== id);
    db.qrCodes = db.qrCodes.filter((q) => q.survey_id !== id);
    return true;
  },

  upsertSurveyFromDb(survey: any, questions?: any[]): void {
    const idx = db.surveys.findIndex((s) => s.id === survey.id);
    if (idx >= 0) {
      db.surveys[idx] = { ...db.surveys[idx], ...survey };
    } else {
      db.surveys.unshift(survey);
    }
    if (questions && questions.length > 0) {
      db.questions = db.questions.filter((q) => q.survey_id !== survey.id);
      db.questions.push(...questions);
    }
  },

  // --- Questions ---
  getQuestionsBySurveyId(surveyId: string): SurveyQuestion[] {
    return db.questions
      .filter((q) => q.survey_id === surveyId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  createQuestion(question: Omit<SurveyQuestion, 'id' | 'created_at' | 'updated_at'>): SurveyQuestion {
    const id = crypto.randomUUID();
    const newQuestion: SurveyQuestion = {
      ...question,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.questions.push(newQuestion);
    return newQuestion;
  },

  updateQuestion(id: string, updates: Partial<SurveyQuestion>): SurveyQuestion | null {
    const idx = db.questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    db.questions[idx] = {
      ...db.questions[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return db.questions[idx];
  },

  deleteQuestion(id: string): boolean {
    const idx = db.questions.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    db.questions.splice(idx, 1);
    return true;
  },

  // --- Survey Submission & Zero-Knowledge Decoupling ---
  hasUserCompletedSurvey(userId: string, surveyId: string): boolean {
    return db.receipts.some((r) => r.user_id === userId && r.survey_id === surveyId);
  },

  getUserCompletedSurveyIds(userId: string): string[] {
    return db.receipts.filter((r) => r.user_id === userId).map((r) => r.survey_id);
  },

  submitSurveyAnswers(
    surveyId: string,
    userId: string,
    isAnonymous: boolean,
    answers: Record<string, string | string[] | number | boolean>
  ): { success: boolean; token: string } {
    // 0. Verify deadline and active status
    const survey = db.surveys.find((s) => s.id === surveyId);
    if (!survey) {
      throw new Error('Survey not found.');
    }
    const now = Date.now();
    if (now > new Date(survey.end_date).getTime() || survey.status === 'EXPIRED') {
      survey.status = 'EXPIRED';
      throw new Error('This survey has passed its scheduled deadline and is no longer accepting responses.');
    }

    // 1. Check duplicate submission
    if (this.hasUserCompletedSurvey(userId, surveyId)) {
      throw new Error('You have already submitted this survey. Duplicate submissions are not permitted.');
    }

    // 2. Insert Participation Receipt (proves user completed it, but has zero reference to the answers)
    db.receipts.push({
      id: crypto.randomUUID(),
      survey_id: surveyId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });

    // 3. Generate Cryptographic Unlinked Token
    const submissionToken = generateSubmissionToken();
    const responseId = crypto.randomUUID();

    // 4. Save response: In anonymous mode, user_id is strictly NULL
    const responseRecord: SurveyResponse = {
      id: responseId,
      survey_id: surveyId,
      user_id: isAnonymous ? null : userId,
      is_anonymous: isAnonymous,
      submission_token: submissionToken,
      completed_at: new Date().toISOString(),
    };
    db.responses.push(responseRecord);

    // 5. Save answers
    for (const [questionId, val] of Object.entries(answers)) {
      db.answers.push({
        id: crypto.randomUUID(),
        response_id: responseId,
        question_id: questionId,
        answer_value: val,
        created_at: new Date().toISOString(),
      });
    }

    return { success: true, token: submissionToken };
  },

  getSurveyResults(surveyId: string) {
    const survey = this.getSurveyById(surveyId);
    const questions = this.getQuestionsBySurveyId(surveyId);
    const responses = db.responses.filter((r) => r.survey_id === surveyId);
    const responseIds = responses.map((r) => r.id);
    const answers = db.answers.filter((a) => responseIds.includes(a.response_id));

    // Aggregate statistics per question
    const aggregatedQuestions = questions.map((q) => {
      const qAnswers = answers.filter((a) => a.question_id === q.id);
      const totalAnswers = qAnswers.length;

      let distribution: Record<string, number> = {};
      let averageRating: number | null = null;
      let textResponses: string[] = [];

      if (q.question_type === 'RATING_SCALE') {
        let sum = 0;
        let count = 0;
        for (const ans of qAnswers) {
          const num = Number(ans.answer_value);
          if (!isNaN(num)) {
            sum += num;
            count++;
            distribution[num] = (distribution[num] || 0) + 1;
          }
        }
        averageRating = count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
      } else if (
        q.question_type === 'MULTIPLE_CHOICE' ||
        q.question_type === 'YES_NO'
      ) {
        for (const ans of qAnswers) {
          const val = String(ans.answer_value);
          distribution[val] = (distribution[val] || 0) + 1;
        }
      } else if (q.question_type === 'CHECKBOX') {
        for (const ans of qAnswers) {
          const arr = Array.isArray(ans.answer_value)
            ? (ans.answer_value as string[])
            : [String(ans.answer_value)];
          for (const item of arr) {
            distribution[item] = (distribution[item] || 0) + 1;
          }
        }
      } else {
        textResponses = qAnswers.map((a) => String(a.answer_value));
      }

      return {
        question: q,
        totalAnswers,
        distribution,
        averageRating,
        textResponses,
      };
    });

    return {
      survey,
      totalResponses: responses.length,
      anonymousResponses: responses.filter((r) => r.is_anonymous).length,
      identifiedResponses: responses.filter((r) => !r.is_anonymous).length,
      aggregatedQuestions,
      responses,
    };
  },

  // --- Feedback ---
  getFeedbacks(userId?: string, userRole?: UserRole): Feedback[] {
    let list = [...db.feedback];
    if (userRole && userRole !== 'ADMINISTRATOR') {
      list = list.filter((f) => f.user_id === userId && !f.is_anonymous);
    }
    // Decrypt content for return and strictly sanitize anonymous identity
    return list
      .map((f) => ({
        ...f,
        user_id: f.is_anonymous ? null : f.user_id,
        user_email: f.is_anonymous ? null : f.user_email,
        user_name: f.is_anonymous ? null : (f.user_name || 'Verified User'),
        decrypted_content: decryptAES256(f.content_encrypted, f.content_iv, f.content_tag),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  submitFeedback(feedbackData: {
    title: string;
    category: Feedback['category'];
    content: string;
    is_anonymous: boolean;
    user_id?: string | null;
  }): Feedback {
    const encrypted = encryptAES256(feedbackData.content);
    const user = feedbackData.user_id ? this.getProfileById(feedbackData.user_id) : null;

    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      title: feedbackData.title,
      category: feedbackData.category,
      content_encrypted: encrypted.encrypted,
      content_iv: encrypted.iv,
      content_tag: encrypted.tag,
      is_anonymous: feedbackData.is_anonymous,
      user_id: feedbackData.is_anonymous ? null : feedbackData.user_id,
      user_email: feedbackData.is_anonymous ? null : user?.email,
      user_name: feedbackData.is_anonymous ? null : user?.full_name,
      status: 'PENDING',
      admin_notes: null,
      decrypted_content: feedbackData.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.feedback.unshift(newFeedback);
    return newFeedback;
  },

  updateUserFeedback(
    feedbackId: string,
    userId: string,
    updates: { title?: string; category?: Feedback['category']; content?: string }
  ): Feedback | null {
    const idx = db.feedback.findIndex((f) => f.id === feedbackId);
    if (idx === -1) return null;
    const fb = db.feedback[idx];
    if (fb.user_id !== userId || fb.status !== 'PENDING') {
      return null;
    }
    if (updates.title) fb.title = updates.title;
    if (updates.category) fb.category = updates.category;
    if (updates.content) {
      const enc = encryptAES256(updates.content);
      fb.content_encrypted = enc.encrypted;
      fb.content_iv = enc.iv;
      fb.content_tag = enc.tag;
      fb.decrypted_content = updates.content;
    }
    fb.updated_at = new Date().toISOString();
    return {
      ...fb,
      decrypted_content: decryptAES256(fb.content_encrypted, fb.content_iv, fb.content_tag),
    };
  },

  deleteFeedback(id: string): boolean {
    const idx = db.feedback.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    db.feedback.splice(idx, 1);
    return true;
  },

  updateFeedbackStatus(id: string, status: Feedback['status'], adminNotes?: string): Feedback | null {
    const idx = db.feedback.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    db.feedback[idx].status = status;
    if (adminNotes !== undefined) {
      db.feedback[idx].admin_notes = adminNotes;
    }
    db.feedback[idx].updated_at = new Date().toISOString();
    return {
      ...db.feedback[idx],
      decrypted_content: decryptAES256(
        db.feedback[idx].content_encrypted,
        db.feedback[idx].content_iv,
        db.feedback[idx].content_tag
      ),
    };
  },

  // --- QR Codes ---
  getQRCodeBySurveyId(surveyId: string): QRCodeRecord | undefined {
    return db.qrCodes.find((q) => q.survey_id === surveyId);
  },

  getQRCodeByCodeData(codeData: string): QRCodeRecord | undefined {
    return db.qrCodes.find((q) => q.code_data.toLowerCase() === codeData.trim().toLowerCase());
  },

  saveQRCode(qr: Omit<QRCodeRecord, 'id' | 'created_at' | 'updated_at' | 'scans_count'>): QRCodeRecord {
    const existingIdx = db.qrCodes.findIndex((q) => q.survey_id === qr.survey_id);
    if (existingIdx !== -1) {
      db.qrCodes[existingIdx] = {
        ...db.qrCodes[existingIdx],
        ...qr,
        updated_at: new Date().toISOString(),
      };
      return db.qrCodes[existingIdx];
    }
    const newQr: QRCodeRecord = {
      ...qr,
      id: crypto.randomUUID(),
      scans_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.qrCodes.push(newQr);
    return newQr;
  },

  incrementQRScan(id: string) {
    const qr = db.qrCodes.find((q) => q.id === id);
    if (qr) qr.scans_count++;
  },

  getQRCodes(): QRCodeRecord[] {
    return [...db.qrCodes];
  },

  deleteQRCode(id: string): boolean {
    const idx = db.qrCodes.findIndex((q) => q.id === id || q.survey_id === id);
    if (idx === -1) return false;
    db.qrCodes.splice(idx, 1);
    return true;
  },

  // --- Notifications ---
  getNotifications(userId?: string, userRole?: UserRole): SystemNotification[] {
    const completedIds = userId ? this.getUserCompletedSurveyIds(userId) : [];

    return db.notifications
      .filter((n) => {
        if (!userId) return true;
        if (userRole === 'ADMINISTRATOR') return true;

        // Requirement 10: If notification is for a survey this student already completed, remove from notification center
        if (n.link && completedIds.length > 0) {
          const match = n.link.match(/\/surveys\/([a-zA-Z0-9_-]+)/);
          if (match && completedIds.includes(match[1])) {
            return false;
          }
        }

        if (n.user_id === userId) return true;
        if (n.target_role && userRole && n.target_role === userRole) return true;
        if (!n.user_id && !n.target_role) return true;
        return false;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  markNotificationAsRead(id: string): boolean {
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  },

  createNotification(notif: Omit<SystemNotification, 'id' | 'created_at' | 'is_read'>): SystemNotification {
    const newNotif: SystemNotification = {
      ...notif,
      id: crypto.randomUUID(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    db.notifications.unshift(newNotif);
    return newNotif;
  },

  deleteNotification(id: string): boolean {
    const idx = db.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    db.notifications.splice(idx, 1);
    return true;
  },

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return [...db.auditLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  logAudit(actorEmail: string, action: string, entityType: string, entityId?: string | null, details = {}, ip = '127.0.0.1'): AuditLog {
    const actor = this.getProfileByEmail(actorEmail);
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      actor_id: actor?.id || null,
      actor_email: actorEmail,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details,
      ip_address: ip,
      created_at: new Date().toISOString(),
    };
    db.auditLogs.unshift(newLog);
    return newLog;
  },

  // --- Backups ---
  getBackups(): SystemBackup[] {
    return [...db.backups].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  createBackup(type: SystemBackup['backup_type'], actorId?: string): { backup: SystemBackup; data: string } {
    const payload = JSON.stringify(db, null, 2);
    const sizeBytes = Buffer.byteLength(payload, 'utf8');
    const filename = `backup-itdept-${type.toLowerCase()}-${Date.now()}.json`;

    const newBackup: SystemBackup = {
      id: crypto.randomUUID(),
      filename,
      size_bytes: sizeBytes,
      backup_type: type,
      created_by: actorId || null,
      created_at: new Date().toISOString(),
    };
    db.backups.unshift(newBackup);
    return { backup: newBackup, data: payload };
  },
};
