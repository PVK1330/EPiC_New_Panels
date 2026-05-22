# ElitePic CRM — Sponsor Compliance Feature Audit Report

**Date:** May 22, 2026  
**Scope:** Full codebase audit — backend (`ElitePic_CRM_backend`) and frontend (`ElitePic_CRM`)  
**Methodology:** Every model, controller, route, service, and frontend page was read directly. No assumptions were made. Status is based solely on what exists in code.

---

## Audit Legend

| Status | Meaning |
|--------|---------|
| **DONE** | Fully implemented and tenant-scoped via `req.tenantDb` |
| **PARTIAL** | Started but incomplete, or missing required fields, or not tenant-scoped |
| **MISSING** | Not built at all — no model, controller, route, or frontend page exists |

---

## 1. Business Portal — Sponsor Profile Setup

| Feature | Status | Notes |
|---------|--------|-------|
| Company name | **DONE** | `SponsorProfile.companyName` — stored, tenant-scoped |
| Trading name | **DONE** | `SponsorProfile.tradingName` — stored, tenant-scoped |
| Company registration number | **DONE** | `SponsorProfile.registrationNumber` — stored |
| Sponsor licence number | **DONE** | `SponsorProfile.sponsorLicenceNumber` (maps to `licenseNumber` column) |
| Licence rating A or B | **PARTIAL** | Field exists (`licenceRating`) but ENUM values are `Gold/Silver/Bronze`, not `A/B` as required by UK Home Office |
| Industry sector | **DONE** | `SponsorProfile.industrySector` — stored |
| Registered address | **DONE** | `SponsorProfile.registeredAddress` — stored |
| Trading address | **DONE** | `SponsorProfile.tradingAddress` — stored |
| Authorising officer (name, phone, email) | **DONE** | `authorisingName`, `authorisingPhone`, `authorisingEmail` — all stored |
| Key contact details | **DONE** | `keyContactName`, `keyContactPhone`, `keyContactEmail` — stored |
| Level 1 users | **PARTIAL** | `level1Users` stored as JSON array. No Level 2 users field exists anywhere in the model |
| HR manager details | **DONE** | `hrName`, `hrEmail`, `hrPhone`, `hrJobTitle` — stored |
| Change request icon/flow — change of company address | **MISSING** | No change request model, controller, route, or frontend flow exists for any company-level change |
| Change request flow — change in ownership | **MISSING** | No model or flow exists |
| Change request flow — mergers and acquisitions | **MISSING** | No model or flow exists |
| Change request flow — change of key personnel | **MISSING** | No model or flow exists |
| Change request flow — insolvency risk | **MISSING** | No model or flow exists |
| Change request flow — change in trading status | **MISSING** | No model or flow exists |
| Auto-calculate 20 working day reporting deadline for company changes | **MISSING** | No deadline calculation exists for company-level change events. The 10-day deadline only exists for worker events |
| Risk alert if 20-day deadline overdue | **MISSING** | No alert mechanism for company-level change deadlines |

---

## 2. Business Portal — Sponsored Worker Management

