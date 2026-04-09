import { useMemo, useState } from "react";
import MessagePanel from "../../components/messaging/MessagePanel";

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

export default function CandidateMessages() {
  const [threadMessages, setThreadMessages] = useState(() => ({ ...initialMessagesByThread }));
  const [activeThreadId, setActiveThreadId] = useState("sw");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return THREAD_META;
    return THREAD_META.filter(
      (t) => t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q),
    );
  }, [query]);

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
    <MessagePanel
      title="Messages"
      subtitle="Messages with your caseworker and system notices."
      fullBleed={false}
      threads={filteredThreads}
      activeThreadId={activeThreadId}
      onSelectThread={setActiveThreadId}
      query={query}
      onQueryChange={setQuery}
      messagesByThread={threadMessages}
      draft={draft}
      onDraftChange={setDraft}
      onSend={sendMessage}
      showOnline
      onlineThreadId="sw"
    />
  );
}

