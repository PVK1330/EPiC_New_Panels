/** Static dashboard data when API is unavailable (demo / offline). */

export const MOCK_DASHBOARD_STATS = {
  caseStats: {
    totalCases: 248,
    activeCases: 86,
    completedCases: 142,
    pendingCases: 20,
    newImmigrationCases: 11,
    unassignedCases: 5,
    visaExpiryAlerts: 7,
    sponsorExpiryAlerts: 3,
    completionRate: 57,
  },
  reviewStats: {
    pendingLicenceReviews: 6,
    pendingCosRequests: 4,
    pendingComplianceReviews: 9,
  },
  userStats: {
    totalAdmins: 4,
    totalCaseworkers: 18,
    totalCandidates: 312,
    totalSponsors: 24,
    totalUsers: 358,
  },
  financeStats: {
    totalRevenue: 184500,
    totalOutstanding: 12300,
    outstandingSponsors: [
      { name: "Northgate Sponsors Ltd", amount: 4200 },
      { name: "Atlas Global Visas", amount: 3100 },
    ],
  },
  escalations: [
    {
      id: 1,
      caseId: "CAS-104882",
      severity: "Critical",
      triggerType: "Visa expiry",
      trigger: "BRP expires in 14 days — urgent review required",
      status: "Open",
    },
    {
      id: 2,
      caseId: "CAS-103901",
      severity: "High",
      triggerType: "Missing documents",
      trigger: "Passport copy not received after 2 reminders",
      status: "In Progress",
    },
  ],
  teamWorkload: [],
};


export const MOCK_RECENT_CASES = [
  {
    id: 1,
    caseId: "CAS-105201",
    status: "In Progress",
    candidate: { first_name: "Amara", last_name: "Okafor" },
    visaType: { name: "Skilled Worker" },
  },
  {
    id: 2,
    caseId: "CAS-105188",
    status: "Pending",
    candidate: { first_name: "James", last_name: "Mitchell" },
    visaType: { name: "ILR" },
  },
  {
    id: 3,
    caseId: "CAS-105172",
    status: "Docs Pending",
    candidate: { first_name: "Priya", last_name: "Sharma" },
    visaType: { name: "Family Visa" },
  },
  {
    id: 4,
    caseId: "CAS-105160",
    status: "Completed",
    candidate: { first_name: "Tom", last_name: "Brennan" },
    visaType: { name: "Graduate Visa" },
  },
  {
    id: 5,
    caseId: "CAS-105149",
    status: "Under Review",
    candidate: { first_name: "Fatima", last_name: "Hassan" },
    visaType: { name: "Student Visa" },
  },
];

export const MOCK_RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "case",
    title: "Case: CAS-105201",
    description: "New skilled worker enquiry submitted…",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    user: { first_name: "Amara", last_name: "Okafor" },
  },
  {
    id: 2,
    type: "case_note",
    title: "Case Note: Document review",
    description: "Caseworker requested updated passport scan…",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    user: { first_name: "Sarah", last_name: "Mitchell" },
  },
  {
    id: 3,
    type: "task",
    title: "Task: Schedule consultation",
    description: "Initial consultation for ILR application…",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    user: { first_name: "James", last_name: "Okonkwo" },
  },
];

export const MOCK_RECENT_MESSAGES = [
  {
    id: 1,
    user: { id: 1, first_name: "Amara", last_name: "Okafor" },
    lastMessage: {
      content: "Hi, I have some questions about the Skilled Worker visa requirements.",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    unreadCount: 2,
    case: { caseId: "CAS-105201" }
  },
  {
    id: 2,
    user: { id: 2, first_name: "James", last_name: "Mitchell" },
    lastMessage: {
      content: "I've uploaded my passport scan as requested.",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    unreadCount: 0,
    case: { caseId: "CAS-105188" }
  },
  {
    id: 3,
    user: { id: 3, first_name: "Priya", last_name: "Sharma" },
    lastMessage: {
      content: "Can we schedule a consultation for next week?",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    unreadCount: 1,
    case: { caseId: "CAS-105172" }
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Visa expiry alert",
    message: "3 cases require review within the next 30 days.",
    priority: "high",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    title: "Document uploaded",
    message: "New documents submitted for CAS-105201.",
    priority: "medium",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 3,
    title: "Payment received",
    message: "Case fee payment confirmed for CAS-105160.",
    priority: "low",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
