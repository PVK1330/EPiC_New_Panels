import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MessagePanel from "../../components/messaging/MessagePanel";

const CaseworkerMessages = () => {
  const [searchParams] = useSearchParams();
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");

  const THREADS = useMemo(
    () => [
      {
        id: "t1",
        name: "Ahmed Al-Rashid",
        initials: "AR",
        avatarClass: "bg-gradient-to-br from-secondary to-indigo-500 text-white",
        preview: "Uploaded new passport scan.",
        time: "2h",
        unread: 2,
        role: "Candidate",
        caseId: "#C-2401",
      },
      {
        id: "t2",
        name: "TechCorp Ltd (Sponsor)",
        initials: "TC",
        avatarClass: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
        preview: "CoS allocation request submitted.",
        time: "1d",
        unread: 0,
        role: "Sponsor",
      },
      {
        id: "t3",
        name: "Admin Support",
        initials: "AS",
        avatarClass: "bg-gradient-to-br from-primary to-rose-500 text-white",
        preview: "Reminder: update SLA notes.",
        time: "3d",
        unread: 0,
        role: "Internal",
      },
    ],
    [],
  );

  useEffect(() => {
    const caseId = searchParams.get("caseId");
    if (!caseId) return;
    const match = THREADS.find((t) => t.caseId === caseId);
    if (match) setActiveThreadId(match.id);
  }, [searchParams, THREADS]);

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return THREADS;
    return THREADS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q),
    );
  }, [THREADS, query]);

  const [messagesByThread, setMessagesByThread] = useState(() => ({
    t1: [
      { id: "m1", from: "them", text: "Hi, I uploaded my passport copy.", meta: "Ahmed · 1d ago" },
      { id: "m2", from: "me", text: "Thanks — I’ll review and update the checklist.", meta: "You · 1d ago" },
      { id: "m3", from: "them", text: "Uploaded new passport scan.", meta: "Ahmed · 2h ago", attachment: "Passport_Scan.pdf" },
    ],
    t2: [
      { id: "m1", from: "them", text: "We submitted the CoS allocation request.", meta: "TechCorp · 1d ago" },
    ],
    t3: [
      { id: "m1", from: "them", text: "Reminder: update SLA notes for overdue cases.", meta: "Admin · 3d ago" },
    ],
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
      subtitle="Chat with candidates, sponsors, and internal teams."
      threads={filteredThreads}
      activeThreadId={activeThreadId}
      onSelectThread={setActiveThreadId}
      query={query}
      onQueryChange={setQuery}
      messagesByThread={messagesByThread}
      draft={draft}
      onDraftChange={setDraft}
      onSend={sendMessage}
      placeholder="Type a message…"
    />
  );
};

export default CaseworkerMessages;

