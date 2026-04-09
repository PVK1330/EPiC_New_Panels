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
  nationality: "Country of nationality",
  birthCountry: "Country of birth",
  placeOfBirth: "Place of birth",
  dob: "Date of birth",
  passportNumber: "Passport number",
  issuingAuthority: "Passport issuing authority",
  issueDate: "Passport issue date",
  expiryDate: "Passport expiry date",
  passportAvailable: "Passport available (Yes/No)",
  nationalIdCardNumber: "National ID card number",
  nationalIdNumber: "National ID number",
  idIssuingAuthorityCard: "ID issuing authority (card)",
  idIssuingAuthorityNational: "ID issuing authority (national)",
  otherNationality: "Other nationality / citizenship",
  ukLicense: "UK driving licence",
  medicalTreatment: "Medical treatment in UK",
  ukStayDuration: "How long in UK",
  contactNumber2: "Alternate contact number",
  previousFullAddress: "Previous full address",
  previousAddress: "Previous address",
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
  overstayed: "Overstayed visa",
  breach: "Breached leave conditions",
  falseInfo: "False information on application",
  otherBreach: "Other immigration breach",
  refusedVisa: "Refused visa",
  refusedEntry: "Refused entry",
  refusedPermission: "Refused permission to stay",
  refusedAsylum: "Refused asylum",
  deported: "Deported",
  removed: "Removed",
  requiredToLeave: "Required to leave",
  banned: "Banned / excluded",
  visitedOther: "Visited other countries (10 years)",
  countryVisited: "Country visited",
  visitReason: "Visit reason",
  entryDate: "Entry date (visit)",
  leaveDate: "Leave date (visit)",
  visaType: "Current visa type",
  brpNumber: "BRP number",
  visaEndDate: "Permission end date",
  niNumber: "National Insurance number",
  sponsored: "Government / scholarship sponsor",
  englishProof: "English language evidence",
};

export function getDefaultFieldVisibility() {
  return Object.fromEntries(
    Object.keys(APPLICATION_FIELD_LABELS).map((k) => [k, true])
  );
}

const STORAGE_KEY_VISIBILITY = "elitepic_application_field_visibility";

export function loadFieldVisibilityFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISIBILITY);
    if (!raw) return getDefaultFieldVisibility();
    const parsed = JSON.parse(raw);
    return { ...getDefaultFieldVisibility(), ...parsed };
  } catch {
    return getDefaultFieldVisibility();
  }
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
    contactNumber: "",
    relationshipStatus: "",
    address: "",
    nationality: "",
    birthCountry: "",
    placeOfBirth: "",
    dob: "",
    passportNumber: "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: "",
    passportAvailable: "",
    nationalIdCardNumber: "",
    nationalIdNumber: "",
    idIssuingAuthorityCard: "",
    idIssuingAuthorityNational: "",
    otherNationality: "",
    ukLicense: "",
    medicalTreatment: "",
    ukStayDuration: "",
    contactNumber2: "",
    previousFullAddress: "",
    previousAddress: "",
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
    overstayed: "",
    breach: "",
    falseInfo: "",
    otherBreach: "",
    refusedVisa: "",
    refusedEntry: "",
    refusedPermission: "",
    refusedAsylum: "",
    deported: "",
    removed: "",
    requiredToLeave: "",
    banned: "",
    visitedOther: "",
    countryVisited: "",
    visitReason: "",
    entryDate: "",
    leaveDate: "",
    visaType: "",
    brpNumber: "",
    visaEndDate: "",
    niNumber: "",
    sponsored: "",
    englishProof: "",
    /** { [customFieldId]: string } — values for admin-defined fields */
    customResponses: {},
  };
}
