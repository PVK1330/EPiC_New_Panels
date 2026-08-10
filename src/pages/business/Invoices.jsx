import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, Banknote, Search, Filter, Download, Eye, CheckCircle2, Clock, AlertCircle, X } from "lucide-react";
import { getBusinessPayments } from "../../services/businessProfileApi";
import { formatDate } from "../../utils/datetime";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/common/Pagination";

const money = (n) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Invoices = () => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });

  useEffect(() => {
    const load = async () => {
      const res = await getBusinessPayments({ page, limit: pagination.limit }).catch(() => null);
      const rows = res?.data?.data?.payments || [];
      const meta = res?.data?.data?.pagination;
      if (meta) setPagination((prev) => ({ ...prev, ...meta }));
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
          transactionId: p.transactionId || p.reference || null,
        }))
      );
    };
    load();
  }, [page, pagination.limit]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Paid":    return "bg-emerald-100 text-emerald-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      default:        return "bg-red-100 text-red-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":    return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Pending": return <Clock size={16} className="text-amber-600" />;
      default:        return <AlertCircle size={16} className="text-red-600" />;
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

  const totalAmount   = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount    = invoices.filter((i) => i.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status !== "Paid").reduce((sum, inv) => sum + inv.amount, 0);

  const handleDownload = async (invoice) => {
    setDownloading(invoice.id);
    try {
      const { downloadInvoiceReceiptPdf } = await import("../../services/downloadApi");
      const res = await downloadInvoiceReceiptPdf({ paymentId: invoice.id, invoiceNumber: invoice.invoiceId });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast({ message: "Failed to download invoice", variant: "danger" });
    } finally {
      setDownloading(null);
    }
  };

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
          <div className="flex items-center gap-2 mb-3 text-gray-900"><Banknote size={18} className="text-primary" /><span className="text-sm font-black">Total Amount</span></div>
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
        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-black text-gray-400">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[68vh]">
            <table className="w-full min-w-0">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Sr No</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Invoice ID</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Case Ref</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Description</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Amount</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Due Date</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                  <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, idx) => (
                  <tr key={invoice.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">{(page - 1) * pagination.limit + idx + 1}</span>
                    </td>
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
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                          title="View invoice"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(invoice)}
                          disabled={downloading === invoice.id}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary disabled:opacity-40"
                          title="Download PDF"
                        >
                          <Download size={14} className={downloading === invoice.id ? "animate-pulse" : ""} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div className="px-5 pb-5 pt-1">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </motion.div>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-black text-secondary">{selectedInvoice.invoiceId}</h3>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{selectedInvoice.case}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  ["Case Reference", selectedInvoice.caseRef],
                  ["Amount",         money(selectedInvoice.amount)],
                  ["Due Date",       selectedInvoice.dueDate],
                  ["Paid Date",      selectedInvoice.paidDate],
                  ["Payment Method", selectedInvoice.paymentMethod],
                  ...(selectedInvoice.transactionId ? [["Transaction ID", selectedInvoice.transactionId]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-black text-secondary">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(selectedInvoice.status)}
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${getStatusStyle(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-5 border-t border-gray-100 mt-4">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl py-2.5 transition text-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => { handleDownload(selectedInvoice); setSelectedInvoice(null); }}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl py-2.5 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Invoices;
