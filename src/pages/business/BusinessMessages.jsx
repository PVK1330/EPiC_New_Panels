import { useMemo, useState } from "react";
import MessagePanel from "../../components/messaging/MessagePanel";

const BusinessMessages = () => {
  const [activeThreadId, setActiveThreadId] = useState("b1");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  const THREADS = useMemo(
    () => [
      {
        id: "b1",
        initials: "AS",
        name: "Admin Support",
        role: "Support",
        preview: "Your COS payment has been processed",
        time: "2h",
        unread: 2,
        avatarClass: "bg-gradient-to-br from-secondary to-indigo-500 text-white",
      },
      {
        id: "b2",
        initials: "CT",
        name: "Compliance Team",
        role: "Compliance",
        preview: "Your Q4 audit is scheduled for Jan 15",
        time: "1d",
        unread: 0,
        avatarClass: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
      },
      {
        id: "b3",
        initials: "FD",
        name: "Finance Department",
        role: "Finance",
        preview: "Invoice #INV-2024-001 is due",
        time: "3d",
        unread: 0,
        avatarClass: "bg-gradient-to-br from-primary to-rose-500 text-white",
      },
    ],
    [],
  );

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return THREADS;
    return THREADS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q),
    );
  }, [THREADS, query]);

  const [messagesByThread, setMessagesByThread] = useState(() => ({
    b1: [
      { id: "m1", from: "them", text: "Hello, how can I help you today?", meta: "Admin · 1d ago" },
      { id: "m2", from: "me", text: "I need to update our worker details.", meta: "You · 1d ago" },
      { id: "m3", from: "them", text: "Your COS payment has been processed.", meta: "Admin · 2h ago" },
    ],
    b2: [{ id: "m1", from: "them", text: "Your Q4 audit is scheduled for Jan 15.", meta: "Compliance · 1d ago" }],
    b3: [{ id: "m1", from: "them", text: "Invoice #INV-2024-001 is due.", meta: "Finance · 3d ago" }],
  }));

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessagesByThread((prev) => ({
      ...prev,
      [activeThreadId]: [
        ...(prev[activeThreadId] ?? []),
        { id: `${Date.now()}`, from: "me", text, meta: "You · Just now" },
      ],
    }));
    setDraft("");
  };

  return (
    <MessagePanel
      title="Messages"
      subtitle="Chat with admin and support teams."
      threads={filteredThreads}
      activeThreadId={activeThreadId}
      onSelectThread={setActiveThreadId}
      query={query}
      onQueryChange={setQuery}
      messagesByThread={messagesByThread}
      draft={draft}
      onDraftChange={setDraft}
      onSend={sendMessage}
    />
  );
};

export default BusinessMessages;
