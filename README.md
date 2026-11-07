# IT Department Feedback and Survey System

A complete, production-grade, responsive web-based application built for educational and institutional IT departments. The system facilitates end-to-end survey lifecycles, encrypted stakeholder feedback, cryptographic anonymous participation decoupling, dynamic QR code dispatching, real-time audit logging, and automated PDF/CSV analytical reporting.

---

## 1. System Overview & Technology Stack

The **IT Department Feedback and Survey System** supports two distinct, strictly isolated user roles: **Students** and **Department Administrators**.

### Tech Stack
- **Framework & Runtime**: Next.js 14 (App Router, Server Actions, Dynamic API Routes)
- **Language**: TypeScript (Strict typing, zero compiler errors)
- **Database & Auth**: Supabase PostgreSQL + Supabase Auth / SSR + High-fidelity In-Memory Mock Adapter with Pre-seeded Database
- **Styling & Design System**: Tailwind CSS, PostCSS, Radix UI primitives (`@radix-ui/*`), Shadcn/UI standards
- **Icons**: Lucide React
- **Data Visualizations & Charts**: Recharts (Pie, Bar, Line, Radar analytics)
- **QR Code Engine**: `qrcode` (Vector generation) & `html5-qrcode` (Live camera scanner with manual code fallback)
- **Document & Data Export**: `jspdf` + `jspdf-autotable` (PDF Reports) & `papaparse` (CSV Exports)
- **Security & Cryptography**: AES-256-GCM authenticated encryption (`node:crypto`), SHA-256 HMAC tokens, Row Level Security (RLS)

---

## 2. User Roles & Dedicated Authentication Portals

The platform enforces strict role isolation with dedicated login portals. The quick role switcher has been completely removed; users authenticate with their registered credentials:

| Role | Dedicated Login Portal | Credentials | Primary Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **STUDENT** | `/student/login` | `student@itdept.edu`<br/>`Password123!` | Access Student Dashboard (`/student/dashboard`), browse active surveys, submit responses, submit encrypted anonymous feedback, scan QR codes, view submission history with cryptographic tokens. Self-registration available at `/student/register`. |
| **ADMINISTRATOR** | `/admin/login` | `admin@itdept.edu`<br/>`Password123!` | Access Administrator Dashboard (`/admin/dashboard`), manage students and user accounts, author and schedule surveys, moderate encrypted feedback, inspect audit logs, manage database backups, and export PDF/CSV analytical reports. Strictly provisioned accounts. |

---

## 3. Implemented Functional Modules

### Module 1: User Account Management
- Institutional registration (`/auth/register`), authentication (`/auth/login`), and password reset request (`/auth/forgot-password`).
- Profile view and real-time editing (`/profile`).
- Administrator User Directory (`/admin/users`) with role modification and account activation/deactivation toggles.

### Module 2: Survey Lifecycle Management
- Survey creation wizard (`/admin/surveys/create`) supporting scheduling dates, target audiences, and anonymous submission toggles.
- Lifecycle state transitions (`DRAFT`, `SCHEDULED`, `ACTIVE`, `EXPIRED`, `CLOSED`).
- Public catalog of eligible surveys (`/surveys`) and submission history (`/surveys/history`).

### Module 3: Encrypted Feedback Management
- Regular and anonymous department feedback submission (`/feedback`).
- **AES-256-GCM Encryption**: Feedback payloads are encrypted before persistence. The initialization vector (IV) and authentication tag are strictly stored alongside ciphertext.
- Feedback categorization (`FACILITY_LAB`, `CURRICULUM`, `FACULTY_INSTRUCTION`, `ADMINISTRATIVE`, `CAMPUS_NETWORK`, `OTHER`).
- Administrator feedback console (`/admin/feedback`) with inline decryption keys and status tracking (`PENDING_REVIEW`, `RESOLVED`, etc.).

### Module 4: Dynamic Question Engine (6 Question Types)
Supports 6 interactive question types with real-time client & server validation:
1. **Multiple Choice** (Radio selection with custom options)
2. **Checkbox** (Multi-select array responses)
3. **Short Answer** (Single-line institutional input)
4. **Paragraph** (Multi-line detailed responses)
5. **Rating Scale** (1 to 5 numerical satisfaction matrix)
6. **Yes or No** (Binary quick assessments)

### Module 5: QR Code Management & Camera Scanning
- Automatic QR code creation for every created survey.
- High-resolution SVG and PNG QR rendering (`/admin/qr-codes` & `/surveys/[id]/qr`).
- Live camera barcode/QR scanner (`/scan`) built on `html5-qrcode` with manual code validator and route redirection.
- Rejection of invalid, expired, or deactivated QR codes.

