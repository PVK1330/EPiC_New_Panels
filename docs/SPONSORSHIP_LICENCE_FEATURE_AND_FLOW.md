# Sponsorship Licence — Feature, Flow & Gap Analysis

**Scope:** The business/sponsor journey — admin creates a sponsor → sponsor logs in → applies for a sponsor licence → a caseworker processes it through a UK-style sponsorship process → licence granted → sponsor requests CoS/CAS and manages sponsored workers — across **Admin**, **Caseworker** and **Sponsor (Business)** portals.

**Status:** The subsystem is **largely built and wired to real APIs**. The gaps are mostly about *connecting* pieces that already exist (a defined-but-dormant sponsor lifecycle, missing licence gating, no CAS). This document describes the intended flow, maps it to the current code, and lists the work to fully realise the requested flow.

---

## 1. Roles & portals

| Role | `role_id` | Portal base | Purpose |
|---|---|---|---|
| Candidate | 1 | `/candidate` | Visa applicant (incl. sponsored workers) |
| Caseworker | 2 | `/caseworker` | Processes cases & licence applications |
| Admin | 3 | `/admin` | Creates sponsors, assigns caseworkers, approves licences |
| **Business / Sponsor** | **4** | **`/business`** | Applies for licence, requests CoS, manages workers |
| Superadmin | 5 | `/superadmin` | Platform/tenant administration |

`ROLES.BUSINESS === ROLES.SPONSOR === 4` — `Server/src/middlewares/role.middleware.js`.
Sponsor APIs are mounted at `/api/business/*` and gated by `verifyTokenAndTenant` + `checkRole([ROLES.BUSINESS])` — `Server/src/modules/Sponsor/index.js`.

---

## 2. Target end-to-end flow

```
ADMIN                         SPONSOR (Business portal)        CASEWORKER / ADMIN
─────                         ─────────────────────────        ──────────────────
Create sponsor  ──emails id+password──►  Log in
                                          │
                                          ▼
                                   Apply for sponsor licence
                                   (company, contacts, docs)
                                          │  status = Pending
                                          ▼
                                                            ◄── Assign caseworker (status → Under Review)
                                                                Review docs / Request information
                                                                Decision: Approve / Reject
                                          ┌───────────────────────┘
                                          ▼  status = Approved → SponsorProfile.licenceStatus = Active
                                   LICENCE GRANTED
                                          │
                          ┌───────────────┼───────────────────────────┐
                          ▼               ▼                           ▼
                   Request CoS     Request CAS (study)         Add sponsored worker
                   (allocation)    (not yet built)             → creates candidate + case
                          │               │                           │
                          ▼               ▼                           ▼
                   Admin/caseworker approves allocation        Worker case follows the
                                                               16-stage immigration workflow
                                          │
                                          ▼
                                   Ongoing compliance: right-to-work checks,
                                   worker events (10-day), change requests (20-day)
```

The **sponsor lifecycle** the product is aiming at is already encoded in the workflow engine (see §6) but is **not yet wired** to the licence application.

---

## 3. Architecture (what exists)

| Layer | Component |
|---|---|
| **Sponsor onboarding** | `Admin/Sponsors/sponsors.controller.js → createSponsor`; welcome email `services/tenantUserMail.service.js → sendTenantSponsorWelcomeEmail` + template `utils/emailTemplates.js → generateSponsorWelcomeTemplate` |
| **Auth** | Standard `POST /auth/login` (`modules/Auth/auth.controller.js`); JWT carries `role_id = 4` |
| **Sponsor profile** | `models/tenant/sponsorProfile.model.js` (companyName, sponsorLicenceNumber, **licenceStatus** `Active/Suspended/Expired/Pending`, licenceRating A/B, cosAllocation, sponsoredWorkers, …) |
| **Licence application** | `models/tenant/licenceApplication.model.js` (status `Pending/Approved/Rejected/Under Review/Information Requested`, `assignedcaseworkerId` JSONB, cosAllocation, documents) |
| **Sponsor module** | `modules/Sponsor/{Account, Dashboard, Licence (sponsorLicence + sponsorCos), Workers (sponsorWorker + workerEvent), Compliance, ChangeRequests, RightToWork}` |
| **Admin/caseworker review** | `Admin/Settings/licenceManagement.controller.js`; `Caseworker/caseworkerLicence.controller.js` |
| **Workflow engine** | `services/workflowEngine.service.js` — `WORKFLOW_TYPES = {CASE, LICENCE, COS, SPONSOR}` + transition matrices |
| **Frontend (business)** | `pages/business/{ApplyLicence, LicenceProcess, LicenceStatus, LicenceDocuments, CosPage, Cosregistration, SponsoredWorkerForm, SponsoredWorkerDetails}`; nav `components/business/BusinessSidebar.jsx`; services `licenceApi.js`, `sponsorApi.js`, `sponsoredWorkerApi.js`; route-gating `routes/ProtectedRoute.jsx` (`allowedRoles=['business']`) |

