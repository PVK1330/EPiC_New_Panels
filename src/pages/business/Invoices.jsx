import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, DollarSign, Search, Filter, Download, Eye, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { getBusinessPayments } from "../../services/businessProfileApi";
import { useEffect } from "react";
import { formatDate } from "../../utils/datetime";

const money = (n) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await getBusinessPayments().catch(() => null);
      const rows = res?.data?.data?.payments || [];
      setInvoices(
        rows.map((p) => ({
          id: p.id,
          invoiceId: p.invoiceNumber || `INV-${p.id}`,
          caseRef: p.Case?.caseId || "N/A",
          case: p.notes || "Case fee",
          amount: Number(p.amount || 0),
          status: p.paymentStatus === "completed" ? "Paid" : p.paymentStatus === "pending" ? "Pending" : "Overdue",
          dueDate: p.dueDate ? formatDate(p.dueDate) : "N/A",
          paidDate: p.paymentDate ? formatDate(p.paymentDate) : "N/A",
          paymentMethod: p.paymentMethod || "N/A",
        }))
      );
    };
    load();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Pending":
        return <Clock size={16} className="text-amber-600" />;
      default:
        return <AlertCircle size={16} className="text-red-600" />;
    }
  };

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = invoice.invoiceId.toLowerCase().includes(q) || invoice.case.toLowerCase().includes(q) || invoice.caseRef.toLowerCase().includes(q);
        const matchesFilter =
          filterType === "all" ||
          (filterType === "paid" && invoice.status === "Paid") ||
          (filterType === "pending" && invoice.status === "Pending") ||
          (filterType === "overdue" && invoice.status === "Overdue");
        return matchesSearch && matchesFilter;
      }),
    [invoices, searchQuery, filterType]
  );

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter((i) => i.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status !== "Paid").reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-5 pb-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="text-primary" size={26} />
          Invoices
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">Case-linked invoices and payment records.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-3" variants={cardVariants} initial="hidden" animate="visible">
        <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-3 text-gray-900"><FileText size={18} className="text-primary" /><span className="text-sm font-black">Total Invoices</span></div>
          <p className="text-2xl font-black text-secondary">{invoices.length}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-3 text-gray-900"><DollarSign size={18} className="text-primary" /><span className="text-sm font-black">Total Amount</span></div>
          <p className="text-2xl font-black text-secondary">{money(totalAmount)}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-3 text-gray-900"><CheckCircle2 size={18} className="text-emerald-600" /><span className="text-sm font-black">Paid</span></div>
          <p className="text-2xl font-black text-secondary">{money(paidAmount)}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
          <div className="flex items-center gap-2 mb-3 text-gray-900"><Clock size={18} className="text-amber-500" /><span className="text-sm font-black">Pending</span></div>
          <p className="text-2xl font-black text-secondary">{money(pendingAmount)}</p>
        </motion.div>
      </motion.div>

      <motion.div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm relative overflow-hidden" variants={cardVariants} initial="hidden" animate="visible">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Search invoices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none">
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm relative overflow-hidden" variants={cardVariants} initial="hidden" animate="visible">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Invoice ID</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Case Ref</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Case</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Amount</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Due Date</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-sm font-black text-secondary">{invoice.invoiceId}</td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-600">{invoice.caseRef}</td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-600">{invoice.case}</td>
                  <td className="px-3 py-2 text-sm font-black text-secondary">{money(invoice.amount)}</td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-600">{invoice.dueDate}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(invoice.status)}
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full ${getStatusStyle(invoice.status)}`}>{invoice.status}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1.5">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"><Eye size={14} /></button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Invoices;
