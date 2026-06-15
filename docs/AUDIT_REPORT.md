# EPiC Platform — Full Project Audit Report

**Date:** 2026-06-14  
**Scope:** EPiC Frontend (React) + EPiC API Server (Node.js/Express)  
**Audited by:** Claude Code automated review  

---

## Executive Summary

A full-stack audit of both the React frontend and Node.js backend was performed covering security, bugs, performance, error handling, data integrity, and code quality. A total of **50 findings** were identified across both codebases.

| Severity | Frontend | Backend | Total |
|----------|----------|---------|-------|
| CRITICAL | 1 | 3 | **4** |
| HIGH | 3 | 4 | **7** |
| MEDIUM | 13 | 11 | **24** |
| LOW | 11 | 7 | **18** |
| **Total** | **28** | **22** | **50** |

**Immediate action required** on 4 CRITICAL issues before any production deployment.

---

## Part 1 — Backend (EPiC API Server)

### CRITICAL

---

#### B-C1 · SQL Injection via `sequelize.literal()` — Dashboard Controller
- **File:** `src/modules/Admin/Dashboard/dashboard.controller.js` ~line 979
- **Category:** Security
- **Issue:** User-controlled `userId` is interpolated directly into a JSONB query using a template literal inside `sequelize.literal()`:
  ```js
  sequelize.literal(`"assignedcaseworkerId"::jsonb @> '${JSON.stringify([Number(userId)])}'::jsonb`)
  ```
- **Impact:** SQL injection — an attacker can bypass caseworker assignment filters or read unauthorised case data.
- **Fix:** Use Sequelize's `Op.contains` or a parameterised raw query instead of string interpolation.
- **Also affects:** `src/modules/Caseworker/Cases/caseworkerCase.controller.js` ~lines 20-21, `src/modules/Shared/Messages/message.controller.js` ~lines 294-295, `src/modules/Caseworker/Performance/caseworkerPerformance.controller.js` ~lines 31-32, 282-283

---

#### B-C2 · SQL Injection in Tenant Database Provisioning
- **File:** `src/services/tenantDatabaseProvision.service.js` ~lines 115, 194
- **Category:** Security
- **Issue:** Database names are interpolated directly into raw SQL:
  ```js
  await client.query(`CREATE DATABASE ${databaseName}`);
  await client.query(`DROP DATABASE IF EXISTS ${databaseName}`);
  ```
- **Impact:** If the normalisation logic is bypassed, arbitrary SQL can be injected — potentially creating or dropping other databases.
- **Fix:** Use a whitelist validator after normalisation: `if (!/^[a-z][a-z0-9_]{0,61}$/.test(name)) throw new Error(...)`. For the raw query, use `pg`'s identifier escaping (`client.query(format('CREATE DATABASE %I', name))`).

---

#### B-C3 · Silent Error Swallowing in Critical Async Paths
- **Files:** `src/modules/Shared/Integrations/google/googleMeeting.service.js` (lines 141, 189), `src/modules/Superadmin/superadminProfile.controller.js` (lines 74, 92, 122, 164, 200), `src/modules/Candidate/Payments/stripepayment.controller.js` (line 229)
- **Category:** ErrorHandling / Bug
- **Issue:** `.catch(() => {})` blocks silently swallow all errors — permission sync failures, profile update errors, and payment notification failures are invisible.
- **Impact:** Data inconsistencies and payment failures go undetected. Debugging is impossible.
- **Fix:** At minimum log: `.catch((err) => logger.warn({ err }, 'description'))`. For payment paths, propagate to the caller.

---

### HIGH

---

#### B-H1 · Sensitive Error Details Leaked via `console.error`
- **File:** `src/middlewares/tenantDb.middleware.js` ~line 142
- **Category:** Security / Config
- **Issue:** `console.error("Error loading tenant permissions:", permErr)` bypasses the structured logger's redaction layer.
- **Impact:** Stack traces, credentials, and API keys may appear unredacted in stdout/log aggregators.
- **Fix:** `logger.error({ err: permErr }, "Error loading tenant permissions");`

