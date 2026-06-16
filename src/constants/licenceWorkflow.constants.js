/**
 * Sponsor Licence — workflow phases and statuses.
 *
 * These constants are the single source of truth for the five-phase
 * sponsor licence lifecycle. They are read-only descriptors; business
 * logic that drives transitions lives in the relevant service/controller
 * files and must be kept in sync with these values.
 *
 * Phases:
 *   PHASE_1_ONBOARDING          Sponsor account created and first login completed.
 *   PHASE_2_APPLICATION         Full UKVI application form (8 sections) prepared.
 *   PHASE_3_REVIEW              Internal caseworker review → government pipeline → UKVI decision.
 *   PHASE_4_COS                 Certificate of Sponsorship allocation requests and approvals.
 *   PHASE_5_WORKER_MANAGEMENT   Sponsored worker cases and ongoing compliance.
 */

// ─── Phases ──────────────────────────────────────────────────────────────────

export const PHASE_1_ONBOARDING = "phase_1_onboarding";
export const PHASE_2_APPLICATION = "phase_2_application";
export const PHASE_3_REVIEW = "phase_3_review";
export const PHASE_4_COS = "phase_4_cos";
export const PHASE_5_WORKER_MANAGEMENT = "phase_5_worker_management";

export const LICENCE_PHASES = [
  PHASE_1_ONBOARDING,
  PHASE_2_APPLICATION,
  PHASE_3_REVIEW,
  PHASE_4_COS,
  PHASE_5_WORKER_MANAGEMENT,
];

export const LICENCE_PHASE_LABELS = {
  [PHASE_1_ONBOARDING]:       "Sponsor Onboarding",
  [PHASE_2_APPLICATION]:      "Licence Application",
  [PHASE_3_REVIEW]:           "Licence Review & Approval",
  [PHASE_4_COS]:              "CoS Allocation",
  [PHASE_5_WORKER_MANAGEMENT]: "Sponsored Worker Management",
};

// ─── Phase 1 statuses — Sponsor Onboarding ───────────────────────────────────

/** Account created; welcome email dispatched; sponsor has not yet logged in. */
export const ONBOARDING = "onboarding";

/** Sponsor has completed first-login password change and filled the company profile. */
export const PROFILE_COMPLETED = "profile_completed";

// ─── Phase 2 statuses — Licence Application ──────────────────────────────────

/** Application wizard started; sponsor is still filling in sections. */
export const APPLICATION_DRAFT = "application_draft";

/** Sponsor has completed and submitted all 8 sections of the UKVI form. */
export const APPLICATION_SUBMITTED = "application_submitted";

/** Application received by the platform and queued for caseworker review. */
export const PENDING_REVIEW = "pending_review";

// ─── Phase 3 statuses — Licence Review & Approval ───────────────────────────

/**
 * Caseworker or admin has asked the sponsor for additional documents or
 * clarifications. Maps to LicenceApplication.status = 'Information Requested'.
 */
export const INFO_REQUESTED = "info_requested";

/**
 * Sponsor has responded to the information request. Application re-enters
 * caseworker review. Maps to LicenceApplication.status = 'Under Review'.
 */
export const INFO_RECEIVED = "info_received";

/** UKVI has approved the application; licence is now active (SLN issued). */
export const LICENCE_GRANTED = "licence_granted";

/** UKVI has refused the application or admin has closed it as rejected. */
export const LICENCE_REJECTED = "licence_rejected";

// ─── Phase 4 statuses — CoS Allocation ───────────────────────────────────────

/** CoS allocation request submitted by sponsor; awaiting caseworker/admin review. */
export const COS_PENDING = "cos_pending";

/** Admin has approved the CoS allocation; CoS are available for worker assignment. */
export const COS_APPROVED = "cos_approved";

/** Admin has rejected the CoS allocation request. */
export const COS_REJECTED = "cos_rejected";

// ─── Phase 5 statuses — Sponsored Worker Management ─────────────────────────

/** Worker added and immigration case created; visa application in progress. */
export const VISA_PENDING = "visa_pending";

/** Visa granted; worker is authorised to start employment under the sponsorship. */
export const VISA_GRANTED = "visa_granted";

/** Visa refused by UKVI. */
export const VISA_REJECTED = "visa_rejected";

/** Worker has started employment; right-to-work check recorded; onboarding complete. */
export const EMPLOYEE_ONBOARDED = "employee_onboarded";

// ─── Grouped lookup maps ─────────────────────────────────────────────────────

/** All statuses that belong to each phase, in progression order. */
export const PHASE_STATUSES = {
  [PHASE_1_ONBOARDING]: [
    ONBOARDING,
    PROFILE_COMPLETED,
  ],
  [PHASE_2_APPLICATION]: [
    APPLICATION_DRAFT,
    APPLICATION_SUBMITTED,
    PENDING_REVIEW,
  ],
  [PHASE_3_REVIEW]: [
    INFO_REQUESTED,
    INFO_RECEIVED,
    LICENCE_GRANTED,
    LICENCE_REJECTED,
  ],
  [PHASE_4_COS]: [
    COS_PENDING,
    COS_APPROVED,
    COS_REJECTED,
  ],
  [PHASE_5_WORKER_MANAGEMENT]: [
    VISA_PENDING,
    VISA_GRANTED,
    VISA_REJECTED,
    EMPLOYEE_ONBOARDED,
  ],
};

/** Human-readable labels for every status value. */
export const WORKFLOW_STATUS_LABELS = {
  [ONBOARDING]:           "Onboarding",
  [PROFILE_COMPLETED]:    "Profile Completed",
  [APPLICATION_DRAFT]:    "Draft",
  [APPLICATION_SUBMITTED]: "Submitted",
  [PENDING_REVIEW]:       "Pending Review",
  [INFO_REQUESTED]:       "Information Requested",
  [INFO_RECEIVED]:        "Information Received",
  [LICENCE_GRANTED]:      "Licence Granted",
  [LICENCE_REJECTED]:     "Licence Rejected",
  [COS_PENDING]:          "CoS Pending",
  [COS_APPROVED]:         "CoS Approved",
  [COS_REJECTED]:         "CoS Rejected",
  [VISA_PENDING]:         "Visa Pending",
  [VISA_GRANTED]:         "Visa Granted",
  [VISA_REJECTED]:        "Visa Rejected",
  [EMPLOYEE_ONBOARDED]:   "Employee Onboarded",
};

/**
 * Terminal statuses — no further transitions are expected from these states.
 * Used to disable action buttons and lock records in the UI.
 */
export const TERMINAL_STATUSES = new Set([
  LICENCE_GRANTED,
  LICENCE_REJECTED,
  COS_REJECTED,
  VISA_GRANTED,
  VISA_REJECTED,
  EMPLOYEE_ONBOARDED,
]);
