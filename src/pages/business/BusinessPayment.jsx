import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Download, Filter, Search, CheckCircle2, AlertCircle, Eye, LayoutDashboard, DollarSign, Clock, Loader2 } from "lucide-react";
import { getBusinessPayments } from "../../services/businessProfileApi";
import { formatDate } from "../../utils/datetime";

const money = (n) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const BusinessPayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getBusinessPayments();
        const rows = res?.data?.data?.payments || [];
        setPayments(
          rows.map((p) => ({
            id: p.id,
            description: p.notes || p.Case?.caseId || "Case payment",
            amount: Number(p.amount || 0),
            date: p.paymentDate || p.created_at,
            status: p.paymentStatus || "pending",
            invoiceNo: p.invoiceNumber || `INV-${p.id}`,
            dueDate: p.dueDate || null,
            caseRef: p.Case?.caseId || "N/A",
            candidateName: `${p.Case?.candidate?.first_name || ""} ${p.Case?.candidate?.last_name || ""}`.trim() || "Candidate",
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          payment.description.toLowerCase().includes(q) ||
          payment.invoiceNo.toLowerCase().includes(q) ||
          payment.caseRef.toLowerCase().includes(q);
        const matchesFilter = filterStatus === "all" || payment.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesFilter;
      }),
    [payments, searchTerm, filterStatus]
  );

  const totalPaid = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status) => {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "pending") return "bg-amber-100 text-amber-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) =>
    status === "completed" ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-amber-600" />;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (loading) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-gray-600">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Payments
        </h1>
        <p className="text-primary font-bold text-sm mt-1">Case fees, licence charges, and billing status.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={cardVariants} initial="hidden" animate="visible">
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900"><DollarSign size={20} className="text-emerald-600" /><span className="font-black">Total Paid</span></div>
          <p className="text-3xl font-black text-secondary">{money(totalPaid)}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900"><Clock size={20} className="text-amber-500" /><span className="font-black">Amount Pending</span></div>
          <p className="text-3xl font-black text-secondary">{money(totalPending)}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900"><CreditCard size={20} className="text-primary" /><span className="font-black">Transactions</span></div>
          <p className="text-3xl font-black text-secondary">{payments.length}</p>
        </motion.div>
      </motion.div>

      <motion.div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm" variants={cardVariants} initial="hidden" animate="visible">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input type="text" placeholder="Search invoice, case ref..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none">
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm" variants={cardVariants} initial="hidden" animate="visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Description</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Case Ref</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Invoice No.</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-secondary">{payment.description}</p>
                    <p className="text-xs font-bold text-gray-500">{payment.candidateName}</p>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{payment.caseRef}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{payment.invoiceNo}</td>
                  <td className="px-4 py-4 text-sm font-black text-secondary">{money(payment.amount)}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{payment.date ? formatDate(payment.date) : "N/A"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusColor(payment.status)}`}>{payment.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"><Eye size={16} /></button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"><Download size={16} /></button>
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

export default BusinessPayment;