---

#### B-H2 · Missing Input Validation on Dynamic Database Names
- **File:** `src/services/tenantDatabaseProvision.service.js` ~lines 26-42
- **Category:** Security / DataIntegrity
- **Issue:** Normalisation regex may not catch all edge cases, leaving no whitelist check after transformation.
- **Impact:** Unpredictable DB names; potential name collisions between tenants.
- **Fix:** `if (!/^[a-z][a-z0-9_]{0,61}$/.test(finalName)) throw new Error("Invalid DB name");`

---

#### B-H3 · Unvalidated OAuth State Parameter
- **File:** `src/modules/Shared/Integrations/microsoft.controller.js` ~line 56
- **Category:** Security
- **Issue:** OAuth `code` is accepted from `req.query` without validating the `state` parameter against a stored session value.
- **Impact:** CSRF attacks on the OAuth callback — an attacker could trick an authenticated user into linking a malicious account.
- **Fix:** Store a random `state` value in the session before redirecting; validate it matches on callback.

---

#### B-H4 · Stack Traces Returned to Client in Development Mode
- **File:** `src/modules/Admin/Dashboard/dashboard.controller.js` ~lines 950-957
- **Category:** Security / ErrorHandling
- **Issue:**
  ```js
  if (process.env.NODE_ENV === 'development') {
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
  ```
- **Impact:** Even development deployments should not send stack traces in HTTP responses — they reveal internal structure to anyone with network access.
- **Fix:** Always log server-side; never include stack in the response body.

---

### MEDIUM

---

#### B-M1 · Missing Null Guard on `req.tenantDb` in Document Controller
- **File:** `src/modules/Shared/Documents/document.controller.js` ~lines 29-42
- **Category:** Bug
- **Issue:** `req.tenantDb.Case.findByPk()` is called without checking `req.tenantDb` exists first.
- **Impact:** TypeError crash (500) for superadmin users who have no tenantDb.
- **Fix:** `if (!req.tenantDb) return res.status(400).json({ message: "Tenant context required" });`

---

#### B-M2 · Fire-and-Forget Calendar Sync with No Error Propagation
- **Files:** `src/modules/Shared/Integrations/microsoft/microsoftWorkflow.service.js` ~line 22, `src/modules/Shared/Integrations/google/googleWorkflow.service.js` ~line 21
- **Category:** ErrorHandling / Bug
- **Issue:** Calendar sync processes run without `await` or a job queue, so failures are silently dropped.
- **Impact:** Calendar sync failures leave appointments out of sync with no user notification.
- **Fix:** Use a job queue (BullMQ) or at minimum `await` with error catch that notifies the user.

---

#### B-M3 · No Rate Limiting on File Download Endpoints
- **File:** `src/modules/Shared/Documents/download.controller.js`
- **Category:** Security / Performance
- **Issue:** No rate-limiting middleware is applied to document download routes.
- **Impact:** An attacker can hammer download endpoints to exhaust bandwidth or disk I/O (DoS).
- **Fix:** Apply `express-rate-limit` to all `/documents/download` routes.

---

#### B-M4 · MIME Type Validated from Client Header (Easily Spoofed)
- **File:** `src/config/fileSecurity.config.js` ~lines 65-68
- **Category:** Security
- **Issue:** `file.mimetype` (client-supplied) is used as a gate, but MIME types can be trivially spoofed.
- **Impact:** Malicious file uploads using spoofed MIME types may pass the initial check.
- **Fix:** Rely solely on magic byte verification (already implemented in `processFileSecurity`); remove MIME-only rejection path.

---

