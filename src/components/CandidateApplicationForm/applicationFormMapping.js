import { getInitialApplicationFormData } from "./initialFormState";
import { formatDateLong } from "../../utils/datetime";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

// getCountriesForCallingCode is not exported from the main bundle — build it from the available API
function getCountriesForCallingCode(callingCode) {
  const code = String(callingCode);
  return getCountries().filter((iso) => {
    try { return String(getCountryCallingCode(iso)) === code; } catch { return false; }
  });
}

// Helper function to format date for HTML date input (YYYY-MM-DD)
function formatDateForInput(date) {
  if (!date) return "";
  if (typeof date === 'string') {
    // If already a string, try to convert it
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return date; // Return original if invalid
    date = parsed;
  }
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

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
  return map[visa] ?? visa;
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
  return map[crmVisa] ?? crmVisa;
}

/** Drop answers for custom fields that were removed from the definition list. */
export function pruneCustomResponsesToDefinitions(application, definitions) {
  const ids = new Set((definitions || []).map((d) => String(d.id)));
  const cr =
    application.customResponses && typeof application.customResponses === "object"
      ? application.customResponses
      : {};
  const nextCr = Object.fromEntries(Object.entries(cr).filter(([k]) => ids.has(String(k))));
  return { ...application, customResponses: nextCr };
}

/**
 * Alternate contact number is persisted as ONE string. When the form still
 * holds the split fields (ISO code + national digits), prefix the dial code
 * (e.g. "+44 7911123456"); already-combined or legacy values pass through.
 */
function combineAltContactNumber(application) {
  const num = String(application.contactNumber2 || "").trim();
  if (!num || num.startsWith("+") || !application.contactCountryCode2) return num;
  try {
    return `+${getCountryCallingCode(application.contactCountryCode2)} ${num}`;
  } catch {
    return num;
  }
}

/**
 * Build CRM candidate row + full application snapshot from application form payload.
 * Returns separate objects for user data and application data for child table structure.
 */