### Module 6: Executive Dashboards & Automated Reports
- **User Dashboard** (`/dashboard`): Available surveys, submission receipts, recent notifications.
- **Admin Command Center** (`/admin`): Live statistics (users, surveys, response counts, feedback totals, recent audit stream).
- **Survey Analytics** (`/admin/surveys/[id]/results`): Real-time Recharts visualizations (Pie charts, satisfaction bars).
- **Executive Reports Engine** (`/admin/reports`): Filterable by date, category, and target audience with one-click **PDF Report Generation** and **CSV Data Export**.

### Module 7: Notifications & Reminders
- In-app notification center (`/notifications`) with read/unread tracking and direct navigation links.
- Administrator broadcast dispatch modal (`/admin/notifications`) to alert specific roles or the entire department.

### Module 8: Security & Data Protection
- **Zero-Knowledge Anonymous Decoupling**: For anonymous surveys, the user's ID is stored only in a separate `survey_participation_receipts` table to enforce single-submission rules. The actual answers in `survey_responses` store `user_id = NULL` with a random cryptographic token (`SUB-XXXX`).
- **Audit Logging**: Comprehensive security log (`/admin/audit-logs`) tracking logins, submissions, updates, and role alterations.
- **Database Backup Center** (`/admin/backups`): Create, inspect, verify SHA-256 checksums, and download database backup snapshots.

---

## 4. Project Directory Layout

```
it-feedback-survey/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── audit-logs/page.tsx
│   │   │   ├── backups/page.tsx
│   │   │   ├── feedback/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── qr-codes/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── surveys/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── edit/page.tsx
│   │   │   │   │   └── results/page.tsx
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── feedback/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── scan/page.tsx
│   │   ├── surveys/
│   │   │   ├── [id]/
│   │   │   │   ├── qr/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── history/page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── actions/                  # Next.js Server Actions
│   │   ├── auth.ts
│   │   ├── backups.ts
│   │   ├── feedback.ts
│   │   ├── notifications.ts
│   │   ├── qr.ts
│   │   ├── surveys.ts
│   │   └── users.ts
│   ├── api/                      # RESTful API Endpoints
│   │   ├── admin/
│   │   ├── notifications/
│   │   └── surveys/
│   ├── auth/                     # Public Authentication Pages
│   │   ├── forgot-password/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Public Institutional Landing Page
├── components/
│   ├── layout/                   # Sidebar, TopNav, Header
│   ├── reports/                  # PDF & CSV Export Modules
│   ├── surveys/                  # QuestionBuilder, QuestionRenderer, SurveyCard
│   └── ui/                       # Reusable Shadcn UI Design Primitives
├── lib/
│   ├── auth/session.ts           # Cookie-based session & RBAC guards
│   ├── crypto/aes.ts             # AES-256-GCM encryption & HMAC tokens
│   ├── reports/                  # Client-side PDF & CSV generation
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Action Supabase client
│   │   ├── admin.ts              # Service Role client
│   │   └── mock-adapter.ts       # High-fidelity In-Memory DB & Pre-seeded State
│   └── types/database.ts         # Comprehensive TypeScript interfaces & types
├── scripts/
│   ├── test-crypto.ts            # Standalone AES-256 crypto test suite
│   └── test-survey-flow.ts       # Automated 7-step full system verification test
└── supabase/
    ├── migrations/
    │   └── 20261105000000_init_schema.sql  # Complete PostgreSQL DDL schema & RLS
    └── seed.sql                  # Initial mock seed records
```

---

## 5. Local Setup & Running Instructions

### Prerequisites
- **Node.js**: v18.17+ or v20+ (Node v24 tested)
- **npm** or **pnpm**

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(The pre-configured demo defaults allow instant local execution without requiring a remote Supabase instance immediately)*.

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Automated Testing & Verification

Run the automated test suites to verify cryptographic functions, user roles, surveys, question types, anonymous decoupling, and audit logs:

### 1. Test AES-256-GCM Encryption
```bash
npm run test:crypto
```
*Validates encryption, hex encoding, IV generation, authentication tag validation, and plaintext recovery.*

### 2. Test Full System Flow & RBAC
```bash
npm run test:system
```
*Executes an end-to-end simulation covering all 4 user roles, survey answering across 6 question types, anonymous decoupling validation, duplicate submission blockage, and audit log generation.*

---

## 7. Production Build

To verify production readiness:
```bash
npm run build
npm start
```
All 31 application and API routes build statically and dynamically with zero TypeScript and ESLint errors.

---

## 8. Supabase Production Deployment

When deploying to a live Supabase project:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the contents of [`supabase/migrations/20261105000000_init_schema.sql`](supabase/migrations/20261105000000_init_schema.sql).
4. Run [`supabase/seed.sql`](supabase/seed.sql) to populate initial institutional records.
5. In your deployment hosting platform (e.g., Vercel), configure the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `FEEDBACK_ENCRYPTION_KEY`: A secure 64-character hex key (32 bytes)
   - `USE_LOCAL_MOCK_STORAGE`: `false`