#### B-M5 · Payment Lookup Not Scoped to Authenticated User
- **File:** `src/modules/Candidate/Payments/stripepayment.controller.js` ~lines 59-62
- **Category:** Security
- **Issue:** `CasePayment.findOne({ where: { transactionId } })` does not verify the payment belongs to the requesting user's case.
- **Impact:** A candidate could access another candidate's payment record by guessing a transaction ID.
- **Fix:** Add `caseId: { [Op.in]: userCaseIds }` to the where clause.

---

#### B-M6 · Unbounded `findAll()` Queries on Dashboard
- **File:** `src/modules/Admin/Dashboard/dashboard.controller.js` ~lines 707-722
- **Category:** Performance
- **Issue:** Multiple `findAll()` calls have no `limit` or `offset`.
- **Impact:** As data grows, these queries will time out or OOM on large tenants.
- **Fix:** Add pagination to all list queries; or use `count()` aggregates for dashboard statistics.

---

#### B-M7 · Incomplete Microsoft OAuth Token Cleanup (TODO)
- **File:** `src/modules/Shared/Integrations/microsoft.controller.js` ~lines 28, 81
- **Category:** Bug / DeadCode
- **Issue:** Two `// TODO` comments mark incomplete implementations: loading/clearing connection state per user.
- **Impact:** OAuth tokens may not be properly cleaned up on disconnect, leaving dangling integrations.
- **Fix:** Implement the TODOs or add a scheduled cleanup job.

---

#### B-M8 · Hardcoded Default Database Password
- **File:** `src/config/config.js` ~line 27
- **Category:** Config / Security
- **Issue:** `password: dbPassword() || "postgres"` falls back to `"postgres"` if the env var is missing.
- **Impact:** A missing env var silently uses a well-known default password.
- **Fix:** `password: dbPassword() || (() => { throw new Error("DB_PASSWORD is required"); })()`

---

#### B-M9 · Inconsistent API Error Response Shape
- **Files:** Multiple controllers
- **Category:** API Design
- **Issue:** Some endpoints return `{ status, message, data }`, others return `{ status, code, message, error }`.
- **Impact:** Frontend error handling is inconsistent; some errors may be swallowed silently.
- **Fix:** Standardise on a single error envelope across all controllers. Consider a shared `sendError()` helper.

---

#### B-M10 · Missing Transactions on Multi-Step Writes
- **Files:** `src/services/licenceActivation.service.js`, `src/modules/Sponsor/Workers/sponsorWorker.controller.js`
- **Category:** DataIntegrity
- **Issue:** Several critical multi-step operations (licence activation, worker creation with case assignment) perform multiple DB writes without wrapping them in a Sequelize transaction.
- **Impact:** If any step fails mid-way, the database is left in a partially-updated state (e.g., licence marked active but CoS pool not seeded).
- **Fix:** Wrap multi-step writes in `tenantDb.sequelize.transaction()`.

---

#### B-M11 · N+1 Query Risk in Notification Delivery
- **File:** `src/services/notification.service.js`
- **Category:** Performance
- **Issue:** Admin notifications (`notifyAdmins`) fetch all admin users then notify each one in a loop — this can produce one `INSERT` per admin per event.
- **Impact:** On large tenants with many admins, a single worker-added event triggers dozens of individual inserts.
- **Fix:** Use bulk insert (`bulkCreate`) for notification rows.

---

### LOW

---

#### B-L1 · TODO comments for incomplete OAuth state persistence
- **File:** `src/modules/Shared/Integrations/microsoft.controller.js`
- Incomplete feature markers left in production code.

#### B-L2 · Missing ON DELETE behaviour documentation in migrations
- **File:** `src/migrations/tenants/`
- Foreign key cascades/restrictions not documented; risk of orphaned records.

#### B-L3 · `console.error` / `console.log` used instead of structured logger
- **Files:** Multiple modules
- Bypass redaction; inconsistent log format.

#### B-L4 · No API versioning strategy documented
- All routes are unversioned. Breaking changes will require a migration strategy to be defined.

#### B-L5 · Audit trail tables have no partition/archival strategy
- `licence_application_audits` and `compliance_review_history` grow indefinitely.

