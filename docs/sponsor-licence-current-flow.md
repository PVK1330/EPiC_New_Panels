# Sponsor Licence — Current Flow Analysis

**Date:** 2026-06-16  
**Scope:** Full-stack analysis of the Sponsor Licence feature across backend (`Server/`) and frontend (`EPiC_Frontend/`).  
**Note:** This document describes what is built. It does not modify any code.

---

## 1. Current Flow

### 1.1 High-Level Journey

```
ADMIN PORTAL                  SPONSOR PORTAL                  CASEWORKER PORTAL
────────────                  ──────────────                  ─────────────────
Create sponsor ──email──►  Log in (role_id=4)
                            │
                            ▼
                      Apply for licence (V2 wizard or V1 legacy form)
                      status = Pending
                            │
                            ▼
                                                ◄── Admin assigns caseworker
                                                    status → Under Review
                                                    Admin or caseworker reviews docs
                                                    Can Request Information
                                                    (status → Information Requested)
                            │
                            ▼ (sponsor provides info / re-submits)
                                                ◄── Admin/Caseworker advances through:
                                                    Under Review → Government Processing
                                                    → Decision Pending → Approved / Rejected
                            │
                            ▼ status = Approved
                      licenceStatus = Active (SponsorProfile)
                      licenceNumber + issue/expiry dates generated
                            │
                  ┌─────────┴────────────┐
                  ▼                      ▼
           Request CoS           Add Sponsored Worker
           (currently ungated)   (currently ungated)
```

### 1.2 Application Versions

Two parallel entry points exist in the codebase:

| Version | Entry point | Data storage | Status |
|---|---|---|---|
| **V1 (legacy)** | `ApplyLicence.jsx` → `POST /api/business/licence/apply` | Flat fields on `licence_applications` row (`documents` JSON blob) | Deprecated; kept for backward compat |
| **V2 (current)** | `ApplyLicenceV2.jsx` → `POST /api/business/licence/v2/applications` | Normalised child tables (`licence_organisation_info`, `licence_appendix_documents`, etc.) | Active; `applicationVersion = 2` |

V1 and V2 rows live in the **same `licence_applications` table**, differentiated by `application_version`.

### 1.3 V2 Wizard Steps

The V2 multi-step wizard (`ApplyLicenceV2.jsx`) collects data across 8 steps saved via `PUT /api/business/licence/v2/applications/:id` (draft auto-save):

1. Licence Routes — select immigration route(s) and declare existing SLN
2. Organisation Details — Companies House number, HMRC/PAYE refs, SIC codes, trading names
3. CoS Requirements — SOC code, role title, salary, number of workers, duration per sponsored candidate
4. Supporting Documents — upload Appendix A evidence against required document keys
5. Authorising Officer — personal details, NI number, immigration status, conviction declaration
6. Key Contact — may be same as AO; day-to-day contact for UKVI
7. Level 1 Users — additional SMS portal users (1-to-many)
8. Declarations — accuracy confirmation, representative authorisation, signatory name/role/date

Final submission: `POST /api/business/licence/v2/applications/:id/submit`

### 1.4 Status Lifecycle

```
Draft ──► Pending ──► Under Review ──► Information Requested ──► Under Review
                │                             └──────────────────────► Rejected
                ├──► Under Review ──► Government Processing ──► Decision Pending ──► Approved
                │                                                                └──► Rejected
                ├──► Information Requested ──► (sponsor responds) ──► Under Review
                ├──► Approved
                └──► Rejected
```

Source: `licenceApplication.model.js` line 37; transition guards in `workflowEngine.service.js`.

### 1.5 18-Stage Task Pipeline

Each application runs an 18-stage task panel (`licenceStageTask.service.js → LICENCE_STAGE_DEFINITIONS`). Stages are grouped into five sections:

| Section | Stage # | Stage Key |
|---|---|---|
| **Intake** | 1 | `enquiry_onboarding` |
| **Application** (Sections 1–7) | 2–8 | `licence_routes`, `organisation_details`, `cos_requirements`, `supporting_documents`, `key_personnel`, `declarations`, `payment` |
| **Intake Pack** | 9–10 | `intake_information_form`, `intake_document_checklist` |
| **Government Prep** | 11–13 | `sponsor_information_provision`, `government_sms_registration`, `sponsor_portal_onboarding` |
| **Government Application** | 14–16 | `government_portal_credentials`, `government_application_forms`, `government_submission` |
| **Outcome** | 17–18 | `submission`, `decision_activation` |

