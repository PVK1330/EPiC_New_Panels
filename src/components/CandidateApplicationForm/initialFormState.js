export const APPLICATION_STEP_LABELS = [
  "Personal",
  "Nationality",
  "Identity",
  "Parent",
  "Travel & visa",
  "Status & English",
];

/** Human-readable labels for admin visibility toggles (keys match form field names). */
export const APPLICATION_FIELD_LABELS = {
  applicationType: "Application type (Single / Family)",
  firstName: "First name",
  lastName: "Last name",
  email: "Email",
  gender: "Gender",
  contactNumber: "Contact number",
  relationshipStatus: "Relationship status",
  address: "Current address",
  addressStartDate: "Move-in / start date",
  housingStatus: "Housing status",
  landlordName: "Landlord name",
  landlordContactNumber: "Landlord contact number",
  landlordEmail: "Landlord email",
  landlordAddress: "Landlord address",
  nationality: "Country of nationality",
  nationalities: "Nationalities",
  birthCountry: "Country of birth",
  placeOfBirth: "Place of birth",
  dob: "Date of birth",
  passportNumber: "Passport number",
  issuingAuthority: "Passport issuing authority",
  issueDate: "Passport issue date",
  expiryDate: "Passport expiry date",
  passportAvailable: "Passport available (Yes/No)",
  nationalIdNumber: "National ID number",
  idIssuingAuthorityNational: "ID issuing authority",
  otherNationality: "Other nationality / citizenship",
  ukLicense: "UK driving licence",
  ukLicenseNumber: "UK driving licence number",
  medicalTreatment: "Medical treatment in UK",
  medicalTreatmentHospitalClinicName: "Hospital / clinic name",
  medicalTreatmentHospitalClinicAddress: "Hospital / clinic address",
  medicalTreatmentStartDate: "Treatment start date",
  medicalTreatmentEndDate: "Treatment end date",
  medicalTreatmentDetails: "Other treatment details",
  ukStayDuration: "How long in UK",
  contactNumber2: "Alternate contact number",
  previousAddress: "Previous address",
  previousAddresses: "Previous addresses",
  startDate: "Address start date",
  endDate: "Address end date",
  parentName: "Parent one — full name",
  parentRelation: "Parent one — relationship",
  parentDob: "Parent one — date of birth",
  parentNationality: "Parent one — nationality",
  sameNationality: "Parent one — same nationality",
  parent2Name: "Parent two — full name",
  parent2Relation: "Parent two — relationship",
  parent2Dob: "Parent two — date of birth",
  parent2Nationality: "Parent two — nationality",
  parent2SameNationality: "Parent two — same nationality",
  illegalEntry: "Entered UK illegally",
  illegalEntryDetails: "Illegal entry details",
  overstayed: "Overstayed visa",
  overstayedDetails: "Overstaying details",
  breach: "Breached leave conditions",
  breachDetails: "Leave condition breach details",
  falseInfo: "False information on application",
  falseInfoDetails: "False information details",
  otherBreach: "Other immigration breach",
  otherBreachDetails: "Other immigration breach details",
  refusedVisa: "Refused visa",
  refusedVisaDetails: "Visa refusal details",
  refusedEntry: "Refused entry",
  refusedEntryDetails: "Refused entry details",
  refusedPermission: "Refused permission to stay",
  refusedPermissionDetails: "Refused permission details",
  refusedAsylum: "Refused asylum",
  refusedAsylumDetails: "Refused asylum details",
  deported: "Deported",
  deportedDetails: "Deportation details",
  removed: "Removed",
  removedDetails: "Removal details",
  requiredToLeave: "Required to leave",
  requiredToLeaveDetails: "Required to leave details",
  banned: "Banned / excluded",
  bannedDetails: "Exclusion / ban details",
  visitedOther: "Visited other countries (10 years)",
  travelHistory: "Travel history",
  countryVisited: "Country visited",
  visitReason: "Visit reason",
  entryDate: "Entry date (visit)",
  leaveDate: "Leave date (visit)",
  visaType: "Current visa type",
  brpNumber: "BRP number",
  visaEndDate: "Permission end date",
  niNumber: "National Insurance number",
  sponsored: "Government / scholarship sponsor",
  sponsoredDetails: "Sponsorship details",
  englishProof: "English language evidence",
};

