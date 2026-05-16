import {
  LayoutDashboard,
  ClipboardList,
  FileCheck,
  Upload,
  BarChart3,
  MessageSquare,
  BellRing,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";

/** Simplified layman-friendly Candidate portal sidebar navigation */
export const candidateNavSections = [
  {
    standalone: true,
    items: [
      { to: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "My Application",
    items: [
      { to: "/candidate/application",          label: "Application Form",    icon: ClipboardList },
      { to: "/candidate/document-checklist",   label: "Document Checklist",  icon: FileCheck },
      { to: "/candidate/upload-documents",     label: "Upload Documents",    icon: Upload },
      { to: "/candidate/application-status",   label: "Track My Progress",   icon: BarChart3 },
    ],
  },
  {
    title: "Communication",
    items: [
      { to: "/candidate/messages",       label: "Messages",       icon: MessageSquare },
      { to: "/candidate/notifications",  label: "Notifications",  icon: BellRing },
      { to: "/candidate/calendar",       label: "Appointments",   icon: Calendar },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/candidate/payments", label: "Payments",    icon: DollarSign },
      { to: "/candidate/account",  label: "My Account",  icon: Package },
    ],
  },
];