#### B-L6 · Worker event deadline computation done client-side
- **File:** `src/modules/Sponsor/ChangeRequests/sponsorChangeRequest.controller.js`
- Status ("overdue") derived from dates at query time but stored fields are not kept in sync.

#### B-L7 · No health-check endpoint
- No `/health` or `/status` route exists for load-balancer or uptime monitoring.

---

---

## Part 2 — Frontend (EPiC Frontend — React)

### CRITICAL

---

#### F-C1 · Plaintext Password Stored in `sessionStorage`
- **File:** `src/hooks/useAuth.js` ~lines 20-21
- **Category:** Security
- **Issue:** During 2FA, the user's password is persisted to `sessionStorage`:
  ```js
  sessionStorage.setItem("pending_2fa_password", password);
  ```
- **Impact:** Any JavaScript running on the page (including browser extensions or injected scripts) can read the plaintext password.
- **Fix:** Never store passwords in any client-side storage. Pass credentials as component state or use a server-side session reference (e.g., a temporary token valid only for the 2FA step).

---

### HIGH

---

#### F-H1 · Stored XSS via `dangerouslySetInnerHTML` in Email Template Preview
- **File:** `src/components/admin/settings/EmailTemplatePreview.jsx` ~line 71
- **Category:** Security
- **Issue:**
  ```jsx
  <div dangerouslySetInnerHTML={{ __html: template.body }} />
  ```
  Template body is rendered as raw HTML without sanitisation.
- **Impact:** If an admin or attacker with template-edit access injects a `<script>` tag, it executes in every admin's browser — stored XSS.
- **Fix:** Sanitise with `DOMPurify.sanitize(template.body)` before passing to `dangerouslySetInnerHTML`, or render in a sandboxed `<iframe>`.

---

#### F-H2 · Missing `catch` Block in `useAuth.register()`
- **File:** `src/hooks/useAuth.js` ~lines 46-59
- **Category:** Bug
- **Issue:** The `try` block calls `registerUser()` but has no `catch`. If the API call throws, the promise rejects silently, `isLoading` stays `true`, and the UI is stuck.
- **Impact:** Registration failures are invisible; the loading spinner never clears; duplicate submissions possible.
- **Fix:**
  ```js
  } catch (err) {
    showToast(err?.response?.data?.message || "Registration failed", "error");
  } finally {
    setIsLoading(false);
  }
  ```

---

#### F-H3 · Duplicate Session Timeout Mechanisms
- **Files:** `src/components/common/SessionTimeout.jsx` + `src/hooks/useIdleTimer.js`
- **Category:** Bug
- **Issue:** Two independent idle-timeout systems coexist. Both can trigger logout at different times for different users/roles.
- **Impact:** Users may see two warning dialogs; logout behaviour is unpredictable; one mechanism may cancel the other.
- **Fix:** Consolidate into a single hook. Use role or permission to configure the timeout duration.

---

### MEDIUM

---

#### F-M1 · OTP Verified Path Navigates Before Checking for Errors
- **File:** `src/hooks/useOtp.js` ~lines 33-76
- **Category:** Bug
- **Issue:** The code navigates to `/set-password` before checking whether `verifyResetOtp()` succeeded.
- **Impact:** Users land on the password-reset page with no valid OTP token, causing a confusing error on submit.
- **Fix:** `if (!result.success) { showToast(...); return; }` before calling `navigate()`.

---

#### F-M2 · CSRF Token Failure Allows Token-less Requests
- **File:** `src/services/api.js` ~lines 21-56
- **Category:** Security
- **Issue:** If `ensureCsrfToken()` fails, the Axios interceptor continues without the `x-csrf-token` header, sending unprotected state-changing requests.
- **Impact:** CSRF attacks possible when the CSRF token endpoint is unreachable.
- **Fix:** Queue requests until the CSRF token is available; reject the request chain on bootstrap failure rather than proceeding without a token.

---