Each stage has up to four role tasks: `sponsor`, `caseworker`, `admin`, `candidate` (some stages have `null` candidate tasks).

---

## 2. Current Database Entities

### 2.1 Core Application Table

**`licence_applications`** — `licenceApplication.model.js`

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `user_id` | FK → users | Sponsor owner |
| `organisation_id` | FK → organisations | Tenant scope |
| `type` | ENUM(`New`, `Renewal`) | Default `New` |
| `status` | ENUM(8 values) | See §1.4 above |
| `application_version` | SMALLINT | 1=V1, 2=V2 |
| `current_step` | SMALLINT | Wizard progress (V2) |
| `submitted_at` | DATE | Set on submit |
| `fee_sponsor_size` | STRING | `small` / `large` |
| `fee_base` | DECIMAL(10,2) | Licence fee |
| `fee_isc_estimate` | DECIMAL(12,2) | ISC estimate |
| `fee_total` | DECIMAL(10,2) | Total fee |
| `fee_currency` | STRING(3) | Default `GBP` |
| `assigned_caseworker_id` | JSONB | Array of caseworker user IDs |
| `documents` | JSON | V1 document blob (legacy) |
| `government_registration_ref` | STRING | SMS registration reference |
| `government_submission_ref` | STRING | UKVI submission reference |
| `government_submission_date` | DATEONLY | Date submitted to UKVI |
| `review_started_at` | DATE | When caseworker review began |
| `deleted_at` | DATE | Soft-delete (paranoid mode) |

### 2.2 V2 Normalised Child Tables (1:1 unless noted)

| Model file | Table | Relationship | Key fields |
|---|---|---|---|
| `licenceApplicationRoute` | `licence_application_routes` | 1:N | `route_code` (SkilledWorker / Student / ScaleUp / GBM / GAE) |
| `licenceOrganisationInfo` | `licence_organisation_info` | 1:1 | `companies_house_number`, `paye_reference`, `sic_codes[]`, `regions[]` |
| `licenceCosRequirement` | `licence_cos_requirements` | 1:N | `soc_code`, `role_title`, `number_of_workers`, `salary`, `sponsorship_duration_months` |
| `licenceAppendixDocument` | `licence_appendix_documents` | 1:N | `document_key`, `file_path`, `received_status`, `verification_status` |
| `licenceAuthorisingOfficer` | `licence_authorising_officers` | 1:1 | `first_name`, `last_name`, `dob`, `ni_number`, `immigration_status`, `has_convictions` |
| `licenceKeyContact` | `licence_key_contacts` | 1:1 | `same_as_authorising_officer`, `first_name`, `last_name`, `job_title`, `email` |
| `licenceLevel1User` | `licence_level1_users` | 1:N | `first_name`, `last_name`, `job_title`, `email`, `is_authorising_officer` |
| `licenceDeclaration` | `licence_declarations` | 1:1 | `accuracy_confirmed`, `duties_understood`, `data_consent`, `signatory_name`, `signed_date` |
| `licenceIntakeForm` | `licence_intake_forms` | 1:1 | 12 fields + 6 condition flags (`food_business`, `alcohol_business`, `care_business`, `tupe_transfer`, `candidate_identified`, `candidate_not_identified`) |
| `licenceIntakeDocument` | `licence_intake_documents` | 1:N | `document_key`, `category` (mandatory/conditional), `status` (5 values), `file_path`, `verified_by_user_id` |
| `licenceGovernmentTracking` | `licence_government_tracking` | 1:1 | `sms_portal_username`, `sms_registration_ref`, `credentials_generated_at`, `credentials_sent_at` |
| `licenceStageTask` | `licence_stage_tasks` | 1:N | `stage_key`, `stage_order`, `role`, `status`, `assigned_to_user_id`, UNIQUE(`licence_application_id`, `stage_key`, `role`) |
| `licenceApplicationAudit` | `licence_application_audits` | 1:N | `action`, `previous_status`, `new_status`, `actor_id`, `notes` |

### 2.3 SponsorProfile (activated on approval)

**`sponsor_profiles`** — updated by `licenceActivation.service.js` when status → `Approved`:

