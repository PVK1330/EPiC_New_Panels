import { Check } from "lucide-react";

function CasesTimelineTab({ candidate }) {
  const items = [
    { dot: "blue", title: "Document uploaded — Passport copy", time: `1 Apr 2026 · by ${candidate}`, body: null },
    { dot: "green", title: "Status changed → Documents received", time: "1 Apr 2026", body: null },
    { dot: "blue", title: "Document uploaded — Certificate of sponsorship", time: "28 Mar 2026 · by sponsor HR", body: null },
    { dot: "yellow", title: "Task created — Request English language cert", time: "20 Mar 2026", body: "Due 10 Apr 2026" },
    { dot: "green", title: "Case created and onboarded", time: "1 Mar 2026", body: null },
  ];

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={item.title} className="flex gap-3 pb-5 relative">
          {i < items.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
          )}
          <div className={`relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black ${item.dot === "green" ? "border-emerald-500 bg-emerald-50 text-emerald-600" : item.dot === "yellow" ? "border-amber-500 bg-amber-50 text-amber-600" : "border-secondary bg-secondary/10 text-secondary"}`}>
            {item.dot === "green" ? <Check size={12} /> : "●"}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{item.title}</p>
            <p className="text-[11px] font-bold text-gray-500 mt-0.5">{item.time}</p>
            {item.body && (
              <p className="text-xs font-bold text-gray-600 mt-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">{item.body}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CasesTimelineTab;
