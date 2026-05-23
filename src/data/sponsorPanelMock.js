/**
 * Demo / offline data for the sponsor (business) panel when APIs return errors.
 */

export const MOCK_SPONSOR_PROFILE = {
  user: {
    id: 1,
    first_name: "Demo",
    last_name: "Sponsor",
    email: "sponsor@demo.epic.local",
    mobile: "+44 7700 900123",
    profile_pic: null,
  },
  profile: {
    companyName: "Northgate Sponsors Ltd",
    tradingName: "Northgate",
    registrationNumber: "NI012345",
    sponsorLicenceNumber: "AB12CD34E",
    licenceRating: "A",
    licenceStatus: "Active",
    cosAllocation: 50,
    authorisingName: "Jane Smith",
    authorisingEmail: "jane.smith@northgate.demo",
    authorisingPhone: "+44 7700 900100",
    authorisingJobTitle: "Authorising Officer",
    keyContactName: "Tom Wilson",
    keyContactEmail: "tom@northgate.demo",
    keyContactPhone: "+44 7700 900101",
    registeredAddress: "10 High Street, Belfast, BT1 1AA",
    level1Users: [
      { name: "Alex Brown", email: "alex@northgate.demo", jobTitle: "HR Manager" },
    ],
  },
  preferences: {
    email_notifications: true,
    compliance_updates: true,
    payment_reminders: true,
    push_notifications: true,
    timezone: "UTC+0 (London)",
    language: "English",
    date_format: "DD/MM/YYYY",
  },
};

export const MOCK_LICENCE_SUMMARY = {
  licenceId: "LIC-2026-101",
  licenceNumber: "AB12CD34E",
  status: "Active",
  licenceType: "Skilled Worker",
  licenceRating: "A",
  cos: { total: 50, used: 12, available: 38 },
  cosAllocation: { total: 50, used: 12, available: 38 },
  expiryDate: new Date(Date.now() + 180 * 86400000).toISOString(),
  daysRemaining: 180,
};

export const MOCK_COS_REQUESTS = [
  {
    id: 201,
    status: "Pending",
    licenceType: "Skilled Worker",
    cosAllocation: 10,
    reason: "CoS Request: Additional allocations for Q2 hiring",
    createdAt: new Date().toISOString(),
  },
  {
    id: 198,
    status: "Approved",
    licenceType: "Skilled Worker",
    cosAllocation: 5,
    reason: "CoS Request: New software team",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export const MOCK_COS_SUMMARY = {
  summary: { total: 50, used: 12, remaining: 38 },
  byVisaType: [{ visaType: "Skilled Worker", allocated: 50, used: 12 }],
};

export const MOCK_REPORTING_OBLIGATIONS = [
  {
    id: 1,
    worker: "Amara Okafor",
    eventType: "Change of circumstances",
    eventDate: "2026-04-01",
    reportedDate: "-",
    deadline: "2026-05-25",
    status: "Pending",
    daysRemaining: 6,
    risk: "medium",
  },
  {
    id: 2,
    worker: "James Mitchell",
    eventType: "Absence reporting",
    eventDate: "2026-03-15",
    reportedDate: "2026-03-18",
    deadline: "2026-04-15",
    status: "Reported",
    daysRemaining: -34,
    risk: "low",
  },
];

export const MOCK_CALENDAR_APPOINTMENTS = [
  {
    id: "mock-1",
    title: "Sponsor compliance review",
    date: new Date(Date.now() + 2 * 86400000),
    endDate: new Date(Date.now() + 2 * 86400000 + 3600000),
    type: "meeting",
    location: "Microsoft Teams",
    attendees: ["Caseworker Team"],
    description: "Quarterly sponsor licence check-in",
    color: "bg-indigo-600",
    completed: false,
    isBackendApp: true,
  },
];

export const MOCK_TEAMS_MEETINGS = [
  {
    id: "teams-mock-1",
    subject: "CoS allocation planning",
    start_time: new Date(Date.now() + 5 * 86400000).toISOString(),
    end_time: new Date(Date.now() + 5 * 86400000 + 3600000).toISOString(),
    attendees: [{ email: "hr@northgate.demo" }],
    description: "Review pending CoS requests",
    join_url: "https://teams.microsoft.com",
  },
];

/** Unwrap axios response or return mock on failure */
export async function withSponsorApiFallback(apiCall, mockValue, { onMock } = {}) {
  try {
    const res = await apiCall();
    return { data: res, usedMock: false };
  } catch {
    if (typeof onMock === "function") onMock();
    return { data: mockValue, usedMock: true };
  }
}