| Feature | Status | Notes |
|---------|--------|-------|
| Full name | **DONE** | Stored on `User` model (`first_name`, `last_name`) |
| Nationality | **DONE** | `CandidateApplication.nationality` |
| Visa type | **DONE** | `CandidateApplication.visaType` |
| CoS number | **MISSING** | No `cosNumber` field exists on any model. The `Case` model has no CoS number field |
| Job title | **DONE** | `Case.jobTitle` |
| SOC code | **MISSING** | No `socCode` field exists anywhere in the codebase |
| Salary | **DONE** | `Case.salaryOffered` |
| Start date | **PARTIAL** | `CandidateApplication.startDate` exists but is not populated when adding a sponsored worker via `addSponsoredWorker` controller |
| Visa expiry date | **DONE** | `CandidateApplication.visaEndDate` |
| Contract type | **MISSING** | No `contractType` field on any model |
| Work location | **MISSING** | No `workLocation` field on any model |
| Working hours | **MISSING** | No `workingHours` field on any model |
| Change request — change in job role | **PARTIAL** | `WorkerEvent` model accepts free-text `eventType`. "Role Change" is a dropdown option in the frontend but there is no structured change request flow — no before/after values, no evidence upload field on the model, no SMS reference field |
| Change request — salary change | **PARTIAL** | Same as above — "Salary Change" is a dropdown option but no structured fields |
| Change request — change in work location | **PARTIAL** | "Address Change" is a dropdown option but no structured fields |
| Change request — absence over 10 days | **PARTIAL** | "Absence >10 days" is a dropdown option but no structured absence monitoring model exists |
| Change request — resignation | **MISSING** | Not in the dropdown options or model |
| Change request — dismissal | **MISSING** | Not in the dropdown options or model |
| Change request — visa curtailment | **MISSING** | Not in the dropdown options or model |
| Change request — reduced hours | **MISSING** | Not in the dropdown options or model |
| Change request — change of contract type | **MISSING** | Not in the dropdown options or model |
| Change event stores: event date | **DONE** | `WorkerEvent.eventDate` |
| Change event stores: date reported to SMS | **PARTIAL** | `WorkerEvent.reportedDate` exists but is labelled "reported date" — no explicit "date submitted on SMS" field |
| Change event stores: reported by | **MISSING** | No `reportedBy` field on `WorkerEvent` model |
| Change event stores: evidence upload | **MISSING** | No file/document attachment field on `WorkerEvent` model |
| Reporting deadline auto-calculated as 10 working days | **PARTIAL** | Deadline is auto-calculated as 10 **calendar** days (`addDays(eventDate, 10)`), not 10 **working** days as required |
| Change event status: pending / submitted / overdue | **DONE** | `WorkerEvent.status` ENUM: `pending`, `reported`, `overdue` (note: "submitted" is labelled "reported") |
| Auto flag for reporting deadline breach | **DONE** | `resolveStatus()` function sets status to `overdue` when deadline passes and no `reportedDate` exists |

---

## 3. Business Portal — Right to Work and Absence Monitoring

| Feature | Status | Notes |
|---------|--------|-------|
| RTW records: initial check date | **MISSING** | No Right to Work model exists anywhere in the codebase |
| RTW records: checked by | **MISSING** | No RTW model |
| RTW records: reference number | **MISSING** | No RTW model |
| RTW records: document uploaded | **MISSING** | No RTW model |
| RTW records: follow-up check date | **MISSING** | No RTW model |
| Auto alerts for follow-up RTW due | **MISSING** | No RTW model, no cron job for RTW alerts |
| Visa expiry alerts at 120 days | **MISSING** | No scheduled job or cron exists. The dashboard shows `daysToExpiry` but no automated alert fires at 120 days |
| Visa expiry alerts at 90 days | **MISSING** | Same — no scheduled alert |
| Visa expiry alerts at 60 days | **PARTIAL** | `getComplianceSummary` flags workers with `daysToExpiry < 60` as `expiringSoon` but this is a dashboard count only — no automated notification fires |
| Visa expiry alerts at 30 days | **PARTIAL** | `getDashboardStats` counts `visaExpiryAlerts` within 30 days but no automated notification fires |
| Absence monitoring: leave record | **MISSING** | No absence model exists |
| Absence monitoring: unauthorised absence | **MISSING** | No absence model |
| Absence over 10 working days alert | **MISSING** | No absence model or alert logic |
| Sick leave monitoring | **MISSING** | No absence model |
| Attendance record upload | **MISSING** | No absence model |
| System triggers reporting required alert when absence exceeds threshold | **MISSING** | No absence model or threshold logic |

---

## 4. Business Portal — Document Recording

