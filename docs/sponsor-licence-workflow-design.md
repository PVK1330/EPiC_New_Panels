# Sponsor Licence — New Workflow Architecture Design

**Date:** 2026-06-16  
**Based on:** `docs/sponsor-licence-current-flow.md`, UKVI government application form (Pages 1–15), client document checklist, client intake form  
**Scope:** Design only. No code is modified by this document.

---

## Overview

The new workflow is organised into five sequential phases. Each phase has a clear owner, defined entry and exit gates, and explicit status transitions. Phases 1–3 are mandatory for every new sponsor. Phases 4 and 5 are only accessible once Phase 3 exits with an `Approved` licence.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1          PHASE 2           PHASE 3          PHASE 4    PHASE 5     │
│  Sponsor          Licence           Licence          CoS        Sponsored   │
│  Onboarding  ──►  Application  ──►  Review &    ──►  Allocation ► Worker    │
│                                     Approval                    Management  │
└─────────────────────────────────────────────────────────────────────────────┘
         Gate: first login     Gate: intake       Gate: licenceStatus=Active  │
                                form complete      AND cosAllocation > 0      │
```

**Role definitions:**

| Role | Portal | Responsibility |
|---|---|---|
| **Admin** | `/admin` | Creates sponsors, assigns caseworkers, final approvals |
| **Caseworker** | `/caseworker` | Processes applications, verifies documents, drives government pipeline |
| **Sponsor** | `/business` | Submits data, uploads documents, pays fee |
| **Candidate** | (email notification only at licence stage; portal account at worker stage) | Provides role/salary details, receives CoS |

---

## Phase 1 — Sponsor Onboarding

### Purpose
Establish the sponsor's account and ensure they can access the portal with verified credentials before any application work begins.

### Tasks

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 1.1 | Create sponsor account | **Admin** | Create User (`role_id=4`) + `SponsorProfile` record via the Admin portal |
| 1.2 | Send welcome email | **System** | Email credentials (login URL + temp password) to sponsor; surface delivery failure to admin |
| 1.3 | Force password change | **Sponsor** | On first login, sponsor must set a permanent password before accessing any other page |
| 1.4 | Complete company profile | **Sponsor** | Set company name, address, website, phone — enough for the intake form to be pre-populated |
| 1.5 | Confirm onboarding complete | **Admin** | Admin reviews sponsor record and marks onboarding complete |

### Entry Criteria
- Admin is logged in with `role_id = 3`.
- No existing User record with the same email in the tenant.

### Exit Criteria
- `SponsorProfile.onboardingStatus = 'complete'`
- Sponsor has successfully completed a first login and changed their password.
- `SponsorProfile.licenceStatus = 'Pending'` (default; not yet Active)

### Status Transitions

```
[Not Created]
      │  Admin creates sponsor
      ▼
  registered
      │  System sends welcome email
      ▼
  credentials_sent
      │  Sponsor logs in for first time
      ▼
  first_login
      │  Sponsor sets new password
      ▼
  active
      │  Admin confirms onboarding
      ▼
  onboarded
