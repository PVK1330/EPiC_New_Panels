import { getInitialApplicationFormData } from "./initialFormState";

/** Map application visa dropdown values to CRM visa type labels used in AdminCandidates */
export function applicationVisaToCRM(visa) {
  const map = {
    Visitor: "Visitor Visa",
    Student: "Student Visa",
    Work: "Skilled Worker",
    Family: "Family Visa",
    Settlement: "ILR",
    Other: "Other",
  };
  return map[visa] ?? "Other";
}

/** Reverse: CRM visa → application form visa type */
export function crmVisaToApplication(crmVisa) {
  const map = {
    "Visitor Visa": "Visitor",
    "Student Visa": "Student",
    "Skilled Worker": "Work",
    "Family Visa": "Family",
    ILR: "Settlement",
    "Graduate Visa": "Other",
    "Sponsor Licence": "Other",
    "Global Talent": "Other",
    "Youth Mobility": "Other",
    Other: "Other",
  };
  return map[crmVisa] ?? "Other";
}

/** Drop answers for custom fields that were removed from the definition list. */
export function pruneCustomResponsesToDefinitions(application, definitions) {
  const ids = new Set((definitions || []).map((d) => d.id));
  const cr =
    application.customResponses && typeof application.customResponses === "object"
      ? application.customResponses
      : {};
  const nextCr = Object.fromEntries(Object.entries(cr).filter(([k]) => ids.has(k)));
  return { ...application, customResponses: nextCr };
}

/**
 * Build CRM candidate row + full application snapshot from application form payload.
 * Admin and candidate use the same application shape; this is the single merge into list storage.
 */
export function mapApplicationToCandidateRow(application, overrides = {}) {
  const dobDisplay = application.dob
    ? new Date(application.dob).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return {
    firstName: application.firstName ?? "",
    lastName: application.lastName ?? "",
    email: application.email ?? "",
    phone: application.contactNumber ?? "",
    dob: application.dob ?? "",
    dobDisplay,
    gender: application.gender || "Prefer not to say",
    nationality: application.nationality ?? "",
    countryOfBirth: application.birthCountry ?? "",
    passportNumber: application.passportNumber ?? "",
    passportExpiry: application.expiryDate ?? "",
    niNumber: application.niNumber ?? "",
    brpNumber: application.brpNumber ?? "",
    visaType: applicationVisaToCRM(application.visaType),
    visaExpiry: application.visaEndDate ?? "",
    caseStatus: overrides.caseStatus ?? "In Review",
    rightToWork: overrides.rightToWork ?? "Pending",
    jobTitle: overrides.jobTitle ?? "",
    linkedBusiness: overrides.linkedBusiness ?? "Independent",
    employmentStart: overrides.employmentStart ?? "",
    paymentStatus: overrides.paymentStatus ?? "Outstanding",
    feeAmount: overrides.feeAmount ?? "",
    address: application.address ?? "",
    city: overrides.city ?? "",
    postcode: overrides.postcode ?? "",
    country: overrides.country ?? "United Kingdom",
    applicationData: application,
    ...overrides,
  };
}

/** Hydrate application form from saved snapshot or from legacy CRM row (no snapshot). */
export function candidateRowToApplicationForm(c) {
  const base = getInitialApplicationFormData();
  if (c.applicationData && typeof c.applicationData === "object") {
    return { ...base, ...c.applicationData };
  }
  return {
    ...base,
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    email: c.email ?? "",
    gender: c.gender && c.gender !== "Prefer not to say" ? c.gender : "",
    contactNumber: c.phone ?? "",
    relationshipStatus: "",
    address: c.address ?? "",
    nationality: c.nationality ?? "",
    birthCountry: c.countryOfBirth ?? "",
    placeOfBirth: "",
    dob: c.dob ?? "",
    passportNumber: c.passportNumber ?? "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: c.passportExpiry ?? "",
    passportAvailable: "",
    brpNumber: c.brpNumber ?? "",
    niNumber: c.niNumber ?? "",
    visaType: crmVisaToApplication(c.visaType),
    visaEndDate: c.visaExpiry ?? "",
  };
}
