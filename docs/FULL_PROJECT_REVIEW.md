# EPiC Platform — Full Project Review

**Date:** 2026-06-15  
**Scope:** EPiC Frontend (React/Vite) + EPiC API Server (Node.js/Express) + Environment & Deployment  
**Reviewed by:** Claude Code automated review  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Frontend Review](#2-frontend-review)
3. [Backend Review](#3-backend-review)
4. [Environment & Deployment Review](#4-environment--deployment-review)
5. [Priority Action Plan](#5-priority-action-plan)
6. [Scores](#6-scores)

---

## 1. Executive Summary

A comprehensive review of both the EPiC Frontend and Server was performed across architecture, security, performance, error handling, environment config, and deployment readiness.

### Overall Health Snapshot

| Area | Frontend | Backend | Rating |
|------|----------|---------|--------|
| Architecture | Solid but large components | Good modules, large controllers | ⚠️ Needs work |
| Security | CSRF/session good, XSS risk | Auth/RBAC solid, SQL injection risk | ❌ Critical gaps |
| Performance | Lazy routes, no memoization | N+1 queries, no caching layer | ⚠️ Needs work |
| Error Handling | Inconsistent, some silent swallows | Missing global rejection handler | ⚠️ Needs work |
| Environment/Config | No .env.example, some hardcoding | Secrets in .env, no vault | ❌ Critical gaps |
| Deployment | No Docker, partial CI/CD | PM2 but no graceful shutdown | ⚠️ Not production-ready |
| Scalability | Fine for MVP | Local file storage, in-memory cache | ❌ Blocks scaling |
| Code Consistency | Mixed import styles | Mixed logging patterns | ⚠️ Needs work |

### Critical Issues (Fix Before Shipping)

| # | Issue | Where |
|---|-------|--------|
| 1 | Live API secrets (Stripe, OAuth, JWT) visible in `.env` file | `Server/.env` |
| 2 | SQL injection in 4+ controllers via `sequelize.literal()` | Multiple controllers |
| 3 | Caseworker search bypasses ALL authorization (any CW sees all cases) | `caseworkerCase.controller.js` |
| 4 | No `process.on('unhandledRejection')` handler — unhandled async errors silently crash | `server.js` |
| 5 | Plaintext password stored in `sessionStorage` during 2FA | `useAuth.js` |
| 6 | `ProtectedRoute` role check can be bypassed via URL path matching | `ProtectedRoute.jsx` |
| 7 | Payment webhook + verify endpoint race condition → double-charging risk | `stripepayment.controller.js` |
| 8 | Local disk file storage — data lost on server restart, can't scale horizontally | `storage/`, `uploads/` |

---

## 2. Frontend Review

### 2.1 Architecture

**Folder Structure — GOOD**  
Clear separation: `routes/`, `store/`, `services/`, `pages/`, `components/`, `hooks/`, `context/`, `layouts/`, `utils/`. The convention is consistent and easy to navigate.

**Large Page Components — HIGH**  
Several admin and caseworker pages exceed 500–1,000+ lines of JSX. All state, fetch logic, event handlers, and rendering are colocated in a single file.

- Recommendation: Extract fetch logic into custom hooks (`useDashboardData`, `useCasesData`). Split tabs and modals into separate component files. Target < 300 lines per file.

**Mixed Import Paths — MEDIUM**  
No path aliases configured — imports use deep relative paths (`../../utils/performLogout`). There is also a typo: `BussinessProfile` in `src/routes/AppRouter.jsx` line 90.

- Recommendation: Add aliases in `vite.config.js`:
  ```js
  alias: { '@components': './src/components', '@services': './src/services', '@utils': './src/utils' }
  ```

**60+ Service Files — MEDIUM**  
Services vary between named and default exports, inconsistent error handling, and some are thin re-export wrappers over other service files.

- Recommendation: Consolidate to fewer, larger domain service modules. Standardise on named exports and always `throw` on error so callers can `catch`.

---

### 2.2 Routing

**Lazy Loading — GOOD**  
All 122 routes use `React.lazy()` with a `Suspense` fallback. This is correctly implemented.

**ProtectedRoute Logic — CRITICAL (BUG-048)**  
The path-comparison bypass allows wrong-role users through when the URL already matches. See bug sheet BUG-048.

**Staff & Agent Portals — MEDIUM**  
Routes exist at `/staff` and `/agent` but render a "Portal coming soon" placeholder. These are accessible to any user who discovers the URL.

- Recommendation: Remove the routes entirely, or wrap in a feature-flag gate and require explicit role assignment.

**No 404 / Error Boundary — MEDIUM**  
No global `<ErrorBoundary>` component wrapping the router. Rendering errors in any subtree will crash the entire app.

- Recommendation:
  ```jsx
  <ErrorBoundary fallback={<ErrorPage />}>
    <AppRouter />
  </ErrorBoundary>
  ```

---

### 2.3 State Management

**Redux Usage — GOOD**  
Redux stores only global cross-cutting state: `auth`, `notifications`, `platformBranding`, `orgSettings`. Page-level state correctly uses `useState`. This is the right pattern.

**Auth Token Clarity — MEDIUM**  
`state.token = "httpOnly"` (a string) is set to signal HttpOnly cookie mode. This is confusing for any reader.

- Recommendation: Replace with `state.isAuthenticated = true` and a separate `state.sessionSecured = true` boolean.

**Missing Global Error State — MEDIUM**  
No centralised error slice. API failures are handled locally per component with no replay or recovery path for critical errors (e.g., subscription expired, 503 downstream).

- Recommendation: Add an `errorSlice` for platform-level errors. Show a full-screen banner for catastrophic failures rather than silent per-component toasts.

**No Request Deduplication — MEDIUM**  
Concurrent identical API calls (e.g., two components both mounting and calling `getNotifications()`) fire two requests. No dedup layer.

- Recommendation: Use React Query or SWR, which provide deduplication, caching, stale-while-revalidate, and background refetch out of the box.

---

### 2.4 API Layer

**Axios Config — GOOD**  
CSRF double-submit pattern, auto-retry on token expiry, 401 refresh queue — all correctly implemented.

**Timeout Too Short for Uploads — MEDIUM**  
Global axios timeout is 10 seconds. File upload endpoints can legitimately take longer.

- Recommendation: Set per-request timeout override for file uploads: `api.post(url, data, { timeout: 120_000 })`.

**Error Handling Inconsistency — MEDIUM**  
`extractError()` in `auth.service.js` unconditionally throws. Other services return the raw response. No consistent contract across 60+ service files.

- Recommendation: Define one contract: all services throw on error, callers always `try/catch`. Create a `createService()` factory to enforce it.

---

### 2.5 Performance

**Memoization Absent — HIGH**  
Very few uses of `React.memo`, `useMemo`, or `useCallback` across 250+ components. Tables, lists, and dashboards re-render on every parent state change.

- Recommendation: Wrap list-rendering components in `React.memo`. Use `useMemo` for filtered/sorted arrays. Use `useCallback` for all event handlers passed as props.

**Tab Content Not Lazy-Loaded — MEDIUM**  
Routes are lazy-loaded, but within pages, all tab panels import their content upfront. A page with 6 tabs loads all 6 panels on first render.

- Recommendation:
  ```jsx
  const VisaTab = lazy(() => import('./tabs/VisaTab'));
  ```

**Image Optimisation — MEDIUM**  
Profile pictures and org logos served without `loading="lazy"` or WebP format.

- Recommendation: Add `loading="lazy"` to all `<img>` tags. Serve WebP via `<picture>` with JPEG fallback.

**Bundle Size — MEDIUM**  
Run `npx vite-bundle-visualizer` to check. Suspected > 2 MB uncompressed initial JS. Target < 1.5 MB uncompressed / < 500 KB gzipped.

---

### 2.6 Accessibility

**ARIA Coverage — PARTIAL**  
42 files include ARIA attributes. `ToastContext` uses `aria-live="polite"`, modals have role/aria-modal. However, icon-only buttons, sidebar toggles, and many form inputs lack `aria-label`.

- Recommendation: Add `aria-label` to every icon button. Run `axe-core` or Lighthouse in CI to catch regressions.

**Keyboard Navigation — MEDIUM**  
No visible `:focus-visible` styles. Tab order is not explicitly managed. Modal focus trapping is inconsistent.

- Recommendation: Add a global `:focus-visible` ring in `index.css`. Implement focus trap in all modals.

**Colour Contrast — UNKNOWN**  
Custom Tailwind colours used throughout. No contrast ratio audit found in codebase.

- Recommendation: Run WAVE or Lighthouse accessibility audit targeting WCAG 2.1 AA.

---

### 2.7 Dependencies

| Package | Status | Note |
|---------|--------|------|
| React 19.2.4 | ✅ Current | |
| React Router 7.14.0 | ✅ Current | |
| Redux Toolkit 2.11.2 | ✅ Current | |
| Vite | ✅ Current | |
| `sweetalert2` | ⚠️ Heavy | Consider native dialogs or lighter alternative |
| `libphonenumber-js` | ⚠️ Large | Lazy-load on pages that need phone validation |
| No testing framework | ❌ Missing | Add `vitest` + `@testing-library/react` |
| No TypeScript | ⚠️ Missing | Add incrementally or use Zod for runtime validation |
| No form validation library | ⚠️ Missing | Add `zod` or `yup`; replace regex patterns in `constants.js` |

---

### 2.8 Missing / Incomplete Features

| Item | Severity | Location |
|------|----------|----------|
| Staff portal — "coming soon" placeholder | MEDIUM | `AppRouter.jsx` line 396 |
| Agent portal — "coming soon" placeholder | MEDIUM | `AppRouter.jsx` line 408 |
| 2FA attempt counter / lockout UX | MEDIUM | `TwoFactorPage.jsx` |
| No error boundary component | MEDIUM | Entire app |
| No loading skeleton components | LOW | All data tables |
| No empty-state illustrations | LOW | Lists/tables when data is empty |

---

## 3. Backend Review

### 3.1 Architecture

**Module Structure — GOOD**  
Clear domain modules: `Admin`, `Auth`, `Candidate`, `Caseworker`, `Shared`, `Sponsor`, `Superadmin`. Each module owns its routes, controller, and validation. No circular dependencies detected.

**Oversized Controllers — MEDIUM**  

| Controller | Lines | Action |
|---|---|---|
| `workflow.controller.js` | ~1,995 | Split into create/update/status sub-controllers |
| `candidateApplication.controller.js` | ~1,696 | Split into submit/review/documents sub-controllers |
| `dashboard.controller.js` | ~1,100 | Extract stats, cases, and notifications into separate handlers |

**God Services — MEDIUM**  
`workflowEngine.service.js` and `caseWorkflowProcess.service.js` handle stage transitions, task creation, notification dispatch, and document validation in a single module.

- Recommendation: Split into `workflowStageTransition.service.js`, `workflowNotification.service.js`, `workflowValidation.service.js`.

---

### 3.2 API Design

**Response Envelope — GOOD**  
`apiResponse.js` provides consistent `{ status, message, data }` envelope. Global error handler masks stack traces in production.

**No API Versioning — MEDIUM**  
All routes are unversioned (`/api/admin/...`). A breaking API change requires coordinated frontend deploy.

- Recommendation: Introduce `/api/v1/` prefix and keep `/api/` as an alias during transition.

**No OpenAPI/Swagger — MEDIUM**  
No machine-readable API spec. Frontend has no type-safe client contract.

- Recommendation: Add `swagger-jsdoc` + `swagger-ui-express`. Publish docs at `/api/docs`. Use spec for frontend SDK generation.

**Inconsistent Error Shapes — LOW** (see BUG-041)  
Some controllers return `{ status, message }`, others `{ status, code, message, error }`. Standardise with a shared `sendError()` helper.

---

### 3.3 Database

**Indexes — MEDIUM**  
No explicit index definitions found in Sequelize model files for commonly filtered columns (`status`, `organisation_id`, `created_at`, `assignedcaseworkerId`).

- Recommendation: Add to migrations:
  ```sql
  CREATE INDEX idx_cases_status ON cases(status);
  CREATE INDEX idx_cases_org ON cases(organisation_id);
  CREATE INDEX idx_cases_created ON cases(created_at);
  ```

**N+1 Query Patterns — MEDIUM**  
`getActiveAdminIds()` in `stripepayment.controller.js` and several dashboard aggregates query in loops rather than using `Op.in` bulk fetches or `include` associations.

**Transaction Boundaries — MEDIUM**  
Multi-step writes (licence activation, worker creation + case assignment, application submission + case creation) are not wrapped in Sequelize transactions. Partial failures leave inconsistent state. See BUG-018, BUG-109.

**Foreign Key ON DELETE — LOW** (BUG-043)  
FK constraints do not explicitly specify `ON DELETE` behaviour in original migrations. A remediation migration was added, but verify it has run on all environments.

---

### 3.4 Security

**Authentication — GOOD**  
JWT in HttpOnly cookies, CSRF double-submit, proper role middleware (`checkRole`, `checkPermission`) applied at module level. Public routes correctly bypass auth.

**SQL Injection — CRITICAL** (BUG-001)  
`sequelize.literal()` template string interpolation of `userId` in 4+ controllers. Fix with `Op.contains`.

**Caseworker Auth Bypass — CRITICAL** (BUG-078)  
Search replaces the authorization `WHERE` clause. Any caseworker can see all cases. Fix with `Op.and` merge.

**Rate Limiting — MEDIUM**  
Auth rate limiter uses in-memory store. Under PM2 cluster or horizontal scaling, limits are per-process, not global.

- Recommendation: Switch to Redis store for rate limiting in production (`rate-limit-redis`).

**Permission Cache TTL — MEDIUM**  
User permissions cached for 2 minutes in `tenantDb.middleware.js`. Revoked permissions remain active for up to 2 minutes.

- Recommendation: Reduce to 30 seconds. Add cache invalidation on permission change.

**File Upload — GOOD**  
Extension allowlist, double-extension detection, magic byte verification, file size limits, and `sharp` sanitisation all implemented. MIME-type-only path is the exception (BUG-014).

**Helmet & CSP — GOOD**  
Comprehensive Helmet config. CSP is strict in production, relaxed in dev. CORS validates against tenant subdomain allowlist.

---

### 3.5 Error Handling

**No Global Rejection Handler — CRITICAL**  
No `process.on('unhandledRejection')` or `process.on('uncaughtException')` in `server.js`. Async errors that escape try/catch will crash the process silently.

- Recommendation — add to `server.js`:
  ```js
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled Promise Rejection');
    process.exit(1);
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception');
    process.exit(1);
  });
  ```

**No Graceful Shutdown — HIGH**  
PM2 `autorestart: true` kills and re-spawns the process. No `SIGTERM` handler drains in-flight requests or closes DB connections cleanly.

- Recommendation:
  ```js
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  });
  ```

**Silent Catch Blocks — HIGH** (BUG-005)  
`.catch(() => {})` in calendar sync, profile updates, and payment notification paths.

---

### 3.6 Logging & Monitoring

**Structured Logging — GOOD**  
Pino with AsyncLocalStorage request IDs, automatic error serialization, pretty-print in dev, JSON in prod. This is production-grade.

**Sensitive Data in Logs — MEDIUM**  
Email addresses logged in some places. Full request bodies logged without size limit.

- Recommendation: Add email masking to logger redact paths. Cap request body logging at 2 KB.

**No Metrics/APM — MEDIUM**  
No Prometheus metrics, no APM instrumentation (DataDog, NewRelic, OpenTelemetry).

- Recommendation: Add `prom-client` to expose `/metrics`. Track: `http_requests_total`, `http_request_duration_ms`, `db_pool_available`, `job_duration_ms`.

---

### 3.7 Scalability

**Stateless Auth — GOOD**  
JWT-based auth is stateless and scales horizontally without sticky sessions.

**In-Memory Caches — HIGH**  
Org status cache and permission cache are per-process. Tenant DB LRU cache is per-process. Horizontal scaling (PM2 cluster, multiple servers) will produce inconsistent cache state.

- Recommendation: Replace in-memory caches with Redis for all shared state.

**Local File Storage — CRITICAL**  
Files stored at `storage/private/` and `uploads/` on the local filesystem. Problems:
- Data is lost if the server is replaced or the disk fails
- Cannot scale to multiple server instances (each has its own copy)
- No backup or replication

- Recommendation: Migrate to AWS S3 / Google Cloud Storage / Azure Blob. Use signed URLs for secure downloads. This is a pre-production blocker.

**Database Pool — MEDIUM**  
`pool.min: 0` means the first request after idle must wait to establish a connection.

- Recommendation: Set `pool.min: 2` to maintain warm connections.

**JWT Token Revocation — MEDIUM**  
No server-side token blacklist. Logged-out users retain a valid token until expiry.

- Recommendation: Keep a Redis set of revoked JTIs with TTL matching token expiry.

---

### 3.8 Missing / Incomplete

| Item | Severity | Location |
|------|----------|----------|
| Microsoft OAuth token storage TODO | MEDIUM | `microsoft.controller.js` lines 28, 81 |
| No OpenAPI/Swagger spec | MEDIUM | All routes |
| No `/health` endpoint (BUG-045) | LOW | `server.js` |
| Rate limiting missing on export/PDF endpoints | MEDIUM | Admin export routes |
| Audit trail not covering password changes | MEDIUM | `superadminProfile.controller.js` |
| No virus scanning on uploaded files | MEDIUM | `fileSecurity.config.js` |
| No automated test suite (0 test files found) | HIGH | `tests/` |

---

## 4. Environment & Deployment Review

### 4.1 Secrets — CRITICAL

The `Server/.env` file contains the following **live credentials that must be rotated immediately**:

| Secret | Variable | Risk |
|--------|----------|------|
| Stripe test secret key | `STRIPE_SECRET_KEY` | Payment API access |
| Stripe publishable key | `STRIPE_PUBLISHABLE_KEY` | Client-side payment forms |
| Google OAuth client secret | `CLIENT_SECRET` | OAuth impersonation |
| Microsoft OAuth client secret | `MICROSOFT_CLIENT_SECRET` | OAuth impersonation |
| Email password | `EMAIL_PASS` | Email account access |
| JWT signing secret | `JWT_SECRET` | Token forgery |
| CSRF secret | `CSRF_SECRET` | CSRF protection bypass |
| Settings encryption key | `SETTINGS_ENCRYPTION_KEY` | Decrypt stored settings |
| Tenant DB creator password | `TENANT_DB_CREATOR_PASSWORD` (`epic123`) | Database access |

> The `.env` file is in `.gitignore` — verify with `git check-ignore .env` before assuming it was never committed. If it was ever committed, all of the above must be treated as compromised.

**Recommended approach:**
1. Rotate all of the above credentials immediately
2. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production
3. Pre-commit hook: `git secrets` or `detect-secrets` to block future credential commits

---

### 4.2 Missing .env Documentation

**Frontend** — No `.env.example` file exists. Variables in use:

```
VITE_API_BASE_URL=          # Required: backend URL
VITE_PLATFORM_DOMAIN=       # Required: apex domain (e.g. elitepic.co.uk)
VITE_SESSION_IDLE_TIMEOUT=  # Optional: ms before idle warning (default 1800000)
VITE_FIRM_NAME=             # Optional: firm display name
VITE_FRONTEND_PORT=         # Optional: dev server port (default 5173)
```

**Backend** — `.env.example` exists but missing:
```
GOOGLE_CLIENT_ID=           # Google OAuth (missing from example)
GOOGLE_CLIENT_SECRET=       # Google OAuth (missing from example)
GOOGLE_REDIRECT_URI=        # Google OAuth (missing from example)
SMTP_HOST=                  # Alternative email config (missing)
SMTP_PORT=                  # Alternative email config (missing)
SMTP_SECURE=                # Alternative email config (missing)
EMAIL_HOST=                 # Nodemailer host (missing from example)
EMAIL_PORT=                 # Nodemailer port (missing from example)
```

---

### 4.3 CORS Configuration — GOOD

Dynamic origin validation supports:
- Explicit `FRONTEND_URL` allowlist
- `CORS_ORIGINS` comma-separated additional origins
- Tenant subdomains (`*.${PLATFORM_DOMAIN}`)
- Correct `credentials: true` for cookie-based auth

Socket.IO uses the same `corsOriginDelegate`. No issues found.

---

### 4.4 Deployment Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| No Docker / containerisation | HIGH | Inconsistent environments between dev and prod |
| No systemd service | MEDIUM | Server does not auto-start after OS reboot |
| No nginx config | HIGH | No reverse proxy, no SSL termination, no HTTP→HTTPS redirect |
| No SSL certificate automation | HIGH | No Let's Encrypt / Certbot config |
| No zero-downtime deploy | MEDIUM | PM2 kill+restart causes brief downtime |
| Manual `npm run migrate` in deploy script | MEDIUM | Migration can be skipped; should be automated gate |
| No monitoring / alerting | HIGH | No uptime checks, no error alerts |
| No log aggregation | MEDIUM | PM2 logs to local files only; lost on restart |
| No database backup automation | HIGH | No cron backup; data loss risk |

---

### 4.5 File Storage

Files are stored on local disk at:
- `Server/storage/private/organisations/`
- `Server/storage/private/platform/`
- `Server/uploads/organisations/`
- `Server/uploads/platform/`

**This is a production blocker.** These directories are not backed up, not replicated, and do not survive a server replacement. Uploaded documents (sponsor licence files, candidate passports, compliance evidence) will be permanently lost if the server disk fails.

**Migration path to S3:**
1. Add `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`
2. Replace multer disk storage with multer-s3
3. Store S3 key in DB instead of local path
4. Replace download controller with pre-signed URL generation
5. Run one-time migration script to move existing files to S3

---

### 4.6 PM2 Configuration

Current `ecosystem.config.js`:

```js
instances: 1,           // Single process — no clustering
autorestart: true,      // ✅ Will restart on crash
max_memory_restart: '1G', // ✅ Memory limit
watch: false,           // ✅ Correct for prod
```

**Missing:**
- `SIGTERM` graceful shutdown handler in `server.js`
- `listen_timeout` and `kill_timeout` PM2 settings
- Cluster mode disabled (`instances: 1`) — fine for now but blocks horizontal scaling

---

### 4.7 Database

**Connection Pooling:**
```js
pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
```
- `min: 0` causes cold-start on first request after idle. Set to `min: 2`.

**SSL:**  
Auto-detected for Render/Supabase/Neon/AWS RDS hosts. Explicit override via `DB_SSL`. ✅

**Migration Strategy:**  
Migrations run via `node src/migrations/run.js all`. Called manually in `deploy.sh`. Risk: deploy script can be run without migrations.

- Recommendation: Make migrations a blocking pre-step in CI/CD. Gate the server start on migration success.

---

## 5. Priority Action Plan

### P0 — Do Before Next Deploy (Blockers)

| # | Action | Owner |
|---|--------|-------|
| 1 | **Rotate all secrets** in `.env` (Stripe, OAuth, JWT, CSRF, email) | DevOps |
| 2 | **Fix SQL injection** in `sequelize.literal()` across 4+ controllers | Backend |
| 3 | **Fix caseworker search authorization bypass** (`caseworkerCase.controller.js:77`) | Backend |
| 4 | **Add `process.on('unhandledRejection')` handler** to `server.js` | Backend |
| 5 | **Fix `ProtectedRoute` role bypass** (`ProtectedRoute.jsx:21`) | Frontend |
| 6 | **Remove plaintext password from `sessionStorage`** (`useAuth.js:20`) | Frontend |
| 7 | **Fix payment race condition** — add DB unique constraint on `transactionId` | Backend |
| 8 | **Plan S3 migration** for file storage before production launch | DevOps |

### P1 — This Sprint (High Priority)

| # | Action | Owner |
|---|--------|-------|
| 9 | Add `SIGTERM` graceful shutdown handler to `server.js` | Backend |
| 10 | Add `process.on('uncaughtException')` handler | Backend |
| 11 | Fix silent `.catch(() => {})` in calendar sync, payments, profile updates | Backend |
| 12 | Create frontend `.env.example` with all `VITE_` variables documented | Frontend |
| 13 | Fix XSS in `EmailTemplatePreview.jsx` — add DOMPurify | Frontend |
| 14 | Add `<ErrorBoundary>` wrapper around the React app | Frontend |
| 15 | Fix org suspension not force-logging out active sessions | Backend |
| 16 | Fix impersonation "back to platform" broken (`storage.js:44`) | Frontend |
| 17 | Add database unique constraint on `licence_applications.transactionId` | Backend |
| 18 | Wrap licence activation and worker creation in Sequelize transactions | Backend |

### P2 — Next Sprint (Medium Priority)

| # | Action |
|---|--------|
| 19 | Migrate file storage to AWS S3 / GCS |
| 20 | Switch rate limiting store from in-memory to Redis |
| 21 | Switch permission/org caches from in-memory to Redis |
| 22 | Add database indexes on `status`, `organisation_id`, `created_at` |
| 23 | Fix N+1 queries in dashboard and notification delivery |
| 24 | Add `pool.min: 2` to Sequelize connection pool config |
| 25 | Add path aliases (`@components`, `@services`, `@utils`) to Vite config |
| 26 | Add React Query or SWR for data fetching / cache / deduplication |
| 27 | Wrap all data tables and heavy components in `React.memo` |
| 28 | Add `useCallback` to all event handlers passed as props |
| 29 | Lazy-load tab content components within pages |
| 30 | Add `aria-label` to all icon-only buttons |
| 31 | Add global `:focus-visible` ring styles |
| 32 | Add Prometheus `/metrics` endpoint (`prom-client`) |
| 33 | Implement JWT revocation blacklist in Redis |
| 34 | Add API versioning prefix `/api/v1/` |
| 35 | Generate OpenAPI/Swagger spec from routes |

### P3 — Backlog (Low Priority / Improvements)

| # | Action |
|---|--------|
| 36 | Add `vitest` + `@testing-library/react` testing framework |
| 37 | Add Zod validation to replace regex patterns in `constants.js` |
| 38 | Migrate incrementally to TypeScript |
| 39 | Split `workflow.controller.js` (1,995 lines) into sub-controllers |
| 40 | Split `candidateApplication.controller.js` (1,696 lines) |
| 41 | Dockerise both frontend and backend |
| 42 | Add systemd service files for auto-restart on OS reboot |
| 43 | Add nginx config (reverse proxy, SSL termination, gzip) |
| 44 | Automate SSL certificate renewal (Let's Encrypt / Certbot) |
| 45 | Add log aggregation (CloudWatch / ELK / Logtail) |
| 46 | Add database backup automation (pg_dump cron job) |
| 47 | Add virus scanning for file uploads (ClamAV or VirusTotal API) |
| 48 | Add bundle analyser to CI and alert on bundle size regression |
| 49 | Fix `BussinessProfile` typo in `AppRouter.jsx:90` |
| 50 | Implement/remove Staff and Agent portal placeholders |

---

## 6. Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Code Quality** | 6.5 / 10 | Good structure and patterns; oversized files; no tests |
| **Security** | 5 / 10 | Critical SQL injection + auth bypass issues; good CSRF/Helmet |
| **Performance** | 5.5 / 10 | Lazy routes good; no memoization; N+1 queries; no caching |
| **Error Handling** | 5 / 10 | No global handler; silent catches; inconsistent across services |
| **Scalability** | 4 / 10 | Local file storage and in-memory caches block horizontal scaling |
| **Deployment Readiness** | 4.5 / 10 | PM2 exists; no Docker, no graceful shutdown, manual deploy |
| **Developer Experience** | 6 / 10 | Good folder structure; no tests; no path aliases; no TS |
| **Accessibility** | 4.5 / 10 | Some ARIA; no keyboard focus ring; no contrast audit |

**Overall: 5.1 / 10 — Solid MVP foundation but not production-ready without P0/P1 fixes.**

---

*Review generated 2026-06-15. All line numbers are approximate — verify against current source before applying fixes. Cross-reference [BUGSHEET_v2.xlsx](./BUGSHEET_v2.xlsx) for the full bug tracker.*
