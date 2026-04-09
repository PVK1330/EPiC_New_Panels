import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Bell,
} from "lucide-react";
import MessagePanel from "../../components/messaging/MessagePanel";
import NotificationsPanel from "../../components/notifications/NotificationsPanel";

const initialMessagesByThread = {
  sw: [
    {
      id: "m1",
      from: "them",
      text: "Hello! I've reviewed your initial documents. Your passport and employment contract look great — those have been approved.",
      meta: "Sarah Wilson · 9 Apr, 2:14pm",
    },
    {
      id: "m2",
      from: "me",
      text: "Thank you! I'll get those uploaded as soon as possible.",
      meta: "You · 9 Apr, 2:45pm",
    },
    {
      id: "m3",
      from: "them",
      text: "Great. One more thing — the bank statement you uploaded for February didn't meet the 28-day balance requirement. Please re-upload the March statement showing a minimum balance of £1,270.",
      meta: "Sarah Wilson · 10 Apr, 3:15pm",
      attachment: "Document_Requirements.pdf",
    },
    {
      id: "m4",
      from: "me",
      text: "Understood! I'll sort that right away.",
      meta: "You · 10 Apr, 3:30pm",
    },
    {
      id: "m5",
      from: "them",
      text: "Also, please upload your Certificate of Sponsorship from your employer when you have it. That's the last key document we need before we can move to review stage.",
      meta: "Sarah Wilson · 11 Apr, 10:00am · Unread",
      unread: true,
    },
  ],
  sys: [
    {
      id: "s1",
      from: "them",
      text: "Reminder: Your document checklist deadline is approaching. Please complete missing uploads.",
      meta: "System · 10 Apr, 8:00am",
    },
  ],
};

const THREAD_META = [
  {
    id: "sw",
    initials: "SW",
    name: "Sarah Wilson",
    role: "Senior caseworker",
    preview: "Please upload your latest bank statements…",
    time: "2h",
    unread: 2,
    avatarClass: "bg-gradient-to-br from-secondary to-indigo-500 text-white",
  },
  {
    id: "sys",
    initials: "SY",
    name: "System",
    role: "Automated notices",
    preview: "Reminder: Document checklist deadline…",
    time: "10 Apr",
    unread: 0,
    avatarClass: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
  },
];

const NOTIFICATIONS = [
  {
    id: "n1",
    icon: "📤",
    title: "Document request — Certificate of Sponsorship",
    body: "Your caseworker has requested your Certificate of Sponsorship from your employer.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n2",
    icon: "❌",
    title: "Document rejected — Bank statement (February)",
    body: "Your bank statement was rejected. Please re-upload with a balance of £1,270+ for 28 days.",
    time: "11 Apr, 10:32am",
    unread: true,
  },
  {
    id: "n3",
    icon: "💰",
    title: "Payment reminder — £800 balance due",
    body: "Your remaining balance of £800 is due by 30 Apr 2026.",
    time: "10 Apr, 9:00am",
    unread: true,
  },
  {
    id: "n4",
    icon: "📅",
    title: "Deadline alert — Passport upload",
    body: "Your passport upload is due on 18 Apr. Don't miss this deadline.",
    time: "10 Apr, 8:00am",
    unread: true,
  },
  {
    id: "n5",
    icon: "✅",
    title: "Document approved — Employment contract",
    body: "Your employment contract has been reviewed and approved.",
    time: "9 Apr, 4:00pm",
    unread: false,
  },
  {
    id: "n6",
    icon: "🚀",
    title: "Case created — VT-2024-0841",
    body: "Your visa application case has been created. Welcome!",
    time: "5 Apr, 9:00am",
    unread: false,
  },
];

const Communication = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "notifications" ? "notifications" : "messages";

  const setTab = useCallback(
    (next) => {
      if (next === "messages") {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: "notifications" }, { replace: true });
      }
    },
    [setSearchParams],
  );

  const unreadNotifCount = useMemo(
    () => NOTIFICATIONS.filter((n) => n.unread).length,
    [],
  );

  const [threadMessages, setThreadMessages] = useState(() => ({
    ...initialMessagesByThread,
  }));
  const [activeThreadId, setActiveThreadId] = useState("sw");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return THREAD_META;
    return THREAD_META.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q),
    );
  }, [query]);

  const messagesByThread = threadMessages;

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setThreadMessages((prev) => ({
      ...prev,
      [activeThreadId]: [
        ...(prev[activeThreadId] ?? []),
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          from: "me",
          text,
          meta: `You · Just now`,
        },
      ],
    }));
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-0 pb-4 -mx-4 md:-mx-8 px-4 md:px-8 min-h-0 animate-in fade-in duration-500">
      <header className="pt-2 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
          Communication
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Messages with your caseworker and system notifications.
        </p>
      </header>

      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("messages")}
          className={`inline-flex items-center gap-2 rounded-t-xl border border-b-0 px-4 py-3 text-xs font-black uppercase tracking-wide transition-all ${
            tab === "messages"
              ? "border-gray-200 bg-white text-secondary relative z-10 mb-[-1px]"
              : "border-transparent text-gray-500 hover:text-primary"
          }`}
        >
          <MessageSquare size={16} />
          Messages
        </button>
        <button
          type="button"
          onClick={() => setTab("notifications")}
          className={`inline-flex items-center gap-2 rounded-t-xl border border-b-0 px-4 py-3 text-xs font-black uppercase tracking-wide transition-all ${
            tab === "notifications"
              ? "border-gray-200 bg-white text-secondary relative z-10 mb-[-1px]"
              : "border-transparent text-gray-500 hover:text-primary"
          }`}
        >
          <Bell size={16} />
          Notifications
          {unreadNotifCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white tabular-nums">
              {unreadNotifCount}
            </span>
          )}
        </button>
      </div>

      {tab === "messages" && (
        <MessagePanel
          embedded
          threads={filteredThreads}
          activeThreadId={activeThreadId}
          onSelectThread={setActiveThreadId}
          query={query}
          onQueryChange={setQuery}
          messagesByThread={messagesByThread}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendMessage}
          showOnline
          onlineThreadId="sw"
        />
      )}

      {tab === "notifications" && (
        <NotificationsPanel embedded title="Notifications" notifications={NOTIFICATIONS} />
      )}
    </div>
  );
};

export default Communication;
