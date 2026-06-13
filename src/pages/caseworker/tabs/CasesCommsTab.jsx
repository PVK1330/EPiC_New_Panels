import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { formatTime } from "../../../utils/datetime";

function CasesCommsTab({ candidate, caseId }) {
  const navigate = useNavigate();
  const candidateName = typeof candidate === "string" && candidate.trim() ? candidate : "Candidate";
  const initial = candidateName.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { id: "c1", side: "candidate", sender: candidateName, text: "Hi — I've uploaded my passport copy. Please let me know if you need anything else.", time: "1 Apr · 10:32am" },
    { id: "c2", side: "you", sender: "You", text: "Thanks! I still need your English language certificate — please upload by 10 Apr.", time: "1 Apr · 11:05am" },
  ]);

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: `c-${Date.now()}`, side: "you", sender: "You", text: draft.trim(), time: formatTime(new Date()) }]);
    setDraft("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" className="rounded-lg border border-secondary bg-secondary/10 px-3 py-1.5 text-xs font-black text-secondary">
          Candidate chat
        </button>
        <button type="button"
          onClick={() => navigate(`/caseworker/messages${caseId ? `?caseId=${encodeURIComponent(caseId)}` : ""}`)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-600">
          Open full communication
        </button>
      </div>
      <div className="space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.side === "you" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${message.side === "you" ? "bg-gradient-to-br from-secondary to-indigo-500 text-white" : "bg-secondary/15 text-secondary"}`}>
              {message.side === "you" ? "You" : initial}
            </div>
            <div className={`max-w-[85%] ${message.side === "you" ? "text-right" : ""}`}>
              <p className="text-[10px] font-bold text-gray-500 mb-1">{message.sender}</p>
              <div className={`rounded-2xl px-3 py-2 text-left inline-block ${message.side === "you" ? "rounded-br-sm border border-secondary/20 bg-secondary/10" : "rounded-bl-sm border border-gray-100 bg-gray-50"}`}>
                <p className="text-sm font-bold text-gray-800">{message.text}</p>
                <p className="text-[10px] text-gray-500 mt-1">{message.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none" />
        <button type="button" onClick={handleSend}
          className="rounded-xl bg-secondary px-4 py-2 text-xs font-black text-white">
          <Send className="inline mr-1" size={14} />
          Send
        </button>
      </div>
    </div>
  );
}

export default CasesCommsTab;
