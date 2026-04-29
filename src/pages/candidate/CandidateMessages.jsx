import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import MessagePanel from "../../components/messaging/MessagePanel";
import useMessaging from "../../hooks/useMessaging";

export default function CandidateMessages() {
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
        rawTime: primary?.rawTime || null,
        unread: unreadTotal,
        conversationId: primary?.conversationId,
        caseId: primary?.caseId ?? null,
        caseDisplayId: primary?.caseDisplayId,
        avatarClass: primary?.avatarClass || "bg-indigo-600",
        email: u.email,
      };
    });

    return rows.sort((a, b) => {
      const timeA = a.rawTime ? new Date(a.rawTime).getTime() : 0;
      const timeB = b.rawTime ? new Date(b.rawTime).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      });
    });
  }, [availableUsers, threads, user?.id]);

  const roleTabs = useMemo(() => {
    const roles = new Set(["admin", "business", "caseworker"]);
    mergedThreads.forEach((t) => {
      if (t.role) {
        const r = t.role.toLowerCase();
        if (r === "sponsor") roles.add("business");
        else roles.add(r);
      }
    });
    return ["All", ...Array.from(roles).filter(r => r !== "candidate").sort()];
  }, [mergedThreads]);

  const filteredThreads = useMemo(() => {
    let list = mergedThreads;
    if (roleFilter !== "All") {
      list = list.filter((t) => {
        const r = (t.role || "").toLowerCase();
        if (roleFilter === "business") return r === "business" || r === "sponsor";
        return r === roleFilter.toLowerCase();
      });
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

  const handleSend = async (file) => {
    const text = draft.trim();
    if (!text && !file) return false;
    if (!activeId) return false;

    const result = await apiSendMessage(activeId, text, activeCaseId, file);
    if (result.success) {
      setDraft("");
      return true;
    }
    return false;
  };

  return (
    <div className="flex flex-col min-h-0 h-[calc(100dvh-96px)] md:h-[calc(100vh-128px)] gap-3 sm:gap-4 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2 shrink-0 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-secondary tracking-tight">
            Messaging Center
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-500 line-clamp-2">
            Communicate securely with admins and your assigned caseworker.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <MessagePanel
          embedded={true}
          threads={filteredThreads}
          activeThreadId={activeId}
          onSelectThread={setActiveId}
          query={query}
          onQueryChange={setQuery}
          messagesByThread={messagesByThread}
          draft={draft}
          onDraftChange={setDraft}
          onSend={handleSend}
          showOnline
          filterNode={
            roleTabs.length > 2 ? (
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full">
                {roleTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setRoleFilter(tab)}
                    className={`flex-1 text-[11px] font-semibold py-1.5 px-2 rounded-lg transition-all duration-150 whitespace-nowrap capitalize ${
                      roleFilter === tab
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab === "All" ? "All" : tab}
                  </button>
                ))}
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}

