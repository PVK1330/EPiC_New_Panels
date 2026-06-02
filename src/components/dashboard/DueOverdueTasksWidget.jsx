import { Link } from "react-router-dom";
import { AlertTriangle, Clock } from "lucide-react";
import { formatDate } from "../../utils/datetime";

function TaskList({ title, items, tone, emptyLabel, defaultLink }) {
  const isOverdue = tone === "overdue";
  return (
    <div className="flex-1 min-w-0">
      <h4
        className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5 ${
          isOverdue ? "text-red-600" : "text-amber-700"
        }`}
      >
        {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
        {title}
      </h4>
      <ul className="space-y-2">
        {items.length === 0 && (
          <li className="text-xs font-bold text-gray-400 py-2">{emptyLabel}</li>
        )}
        {items.map((item) => {
          const href = item.actionLink || defaultLink;
          const inner = (
            <>
              {item.type === "case" ? (
                <>
                  <span className="font-black">{item.caseId}</span>
                  {item.needsAssignment && (
                    <span className="ml-1.5 text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-1 py-0.5 rounded">
                      Assign CW
                    </span>
                  )}
                  <span className="block text-[10px] opacity-80 mt-0.5">
                    {item.candidateName} · due {item.targetSubmissionDate}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-black">{item.title}</span>
                  <span className="block text-[10px] opacity-80 mt-0.5">
                    {item.caseId ? `${item.caseId} · ` : ""}
                    due{" "}
                    {item.dueDate ? formatDate(item.dueDate) : "—"}
                  </span>
                </>
              )}
            </>
          );

          return (
            <li
              key={`${item.type}-${item.id}`}
              className={`text-xs rounded-lg px-3 py-2 border transition-colors ${
                isOverdue
                  ? "bg-red-50/80 border-red-100 text-red-900 hover:bg-red-50"
                  : "bg-amber-50/80 border-amber-100 text-amber-900 hover:bg-amber-50"
              }`}
            >
              {href ? (
                <Link to={href} className="block hover:underline">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
      {defaultLink && items.length > 0 && (
        <Link
          to={defaultLink}
          className="inline-block mt-2 text-[10px] font-black text-primary hover:underline"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

export default function DueOverdueTasksWidget({
  data,
  casesLink = "/admin/cases",
  tasksLink,
}) {
  if (!data) return null;

  const dueItems = [...(data.dueCases || []), ...(data.dueTasks || [])].slice(0, 5);
  const overdueItems = [
    ...(data.overdueCases || []),
    ...(data.overdueTasks || []),
  ].slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-black text-secondary mb-4">Due & overdue</h3>
      <div className="flex flex-col md:flex-row gap-6">
        <TaskList
          title={`Due soon (${data.counts?.dueCases ?? 0} cases, ${data.counts?.dueTasks ?? 0} tasks)`}
          items={dueItems}
          tone="due"
          emptyLabel="Nothing due in the next 48 hours"
          defaultLink={casesLink}
        />
        <TaskList
          title={`Overdue (${data.counts?.overdueCases ?? 0} cases, ${data.counts?.overdueTasks ?? 0} tasks)`}
          items={overdueItems}
          tone="overdue"
          emptyLabel="No overdue items"
          defaultLink={tasksLink || casesLink}
        />
      </div>
    </div>
  );
}
