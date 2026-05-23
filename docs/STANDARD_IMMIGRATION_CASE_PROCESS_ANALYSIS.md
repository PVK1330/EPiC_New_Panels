# EPiC — Standard Immigration Case Process

**Repos:** `EPiC_API` (backend) · `EPiC_Frontend` (frontend)  
**Source of truth:** `Standard Immigration Case Process.docx` (drive-download folder)  
**Code mirror:** `src/constants/immigrationCaseProcess.js` (keep API + frontend identical)

---

## 1. Executive summary

| Question | Answer |
|----------|--------|
| Can EPiC run this process? | **Yes** — 16 workflow steps are defined in code and match the docx 1:1. |
| Is it production-ready end-to-end? | **Partially** — pipeline, documents, DCS, CCL APIs, automation hooks, and candidate progress exist. **Admin enquiry intake** and a few **gates/UI polish** items remain. |
| Multi-tenant? | **Yes** — platform DB per deployment + **one PostgreSQL database per organisation** (`epic_{slug}`). All case APIs are tenant-scoped via `req.tenantDb`. |

**Design principle:** Keep **16 internal `caseStage` ids** for caseworker pipeline granularity. Show candidates a **simpler 9-phase journey** (grouped steps) so the UI feels like industry SaaS (Clio, Docketwise-style), not a 16-column spreadsheet.

---

## 2. Multi-tenant SaaS architecture (how a case lives)

```
┌─────────────────────────────────────────────────────────────────┐
│  SUPERADMIN (platform DB: epic / epic_dev)                       │
│  • Create organisation → provisions tenant DB epic_{slug}        │
│  • Plans, billing, global users (superadmin only)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  TENANT = one immigration firm (subdomain: {slug}.yourdomain.com) │
│  Platform registry: organisations, users, database_name          │
│  Tenant DB: cases, documents, workflow, messages, templates      │
└────────────────────────────┬────────────────────────────────────┘
                             │
     Admin / Caseworker / Candidate (JWT + organisation_id)
                             │
                    cases.caseStage (16 steps)
                    cases.status (legacy Kanban filter)
                    case_timeline (audit trail)
```

| Role | Primary surfaces | Tenant boundary |
|------|------------------|-----------------|
| **Superadmin** | Organisations, plans | Platform DB only |
| **Admin** | Cases, pipeline, assign, settings | One org’s tenant DB |
| **Caseworker** | Pipeline, case drawer, documents | Same tenant DB |
| **Candidate** | Enquiry, DCS, documents, CCL, status | Own case in same tenant DB |
| **Sponsor** | Workers (separate flow) | Same tenant DB |

---

## 3. The standard process (docx → code)

Official process = **16 numbered steps** in the Word doc. Each maps to `caseStage`:

| # | Business step | `caseStage` |
|---|---------------|-------------|
| 1 | Client enquiry | `client_enquiry` |
| 2 | Initial consultation | `initial_consultation` |
| 3 | Data capture + mandatory docs | `data_capture_initial_docs` |
| 4 | Application preparation | `application_preparation` |
| 5 | Document review | `document_review` |
| 6 | Further information | `further_information_request` |
| 7 | Draft review | `draft_application_review` |
| 8 | CCL issued | `ccl_issued` |
| 9 | CCL signed + payment | `ccl_payment_received` |
| 10 | Home Office submission | `application_submitted` |
| 11 | Biometrics booked | `biometrics_booked` |
| 12 | Biometrics confirmation sent | `biometrics_confirmation_sent` |
| 13 | Docs before biometrics | `documents_uploaded` |
| 14 | Awaiting decision | `awaiting_decision` |
| 15 | Decision communicated | `decision_communicated` |
| 16 | Case closure | `case_closure` |

**Never rename these ids** — pipeline columns, emails, and migrations depend on them.

---

## 4. Simple flow (industry SaaS view)

### 4.1 Candidate-facing: 9 phases

Use `PUBLIC_PHASES` (add to constants if not present) — map many internal stages to one label:

| Phase | What the candidate sees | Internal `caseStage` ids |
|-------|-------------------------|---------------------------|
| **1. Enquiry** | “We received your enquiry” | `client_enquiry` |
| **2. Consultation** | “Your caseworker is reviewing eligibility” | `initial_consultation` |
| **3. Onboarding** | “Complete your form & upload documents” | `data_capture_initial_docs` |
| **4. Preparation** | “We’re preparing your application” | `application_preparation`, `document_review`, `further_information_request` |
| **5. Draft review** | “Review your draft application” | `draft_application_review` |
| **6. CCL & payment** | “Review and sign your Client Care Letter” | `ccl_issued`, `ccl_payment_received` |
| **7. Submission** | “Submitted to the Home Office” | `application_submitted` |
| **8. Biometrics** | “Biometrics and supporting documents” | `biometrics_booked` … `documents_uploaded` |
| **9. Decision & closure** | “Decision and final documents” | `awaiting_decision` … `case_closure` |

`ApplicationStatus.jsx` and `CandidateDashboard.jsx` should always use `resolveCaseStage()` + `buildStepStates()` (16-step) or a thin wrapper that collapses to 9 phases for display only.

### 4.2 End-to-end swimlane (who does what)

```
CANDIDATE          ADMIN                    CASEWORKER              SYSTEM
─────────          ─────                    ──────────              ──────
Submit visa        See enquiry in           —                       caseStage =
enquiry (form)     pipeline OR              —                       client_enquiry
                   dedicated inbox
                   Assign caseworker ──────► Case appears in        → initial_consultation
                   (assign + stage)         pipeline
                                            Send DCS ─────────────► email (optional)
Fill DCS +         —                        Review response
upload docs                                 Advance stages
                                            Issue CCL ─────────────► email (optional)
Review/sign CCL    —                        Confirm payment
Pay fees           —                        Gate: CCL + paid
                                            Submit to HO ──────────► application_submitted
Attend biometrics  —                        Book + confirm email
Wait               —                        Monitor HO
Download decision  —                        Upload decision docs   Unlock downloads
```

**Single write path for stage changes:** `PATCH /api/cases/:id/stage` → `updatePipelineStage` → `applyCaseStageChange` (timeline + optional email).

---

## 5. What is already built (verified in repo)

| Capability | Location | Notes |
|------------|----------|-------|
| 16-step constants + guidance | `immigrationCaseProcess.js` | `STAGE_GUIDANCE`, `buildStepStates` |
| Pipeline Kanban | `Pipeline.jsx`, `AdminPipeline.jsx` | Live API |
| Stage update + legacy status sync | `case.controller.js` | `updatePipelineStage` |
| Stage automation (docs/payment events) | `caseStageAutomation.service.js` | Forward-only rules |
| Workflow emails on stage change | `workflowEmail.service.js` | Keys: `data_capture_request`, `ccl_issued`, `biometrics_confirmation`, etc. |
| Data capture (templates + submission) | `workflow.controller.js`, `DataCaptureSheet.jsx` | Tenant tables `data_capture_*` |
| CCL issue + status | `issueCcl`, `getCclStatus`, `CaseWorkflowActions` | Candidate confirms via upload flow |
| Candidate pending actions | `ApplicationStatus.jsx` | Links to DCS, documents |
| Case assignment API | `PATCH /api/cases/:id/assign` | Used by `AdminAssign.jsx` |
| Admin cases list (API) | `AdminCases.jsx` | Fetches `getCases()`; **still falls back to mock on error** |
| Superadmin org provisioning | `superadminOrganisation.controller.js` | Tenant DB per org |
| Timeline audit | `caseTimeline.service.js` | All stage changes logged |

---

## 6. Gaps to close (priority order)