| Field | Set to |
|---|---|
| `licence_status` | `'Active'` |
| `sponsor_licence_number` | Generated `SLN-{year}-{userId padded to 6}` |
| `licence_issue_date` | Today |
| `licence_expiry_date` | Today + 4 years (or renewal base + 4 years) |
| `licence_rating` | `'A'` (default if not already set) |
| `cos_allocation` | Seeded from intake form `number_of_cos_required`, or app `cos_allocation`, or default 5 |

---

## 3. Current Task Workflow

### 3.1 Task Seeding

**Function:** `ensureStageTasks()` — `licenceStageTask.service.js`

Triggered by: application submit, caseworker assign, status change, or lazy read via the stages API.

- Creates one row per `(stage_key, role)` combination using `findOrCreate` (idempotent).
- UNIQUE constraint on `(licence_application_id, stage_key, role)` prevents duplicates.
- Resolves the responsible person per role:
  - `sponsor` → `application.userId`
  - `caseworker` → each ID in `assignedcaseworkerId` JSONB array
  - `admin` → first active `role_id = ROLES.ADMIN` user in the tenant
  - `candidate` → first `LicenceCosRequirement.candidateEmail` (free-text, not a portal user)

### 3.2 Auto-completion Rules

On seeding, the engine infers which stages are already done from application data (`deriveStageCompletion()`):

| Signal | Completes stages |
|---|---|
| `submittedAt` is set AND status ≠ Draft | `enquiry_onboarding`, `submission` |
| `routes.length > 0` | `licence_routes` |
| `organisationInfo` has CH number or org type | `organisation_details` |
| `cosRequirements.length > 0` | `cos_requirements` |
| All appendix docs have `verificationStatus = 'Verified'` | `supporting_documents` |
| `authorisingOfficer` row exists | `key_personnel` |
| `declaration.accuracyConfirmed = true` | `declarations` |
| status ∈ {Government Processing, Decision Pending, Approved} | `intake_document_checklist`, `government_sms_registration`, `sponsor_portal_onboarding` |
| status ∈ {Decision Pending, Approved} | `government_application_forms`, `government_submission` |
| `status = 'Approved'` | `decision_activation` (and ALL remaining stages forced complete) |

For auto-inferred stages, only `sponsor` and `candidate` role tasks auto-complete; `caseworker` and `admin` tasks remain `pending` and must be explicitly marked done.

### 3.3 Manual Task Completion

**Endpoint:** `POST /{role}/licence/:id/stages/:stageKey/complete`  
**Controller:** `licenceStage.controller.js → completeLicenceStageTask`

