import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RiMessage2Line } from "react-icons/ri";
import MessagePanel from "../../components/messaging/MessagePanel";

/* ─── Mock Conversations ────────────────────────── */
const CONVERSATIONS = [
  {
    id: "c1",
    name: "Priya Sharma",
    role: "Client · Case #VF-2841",
    initials: "PS",
    color: "bg-blue-500",
    online: true,
    preview: "Yes, PDF is ideal. Please make sure all 3 months are clearly visible.",
    time: "11:52",
    unread: 0,
    caseId: "VF-2841",
  },
  {
    id: "c2",
    name: "Alice Patel",
    role: "Caseworker · Team",
    initials: "AP",
    color: "bg-emerald-500",
    online: true,
    preview: "Can you review case 2841?",
    time: "10:30",
    unread: 2,
    caseId: null,
  },
  {
    id: "c3",
    name: "TechNova HR",
    role: "Business · Sponsor",
    initials: "TN",
    color: "bg-violet-500",
    online: false,
    preview: "CoS ref TN-2841 issued",
    time: "Yesterday",
    unread: 0,
    caseId: null,
  },
  {
    id: "c4",
    name: "James Osei",
    role: "Caseworker · Team",
    initials: "JO",
    color: "bg-orange-500",
    online: false,
    preview: "Escalating case 2835",
    time: "Yesterday",
    unread: 1,
    caseId: null,
  },
  {
    id: "c5",
    name: "GlobalHire Inc",
    role: "Business · Sponsor",
    initials: "GH",
    color: "bg-amber-500",
    online: false,
    preview: "Payment query about invoice",
    time: "2 Apr",
    unread: 0,
    caseId: null,
  },
];

/* ─── Mock Messages per Conversation ────────────── */
const INITIAL_MESSAGES = {
  c1: [
    { id: "m1", from: "other", text: "Hello, I've uploaded my English language certificate to the portal. Could you please confirm receipt?", time: "2 Apr · 10:15", file: null },
    { id: "m2", from: "me",    text: "Hi Priya, yes we've received it. It's currently under review. We'll update you shortly. One important item: we still need 3 months of bank statements uploaded by 10th April.", time: "2 Apr · 11:30", file: null },
    { id: "m3", from: "other", text: "Of course, I'll get those uploaded today. Should they be in PDF format?", time: "2 Apr · 11:45", file: null },
    { id: "m4", from: "me",    text: "Yes, PDF is ideal. Please make sure all 3 months are clearly visible. Thank you!", time: "2 Apr · 11:52", file: null },
  ],
  c2: [
    { id: "m1", from: "other", text: "Hi, can you review case #VF-2841? The documents look complete now.", time: "Today · 09:45", file: null },
    { id: "m2", from: "me",    text: "Sure, I'll take a look at it now.", time: "Today · 10:02", file: null },
    { id: "m3", from: "other", text: "Thanks! Also there's a missing BRP for Omar Farouk — can you action that?", time: "Today · 10:30", file: null },
  ],
  c3: [
    { id: "m1", from: "other", text: "CoS ref TN-2841 has been issued. Please update the system accordingly.", time: "Yesterday · 14:20", file: null },
    { id: "m2", from: "me",    text: "Received, thank you. We'll update the case record immediately.", time: "Yesterday · 14:35", file: null },
  ],
  c4: [
    { id: "m1", from: "other", text: "I'm escalating case #VF-2835 — the applicant has not responded in 7 days.", time: "Yesterday · 09:10", file: null },
    { id: "m2", from: "me",    text: "Acknowledged. I'll escalate it and assign to senior review right away.", time: "Yesterday · 09:30", file: null },
  ],
  c5: [
    { id: "m1", from: "other", text: "Hi, we have a query about invoice INV-4421. It seems the payment was duplicated.", time: "2 Apr · 16:00", file: null },
    { id: "m2", from: "me",    text: "Thank you for flagging this. I'll check the finance records and get back to you within 24 hours.", time: "2 Apr · 16:22", file: null },
  ],
};

/* ─── Component ──────────────────────────────────── */
export default function AdminMessages() {
  const [activeId, setActiveId] = useState("c1");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const threads = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = CONVERSATIONS.map((c) => ({
      id: c.id,
      initials: c.initials,
      name: c.name,
      role: c.role,
      preview: c.preview,
      time: c.time,
      unread: c.unread,
      avatarClass: c.color.replace("bg-", "bg-") + " text-white",
    }));
    if (!q) return base;
    return base.filter((t) => t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q));
  }, [query]);

  const [messagesByThread, setMessagesByThread] = useState(() => {
    const mapped = {};
    for (const [id, msgs] of Object.entries(INITIAL_MESSAGES)) {
      mapped[id] = msgs.map((m) => ({
        id: `${id}-${m.id}`,
        from: m.from === "me" ? "me" : "them",
        text: m.text ?? "",
        meta: m.time,
        attachment: m.file?.name,
      }));
    }
    return mapped;
  });

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessagesByThread((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        { id: `${Date.now()}`, from: "me", text, meta: "You · Just now" },
      ],
    }));
    setDraft("");
  };

  return (
    <motion.div
      className="flex flex-col gap-4 pb-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MessagePanel
        title="Messages"
        subtitle="Internal team chat and client communication"
        threads={threads}
        activeThreadId={activeId}
        onSelectThread={setActiveId}
        query={query}
        onQueryChange={setQuery}
        messagesByThread={messagesByThread}
        draft={draft}
        onDraftChange={setDraft}
        onSend={sendMessage}
      />
    </motion.div>
  );
}