#### F-M3 · Unsafe Nested API Response Access (No Optional Chaining)
- **File:** `src/store/slices/notificationSlice.js` ~lines 15-16, 27-28
- **Category:** Bug
- **Issue:** `response.data.data.notifications` accessed without optional chaining.
- **Impact:** App crash (`TypeError`) if the API returns an unexpected structure.
- **Fix:** `response.data?.data?.notifications ?? []`

---

#### F-M4 · `.map()` on Potentially `undefined` Arrays
- **Files:** Multiple (e.g., `src/components/admin/AdminCaseFormModal.jsx`, `src/pages/caseworker/Cases.jsx`)
- **Category:** Bug
- **Issue:** Array state variables are mapped before API data loads, without a null-safe fallback.
- **Impact:** "Cannot read property 'map' of undefined" runtime crash.
- **Fix:** Initialise all array state with `[]`; use `(arr ?? []).map(...)` at render sites.

---

#### F-M5 · Silent Session Restoration Failure
- **File:** `src/context/AuthContext.jsx` ~lines 22-45
- **Category:** Bug / UX
- **Issue:** `.catch(() => {})` on `/api/auth/me` silently drops session restoration errors.
- **Impact:** Users are logged out with no explanation; developers can't diagnose session issues.
- **Fix:** Log the error; optionally redirect to `/login?reason=session_expired`.

---

#### F-M6 · `extractError()` Always Throws — Breaking Callers
- **File:** `src/services/auth.service.js` ~lines 3-15
- **Category:** Bug
- **Issue:** `extractError()` unconditionally throws. Callers that don't wrap it in `try/catch` receive an unhandled rejection.
- **Impact:** Login / auth flows may crash silently without surfacing the original error to the user.
- **Fix:** Make `extractError()` return the error message string instead of throwing; let the caller decide whether to throw or display it.

---

#### F-M7 · Unhandled CSRF Retry Loop
- **File:** `src/services/api.js` ~lines 88-102
- **Category:** Bug
- **Issue:** On 403, the interceptor refetches the CSRF token and retries the request recursively with no retry limit.
- **Impact:** If the CSRF endpoint is permanently broken, the app enters an infinite retry loop.
- **Fix:** Add a retry counter on the original request config (`_csrfRetry = true`); abort after one retry.

---

#### F-M8 · No Early Redirect on Missing Password Reset Token
- **File:** `src/pages/auth/SetPasswordPage.jsx` ~lines 18-22
- **Category:** UX / Bug
- **Issue:** If the `reset_token` URL param is missing, an error is displayed below the form — but the form is still rendered and submittable.
- **Impact:** Confusing UX; user can fill in and submit the form, getting a server error.
- **Fix:** `if (!token) { navigate('/forgot-password'); return null; }` at the top of the component.

---

#### F-M9 · Debug `console.log` Left in Production Code
- **File:** `src/pages/auth/SetPasswordPage.jsx` ~line 45
- **Category:** Dead Code / Bug
- **Issue:** `console.log("Submitting password reset with token:", ...)` was left in after development.
- **Impact:** Signals incomplete QA; minor info leak in browser console.
- **Fix:** Remove all debug `console.log` statements; use the app's logger/toast system.

---

#### F-M10 · `extractError()` Missing Type Guard
- **File:** `src/services/auth.service.js` ~lines 3-14
- **Category:** Bug
- **Issue:** `error.response?.data` accessed without first verifying `error` is an object.
- **Impact:** TypeError if a non-Error value is caught (e.g., a plain string rejection).
- **Fix:** `if (!error || typeof error !== 'object') return "An unknown error occurred";`

---

#### F-M11 · 2FA Failure Gives No Attempt Count or Lockout Feedback
- **File:** `src/pages/auth/TwoFactorPage.jsx`
- **Category:** UX / Security
- **Issue:** Failed 2FA attempts show no attempt counter, no lockout warning, and credentials remain in sessionStorage indefinitely.
- **Impact:** No brute-force deterrent on the client side; poor UX.
- **Fix:** Track and display attempt count; clear sessionStorage after N failures; show remaining-attempts feedback from the server.