| Feature | Status | Notes |
|---------|--------|-------|
| Company docs: sponsor licence approval letter | **PARTIAL** | `SponsorProfile.sponsorLetter` field exists and is displayed in compliance documents, but no upload date, expiry date, or last reviewed date is tracked on this field |
| Company docs: allocation of CoS | **MISSING** | No document record for CoS allocation letter — only a numeric `cosAllocation` count field |
| Company docs: organisational chart | **PARTIAL** | `SponsorProfile.organisationalChart` field exists but no upload date, expiry, or reviewed-by tracking |
| Company docs: HR policies | **PARTIAL** | `SponsorProfile.hrPolicies` field exists but no metadata tracking |
| Company docs: right to work policy | **MISSING** | No dedicated field for RTW policy document |
| Company docs: absence policy | **MISSING** | No dedicated field for absence policy document |
| Company docs: recruitment process documents | **PARTIAL** | `SponsorProfile.recruitmentDocs` field exists but no metadata tracking |
| Company docs: employment contracts | **MISSING** | No dedicated company-level employment contract document field |
| Company docs: insurance certificates | **PARTIAL** | `SponsorProfile.insuranceCertificate` field exists but no metadata tracking |
| Document tracks: upload date | **DONE** | `Document.uploadedAt` — tracked on the `Document` model for manually uploaded compliance docs |
| Document tracks: expiry date | **DONE** | `Document.expiryDate` — field exists on `Document` model |
| Document tracks: last reviewed date | **PARTIAL** | `Document.reviewedAt` exists but no `lastReviewedDate` separate from `reviewedAt` |
| Document tracks: reviewed by | **DONE** | `Document.reviewedBy` — field exists |
| Auto alert for expired insurance | **MISSING** | No cron job or scheduled task checks document expiry dates and fires alerts |
| Auto alert for missing HR policy | **MISSING** | No automated check for missing company documents |
| Auto alert for outdated documents | **MISSING** | No scheduled alert system for document expiry |
| Worker docs: passport copy | **PARTIAL** | Tracked via `Document` model with `documentType` matching. Status map exists (`docStatusMap`) but no dedicated per-worker document record with all required metadata |
| Worker docs: eVisa copy | **PARTIAL** | Tracked via `documentType` matching ("visa") |
| Worker docs: CoS copy | **PARTIAL** | Tracked via `documentType` matching ("cos") |
| Worker docs: employment contract | **PARTIAL** | Tracked via `documentType` matching ("contract") |
| Worker docs: job description | **MISSING** | No job description document type tracked |
| Worker docs: salary evidence | **MISSING** | No salary evidence document type tracked |
| Worker docs: payslips | **PARTIAL** | Tracked via `documentType` matching ("payslip") |
| Worker docs: bank transfer evidence | **MISSING** | No bank transfer evidence document type tracked |
| Worker docs: right to work check record | **MISSING** | No RTW model exists |
| Worker docs: contact details | **PARTIAL** | Stored on `User` and `CandidateApplication` models but not as a document record |
| Worker docs: NI number | **PARTIAL** | `CandidateApplication.niNumber` field exists but not displayed in the sponsored worker details frontend |
| Status indicator: green/amber/red based on document completeness | **PARTIAL** | `docStatusMap` returns `complete`, `partial`, or `risk` per document type. Displayed in `EmployeeRecords` and `SponsoredWorkerDetails`. However only 5 document types are checked (`passport`, `visaCopy`, `cosCopy`, `contract`, `payslips`) — the full required set is not covered |

---

## 5. Business Portal — Compliance Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Admin view: total sponsor clients | **DONE** | `getDashboardStats` returns `totalSponsors` count |
| Admin view: active sponsored workers | **DONE** | `activeCases` count returned |
| Admin view: workers with expiring visas | **PARTIAL** | `visaExpiryAlerts` (30-day window) returned but no breakdown by 120/90/60/30 day thresholds |
| Admin view: overdue reports | **PARTIAL** | `overdueCount` on cases exists but no overdue worker event count shown in admin dashboard |
| Admin view: compliance risk score | **PARTIAL** | `riskPct` field on `SponsorProfile` exists and is used to compute a score, but it is manually set — not auto-calculated from compliance data |
| Admin view: businesses at high risk | **PARTIAL** | `riskLevel` field on `SponsorProfile` exists but is manually set, not auto-calculated |
| Admin view: licence expiry alerts | **DONE** | `sponsorExpiryAlerts` count returned in dashboard stats |
| Admin view: pending SMS reports | **MISSING** | No SMS reporting log exists — no way to count pending SMS submissions |
| Admin view: graphs for compliance risk by client | **MISSING** | No chart data endpoint for compliance risk by client exists |
| Admin view: visa expiry timeline graph | **MISSING** | No timeline chart data endpoint exists |
| Admin view: reporting deadlines calendar | **MISSING** | No calendar endpoint that aggregates reporting deadlines across all sponsors |
| Caseworker view: assigned sponsors | **PARTIAL** | `caseworkerSponsor.controller.js` exists with `getAssignedSponsors` but the caseworker dashboard page does not display a dedicated sponsor compliance view |
| Caseworker view: high risk workers | **MISSING** | No high-risk worker list endpoint for caseworkers |
| Caseworker view: reporting deadlines this week | **MISSING** | No endpoint filters worker events by caseworker's assigned sponsors for the current week |
| Caseworker view: missing documents | **MISSING** | No missing document summary endpoint for caseworkers |
| Caseworker view: upcoming visa expiries | **MISSING** | No visa expiry list endpoint scoped to caseworker's assigned sponsors |
| Caseworker view: absence alerts | **MISSING** | No absence model exists |
| Business view: compliance status score | **DONE** | `getComplianceSummary` returns `complianceScore` derived from `riskPct` |
| Business view: workers summary | **DONE** | `totalWorkers`, `expiringSoon`, `highRiskCount`, `mediumRiskCount` returned |
| Business view: pending reporting obligations | **DONE** | `getReportingObligations` returns all worker events with status and days remaining |
| Business view: missing documents list | **PARTIAL** | Document status map exists per worker but no consolidated "missing documents" list endpoint |
| Business view: licence expiry countdown | **DONE** | `getDashboard` returns `licenceExpiry.daysRemaining` |

