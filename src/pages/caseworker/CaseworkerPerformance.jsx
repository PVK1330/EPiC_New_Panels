import { useMemo } from "react";
import { useSelector } from "react-redux";

const StatCard = ({ label, value, color = "secondary", suffix }) => {
  const colorMap = {
    secondary: "text-secondary",
    primary: "text-primary",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
    purple: "text-purple-700",
    teal: "text-teal-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-1 w-full ${color === "secondary" ? "bg-secondary" : ""} ${color === "primary" ? "bg-primary" : ""} ${color === "green" ? "bg-green-500" : ""} ${color === "amber" ? "bg-amber-500" : ""} ${color === "red" ? "bg-red-500" : ""} ${color === "purple" ? "bg-purple-600" : ""} ${color === "teal" ? "bg-teal-500" : ""}`} />
      <div className="text-[11px] text-gray-500 uppercase tracking-wider font-black mb-2">
        {label}
      </div>
      <div className={`text-3xl font-black tracking-tight ${colorMap[color] ?? colorMap.secondary}`}>
        {value}
        {suffix ? <span className="text-base text-gray-400 font-bold ml-1">{suffix}</span> : null}
      </div>
    </div>
  );
};

const BarRow = ({ label, value, colorClass }) => (
  <div className="flex items-center gap-4 mb-4 last:mb-0">
    <div className="w-40 shrink-0 text-sm text-gray-500 font-semibold">
      {label}
    </div>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
    <div className="w-12 text-right text-xs font-mono text-gray-500">{value}%</div>
  </div>
);

const Pill = ({ variant = "blue", children }) => {
  const styles = {
    green: "bg-green-50 text-green-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-secondary/10 text-secondary",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[variant] ?? styles.blue}`}>
      {children}
    </span>
  );
};

const CaseworkerPerformance = () => {
  const user = useSelector((s) => s.auth.user);

  const monthLabel = useMemo(() => {
    const d = new Date();
    const m = d.toLocaleString("en-GB", { month: "long" });
    return `${m} ${d.getFullYear()}`;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary">
            My Performance
          </h1>
          <p className="text-gray-500 mt-2">
            {monthLabel} · Caseworker: {user?.name ?? "—"}
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition"
        >
          Export Report
        </button>
      </div>

      {/* Score hero */}
      <div className="rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/10 to-purple-500/5 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
        <div>
          <div className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-2">
            Overall Performance Score
          </div>
          <div className="text-6xl font-black tracking-tight text-purple-700">
            87
            <span className="text-xl text-gray-400 font-bold">/100</span>
          </div>
          <div className="text-sm text-green-600 font-bold mt-2">
            ↑ +5 points vs last month
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 w-full">
          <div className="text-center">
            <div className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-1">
              SLA Rate
            </div>
            <div className="text-2xl font-black text-green-600">92%</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-1">
              Completion
            </div>
            <div className="text-2xl font-black text-secondary">78%</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-1">
              Overdue Rate
            </div>
            <div className="text-2xl font-black text-red-600">16%</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Cases Assigned" value="24" color="secondary" />
        <StatCard label="Cases Completed" value="11" color="green" />
        <StatCard label="Avg Completion Time" value="18" suffix="days" color="amber" />
        <StatCard label="SLA Compliance" value="92" suffix="%" color="teal" />
        <StatCard label="Overdue Cases" value="4" color="red" />
        <StatCard label="Doc Accuracy" value="88" suffix="%" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Metric Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm font-black text-secondary">Metric Breakdown</div>
          </div>
          <div className="p-5">
            <BarRow label="SLA Compliance" value={92} colorClass="bg-green-500" />
            <BarRow label="Cases Completed" value={78} colorClass="bg-secondary" />
            <BarRow label="Avg Completion" value={65} colorClass="bg-purple-600" />
            <BarRow label="Doc Accuracy" value={88} colorClass="bg-amber-500" />
            <BarRow label="Task Completion" value={74} colorClass="bg-teal-500" />
            <BarRow label="Overdue Rate" value={16} colorClass="bg-red-500" />
          </div>
        </div>

        {/* Monthly trend */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="text-sm font-black text-secondary">Monthly Trend</div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                ["JAN", 72, "text-gray-400"],
                ["FEB", 78, "text-gray-400"],
                ["MAR", 82, "text-gray-400"],
                ["APR", 87, "text-secondary"],
              ].map(([m, v, cls]) => (
                <div key={m} className="text-center">
                  <div className={`text-[10px] font-mono uppercase ${cls} mb-1`}>{m}</div>
                  <div className={`text-base font-black ${cls}`}>{v}</div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-2 h-28 pt-4">
              {[72, 78, 82, 87].map((v, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-t-md ${idx === 3 ? "bg-secondary" : "bg-secondary/30"}`}
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity log */}
      <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
        Activity Log
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-black border-b border-gray-200">
                  Time
                </th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-black border-b border-gray-200">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-black border-b border-gray-200">
                  Case
                </th>
                <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-black border-b border-gray-200">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["Apr 7 · 10:32am", <Pill variant="green">Document Approved</Pill>, "#C-2401", "Approved Passport Copy for Ahmed Al-Rashid"],
                ["Apr 7 · 9:55am", <Pill variant="yellow">Task Updated</Pill>, "#C-2398", "Updated “Draft application form” to In Progress"],
                ["Apr 6 · 4:20pm", <Pill variant="purple">Status Changed</Pill>, "#C-2385", "Moved Ivan Petrov → Review stage"],
                ["Apr 6 · 2:14pm", <Pill variant="green">Message Sent</Pill>, "#C-2401", "Requested English language certificate from Ahmed"],
                ["Apr 5 · 11:30am", <Pill variant="red">Reminder Sent</Pill>, "#C-2380", "Document reminder sent to Fatima Al-Zahra"],
                ["Apr 4 · 3:45pm", <Pill variant="green">Note Added</Pill>, "#C-2401", "Added internal case note"],
              ].map(([time, action, code, details], idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{time}</td>
                  <td className="px-4 py-3">{action}</td>
                  <td className="px-4 py-3 text-xs font-mono text-secondary">{code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaseworkerPerformance;

