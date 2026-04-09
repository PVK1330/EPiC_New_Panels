import { FiCheck, FiMinus, FiLock, FiAlertCircle } from "react-icons/fi";
import { MODULE_MATRIX_ROWS } from "./permissionsData";

const AccessCell = ({ level }) => {
  if (level === "full")
    return (
      <span className="inline-flex items-center justify-center text-green-600" title="Full access">
        <FiCheck size={16} strokeWidth={3} />
      </span>
    );
  if (level === "limited")
    return (
      <span className="inline-flex items-center justify-center text-amber-500" title="Limited access">
        <FiAlertCircle size={16} />
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center text-gray-300" title="No access">
      <FiLock size={15} />
    </span>
  );
};

const ActionCell = ({ ok }) =>
  ok ? (
    <span className="text-green-600 font-black text-sm">✓</span>
  ) : (
    <span className="text-gray-300 font-bold">—</span>
  );

const ModuleMatrixPanel = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-black text-secondary">Module Permissions Matrix</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Cross-role access levels and default action flags per module
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-100">
                Module
              </th>
              {["Super Admin", "Admin", "Caseworker", "Client", "Sponsor", "Read", "Write", "Approve", "Delete"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-2 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MODULE_MATRIX_ROWS.map((row) => (
              <tr key={row.module} className="hover:bg-gray-50/80">
                <td className="px-3 py-3 font-bold text-secondary whitespace-nowrap sticky left-0 bg-white border-r border-gray-50 z-10">
                  {row.module}
                </td>
                <td className="px-2 py-3 text-center">
                  <AccessCell level={row.superAdmin} />
                </td>
                <td className="px-2 py-3 text-center">
                  <AccessCell level={row.admin} />
                </td>
                <td className="px-2 py-3 text-center">
                  <AccessCell level={row.caseworker} />
                </td>
                <td className="px-2 py-3 text-center">
                  <AccessCell level={row.client} />
                </td>
                <td className="px-2 py-3 text-center">
                  <AccessCell level={row.sponsor} />
                </td>
                <td className="px-2 py-3 text-center">
                  <ActionCell ok={row.read} />
                </td>
                <td className="px-2 py-3 text-center">
                  <ActionCell ok={row.write} />
                </td>
                <td className="px-2 py-3 text-center">
                  <ActionCell ok={row.approve} />
                </td>
                <td className="px-2 py-3 text-center">
                  <ActionCell ok={row.delete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-6 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <FiCheck className="text-green-600" size={14} strokeWidth={3} /> Full access
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiAlertCircle className="text-amber-500" size={14} /> Limited access
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FiLock className="text-gray-300" size={13} /> No access
        </span>
      </div>
    </div>
  );
};

export default ModuleMatrixPanel;
