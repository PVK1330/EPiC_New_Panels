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
  DollarSign,
  Activity,
  UserCircle,
  CalendarClock,
  ShieldCheck,
  Bell,
} from "lucide-react";

/** Caseworker portal sidebar — sectioned nav aligned with portal workflow */
export const caseworkerNavSections = (taskCount = 0) => [
  {
    standalone: true,
    items: [
      { to: "/caseworker/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Cases",
    items: [
      { to: "/caseworker/cases", label: "All Cases", icon: Briefcase },
      { to: "/caseworker/tasks", label: "Tasks", icon: ListChecks, badge: taskCount || null },
      { to: "/caseworker/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    title: "Contacts",
    items: [
      { to: "/caseworker/people/candidates", label: "Candidates", icon: User },
      { to: "/caseworker/people/sponsors", label: "Sponsors", icon: Users },
      { to: "/caseworker/licence-reviews", label: "Licence Reviews", icon: ShieldCheck },
    ],
  },
  {
    title: "Documents",
    items: [
      { to: "/caseworker/documents/upload", label: "Upload Documents", icon: Upload },
    ],
  },
  {
    title: "Analytics",
    items: [
      { to: "/caseworker/pipeline", label: "Pipeline", icon: BarChart3 },
      { to: "/caseworker/finance", label: "Finance", icon: DollarSign },
      { to: "/caseworker/performance", label: "Performance", icon: Activity },
    ],
  },
  {
    title: "Inbox",
    items: [
      { to: "/caseworker/messages", label: "Messages", icon: MessageSquare },
      { to: "/caseworker/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "Account",
    items: [
      { to: "/caseworker/my-account", label: "My Account", icon: UserCircle },
      { to: "/caseworker/reschedule-form", label: "Reschedule Form", icon: CalendarClock },
    ],
  },
];