```

Stored on: `SponsorProfile.onboardingStatus` (new field — currently missing, needs migration).

### Approval Requirements
- **Admin approval required** at task 1.5 to mark onboarding complete and unlock the licence application.
- No caseworker involvement at this phase.

### Design Notes
- If the welcome email fails to deliver, the system must record the failure and display a warning banner on the admin's sponsor detail page (fixes current P9).
- First-login password change must be enforced by a middleware redirect — the sponsor cannot reach any other `/business/*` route until the password is changed (fixes current P8).
- Onboarding status is separate from licence status. A sponsor can be `onboarded` but still have `licenceStatus = Pending`.

---

## Phase 2 — Licence Application

### Purpose
Collect all information required for the UKVI sponsor licence application, mirroring the 8-section UKVI online form exactly. The application is split into two sub-flows: an **internal intake pack** (collected first by the caseworker's firm) and the **UKVI-mirror application** (the data that goes onto the government form).

### Sub-Flow A: Internal Intake Pack

This is the firm's internal information-gathering step, collected before the UKVI form is started. It maps to the client's "Form – Information for Sponsor Licence" and the "Documents checklist for Sponsor Licence".

#### Tasks — Sub-Flow A

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2A.1 | Complete intake information form | **Sponsor** | Fill the 12-field form: trading name, premises address, owning limited company, named person on licence, phone, NI number, email, job title(s) to recruit, company website, total employees, employees under immigration rules, number of CoS required |
| 2A.2 | Upload mandatory documents | **Sponsor** | Passport of named person, last 3 months bank statements, organisational chart, PAYE reference on HMRC headed document, VAT registration certificate, annual accounts/trading info, lease for business premises, employer's liability insurance certificate, proof of purchase/sales/invoices |
| 2A.3 | Upload conditional documents | **Sponsor** | Triggered by toggles: food business → council registration/Scores on Doors; alcohol business → premises alcohol licence; care business → CQC registration; TUPE transfer → incoming/outgoing AO letters + solicitor letter; candidate identified → passport, draft employment contract, SOC code, share code; candidate not identified → advertisement proof; RTW checks → evidence for all employees under immigration rules |
| 2A.4 | Review intake form | **Caseworker** | Verify all mandatory fields are accurate and complete |
| 2A.5 | Verify each uploaded document | **Caseworker** | Mark each document as `verified`, `rejected`, or `information_required`. Rejected documents return to sponsor with a reason. All mandatory docs must reach `verified` before Sub-Flow B can begin |
| 2A.6 | Approve intake pack | **Admin** | Confirm caseworker has completed intake review; authorise progression to the UKVI form |

#### Sub-Flow A Entry Criteria
- Sponsor has completed Phase 1 (onboarding status = `onboarded`).
- Caseworker has been assigned to the application.

#### Sub-Flow A Exit Criteria
- All 12 intake form fields are saved (`isComplete = true`).
- All mandatory intake documents are `verified`.
- All active conditional documents (determined by toggled flags) are `verified`.
- Admin has approved the intake pack (task 2A.6).

---

### Sub-Flow B: UKVI Application Form (8 Sections)

This mirrors the official UKVI online sponsor licence form. The caseworker completes this on behalf of the sponsor using the verified intake data, or assists the sponsor to complete it directly on the UKVI portal.

#### Section 1 — Licence Routes

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.1 | Select immigration routes | **Sponsor** | Choose one or more routes: Skilled Worker, Ministers of Religion, International Sportsperson, GBM (Senior/Specialist Worker, Graduate Trainee, UK Expansion Worker, Secondment Worker, Service Supplier), Student, Child Student, Religious Worker, Government Authorised Exchange, International Agreement, Creative Worker, Charity Worker, Seasonal Worker, Scale-up |
| 2B.2 | Declare existing SLN | **Sponsor** | If already on the register of sponsors, provide existing Sponsor Licence Number (SLN); otherwise confirm No |
| 2B.3 | Confirm eligibility for selected routes | **Caseworker** | Verify the sponsor meets eligibility requirements for each selected route (e.g., GAE requires named endorsement, GBM requires qualifying overseas link) |

#### Section 2 — Organisation Details

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.4 | Provide primary organisation details | **Sponsor** | Name, registered address, phone; head office/trading name if different |
| 2B.5 | Previous trading names & UK regions | **Sponsor** | List any name changes in the last 4 years (name, from, to dates); select UK regions where operating |
| 2B.6 | Organisation type & HMRC registrations | **Sponsor** | Employee count; migrant workers currently employed; sector; body type (single body, head office + branches, etc.); charity status; Companies House number; trading period; HMRC registration (NI/VAT); accounts office reference; PAYE reference(s) or exemption reason |
| 2B.7 | Accreditations & governing bodies | **Sponsor** | Stock exchange listing (LSE, FCA); mandatory and voluntary accreditations/registrations with governing bodies (name, number, expiry) |
| 2B.8 | Verify organisation profile | **Caseworker** | Cross-check Companies House number, PAYE reference, VAT number, trading period, and sector against HMRC/Companies House records |
| 2B.9 | QA organisation profile | **Admin** | Confirm the captured organisation profile is complete and accurate |

#### Section 3 — CoS and CAS Requirements

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.10 | State CoS requirements per route | **Sponsor** | For each selected worker route: number of CoS required in year 1; detailed justification (SOC code, role title, salary, genuine vacancy evidence, reason for need — business expansion / specialist skills / extension of existing migrant leave); if candidate identified: candidate name, nationality, current immigration status + expiry, proposed salary, sponsorship duration |
| 2B.11 | Validate SOC code & salary | **Caseworker** | Verify SOC code is correct for the role title; confirm salary meets or exceeds the going rate threshold and new entrant/experienced worker threshold for that SOC code; check sponsorship duration is appropriate |
| 2B.12 | Approve CoS allocation | **Admin** | Approve the requested CoS number and confirm justification is sufficient for UKVI scrutiny |

#### Section 4 — Supporting Documents

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.13 | Confirm document checklist selection | **Sponsor + Caseworker** | Based on routes and organisation type, select which Appendix A documents apply (Tables 1–4): specified organisations; mandatory docs for specific org types (charity, regulated, start-up, franchisee); route-specific mandatory docs (GAE endorsement, GBM overseas link, Skilled Worker job info, Sports governing body endorsement, etc.); other docs (PAYE, HMRC UTR, bank statements, employer liability, lease, invoices, alcohol licence, etc.) |
| 2B.14 | Confirm documents match verified intake pack | **Caseworker** | Confirm that documents uploaded in Sub-Flow A satisfy the Appendix A requirements for the selected routes. Flag any gaps that need additional uploads |
| 2B.15 | Sign off document pack | **Admin** | Approve the complete document pack as ready for submission |

#### Section 5 — Contact Details (Authorising Officer, Key Contact, Level 1 Users, Representative)

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.16 | Nominate Authorising Officer | **Sponsor** | Full name (title, first, last, previous names), employment address, phone, email, DOB, nationality, position within organisation, National Insurance number (or exemption reason). If AO is a non-settled worker under immigration control: immigration status, Home Office reference, leave expiry date, passport number |
| 2B.17 | Declare AO convictions | **Sponsor** | Declare whether the AO has: any relevant criminal convictions; fixed/civil penalties in the last 5 years (Appendix C offences); been an undischarged bankrupt or legally prevented from acting as a company director |
| 2B.18 | Nominate Key Contact | **Sponsor** | Confirm whether AO is also the Key Contact; if not, provide KC's full details (name, address, phone, email, DOB, position) |
| 2B.19 | Nominate Level 1 Users | **Sponsor** | At least one Level 1 User who is an employee, partner, or director. Additional L1 users must be: paid staff/office holder, employee of third-party HR provider, or UK-based representative. Can copy AO or KC details. Provide: title, full name, DOB, email |
| 2B.20 | Nominate representative (if applicable) | **Caseworker** | If the firm is acting as OISC-regulated representative: organisation name (Elite PiC Ltd), contact name, address, phone, email, UK-based confirmation, regulation status (OISC/exempt), OISC reference number (e.g. F201700001) |
| 2B.21 | Verify key personnel | **Caseworker** | Verify AO is UK-based, holds an NI number, has no disqualifying convictions; verify KC is UK-based; confirm L1 users meet eligibility; verify OISC registration is current |
| 2B.22 | Approve key personnel appointments | **Admin** | Approve the AO, KC, L1 user(s) and representative as nominated |

#### Section 6 — Declarations

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.23 | Representative declaration | **Caseworker** | Tick and date the representative declaration: appointed by the sponsor; application is true and correct to best of knowledge; understands Section 25 Immigration Act 1971 liability. Record name, representative organisation name, position |
| 2B.24 | Sponsor declaration | **Sponsor** | Sponsor confirms the application is accurate; authorises the representative to act on their behalf; understands ongoing sponsor duties |
| 2B.25 | Counter-sign declarations | **Admin** | Admin reviews and approves both signed declarations before payment is requested |

#### Section 7 — Payment

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.26 | Calculate and present fee | **System** | Calculate licence fee based on sponsor size (small/large) and highest applicable route category: Worker (£574 small / £1,579 large), Temporary (£574 both), Student (£574 both). Calculate Immigration Skills Charge estimate: £364/year (small) or £1,000/year (large) per CoS. Display total to sponsor |
| 2B.27 | Pay licence fee | **Sponsor** | Sponsor pays the application fee (online payment or confirms offline payment) |
| 2B.28 | Verify payment cleared | **Caseworker** | Confirm payment has cleared before proceeding to submission |
| 2B.29 | Record payment and issue receipt | **Admin** | Record payment reference, date, and amount; issue receipt to sponsor |

#### Section 8 — Submission

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 2B.30 | Generate submission sheet | **Caseworker** | Produce the UKVI submission sheet summarising all application data |
| 2B.31 | Final review before submission | **Admin** | Complete final QA of the full application pack |
| 2B.32 | Sponsor acknowledges submission | **Sponsor** | Sponsor confirms they have reviewed the application and authorise submission |

### Phase 2 Entry Criteria
- Phase 1 complete (`onboardingStatus = 'onboarded'`).
- A caseworker is assigned.

### Phase 2 Exit Criteria
- All 8 UKVI form sections complete and approved.
- Sub-Flow A intake pack fully verified.
- Payment confirmed cleared.
- Admin final review complete.
- `LicenceApplication.status = 'Pending'` (application submitted to internal review queue).

### Phase 2 Status Transitions

```
[Not Started]
      │  Caseworker assigned; sponsor begins intake
      ▼
  Draft                    ← Sponsor is saving wizard steps (auto-save)
      │  Sponsor submits completed application
      ▼
  Pending                  ← Enters review queue
```

### Phase 2 Approval Requirements

| Gate | Who approves | Condition |
|---|---|---|
| Sub-Flow A → Sub-Flow B | **Admin** | Intake form complete + all mandatory docs verified |
| Section 4 complete | **Admin** | Document pack signed off (2B.15) |
| Section 5 complete | **Admin** | Key personnel approved (2B.22) |
| Section 6 complete | **Admin** | Declarations counter-signed (2B.25) |
| Section 7 complete | **Admin** | Payment recorded (2B.29) |
| Submit application | **Sponsor + Admin** | Sponsor acknowledges (2B.32) + Admin final review (2B.31) |

---

## Phase 3 — Licence Review & Approval

### Purpose
Internal caseworker review of the submitted application, followed by the government processing pipeline (UKVI SMS registration, portal access, form completion, and submission to UKVI), culminating in a UKVI decision and licence activation.

### Tasks

#### Stage 3A — Internal Review

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 3A.1 | Triage application | **Admin** | Admin reviews submitted application, assigns or re-confirms caseworker, sets status → `Under Review` |
| 3A.2 | Full application review | **Caseworker** | Comprehensive review of all 8 sections; check for completeness and UKVI compliance |
| 3A.3 | Request additional information (if needed) | **Admin / Caseworker** | Set status → `Information Requested`; specify exactly what is missing; notify sponsor with clear instructions |
| 3A.4 | Sponsor responds to information request | **Sponsor** | Upload additional documents or provide clarifications; re-submit for review |
| 3A.5 | Complete internal review | **Caseworker** | Confirm application is complete and ready for government processing; mark caseworker review task complete |
| 3A.6 | Authorise progression to government pipeline | **Admin** | Admin approves move to Government Processing; set status → `Government Processing` |

#### Stage 3B — Government Processing Pipeline

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 3B.1 | Confirm sponsor information pack ready | **Caseworker** | Validate completeness of all data before portal entry; confirm nothing is missing for UKVI submission |
| 3B.2 | Register sponsor on UKVI SMS | **Caseworker** | Register the sponsor organisation on the UKVI Sponsorship Management System (SMS); record SMS portal username and SMS registration reference |
| 3B.3 | Confirm SMS registration | **Admin** | Verify SMS registration details; record the SMS registration reference number |
| 3B.4 | Sponsor confirms SMS portal access | **Sponsor** | Sponsor logs into the UKVI SMS using credentials provided; confirms they can access their account |
| 3B.5 | Generate UKVI portal credentials | **Caseworker** | Create UKVI online application portal user ID and password; record generation timestamp |
| 3B.6 | Deliver credentials to sponsor | **Caseworker** | Share portal credentials securely with sponsor; record transmission timestamp |
| 3B.7 | Sponsor confirms credentials receipt | **Sponsor** | Sponsor confirms receipt of UKVI portal credentials via the platform |
| 3B.8 | Complete government application forms | **Sponsor + Caseworker** | Sponsor logs into UKVI portal and completes the 8-section application form using the data gathered in Phase 2; caseworker reviews and verifies all form entries |
| 3B.9 | Final QA of government forms | **Admin** | Admin carries out final QA check of completed government forms before submission |
| 3B.10 | Submit application to UKVI | **Caseworker** | Submit the completed online application form to UKVI; record the government submission reference number and date |
| 3B.11 | Record submission | **Admin** | Record submission reference, date, and fee confirmation; set status → `Decision Pending` |
| 3B.12 | Sponsor acknowledges submission | **Sponsor** | Sponsor is notified and acknowledges that the application has been submitted to UKVI |

#### Stage 3C — Decision & Activation

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 3C.1 | Await UKVI decision | **All** | Application is with UKVI; caseworker coordinates any UKVI requests for further information |
| 3C.2 | Record UKVI decision | **Admin** | On receipt of UKVI decision: if Approved → set status → `Approved`, trigger licence activation; if Rejected → set status → `Rejected`, notify sponsor with reason |
| 3C.3 | Activate licence | **System** | Automatically on `Approved`: generate SLN (`SLN-{year}-{userId}`); set `licenceIssueDate = today`; set `licenceExpiryDate = today + 4 years`; set `SponsorProfile.licenceStatus = 'Active'`; set initial `cosAllocation` from intake form's `numberOfCosRequired` (or fallback to 5); notify sponsor and caseworkers |
| 3C.4 | Notify sponsor | **System** | Send in-app notification + transactional email: licence number, issue date, expiry date, initial CoS pool |
| 3C.5 | Sponsor receives licence | **Sponsor** | Sponsor views activated licence dashboard; can now access Phase 4 (CoS) and Phase 5 (Workers) |

### Phase 3 Entry Criteria
- Phase 2 complete (`LicenceApplication.status = 'Pending'`).
- Caseworker assigned to the application.

### Phase 3 Exit Criteria
- **Approved path:** `LicenceApplication.status = 'Approved'`; `SponsorProfile.licenceStatus = 'Active'`; SLN, issue date, and expiry date set.
- **Rejected path:** `LicenceApplication.status = 'Rejected'`; rejection reason recorded; sponsor notified.

### Phase 3 Status Transitions

```
Pending
  │  Admin assigns caseworker (3A.1)
  ▼
Under Review
  │  Admin/Caseworker requests more info (3A.3)          ┐
  ▼                                                      │
Information Requested                                    │
  │  Sponsor responds (3A.4)                             │
  ▼                                                      │
Under Review ◄─────────────────────────────────────────┘
  │  Caseworker completes review + Admin authorises (3A.5-3A.6)
  ▼
Government Processing
  │  Caseworker submits to UKVI + Admin records (3B.10-3B.11)
  ▼
Decision Pending
  │  UKVI approves            │  UKVI rejects
  ▼                           ▼
Approved (terminal +)     Rejected (terminal)
  │
  ▼ [Licence Activation triggered]
SponsorProfile.licenceStatus = Active
```

At any point before `Government Processing`, Admin or Caseworker can set `Rejected` if the application is irrecoverable.

### Phase 3 Approval Requirements

| Gate | Who approves | Condition |
|---|---|---|
| `Pending` → `Under Review` | **Admin** | Caseworker assigned |
| `Under Review` → `Government Processing` | **Admin** | Caseworker review complete (3A.5) |
| Forms QA | **Admin** | Final QA of government forms (3B.9) |
| `Government Processing` → `Decision Pending` | **Admin** | Submission recorded with reference (3B.11) |
| `Decision Pending` → `Approved` | **Admin** | UKVI decision received and verified |
| `Decision Pending` → `Rejected` | **Admin** | UKVI decision received and verified |

---

## Phase 4 — CoS Allocation

### Purpose
Once the licence is active, the sponsor can request Certificates of Sponsorship. This phase introduces a **dedicated CoS allocation model** (replacing the current misuse of `LicenceApplication` rows). Each CoS request has its own lifecycle, tracks usage against the approved pool, and is linked to a specific role and SOC code.

### Data Model (New)

A new `cos_allocations` table is required:

| Field | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | |
| `licence_application_id` | FK → licence_applications | Which licence this CoS belongs to |
| `sponsor_user_id` | FK → users | Sponsor who requested it |
| `organisation_id` | FK → organisations | Tenant scope |
| `status` | ENUM | `pending` → `under_review` → `approved` → `allocated` → `used` / `expired` / `revoked` |
| `soc_code` | STRING | Required SOC code |
| `role_title` | STRING | Job title |
| `number_requested` | INTEGER | How many CoS requested |
| `number_approved` | INTEGER | How many approved (may differ) |
| `number_used` | INTEGER | How many assigned to sponsored workers |
| `salary` | DECIMAL | Salary for the role |
| `salary_currency` | STRING | Default `GBP` |
| `sponsorship_duration_months` | INTEGER | Duration per worker |
| `justification` | TEXT | Reason for request |
| `candidate_identified` | BOOLEAN | Is a specific candidate identified? |
| `candidate_name` | STRING | If identified |
| `candidate_email` | STRING | If identified |
| `candidate_immigration_status` | STRING | If identified |
| `candidate_leave_expiry` | DATE | If identified |
| `assigned_caseworker_id` | JSONB | Array of reviewer user IDs |
| `approved_by_user_id` | FK → users | Who approved |
| `approved_at` | DATE | When approved |
| `rejected_reason` | TEXT | If rejected |
| `expiry_date` | DATE | When the CoS allocation expires |
| `deleted_at` | DATE | Soft-delete |

### Tasks

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 4.1 | Request CoS allocation | **Sponsor** | Complete CoS request form: SOC code, role title, salary, number of CoS, sponsorship duration, detailed justification; toggle if candidate is identified (provide candidate details) or not identified (provide advertisement evidence) |
| 4.2 | Gate check | **System** | Block request if `SponsorProfile.licenceStatus ≠ 'Active'`; return HTTP 403 with message "Your Sponsorship Licence is not active" |
| 4.3 | Review CoS request | **Caseworker** | Validate SOC code against role title; verify salary meets going rate + minimum threshold; check justification is genuine; validate candidate details if provided |
| 4.4 | Approve or reject CoS | **Admin** | Approve (set `number_approved`, status → `approved`) or reject (record reason, status → `rejected`); notify sponsor |
| 4.5 | Allocate CoS to worker | **System / Caseworker** | When a sponsored worker is added in Phase 5 and linked to this CoS: increment `number_used`, status → `allocated` (if all CoS in this batch are assigned) |
| 4.6 | Track expiry | **System** | Scheduled job (`licenceScheduled.service.js`): flag CoS approaching expiry (30 days); set status → `expired` on expiry date if not used; notify caseworker and sponsor |

### Phase 4 Entry Criteria
- `SponsorProfile.licenceStatus = 'Active'` — enforced by `requireActiveSponsorLicence` middleware on all CoS endpoints.
- `SponsorProfile.cosAllocation > 0` — initial pool set at licence activation.
- Sponsor has an active, non-expired licence (expiry date is in the future).

### Phase 4 Exit Criteria
- CoS allocation is `approved` and `number_approved > 0`.
- `SponsorProfile.cosAllocation` counter has been updated to reflect the new approved allocation.
- Sponsor can now create a sponsored worker linked to this CoS.

### Phase 4 Status Transitions

```
[Request submitted]
      │  Sponsor submits (4.1) — gate check passes (4.2)
      ▼
  pending
      │  Caseworker assigned and starts review (4.3)
      ▼
  under_review
      │  Admin approves (4.4)        │  Admin rejects (4.4)
      ▼                              ▼
  approved                       rejected (terminal)
      │  Worker linked to this CoS (Phase 5)
      ▼
  allocated
      │  Worker visa granted / CoS used    │  Unused + expired
      ▼                                    ▼
   used (terminal)                     expired (terminal)
      │  CoS revoked (compliance breach)
      ▼
  revoked (terminal)
```

### Phase 4 Approval Requirements
- **Caseworker** must review and validate SOC code and salary (task 4.3) before admin can approve.
- **Admin** approves or rejects the final CoS allocation (task 4.4).
- `number_approved` set by admin — may be less than `number_requested` if justification only supports a smaller number.

### CoS Pool Logic
- `SponsorProfile.cosAllocation` = total approved CoS available (decremented when a worker is added).
- `CosAllocation.number_used` tracks how many from each batch have been consumed.
- A sponsored worker cannot be created unless there is an `approved` CoS allocation with `number_used < number_approved`.

---

## Phase 5 — Sponsored Worker Management

### Purpose
Once a CoS is approved, the sponsor can add sponsored workers. Each worker creates a Candidate User record and a linked immigration Case that enters the standard 16-stage immigration workflow. All actions in this phase require an active licence and are gated on available CoS.

### Tasks

| # | Task | Assigned Role | Description |
|---|---|---|---|
| 5.1 | Add sponsored worker | **Sponsor** | Complete worker form: first/last name, email, nationality, DOB, job title, SOC code, salary, proposed start date, sponsorship end date. Select the approved CoS allocation to link this worker to |
| 5.2 | Gate check | **System** | Block if `SponsorProfile.licenceStatus ≠ 'Active'` (HTTP 403); block if no approved CoS with `number_used < number_approved` (HTTP 422 "No available CoS allocation") |
| 5.3 | Create candidate user | **System** | Create User (`role_id = 1`, candidate) + `CandidateApplication(sponsored: 'Yes')` |
| 5.4 | Create immigration case | **System** | Create `Case` linked to the candidate, the sponsor, and the selected `CosAllocation`; enter the 16-stage immigration workflow |
| 5.5 | Decrement CoS pool | **System** | Increment `CosAllocation.number_used`; decrement `SponsorProfile.cosAllocation` |
| 5.6 | Assign case to caseworker | **Admin** | Assign the immigration case to a caseworker (may be the same caseworker as the licence) |
| 5.7 | Follow 16-stage immigration workflow | **Caseworker + Candidate** | Standard case process: document collection, eligibility, visa application, decision, onboarding |
| 5.8 | Right-to-work checks | **Sponsor** | Conduct initial RTW check before worker starts; record check type, date, document reference |
| 5.9 | Report worker events | **Sponsor** | 10-working-day reporting duties: worker does not start, changes role, changes salary, stops working, is absent without permission |
| 5.10 | Submit change requests | **Sponsor** | 20-working-day reporting: changes to business details, change of AO/KC/L1, new premises |
| 5.11 | Ongoing compliance monitoring | **Caseworker + Admin** | Monitor compliance reports; flag breaches; trigger licence review if required |
| 5.12 | Licence renewal (within 90 days of expiry) | **Sponsor** | Sponsor initiates renewal from the licence dashboard; creates a new `LicenceApplication(type: 'Renewal', status: 'Pending')`; re-enters Phase 3 for renewal review |

### Phase 5 Entry Criteria
- `SponsorProfile.licenceStatus = 'Active'` — enforced by `requireActiveSponsorLicence` middleware (fixes P1).
- At least one `CosAllocation` with `status = 'approved'` AND `number_used < number_approved` (fixes P3).
- `SponsorProfile.licenceExpiryDate > today` — expired licence blocks new workers.

### Phase 5 Exit Criteria
There is no single exit for Phase 5 — it runs for the life of the licence. Individual worker cases exit when:
- Worker's visa is granted and they begin employment (case reaches stage 16).
- Worker's sponsorship ends (voluntary or involuntary).
- Licence is revoked or expires without renewal.

### Phase 5 Status Transitions

**Worker / Case Status:**
```
[Worker added]
      │  System creates candidate + case (5.3–5.5)
      ▼
  case_created
      │  Case assigned to caseworker (5.6)
      ▼
  under_review  ──► [16-stage immigration workflow] ──► visa_granted
                                                    └──► visa_refused
                                                    └──► withdrawn
```

**Licence Renewal:**
```
[SponsorProfile.licenceExpiryDate approaching]
  Within 90 days before expiry OR already expired
      │  Sponsor clicks "Request Renewal" (5.12)
      ▼
  New LicenceApplication(type: 'Renewal', status: 'Pending')
      │  Re-enters Phase 3 (Licence Review & Approval)
      ▼
  [Approved] → licenceExpiryDate extended by 4 years from current expiry base
```

### Phase 5 Approval Requirements

| Gate | Who approves | Condition |
|---|---|---|
| Add sponsored worker | **System gate** | Active licence + available CoS (no human approval for the gate itself) |
| Immigration case progression | **Caseworker + Admin** | Per the 16-stage immigration workflow |
| RTW check verification | **Caseworker** | Caseworker confirms RTW check is valid |
| Worker event report | **Caseworker** | Caseworker acknowledges and records event |
| Change request | **Admin** | Admin approves or rejects change request |
| Licence renewal | **Admin + Caseworker** | Full Phase 3 review again |

---

## Cross-Phase State Machine Summary

### LicenceApplication.status

```
Draft ──► Pending ──► Under Review ──► Information Requested ──► Under Review
                │                             └──────────────────────► Rejected
                ├──► Under Review ──► Government Processing ──► Decision Pending ──► Approved
                │                                          └──► Rejected           └──► Rejected
                ├──► Information Requested
                ├──► Approved (direct — rare, e.g. administrative fast-track)
                └──► Rejected
```

### SponsorProfile.licenceStatus

```
Pending ──► Active ──► Suspended ──► Active (reinstatement)
        └──► Expired (on licence expiry date, via scheduled job)
```

`Active` is the only status that grants access to Phase 4 and Phase 5.

### CosAllocation.status (new)

```
pending ──► under_review ──► approved ──► allocated ──► used
                         └──► rejected               └──► expired
                                                     └──► revoked
```

---

## Role × Phase Access Matrix

| Phase | Admin | Caseworker | Sponsor | Candidate |
|---|---|---|---|---|
| Phase 1: Onboarding | Creates account, confirms | — | Logs in, changes password, completes profile | — |
| Phase 2: Application | Approves at each gate | Guides + verifies, completes representative sections | Fills in all sponsor-side data, pays fee | Email only (if identified) |
| Phase 3: Review | Sets statuses, final approvals | Reviews, drives government pipeline | Responds to info requests, confirms receipt | — |
| Phase 4: CoS | Approves/rejects CoS | Reviews and validates | Requests CoS | Email notification (if candidate identified) |
| Phase 5: Workers | Approves change requests | Manages immigration case | Adds workers, reports events, RTW checks | Full portal access (immigration case) |

---

## Notification Rules

Every status transition and task completion must trigger a notification to the relevant roles. The actor is never notified about their own action.

| Event | Notify |
|---|---|
| Sponsor account created | Sponsor (email with credentials) + Admin (if email fails) |
| Application submitted | All Admins (in-app), Sponsor (confirmation email) |
| Caseworker assigned | Caseworker (in-app + email), Sponsor (in-app) |
| Information requested | Sponsor (in-app + email with specifics) |
| Sponsor responds | Caseworker (in-app + email), Admin (in-app) |
| Application approved / rejected | Sponsor (in-app + email), all Caseworkers (in-app) |
| Licence activated | Sponsor (in-app + email: SLN, dates, CoS pool), Caseworkers (in-app) |
| CoS approved | Sponsor (in-app + email), Candidate (email if identified) |
| Stage task completed | All assigned caseworkers + admin + sponsor (in-app + email); candidate (email only) |
| Worker event reported | Caseworker (in-app + email), Admin (in-app) |
| Licence approaching expiry (90 days) | Sponsor (in-app + email), Admin (in-app) |
| Licence expired | Sponsor (in-app + email), Admin (in-app); all active CoS gates blocked |

---

## Gaps Addressed by This Design

| Problem (from current-flow doc) | Design resolution |
|---|---|
| P1 — `requireActiveSponsorLicence` not applied | Phase 4 and Phase 5 entry criteria enforce this gate explicitly; middleware must be mounted on all CoS and worker routes |
| P2 — CoS reusing `licence_applications` table | Phase 4 introduces a dedicated `cos_allocations` model with its own lifecycle |
| P3 — Worker creation ignores `cosAllocation` | Phase 5 gate check: block if no approved CoS with remaining capacity; decrement pool on worker create (task 5.5) |
| P4 — Candidate is free-text, not a portal user | At Phase 4 (CoS), candidate is still a free-text contact for identification; at Phase 5, creating a sponsored worker creates a real Candidate portal User account |
| P5 — Stage definitions duplicated | This design does not duplicate stage definitions — the 18 backend stage keys remain the source of truth; a single `/api/licence/stage-definitions` endpoint should serve them to the frontend |
| P6 — No undo for task completion | Add `PATCH /{role}/licence/:id/stages/:stageKey/reopen` endpoint; restricted to Admin only |
| P7 — V1/V2 mixed in admin list | V1 applications should be clearly labelled in the admin list; all new applications are V2 only |
| P8 — No first-login password reset | Phase 1 task 1.3: enforce password change on first login via middleware redirect |
| P9 — Welcome email failures swallowed | Phase 1 task 1.2: surface email failures as a warning on the admin's sponsor detail page |
| P10 — Dormant SPONSOR_LIFECYCLE | This design replaces the dormant lifecycle with explicit phase gates; the `SPONSOR_LIFECYCLE` enum in `workflowEngine.service.js` can be retired or repurposed |

---

## Files That Will Need Changes (Implementation Reference)

> This section is a pointer for implementation. No code is changed in this document.

### Backend — New

| New file | Purpose |
|---|---|
| `models/tenant/cosAllocation.model.js` | Phase 4 dedicated CoS model |
| `migrations/tenants/YYYYMMDD-create-cos-allocations.sql` | Migration for above |
| `modules/Sponsor/Cos/sponsorCosAllocation.controller.js` | Replaces current `sponsorCos.controller.js` |
| `modules/Sponsor/Cos/sponsorCosAllocation.routes.js` | New routes for CoS lifecycle |
| `modules/Admin/Cos/adminCosAllocation.controller.js` | Admin CoS review and approval |
| `modules/Caseworker/Cos/caseworkerCosAllocation.controller.js` | Caseworker CoS validation |

### Backend — Modified

| Existing file | Change needed |
|---|---|
| `modules/Sponsor/index.js` | Mount `requireActiveSponsorLicence` on `/cos/*` and `/workers/*` routes |
| `modules/Sponsor/Workers/sponsorWorker.controller.js` | Gate on active licence + available CoS; decrement pool on worker create |
| `models/tenant/sponsorProfile.model.js` | Add `onboardingStatus` field |
| `modules/Auth/auth.controller.js` | Detect first login; redirect to password change |
| `modules/Admin/Sponsors/sponsors.controller.js` | Surface email delivery failure; record `emailDeliveryStatus` |
| `licenceStageTask.service.js` | Add reopen task function |
| `licenceStage.controller.js` | Add `reopenStageTask` handler (Admin only) |

### Frontend — New

| New file | Purpose |
|---|---|
| `pages/business/CosAllocationRequest.jsx` | Phase 4 CoS request form |
| `pages/admin/AdminCosAllocations.jsx` | Admin CoS approval list |
| `pages/caseworker/CaseworkerCosAllocations.jsx` | Caseworker CoS review |
| `services/cosAllocationApi.js` | API service for new CoS endpoints |

### Frontend — Modified

| Existing file | Change needed |
|---|---|
| `pages/business/CosPage.jsx` | Redirect to new `CosAllocationRequest` flow |
| `hooks/useSponsorLicence.js` | Show clear blocked state when licence not active |
| `pages/business/ApplyLicenceV2.jsx` | Add Section 5 steps: AO conviction declaration, KC, L1 users, representative |
| `routes/AppRouter.jsx` | Add first-login password change route; block other routes until password changed |
