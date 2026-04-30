import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { getToken } from "../../utils/storage.js";

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
  const [performanceData, setPerformanceData] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthLabel = useMemo(() => {
    const d = new Date();
    const m = d.toLocaleString("en-GB", { month: "long" });
    return `${m} ${d.getFullYear()}`;
  }, []);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const token = getToken();
        const [perfResponse, activityResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/caseworker/performance', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/caseworker/activity-log?limit=20', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setPerformanceData(perfResponse.data.data);
        setActivityLog(activityResponse.data.data);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Failed to load performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const { overall, cases, tasks, documents, monthlyTrend } = performanceData || {};

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
            {overall?.score || 0}
            <span className="text-xl text-gray-400 font-bold">/100</span>
          </div>
          <div className="text-sm text-green-600 font-bold mt-2">
            {monthlyTrend && monthlyTrend.length > 1 
              ? `↑ ${Math.max(0, overall?.score - monthlyTrend[monthlyTrend.length - 2]?.score || 0)} points vs last month`
              : 'No previous data'}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4 w-full">
          <div className="text-center">
            <div className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-1">
              SLA Rate
            </div>
            <div className="text-2xl font-black text-green-600">{overall?.slaRate || 0}%</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-1">
              Completion
            </div>
            <div className="text-2xl font-black text-secondary">{overall?.completionRate || 0}%</div>
          </div>
          <div className="text-center">
            <div className="text-[11px] text-gray-500 font-mono uppercase tracking-wider mb-1">
              Overdue Rate
            </div>
            <div className="text-2xl font-black text-red-600">{overall?.overdueRate || 0}%</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Cases Assigned" value={cases?.assigned || 0} color="secondary" />
        <StatCard label="Cases Completed" value={cases?.completed || 0} color="green" />
        <StatCard label="Avg Completion Time" value={cases?.avgCompletionTime || 0} suffix="days" color="amber" />
        <StatCard label="SLA Compliance" value={overall?.slaRate || 0} suffix="%" color="teal" />
        <StatCard label="Overdue Cases" value={cases?.overdue || 0} color="red" />
        <StatCard label="Doc Accuracy" value={documents?.accuracy || 0} suffix="%" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Metric Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm font-black text-secondary">Metric Breakdown</div>
          </div>
          <div className="p-5">
            <BarRow label="SLA Compliance" value={overall?.slaRate || 0} colorClass="bg-green-500" />
            <BarRow label="Cases Completed" value={overall?.completionRate || 0} colorClass="bg-secondary" />
            <BarRow label="Avg Completion" value={Math.min(100, Math.max(0, 100 - (cases?.avgCompletionTime || 0) * 2))} colorClass="bg-purple-600" />
            <BarRow label="Doc Accuracy" value={documents?.accuracy || 0} colorClass="bg-amber-500" />
            <BarRow label="Task Completion" value={tasks?.completionRate || 0} colorClass="bg-teal-500" />
            <BarRow label="Overdue Rate" value={overall?.overdueRate || 0} colorClass="bg-red-500" />
          </div>
        </div>

        {/* Monthly trend */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="text-sm font-black text-secondary">Monthly Trend</div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-4 gap-3 mb-4">
              {(monthlyTrend || []).map((trend, idx) => (
                <div key={idx} className="text-center">
                  <div className={`text-[10px] font-mono uppercase ${idx === monthlyTrend.length - 1 ? 'text-secondary' : 'text-gray-400'} mb-1`}>
                    {trend.month}
                  </div>
                  <div className={`text-base font-black ${idx === monthlyTrend.length - 1 ? 'text-secondary' : 'text-gray-400'}`}>
                    {trend.score}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-end gap-2 h-28 pt-4">
              {(monthlyTrend || []).map((trend, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-t-md ${idx === monthlyTrend.length - 1 ? "bg-secondary" : "bg-secondary/30"}`}
                  style={{ height: `${Math.max(10, trend.score)}%` }}
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
              {activityLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No activity log entries found
                  </td>
                </tr>
              ) : (
                activityLog.map((log, idx) => {
                  const date = new Date(log.actionDate);
                  const timeStr = date.toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                  });
                  
                  const actionVariant = {
                    'case_created': 'green',
                    'status_changed': 'purple',
                    'document_uploaded': 'blue',
                    'document_reviewed': 'green',
                    'note_added': 'yellow',
                    'assignment_changed': 'purple',
                  }[log.actionType] || 'blue';

                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">{timeStr}</td>
                      <td className="px-4 py-3">
                        <Pill variant={actionVariant}>{log.actionType.replace(/_/g, ' ')}</Pill>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-secondary">
                        {log.case?.caseId ? `#${log.case.caseId}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.description}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaseworkerPerformance;