export function mapApplicationToCandidateRow(application, overrides = {}) {
  const dobDisplay = application.dob
    ? formatDateLong(application.dob, { month: "short" })
    : "";

  // Extract country code and mobile from the split PhoneInput fields.
  // If contactCountryCode (ISO code, e.g. "GB") is present use it; fall back
  // to parsing a legacy combined string like "+44 07123456789".
  let country_code = "+44";
  let mobile = application.contactNumber || "";

  if (application.contactCountryCode) {
    try {
      country_code = `+${getCountryCallingCode(application.contactCountryCode)}`;
    } catch {
      // unknown ISO code — leave default
    }
    mobile = application.contactNumber || "";
  } else {
    const phoneNumber = application.contactNumber || "";
    if (phoneNumber.startsWith("+")) {
      const match = phoneNumber.match(/^(\+\d+)\s*(.*)$/);
      if (match) {
        country_code = match[1];
        mobile = match[2].trim();
      }
    }
  }

  // User data for the main users table
  const userData = {
    first_name: application.firstName ?? "",
    last_name: application.lastName ?? "",
    email: application.email ?? "",
    country_code,
    mobile,
    dob: application.dob ?? "",
    
    // Legacy/CRM fields for compatibility
    phone: application.contactNumber ?? "", // Keep for compatibility
    passportExpiry: application.expiryDate ?? "", // Legacy field
    visaExpiry: application.visaEndDate ?? "", // Legacy field
    countryOfBirth: application.birthCountry ?? "", // Legacy field
    
    // Case-related fields
    caseStatus: overrides.caseStatus ?? "In Review",
    rightToWork: overrides.rightToWork ?? "Pending",
    jobTitle: overrides.jobTitle ?? "",
    linkedBusiness: overrides.linkedBusiness ?? "Independent",
    employmentStart: overrides.employmentStart ?? "",
    paymentStatus: overrides.paymentStatus ?? "Outstanding",
    feeAmount: overrides.feeAmount ?? "",
    city: overrides.city ?? "",
    postcode: overrides.postcode ?? "",
    country: overrides.country ?? "United Kingdom",
    
    // Store complete application data as backup
    applicationData: application,
    
    ...overrides,
  };

  // Application data for the candidate_applications table
  const applicationData = {
    // Core identity — mirrors what is stored in the users table so the
    // application record is self-contained and searchable on its own
    firstName: application.firstName ?? "",
    lastName: application.lastName ?? "",
    email: application.email ?? "",
    contactNumber: application.contactNumber ?? "",

    // Personal Information
    applicationType: application.applicationType || "Single",
    gender: application.gender || null,
    relationshipStatus: application.relationshipStatus || null,
    address: application.address || null,
    addressStartDate: application.addressStartDate ? formatDateForInput(application.addressStartDate) : null,
    housingStatus: application.housingStatus || null,
    landlordName: application.landlordName || null,
    landlordContactNumber: application.landlordContactNumber || null,
    landlordEmail: application.landlordEmail || null,
    landlordAddress: application.landlordAddress || null,
    previousFullAddress: application.previousFullAddress || null,
    previousAddress: (Array.isArray(application.previousAddresses) && application.previousAddresses.length > 0)
      ? (application.previousAddresses[0]?.previousAddress || application.previousAddresses[0]?.address || application.previousAddress || null)
      : (application.previousAddress || null),
    previousAddresses: Array.isArray(application.previousAddresses)
      ? application.previousAddresses.map((item) => ({
          previousAddress: item.previousAddress || item.address || "",
          startDate: item.startDate || null,
          endDate: item.endDate || null,
        })).filter((item) => item.previousAddress || item.startDate || item.endDate)
      : (application.previousAddress ? [{
          previousAddress: application.previousAddress,
          startDate: application.startDate || null,
          endDate: application.endDate || null,
        }] : []),
    startDate: (Array.isArray(application.previousAddresses) && application.previousAddresses.length > 0)
      ? (application.previousAddresses[0]?.startDate || application.startDate || null)
      : (application.startDate || null),
    endDate: (Array.isArray(application.previousAddresses) && application.previousAddresses.length > 0)
      ? (application.previousAddresses[0]?.endDate || application.endDate || null)
      : (application.endDate || null),
    
    // Nationality & Identity
    nationality: (Array.isArray(application.nationalities) && application.nationalities.length > 0)
      ? application.nationalities[0]
      : (application.nationality || null),
    nationalities: Array.isArray(application.nationalities)
      ? application.nationalities.filter(Boolean)
      : (application.nationality ? [application.nationality] : []),
    birthCountry: application.birthCountry || null,
    placeOfBirth: application.placeOfBirth || null,
    dob: application.dob || null,
    passportNumber: application.passportNumber || null,
    issuingAuthority: application.issuingAuthority || null,
    issueDate: application.issueDate || null,
    expiryDate: application.expiryDate || null,
    passportAvailable: application.passportAvailable || null,
    nationalIdCardNumber: application.nationalIdCardNumber || null,
    nationalIdNumber: application.nationalIdNumber || null,
    idIssuingAuthorityCard: application.idIssuingAuthorityCard || null,
    idIssuingAuthorityNational: application.idIssuingAuthorityNational || null,
    otherNationality: application.otherNationality || null,
    ukLicense: application.ukLicense || null,
    ukLicenseNumber: application.ukLicenseNumber || null,
    medicalTreatment: application.medicalTreatment || null,
    medicalTreatmentHospitalClinicName: application.medicalTreatmentHospitalClinicName || null,
    medicalTreatmentHospitalClinicAddress: application.medicalTreatmentHospitalClinicAddress || null,
    medicalTreatmentStartDate: application.medicalTreatmentStartDate || null,
    medicalTreatmentEndDate: application.medicalTreatmentEndDate || null,
    medicalTreatmentDetails: application.medicalTreatmentDetails || null,
    ukStayDuration: application.ukStayDuration || null,
    
    // Parent Information
    parentName: application.parentName || null,
    parentRelation: application.parentRelation || null,
    parentDob: application.parentDob || null,
    parentNationality: application.parentNationality || null,
    sameNationality: application.sameNationality || null,
    parent2Name: application.parent2Name || null,
    parent2Relation: application.parent2Relation || null,
    parent2Dob: application.parent2Dob || null,
    parent2Nationality: application.parent2Nationality || null,
    parent2SameNationality: application.parent2SameNationality || null,
    
    // Immigration History
    illegalEntry: application.illegalEntry || null,
    illegalEntryDetails: application.illegalEntryDetails || null,
    overstayed: application.overstayed || null,
    overstayedDetails: application.overstayedDetails || null,
    breach: application.breach || null,
    breachDetails: application.breachDetails || null,
    falseInfo: application.falseInfo || null,
    falseInfoDetails: application.falseInfoDetails || null,
    otherBreach: application.otherBreach || null,
    otherBreachDetails: application.otherBreachDetails || null,
    refusedVisa: application.refusedVisa || null,
    refusedVisaDetails: application.refusedVisaDetails || null,
    refusedEntry: application.refusedEntry || null,
    refusedEntryDetails: application.refusedEntryDetails || null,
    refusedPermission: application.refusedPermission || null,
    refusedPermissionDetails: application.refusedPermissionDetails || null,
    refusedAsylum: application.refusedAsylum || null,
    refusedAsylumDetails: application.refusedAsylumDetails || null,
    deported: application.deported || null,
    deportedDetails: application.deportedDetails || null,
    removed: application.removed || null,
    removedDetails: application.removedDetails || null,
    requiredToLeave: application.requiredToLeave || null,
    requiredToLeaveDetails: application.requiredToLeaveDetails || null,
    banned: application.banned || null,
    bannedDetails: application.bannedDetails || null,
    
    // Travel History
    visitedOther: application.visitedOther || null,
    countryVisited: application.countryVisited || null,
    visitReason: application.visitReason || null,
    entryDate: application.entryDate || null,
    leaveDate: application.leaveDate || null,
    
    // Current Visa Information
    visaType: applicationVisaToCRM(application.visaType),
    brpNumber: application.brpNumber || null,
    visaEndDate: application.visaEndDate || null,
    niNumber: application.niNumber || null,
    sponsored: application.sponsored || null,
    sponsoredDetails: application.sponsoredDetails || null,
    englishProof: application.englishProof || null,
    
    // Custom fields
    customResponses: application.customResponses || {},
    
    // Application status - only set for new applications
    ...(overrides.isNewApplication ? {
      status: "submitted",
      submittedAt: new Date(),
    } : {}),
  };

  return {
    userData,
    applicationData,
    // For backward compatibility, return combined data as well
    combined: {
      ...userData,
      ...applicationData,
      dobDisplay,
    },
  };
}