| Priority | Gap | Why it matters | Suggested fix |
|----------|-----|----------------|---------------|
| **P0** | No **Admin Enquiry Inbox** (`client_enquiry` filter + assign in one action) | New leads are buried in full case list | `AdminEnquiryInbox.jsx` + sidebar badge; reuse `assignCase` + `updatePipelineStage` |
| **P0** | `AdminCases.jsx` fallback to `INITIAL_CASES` mock | Wrong data on API failure | Empty state + toast only; remove mock fallback |
| **P0** | Mock `CASE_WORKERS` array still in `AdminCases.jsx` | Stale assign dropdown | Use `getCaseworkers()` only |
| **P1** | **CCL gate** before `application_submitted` | Compliance risk | API guard in `updatePipelineStage`: require CCL signed + `amountStatus === 'paid'` |
| **P1** | **Final downloads** tied to stage | Candidate can’t get decision letter | `CandidateAccount.jsx`: unlock by `caseStage` + real document types |
| **P2** | Sponsor `caseStage: 'Initial'` | Invalid pipeline column | Migration + fix create paths → `client_enquiry` |
| **P2** | Email templates empty on new tenant | Automation silent | Seed tenant `email_templates` on org provision |
| **P3** | Stronger auto-advance rules | Less manual dragging | Extend `evaluateCaseStageAfterEvent` (DCS submitted → `application_preparation`, all docs approved → suggest next) |

---

## 7. Implementation roadmap (simple phases)

Work in this order. Each phase is independently shippable.

### Phase A — Intake (1–2 days)
- Admin Enquiry Inbox + assign → `initial_consultation`
- Remove mock data from `AdminCases.jsx`
- Enquiry count badge on admin nav

### Phase B — Compliance gates (1–2 days)
- Block `application_submitted` without CCL + payment
- Clear error messages in `CaseWorkflowActions` when advance fails
- Unlock decision/BRP downloads at `decision_communicated` / `case_closure`

### Phase C — Automation polish (1–2 days)
- Ensure tenant email templates seeded (5 workflow keys)
- On DCS submit: auto-advance + timeline (verify `saveDataCaptureSubmission`)
- Document checklist → suggest stage (use existing `evaluateCaseStageAfterEvent`)

### Phase D — UX consistency (1 day)
- Candidate 9-phase summary card on dashboard (wrapper over 16 steps)
- Admin: link enquiry inbox from dashboard widget
- Align `immigrationProcessMock.js` usage — reference only, not production data

**Total estimate:** ~5–8 developer-days for production-grade intake + gates (not 15–23 — much backend already exists).

---

## 8. Rules for all future work

1. **One stage API:** `updatePipelineStage(caseId, stageId)` — never bypass for workflow moves.
2. **Sync constants:** `EPiC_API` and `EPiC_Frontend` `immigrationCaseProcess.js` must match after any change.
3. **Emails are best-effort:** never fail a stage update because email failed.
4. **Every stage change → timeline entry** (audit / SOC2-friendly).
5. **Tenant isolation:** all case/document/workflow queries use `req.tenantDb`, not platform DB.
6. **No new UI libraries** — Tailwind, lucide-react, existing components.

---

## 9. Cursor / AI usage

When implementing a phase, attach only the files listed for that feature. Prefer **one phase per chat**. Start from section 6 priorities (P0 first).

**Key file map:**

| Area | Backend | Frontend |
|------|---------|----------|
| Stages | `Server/src/constants/immigrationCaseProcess.js` | `EPiC_Frontend/src/constants/immigrationCaseProcess.js` |
| Pipeline | `Server/src/modules/Admin/case.controller.js` | `pages/admin/AdminPipeline.jsx`, `pages/caseworker/Pipeline.jsx` |
| Workflow | `Server/src/modules/Shared/Workflow/` | `services/workflowApi.js`, `components/case/CaseWorkflowActions.jsx` |
| Candidate | `candidateApplication.controller.js` | `pages/candidate/ApplicationStatus.jsx`, `DataCaptureSheet.jsx` |
| Assign | `case.controller.js` (`assign`) | `pages/admin/AdminAssign.jsx`, `services/caseApi.js` |

---

## 10. Related assets

| Asset | Path |
|-------|------|
| Official docx (extracted) | `EPiC_Frontend/drive-download-20260515T072032Z-3-001/` |
| SaaS tenant audit | `Server/docs/SAAS_AUDIT_REPORT.md` |
| Mock reference (non-prod) | `EPiC_Frontend/src/data/immigrationProcessMock.js` |

---

*Last updated: May 2026 — reflects `EPiC_Frontend` + `EPiC_API` on branch `dev` after workflow/DCS/CCL additions.*
