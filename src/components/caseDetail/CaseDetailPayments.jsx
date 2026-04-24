import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../Input";
import Button from "../Button";

const METHODS = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Card", label: "Card" },
  { value: "Cheque", label: "Cheque" },
];

const CaseDetailPayments = ({ payments }) => {
  const [method, setMethod] = useState("Card");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
    >
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-black text-secondary mb-4 pb-2 border-b border-gray-100">Payment Summary</h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Fee</p>
            <p className="text-xl font-black text-secondary">{payments.total}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Paid</p>
            <p className="text-xl font-black text-green-600">{payments.paid}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Balance</p>
            <p className="text-xl font-black text-green-600">{payments.balance}</p>
          </div>
        </div>
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Payment History</h4>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Date", "Amount", "Method", "Invoice"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">
                    No payment records yet.
                  </td>
                </tr>
              ) : (
                payments.history.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/80">
                    <td className="px-4 py-2.5 text-gray-600">{row.date}</td>
                    <td className="px-4 py-2.5 text-green-600 font-bold">{row.amount}</td>
                    <td className="px-4 py-2.5 text-gray-600">{row.method}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{row.invoice}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-fit">
        <h3 className="text-sm font-black text-secondary mb-4 pb-2 border-b border-gray-100">Invoice Details</h3>
        <Input label="Invoice ID" name="inv" value={payments.invoiceId} onChange={() => {}} readOnly className="mb-3" />
        <Input
          label="Payment Method"
          name="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={METHODS}
        />
        <Button type="button" variant="primary" className="rounded-xl w-full mt-4">
          Generate Invoice PDF
        </Button>
      </div>
    </motion.div>
  );
};

export default CaseDetailPayments;