---

## 4. Current state vs requested flow

| Step (requested) | Status | Where / Notes |
|---|---|---|
| Admin creates sponsor | ✅ **Exists** | `POST /api/sponsors` → `createSponsor`. Creates User (`role_id=4`) + `SponsorProfile`. |
| Sponsor receives id + password by email | ✅ **Exists** | `sendTenantSponsorWelcomeEmail` sends email, login URL, and the (auto-generated or admin-set) password. |
| Sponsor logs into portal | ✅ **Exists** | `POST /auth/login`; gated `/business/*` routes. |
| Sponsor applies for licence | ✅ **Exists** | `POST /api/business/licence/apply` → `submitLicenceApplication` (status `Pending`, notifies admins). Frontend `ApplyLicence.jsx` (4-step form, real API). |
| Application assigned to a caseworker | ⚠️ **Partial** | Admin `assignCaseworker` sets `LicenceApplication.assignedcaseworkerId` + status `Under Review`. **It does not create/assign a `Case`** — the licence application is its own record, not part of the 16-stage case workflow. |
| Follows the UK sponsorship process (stages) | ⚠️ **Partial / dormant** | Licence apps only use the **5-state** `LICENCE` flow. A richer `SPONSOR_LIFECYCLE` (§6) is **defined but never used**. The 16-stage immigration workflow applies to **worker/visa cases**, not to the licence application. |
| Licence granted | ✅ **Exists** | Status → `Approved`; updates `SponsorProfile.cosAllocation`. *(See gap G3: `licenceStatus` should be flipped to `Active` here.)* |
| After licence → request CoS | ✅ **Exists (ungated)** | `POST /api/business/cos/request` → `requestCosAllocation` creates a `LicenceApplication(type:'Renewal', status:'Pending')`. Admin/caseworker approves. **Not gated on having an approved licence.** |
| After licence → request CAS | ❌ **Missing** | No CAS request/allocation feature. "CAS" exists only as a *document checklist item* for Student/Graduate visas (`constants/visaDocumentChecklists.js`). |
| Manage sponsored workers | ✅ **Exists (ungated)** | `POST /api/business/workers` → `addSponsoredWorker` creates a User (candidate) + `CandidateApplication(sponsored:'Yes')` + a **Case** (enters the immigration workflow). Plus worker events, right-to-work, change requests, compliance docs. |

---

## 5. Licence & CoS processing (as built today)

**Licence application states** (`workflowEngine.service.js → LICENCE_TRANSITIONS`):
```
Pending ──► Information Requested ──► Pending
   │              └──► Rejected
   ├──► Approved ──► Expired
   └──► Rejected
```
- Admin actions (`licenceManagement.controller.js`): `assignCaseworker` (→ Under Review), `updateLicenceApplicationStatus` (Approved/Rejected), `requestAdditionalInformation` (Information Requested).
- Caseworker actions (`caseworkerLicence.controller.js`): `updateLicenceReviewStatus` (review / approve / request info).
- Transition guard: `validateTransition(WORKFLOW_TYPES.LICENCE, …)` — `sponsorLicence.controller.js:171`.

**CoS requests** are stored by **reusing** the `LicenceApplication` table (`type:'Renewal'`), not a dedicated CoS model — `sponsorCos.controller.js → requestCosAllocation`.

---

## 6. The dormant sponsor lifecycle (already in code, not wired)

`workflowEngine.service.js` defines two matrices that **nothing currently calls** (`WORKFLOW_TYPES.SPONSOR` and `.COS` never appear in a `validateTransition`/`findTransitionPath` call):

```
SPONSOR_LIFECYCLE:
  Registered → Verified → Profile Created → Licence Required →
  Application Started → Documents Pending → Documents Submitted →
  Under Review → Approved → Active Sponsor

COS_REQUEST:
  Pending → Under Review → Approved → Allocated → {Used | Expired | Revoked}
```

These are **exactly the UK-sponsorship-style stage models the requested flow needs.** Realising the flow is largely a matter of *wiring these in* (storing the state and driving transitions), rather than designing them from scratch.

---

## 7. Gaps & recommendations (to fully realise the requested flow)

### 🔴 High — needed for the flow as described
1. **Gate CoS/CAS and worker sponsorship on an approved/active licence.** Today `requestCosAllocation` and `addSponsoredWorker` run for any `role_id=4` user regardless of `SponsorProfile.licenceStatus`. Add a guard (middleware or per-controller check) that requires `licenceStatus = Active` (or an `Approved` licence application) before CoS/CAS/worker actions. *Files: `sponsorCos.controller.js`, `sponsorWorker.controller.js`, `Sponsor/index.js`.*
2. **Flip `SponsorProfile.licenceStatus` to `Active` on licence approval.** Approval currently updates `cosAllocation` but the profile's `licenceStatus` (the field gating #1 and shown in the UI) isn't set to `Active`/`licenceIssueDate`/`licenceExpiryDate`. *File: `licenceManagement.controller.js` (and caseworker equivalent).*
3. **Add CAS (Confirmation of Acceptance for Studies).** Only CoS exists. Decide scope: most worker sponsors need only CoS; CAS applies to *student* sponsors (education providers). If in scope, mirror the CoS request/allocation flow for CAS (new request type + allocation tracking). If out of scope, document that explicitly so the UI doesn't promise it.

