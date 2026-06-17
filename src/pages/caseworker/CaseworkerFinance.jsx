import React, { useState, useEffect } from "react";
import { getCaseworkerCases } from "../../services/caseApi";
import { Loader2 } from "lucide-react";

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

// Quote a CSV cell: wrap in quotes and escape embedded quotes so values
// containing commas, quotes, or newlines survive a round-trip into Excel/Sheets.
const toCsvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const buildCsv = (columns, rows) =>
  [columns, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\r\n");

const CaseworkerFinance = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    getCaseworkerCases({ page: 1, limit: 100 })
      .then((res) => {
        setCases(res.data?.data?.cases || []);
      })
      .catch((err) => {
        console.error("Failed to load caseworker cases", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const invoices = cases.filter(c => Number(c.totalAmount) > 0);
  const totalCollected = invoices.reduce((sum, c) => sum + Number(c.paidAmount), 0);
  const totalOutstanding = invoices.reduce((sum, c) => sum + Math.max(0, Number(c.totalAmount) - Number(c.paidAmount)), 0);
  const totalInvoices = invoices.length;

  const handleExportCsv = () => {
    const rows = invoices.map(c => [
      c.caseId,
      c.candidate ? `${c.candidate.first_name || ""} ${c.candidate.last_name || ""}`.trim() : "—",
      `£${c.totalAmount}`,
      Number(c.paidAmount) >= Number(c.totalAmount) ? "Paid" : "Unpaid",
      c.targetSubmissionDate ? String(c.targetSubmissionDate).slice(0, 10) : "—"
    ]);
    // Prepend a UTF-8 BOM so Excel reads the £ symbol correctly.
    const csv = "﻿" + buildCsv(INVOICE_COLUMNS, rows);
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
        <p className="text-gray-500 mt-2">Invoices, payments, and outstanding balances (real-time)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Payments collected" value={`£${totalCollected.toLocaleString()}`} colorClass="text-green-600" />
        <Stat label="Outstanding" value={`£${totalOutstanding.toLocaleString()}`} colorClass="text-red-600" />
        <Stat label="Invoices" value={totalInvoices} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-sm font-black text-secondary">Recent invoices</div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={invoices.length === 0}
            className="text-xs font-black text-primary hover:underline disabled:opacity-50 disabled:no-underline"
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Loader2 className="animate-spin inline mr-2 text-primary" /> Loading invoices...
                  </td>
                </tr>
              ) : invoices.length > 0 ? (
                invoices.map((c) => {
                  const outstanding = Number(c.totalAmount) - Number(c.paidAmount);
                  const isPaid = outstanding <= 0;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-secondary">{c.caseId}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.candidate ? `${c.candidate.first_name || ""} ${c.candidate.last_name || ""}`.trim() : "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">£{Number(c.totalAmount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isPaid
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {c.targetSubmissionDate ? new Date(c.targetSubmissionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaseworkerFinance;


