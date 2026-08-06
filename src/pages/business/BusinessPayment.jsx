import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Download, Filter, Search, CheckCircle2, AlertCircle, Eye, LayoutDashboard, Banknote, Clock, Loader2, X, ArrowRight } from "lucide-react";
import { getBusinessPayments, createSponsorPaymentCheckout, verifySponsorPayment } from "../../services/businessProfileApi";
import { formatDate } from "../../utils/datetime";
import { useToast } from "../../context/ToastContext";

const money = (n) => `£${Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PAYABLE_LABEL = {
  licence_fee: "Licence fee",
  isc: "Immigration Skills Charge",
  case_fee: "Case fee",
};

const BusinessPayment = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [payables, setPayables] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [payingKey, setPayingKey] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getBusinessPayments();
      const data = res?.data?.data || {};
      const caseRows = (data.payments || []).map((p) => ({
        id: `case_${p.id}`,
        rawId: p.id,
        kind: "case",
        description: p.notes || p.Case?.caseId || "Case payment",
        amount: Number(p.amount || 0),
        date: p.paymentDate || p.created_at,
        status: p.paymentStatus || "pending",
        invoiceNo: p.invoiceNumber || `INV-${p.id}`,
        dueDate: p.dueDate || null,
        caseRef: p.Case?.caseId || "N/A",
        candidateName: `${p.Case?.candidate?.first_name || ""} ${p.Case?.candidate?.last_name || ""}`.trim() || "Client",
      }));
      // Licence-fee / ISC payments live in the sponsor ledger, not case_payments.
      const ledgerRows = (data.sponsorPayments || []).map((p) => ({
        id: `sp_${p.id}`,
        rawId: p.id,
        kind: "sponsor",
        description: p.description || PAYABLE_LABEL[p.payableType] || "Sponsor payment",
        amount: Number(p.amount || 0),
        date: p.paid_at || p.created_at,
        status: p.status || "pending",
        invoiceNo: p.stripe_payment_intent_id || `SP-${p.id}`,
        dueDate: null,
        caseRef: PAYABLE_LABEL[p.payableType] || "—",
        candidateName: PAYABLE_LABEL[p.payableType] || "Sponsor",
      }));
      setPayments([...caseRows, ...ledgerRows]);
      // licence_fee is paid directly on the UKVI portal — exclude it from Stripe payables.
      setPayables((data.payables || []).filter((p) => p.payableType !== "licence_fee"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Finalise after returning from Stripe Checkout (?payment=success&session_id=…).
  useEffect(() => {
    const result = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (!result) return;

    if (result === "cancelled") {
      showToast({ message: "Payment cancelled.", variant: "warning" });
      setSearchParams({}, { replace: true });
      return;
    }
    if (result !== "success" || !sessionId) return;

    let cancelled = false;
    (async () => {
      setVerifying(true);
      try {
        const res = await verifySponsorPayment(sessionId);
        if (cancelled) return;
        if (res?.data?.data?.paid) {
          showToast({ message: "Payment received. Thank you!", variant: "success" });
          await load();
        } else {
          showToast({ message: "Payment is still processing. We'll update your balance shortly.", variant: "info" });
        }
      } catch (e) {
        if (!cancelled) showToast({ message: e?.response?.data?.message || "Could not verify payment", variant: "danger" });
      } finally {
        if (!cancelled) {
          setVerifying(false);
          setSearchParams({}, { replace: true });
        }
      }
    })();

    return () => { cancelled = true; };
  }, [searchParams, setSearchParams, showToast, load]);

  const handlePay = async (payable) => {
    const key = `${payable.payableType}:${payable.payableRef}`;
    setPayingKey(key);
    try {
      const res = await createSponsorPaymentCheckout({
        payableType: payable.payableType,
        payableRef: payable.payableRef,
      });
      const url = res?.data?.data?.url;
      if (!url) throw new Error("Stripe checkout could not be started");
      window.location.href = url;
    } catch (e) {
      setPayingKey(null);
      showToast({ message: e?.response?.data?.message || e.message || "Failed to start payment", variant: "danger" });
    }
  };

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

  const handleDownload = async (payment) => {
    setDownloading(payment.id);
    try {
      const { downloadSponsorInvoicePdf } = await import("../../services/downloadApi");
      const { blob, filename } = await downloadSponsorInvoicePdf(payment.rawId ?? payment.id, payment.kind);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `${payment.invoiceNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast({ message: "Failed to download invoice", variant: "danger" });
    } finally {
      setDownloading(null);
    }
  };

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
    <div className="space-y-5 pb-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-secondary tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="text-primary" size={26} />
          Payments
        </h1>
        <p className="text-primary font-bold text-sm mt-0.5">Case fees and billing status. Sponsor licence fees are paid directly on the UKVI portal.</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-3" variants={cardVariants} initial="hidden" animate="visible">
        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-900"><Banknote size={20} className="text-emerald-600" /><span className="font-black text-sm">Total Paid</span></div>
          <p className="text-2xl font-black text-secondary">{money(totalPaid)}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-900"><Clock size={20} className="text-amber-500" /><span className="font-black text-sm">Amount Pending</span></div>
          <p className="text-2xl font-black text-secondary">{money(totalPending)}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-gray-900"><CreditCard size={20} className="text-primary" /><span className="font-black text-sm">Transactions</span></div>
          <p className="text-2xl font-black text-secondary">{payments.length}</p>
        </motion.div>
      </motion.div>

      {payables.length > 0 && (
        <motion.div className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm overflow-hidden relative" variants={cardVariants} initial="hidden" animate="visible">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-amber-600" />
              <h2 className="text-sm font-black text-secondary uppercase tracking-wide">Outstanding charges</h2>
            </div>
            <div className="space-y-2.5">
              {payables.map((p) => {
                const key = `${p.payableType}:${p.payableRef}`;
                const isPaying = payingKey === key;
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl border border-amber-100 p-3.5">
                    <div>
                      <p className="text-sm font-black text-secondary">{p.description}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                        {PAYABLE_LABEL[p.payableType] || p.payableType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-secondary">{money(p.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handlePay(p)}
                        disabled={isPaying || verifying}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
                      >
                        {isPaying ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                        {isPaying ? "Starting…" : "Pay now"}
                        {!isPaying && <ArrowRight size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-amber-700/80 font-bold mt-3">Payments are processed securely by Stripe on your provider's account.</p>
          </div>
        </motion.div>
      )}

      <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative" variants={cardVariants} initial="hidden" animate="visible">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="p-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input type="text" placeholder="Search invoice, case ref..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none" />
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
        </div>
      </motion.div>

      <motion.div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative" variants={cardVariants} initial="hidden" animate="visible">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-primary-dark" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Description</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Case Ref</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Invoice No.</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Amount</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Date</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Status</th>
                <th className="text-left px-3 py-2 font-black text-gray-500 uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                  <td className="px-3 py-2">
                    <p className="text-sm font-black text-secondary">{payment.description}</p>
                    <p className="text-xs font-bold text-gray-500">{payment.candidateName}</p>
                  </td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-600">{payment.caseRef}</td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-600">{payment.invoiceNo}</td>
                  <td className="px-3 py-2 text-sm font-black text-secondary">{money(payment.amount)}</td>
                  <td className="px-3 py-2 text-xs font-bold text-gray-600">{payment.date ? formatDate(payment.date) : "N/A"}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-black rounded-full ${getStatusColor(payment.status)}`}>{payment.status}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownload(payment)}
                        disabled={downloading === payment.id}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary disabled:opacity-40"
                        title="Download PDF"
                      >
                        <Download size={16} className={downloading === payment.id ? "animate-pulse" : ""} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-black text-secondary">{selectedPayment.invoiceNo}</h3>
                <p className="text-xs font-bold text-gray-500 mt-0.5">{selectedPayment.description}</p>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                ["Client",    selectedPayment.candidateName],
                ["Case Ref",     selectedPayment.caseRef],
                ["Amount",       money(selectedPayment.amount)],
                ["Date",         selectedPayment.date ? formatDate(selectedPayment.date) : "N/A"],
                ["Due Date",     selectedPayment.dueDate ? formatDate(selectedPayment.dueDate) : "N/A"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-black text-secondary">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Status</span>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(selectedPayment.status)}
                  <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${getStatusColor(selectedPayment.status)}`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-5 border-t border-gray-100 mt-4">
              <button
                onClick={() => setSelectedPayment(null)}
                className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl py-2.5 transition text-sm"
              >
                Close
              </button>
              <button
                onClick={() => { handleDownload(selectedPayment); setSelectedPayment(null); }}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl py-2.5 transition flex items-center justify-center gap-2 text-sm"
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BusinessPayment;