export function getDefaultFieldVisibility() {
  return Object.fromEntries(
    Object.keys(APPLICATION_FIELD_LABELS).map((k) => [k, true])
  );
}

const STORAGE_KEY_VISIBILITY = "elitepic_application_field_visibility";

export function loadFieldVisibilityFromStorage() {
  // Always return default visibility to show all fields
  return getDefaultFieldVisibility();
}

export function saveFieldVisibilityToStorage(visibility) {
  try {
    localStorage.setItem(STORAGE_KEY_VISIBILITY, JSON.stringify(visibility));
  } catch {
    /* ignore */
  }
}

const STORAGE_KEY_CUSTOM_DEFS = "elitepic_application_custom_field_definitions";

/** Admin-defined extra inputs; values live in form data under `customResponses[id]`. */
export const CUSTOM_FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
];

export function newCustomFieldId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `cf_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function createCustomFieldDefinition() {
  return {
    id: newCustomFieldId(),
    label: "",
    type: "text",
  };
}

export function loadCustomFieldDefinitionsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_DEFS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomFieldDefinitionsToStorage(definitions) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_DEFS, JSON.stringify(definitions));
  } catch {
    /* ignore */
  }
}

export function getInitialApplicationFormData() {
  return {
    applicationType: "Family",
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    contactCountryCode: "GB",
    contactNumber: "",
    relationshipStatus: "",
    address: "",
    addressStartDate: "",
    housingStatus: "",
    landlordName: "",
    landlordContactCountryCode: "GB",
    landlordContactNumber: "",
    landlordEmail: "",
    landlordAddress: "",
    nationality: "",
    nationalities: [],
    birthCountry: "",
    placeOfBirth: "",
    dob: "",
    passportNumber: "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    passportAvailable: "",
    nationalIdNumber: "",
    idIssuingAuthorityNational: "",
    otherNationality: "",
    ukLicense: "",
    ukLicenseNumber: "",
    medicalTreatment: "",
    medicalTreatmentHospitalClinicName: "",
    medicalTreatmentHospitalClinicAddress: "",
    medicalTreatmentStartDate: "",
    medicalTreatmentEndDate: "",
    medicalTreatmentDetails: "",
    ukStayDuration: "",
    contactCountryCode2: "GB",
    contactNumber2: "",
    previousAddress: "",
    previousAddresses: [],
    startDate: "",
    endDate: "",
    parentName: "",
    parentRelation: "",
    parentDob: "",
    parentNationality: "",
    sameNationality: "",
    parent2Name: "",
    parent2Relation: "",
    parent2Dob: "",
    parent2Nationality: "",
    parent2SameNationality: "",
    illegalEntry: "",
    illegalEntryDetails: "",
    overstayed: "",
    overstayedDetails: "",
    breach: "",
    breachDetails: "",
    falseInfo: "",
    falseInfoDetails: "",
    otherBreach: "",
    otherBreachDetails: "",
    refusedVisa: "",
    refusedVisaDetails: "",
    refusedEntry: "",
    refusedEntryDetails: "",
    refusedPermission: "",
    refusedPermissionDetails: "",
    refusedAsylum: "",
    refusedAsylumDetails: "",
    deported: "",
    deportedDetails: "",
    removed: "",
    removedDetails: "",
    requiredToLeave: "",
    requiredToLeaveDetails: "",
    banned: "",
    bannedDetails: "",
    visitedOther: "",
    travelHistory: [],
    countryVisited: "",
    visitReason: "",
    entryDate: "",
    leaveDate: "",
    visaType: "",
    brpNumber: "",
    visaEndDate: "",
    niNumber: "",
    sponsored: "",
    sponsoredDetails: "",
    englishProof: "",
    caseworkerId: "",
    /** { [customFieldId]: string } — values for admin-defined fields */
    customResponses: {},
  };
}
