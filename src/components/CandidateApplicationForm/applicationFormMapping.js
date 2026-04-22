import { getInitialApplicationFormData } from "./initialFormState";

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
 * Returns separate objects for user data and application data for child table structure.
 */
export function mapApplicationToCandidateRow(application, overrides = {}) {
  const dobDisplay = application.dob
    ? new Date(application.dob).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  // Parse phone number to extract country code and mobile
  const phoneNumber = application.contactNumber || "";
  let country_code = "+44"; // Default UK code
  let mobile = phoneNumber;
  
  if (phoneNumber && phoneNumber.startsWith('+')) {
    const match = phoneNumber.match(/^(\+\d+)(.*)$/);
    if (match) {
      country_code = match[1];
      mobile = match[2].trim();
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
    contactNumber2: application.contactNumber2 || null,
    previousFullAddress: application.previousFullAddress || null,
    previousAddress: application.previousAddress || null,
    startDate: application.startDate || null,
    endDate: application.endDate || null,
    
    // Nationality & Identity
    nationality: application.nationality || null,
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
    medicalTreatment: application.medicalTreatment || null,
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
    overstayed: application.overstayed || null,
    breach: application.breach || null,
    falseInfo: application.falseInfo || null,
    otherBreach: application.otherBreach || null,
    refusedVisa: application.refusedVisa || null,
    refusedEntry: application.refusedEntry || null,
    refusedPermission: application.refusedPermission || null,
    refusedAsylum: application.refusedAsylum || null,
    deported: application.deported || null,
    removed: application.removed || null,
    requiredToLeave: application.requiredToLeave || null,
    banned: application.banned || null,
    
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
    
    // Combine country code and mobile for contact number
    const contactNumber = c.country_code && c.mobile 
      ? `${c.country_code} ${c.mobile}` 
      : c.phone || c.mobile || "";

    return {
      ...base,
      // Core fields from user table
      firstName: c.first_name ?? c.firstName ?? "",
      lastName: c.last_name ?? c.lastName ?? "",
      email: c.email ?? "",
      contactNumber,
      
      // All application fields from child table
      applicationType: app.applicationType || "Single",
      gender: app.gender || "",
      relationshipStatus: app.relationshipStatus || "",
      address: app.address || "",
      contactNumber2: app.contactNumber2 || "",
      previousFullAddress: app.previousFullAddress || "",
      previousAddress: app.previousAddress || "",
      startDate: formatDateForInput(app.startDate),
      endDate: formatDateForInput(app.endDate),
      
      // Nationality & Identity
      nationality: app.nationality || "",
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
      medicalTreatment: app.medicalTreatment || "",
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
      overstayed: app.overstayed || "",
      breach: app.breach || "",
      falseInfo: app.falseInfo || "",
      otherBreach: app.otherBreach || "",
      refusedVisa: app.refusedVisa || "",
      refusedEntry: app.refusedEntry || "",
      refusedPermission: app.refusedPermission || "",
      refusedAsylum: app.refusedAsylum || "",
      deported: app.deported || "",
      removed: app.removed || "",
      requiredToLeave: app.requiredToLeave || "",
      banned: app.banned || "",
      
      // Travel History
      visitedOther: app.visitedOther || "",
      countryVisited: app.countryVisited || "",
      visitReason: app.visitReason || "",
      entryDate: formatDateForInput(app.entryDate),
      leaveDate: formatDateForInput(app.leaveDate),
      
      // Visa & Immigration Status
      visaType: app.visaType || "",
      brpNumber: app.brpNumber || "",
      visaEndDate: formatDateForInput(app.visaEndDate),
      niNumber: app.niNumber || "",
      sponsored: app.sponsored || "",
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
    nationality: c.nationality ?? "",
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
    medicalTreatment: c.medicalTreatment ?? "",
    ukStayDuration: c.ukStayDuration ?? "",
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
