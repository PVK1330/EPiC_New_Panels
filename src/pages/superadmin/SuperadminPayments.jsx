import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useBilling from '../../hooks/useBilling';
import useDownloads from '../../hooks/useDownloads';
import {
  RiMoneyPoundCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiDownload2Line,
  RiFilter3Line,
  RiSearchLine,
  RiBankCardLine,
  RiExchangeLine,
  RiFileDownloadLine,
  RiShieldCheckLine,
  RiInformationLine,
  RiEyeLine,
  RiPulseLine,
  RiSecurePaymentLine,
  RiMastercardLine,
  RiVisaLine,
  RiCloseLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiRefundLine,
  RiCalendarLine,
  RiReceiptLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Pagination from '../../components/common/Pagination';
import PageHero, { HeroButton, HeroGhostButton } from '../../components/superadmin/PageHero';
import { formatDate, formatDateTime } from '../../utils/datetime';
import { formatCurrencyExact } from '../../utils/currencyFormatter';
import usePlatformCurrency from '../../hooks/usePlatformCurrency';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

// fmtGbp is now currency-aware — pass the platform currency code from usePlatformCurrency
function fmtGbp(amount, code = 'GBP') {
  return formatCurrencyExact(amount, code);
}

function ukDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatRef(str) {
  if (!str) return '—';
  if (str.length <= 16) return str;
  return str.slice(0, 8) + '...' + str.slice(-6);
}

const TXN_STATUS = {
  completed:  { label: 'Completed',  icon: RiCheckboxCircleLine, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  processing: { label: 'Processing', icon: RiTimeLine,           bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500' },
  refunded:   { label: 'Refunded',   icon: RiRefundLine,         bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  failed:     { label: 'Failed',     icon: RiAlertLine,          bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
};

function TxnBadge({ status }) {
  const m = TXN_STATUS[status?.toLowerCase()] || TXN_STATUS.processing;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/* ── Transaction Detail Modal ────────────────────────────────────────────── */

function TransactionModal({ txn, onClose, onDownloadReceipt, downloading, taxRate = 0, taxId = null, currency = 'GBP' }) {
  if (!txn) return null;

  const amount = parseFloat(txn.amount || 0);
  const taxEnabled = Number.isFinite(taxRate) && taxRate > 0;
  const vatAmount = taxEnabled ? parseFloat((amount * (taxRate / 100)).toFixed(2)) : 0;
  const total = amount + vatAmount;

  let topBandColor = 'bg-primary';
  if (txn.status === 'completed') topBandColor = 'bg-emerald-600';
  else if (txn.status === 'refunded') topBandColor = 'bg-amber-500';
  else if (txn.status === 'failed') topBandColor = 'bg-red-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <RiReceiptLine size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Receipt</p>
                <h3 className="text-sm font-black text-secondary">{txn.reference}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition-all">
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Top colour band */}
              <div className={`h-1.5 w-full ${topBandColor}`} />

              <div className="p-6">
                {/* Receipt header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-2xl font-black text-primary tracking-widest">PAYMENT RECEIPT</p>
                    <p className="text-sm font-mono text-gray-500 mt-1">{txn.reference}</p>
                  </div>
                  <TxnBadge status={txn.status} />
                </div>

                <div className="h-px w-full bg-gray-200 mb-6" />

                {/* From / To / Details */}
                <div className="grid grid-cols-3 gap-5 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">From (Supplier)</p>
                    <p className="text-sm font-bold text-secondary">EPiC HRIS Platform</p>
                    <p className="text-xs text-gray-500">Elite PiC Ltd</p>
                    <p className="text-xs text-gray-500">United Kingdom</p>
                    {taxEnabled && taxId && <p className="text-xs text-gray-400 mt-1">Tax ID: {taxId}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recipient</p>
                    <p className="text-sm font-bold text-secondary">{txn.organisation?.name || '—'}</p>
                    <p className="text-xs text-gray-500">{txn.organisation?.primaryEmail || '—'}</p>
                    <p className="text-xs text-gray-500">{txn.organisation?.country || 'United Kingdom'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction Details</p>
                    <div className="space-y-1">
                      {[
                        ['Reference', txn.reference || '—'],
                        ['Date', ukDateTime(txn.createdAt)],
                        ['Gateway', txn.gateway || 'N/A'],
                        ['Method', txn.payment_method || 'N/A'],
                        ['Currency', txn.currency || 'GBP'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-xs text-gray-400 w-16 shrink-0">{k}:</span>
                          <span className="text-xs font-bold text-secondary">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Line item table */}
                <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th scope="col" className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Sr No</th>
                        <th scope="col" className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Description</th>
                        <th scope="col" className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Gateway Ref</th>
                        {taxEnabled && <th scope="col" className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wider">VAT ({taxRate}%)</th>}
                        <th scope="col" className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider">{taxEnabled ? "Amount (ex. Tax)" : "Amount"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-blue-50/20">
                        <td className="px-4 py-4 align-top">
                          <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">{0 + 1}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-secondary text-sm">EPiC HRIS — Subscription Payment</p>
                          {txn.invoice?.invoice_number && (
                            <p className="text-xs text-gray-400 mt-0.5">Invoice: {txn.invoice.invoice_number}</p>
                          )}
                          {txn.gateway_reference && (
                            <p className="text-xs text-gray-400">Gateway Ref: {txn.gateway_reference}</p>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center text-xs font-mono text-gray-500">{txn.gateway_reference || 'N/A'}</td>
                        {taxEnabled && <td className="px-3 py-4 text-right text-sm font-semibold text-gray-500">{fmtGbp(vatAmount, currency)}</td>}
                        <td className="px-4 py-4 text-right text-sm font-black text-primary">{fmtGbp(amount, currency)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-60 rounded-xl overflow-hidden border border-gray-100">
                    {taxEnabled ? (
                      <>
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Subtotal (ex. VAT)</span>
                          <span className="text-sm font-semibold text-secondary">{fmtGbp(amount, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">VAT @ {taxRate}%</span>
                          <span className="text-sm font-semibold text-secondary">{fmtGbp(vatAmount, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 bg-primary">
                          <span className="text-sm font-black text-white">TOTAL CHARGED</span>
                          <span className="text-base font-black text-white">{fmtGbp(total, currency)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center px-4 py-3 bg-primary">
                        <span className="text-sm font-black text-white">TOTAL CHARGED</span>
                        <span className="text-base font-black text-white">{fmtGbp(amount, currency)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status note */}
                <div className={`rounded-xl p-4 text-xs border ${txn.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : txn.status === 'refunded' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                  {txn.status === 'completed'
                    ? `✓ Payment of ${fmtGbp(total, currency)} was successfully processed on ${ukDateTime(txn.createdAt)}.`
                    : txn.status === 'refunded'
                    ? `This transaction was refunded. Original amount: ${fmtGbp(total, currency)}.`
                    : txn.failure_reason || `Transaction status: ${txn.status}.`}
                </div>

                {/* Footer note */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-300">
                    EPiC HRIS Platform · support@elitepic.co.uk · This is a computer-generated receipt and requires no signature.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400">UK HMRC-compliant VAT receipt</p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-secondary rounded-xl hover:bg-gray-100 transition-all"
              >
                Close
              </button>
              <button
                onClick={onDownloadReceipt}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                {downloading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <RiFileDownloadLine size={16} />}
                Download Receipt
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Stat Card ───────────────────────────────────────────────────────────── */

function StatCard({ title, value, icon: Icon, bgClass, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-5 group hover:shadow-md transition-shadow"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${bgClass} opacity-5 translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity`} />
      <div className={`inline-flex p-2 rounded-xl ${bgClass} text-white mb-3 shadow-sm`}>
        <Icon size={18} />
      </div>
      <p className="text-xs font-bold text-gray-400 mb-0.5">{title}</p>
      <p className="text-2xl font-black text-secondary tracking-tight">{value}</p>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */

const ITEMS_PER_PAGE = 10;

const SuperadminPayments = () => {
  const currency = usePlatformCurrency();
  const [activeTab, setActiveTab] = useState('Transactions');
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState({
    publishable_key: '',
    secret_key: '',
    webhook_secret: '',
  });

  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 0 });

  const {
    transactions,
    transactionsLoading,
    fetchTransactions,
    downloadTransactions,
    fetchTransactionById,
    gatewayStatus,
    gatewayLoading,
    fetchGatewayStatus,
    saveGatewayConfig,
    dashboardStats,
    statsLoading,
    fetchDashboardStats,
  } = useBilling();

  const { downloadTransactionReceiptPdf, busy } = useDownloads();

  // Map the active tab + status dropdown onto the single `status` param the
  // backend understands. The Refunds tab is always refunded-only; on the
  // Transactions tab a concrete status filter narrows the server query.
  const serverStatus =
    activeTab === 'Refunds'
      ? 'refunded'
      : statusFilter !== 'All'
        ? statusFilter.toLowerCase()
        : undefined;

  // Server-side paginated fetch. Page/tab/status drive the request; the
  // returned pagination meta feeds the Sr No offset and the pager.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = { page: currentPage, limit: ITEMS_PER_PAGE };
      if (serverStatus) params.status = serverStatus;
      const res = await fetchTransactions(params);
      if (!cancelled && res?.ok && res.pagination) {
        setPagination({
          total: res.pagination.total ?? 0,
          page: res.pagination.page ?? currentPage,
          limit: res.pagination.limit ?? ITEMS_PER_PAGE,
          totalPages: res.pagination.totalPages ?? 0,
        });
      }
    })();
    return () => { cancelled = true; };
  }, [fetchTransactions, currentPage, serverStatus]);

  useEffect(() => {
    fetchGatewayStatus();
    fetchDashboardStats();
  }, [fetchGatewayStatus, fetchDashboardStats]);

  const stats = [
    { title: 'Gross Volume',    value: fmtGbp(dashboardStats?.transactions?.grossVolume  || 0, currency), icon: RiMoneyPoundCircleLine, bgClass: 'bg-blue-600',    delay: 0 },
    { title: 'Net Revenue',     value: fmtGbp(dashboardStats?.transactions?.netRevenue   || 0, currency), icon: RiPulseLine,           bgClass: 'bg-indigo-600',  delay: 0.05 },
    { title: 'Success Rate',    value: `${dashboardStats?.transactions?.successRate   || '0'}%`,           icon: RiShieldCheckLine,    bgClass: 'bg-emerald-600', delay: 0.1 },
    { title: 'Refund Rate',     value: `${dashboardStats?.transactions?.refundRate    || '0'}%`,           icon: RiExchangeLine,       bgClass: 'bg-amber-500',   delay: 0.15 },
  ];

  // Search remains client-side over the current server page (the API has no
  // free-text search param). Tab/status are already applied server-side.
  const pageData = transactions.filter(t => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.reference?.toLowerCase().includes(q) ||
      t.organisation?.name?.toLowerCase().includes(q)
    );
  });

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const params = activeTab === 'Refunds' ? { status: 'refunded' } : {};
      const res = await downloadTransactions(params);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Transactions exported successfully');
    } catch {
      toast.error('Failed to export transactions');
    } finally {
      setExporting(false);
    }
  };

  const handleViewTransaction = async (txn) => {
    try {
      const res = await fetchTransactionById(txn.id);
      if (res.ok) setSelectedTxn(res.data);
      else toast.error('Failed to load transaction details');
    } catch {
      toast.error('Failed to load transaction details');
    }
  };

  const handleDownloadReceipt = async (txn) => {
    const result = await downloadTransactionReceiptPdf(txn);
    if (result.ok) {
      toast.success(`Receipt for ${txn.reference} downloaded`);
    } else {
      toast.error(result.message || `Failed to download receipt for ${txn.reference}`);
    }
  };

  const handleSaveGatewayConfig = async () => {
    try {
      await saveGatewayConfig(gatewayConfig);
      toast.success('Gateway configuration saved successfully');
      setIsGatewayModalOpen(false);
      fetchGatewayStatus();
    } catch {
      toast.error('Failed to save gateway configuration');
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Page hero */}
      <PageHero
        icon={RiMoneyPoundCircleLine}
        title="Financial Hub"
        subtitle="Real-time transaction monitoring, payment reconciliation, and gateway management."
      >
        <HeroGhostButton onClick={handleExport} disabled={exporting}>
          <RiFileDownloadLine size={16} /> {exporting ? 'Exporting…' : 'Export'}
        </HeroGhostButton>
        <HeroButton onClick={() => setIsGatewayModalOpen(true)}>
          <RiExchangeLine size={16} /> Configure
        </HeroButton>
      </PageHero>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)
          : stats.map(s => <StatCard key={s.title} {...s} />)
        }
      </div>

      {/* Main layout: ledger + gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
        >
          {/* Toolbar */}
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm gap-0.5">
              {['Transactions', 'Refunds'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab
                      ? 'bg-secondary text-white shadow-sm'
                      : 'text-gray-400 hover:text-secondary hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search + filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  type="text"
                  placeholder="Search ledger…"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-secondary w-44 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="py-1.5 pl-3 pr-7 bg-white border border-gray-200 rounded-lg text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {['All', 'Completed', 'Processing', 'Failed', 'Refunded'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[68vh] flex-1">
            <table className="w-full min-w-0 text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 text-[10px] text-gray-400 font-black border-b border-gray-100 uppercase tracking-widest">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left">Sr No</th>
                  <th scope="col" className="px-5 py-3 text-left">Reference</th>
                  <th scope="col" className="px-5 py-3 text-left">Organisation</th>
                  <th scope="col" className="px-5 py-3 text-right">Amount</th>
                  <th scope="col" className="px-5 py-3 text-left">Method</th>
                  <th scope="col" className="px-5 py-3 text-center">Date</th>
                  <th scope="col" className="px-5 py-3 text-left">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactionsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pageData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <RiReceiptLine size={32} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm font-bold text-gray-300">No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  pageData.map((txn, idx) => (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-blue-50/20 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all font-mono">
                          {formatRef(txn.reference)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-secondary leading-tight">{txn.organisation?.name || '—'}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(txn.createdAt)}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-black text-secondary">{fmtGbp(txn.amount, currency)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-secondary">
                            <RiBankCardLine size={13} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-secondary leading-none">{txn.gateway || 'N/A'}</p>
                            <p className="text-[10px] text-gray-400">{txn.payment_method || 'Card'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="flex items-center justify-center gap-1 text-xs font-semibold text-gray-500">
                          <RiCalendarLine size={11} className="text-gray-400" />
                          {formatDate(txn.createdAt)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <TxnBadge status={txn.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewTransaction(txn)}
                            title="View Details"
                            aria-label="View transaction details"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all"
                          >
                            <RiEyeLine size={15} aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(txn)}
                            disabled={busy[`receipt_${txn.id}`]}
                            title="Download Receipt"
                            aria-label="Download receipt"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-wait"
                          >
                            {busy[`receipt_${txn.id}`]
                              ? <span className="block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              : <RiDownload2Line size={15} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (server-side) */}
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30">
            <Pagination
              page={currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setCurrentPage}
            />
          </div>
        </motion.div>

        {/* Gateway status sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Gateway Status</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Payment infrastructure</p>
            </div>
            <RiPulseLine className="text-primary animate-pulse" size={18} />
          </div>

          {gatewayLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : gatewayStatus ? (
            <>
              <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                      <RiSecurePaymentLine size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-secondary">{gatewayStatus.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Card / ACH</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    gatewayStatus.status === 'Connected'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {gatewayStatus.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 pt-3 border-t border-gray-100">
                  <span>Last Sync</span>
                  <span className="text-secondary">{gatewayStatus.lastSync ? formatDateTime(gatewayStatus.lastSync) : 'Never'}</span>
                </div>
              </div>

              {/* Health bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                  <span>Connection Health</span>
                  <span className={gatewayStatus.status === 'Connected' ? 'text-emerald-600' : 'text-red-600'}>
                    {gatewayStatus.status === 'Connected' ? '100%' : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: gatewayStatus.status === 'Connected' ? '100%' : '0%' }}
                    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${gatewayStatus.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { label: 'Currency', value: gatewayStatus.currency || 'GBP' },
                  { label: 'Platform Fee', value: `${gatewayStatus.platform_fee || '0'}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-black text-secondary">{value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <RiExchangeLine size={32} className="text-gray-200 mb-3" />
              <p className="text-sm font-bold text-gray-300">No gateway configured</p>
              <p className="text-xs text-gray-300 mt-1">Set up Stripe to start processing</p>
            </div>
          )}

          <button
            onClick={() => setIsGatewayModalOpen(true)}
            className="w-full py-2.5 bg-secondary text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all"
          >
            Configure Gateway
          </button>
        </motion.div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <TransactionModal
          txn={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onDownloadReceipt={() => handleDownloadReceipt(selectedTxn)}
          downloading={busy[`receipt_${selectedTxn?.id}`]}
          taxRate={parseFloat(gatewayStatus?.tax_rate || '0')}
          taxId={gatewayStatus?.tax_id || null}
          currency={currency}
        />
      )}

      {/* Gateway Modal */}
      <AnimatePresence>
        {isGatewayModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setIsGatewayModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary"><RiSecurePaymentLine size={18} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Gateway</p>
                    <h3 className="text-sm font-black text-secondary">Stripe Configuration</h3>
                  </div>
                </div>
                <button onClick={() => setIsGatewayModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition-all">
                  <RiCloseLine size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                    <RiSecurePaymentLine size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary">Stripe API</p>
                    <p className="text-xs text-emerald-600 font-bold">Production Environment</p>
                  </div>
                </div>

                <Input
                  label="Publishable Key"
                  value={gatewayConfig.publishable_key}
                  onChange={e => setGatewayConfig({ ...gatewayConfig, publishable_key: e.target.value })}
                  className="font-mono text-sm"
                />
                <Input
                  label="Secret Key"
                  type="password"
                  value={gatewayConfig.secret_key}
                  onChange={e => setGatewayConfig({ ...gatewayConfig, secret_key: e.target.value })}
                  className="font-mono text-sm"
                />
                <Input
                  label="Webhook Secret"
                  type="password"
                  value={gatewayConfig.webhook_secret}
                  onChange={e => setGatewayConfig({ ...gatewayConfig, webhook_secret: e.target.value })}
                  className="font-mono text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">Currency</label>
                    <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none">
                      <option>GBP (£)</option>
                      <option>USD ($)</option>
                    </select>
                  </div>
                  <Input label="Platform Fee (%)" type="number" defaultValue="2.5" />
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                  <RiInformationLine size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 font-semibold leading-relaxed">
                    Changing these keys affects all active subscriptions. Use caution in production.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                <button
                  onClick={() => setIsGatewayModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-secondary rounded-xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGatewayConfig}
                  className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-90 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperadminPayments;