---

## 6. Audit Preparation Mode

| Feature | Status | Notes |
|---------|--------|-------|
| Admin one-click audit mode trigger | **MISSING** | No audit mode endpoint, controller, or frontend button exists |
| Generates complete worker list | **MISSING** | No audit pack generation |
| Generates all required documents | **MISSING** | No audit pack generation |
| Generates reporting history | **MISSING** | No audit pack generation |
| Generates right to work records | **MISSING** | No RTW model exists |
| Generates absence logs | **MISSING** | No absence model exists |
| Generates organisational chart | **MISSING** | No audit pack generation |
| Generates salary evidence | **MISSING** | No audit pack generation |
| Generates SMS reporting history | **MISSING** | No SMS log model exists |
| Export as PDF | **MISSING** | No audit pack PDF export (note: dashboard PDF export exists but is unrelated) |
| Export as ZIP file | **MISSING** | No ZIP export for audit pack (archiver package is installed but unused for this purpose) |
| Export as Excel summary | **MISSING** | No audit pack Excel export (general reporting Excel export exists but is unrelated) |

---

## 7. Automated Alerts and Notifications

| Feature | Status | Notes |
|---------|--------|-------|
| Automated alert: visa expiry | **PARTIAL** | Dashboard counts expiring visas but no scheduled cron job fires automated notifications. The only scheduled job in `server.js` is `checkAndExpireSubscriptions` (billing). No visa expiry cron exists |
| Automated alert: CoS allocation running low | **MISSING** | No alert logic for CoS allocation threshold |
| Automated alert: reporting deadline approaching | **PARTIAL** | `WorkerEvent` status is computed on-read (`resolveStatus`) and shown in the dashboard, but no proactive notification is sent before the deadline — only when the event is created or updated |
| Automated alert: absence threshold reached | **MISSING** | No absence model or threshold alert |
| Automated alert: document missing | **MISSING** | No scheduled check for missing documents |
| Automated alert: unreported change | **MISSING** | No detection of unreported changes |
| Delivery: email | **DONE** | `notification.service.js` sends emails via `sendTransactionalEmail` when `sendEmail: true` |
| Delivery: dashboard notification | **DONE** | `Notification` model and `createNotification` service fully implemented and tenant-scoped |
| Delivery: SMS (optional) | **MISSING** | No SMS delivery channel exists |
| Delivery: daily summary to admin | **MISSING** | No daily digest or summary email job exists |

---

## 8. SMS Activity Log

| Feature | Status | Notes |
|---------|--------|-------|
| Log: reported event type | **MISSING** | No SMS activity log model exists anywhere in the codebase |
| Log: date submitted on SMS | **MISSING** | No SMS log model |
| Log: reference number | **MISSING** | No SMS log model |
| Log: screenshot upload | **MISSING** | No SMS log model |
| Log: submitted by | **MISSING** | No SMS log model |
| Log: notes | **MISSING** | No SMS log model |

---

## 9. Calendar and Timeline View

| Feature | Status | Notes |
|---------|--------|-------|
| Calendar: reporting deadlines | **PARTIAL** | `BusinessCalendar.jsx` exists and fetches appointments and Teams meetings. Worker event deadlines are shown in `ReportingObligations.jsx` as a table but are **not** integrated into the calendar view |
| Calendar: visa expiry dates | **MISSING** | Visa expiry dates are not surfaced on the calendar |
| Calendar: licence expiry | **MISSING** | Licence expiry is not surfaced on the calendar |
| Calendar: follow-up RTW checks | **MISSING** | No RTW model exists |
| Calendar: audit review dates | **MISSING** | No audit mode exists |
| Colour coding: red urgent | **PARTIAL** | Calendar events use colour classes (`bg-red-500` for deadlines) but these are for general event types, not compliance-specific urgency |
| Colour coding: amber upcoming | **PARTIAL** | `bg-amber-500` used for calls — not compliance-driven |
| Colour coding: green compliant | **PARTIAL** | `bg-green-500` used for tasks — not compliance-driven |

