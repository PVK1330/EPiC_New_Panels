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
    title: "Home",
    standalone: true,
    items: [
      { to: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Application & Files",
    items: [
      {
        to: "/candidate/application",
        label: "Application form",
        icon: ClipboardList,
      },
      {
        to: "/candidate/document-checklist",
        label: "Document checklist",
        icon: FileCheck,
      },
      {
        to: "/candidate/upload-documents",
        label: "Upload documents",
        icon: Upload,
      },
    ],
  },
  {
    title: "Progress Tracking",
    items: [
      {
        to: "/candidate/application-status",
        label: "Live tracking",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        to: "/candidate/messages",
        label: "Messages",
        icon: MessageSquare,
      },
      {
        to: "/candidate/notifications",
        label: "Notifications",
        icon: BellRing,
      },
      {
        to: "/candidate/calendar",
        label: "Appointments",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Billing & Downloads",
    items: [
      {
        to: "/candidate/payments",
        label: "Payments",
        icon: DollarSign,
      },
      {
        to: "/candidate/account",
        label: "Downloads & Profile",
        icon: Package,
      },
    ],
  },
];
