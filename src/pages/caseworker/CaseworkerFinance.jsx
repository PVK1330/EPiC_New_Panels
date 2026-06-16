const Stat = ({ label, value, colorClass }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5">
    <div className="text-[11px] text-gray-500 uppercase tracking-wider font-black mb-2">
      {label}
    </div>
    <div className={`text-3xl font-black tracking-tight ${colorClass ?? "text-secondary"}`}>
      {value}
    </div>
  </div>
);

const INVOICE_COLUMNS = ["Invoice", "Candidate", "Amount", "Status", "Due"];

const INVOICE_ROWS = [
  ["INV-0491-003", "Priya Sharma", "£450", "Unpaid", "1 Apr 2026"],
  ["INV-0491-002", "Ahmed Al-Rashid", "£700", "Paid", "—"],
  ["INV-0491-001", "Carlos Mendes", "£1,350", "Paid", "—"],
];

// Quote a CSV cell: wrap in quotes and escape embedded quotes so values
// containing commas, quotes, or newlines survive a round-trip into Excel/Sheets.
const toCsvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const buildCsv = (columns, rows) =>
  [columns, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\r\n");

const CaseworkerFinance = () => {
  const handleExportCsv = () => {
    // Prepend a UTF-8 BOM so Excel reads the £ symbol correctly.
    const csv = "﻿" + buildCsv(INVOICE_COLUMNS, INVOICE_ROWS);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-secondary">Finance</h1>
        <p className="text-gray-500 mt-2">Invoices, payments, and outstanding balances (demo)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Payments collected" value="£2,050" colorClass="text-green-600" />
        <Stat label="Outstanding" value="£450" colorClass="text-red-600" />
        <Stat label="Invoices" value="3" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-black text-secondary">Recent invoices</div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="text-xs font-black text-primary hover:underline"
          >
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50">
              <tr>
                {INVOICE_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-gray-500 font-black border-b border-gray-200"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {INVOICE_ROWS.map(([inv, name, amt, status, due]) => (
                <tr key={inv} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-secondary">{inv}</td>
                  <td className="px-4 py-3 text-gray-700">{name}</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{amt}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        status === "Paid"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaseworkerFinance;