/** Hydrate application form from saved snapshot or from legacy CRM row (no snapshot). */
export function candidateRowToApplicationForm(c) {
  const base = getInitialApplicationFormData();
  
  // If we have application data from child table, use that
  if (c.application && typeof c.application === "object") {
    const app = c.application;
    
    // Resolve country ISO code from stored dial code (e.g. "+44" → "GB").
    // getCountriesForCallingCode returns an array; pick the first (canonical) one.
    let contactCountryCode = "GB";
    if (c.country_code) {
      try {
        const dialDigits = String(c.country_code).replace(/^\+/, "");
        const matches = getCountriesForCallingCode(dialDigits);
        if (matches && matches.length > 0) contactCountryCode = matches[0];
      } catch {
        // unknown dial code — keep default
      }
    }
    const contactNumber = c.mobile || c.phone || "";

    // Alternate contact number is stored as one string, optionally prefixed
    // with its dial code (e.g. "+44 7911123456") — split it back into the ISO
    // country + national digits used by the phone input.
    let contactCountryCode2 = "GB";
    let contactNumber2 = String(app.contactNumber2 || "");
    const altMatch = contactNumber2.match(/^(\+\d{1,4})\s*(.*)$/);
    if (altMatch) {
      try {
        const matches = getCountriesForCallingCode(altMatch[1].replace(/^\+/, ""));
        if (matches && matches.length > 0) contactCountryCode2 = matches[0];
      } catch {
        // unknown dial code — keep default
      }
      contactNumber2 = altMatch[2].trim();
    }

    return {
      ...base,
      // Core fields from user table
      firstName: c.first_name ?? c.firstName ?? "",
      lastName: c.last_name ?? c.lastName ?? "",
      email: c.email ?? "",
      contactCountryCode,
      contactNumber,
      
      // All application fields from child table
      applicationType: app.applicationType || "Single",
      gender: app.gender || "",
      relationshipStatus: app.relationshipStatus || "",
      address: app.address || "",
      addressStartDate: formatDateForInput(app.addressStartDate || app.current_address_start_date),
      housingStatus: app.housingStatus || app.housing_status || "",
      landlordName: app.landlordName || app.landlord_name || "",
      landlordContactNumber: app.landlordContactNumber || app.landlord_contact_number || "",
      landlordEmail: app.landlordEmail || app.landlord_email || "",
      landlordAddress: app.landlordAddress || app.landlord_address || "",
      contactCountryCode2,
      contactNumber2,
      previousFullAddress: app.previousFullAddress || "",
      previousAddress: (Array.isArray(app.previousAddresses) && app.previousAddresses.length > 0)
        ? (app.previousAddresses[0]?.previousAddress || app.previousAddresses[0]?.address || app.previousAddress || "")
        : (app.previousAddress || ""),
      previousAddresses: (Array.isArray(app.previousAddresses) && app.previousAddresses.length > 0)
        ? app.previousAddresses.map((item) => ({
            previousAddress: item.previousAddress || item.address || "",
            startDate: formatDateForInput(item.startDate),
            endDate: formatDateForInput(item.endDate),
          }))
        : (app.previousAddress || app.startDate || app.endDate
          ? [{
              previousAddress: app.previousAddress || "",
              startDate: formatDateForInput(app.startDate),
              endDate: formatDateForInput(app.endDate),
            }]
          : []),
      startDate: (Array.isArray(app.previousAddresses) && app.previousAddresses.length > 0)
        ? (formatDateForInput(app.previousAddresses[0]?.startDate) || formatDateForInput(app.startDate))
        : formatDateForInput(app.startDate),
      endDate: (Array.isArray(app.previousAddresses) && app.previousAddresses.length > 0)
        ? (formatDateForInput(app.previousAddresses[0]?.endDate) || formatDateForInput(app.endDate))
        : formatDateForInput(app.endDate),
      
      // Nationality & Identity
      nationality: (Array.isArray(app.nationalities) && app.nationalities.length > 0)
        ? app.nationalities[0]
        : (app.nationality || c.nationality || ""),
      nationalities: Array.isArray(app.nationalities) && app.nationalities.length > 0
        ? app.nationalities.filter(Boolean)
        : (app.nationality || c.nationality ? [app.nationality || c.nationality] : []),
      birthCountry: app.birthCountry || "",
      placeOfBirth: app.placeOfBirth || "",
      dob: formatDateForInput(app.dob || c.dob),
      passportNumber: app.passportNumber || "",
      issuingAuthority: app.issuingAuthority || "",
      issueDate: formatDateForInput(app.issueDate),
      expiryDate: formatDateForInput(app.expiryDate),
      passportAvailable: app.passportAvailable || "",
      nationalIdCardNumber: app.nationalIdCardNumber || "",
      nationalIdNumber: app.nationalIdNumber || "",
      idIssuingAuthorityCard: app.idIssuingAuthorityCard || "",
      idIssuingAuthorityNational: app.idIssuingAuthorityNational || "",
      otherNationality: app.otherNationality || "",
      ukLicense: app.ukLicense || "",
      ukLicenseNumber: app.ukLicenseNumber || "",
      medicalTreatment: app.medicalTreatment || "",
      medicalTreatmentHospitalClinicName: app.medicalTreatmentHospitalClinicName || "",
      medicalTreatmentHospitalClinicAddress: app.medicalTreatmentHospitalClinicAddress || "",
      medicalTreatmentStartDate: formatDateForInput(app.medicalTreatmentStartDate),
      medicalTreatmentEndDate: formatDateForInput(app.medicalTreatmentEndDate),
      medicalTreatmentDetails: app.medicalTreatmentDetails || "",
      ukStayDuration: app.ukStayDuration || "",
      
      // Parent Information
      parentName: app.parentName || "",
      parentRelation: app.parentRelation || "",
      parentDob: formatDateForInput(app.parentDob),
      parentNationality: app.parentNationality || "",
      sameNationality: app.sameNationality || "",
      parent2Name: app.parent2Name || "",
      parent2Relation: app.parent2Relation || "",
      parent2Dob: formatDateForInput(app.parent2Dob),
      parent2Nationality: app.parent2Nationality || "",
      parent2SameNationality: app.parent2SameNationality || "",
      
      // Immigration History
      illegalEntry: app.illegalEntry || "",
      illegalEntryDetails: app.illegalEntryDetails || "",
      overstayed: app.overstayed || "",
      overstayedDetails: app.overstayedDetails || "",
      breach: app.breach || "",
      breachDetails: app.breachDetails || "",
      falseInfo: app.falseInfo || "",
      falseInfoDetails: app.falseInfoDetails || "",
      otherBreach: app.otherBreach || "",
      otherBreachDetails: app.otherBreachDetails || "",
      refusedVisa: app.refusedVisa || "",
      refusedVisaDetails: app.refusedVisaDetails || "",
      refusedEntry: app.refusedEntry || "",
      refusedEntryDetails: app.refusedEntryDetails || "",
      refusedPermission: app.refusedPermission || "",
      refusedPermissionDetails: app.refusedPermissionDetails || "",
      refusedAsylum: app.refusedAsylum || "",
      refusedAsylumDetails: app.refusedAsylumDetails || "",
      deported: app.deported || "",
      deportedDetails: app.deportedDetails || "",
      removed: app.removed || "",
      removedDetails: app.removedDetails || "",
      requiredToLeave: app.requiredToLeave || "",
      requiredToLeaveDetails: app.requiredToLeaveDetails || "",
      banned: app.banned || "",
      bannedDetails: app.bannedDetails || "",
      
      // Travel History
      visitedOther: app.visitedOther || "",
      countryVisited: app.countryVisited || "",
      visitReason: app.visitReason || "",
      entryDate: formatDateForInput(app.entryDate),
      leaveDate: formatDateForInput(app.leaveDate),
      
      // Visa & Immigration Status (stored as CRM label e.g. "Skilled Worker")
      visaType: crmVisaToApplication(app.visaType) || app.visaType || "",
      brpNumber: app.brpNumber || "",
      visaEndDate: formatDateForInput(app.visaEndDate),
      niNumber: app.niNumber || "",
      sponsored: app.sponsored || "",
      sponsoredDetails: app.sponsoredDetails || "",
      englishProof: app.englishProof || "",
      
      // Custom responses
      customResponses: app.customResponses || {},
      
      // Related data for display
      _relatedData: {
        cases: c.cases || [],
        documents: c.documents || [],
        notifications: c.notifications || [],
        accountSettings: c.candidateAccountSettings || {},
        feedbacks: c.candidateFeedbacks || []
      }
    };
  }
  
  // Legacy fallback for data without child table
  const contactNumber = c.country_code && c.mobile 
    ? `${c.country_code} ${c.mobile}` 
    : c.phone || c.mobile || "";

  return {
    ...base,
    firstName: c.first_name ?? c.firstName ?? "",
    lastName: c.last_name ?? c.lastName ?? "",
    email: c.email ?? "",
    gender: c.gender && c.gender !== "Prefer not to say" ? c.gender : "",
    contactNumber,
    relationshipStatus: "",
    address: c.address ?? "",
    addressStartDate: formatDateForInput(c.addressStartDate || c.current_address_start_date),
    housingStatus: c.housingStatus || c.housing_status || "",
    landlordName: c.landlordName || c.landlord_name || "",
    landlordContactNumber: c.landlordContactNumber || c.landlord_contact_number || "",
    landlordEmail: c.landlordEmail || c.landlord_email || "",
    landlordAddress: c.landlordAddress || c.landlord_address || "",
    nationality: c.nationality ?? "",
    nationalities: Array.isArray(c.nationalities) && c.nationalities.length > 0
      ? c.nationalities.filter(Boolean)
      : (c.nationality ? [c.nationality] : []),
    birthCountry: c.countryOfBirth ?? "",
    placeOfBirth: "",
    dob: formatDateForInput(c.dob),
    passportNumber: c.passportNumber ?? "",
    issuingAuthority: "",
    issueDate: "",
    expiryDate: formatDateForInput(c.passportExpiry),
    passportAvailable: "",
    nationalIdCardNumber: c.nationalIdCardNumber ?? "",
    nationalIdNumber: c.niNumber ?? "",
    idIssuingAuthorityCard: c.idIssuingAuthorityCard ?? "",
    idIssuingAuthorityNational: c.idIssuingAuthorityNational ?? "",
    otherNationality: c.otherNationality ?? "",
    ukLicense: c.ukLicense ?? "",
    ukLicenseNumber: c.ukLicenseNumber ?? "",
    medicalTreatment: c.medicalTreatment ?? "",
    medicalTreatmentHospitalClinicName: c.medicalTreatmentHospitalClinicName ?? "",
    medicalTreatmentHospitalClinicAddress: c.medicalTreatmentHospitalClinicAddress ?? "",
    medicalTreatmentStartDate: formatDateForInput(c.medicalTreatmentStartDate),
    medicalTreatmentEndDate: formatDateForInput(c.medicalTreatmentEndDate),
    medicalTreatmentDetails: c.medicalTreatmentDetails ?? "",
    ukStayDuration: c.ukStayDuration ?? "",
    contactNumber2: "",
    previousFullAddress: "",
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
    countryVisited: "",
    visitReason: "",
    entryDate: "",
    leaveDate: "",
    sponsored: "",
    sponsoredDetails: "",
    // Parent Information (fallback)
    parentName: c.parentName || "",
    parentRelation: c.parentRelation || "",
    parentDob: formatDateForInput(c.parentDob),
    parentNationality: c.parentNationality || "",
    sameNationality: c.sameNationality || "",
    parent2Name: c.parent2Name || "",
    parent2Relation: c.parent2Relation || "",
    parent2Dob: formatDateForInput(c.parent2Dob),
    parent2Nationality: c.parent2Nationality || "",
    parent2SameNationality: c.parent2SameNationality || "",
    
    // Immigration History (fallback)
    illegalEntry: c.illegalEntry || "",
    overstayed: c.overstayed || "",
    breach: c.breach || "",
    falseInfo: c.falseInfo || "",
    otherBreach: c.otherBreach || "",
    refusedVisa: c.refusedVisa || "",
    refusedEntry: c.refusedEntry || "",
    refusedPermission: c.refusedPermission || "",
    refusedAsylum: c.refusedAsylum || "",
    deported: c.deported || "",
    removed: c.removed || "",
    requiredToLeave: c.requiredToLeave || "",
    banned: c.banned || "",
    
    // Travel History (fallback)
    visitedOther: c.visitedOther || "",
    countryVisited: c.countryVisited || "",
    visitReason: c.visitReason || "",
    entryDate: formatDateForInput(c.entryDate),
    leaveDate: formatDateForInput(c.leaveDate),
    
    // Current Visa Information (fallback)
    visaType: crmVisaToApplication(c.visaType),
    brpNumber: c.brpNumber || "",
    visaEndDate: formatDateForInput(c.visaEndDate || c.visaExpiry),
    niNumber: c.niNumber || "",
    sponsored: c.sponsored || "",
    englishProof: c.englishProof || "",
  };
}
