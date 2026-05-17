export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export const ROLE_NAMES = {
  1: "candidate",
  2: "caseworker",
  3: "admin",
  4: "business",
  5: "superadmin",
};

export const ROLE_ROUTES = {
  1: "/candidate/dashboard",
  2: "/caseworker/dashboard",
  3: "/admin/dashboard",
  4: "/business/dashboard",
  5: "/superadmin/dashboard",
};

export const DOCUMENT_TYPE_OPTIONS = [
  "General",
  "Data Capture Sheet",
  "Client Care Letter",
  "Decision Letter",
  "Approval Notice",
  "Visa Copy",
  "BRP Information",
  "Passport",
  "Visa",
  "Right to Work",
  "English Certificate",
  "Certificate of Sponsorship",
  "Job Offer Letter",
  "Bank Statement",
  "Employment Contract",
  "Academic Certificate",
  "Utility Bill",
  "BRP Card",
  "National ID",
  "Sponsor Documents",
  "Other",
];
