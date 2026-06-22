/**
 * Sponsor Licence application stages — 18 stages mirroring the backend service.
 *
 * Stages  1-8:   Pre-submission wizard (enquiry through payment)
 * Stages  9-10:  Intake (sponsor information form + document collection)
 * Stages 11-16:  Government processing pipeline (Phase 2)
 * Stage  17:     Submission
 * Stage  18:     UKVI Decision & Activation
 *
 * This is the single source of truth for the read-only Stages tracker.
 * Keep in sync with LICENCE_STAGE_DEFINITIONS in licenceStageTask.service.js.
 */

export const STAGE_ROLES = [
  { key: "sponsor",    label: "Sponsor",    chip: "bg-blue-50 text-blue-600 border-blue-100" },
  { key: "caseworker", label: "Caseworker", chip: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { key: "admin",      label: "Admin",      chip: "bg-primary/5 text-primary border-primary/10" },
];

export const LICENCE_STAGES = [
  // ── Pre-submission stages (1-8) ───────────────────────────────────────────
  {
    key: "enquiry_onboarding",
    order: 1,
    title: "Enquiry & Onboarding",
    govSection: "Intake",
    description: "The sponsor approaches the firm; the case is opened and a caseworker assigned.",
    tasks: {
      sponsor: "Submit a sponsor licence enquiry with basic business details.",
      caseworker: "Acknowledge the assignment and schedule an introductory call.",
      admin: "Triage the enquiry, open the application, and assign a caseworker.",
    },
  },
  {
    key: "licence_routes",
    order: 2,
    title: "Licence Routes",
    govSection: "Section 1",
    description: "Choose the route(s) to register under (e.g. Skilled Worker) and declare any existing licence.",
    tasks: {
      sponsor: "Select the route(s) and declare any existing sponsor licence number (SLN).",
      caseworker: "Advise on the correct route and confirm eligibility.",
      admin: "Verify the selected routes are recorded against the application.",
    },
  },
  {
    key: "organisation_details",
    order: 3,
    title: "Organisation Details",
    govSection: "Section 2",
    description: "Capture the organisation profile: trading names, regions, sector, Companies House and HMRC/PAYE.",
    tasks: {
      sponsor: "Provide organisation details, trading names, Companies House number and HMRC/PAYE references.",
      caseworker: "Verify the details against Companies House and HMRC records.",
      admin: "QA the captured organisation profile for completeness.",
    },
  },
  {
    key: "cos_requirements",
    order: 4,
    title: "CoS & CAS Requirements",
    govSection: "Section 3",
    description: "State the number of Certificates of Sponsorship needed and the business justification.",
    tasks: {
      sponsor: "State the number of CoS required and provide detailed justification.",
      caseworker: "Validate the SOC code, salary threshold and genuine vacancy.",
      admin: "Approve the requested CoS allocation.",
    },
  },
  {
    key: "supporting_documents",
    order: 5,
    title: "Supporting Documents",
    govSection: "Section 4",
    description: "Upload the mandatory Appendix A evidence (usually a minimum of 4 documents).",
    tasks: {
      sponsor: "Upload the required Appendix A documents.",
      caseworker: "Review each document and request any missing evidence.",
      admin: "Sign off the document pack as complete.",
    },
  },
  {
    key: "key_personnel",
    order: 6,
    title: "Key Personnel & Convictions",
    govSection: "Section 5",
    description: "Appoint the Authorising Officer, Key Contact and Level 1 User, and declare any convictions.",
    tasks: {
      sponsor: "Nominate the Authorising Officer, Key Contact and Level 1 User; declare any convictions.",
      caseworker: "Verify personnel are UK-based, hold an NI number and have a clean record.",
      admin: "Approve the key personnel appointments.",
    },
  },
  {
    key: "declarations",
    order: 7,
    title: "Declarations & Representative",
    govSection: "Section 6",
    description: "Confirm the information is true and complete the representative (OISC) declaration.",
    tasks: {
      sponsor: "Confirm the application is true and authorise the representative.",
      caseworker: "Complete the representative / OISC declaration.",
      admin: "Counter-sign and approve the declarations.",
    },
  },
  {
    key: "payment",
    order: 8,
    title: "Payment",
    govSection: "Section 7",
    description: "Pay the licence fee, which depends on the sponsor size.",
    tasks: {
      sponsor: "Pay the licence fee based on the sponsor size.",
      caseworker: "Verify the payment has cleared before submission.",
      admin: "Record the payment and issue a receipt.",
    },
  },
  // ── Intake: information form + document verification (9-10) ──────────────
  {
    key: "intake_information_form",
    order: 9,
    title: "Sponsor Information Form",
    govSection: "Intake",
    description: "Complete the Sponsor Information Form with trading name, premises address, named person on licence, NI number, employee counts, and CoS requirements.",
    tasks: {
      sponsor: "Complete the 12-field Sponsor Information Form: trading name, premises address, named person on licence, NI number, employee counts, CoS required, and more.",
      caseworker: "Review the completed information form for accuracy and completeness before progressing to document verification.",
      admin: "Confirm the information form has been reviewed and approved by the caseworker.",
    },
  },
  {
    key: "intake_document_checklist",
    order: 10,
    title: "Document Collection & Verification",
    govSection: "Intake",
    description: "Upload all mandatory Home Office documents. Every item must reach Verified status before Government Registration can proceed.",
    tasks: {
      sponsor: "Upload all mandatory documents (Employer's Liability Insurance, Certificate of Incorporation, PAYE registration, bank statements, premises evidence, and identity documents).",
      caseworker: "Verify each uploaded document meets the Home Office requirements. All mandatory documents must reach 'Verified' status before Government Registration can proceed.",
      admin: "Confirm all mandatory documents have been verified and the intake stage is complete.",
    },
  },
  // ── Government processing pipeline (11-16) ───────────────────────────────
  {
    key: "sponsor_information_provision",
    order: 11,
    title: "Sponsor Information Provision",
    govSection: "Government Prep",
    description: "Caseworker validates completeness of the sponsor's information pack before government portal entry.",
    tasks: {
      sponsor: "Confirm all organisational details, personnel, and documents are accurate and up-to-date before portal submission.",
      caseworker: "Validate completeness of the sponsor's information pack and confirm readiness for government portal entry.",
      admin: "Authorise the information pack for government portal submission.",
    },
  },
  {
    key: "government_sms_registration",
    order: 12,
    title: "Government SMS Registration",
    govSection: "Government Prep",
    description: "Register the sponsor on the UKVI Sponsorship Management System (SMS) portal.",
    tasks: {
      sponsor: "Await confirmation that your organisation has been registered on the UKVI Sponsorship Management System (SMS).",
      caseworker: "Register the sponsor organisation on the SMS portal and obtain the SMS portal username and registration reference.",
      admin: "Verify the SMS registration details and record the reference number.",
    },
  },
  {
    key: "sponsor_portal_onboarding",
    order: 13,
    title: "Sponsor Portal Onboarding",
    govSection: "Government Prep",
    description: "Onboard the sponsor onto the UKVI SMS portal with login credentials.",
    tasks: {
      sponsor: "Log in to the UKVI Sponsor Management System using the credentials provided and confirm access.",
      caseworker: "Guide the sponsor through the SMS portal login and confirm the sponsor can access their account.",
      admin: "Record that the sponsor has been successfully onboarded to the SMS portal.",
    },
  },
  {
    key: "government_portal_credentials",
    order: 14,
    title: "Government Portal Credentials",
    govSection: "Government Application",
    description: "Generate and securely share the UKVI online application portal credentials with the sponsor.",
    tasks: {
      sponsor: "Receive and confirm receipt of the UKVI online application portal credentials.",
      caseworker: "Generate the UKVI online application portal user ID and password; share securely with the sponsor.",
      admin: "Confirm credentials have been generated and securely transmitted.",
    },
  },
  {
    key: "government_application_forms",
    order: 15,
    title: "Government Application Forms",
    govSection: "Government Application",
    description: "Complete the online sponsor licence application forms on the UKVI portal.",
    tasks: {
      sponsor: "Log in to the UKVI portal and complete the online sponsor licence application forms.",
      caseworker: "Review and verify all form entries with the sponsor; ensure declarations and supporting data are correctly entered.",
      admin: "Carry out a final QA check of the completed government application forms before submission.",
    },
  },
  {
    key: "government_submission",
    order: 16,
    title: "Government Submission",
    govSection: "Government Application",
    description: "Submit the completed online application form to UKVI and record the submission reference.",
    tasks: {
      sponsor: "Confirm submission of the online application to UKVI and note the government submission reference number.",
      caseworker: "Submit the completed online application form to UKVI and record the submission reference and date.",
      admin: "Record the government submission reference, date, and fee payment confirmation.",
    },
  },
  // ── Post-submission outcome stages (17-18) ────────────────────────────────
  {
    key: "submission",
    order: 17,
    title: "Submission",
    govSection: "Section 8",
    description: "Generate the submission sheet and submit the application to UKVI.",
    tasks: {
      sponsor: "Acknowledge that the application has been submitted.",
      caseworker: "Generate the submission sheet and submit to UKVI.",
      admin: "Carry out a final review and authorise submission.",
    },
  },
  {
    key: "decision_activation",
    order: 18,
    title: "UKVI Decision & Activation",
    govSection: "Outcome",
    description: "Record the UKVI decision; on approval the licence is activated and CoS can be assigned.",
    tasks: {
      sponsor: "Receive the licence and begin assigning Certificates of Sponsorship.",
      caseworker: "Coordinate any UKVI requests for further information.",
      admin: "Record the decision and activate the licence (SLN, issue/expiry dates).",
    },
  },
];

/**
 * Infer per-stage completion from the serialized V2 application (read-only).
 * Returns a map of stageKey -> 'done' | 'current' | 'upcoming' | 'rejected'.
 *
 * Must stay in sync with deriveStageCompletion() in licenceStageTask.service.js.
 */
export function deriveStageStatuses(app) {
  const statuses = {};
  if (!app) {
    LICENCE_STAGES.forEach((s, i) => (statuses[s.key] = i === 0 ? "current" : "upcoming"));
    return statuses;
  }

  const status = app.status;
  const submitted = !!app.submittedAt && status !== "Draft";
  const docs = app.appendixDocuments || [];
  const docsComplete = docs.length > 0 && docs.every((d) => d.verificationStatus === "Verified");

  // Status-based sentinels — keep these in sync with the backend signal map.
  // "Licence Granted" is the canonical terminal status set by grantLicence(); treat
  // it identically to "Approved" so stages render as fully complete after approval.
  const isGranted      = status === "Licence Granted";
  const govActive      = ["Government Processing", "Decision Pending", "Approved", "Licence Granted"].includes(status);
  const decisionActive = ["Decision Pending", "Approved", "Licence Granted"].includes(status);
  // infoProvided: application has been received and is actively being reviewed.
  const infoProvided   = submitted && !["Draft", "Pending"].includes(status);

  const complete = {
    // Pre-submission wizard (1-8)
    enquiry_onboarding:        true,
    licence_routes:            (app.routes || []).length > 0,
    organisation_details:      !!(app.organisationInfo && (app.organisationInfo.companiesHouseNumber || app.organisationInfo.organisationType)),
    cos_requirements:          (app.cosRequirements || []).length > 0,
    supporting_documents:      docsComplete,
    key_personnel:             !!app.authorisingOfficer,
    declarations:              !!(app.declaration && app.declaration.accuracyConfirmed),
    payment:                   submitted || app.fee?.total != null,
    // Intake stages (9-10) — status-inferred, matches backend signal map.
    // intake_information_form done once application moves to Under Review or beyond.
    // intake_document_checklist done once government registration is triggered.
    intake_information_form:   infoProvided,
    intake_document_checklist: govActive,
    // Government pipeline (11-16)
    sponsor_information_provision: infoProvided,
    government_sms_registration:   govActive,
    sponsor_portal_onboarding:     govActive,
    government_portal_credentials: govActive,
    government_application_forms:  decisionActive,
    government_submission:         decisionActive,
    // Post-submission (17-18)
    submission:                submitted,
    decision_activation:       status === "Approved" || isGranted,
  };

  if (status === "Approved" || isGranted) {
    LICENCE_STAGES.forEach((s) => (statuses[s.key] = "done"));
    return statuses;
  }

  let currentReached = false;
  LICENCE_STAGES.forEach((s) => {
    if (currentReached) {
      statuses[s.key] = "upcoming";
    } else if (complete[s.key]) {
      statuses[s.key] = "done";
    } else {
      statuses[s.key] = "current";
      currentReached = true;
    }
  });

  if (status === "Rejected" || status === "Licence Rejected") {
    statuses.decision_activation = "rejected";
  }

  return statuses;
}

export const SPONSOR_STAGE_ACTIONS = {
  // Pre-submission wizard
  enquiry_onboarding:            { label: "View licence",                to: "/business/licence" },
  licence_routes:                { label: "Open application",             to: "/business/apply-licence-v2" },
  organisation_details:          { label: "Complete organisation details", to: "/business/apply-licence-v2" },
  cos_requirements:              { label: "Add CoS requirements",          to: "/business/apply-licence-v2" },
  supporting_documents:          { label: "Upload documents",              to: "/business/licence-documents" },
  key_personnel:                 { label: "Add key personnel",             to: "/business/personnel" },
  declarations:                  { label: "Complete declarations",         to: "/business/apply-licence-v2" },
  payment:                       { label: "Pay licence fee",               to: "/business/payment" },
  // Intake
  intake_information_form:       { label: "Complete information form",     to: "/business/licence-process?tab=intake" },
  intake_document_checklist:     { label: "Upload & verify documents",     to: "/business/licence-process?tab=intake" },
  // Government pipeline
  sponsor_information_provision: { label: "Confirm information",           to: "/business/licence-process" },
  government_sms_registration:   { label: "View registration status",      to: "/business/licence-process" },
  sponsor_portal_onboarding:     { label: "Access SMS portal",             to: "/business/licence-process" },
  government_portal_credentials: { label: "Confirm credentials received",  to: "/business/licence-process" },
  government_application_forms:  { label: "View application status",       to: "/business/licence-process" },
  government_submission:         { label: "View submission status",         to: "/business/licence-process" },
  // Outcome
  submission:                    { label: "Review & submit",                to: "/business/apply-licence-v2" },
  decision_activation:           { label: "View licence & CoS",            to: "/business/cosallocation" },
};

const V2_APP_ROUTE = "/business/apply-licence-v2";

export function getSponsorStageAction(stageKey, appId) {
  const action = SPONSOR_STAGE_ACTIONS[stageKey];
  if (!action) return null;
  if (appId != null && action.to === V2_APP_ROUTE) {
    return { ...action, to: `${V2_APP_ROUTE}?draft=${appId}` };
  }
  return action;
}
