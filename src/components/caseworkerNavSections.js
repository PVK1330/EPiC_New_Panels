import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  ListChecks,
  Calendar,
  Upload,
  Search,
  User,
  Users,
  MessageSquare,
  // DollarSign,
  Activity,
  UserCircle,
  CalendarClock,
  Files,
  Settings,
} from "lucide-react";

/** Caseworker portal sidebar — sectioned nav aligned with portal workflow */
export const caseworkerNavSections = (taskCount = 0) => [
  {
    title: "Dashboard",
    standalone: true,
    items: [
      {
        to: "/caseworker/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Cases",
    standalone: true,
    items: [{ to: "/caseworker/cases", label: "Cases", icon: Briefcase }],
  },
  {
    title: "Workflow",
    items: [
      {
        to: "/caseworker/tasks",
        label: "Tasks",
        icon: ListChecks,
        badge: taskCount > 0 ? taskCount : null,
      },
      {
        to: "/caseworker/calendar",
        label: "Calendar",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Documents",
    items: [
      {
        to: "/caseworker/documents/upload",
        label: "Document upload",
        icon: Upload,
      },
      // {
      //   to: "/caseworker/documents/missing",
      //   label: "Missing docs",
      //   icon: Search,
      //   badge: 3,
      // },
    ],
  },
  {
    title: "People",
    items: [
      // {
      //   to: "/caseworker/people/candidates",
      //   label: "Candidate profiles",
      //   icon: User,
      // },
      {
        to: "/caseworker/people/sponsors",
        label: "Sponsor profiles",
        icon: Users,
      },
    ],
  },
  {
    title: "Other",
    items: [
      {
        to: "/caseworker/messages",
        label: "Messages",
        icon: MessageSquare,
      },
      // {
      //   to: "/caseworker/finance",
      //   label: "Finance",
      //   icon: DollarSign,
      // },
      {
        to: "/caseworker/performance",
        label: "Performance",
        icon: Activity,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        to: "/caseworker/my-account",
        label: "My account",
        icon: UserCircle,
      },
      {
        to: "/caseworker/reschedule-form",
        label: "Reschedule form",
        icon: CalendarClock,
      },
    ],
  },
];

/** Section header icons (collapsed toggle row) — mirrors CandidateSidebar */
export function caseworkerSectionHeaderIcon(title) {
  const map = {
    Workflow: BarChart3,
    Documents: Files,
    People: Users,
    Other: Settings,
    Account: UserCircle,
  };
  return map[title] || Settings;
}
