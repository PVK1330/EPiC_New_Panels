# EPiC Immigration CMS — Test Cases & QA Plan

Multi-tenant immigration case-management SaaS (UK + global). This document lists
**automated** tests (run with `npm test` in `Server/`) and **manual** QA test
cases per module. Each manual case: **steps → expected result**.

- **Automated suite:** `cd Server && npm test` (Node's built-in `node:test`).
- **Pre-reqs for full manual run:** a provisioned tenant, `JWT_SECRET` +
  `CSRF_SECRET` set, migrations applied (`npm run migrate:tenants`).

---

## 1. Automated test suite (run on every change)

| File | Covers |
|---|---|
| `tests/immigrationFlow.test.js` | 16-stage flow, stage normalisation, resolveCaseStage, submission gate (CCL signed + fee paid), fee satisfaction, pipeline bucketing, legacy status maps, candidate stage actions |
| `tests/ccl.test.js` | CCL tag registry, interpolation, amount-in-words, installment table, generator precedence (draft→template→none), PDF render |
| `tests/seeders.test.js` | Visa checklist parsing, document-checklist seeder (match/create visa types, idempotent), email-template seeder (seed/upgrade/preserve), CCL default + `.docx` import (one active per visa slot) |
| `tests/auth.validation.test.js` | Auth request schemas |
| `tests/candidateAuthorization.test.js`, `candidateMassAssignment.test.js`, `candidatePasswordReset.test.js` | Candidate authz, mass-assignment protection, password reset |
| `tests/settingsEncryption.test.js` | AES-256 secrets-at-rest |
| `tests/pdfGenerator.test.js`, `storagePath.test.js`, `oauthState.test.js`, `loginUserResolution.test.js` | PDF, storage paths, OAuth state, login role resolution |

**Status: 107/107 passing** (stable across runs). `npm test` runs sequentially
with module mocking (`--test-concurrency=1 --experimental-test-module-mocks`).
`microsoft.test.js` and `stripepayment.test.js` were migrated from Jest to
`node:test` (using `mock.module`); the realtime test waits deterministically for
the socket room-join (no fixed-timeout flakiness).

---

## 2. Authentication & Security

| ID | Test case | Steps | Expected |
|---|---|---|---|
| AUTH-01 | Login (valid) | Submit correct email/password | 200, httpOnly `token` cookie set, redirected to role dashboard |
| AUTH-02 | Login (invalid) | Wrong password | 401, generic error, no cookie |
| AUTH-03 | Rate limiting | 11 logins in 15 min from one IP | 11th returns 429 "Too many attempts" |
| AUTH-04 | 2FA | Enable 2FA, login | Prompted for TOTP; correct code → in, wrong → rejected |
| AUTH-05 | OTP registration | Register → receive OTP → verify | Account created only after OTP verified |
| AUTH-06 | Password reset | Forgot password → OTP → set new | Old password rejected, new accepted; sessions invalidated |
| AUTH-07 | CSRF | Any mutating request without `x-csrf-token` | 403 "invalid csrf token"; with token → succeeds |
| AUTH-08 | CSRF self-heal | Restart backend, then submit a form | Auto-fetches fresh token and succeeds (no manual refresh) |
| AUTH-09 | JWT not in localStorage | Inspect `localStorage` after login | No JWT present (cookie-only) |
| AUTH-10 | Session restore | Refresh page | `/api/auth/me` restores session from cookie |

## 3. Multi-tenancy

| ID | Test case | Expected |
|---|---|---|
| TEN-01 | Tenant isolation | Org A user cannot see Org B data (separate DBs) |
| TEN-02 | Subdomain routing | `acme.<domain>` resolves to Acme's tenant; `X-Organisation-Slug` sent |
| TEN-03 | Org provisioning | Create org → tenant DB created + seeded (roles, visa types, checklists, email templates, CCL templates) |

## 4. Superadmin

| ID | Test case | Steps | Expected |
|---|---|---|---|
| SA-01 | Create organisation | Superadmin → Orgs → Create | Org + trial subscription + tenant DB |
| SA-02 | Create org with admin | "With admin" form | Atomic org+admin+welcome email; rolls back on failure |
| SA-03 | Login as (impersonate) | Click "Login as" on an org | Opens a **new tab**, signs in as that org's admin (ticket-based); superadmin stays signed in on original tab |
| SA-04 | Plans/billing | Create/edit plan, view invoices | Persisted; invoices export to PDF |
| SA-05 | Suspend/activate org | Toggle status | Suspended org users blocked at login |

## 5. Immigration workflow (16 stages)

| ID | Stage | Test case | Expected |
|---|---|---|---|
| WF-01 | Client Enquiry → Admin Assignment | Admin assigns caseworker | Caseworker notified + task created |
| WF-02 | Data Capture | Caseworker "Send DCS" | Candidate emailed a **PDF** with required documents listed; stage = data_capture_initial_docs |
| WF-03 | Document Review | Caseworker approves/rejects a doc | Approve → progresses; reject → moves to Further Information |
| WF-04 | Further Information | Caseworker "Request information" | Candidate emailed the requested items; task created; stage = further_information_request |
| WF-05 | Draft Application Review | Caseworker "Send draft for review" | Candidate's form locked read-only; **exactly one** candidate task ("Review your draft application — confirm or request changes"); email sent |
| WF-06 | Draft confirm | Candidate clicks "Yes — correct" | Advances toward CCL; caseworker notified for submission |
| WF-07 | Draft reject | Candidate "No — changes" | Form unlocked; caseworker task to revise |
| WF-08 | Client Care Letter | Admin sets CCL fee | CCL released; candidate sees letter + fee |
| WF-09 | Submission gate | Try to submit before CCL signed + paid | Blocked with clear message |
| WF-10 | Biometrics | Book slot | Confirmation email with appointment card |
| WF-11 | Awaiting Decision → Decision | Upload decision doc, advance | Candidate sees decision docs unlock at decision_communicated |
| WF-12 | Case Closure | Upload final docs, close | Candidate downloads final pack |

## 6. Client Care Letter (CCL)

| ID | Test case | Steps | Expected |
|---|---|---|---|
| CCL-01 | Template list | Settings → CCL Templates | 10 imported `.docx` letters + a default, mapped to visa types |
| CCL-02 | Edit template | Open a template, edit, save | Persisted; visa-specific overrides org default |
| CCL-03 | Tag palette | Click a tag in editor | `{{tag}}` inserted at cursor |
| CCL-04 | Preview | Click Preview | PDF opens with **org logo + real company name** + sample candidate data; **tables fit the page** |
| CCL-05 | Per-case edit | Case → Client Care Letter tab | Loads template auto-filled (candidate name, date, fee, installment table) |
| CCL-06 | Upload .docx | "Upload .docx" on a case | Converted to editable HTML draft |
| CCL-07 | Issue | "Issue letter" | Branded PDF generated; status = issued; candidate can download |
| CCL-08 | Candidate download | Candidate → CCL page | Downloads personalised PDF; signs/returns |

## 7. Documents & checklists

| ID | Test case | Expected |
|---|---|---|
| DOC-01 | Checklist per visa | Each visa type shows its required documents (9 visa lists seeded) |
| DOC-02 | Upload | Candidate uploads a document | Stored privately; status = uploaded |
| DOC-03 | Secure download | Direct URL to `/uploads` | Blocked; only authenticated `/api/documents/download/:id` works |
| DOC-04 | Decision-doc gating | Candidate downloads decision doc before decision stage | Blocked until decision_communicated |

## 8. Payments

| ID | Test case | Steps | Expected |
|---|---|---|---|
| PAY-01 | Card (Stripe) | Candidate "Pay by card" | Stripe checkout; on success case `paidAmount`/`amountStatus` updated |
| PAY-02 | Bank transfer | Candidate "Bank transfer" | Shows org bank details + reference (case ref) |
| PAY-03 | Notify transfer | Candidate "I've made the transfer" | Pending `bank_transfer` payment created; admin task "Confirm bank transfer" |
| PAY-04 | Admin confirm | Admin records manual bank payment | Case marked paid; submission gate unblocks |
| PAY-05 | Webhook idempotency | Stripe retries a webhook | Event processed once (no double-charge) |

## 9. Tasks

| ID | Test case | Steps | Expected |
|---|---|---|---|
| TASK-01 | Consistency | Compare a case's Tasks tab vs `/caseworker/tasks` | Same set of the caseworker's assigned tasks |
| TASK-02 | Complete from modal | Click the checkbox on a task in the case modal | Marked completed; reflects on the Tasks page |
| TASK-03 | No duplicate draft task | Move case to draft review | Candidate gets exactly one draft-review task |
| TASK-04 | Create task | "Create task" with name/due/priority | Appears in the list; due date can't be in the past |

## 10. Candidate application form

| ID | Test case | Steps | Expected |
|---|---|---|---|
| APP-01 | No admin assign section | Open the form | "Case Assignment (Admin only)" is **not** shown |
| APP-02 | Contact number | Enter `abc` / too short | Validation error (7–15 digits) |
| APP-03 | NI number format | Enter `12345` | Error "valid National Insurance number (e.g. QQ123456C)" |
| APP-04 | BRP uniqueness | Submit a BRP already used by another applicant | 409 "already registered to another applicant" |
| APP-05 | NI uniqueness | Submit a duplicate NI number | 409 |
| APP-06 | Passport uniqueness | Submit a duplicate passport number | 409 |
| APP-07 | Resubmit own | Same applicant resubmits with their own BRP | Allowed (excluded from duplicate check) |

## 11. Email delivery

| ID | Test case | Expected |
|---|---|---|
| EM-01 | Editable templates | Admin → Email Templates | Each stage email editable; `{{tags}}` interpolated on send |
| EM-02 | DCS email | Send Data Capture | PDF attached + required documents listed; no duplicate doc list |
| EM-03 | Appointment email | Biometrics confirmation | Structured appointment card + editable body |

---

## 12. Regression checklist (run before release)
- [ ] `cd Server && npm test` → core suite green (see §1).
- [ ] Login + CSRF works on apex **and** tenant subdomain.
- [ ] "Login as" opens a new tab and signs in.
- [ ] CCL preview: logo + company name + tables inside the page.
- [ ] DCS, CCL, decision, closure emails deliver with correct data.
- [ ] Stripe + bank-transfer payments both update the case.
- [ ] Case Tasks tab matches the Tasks page; checkbox completes.
- [ ] Application uniqueness (BRP/NI/passport) blocks duplicates.
- [ ] `npm run migrate:tenants` applied; `JWT_SECRET`/`CSRF_SECRET` set.
