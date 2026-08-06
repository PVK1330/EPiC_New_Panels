import {
  LayoutDashboard,
  ClipboardList,
  FileCheck,
  FileSignature,
  Upload,
  BarChart3,
  MessageSquare,
  BellRing,
  Calendar,
  Wallet,
  Package,
  ListChecks,
} from "lucide-react";

export const candidateNavSections = [
  {
    standalone: true,
    items: [
      { to: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard, moduleKey: "candidate.dashboard" },
    ],
  },
  {
    title: "My Application",
    items: [
      { to: "/candidate/application",        label: "Application Form",   icon: ClipboardList,  moduleKey: "candidate.application" },
      { to: "/candidate/document-checklist", label: "Document Checklist", icon: FileCheck,      moduleKey: "candidate.document-checklist" },
      { to: "/candidate/upload-documents",   label: "Upload Documents",   icon: Upload,         moduleKey: "candidate.document-checklist" },
      { to: "/candidate/ccl",                label: "Client Care Letter", icon: FileSignature,  moduleKey: "candidate.application" },
      { to: "/candidate/application-status", label: "Track My Progress",  icon: BarChart3,      moduleKey: "candidate.application-status" },
    ],
  },
  {
    title: "Tasks",
    items: [
      { to: "/candidate/tasks", label: "My Tasks", icon: ListChecks, moduleKey: "candidate.application" },
    ],
  },
  {
    title: "Communication",
    items: [
      { to: "/candidate/messages",      label: "Messages",      icon: MessageSquare, moduleKey: "candidate.messages" },
      { to: "/candidate/notifications", label: "Notifications", icon: BellRing,      moduleKey: "candidate.dashboard" },
      { to: "/candidate/calendar",      label: "Appointments",  icon: Calendar,      moduleKey: "candidate.calendar" },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/candidate/payments", label: "Payments",   icon: Wallet, moduleKey: "candidate.payments" },
      { to: "/candidate/account",  label: "My Account", icon: Package,    moduleKey: "candidate.account" },
    ],
  },
];
