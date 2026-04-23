import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

function formatRoleTab(roleKey) {
  if (roleKey === "All") return "All";
  if (!roleKey) return roleKey;
  return roleKey.charAt(0).toUpperCase() + roleKey.slice(1).toLowerCase();
}

export default function AdminMessages() {
  const { user } = useSelector((s) => s.auth);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const {
    threads,
    messagesByThread,
    fetchThread,
    sendMessage: apiSendMessage,
    availableUsers,
  } = useMessaging({ activeThreadPartnerId: activeId });

  /** Full directory from `/api/messages/users`, merged with inbox previews from conversations. */
  const mergedThreads = useMemo(() => {
    const myId = user?.id;
    const byUser = new Map();

    (availableUsers || []).forEach((u) => {
      if (u.id == null || u.id === myId) return;
      byUser.set(u.id, {
        id: u.id,
        name: u.name,
        email: u.email || "",
        initials: u.initials,
        role: u.role || "User",
      });
    });

    (threads || []).forEach((t) => {
      if (t.id == null || t.id === myId) return;
      if (!byUser.has(t.id)) {
        byUser.set(t.id, {
          id: t.id,
          name: t.name,
          email: "",
          initials: t.initials,
          role: t.role || "User",
        });
      }
    });

    const rows = Array.from(byUser.values()).map((u) => {
      const convs = (threads || []).filter((t) => t.id === u.id);
      const primary =
        [...convs].sort((a, b) => (b.unread || 0) - (a.unread || 0))[0] || null;
      const unreadTotal = convs.reduce((s, t) => s + (t.unread || 0), 0);
      return {
        id: u.id,
        name: u.name,
        initials: u.initials,
        role: u.role || "User",
        preview:
          primary?.preview ||
          (convs.length ? "Open thread" : "No messages yet — click to start"),
        time: primary?.time || "",
        unread: unreadTotal,
        conversationId: primary?.conversationId,
        caseId: primary?.caseId ?? null,
        caseDisplayId: primary?.caseDisplayId,
        avatarClass: primary?.avatarClass || "bg-indigo-600",
        email: u.email,
      };
    });

    return rows.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      }),
    );
  }, [availableUsers, threads, user?.id]);

  const roleTabs = useMemo(() => {
    const roles = new Set(
      mergedThreads
        .map((t) => (t.role || "").toLowerCase())
        .filter(Boolean),
    );
    return ["All", ...Array.from(roles).sort()];
  }, [mergedThreads]);

  const filteredThreads = useMemo(() => {
    let list = mergedThreads;
    if (roleFilter !== "All") {
      list = list.filter(
        (t) =>
          (t.role || "").toLowerCase() === roleFilter.toLowerCase(),
      );
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          (t.name || "").toLowerCase().includes(q) ||
          (t.email || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [mergedThreads, roleFilter, query]);

  const activeCaseId = useMemo(
    () => mergedThreads.find((t) => t.id === activeId)?.caseId ?? null,
    [mergedThreads, activeId],
  );

  useEffect(() => {
    if (filteredThreads.length > 0) {
      if (
        activeId == null ||
        !filteredThreads.some((t) => t.id === activeId)
      ) {
        setActiveId(filteredThreads[0].id);
      }
    } else {
      setActiveId(null);
    }
  }, [filteredThreads, activeId]);

  useEffect(() => {
    if (activeId) {
      fetchThread(activeId, activeCaseId);
    }
  }, [activeId, activeCaseId, fetchThread]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeId) return;

    const result = await apiSendMessage(activeId, text, activeCaseId);
    if (result.success) {
      setDraft("");
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-3 sm:gap-4 pb-4 sm:pb-6 min-h-0 w-full min-w-0 h-[calc(100dvh-8.5rem)] sm:h-[calc(100vh-140px)] max-h-[calc(100dvh-4rem)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-2 shrink-0">
        <p className="text-xs font-bold text-gray-500">
          Directory from chat users API — filter by role, search by name or email.
        </p>
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl w-full max-w-3xl">
          {roleTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-colors ${
                roleFilter === tab
                  ? "bg-white text-secondary shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {formatRoleTab(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
      <MessagePanel
        title="Admin Messages"
        subtitle="All chat-eligible users (by role). Inbox previews merge when a conversation exists."
        threads={filteredThreads}
        activeThreadId={activeId}
        onSelectThread={setActiveId}
        query={query}
        onQueryChange={setQuery}
        messagesByThread={messagesByThread}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
      />
      </div>
    </motion.div>
  );
}