Authorization rules:
- Actor's portal role must match the task's `role` field **OR** actor is an Admin (admins can complete any role's task, including the candidate task).
- Sponsors can only complete tasks on their own applications.

Side effects on completion:
1. Row updated: `status = 'completed'`, `completed_at = now()`, `completed_by_user_id = actorId`
2. Notifications sent (in-app + email) to: all tenant admins, the sponsor, all assigned caseworkers, and the candidate by email if applicable — excluding the actor.
3. Audit entry recorded in `licence_application_audits`.
4. Completion is idempotent (re-completing is a no-op).

### 3.4 Stage Status Derivation (UI Display)

The stages panel derives display status from completion signals + application status:

- If `Approved` → all stages = `done`
- If `Rejected` → all stages = `upcoming` except `decision_activation` = `rejected`
- Otherwise → walk stages in order: complete stages = `done`, first incomplete = `current`, rest = `upcoming`

---

## 4. Current Status Values

### 4.1 Application Status ENUM (licenceApplication.model.js:37)

| Value | Meaning | Who sets it |
|---|---|---|
| `Draft` | V2 app created but not submitted | System (createDraft) |
| `Pending` | Submitted; awaiting review | System (submitApplication) |
| `Under Review` | Assigned to caseworker | Admin (assignCaseworker) |
| `Information Requested` | Sponsor must provide more data | Admin or Caseworker |
| `Government Processing` | Portal/SMS registration started | Caseworker |
| `Decision Pending` | Forms submitted; awaiting UKVI | Caseworker |
| `Approved` | UKVI approved; triggers licence activation | Admin |
| `Rejected` | Application denied (terminal) | Admin or Caseworker |

### 4.2 Stage Task Status (licenceStageTask.model.js)

| Value | Meaning |
|---|---|
| `pending` | Not yet started |
| `in_progress` | Assigned, awaiting action |
| `completed` | Marked done with audit trail |
| `blocked` | Defined but not actively used |

### 4.3 Appendix Document Status

| Field | Values |
|---|---|
| `received_status` | `Not Received` → `Received` |
| `verification_status` | `Pending` → `Verified` / `Rejected` |

### 4.4 Intake Document Status (licenceIntakeDocument.model.js)

`pending` → `uploaded` → `verified` / `rejected` / `information_required`

---

## 5. Authorising Officer, Key Contact and Level 1 User Flow

### 5.1 Authorising Officer (AO)

**Model:** `licenceAuthorisingOfficer` (1:1 with application)  
**Collected in:** V2 wizard Step 5 (`ApplyLicenceV2.jsx`)  
**Saved via:** `PUT /api/business/licence/v2/applications/:id` (`section: 'authorising_officer'`)

Fields collected:
- `first_name`, `last_name`, `dob`, `nationality`
- `ni_number` — mandatory (UK National Insurance number, required by UKVI)
- `immigration_status` — e.g. British Citizen, Settled Status, visa type
- `has_convictions` (boolean) + `convictions_details` (free text)
- `email`, `phone`, `title` (e.g. Director, CEO)

**Stage 6 task (key_personnel):**
- Sponsor task: "Nominate the Authorising Officer, Key Contact and Level 1 User; declare any convictions."
- Caseworker task: "Verify personnel are UK-based, hold an NI number and have a clean record."
- Admin task: "Approve the key personnel appointments."

The AO row's existence (`!!app.authorisingOfficer`) is the data signal that auto-completes the sponsor's Stage 6 task.

### 5.2 Key Contact (KC)

**Model:** `licenceKeyContact` (1:1 with application)  
**Collected in:** V2 wizard Step 6

Fields collected:
- `same_as_authorising_officer` — if true, KC fields are pre-filled from AO
- `first_name`, `last_name`, `job_title`
- `email`, `phone`, `title`

The KC is the day-to-day point of contact for UKVI/compliance queries. One KC per application enforced by the 1:1 model relationship.

### 5.3 Level 1 User (L1)

**Model:** `licenceLevel1User` (1:N with application)  
**Collected in:** V2 wizard Step 7

Fields collected:
- `first_name`, `last_name`, `job_title`
- `email`, `phone`
- `is_authorising_officer` — boolean flag (if also acting as AO)

Multiple L1 users can be nominated per application. They will be registered on the UKVI SMS portal as staff who can assign CoS.

### 5.4 Current Limitations of AO/KC/L1 Flow

- AO, KC and L1 are data records only; they are **not linked to portal User accounts**. The nominated persons are not created as users and cannot log into the system.
- Caseworker verification of personnel (Stage 6 caseworker task) is purely a manual checkbox — there is no automated cross-check against Companies House or HMRC.
- If the same person is both AO and KC, the sponsor must enter the same data twice (no automatic sync beyond the `same_as_authorising_officer` flag on the KC form).

---

## 6. Current Document Upload Flow

### 6.1 V1 Legacy Documents

**Storage:** `documents` JSON field on `licence_applications` row.  
**Upload endpoint:** `POST /api/business/licence/documents/upload`  
**Controller:** `sponsorLicence.controller.js → uploadLicenceDocument`

- Files saved to `storage/private/` (no static serving).
- Document metadata pushed as array items into the JSON blob.
- Deletion: `DELETE /api/business/licence/documents/:applicationId/:docIndex` removes by array index.
- Download (admin/caseworker): authenticated streaming via `GET /api/admin/licence/:id/documents/:index/download` — confined to `storage/private/`, prevents directory traversal.
- No per-document verification status in V1; the whole application is reviewed as a unit.

### 6.2 V2 Appendix Documents (Normalised)

**Model:** `licenceAppendixDocument` (1:N with application)  
**Upload endpoint:** `POST /api/business/licence/v2/applications/:id/appendix-documents/:docId/file`  
**Controller:** `sponsorLicenceV2.controller.js → uploadAppendixDocument`

Document lifecycle:
1. Rows seeded with `document_key`, `document_name`, `required` on application create.
2. Sponsor uploads a file → `received_status = 'Received'`, `file_path` stored.
3. Caseworker reviews: sets `verification_status = 'Verified'` or `'Rejected'`.
4. Stage 5 (`supporting_documents`) auto-completes when **all** documents reach `'Verified'`.

Required document keys (Appendix A): `employer_liability_insurance`, `certificate_of_incorporation`, `paye_registration`, `bank_statements`, `premises_evidence`, and identity documents — seeded based on selected routes.

### 6.3 Intake Documents (Phase 2 — Post-Submission)

**Model:** `licenceIntakeDocument` (1:N with application)  
**Upload endpoint:** `POST /api/business/licence/:id/intake/documents/:documentKey/upload`  
**Controller:** `sponsorLicenceIntake.controller.js → uploadSponsorIntakeDocument`

Two categories:
- **Mandatory** — always required (employer liability insurance, CoI, PAYE, bank statements, premises).
- **Conditional** — activated by flags on the `licenceIntakeForm` row (e.g., `food_business = true` → food hygiene certificate required; `care_business = true` → CQC registration required).

Document review (caseworker):
- `PATCH /api/caseworker/licence/:id/intake/documents/:documentKey/verify` → `status = 'verified'`
- `PATCH /api/caseworker/licence/:id/intake/documents/:documentKey/reject` → `status = 'rejected'`, `rejection_reason` recorded
- `PATCH /api/caseworker/licence/:id/intake/documents/:documentKey/request-info` → `status = 'information_required'`, `caseworker_notes` recorded

Stage 10 (`intake_document_checklist`) is considered complete once the application reaches `Government Processing` status.

### 6.4 Storage

- All files stored under `storage/private/` on the server filesystem (no CDN or object storage).
- Files are served through authenticated endpoints only; no public URL is exposed.
- Inline preview supported for: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.pdf`. All other formats force a download.
- Path traversal is blocked: download endpoints confine the resolved path to `storage/private/`.

---

## 7. Problems Found

### P1 — `requireActiveSponsorLicence` middleware is defined but never applied

**File:** `Server/src/middlewares/requireActiveSponsorLicence.middleware.js`

The middleware exists and works correctly: it reads `SponsorProfile.licenceStatus`, returns HTTP 403 if not `'Active'`. However, it is **not mounted** on the CoS request or sponsored worker creation routes. This means:

- Any sponsor with `role_id = 4` can call `POST /api/business/cos/request` regardless of licence status.
- Any sponsor can call `POST /api/business/workers` regardless of licence status.
- The frontend hook `useSponsorLicence` shows a gate banner, but the backend does not enforce it.

### P2 — CoS requests reuse the `licence_applications` table

**File:** `Server/src/modules/Sponsor/Licence/sponsorCos.controller.js`

CoS allocation requests are stored as `LicenceApplication` rows with `type = 'Renewal'` and `reason` prefixed `"CoS Request:"`. This conflates licence applications and CoS requests in the same table, query filters, and admin UI. The `workflowEngine.service.js` already defines a dedicated `COS_REQUEST` lifecycle (`Pending → Under Review → Approved → Allocated → Used/Expired/Revoked`) but it is never used.

### P3 — `addSponsoredWorker` does not check or decrement `cosAllocation`

**File:** `Server/src/modules/Sponsor/Workers/sponsorWorker.controller.js`

A sponsor can add more sponsored workers than their approved CoS allocation. The `cosAllocation` field on `SponsorProfile` is set at licence activation but never decremented or checked when workers are added.

### P4 — Candidate is a free-text contact, not a portal user

**Service:** `licenceStageTask.service.js → resolveRoles`

The `candidate` role in the stage task engine is resolved from `LicenceCosRequirement.candidateEmail` — a plain-text email field. The candidate has no portal account. Consequences:
- Candidate tasks cannot be self-served; admins must complete them on the candidate's behalf.
- In-app notifications cannot be delivered to the candidate (email only).
- The Stage 4 (`cos_requirements`) candidate task "Provide role/salary details…" has no corresponding UI for the candidate to fill in.

### P5 — Stage definitions are duplicated in two places

Backend: `Server/src/services/licenceStageTask.service.js → LICENCE_STAGE_DEFINITIONS`  
Frontend: `EPiC_Frontend/src/constants/licenceStages.js → LICENCE_STAGES`

The two lists must be kept in sync manually. A mismatch between stage keys or order would cause the frontend panel to display incorrect stage names or the wrong stage as "current".

### P6 — No undo / reopen for task completion

**Controller:** `licenceStage.controller.js → completeLicenceStageTask`

Once a stage task is marked `completed`, there is no endpoint to reopen it. If a caseworker marks their review complete prematurely, an admin must manually update the database row.

### P7 — V1 and V2 applications share the same list/admin views without clear differentiation

**Page:** `AdminLicenceApplications.jsx`

The admin list page shows both `applicationVersion = 1` and `= 2` rows. The V2 detail view (`LicenceApplicationV2Detail`) is only rendered when navigating to `/admin/licence/v2/:id`. If an admin clicks a V1 application, they see the simplified V1 detail; V2 applications may not clearly indicate their version in the list.

### P8 — First-login password reset is not enforced for sponsors

**Controller:** `Admin/Sponsors/sponsors.controller.js → createSponsor`

Sponsors are created with `is_email_verified = true` and a permanent generated password. There is no `force_password_change` flag or first-login redirect enforced, so the auto-generated password remains active indefinitely unless the sponsor changes it voluntarily.

### P9 — Welcome email failures are silently swallowed on sponsor creation

**Service:** `tenantUserMail.service.js → sendTenantSponsorWelcomeEmail`

The email send is best-effort; errors are caught and logged but the admin creating the sponsor is not informed if the welcome email (containing the login credentials) failed to deliver.

### P10 — Dormant SPONSOR_LIFECYCLE workflow is never triggered

**File:** `Server/src/services/workflowEngine.service.js`

`WORKFLOW_TYPES.SPONSOR` defines a 10-step lifecycle (`Registered → Verified → Profile Created → … → Active Sponsor`) and `WORKFLOW_TYPES.COS` defines the CoS allocation flow. Neither is ever referenced by a `validateTransition` or `findTransitionPath` call elsewhere in the codebase. The licence application uses the simpler 8-state `LICENCE` ENUM instead.

---

## 8. Differences from the Required Sponsor Licence Flow

The required flow (documented in `SPONSORSHIP_LICENCE_FEATURE_AND_FLOW.md`) describes a full UK-style sponsorship process. The table below maps each required step to current status.

| Required step | Current status | Gap detail |
|---|---|---|
| Admin creates sponsor, emails credentials | ✅ Built | `createSponsor` → welcome email with login URL and password |
| Sponsor logs into portal | ✅ Built | `/auth/login`, role-gated `/business/*` routes |
| Sponsor applies for licence (stages matching UK process) | ⚠️ Partial | V2 wizard covers the 8 application sections. The **18-stage task panel** exists but is a monitoring/tracking layer; the underlying `status` field is a flat 8-value ENUM, not the full `SPONSOR_LIFECYCLE` state machine. The dormant lifecycle (`workflowEngine → SPONSOR_LIFECYCLE`) is never driven. |
| Caseworker assigned; application follows UK sponsorship stages | ⚠️ Partial | Caseworker is assigned via `assignedcaseworkerId` and the 18-stage panel tracks progress. However, the licence application is **not a `Case`** record and does not appear in the standard case pipeline, timeline notes, or payments. |
| Licence granted → `licenceStatus = Active` | ✅ Built | `activateSponsorLicence()` sets `SponsorProfile.licenceStatus = 'Active'`, generates SLN, sets issue/expiry dates atomically. |
| After licence → request CoS (gated on active licence) | ❌ Gate missing | CoS endpoint exists but `requireActiveSponsorLicence` middleware is **not applied**. Any sponsor can request CoS without an approved licence. |
| After licence → request CAS (Confirmation of Acceptance for Studies) | ❌ Not built | No CAS model, endpoint, or UI exists. CAS appears only as a document checklist label. |
| Manage sponsored workers (gated on active licence) | ❌ Gate missing | `addSponsoredWorker` endpoint exists but is not gated. Worker creation does not check or decrement `cosAllocation`. |
| CoS has its own lifecycle (Pending → Approved → Allocated → Used) | ❌ Not wired | `COS_REQUEST` lifecycle defined in `workflowEngine.service.js` but never used. CoS requests are stored as `LicenceApplication(type:'Renewal')` rows. |
| Candidate self-service on Stage 4 (CoS requirements) | ❌ Not built | Candidate is a free-text email contact, not a portal user. No candidate-facing UI for this stage. |
| Ongoing compliance: right-to-work, worker events, change requests | ✅ Built (ungated) | `sponsorWorker`, `workerEvent`, `rightToWork`, `sponsorChangeRequest` modules exist and are connected to APIs. Not gated on active licence. |

### Summary of Priority Gaps

| Priority | Gap | Fix location |
|---|---|---|
| 🔴 High | Mount `requireActiveSponsorLicence` on CoS and worker routes | `Server/src/modules/Sponsor/index.js` |
| 🔴 High | `addSponsoredWorker` must check and decrement `cosAllocation` | `sponsorWorker.controller.js` |
| 🔴 High | Decide and document CAS scope (build or explicitly out-of-scope) | New feature or scope decision |
| 🟡 Medium | Give CoS a dedicated model and drive the `COS_REQUEST` lifecycle | New `cosAllocation.model.js` + wire `workflowEngine` |
| 🟡 Medium | Decide licence ↔ Case relationship (licence as first-class case or linked Case record) | Architecture decision |
| 🟡 Medium | Serve stage definitions from a single backend endpoint to eliminate dual-maintenance | `licenceStageTask.service.js` + new endpoint |
| 🟢 Low | Add task reopen endpoint for stage tasks | `licenceStage.controller.js` |
| 🟢 Low | Enforce first-login password reset for sponsors | `createSponsor` + auth middleware |
| 🟢 Low | Surface welcome email failures to admin | `createSponsor` error handling |

---

## Key File Reference

### Backend (`Server/src/`)

| Area | Path |
|---|---|
| Core model | `models/tenant/licenceApplication.model.js` |
| V2 child models | `models/tenant/licence{OrganisationInfo,ApplicationRoute,CosRequirement,AppendixDocument,AuthorisingOfficer,KeyContact,Level1User,Declaration}.model.js` |
| Stage task model | `models/tenant/licenceStageTask.model.js` |
| Intake models | `models/tenant/licenceIntakeForm.model.js`, `licenceIntakeDocument.model.js` |
| Government tracking | `models/tenant/licenceGovernmentTracking.model.js` |
| Audit | `models/tenant/licenceApplicationAudit.model.js` |
| Sponsor routes | `modules/Sponsor/Licence/sponsorLicence.routes.js` |
| Sponsor V2 routes | `modules/Sponsor/Licence/sponsorLicenceV2.routes.js` |
| Admin routes | `modules/Admin/Settings/admin.licence.routes.js` |
| Caseworker routes | `modules/Caseworker/Cases/caseworker.licence.routes.js` |
| Stage controller | `modules/Shared/Licence/licenceStage.controller.js` |
| Stage task engine | `services/licenceStageTask.service.js` |
| Licence activation | `services/licenceActivation.service.js` |
| Fee calculation | `services/licenceFee.service.js` |
| Intake service | `services/licenceIntake.service.js` |
| Government service | `services/licenceGovernment.service.js` |
| Active licence gate | `middlewares/requireActiveSponsorLicence.middleware.js` |
| Workflow engine | `services/workflowEngine.service.js` |

### Frontend (`EPiC_Frontend/src/`)

| Area | Path |
|---|---|
| V2 wizard | `pages/business/ApplyLicenceV2.jsx` |
| V1 legacy form | `pages/business/ApplyLicence.jsx` |
| Licence status dashboard | `pages/business/LicenceStatus.jsx` |
| Licence process / stages | `pages/business/LicenceProcess.jsx` |
| Licence documents | `pages/business/LicenceDocuments.jsx` |
| Admin list | `pages/admin/AdminLicenceApplications.jsx` |
| Caseworker list | `pages/caseworker/CaseworkerLicenceApplications.jsx` |
| Stages panel component | `components/licence/LicenceStages.jsx` |
| Intake document checklist | `components/licence/IntakeDocumentChecklist.jsx` |
| Stage constants | `constants/licenceStages.js` |
| Licence API service | `services/licenceApi.js` |
| V2 API service | `services/licenceV2Api.js` |
| Stage API service | `services/licenceStageApi.js` |
| Licence gate hook | `hooks/useSponsorLicence.js` |