### 🟡 Medium — process fidelity
4. **Drive the licence application through the real `SPONSOR_LIFECYCLE`** (§6) instead of the flat 5-state `LICENCE` flow, so the sponsor and caseworker see meaningful stages (Documents Pending → Submitted → Under Review → Approved → Active Sponsor). Store the lifecycle state (new column) and transition via `validateTransition(WORKFLOW_TYPES.SPONSOR, …)`. This is what makes it "follow the UK sponsorship process."
5. **Decide the licence ↔ Case relationship.** The request says "this case will be assigned to a caseworker." Today caseworker assignment lives on `LicenceApplication.assignedcaseworkerId` (works), but it is **not** a `Case`, so it doesn't appear in the case pipeline, timeline, notes, or payments. Either (a) treat the licence application as a first-class "case" in its own pipeline (recommended — the assignment already exists), or (b) create a linked `Case` of a "Sponsor Licence" category on apply. Pick one and make assignment/notifications consistent.
6. **Give CoS its own model/lifecycle.** Overloading `LicenceApplication(type:'Renewal')` for CoS requests is fragile (mixes licence apps and CoS allocations in one table/list). Introduce a dedicated CoS allocation record and use the already-defined `COS_REQUEST` transitions.

### 🟢 Low — hardening / polish
7. **Force password change on first sponsor login.** Sponsor is created `is_email_verified/is_otp_verified = true` with a permanent generated password; no first-login reset is enforced (`createSponsor`).
8. **Surface email-send failures on sponsor creation.** The welcome-email send is best-effort (errors swallowed); admins aren't told if credentials didn't reach the sponsor.
9. **Worker onboarding vs CoS allocation.** `addSponsoredWorker` doesn't decrement/check `cosAllocation`; a sponsor can add more workers than allocated CoS. Tie worker creation to an available CoS.

---

## 8. Key files

**Backend (`Server/src`)**
- Onboarding: `modules/Admin/Sponsors/sponsors.controller.js`, `services/tenantUserMail.service.js`, `utils/emailTemplates.js`
- Auth/roles: `modules/Auth/auth.controller.js`, `middlewares/role.middleware.js`
- Models: `models/tenant/{sponsorProfile, licenceApplication, sponsorChangeRequest, sponsorUserPreference, rightToWorkRecord}.model.js`
- Sponsor module: `modules/Sponsor/{index.js, Account, Dashboard, Licence/sponsorLicence.controller.js, Licence/sponsorCos.controller.js, Workers/sponsorWorker.controller.js, Workers/workerEvent.controller.js, Compliance, ChangeRequests, RightToWork}`
- Admin/caseworker: `modules/Admin/Settings/licenceManagement.controller.js`, `modules/Caseworker/caseworkerLicence.controller.js`
- Workflow: `services/workflowEngine.service.js`, `services/caseStageAutomation.service.js`, `constants/immigrationCaseProcess.js`
- Migrations: `migrations/tenants/2026042812…-create-licence-applications.sql`, `…-create-sponsor-change-requests.sql`, `…-create-sponsor-preferences-and-worker-events.sql`

**Frontend (`EPiC_Frontend/src`)**
- Pages: `pages/business/{ApplyLicence, LicenceProcess, LicenceStatus, LicenceDocuments, CosPage, Cosregistration, SponsoredWorkerForm, SponsoredWorkerDetails}.jsx`; `pages/admin/AdminLicenceApplications.jsx`; `pages/caseworker/CaseworkerLicenceApplications.jsx`
- Nav/routing: `components/business/BusinessSidebar.jsx`, `routes/AppRouter.jsx`, `routes/ProtectedRoute.jsx`
- Services: `services/licenceApi.js`, `services/sponsorApi.js`, `services/sponsoredWorkerApi.js`, `hooks/useSponsor.js`

---

## 9. Summary

The requested journey is **~80% present and working against real APIs**: admin-creates-sponsor (with emailed credentials), login, licence application, caseworker assignment + review/approve, CoS requests, and full sponsored-worker management with compliance tooling. To make it match the description end-to-end, the focused work is:
1. **Gate** CoS/CAS/worker actions on an **active licence** (G1) and set `licenceStatus = Active` on approval (G2).
2. **Add CAS** or scope it out explicitly (G3).
3. **Wire the dormant `SPONSOR_LIFECYCLE`** so the licence application moves through real UK-sponsorship stages, and decide the licence↔Case relationship (G4–G5).
