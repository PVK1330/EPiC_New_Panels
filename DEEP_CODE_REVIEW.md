# EPiC Immigration Case Management System — Deep Code Review

**Date:** 2026-05-28  
**Reviewer:** Automated Deep-Dive Audit  
**Scope:** Full-stack (Backend: Express 5 + Sequelize + PostgreSQL | Frontend: React 19 + Vite + Redux Toolkit)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Backend Deep-Dive](#3-backend-deep-dive)
   - 3.1 [Authentication & Authorization](#31-authentication--authorization)
   - 3.2 [Multi-Tenant Database Architecture](#32-multi-tenant-database-architecture)
   - 3.3 [API Design & Route Structure](#33-api-design--route-structure)
   - 3.4 [Controller & Service Layer](#34-controller--service-layer)
   - 3.5 [Database Models & Migrations](#35-database-models--migrations)
   - 3.6 [Real-Time Infrastructure](#36-real-time-infrastructure)
   - 3.7 [Email & Notification Services](#37-email--notification-services)
   - 3.8 [Payment & Billing](#38-payment--billing)
   - 3.9 [Subscription Lifecycle](#39-subscription-lifecycle)
   - 3.10 [Security Posture](#310-security-posture)
4. [Frontend Deep-Dive](#4-frontend-deep-dive)
   - 4.1 [State Management](#41-state-management)
   - 4.2 [Routing Architecture](#42-routing-architecture)
   - 4.3 [API Service Layer](#43-api-service-layer)
   - 4.4 [Authentication Flow](#44-authentication-flow)
   - 4.5 [Component Architecture](#45-component-architecture)
   - 4.6 [Key Pages & Features](#46-key-pages--features)
   - 4.7 [Multi-Tenant Subdomain Handling](#47-multi-tenant-subdomain-handling)
5. [Critical Findings & Risks](#5-critical-findings--risks) 
6. [Recommendations](#6-recommendations)
7. [Feature Completeness Assessment](#7-feature-completeness-assessment)
8. [Appendix: File Inventory](#8-appendix-file-inventory)

---

## 1. Executive Summary

The EPiC Immigration Case Management System is a **multi-tenant SaaS platform** built for UK immigration firms (Elite Pic). It supports five core roles: **Candidate**, **Caseworker**, **Admin**, **Business/Sponsor**, and **Superadmin**. The system handles the complete immigration case lifecycle from enquiry through visa application, biometrics, document management, payments, compliance tracking, sponsor licence management, and CoS allocation.

**Strengths:**
- Well-structured multi-tenant architecture with per-organisation PostgreSQL databases
- Comprehensive role-based access control with granular permissions
- Strong auth flow: OTP registration, 2FA (TOTP), password reset, session invalidation
- Modular codebase with service layer separation in some areas
- Real-time messaging via Socket.IO with proper room-based architecture
- Per-tenant Stripe integration with webhook handling
- Automated subscription lifecycle management and compliance alerting
- Dynamic CORS configuration for tenant subdomains

**Concerns:**
- Hardcoded fallback JWT secret (`"epic-secret-key"`) in 4 locations
- Extensive `console.log` usage (~83 instances) — many appear to be debug logs in production code
- Inconsistent error handling patterns (mixed `try/catch` vs `catchAsync` wrapper)
- Large controller files (e.g., `workflow.controller.js` at 1863 lines, `dashboard.controller.js` at 1065 lines)
- Mixed response formats (some use `ApiResponse` utility, others use raw `res.status().json()`)
- Multiple auth service files on the frontend (`auth.service.js`, `authService.js`, `auth2faService.js`) causing fragmentation
- The `Login.jsx` page at 850+ lines directly calls auth services, bypassing the `useAuth` hook abstraction used elsewhere
- 75+ TODO/placeholder markers documented in the existing [`PROJECT_REPORT.md`](PROJECT_REPORT.md)

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19 + Vite)             │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ │
│  │  Redux   │ │  React   │ │  Axios    │ │ Socket.IO │ │
│  │  Store   │ │  Router  │ │  Services │ │  Client   │ │
│  └──────────┘ └──────────┘ └───────────┘ └───────────┘ │
│                      │  HTTPS/REST + WSS                 │
└──────────────────────┼──────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────┐
│              BACKEND (Express 5 + Node.js)               │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ │
│  │  CORS    │ │  JWT     │ │  RBAC     │ │  Rate     │ │
│  │  Middle- │ │  Auth    │ │  Middle-  │ │  Limiting │ │
│  │  ware    │ │  Middle- │ │  ware     │ │  (none)   │ │
│  │          │ │  ware    │ │           │ │           │ │
│  └──────────┘ └──────────┘ └───────────┘ └───────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Modular Route Handlers               │   │
│  │  Auth │ Admin │ Caseworker │ Candidate │ Sponsor  │   │
│  │  Shared │ Superadmin │ Workflow │ Messages       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────┐  ┌────────────────────────────┐   │
│  │  Platform DB    │  │  Tenant DBs (per org)      │   │
│  │  (PostgreSQL)   │  │  epic_acme, epic_beta, ... │   │
│  │  - users        │  │  - users (mirrored)        │   │
│  │  - organisations│  │  - cases, tasks, docs      │   │
│  │  - subscriptions│  │  - messages, notifications │   │
│  │  - plans        │  │  - licence applications    │   │
│  │  - audit logs   │  │  - sponsor profiles        │   │
│  └─────────────────┘  └────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**
1. **Per-tenant PostgreSQL databases** — Strong data isolation; each organisation gets a dedicated database (`epic_<slug>`). This is excellent for security and compliance but adds operational complexity.
2. **Platform DB for cross-cutting concerns** — Users, organisations, subscriptions, plans, and platform audit logs live in a shared "platform" database. User records are mirrored to tenant DBs.
3. **Express 5** (currently in pre-release) — Bleeding edge choice; API is mostly stable but worth monitoring.
4. **No API versioning** — All routes are under `/api/` with no version prefix (e.g., `/api/v1/`).

---

## 3. Backend Deep-Dive

### 3.1 Authentication & Authorization

**Files:**
- [`Server/src/modules/Auth/auth.controller.js`](Server/src/modules/Auth/auth.controller.js) (1131 lines)
- [`Server/src/middlewares/auth.middleware.js`](Server/src/middlewares/auth.middleware.js) (109 lines)
- [`Server/src/middlewares/authStack.middleware.js`](Server/src/middlewares/authStack.middleware.js) (10 lines)
- [`Server/src/middlewares/role.middleware.js`](Server/src/middlewares/role.middleware.js) (74 lines)
- [`Server/src/middlewares/tenantDb.middleware.js`](Server/src/middlewares/tenantDb.middleware.js) (138 lines)

**Auth Flow:**
1. **Registration** → Email + password + profile fields → UnverifiedUser record created → OTP emailed → verifyOTP → User created on platform + tenant DBs → JWT issued
2. **Login** → Email + password → Org subscription check → 2FA detection → JWT with 7d expiry (verify2FA) or immediate login
3. **2FA** → speakeasy TOTP with QR code setup → verify → backup codes
4. **Password Reset** → Email → OTP → verify → set new password → `password_changed_at` timestamp updated for session invalidation
5. **Logout** → Clears cookie

**Authorization Stack:**
- [`verifyToken`](Server/src/middlewares/auth.middleware.js:13) — JWT verification, user status check, org subscription validation
- [`attachTenantDb`](Server/src/middlewares/tenantDb.middleware.js:17) — Resolves tenant DB, loads user permissions with 2-min cache
- [`checkRole`](Server/src/middlewares/role.middleware.js:22) — Array-based role gate
- [`checkPermission`](Server/src/middlewares/role.middleware.js:40) — Single permission string gate
- [`checkAnyPermission`](Server/src/middlewares/role.middleware.js:59) — At-least-one permission gate
- [`hasFullAccessRole`](Server/src/middlewares/role.middleware.js:13) — Admins (role 3) and Superadmins (role 5) bypass permission checks

**Concerns:**
- The JWT secret fallback `"epic-secret-key"` is hardcoded in 4 locations. If `JWT_SECRET` env var is missing in production, every JWT can be forged.
- No token refresh mechanism — tokens are long-lived (7 days).
- Rate limiting is **not implemented** on auth endpoints (login, register, OTP), making them vulnerable to brute force.
- Password validation on the backend only checks `>= 8 characters` with no complexity requirements.
- The `resendOtpUser` and `verifyOtpUser` endpoints (lines 17-18 of [`auth.routes.js`](Server/src/modules/Auth/auth.routes.js:17)) are **not behind `verifyTokenAndTenant`**, which seems intentional for user-initiated flows but warrants a security review.
- The [`corsOriginDelegate`](Server/src/config/frontendOrigins.js:106) uses a callback-based pattern that can inadvertently accept `undefined` origins in some configurations.

### 3.2 Multi-Tenant Database Architecture

**Files:**
- [`Server/src/services/tenantDatabaseProvision.service.js`](Server/src/services/tenantDatabaseProvision.service.js) (235 lines)
- [`Server/src/services/tenantDb.service.js`](Server/src/services/tenantDb.service.js)
- [`Server/src/services/tenantSeed.service.js`](Server/src/services/tenantSeed.service.js)
- [`Server/src/services/userSync.service.js`](Server/src/services/userSync.service.js)
- [`Server/src/middlewares/tenantDb.middleware.js`](Server/src/middlewares/tenantDb.middleware.js) (138 lines)

**Architecture:**
- Each organisation gets a physical PostgreSQL database named `epic_<slug>` (max 63 chars).
- Database provisioning happens at organisation creation and during server bootstrap.
- User records are mirrored: platform DB holds the canonical user, tenant DB holds a copy for relational queries.
- Tenant DB connections are managed via [`getTenantDb()`](Server/src/services/tenantDb.service.js) with Sequelize instances.
- Organisation context is resolved from the `X-Organisation-Slug` header or subdomain.

**Strengths:**
- Strong data isolation — no cross-tenant data leakage possible at the database level
- Proper SSL propagation from Sequelize config to raw `pg.Client` connections
- Tenant database name sanitization via [`normalizePostgresDatabaseName`](Server/src/config/config.js)
- Graceful fallback when `TENANT_DB_ENABLED=false` (single-database mode for development)

**Concerns:**
- The 2-minute permission cache in [`attachTenantDb`](Server/src/middlewares/tenantDb.middleware.js) means permission changes take up to 2 minutes to propagate.
- No connection pooling strategy documented for tenant DBs — each tenant DB gets its own Sequelize instance.
- The `isPhysicalTenantDatabaseEnabled()` flag allows running without tenant isolation, which could be accidentally enabled in production.
- Tenant database dropping is implemented but there's no soft-delete safety net before physical DB deletion.

### 3.3 API Design & Route Structure

**File:** [`Server/src/routes/index.js`](Server/src/routes/index.js) (108 lines)

The route structure is well-organized with clear separation:

| Prefix | Module | Purpose |
|--------|--------|---------|
| `/api/auth` | Auth | Registration, login, OTP, 2FA |
| `/api/user` | User | Profile management |
| `/api/admin` | Admin | Dashboard, cases, candidates, finance, settings |
| `/api/caseworker` | Caseworker | Case management, performance, documents |
| `/api/candidate` | Candidate | Application, documents, payments |
| `/api/business` | Sponsor | Licence, CoS, workers, compliance |
| `/api/superadmin` | Superadmin | Organisations, plans, billing |
| `/api/cases` | Shared | Case operations |
| `/api/messages` | Shared | Real-time messaging |
| `/api/notifications` | Shared | In-app notifications |
| `/api/documents` | Shared | Document management |
| `/api/workflow` | Shared | Case workflow stages |
| `/api/dashboard` | Shared | Dashboard statistics |
| `/api/reports` | Shared | Reporting |
| `/api/audit-logs` | Admin (alias) | Audit log access |

**Observations:**
- The route file at 108 lines is clean and manageable — good separation of concerns.
- Frontend-compatibility alias: [`/api/audit-logs`](Server/src/routes/index.js:63) maps to admin audit routes for both `/api/admin/audit-logs` and `/api/audit-logs`.
- No API versioning prefix (e.g., `/api/v1/`). This will make breaking changes difficult.
- Route ordering matters: `/cases/reschedule` is mounted before `/cases` to avoid route conflicts.

### 3.4 Controller & Service Layer

**Architecture Pattern:** The codebase shows an evolving architecture. Newer modules use a clean **Controller → Service → Repository** pattern (e.g., [`candidate.controller.js`](Server/src/modules/Admin/Candidates/candidate.controller.js) → [`candidate.service.js`](Server/src/modules/Admin/Candidates/candidate.service.js) → [`candidate.repository.js`](Server/src/modules/Admin/Candidates/candidate.repository.js)). Older modules mix business logic directly in controllers.

**Examples of good patterns:**
- [`candidate.controller.js`](Server/src/modules/Admin/Candidates/candidate.controller.js) — Thin controller (91 lines), delegates to `CandidateService`, uses [`catchAsync`](Server/src/utils/catchAsync.js) wrapper.
- [`catchAsync`](Server/src/utils/catchAsync.js) — 11-line utility that eliminates repetitive try/catch blocks.
- [`ApiResponse`](Server/src/utils/apiResponse.js) — Consistent response formatting utility (50 lines).

**Examples needing refactoring:**
- [`workflow.controller.js`](Server/src/modules/Shared/Workflow/workflow.controller.js) — **1863 lines**. This is the largest file in the codebase and handles the entire immigration workflow pipeline (draft review → visa portal → biometrics → CCL fee proposals → release).
- [`dashboard.controller.js`](Server/src/modules/Admin/Dashboard/dashboard.controller.js) — **1065 lines**. Mixes dashboard stats, PDF generation, recent activities, and chart data.
- [`sponsorLicence.controller.js`](Server/src/modules/Sponsor/Licence/sponsorLicence.controller.js) — **1005 lines**. Handles licence applications, CoS allocation, documents, and notifications.
- [`auth.controller.js`](Server/src/modules/Auth/auth.controller.js) — **1131 lines**. Though well-structured, the auth controller is monolithic.

**Mixed response patterns:**
- Some controllers use `ApiResponse.success(res, ...)` (consistent `{status, message, data}`)
- Others use raw `res.status(200).json({status, message, data})`
- Some use `res.status(201).json({status, message, data})` without `ApiResponse.created()`

### 3.5 Database Models & Migrations

**Platform Models** (`[`Server/src/models/platform/`](Server/src/models/platform/)`):
- `user.model.js`, `organisation.model.js`, `plan.model.js`, `subscription.model.js`, `invoice.model.js`, `paymentTransaction.model.js`, `module.model.js`, `planModule.model.js`, `platformAuditLog.model.js`, `platformNotification.model.js`, `platformSetting.model.js`

**Tenant Models** (`[`Server/src/models/tenant/`](Server/src/models/tenant/)`) — 46 models:
- Core: `case.model.js`, `task.model.js`, `document.model.js`, `notification.model.js`
- Candidate: `candidateApplication.model.js`, `candidateAccountSettings.model.js`, `dataCaptureSubmission.model.js`
- Sponsor: `sponsorProfile.model.js`, `licenceApplication.model.js`, `complianceDocument.model.js`, `rightToWorkRecord.model.js`, `workerEvent.model.js`
- Communication: `message.model.js`, `conversation.model.js`, `caseCommunication.model.js`
- Workflow: `caseTimeline.model.js`, `caseNote.model.js`, `casePayment.model.js`, `caseCclRecord.model.js`
- HR/Admin: `department.model.js`, `caseworkerProfile.model.js`, `absenceRecord.model.js`
- Settings: `slaSetting.model.js`, `slaRule.model.js`, `emailTemplateSetting.model.js`, `paymentSetting.model.js`
- Misc: `visaType.model.js`, `petitionType.model.js`, `documentChecklist.model.js`, `caseCategory.model.js`, `rescheduleHistory.model.js`

**Migrations:**
- Platform: 18 SQL migration files tracking schema evolution
- Tenant: 15 SQL migration files
- Both use a custom [`run.js`](Server/src/migrations/run.js) runner rather than Sequelize CLI

**Observations:**
- The model count (46 tenant + 12 platform = 58 models) reflects a comprehensive domain model.
- `assignedcaseworkerId` is stored as JSONB (array) in cases — enables multi-caseworker assignment.
- `workflowState` and `workflowMeta` are JSONB fields — flexible but schema-less, making validation harder.
- Timestamp columns are inconsistently named: some use `created_at` (snake_case), others use `createdAt` (camelCase from Sequelize defaults).

### 3.6 Real-Time Infrastructure

**Files:**
- [`Server/src/realtime/socketServer.js`](Server/src/realtime/socketServer.js) (125 lines)
- [`Server/src/realtime/messagingRealtime.js`](Server/src/realtime/messagingRealtime.js) (134 lines)
- [`Server/src/realtime/ioRegistry.js`](Server/src/realtime/ioRegistry.js)

**Architecture:**
- Socket.IO server attached to the HTTP server
- JWT authentication on socket connection via [`extractSocketToken`](Server/src/realtime/socketServer.js:9) — checks `auth.token`, query param, `Authorization` header, and `token` header
- Room-based architecture:
  - `user:<userId>` — Personal room for each user
  - `thread:<conversationId>` — Conversation room
  - `org:<organisationId>` — Organisation-wide broadcasts
- `thread:subscribe` event with acknowledgment callback for joining conversation rooms
- Authorization check: verifies the conversation belongs to the user's organisation

**Strengths:**
- Clean room-based design with proper namespacing
- Tenant verification before allowing thread subscription
- Dual delivery: `message:new` to both user rooms and thread room simultaneously
- Unread count tracking per participant on conversation update

**Concerns:**
- No heartbeat/ping mechanism visible for connection health monitoring
- No reconnection state handling on the server side
- The socket middleware catches JWT errors but doesn't differentiate between expired vs invalid tokens
- No rate limiting on socket events (potential for spam)

### 3.7 Email & Notification Services

**Files:**
- [`Server/src/services/mail.service.js`](Server/src/services/mail.service.js) (754 lines)
- [`Server/src/services/email.service.js`](Server/src/services/email.service.js) (75 lines)
- [`Server/src/services/notification.service.js`](Server/src/services/notification.service.js)
- [`Server/src/services/workflowEmail.service.js`](Server/src/services/workflowEmail.service.js)
- [`Server/src/services/workflowNotifications.service.js`](Server/src/services/workflowNotifications.service.js)
- [`Server/src/config/mail.js`](Server/src/config/mail.js)

**Email Architecture:**
- **Nodemailer** with multi-transport support:
  1. Per-organisation SMTP (stored in `Organisation.smtp_settings` JSONB or `EmailTemplateSetting`)
  2. Platform SMTP (from `PlatformSetting` or env vars)
  3. Fallback to `MAIL_*` environment variables
- **MX record validation** via DNS lookup before sending (with known-domain shortlist for Gmail, Outlook, etc.)
- **Delivery verification**: Checks `info.accepted`/`info.rejected` arrays from Nodemailer
- **Failure notification**: Generates dispatch receipts and failure notices to SMTP owners
- Transport caching via `Map` to avoid re-creating transporters

**Strengths:**
- MX record checking is a sophisticated touch that reduces bounce rates
- Multi-tier SMTP fallback (org → platform → env) is well-designed
- Proper interpretation of Nodemailer's SMTP response codes (rejected recipients)
- Transport caching for performance

**Notification Architecture:**
- `notifyUser()` / `notifyAdmins()` functions with type, priority, and metadata
- Integration with Socket.IO real-time delivery
- Workflow-triggered notifications for case stage changes

**Concerns:**
- [`mail.service.js`](Server/src/services/mail.service.js) at 754 lines is large and handles too many concerns (transport creation, sending, verification, MX checking, failure handling)
- The transport cache has no TTL/eviction — stale connections could persist indefinitely
- Email template generation utilities mix HTML strings inline rather than using a template engine

### 3.8 Payment & Billing

**Files:**
- [`Server/src/services/stripeTenant.service.js`](Server/src/services/stripeTenant.service.js) (218 lines)
- [`Server/src/modules/Candidate/Payments/stripepayment.controller.js`](Server/src/modules/Candidate/Payments/stripepayment.controller.js)
- [`Server/src/modules/Superadmin/payment.controller.js`](Server/src/modules/Superadmin/payment.controller.js)
- [`Server/src/modules/Superadmin/invoice.controller.js`](Server/src/modules/Superadmin/invoice.controller.js)

**Architecture:**
- **Per-tenant Stripe**: Each organisation can configure its own Stripe keys via `PaymentSetting` model with env var fallback
- **Stripe webhook**: Raw body parsing at [`app.js:12`](Server/src/app.js:12) before JSON middleware
- **Platform billing**: Superadmin manages plans, subscriptions, invoices via `PlatformSetting` Stripe keys
- **Payment intent tracking**: `paymentTransaction` model records intent IDs, amounts, status

**Observations:**
- The Stripe webhook handler at [`stripepayment.controller.js:619`](Server/src/modules/Candidate/Payments/stripepayment.controller.js:619) has several `// TODO` comments for unhandled event types (customer creation, update, deletion, setup intents)
- Multiple `console.log` statements in webhook handler (production concern)
- Per-tenant Stripe is a powerful feature but adds complexity for key management

### 3.9 Subscription Lifecycle

**Files:**
- [`Server/src/services/subscriptionExpiry.service.js`](Server/src/services/subscriptionExpiry.service.js) (126 lines)
- [`Server/src/services/complianceAlerts.service.js`](Server/src/services/complianceAlerts.service.js) (357 lines)

**Subscription Expiry:**
- Runs every 6 hours via `setInterval` in [`server.js`](Server/src/server.js)
- Expires subscriptions where `current_period_end < now`
- Sets organisation status to `suspended`
- Sends expiry notification emails
- Also checks for subscriptions expiring within 7 days and sends warning emails

**Compliance Alerts:**
- Runs every 24 hours
- Checks visa expiry dates at 120, 90, 60, 30-day thresholds
- Monitors worker events, right-to-work records, sponsor change requests
- Generates in-app notifications for admins and caseworkers

**Concerns:**
- `setInterval`-based scheduling is fragile — if the server restarts, the interval resets. A proper job queue (Bull/BullMQ, Agenda) would be more reliable.
- No retry mechanism for failed email sends in these cron-like jobs.
- The compliance alert service at 357 lines has duplicated `extractCaseworkerIds` logic (also appears in [`sponsorLicence.controller.js`](Server/src/modules/Sponsor/Licence/sponsorLicence.controller.js:10)).

### 3.10 Security Posture

**Strengths:**
- ✅ JWT with cookie support (`httpOnly`, `secure`, `sameSite`)
- ✅ 2FA with speakeasy TOTP
- ✅ OTP-based email verification for registration and password reset
- ✅ Password changed-at timestamp for session invalidation
- ✅ CORS with dynamic origin validation for tenant subdomains
- ✅ User status check (`active` only) on every authenticated request
- ✅ Organisation subscription status validation
- ✅ Per-tenant database isolation
- ✅ SQL injection protection via Sequelize ORM parameterized queries
- ✅ Stripe webhook signature verification
- ✅ SSL auto-detection for database connections

**Critical Risks:**
- 🔴 **JWT secret fallback**: `"epic-secret-key"` in 4 files — if `JWT_SECRET` env var is missing, all JWTs become forgeable
- 🔴 **No rate limiting**: Auth endpoints (login, OTP, register, forgot-password) have no brute-force protection
- 🟡 **No input sanitization middleware**: Relies solely on Sequelize parameterization
- 🟡 **No CSRF protection**: Cookie-based JWT needs CSRF tokens if cookies are used for auth
- 🟡 **`console.log` in production**: 83 instances, some logging sensitive data (user IDs, profile data, dates)
- 🟡 **No Helmet.js**: Missing security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- 🟡 **No request size limiting beyond express.json 2mb**: File upload endpoints could benefit from specific limits

---

## 4. Frontend Deep-Dive

### 4.1 State Management

**Files:**
- [`src/store/index.js`](src/store/index.js) (15 lines)
- [`src/store/slices/authSlice.js`](src/store/slices/authSlice.js) (46 lines)
- [`src/store/slices/notificationSlice.js`](src/store/slices/notificationSlice.js)
- [`src/store/slices/platformBrandingSlice.js`](src/store/slices/platformBrandingSlice.js)
- [`src/context/AuthContext.jsx`](src/context/AuthContext.jsx) (22 lines)

**Architecture:**
- **Redux Toolkit** with 3 slices: `auth`, `notifications`, `platformBranding`
- **Auth Slice**: Stores `user`, `token`, `allowedModules` with localStorage persistence
- **Auth Context**: Wraps Redux auth state + `useAuth` hook into React Context for component tree access — this creates **dual state sources**, where `AuthContext` reads from Redux but components can consume either
- **Notification Slice**: Separate from backend notification API — likely for UI toast notifications

**Concerns:**
- The `AuthContext` duplicates Redux state without adding value. Components can directly `useSelector(state => state.auth)` instead.
- `localStorage` for JWT tokens is vulnerable to XSS. `httpOnly` cookies (supported by the backend) would be more secure.
- The `authSlice` stores `allowedModules` but the module access hook reads from a different source (`useModuleAccess`).
- No Redux middleware (e.g., redux-persist for hydration, redux-thunk/saga for async flows).

### 4.2 Routing Architecture

**File:** [`src/routes/AppRouter.jsx`](src/routes/AppRouter.jsx) (372 lines)

**Structure:**
- All routes are **lazy-loaded** via `React.lazy()` — excellent for code splitting
- Routes organized by role with clear prefixes: `/admin/*`, `/candidate/*`, `/caseworker/*`, `/business/*`, `/superadmin/*`
- Public auth routes: `/login`, `/register`, `/verify-otp`, `/2fa`, `/forgot-password`, `/verify-reset-otp`, `/set-password`, `/auth/handoff`
- Placeholder routes for `/staff` and `/agent` portals (not yet built)
- Role-based root redirect via [`DashboardPage`](src/pages/dashboard/DashboardPage.jsx)
- `ProtectedRoute` wrapper checks token existence and role authorization

**Page Inventory (104 .jsx files):**
- **Admin**: 22 pages (dashboard, cases, candidates, caseworkers, businesses, finance, reports, announcements, audit-logs, settings, permissions, pipeline, calendar, escalations, workload, departments, documents, messages, licence-requests, etc.)
- **Candidate**: 17 pages (dashboard, visa-enquiry, application, document-checklist, upload-documents, third-party-docs, payments, communication, messages, notifications, tasks, appointments, calendar, activity-log, application-status, data-capture-sheet, ccl, biometric-availability, account)
- **Caseworker**: 14 pages (dashboard, cases, my-account, pipeline, tasks, calendar, documents, clients, messages, notifications, finance, performance, licence-reviews, reschedule-form)
- **Business/Sponsor**: 27 pages (dashboard, apply-licence, licence-documents, profile, personnel, licence, business-registration, compliance, cos-allocation, account, sponsored-workers, cosregistrationform, worker-details, licence-process, documents, messages, notifications, payment, workers, settings, calendar, reporting-obligations, employee-records, invoices, reports)
- **Superadmin**: 12 pages + settings sub-tabs (dashboard, organisations, announcements, plans, billing, audit-log, settings, notifications, payments, team, frontend, profile)
- **Auth**: 8 pages (login, register, verify-otp, forgot-password, verify-reset-otp, set-password, 2fa, handoff)
- **Shared**: dashboard redirect, 404

**Observations:**
- The route file at 372 lines is getting large. Consider splitting into role-based route files.
- `React.Suspense` fallback could be more sophisticated (loading skeletons per section).
- Role-based redirect logic is clean.

### 4.3 API Service Layer

**Files (40+ service files):**

| Service File | Purpose |
|-------------|---------|
| [`src/services/api.js`](src/services/api.js) (45 lines) | Central Axios instance with interceptors |
| [`src/services/auth.service.js`](src/services/auth.service.js) (144 lines) | Auth API calls (register, login, OTP, 2FA) |
| [`src/services/candidateApi.js`](src/services/candidateApi.js) (74 lines) | Candidate CRUD + application APIs |
| [`src/services/caseApi.js`](src/services/caseApi.js) | Case management |
| [`src/services/workflowApi.js`](src/services/workflowApi.js) | Workflow operations |
| [`src/services/messagingApi.js`](src/services/messagingApi.js) | Real-time messaging |
| [`src/services/notificationApi.js`](src/services/notificationApi.js) | Notification CRUD |
| [`src/services/adminApi.js`](src/services/adminApi.js) | Admin operations |
| [`src/services/documentApi.js`](src/services/documentApi.js) | Document management |
| 30+ additional service files for specific features |

**Axios Interceptor Architecture ([`api.js`](src/services/api.js)):**
- **Request**: Attaches `Bearer` token from localStorage, adds `X-Organisation-Slug` header from subdomain
- **Response**: Global 401 handler → dispatches `logout()` + redirects to `/login` (skipped for `/api/auth/` endpoints)
- **Config**: 10s timeout, `withCredentials: true` for cookie support

**Concerns:**
- The global 401 handler does `window.location.href = "/login"` — this is a hard redirect that loses React state. Using React Router's `navigate` would be cleaner.
- The auth service check skips `/api/auth/` but uses `includes()` which could match unrelated routes.
- **Duplicate auth service files**: `auth.service.js`, `authService.js`, `auth2faService.js` exist alongside each other. The primary one in use is `auth.service.js`.
- Many service files are thin wrappers around `api.get/post` and could be consolidated.

### 4.4 Authentication Flow

**Files:**
- [`src/hooks/useAuth.js`](src/hooks/useAuth.js) (74 lines)
- [`src/utils/authResponse.js`](src/utils/authResponse.js) (140 lines)
- [`src/utils/storage.js`](src/utils/storage.js) (44 lines)
- [`src/pages/Login.jsx`](src/pages/Login.jsx) (850+ lines)

**Flow:**
1. `Login.jsx` handles the multi-view form (login, register, forgot password, 2FA, force reset)
2. On login, calls `loginUser()` from [`auth.service.js`](src/services/auth.service.js)
3. If `requires_2fa` → stores credentials in `sessionStorage` → navigates to `/2fa`
4. Otherwise → [`getAuthUserAndToken()`](src/utils/authResponse.js:3) normalizes the response → dispatches `setCredentials()` → navigates to role dashboard
5. The normalizer converts `role_id` → `role_name` via [`ROLE_NAMES`](src/utils/constants.js:6) lookup, falling back to API's `role_name`

**The [`authResponse.js`](src/utils/authResponse.js) normalizer** is robust:
- Handles nested vs flat API responses (`apiBody.user` vs `apiBody.data.user`)
- `normalizeAuthUser` converts `organisation_id: null` → superadmin panel role
- `getDashboardRouteForUser` maps role_id to dashboard route
- `getProfileMenuPaths` provides profile/settings paths per role

**Concerns:**
- `Login.jsx` at 850+ lines directly imports and calls auth service functions, **bypassing the `useAuth` hook** that other components use. This creates two different auth patterns in the codebase.
- The `Login.jsx` component manages state for login, register, forgot password, 2FA, and force reset — it should be split into separate page components.
- Credentials stored in `sessionStorage` during 2FA flow are cleared on browser close but not on successful login.
- Impersonation session data in [`storage.js`](src/utils/storage.js:21) (superadmin "Login as" feature) is interesting but needs session timeout handling.

### 4.5 Component Architecture

**Key Components:**
- [`CandidateSidebar.jsx`](src/components/CandidateSidebar.jsx) (200 lines) — Dynamic sidebar with module-based visibility via `useModuleAccess()`
- [`CandidateApplicationForm.jsx`](src/components/CandidateApplicationForm/CandidateApplicationForm.jsx) (1979 lines) — Massive form component with custom field support
- [`CaseDetailTabBar.jsx`](src/components/caseDetail/CaseDetailTabBar.jsx) + 9 sub-components for case detail page
- [`business/BusinessSidebar.jsx`](src/components/business/BusinessSidebar.jsx)
- [`BulkImportModal.jsx`](src/components/BulkImportModal.jsx)
- [`Button.jsx`](src/components/Button.jsx) — Shared button component

**Observations:**
- `CandidateApplicationForm.jsx` at **1979 lines** is the largest frontend file. It handles the entire immigration application form across multiple sections with custom field rendering. This desperately needs to be broken into smaller section components.
- `AdminDashboard.jsx` at **766 lines** with direct HTML-to-image export, mock data fallback, notifications, messages, and task widgets — too many concerns in one component.
- The `CaseDetailTabBar` pattern with dedicated sub-components (Overview, Timeline, Tasks, Documents, Communication, Payments, Notes, AuditLog) is a good example of composition.

### 4.6 Key Pages & Features

**Admin Dashboard ([`AdminDashboard.jsx`](src/pages/admin/AdminDashboard.jsx), 766 lines):**
- Statistics cards (total admins, caseworkers, candidates, sponsors, cases, tasks, documents)
- Recent cases and activities tables
- Due/overdue tasks widget
- Recent messages and notifications
- Dashboard chart export to PNG (html-to-image)
- Mock data fallback when API is unavailable

**Candidate Application ([`CandidateApplicationForm.jsx`](src/components/CandidateApplicationForm/CandidateApplicationForm.jsx), 1979 lines):**
- Multi-step application form (personal details, passport, contact, employment, dependents, travel history, declarations)
- Custom field support via admin-configured field settings
- Draft auto-save and submission workflow
- Read-only view for submitted applications
- Integration with caseworker assignment

**Workflow System:**
- The backend workflow (1863-line controller) handles: draft review → visa portal submission → biometric availability → biometric booking → CCL fee proposal → CCL fee approval → CCL release
- Frontend [`workflowApi.js`](src/services/workflowApi.js) provides the API surface
- [`immigrationCaseProcess.js`](src/constants/immigrationCaseProcess.js) defines stage constants

### 4.7 Multi-Tenant Subdomain Handling

**File:** [`src/utils/organisationHost.js`](src/utils/organisationHost.js) (124 lines)

**Architecture:**
- Platform domain: `elitepic.co.uk` (configurable via `VITE_PLATFORM_DOMAIN`)
- CMS subdomain: `cms.elitepic.co.uk` (superadmin access)
- Tenant subdomains: `<slug>.elitepic.co.uk` (organisation-specific access)
- `getOrganisationSlugFromHost()` extracts the slug from the browser hostname
- `X-Organisation-Slug` header sent on every API request
- Cross-subdomain login handoff via `buildTenantHandoffUrl()` — base64-encoded session payload

**Strengths:**
- Clean subdomain-based tenant resolution
- Cross-subdomain handoff for superadmin impersonation
- Proper port handling for local development

---

## 5. Critical Findings & Risks

### 🔴 Critical

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| C1 | **Hardcoded JWT fallback secret** `"epic-secret-key"` | 4 files: [`auth.middleware.js:21`](Server/src/middlewares/auth.middleware.js:21), [`superadminOrganisation.controller.js:429`](Server/src/controllers/superadminOrganisation.controller.js:429), [`settings.service.js:28`](Server/src/services/settings.service.js:28), [`superadminOrganisation.controller.js:919`](Server/src/modules/Superadmin/superadminOrganisation.controller.js:919) | If `JWT_SECRET` env var is missing in production, all JWTs become forgeable |
| C2 | **No rate limiting on auth endpoints** | [`auth.routes.js`](Server/src/modules/Auth/auth.routes.js) — all 10 auth routes | Brute-force vulnerability for login, OTP, and password reset |
| C3 | **JWT in localStorage** | [`authSlice.js`](src/store/slices/authSlice.js:20-45), [`storage.js`](src/utils/storage.js) | XSS vulnerability — tokens accessible to any JavaScript running on the page |

### 🟡 High

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| H1 | **No Helmet.js security headers** | [`app.js`](Server/src/app.js) | Missing CSP, X-Frame-Options, X-Content-Type-Options |
| H2 | **No CSRF protection** | Entire backend | Cookie-based JWT auth needs CSRF tokens |
| H3 | **Workflow controller too large** | [`workflow.controller.js`](Server/src/modules/Shared/Workflow/workflow.controller.js) — 1863 lines | Maintainability risk, difficult to test |
| H4 | **Duplicate `extractCaseworkerIds` logic** | [`sponsorLicence.controller.js:10`](Server/src/modules/Sponsor/Licence/sponsorLicence.controller.js:10) and [`complianceAlerts.service.js:14`](Server/src/services/complianceAlerts.service.js:14) | DRY violation, bug-fix divergence risk |
| H5 | **Candidate form component too large** | [`CandidateApplicationForm.jsx`](src/components/CandidateApplicationForm/CandidateApplicationForm.jsx) — 1979 lines | Maintainability, rendering performance |
| H6 | **Login page too large** | [`Login.jsx`](src/pages/Login.jsx) — 850+ lines | Handles 5 views, should be split |
| H7 | **`console.log` in production** | 83 instances across backend controllers | Information leakage, performance impact |

### 🟡 Medium

| ID | Finding | Location | Impact |
|----|---------|----------|--------|
| M1 | **No API versioning** | All routes under `/api/` | Breaking changes will affect all clients simultaneously |
| M2 | **Inconsistent error handling** | Mixed `try/catch` vs `catchAsync` wrapper | Some errors may not be caught properly |
| M3 | **Inconsistent response formatting** | Controllers use both `ApiResponse` and raw `res.json()` | Frontend needs to handle multiple response shapes |
| M4 | **Dual auth state (Redux + Context)** | [`authSlice.js`](src/store/slices/authSlice.js) + [`AuthContext.jsx`](src/context/AuthContext.jsx) | Unnecessary complexity, potential state divergence |
| M5 | **Duplicate auth service files** | `auth.service.js`, `authService.js`, `auth2faService.js` | Confusion about which to use |
| M6 | **`setInterval`-based subscription checks** | [`server.js`](Server/src/server.js) (6hr/24hr intervals) | Fragile scheduling — resets on restart, no error recovery |
| M7 | **No request correlation IDs** | All middleware | Difficult to trace requests in logs |
| M8 | **Permission cache delay** | [`tenantDb.middleware.js`](Server/src/middlewares/tenantDb.middleware.js) — 2 min cache | Permission changes take 2 minutes to take effect |
| M9 | **No database connection pooling for tenants** | [`tenantDb.service.js`](Server/src/services/tenantDb.service.js) | Could exhaust connections with many tenants |

### 🟢 Low

| ID | Finding | Location |
|----|---------|----------|
| L1 | Column naming inconsistency (`created_at` vs `createdAt`) | Various models |
| L2 | Missing TypeScript/PropTypes | Entire frontend |
| L3 | No PWA/offline support | Frontend |
| L4 | No automated tests visible | Both codebases |
| L5 | Some grey-import patterns (`../Login` in [`LoginPage.jsx`](src/pages/auth/LoginPage.jsx:1)) | Auth pages |

---

## 6. Recommendations

### Immediate (Week 1-2)

1. **🔴 Fix JWT secret fallback**: Remove `|| "epic-secret-key"` from all 4 locations. Make `JWT_SECRET` required at startup with a validation check in [`server.js`](Server/src/server.js).
2. **🔴 Add rate limiting**: Use `express-rate-limit` on all auth routes. Recommended: 5 attempts/minute for login, 3 OTP requests/hour per email.
3. **🔴 Move JWT to httpOnly cookies**: Stop storing tokens in `localStorage`. Use the backend's existing cookie support with `httpOnly`, `secure`, `sameSite: 'strict'` flags.
4. **🟡 Remove debug `console.log`**: Clean up all 83 instances from production controllers. Use a proper logger (winston, pino) with log levels.

### Short-term (Week 3-4)

5. **🟡 Add Helmet.js**: Install and configure `helmet` middleware with appropriate CSP, HSTS, and framing policies.
6. **🟡 Implement CSRF protection**: Add `csurf` or double-submit cookie pattern for cookie-based auth.
7. **🟡 Split large files**:
   - `workflow.controller.js` → separate controllers per workflow stage
   - `CandidateApplicationForm.jsx` → section components
   - `Login.jsx` → separate pages per view
8. **🟡 Standardize error handling**: Choose `catchAsync` + `ApiResponse` pattern for all new/modified controllers.
9. **🟡 Consolidate auth services**: Merge `auth.service.js`, `authService.js`, `auth2faService.js` into one file.

### Medium-term (Month 1-2)

10. **Add API versioning**: Prefix all routes with `/api/v1/` to allow future breaking changes.
11. **Remove AuthContext wrapper**: Components should use Redux directly or a single `useAuth` hook.
12. **Extract `extractCaseworkerIds`**: Move to a shared utility, remove duplicates.
13. **Implement proper job queue**: Replace `setInterval` with Bull/BullMQ for subscription expiry and compliance alerts.
14. **Add correlation IDs**: UUID per request via middleware, logged with every message.
15. **Add TypeScript**: Start with service layer and API contracts, progressively type the codebase.

### Long-term (Month 2-3)

16. **Comprehensive test suite**: Unit tests for services, integration tests for API endpoints, E2E tests for critical user flows.
17. **API documentation**: OpenAPI/Swagger specification from route definitions.
18. **Performance optimization**: Database query analysis, React component memoization, bundle size optimization.
19. **CI/CD pipeline**: Automated testing, linting, and deployment.
20. **Monitoring & alerting**: Application performance monitoring (APM), error tracking (Sentry), uptime monitoring.

---

## 7. Feature Completeness Assessment

| Feature Area | Status | Notes |
|-------------|--------|-------|
| **Auth & Registration** | ✅ Complete | OTP, 2FA, password reset, multi-role registration |
| **Admin Dashboard** | ✅ Complete | Stats, charts, recent activity, export |
| **Case Management** | ✅ Complete | Full CRUD, status tracking, pipeline |
| **Case Workflow** | ✅ Complete | Draft review → visa → biometrics → CCL |
| **Candidate Application** | ✅ Complete | Multi-step form with custom fields |
| **Document Management** | ✅ Complete | Upload, checklist, third-party docs |
| **Real-time Messaging** | ✅ Complete | Socket.IO with room-based delivery |
| **Notifications** | ✅ Complete | In-app + email, workflow-triggered |
| **Sponsor Licence** | ✅ Complete | Application, CoS, compliance docs |
| **CoS Management** | ✅ Complete | Allocation, registration forms |
| **Payment Processing** | ⚠️ Mostly Complete | Stripe integration works; some webhook events TODO |
| **Reporting** | ⚠️ Partial | Basic reports; Excel export available |
| **Calendar/Appointments** | ✅ Complete | Calendar, reschedule, Teams integration |
| **Subscription Billing** | ✅ Complete | Plans, subscriptions, invoicing |
| **Platform Admin** | ✅ Complete | Organisation CRUD, plan management |
| **RBAC/Permissions** | ✅ Complete | Granular permission system |
| **Compliance Alerts** | ✅ Complete | Visa expiry, worker events, RTW checks |
| **Audit Logging** | ✅ Complete | Platform + tenant audit trails |
| **Bulk Import/Export** | ✅ Complete | Excel import/export for candidates |
| **Multi-Tenant Isolation** | ✅ Complete | Per-org PostgreSQL databases |
| **Staff Portal** | ❌ Placeholder | Route exists, "Coming Soon" |
| **Agent Portal** | ❌ Placeholder | Route exists, "Coming Soon" |
| **Automated Testing** | ❌ Missing | No test files found |

---

## 8. Appendix: File Inventory

### Backend Key Files (Server/src/)

```
Server/src/
├── app.js                          # Express app setup (CORS, middleware, error handling)
├── server.js                       # Bootstrap: DB provisioning, migrations, seeding, socket.io
├── config/
│   ├── config.js                   # Sequelize config with SSL auto-detection
│   ├── frontendOrigins.js          # Dynamic CORS for multi-tenant subdomains
│   └── mail.js                     # Mail transport configuration
├── middlewares/
│   ├── auth.middleware.js          # JWT verification, user status, org data
│   ├── authStack.middleware.js     # Compose verifyToken + attachTenantDb
│   ├── role.middleware.js          # checkRole, checkPermission, checkAnyPermission
│   ├── tenantDb.middleware.js      # Tenant DB attachment, permission loading
│   ├── organisationContext.middleware.js  # Multi-tenant org resolution
│   ├── upload.middleware.js        # Multer file upload config
│   ├── isSuperAdmin.js             # Superadmin-only gate
│   ├── isPlatformStaff.js          # Platform staff gate
│   └── requireCandidate.middleware.js  # Candidate role gate
├── models/
│   ├── index.js                    # Platform DB models + associations
│   ├── tenantModels.js             # Tenant DB model aggregation
│   ├── platform/                   # 12 platform-level models
│   └── tenant/                     # 46 tenant-level models
├── modules/
│   ├── Auth/                       # Registration, login, OTP, 2FA, user profile
│   ├── Admin/                      # Dashboard, candidates, caseworkers, finance, settings, reporting, RBAC
│   ├── Caseworker/                 # Cases, performance, documents, sponsors, licence reviews
│   ├── Candidate/                  # Application, account, payments (Stripe), documents
│   ├── Sponsor/                    # Licence, CoS, workers, compliance, RTW, dashboard
│   ├── Shared/                     # Cases, tasks, documents, messages, notifications, appointments, workflow
│   └── Superadmin/                 # Organisations, plans, billing, announcements, settings
├── routes/
│   └── index.js                    # Central route aggregation
├── services/                       # 30+ service files
├── realtime/
│   ├── socketServer.js             # Socket.IO initialization + auth
│   ├── messagingRealtime.js        # Room management + event emitters
│   └── ioRegistry.js              # IO instance registry
├── utils/                          # 17 utility files
├── seeders/                        # 10 seeder files
├── migrations/                     # 33 SQL migration files
├── constants/                      # Case process stages, platform modules
└── jobs/                           # Background job definitions
```

### Frontend Key Files (src/)

```
src/
├── App.jsx                         # Root component with providers
├── main.jsx                        # React entry point
├── store/
│   ├── index.js                    # Redux store config
│   └── slices/                     # authSlice, notificationSlice, platformBrandingSlice
├── routes/
│   ├── AppRouter.jsx               # All route definitions (372 lines)
│   └── ProtectedRoute.jsx          # Auth + role gate
├── context/
│   ├── AuthContext.jsx             # Auth context provider
│   └── ToastContext.jsx            # Toast notification context
├── hooks/                          # 20 custom hooks
│   ├── useAuth.js                  # Auth operations (login, register, logout)
│   ├── useCandidate.js             # Candidate data hook
│   ├── useCaseDetail.js            # Case detail hook
│   ├── useModuleAccess.js          # Module-based feature gating
│   ├── useNotifications.js         # Notification hook
│   ├── useMessaging.js             # Real-time messaging hook
│   ├── useIdleTimer.js             # Session timeout hook
│   └── ... (14 more)
├── services/                       # 40+ API service files
│   ├── api.js                      # Central Axios instance + interceptors
│   ├── auth.service.js             # Auth API calls
│   ├── candidateApi.js             # Candidate CRUD APIs
│   └── ... (37 more)
├── pages/
│   ├── Login.jsx                   # Login page (850+ lines, 5 views)
│   ├── dashboard/DashboardPage.jsx # Role-based redirect
│   ├── auth/                       # 8 auth pages
│   ├── admin/                      # 22 admin pages
│   ├── candidate/                  # 17 candidate pages
│   ├── caseworker/                 # 14 caseworker pages
│   ├── business/                   # 27 business pages
│   └── superadmin/                 # 12 superadmin pages
├── components/
│   ├── CandidateSidebar.jsx        # Dynamic navigation sidebar
│   ├── CandidateApplicationForm/   # 1979-line application form
│   ├── caseDetail/                 # 10 case detail sub-components
│   └── business/                   # Business-specific components
├── utils/
│   ├── authResponse.js             # Auth response normalization
│   ├── constants.js                # Roles, routes, validation rules
│   ├── storage.js                  # localStorage/sessionStorage helpers
│   ├── organisationHost.js         # Subdomain + tenant resolution
│   └── ... (10 more)
├── constants/
│   ├── immigrationCaseProcess.js   # Workflow stage definitions
│   └── platformModules.js          # Module definitions
├── data/                           # Mock data files
└── docs/
    └── NotificationSystem.md       # Notification system documentation
```

---

*End of Deep Code Review. Total files analyzed: ~120 backend files, ~100 frontend files.*