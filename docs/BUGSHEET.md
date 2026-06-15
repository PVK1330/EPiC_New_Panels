# EPiC Platform — Bug Sheet

**Date:** 2026-06-14  
**Scope:** EPiC Frontend (React) + EPiC API Server (Node.js/Express)  

Track each bug to completion. Update the **Status** column as work progresses.  
Statuses: `Open` · `In Progress` · `Fixed` · `Won't Fix` · `Needs Verification`

---

## Legend

| Severity | Meaning |
|----------|---------|
| CRITICAL | Exploitable security flaw or data-loss risk — ship-blocker |
| HIGH | Broken feature or significant security concern — must fix this sprint |
| MEDIUM | Degraded experience or hidden error — fix within next sprint |
| LOW | Code quality / minor UX — backlog |

---

## CRITICAL BUGS

| ID | Status | Repo | File | ~Line | Description |
|----|--------|------|------|-------|-------------|
| BUG-001 | Open | Server | `src/modules/Admin/Dashboard/dashboard.controller.js` | 979 | SQL injection: `userId` interpolated directly into `sequelize.literal()` template literal. Same pattern in `caseworkerCase.controller.js`, `message.controller.js`, `caseworkerPerformance.controller.js`. |
| BUG-002 | Open | Server | `src/services/tenantDatabaseProvision.service.js` | 115, 194 | SQL injection: tenant database name interpolated into raw `CREATE DATABASE` / `DROP DATABASE` SQL strings with no parameterisation. |
| BUG-003 | Open | Frontend | `src/hooks/useAuth.js` | 20 | Security: user's plaintext password stored in `sessionStorage` during 2FA step (`sessionStorage.setItem("pending_2fa_password", password)`). |
| BUG-004 | Open | Frontend | `src/components/admin/settings/EmailTemplatePreview.jsx` | 71 | Stored XSS: email template body rendered with `dangerouslySetInnerHTML` without sanitisation. Script injection possible. |

---

## HIGH BUGS

| ID | Status | Repo | File | ~Line | Description |
|----|--------|------|------|-------|-------------|
| BUG-005 | Open | Server | Multiple (google/microsoftMeeting.service.js, superadminProfile.controller.js, stripepayment.controller.js) | various | Silent error swallowing: `.catch(() => {})` blocks hide failures in calendar sync, profile updates, and payment notifications. |
| BUG-006 | Open | Server | `src/middlewares/tenantDb.middleware.js` | 142 | `console.error()` used instead of structured logger — sensitive error details (stack traces, credentials) may appear unredacted in log output. |
| BUG-007 | Open | Server | `src/modules/Shared/Integrations/microsoft.controller.js` | 56 | OAuth callback processes `code` from `req.query` without validating `state` parameter against session — CSRF on OAuth flow. |
| BUG-008 | Open | Server | `src/modules/Admin/Dashboard/dashboard.controller.js` | 950 | Stack trace returned in HTTP 500 response body when `NODE_ENV === 'development'`. Should never go into responses. |
| BUG-009 | Open | Frontend | `src/hooks/useAuth.js` | 46 | `register()` has no `catch` block — API errors are silently swallowed, `isLoading` stays `true` forever, loading spinner never clears. |
| BUG-010 | Open | Frontend | `src/components/common/SessionTimeout.jsx` + `src/hooks/useIdleTimer.js` | — | Two independent session-timeout mechanisms coexist — both can fire at different times, producing duplicate logout dialogs and race conditions. |

---

## MEDIUM BUGS

