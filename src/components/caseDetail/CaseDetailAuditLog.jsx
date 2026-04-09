import { motion } from "framer-motion";

const CaseDetailAuditLog = ({ rows }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-black text-secondary">Audit Log — Who changed what &amp; when</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 text-left">
              {["Timestamp", "User", "Action", "Field / Module", "Old Value", "New Value"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50/80">
                <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{r.ts}</td>
                <td className="px-4 py-3 font-semibold text-secondary whitespace-nowrap">{r.user}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${r.actionClass}`}>{r.action}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.module}</td>
                <td className="px-4 py-3 text-gray-500">{r.oldVal}</td>
                <td className={`px-4 py-3 font-semibold ${r.newClass || "text-secondary"}`}>{r.newVal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default CaseDetailAuditLog;
