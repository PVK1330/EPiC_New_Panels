import {
  LayoutDashboard,
  Files,
  CreditCard,
  MessageSquare,
  ClipboardList,
  FileCheck,
  Upload,
  Handshake,
  BarChart3,
  BellRing,
  DollarSign,
  Receipt,
  Package,
  Star,
  Settings,
  Calendar,
} from "lucide-react";

/** Candidate portal sidebar: sections, routes, and icons */
export const candidateNavSections = [
  {
    title: "Dashboard",
    standalone: true,
    items: [
      { to: "/candidate/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "My Application",
    standalone: true,
    items: [
      {
        to: "/candidate/application",
        label: "Application form",
        icon: ClipboardList,
      },
    ],
  },
  {
    title: "Documents",
    items: [
      {
        to: "/candidate/document-checklist",
        label: "Document Checklist",
        icon: FileCheck,
      },
      {
        to: "/candidate/upload-documents",
        label: "Upload Documents",
        icon: Upload,
      },
      // {
      //   to: "/candidate/third-party-docs",
      //   label: "Third-Party Documents",
      //   icon: Handshake,
      // },
    ],
  },
  {
    title: "Case Tracking",
    items: [
      {
        to: "/candidate/application-status",
        label: "Application Status",
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
    ],
  },
  {
    title: "Appointments",
    items: [
      {
        to: "/candidate/appointments",
        label: "Appointments",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        to: "/candidate/payments",
        label: "Payment Summary",
        icon: DollarSign,
        paymentTab: "summary",
      },
      {
        to: "/candidate/payments?tab=history",
        label: "Payment History",
        icon: Receipt,
        paymentTab: "history",
      },
    ],
  },
  {
    title: "Downloads",
    items: [
      {
        to: "/candidate/account",
        label: "Application Pack",
        icon: Package,
        accountTab: "downloads-pack",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        to: "/candidate/account?tab=feedback",
        label: "Feedback",
        icon: Star,
        accountTab: "feedback",
      },
      {
        to: "/candidate/account?tab=profile",
        label: "Profile & Settings",
        icon: Settings,
        accountTab: "profile",
      },
    ],
  },
];
