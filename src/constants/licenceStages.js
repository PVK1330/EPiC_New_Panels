/**
 * Sponsor Licence application stages.
 *
 * Derived from the UK Visas & Immigration "Apply for a sponsor licence" form
 * (8 official sections) wrapped with the firm's intake and post-decision steps.
 * Each stage carries a task for every role: Sponsor, Caseworker, Admin, Candidate.
 *
 * This is the single source of truth for the read-only Stages tracker. Status is
 * INFERRED from the serialized V2 application (see deriveStageStatuses) — there is
 * no task-completion persistence yet; that is a later phase.
 */

export const STAGE_ROLES = [
  { key: "sponsor", label: "Sponsor", chip: "bg-blue-50 text-blue-600 border-blue-100" },
  { key: "caseworker", label: "Caseworker", chip: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { key: "admin", label: "Admin", chip: "bg-primary/5 text-primary border-primary/10" },
  { key: "candidate", label: "Candidate", chip: "bg-emerald-50 text-emerald-600 border-emerald-100" },
];

export const LICENCE_STAGES = [
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
      candidate: "Register interest as a prospective sponsored worker.",
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
      candidate: "Confirm the role and route they would be sponsored under.",
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
      candidate: null,
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
      candidate: "Provide role/salary details and current immigration status (e.g. Graduate Route expiry).",
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
      candidate: "Provide personal documents (passport, current visa / BRP).",
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
      candidate: null,
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
      candidate: null,
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
      candidate: null,
    },
  },
  {
    key: "submission",
    order: 9,
    title: "Submission",
    govSection: "Section 8",
    description: "Generate the submission sheet and submit the application to UKVI.",
    tasks: {
      sponsor: "Acknowledge that the application has been submitted.",
      caseworker: "Generate the submission sheet and submit to UKVI.",
      admin: "Carry out a final review and authorise submission.",
      candidate: "Be notified that the application has been submitted.",
    },
  },
  {
    key: "decision_activation",
    order: 10,
    title: "UKVI Decision & Activation",
    govSection: "Outcome",
    description: "Record the UKVI decision; on approval the licence is activated and CoS can be assigned.",
    tasks: {
      sponsor: "Receive the licence and begin assigning Certificates of Sponsorship.",
      caseworker: "Coordinate any UKVI requests for further information.",
      admin: "Record the decision and activate the licence (SLN, issue/expiry dates).",
      candidate: "Receive a CoS and proceed to the visa application.",
    },
  },
];

/**
 * Infer per-stage completion from the serialized V2 application (read-only).
 * Returns a map of stageKey -> 'done' | 'current' | 'upcoming' | 'rejected'.
 *
 * The first stage whose data signal is incomplete becomes 'current'; everything
 * before it is 'done', everything after is 'upcoming'. Application status takes
 * precedence at the terminal stages (Approved => all done, Rejected => flagged).
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

  // Per-stage "is this stage's work complete?" signal.
  const complete = {
    enquiry_onboarding: true, // an application existing means intake happened
    licence_routes: (app.routes || []).length > 0,
    organisation_details: !!(app.organisationInfo && (app.organisationInfo.companiesHouseNumber || app.organisationInfo.organisationType)),
    cos_requirements: (app.cosRequirements || []).length > 0,
    supporting_documents: docsComplete,
    key_personnel: !!app.authorisingOfficer,
    declarations: !!(app.declaration && app.declaration.accuracyConfirmed),
    payment: submitted || app.fee?.total != null,
    submission: submitted,
    decision_activation: status === "Approved",
  };

  // Terminal states drive everything.
  if (status === "Approved") {
    LICENCE_STAGES.forEach((s) => (statuses[s.key] = "done"));
    return statuses;
  }

  // Find the first incomplete stage = current; before it = done; after = upcoming.
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

  // A rejected application: flag the decision stage instead of leaving it 'current'.
  if (status === "Rejected") {
    statuses.decision_activation = "rejected";
  }

  return statuses;
}
