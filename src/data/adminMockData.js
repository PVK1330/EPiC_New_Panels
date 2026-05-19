/** Demo data when reporting/workload APIs are unavailable */

export const MOCK_WORKLOAD_TEAM = [
  {
    caseworker_id: 1,
    caseworker_name: "Sarah Mitchell",
    active_cases: 12,
    overdue: 2,
    tasks_pending: 5,
    avg_completion_time_days: 4.2,
    workload_percentage: 72,
  },
  {
    caseworker_id: 2,
    caseworker_name: "James Okonkwo",
    active_cases: 18,
    overdue: 5,
    tasks_pending: 9,
    avg_completion_time_days: 5.8,
    workload_percentage: 88,
  },
  {
    caseworker_id: 3,
    caseworker_name: "Priya Sharma",
    active_cases: 8,
    overdue: 0,
    tasks_pending: 3,
    avg_completion_time_days: 3.1,
    workload_percentage: 54,
  },
];

export const MOCK_WORKLOAD_TASKS = [
  {
    id: 101,
    title: "Review draft application — Skilled Worker",
    case_id: 3041,
    assigned_caseworker_name: "Sarah Mitchell",
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: "pending",
  },
  {
    id: 102,
    title: "Chase missing BRP copy",
    case_id: 2988,
    assigned_caseworker_name: "James Okonkwo",
    due_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "pending",
  },
  {
    id: 103,
    title: "Submit CCL fee proposal",
    case_id: 3102,
    assigned_caseworker_name: "Priya Sharma",
    due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: "in-progress",
  },
];

export const MOCK_WORKLOAD_DEADLINES = [
  {
    id: 1,
    caseId: "CAS-304954",
    candidate_name: "Amina Hassan",
    assigned_caseworker_name: "Sarah Mitchell",
    target_submission_date: new Date(Date.now() + 10 * 86400000).toISOString(),
  },
  {
    id: 2,
    caseId: "CAS-301102",
    candidate_name: "David Chen",
    assigned_caseworker_name: "James Okonkwo",
    target_submission_date: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
  {
    id: 3,
    caseId: "CAS-299441",
    candidate_name: "Elena Popescu",
    assigned_caseworker_name: "Priya Sharma",
    target_submission_date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const MOCK_FINANCE_STATS = {
  summary: {
    totalRevenue: 125000,
    totalOutstanding: 18400,
    totalPaid: 42,
  },
  statusBreakdown: [
    { status: "completed", count: 38 },
    { status: "pending", count: 6 },
  ],
  byVisaType: [
    { name: "Skilled Worker", total: 52000 },
    { name: "Student", total: 28000 },
    { name: "Family", total: 45000 },
  ],
  bySponsor: [
    { name: "Tech Solutions Ltd", total: 35000 },
    { name: "Global Health NHS Trust", total: 42000 },
    { name: "Innovation Labs", total: 18000 },
  ],
};

export const MOCK_FINANCE_TRANSACTIONS = [
  {
    id: "TXN-88421",
    client: "Amina Hassan",
    caseId: "CAS-304954",
    amount: "£2,400",
    type: "Invoice",
    status: "Paid",
    date: "10 May 2026",
  },
  {
    id: "TXN-88419",
    client: "David Chen",
    caseId: "CAS-301102",
    amount: "£1,800",
    type: "Invoice",
    status: "Pending",
    date: "8 May 2026",
  },
  {
    id: "TXN-88402",
    client: "Elena Popescu",
    caseId: "CAS-299441",
    amount: "£3,200",
    type: "Invoice",
    status: "Paid",
    date: "2 May 2026",
  },
  {
    id: "TXN-88390",
    client: "Tech Solutions Ltd",
    caseId: "CAS-298001",
    amount: "£5,000",
    type: "Invoice",
    status: "Pending",
    date: "28 Apr 2026",
  },
];

export const MOCK_REPORT_CASE_TYPES = [
  { type: "Skilled Worker", count: 48 },
  { type: "Student", count: 22 },
  { type: "Family (Partner)", count: 15 },
  { type: "Global Talent", count: 9 },
];

export const MOCK_REPORT_WORKLOAD = MOCK_WORKLOAD_TEAM.map((c) => ({
  id: c.caseworker_id,
  name: c.caseworker_name,
  email: `${c.caseworker_name.split(" ")[0].toLowerCase()}@demo.epic.local`,
  activeCases: c.active_cases,
  completedCases: 24,
  totalCases: c.active_cases + 24,
  slaMetPct: 100 - Math.min(c.workload_percentage, 40),
}));

export const MOCK_REPORT_FINANCE = {
  byVisaType: MOCK_FINANCE_STATS.byVisaType.map((v) => ({ name: v.name, total: v.total })),
  bySponsor: MOCK_FINANCE_STATS.bySponsor.map((s) => ({ name: s.name, total: s.total })),
};

export const MOCK_REPORT_SUMMARY = {
  totalCases: 94,
  activeCases: 38,
  completedCases: 56,
  slaCompliancePct: 87,
  totalRevenue: 125000,
};
