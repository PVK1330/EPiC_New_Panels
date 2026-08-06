import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  ListChecks,
  Calendar,
  Upload,
  User,
  Users,
  MessageSquare,
  Wallet,
  Activity,
  UserCircle,
  CalendarClock,
  ShieldCheck,
  Bell,
  FileText,
} from "lucide-react";

export const caseworkerNavSections = (taskCount = 0) => [
  {
    standalone: true,
    items: [
      { to: "/caseworker/dashboard", label: "Dashboard", icon: LayoutDashboard, moduleKey: "caseworker.dashboard" },
    ],
  },
  {
    title: "Cases",
    items: [
      { to: "/caseworker/cases",    label: "All Cases", icon: Briefcase,  moduleKey: "caseworker.cases" },
      { to: "/caseworker/ccl-templates", label: "CCL Templates", icon: FileText, moduleKey: "caseworker.cases" },
      { to: "/caseworker/tasks",    label: "Tasks",     icon: ListChecks, moduleKey: "caseworker.tasks", badge: taskCount || null },
      { to: "/caseworker/calendar", label: "Calendar",  icon: Calendar,   moduleKey: "caseworker.calendar" },
    ],
  },
  {
    title: "Contacts",
    items: [
      { to: "/caseworker/people/candidates", label: "Clients",      icon: User,        moduleKey: "caseworker.people" },
      { to: "/caseworker/people/sponsors",   label: "Sponsors",        icon: Users,       moduleKey: "caseworker.people" },
      { to: "/caseworker/licence-reviews",   label: "Licence Reviews", icon: ShieldCheck, moduleKey: "caseworker.licence-reviews" },
      { to: "/caseworker/cos-requests",      label: "CoS Requests",    icon: ShieldCheck, moduleKey: "caseworker.licence-reviews" },
      { to: "/caseworker/compliance-review", label: "Compliance Review", icon: ShieldCheck, moduleKey: "caseworker.licence-reviews" },
    ],
  },
  {
    title: "Documents",
    items: [
      { to: "/caseworker/documents/upload", label: "Upload Documents", icon: Upload, moduleKey: "caseworker.documents" },
    ],
  },
  {
    title: "Analytics",
    items: [
      { to: "/caseworker/pipeline",    label: "Pipeline",    icon: BarChart3,  moduleKey: "caseworker.pipeline" },
      { to: "/caseworker/finance",     label: "Finance",     icon: Wallet, moduleKey: "caseworker.finance" },
      { to: "/caseworker/performance", label: "Performance", icon: Activity,   moduleKey: "caseworker.performance" },
    ],
  },
  {
    title: "Inbox",
    items: [
      { to: "/caseworker/messages",      label: "Messages",      icon: MessageSquare, moduleKey: "caseworker.messages" },
      { to: "/caseworker/notifications", label: "Notifications", icon: Bell,          moduleKey: "caseworker.dashboard" },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/caseworker/my-account",      label: "My Account",      icon: UserCircle,    moduleKey: "caseworker.dashboard" },
      { to: "/caseworker/reschedule-form", label: "Reschedule Form", icon: CalendarClock, moduleKey: "caseworker.calendar" },
    ],
  },
];