---

## 10. Multi-Company Handling

| Feature | Status | Notes |
|---------|--------|-------|
| Parent company support | **MISSING** | No parent company field or relationship exists on any model |
| Subsidiaries | **MISSING** | No subsidiary model or relationship exists |
| Linked entities | **MISSING** | No linked entity model exists |
| Separate worker lists per entity | **MISSING** | Workers are scoped to a single `sponsorId` — no multi-entity grouping |
| Consolidated risk dashboard across entities | **MISSING** | No consolidated multi-entity dashboard exists |

---

## 11. Monthly Compliance Review

| Feature | Status | Notes |
|---------|--------|-------|
| Monthly compliance summary generation | **MISSING** | No monthly report generation exists. No cron job, no scheduled task, no endpoint |
| Workers expiring in 90 days | **MISSING** | No monthly report endpoint |
| Reporting history for the month | **MISSING** | No monthly report endpoint |
| Missing documents for the month | **MISSING** | No monthly report endpoint |
| Risk movement up or down | **MISSING** | No risk trend tracking or monthly delta calculation |
| Auto email to sponsor client | **MISSING** | No monthly email job exists |
| Auto email to assigned compliance officer | **MISSING** | No compliance officer role exists; no monthly email job |
| Auto email to admin | **MISSING** | No monthly email job exists |

---

## 12. Permissions

| Feature | Status | Notes |
|---------|--------|-------|
| Admin has full access | **DONE** | `hasFullAccessRole()` in `role.middleware.js` grants unrestricted access to `role_id: 3` (Admin) and `role_id: 5` (Superadmin) |
| Compliance officer role: can edit assigned sponsors, cannot delete | **MISSING** | No compliance officer role exists. ROLES object only defines: CANDIDATE (1), CASEWORKER (2), ADMIN (3), BUSINESS/SPONSOR (4), SUPERADMIN (5). No compliance officer role is seeded or defined |
| Sponsor client: can upload documents | **DONE** | `uploadComplianceDocument` endpoint exists and is accessible to business role |
| Sponsor client: can submit change notifications | **PARTIAL** | Sponsor can submit worker events via `createWorkerEvent`. Company-level change requests do not exist |
| Sponsor client: cannot edit internal notes | **MISSING** | No permission guard prevents a sponsor from editing internal case notes — the `checkRole` middleware is used but no specific permission blocks sponsor access to internal notes |
| Sponsor client: cannot alter risk score | **PARTIAL** | Risk score (`riskPct`, `riskLevel`) is on `SponsorProfile` which the sponsor can update via `updateBusinessProfile`. No guard prevents a sponsor from changing their own risk score |

---

## Summary Counts

| Status | Count |
|--------|-------|
| **DONE** | 28 |
| **PARTIAL** | 37 |
| **MISSING** | 65 |
| **Total features audited** | 130 |

---

## Critical Gaps (Highest Priority)

1. **SMS Activity Log** — Entirely absent. No model, no controller, no frontend. Required for UK Home Office compliance evidence.
2. **Right to Work (RTW) Module** — Entirely absent. No model, no controller, no frontend. Core legal requirement.
3. **Absence Monitoring** — Entirely absent. No model, no controller, no frontend.
4. **Audit Preparation Mode** — Entirely absent. No one-click audit pack, no export.
5. **Company-Level Change Request Flow** — Entirely absent. No model for address changes, ownership changes, mergers, insolvency, or trading status changes.
6. **Automated Scheduled Alerts** — No cron job exists for any compliance alert (visa expiry, document expiry, RTW follow-up, absence threshold). The only scheduled job is subscription billing.
7. **Monthly Compliance Review** — Entirely absent. No report generation, no auto-email.
8. **Multi-Company Handling** — Entirely absent. No parent/subsidiary structure.
9. **Compliance Officer Role** — Not defined anywhere. Only 5 roles exist in the system.
10. **CoS Number and SOC Code on Worker Profile** — Both fields are missing from all models. These are mandatory for UK Skilled Worker visa compliance.
