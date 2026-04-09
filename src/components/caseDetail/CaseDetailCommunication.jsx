import { useState } from "react";
import { motion } from "framer-motion";
import Button from "../Button";

const CaseDetailCommunication = ({ threads, messages }) => {
  const [activeId, setActiveId] = useState(threads.find((t) => t.active)?.id || threads[0]?.id);
  const [draft, setDraft] = useState("");

  const active = threads.find((t) => t.id === activeId) || threads[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[420px] lg:min-h-[480px]"
    >
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col max-h-48 lg:max-h-none lg:min-h-0">
        <p className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50/80">
          Threads
        </p>
        <div className="overflow-y-auto flex-1">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                activeId === t.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-gray-50 border-l-4 border-l-transparent"
              }`}
            >
              <p className="text-sm font-bold text-secondary truncate">{t.name}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{t.preview}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-secondary flex items-center justify-center text-sm font-black shrink-0">
            PS
          </div>
          <div>
            <p className="text-sm font-bold text-secondary">
              {active?.name?.replace(/\s*\([^)]*\)\s*/g, "").trim() || "Thread"}
            </p>
            <p className="text-[11px] text-gray-400">
              {active?.name?.includes("Internal") ? "Internal" : active?.name?.includes("HR") ? "Sponsor" : "Client"} · Online
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.in ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.in ? "bg-white border border-gray-200 text-secondary shadow-sm" : "bg-secondary text-white"
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-1.5 ${m.in ? "text-gray-400" : "text-white/70"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100 flex gap-2 bg-white">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
          <Button type="button" variant="primary" className="rounded-xl shrink-0 px-5" onClick={() => setDraft("")}>
            Send
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CaseDetailCommunication;