| ID | Status | Repo | File | ~Line | Description |
|----|--------|------|------|-------|-------------|
| BUG-011 | Open | Server | `src/modules/Shared/Documents/document.controller.js` | 29 | `req.tenantDb.Case.findByPk()` called without checking `req.tenantDb` is non-null — crashes for superadmin context with a TypeError. |
| BUG-012 | Open | Server | `src/modules/Shared/Integrations/microsoft/microsoftWorkflow.service.js` | 22 | Calendar sync launched as fire-and-forget with no error propagation — sync failures go unreported and leave data out of sync. |
| BUG-013 | Open | Server | `src/modules/Shared/Documents/download.controller.js` | — | No rate limiting on document download endpoints — potential DoS via bandwidth exhaustion. |
| BUG-014 | Open | Server | `src/config/fileSecurity.config.js` | 65 | File upload validation checks client-supplied `mimetype` header which is trivially spoofed. Magic byte check already exists but MIME-only path rejects valid files. |
| BUG-015 | Open | Server | `src/modules/Candidate/Payments/stripepayment.controller.js` | 59 | Payment lookup `findOne({ where: { transactionId } })` not scoped to the requesting user's cases — potential cross-user data exposure. |
| BUG-016 | Open | Server | `src/modules/Admin/Dashboard/dashboard.controller.js` | 707 | Multiple `findAll()` queries with no `limit`/`offset` — will OOM or timeout on large tenants. |
| BUG-017 | Open | Server | `src/config/config.js` | 27 | Hardcoded fallback password: `password: dbPassword() \|\| "postgres"` — missing env var silently uses a well-known credential. |
| BUG-018 | Open | Server | `src/services/licenceActivation.service.js` + `sponsorWorker.controller.js` | — | Multi-step writes (licence activation, worker creation + case assignment) not wrapped in a Sequelize transaction — partial writes possible on failure. |
| BUG-019 | Open | Server | `src/services/notification.service.js` | — | `notifyAdmins()` inserts one notification row per admin in a loop — N+1 insert pattern will slow down at scale. Use `bulkCreate`. |
| BUG-020 | Open | Frontend | `src/hooks/useOtp.js` | 33 | Code navigates to `/set-password` before checking whether `verifyResetOtp()` actually succeeded — user lands on reset page without a valid token. |
| BUG-021 | Open | Frontend | `src/services/api.js` | 21 | If `ensureCsrfToken()` fails, state-changing requests are sent without the `x-csrf-token` header — CSRF protection silently disabled. |
| BUG-022 | Open | Frontend | `src/store/slices/notificationSlice.js` | 15 | `response.data.data.notifications` accessed without optional chaining — crashes if API shape changes. |
| BUG-023 | Open | Frontend | Multiple | — | Array state variables (candidates, departments, etc.) mapped without null-safe fallback — "Cannot read property 'map' of undefined" crash when API is slow/fails. |
| BUG-024 | Open | Frontend | `src/context/AuthContext.jsx` | 22 | `.catch(() => {})` on `/api/auth/me` silently drops session restoration errors — users are logged out with no explanation. |
| BUG-025 | Open | Frontend | `src/services/auth.service.js` | 3 | `extractError()` unconditionally throws instead of returning a value — callers without a wrapping `try/catch` receive unhandled rejections. |
| BUG-026 | Open | Frontend | `src/services/api.js` | 88 | CSRF retry on 403 recurses without a retry limit — infinite retry loop if CSRF endpoint is permanently down. |
| BUG-027 | Open | Frontend | `src/pages/auth/SetPasswordPage.jsx` | 18 | Missing `reset_token` URL param shows an error below the form but leaves the form submittable — should redirect to `/forgot-password` immediately. |
| BUG-028 | Open | Frontend | `src/pages/auth/SetPasswordPage.jsx` | 45 | `console.log("Submitting password reset with token:", ...)` left in production code. |
| BUG-029 | Open | Frontend | `src/services/auth.service.js` | 14 | `extractError()` doesn't type-guard the `error` argument — throws TypeError when a non-Error value is caught. |
| BUG-030 | Open | Frontend | `src/pages/auth/TwoFactorPage.jsx` | — | 2FA failures show no attempt counter, no lockout warning; credentials persist in sessionStorage indefinitely. |

---

## LOW BUGS / QUALITY ITEMS

| ID | Status | Repo | File | Description |
|----|--------|------|------|-------------|
| BUG-031 | Open | Frontend | Multiple list components | Array render keys use array index (`key={idx}`) instead of stable ID — causes reconciliation bugs on reorder/insert. |
| BUG-032 | Open | Frontend | `src/utils/constants.js` | API base URL falls back to `http://localhost:5000` — should hard-fail if env var is missing in production. |
| BUG-033 | Open | Frontend | `src/hooks/useIdleTimer.js` | Idle timeout values hardcoded — should come from env vars or server config. |
| BUG-034 | Open | Frontend | `src/utils/constants.js` | Email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` too permissive — accepts malformed emails. |
| BUG-035 | Open | Frontend | `src/utils/constants.js` | Mobile validation `/^\d{7,15}$/` allows leading zeros and non-dialable numbers. Use `libphonenumber-js`. |
| BUG-036 | Open | Frontend | Multiple forms | Some form inputs missing `htmlFor` / `id` pairing — breaks screen-reader label association. |
| BUG-037 | Open | Frontend | `src/App.jsx` | `//test` comment leftover from development. |
| BUG-038 | Open | Frontend | `src/components/common/Modal.jsx` | Escape key handling inconsistent across modal instances. |
| BUG-039 | Open | Frontend | `src/components/messaging/MessagePanel.jsx` | `handleSelectThread` / `handleBackToList` recreated every render — missing `useCallback`. |
| BUG-040 | Open | Server | `src/modules/Shared/Integrations/microsoft.controller.js` | Two `// TODO` markers for OAuth token storage/cleanup — incomplete feature in production. |
| BUG-041 | Open | Server | Multiple controllers | Inconsistent error response shape (`{ status, message }` vs `{ status, code, message, error }`) — frontend can't reliably parse errors. |
| BUG-042 | Open | Server | `src/services/tenantDatabaseProvision.service.js` | No whitelist validation after database name normalisation — edge cases could produce invalid names. |
| BUG-043 | Open | Server | `src/migrations/tenants/` | Foreign key ON DELETE behaviour not explicitly specified — risk of orphaned records. |
| BUG-044 | Open | Server | Multiple | `console.log` / `console.error` used instead of structured logger across several modules. |
| BUG-045 | Open | Server | — | No `/health` or `/status` endpoint for load-balancer or uptime monitoring. |
| BUG-046 | Open | Server | `src/modules/Sponsor/ChangeRequests/sponsorChangeRequest.controller.js` | Change request "overdue" status is computed from fields at query time but never persisted — status can drift. |
| BUG-047 | Open | Server | `licence_application_audits`, `compliance_review_history` tables | No partition or archival strategy — tables grow indefinitely. |

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-06-14 | Claude Code | Initial automated audit — 47 bugs catalogued |

---

*For full descriptions and fix recommendations see [AUDIT_REPORT.md](./AUDIT_REPORT.md)*