---

#### F-M12 · Email Template `dangerouslySetInnerHTML` Also a Performance Issue
- **File:** `src/components/admin/settings/EmailTemplatePreview.jsx`
- **Category:** Performance / Security
- **Issue:** Bypasses React's virtual DOM diffing on every render cycle.
- **Impact:** Unnecessary full DOM re-renders on prop change.
- **Fix:** Sanitise + memoize the HTML string with `useMemo`; or use an iframe.

---

#### F-M13 · Missing `useCallback` on Frequently Re-created Handlers
- **File:** `src/components/messaging/MessagePanel.jsx` ~lines 77-83
- **Category:** Performance
- **Issue:** `handleSelectThread` and `handleBackToList` are recreated every render.
- **Impact:** Causes unnecessary re-renders in child components.
- **Fix:** `const handleSelectThread = useCallback(..., [onSelectThread, isLg]);`

---

### LOW

---

#### F-L1 · Array keys use array index instead of stable ID
- **Files:** Multiple list components
- Use `key={item.id}` not `key={idx}` to avoid React reconciliation bugs on reorder/insert.

#### F-L2 · API base URL falls back to `localhost:5000` in production
- **File:** `src/utils/constants.js`
- Add a hard failure if `VITE_API_URL` is not set in production builds.

#### F-L3 · Idle timer timeout values are hardcoded
- **File:** `src/hooks/useIdleTimer.js`
- Move to environment variables or server-fetched configuration.

#### F-L4 · Email regex too permissive
- **File:** `src/utils/constants.js`
- Replace `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` with a proper RFC-compliant validator or library.

#### F-L5 · Phone validation allows leading zeros
- **File:** `src/utils/constants.js`
- Use `libphonenumber-js` for proper internationalised validation.

#### F-L6 · Some form inputs missing `htmlFor` / `id` pairing
- **Files:** Multiple forms
- Breaks screen reader label association.

#### F-L7 · `//test` comment left in `App.jsx`
- **File:** `src/App.jsx`
- Leftover debugging artifact.

#### F-L8 · Escape key handling inconsistent across modals
- **File:** `src/components/common/Modal.jsx`
- Standardise via a shared `useModalKeyboard` hook.

#### F-L9 · Unused exports not detected at build time
- No ESLint `import/no-unused-modules` rule configured.
- Add to ESLint config to catch dead code automatically.

---

## Remediation Priority

### P0 — Fix before next release
| ID | File | Issue |
|----|------|-------|
| B-C1 | dashboard.controller.js + 3 others | SQL injection via template literals |
| B-C2 | tenantDatabaseProvision.service.js | SQL injection in DB provisioning |
| F-C1 | useAuth.js | Plaintext password in sessionStorage |
| F-H1 | EmailTemplatePreview.jsx | Stored XSS |

### P1 — Fix within current sprint
| ID | File | Issue |
|----|------|-------|
| B-C3 | Multiple | Silent error swallowing |
| B-H1 | tenantDb.middleware.js | Sensitive data in console.error |
| B-H2 | tenantDatabaseProvision.service.js | Unvalidated DB names |
| B-H3 | microsoft.controller.js | Unvalidated OAuth state |
| B-H4 | dashboard.controller.js | Stack trace in HTTP response |
| F-H2 | useAuth.js | Missing catch in register() |
| F-H3 | SessionTimeout + useIdleTimer | Duplicate timeout mechanisms |
| F-M1 | useOtp.js | Navigate before error check |

### P2 — Fix within next sprint
All MEDIUM items not listed above: B-M1 through B-M11, F-M2 through F-M13.

### P3 — Backlog
All LOW items.

---

*This report was generated by automated code review on 2026-06-14. Line numbers are approximate. Always verify against the current source before applying fixes.*
