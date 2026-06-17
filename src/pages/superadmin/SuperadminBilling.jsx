import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiBillLine,
  RiPieChartLine,
  RiWallet3Line,
  RiPulseLine,
  RiEyeLine,
  RiFileDownloadLine,
  RiSearchLine,
  RiFilter3Line,
  RiSecurePaymentLine,
  RiBuildingLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiCloseLine,
  RiPrinterLine,
  RiArrowRightSLine,
  RiArrowLeftSLine,
} from 'react-icons/ri';
import Button from '../../components/Button';
import Modal from '../../components/common/Modal';
import PageHero, { HeroButton } from '../../components/superadmin/PageHero';
import useBilling from '../../hooks/useBilling';
import useDownloads from '../../hooks/useDownloads';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/datetime';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { getGatewayStatus } from '../../services/billingApi';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function fmtGbp(amount) {
  const n = parseFloat(amount || 0);
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ukDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_META = {
  paid:    { label: 'Paid',    icon: RiCheckboxCircleLine, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  pending: { label: 'Pending', icon: RiTimeLine,           bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  overdue: { label: 'Overdue', icon: RiAlertLine,          bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
  failed:  { label: 'Failed',  icon: RiAlertLine,          bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/* ── Invoice Preview Modal ───────────────────────────────────────────────── */

function InvoiceModal({ invoice, onClose, onDownload, downloading, taxRate = 0, taxId = null }) {
  if (!invoice) return null;

  const amountNet = parseFloat(invoice.amount || 0);
  const taxEnabled = Number.isFinite(taxRate) && taxRate > 0;
  const vatAmount = taxEnabled ? parseFloat((amountNet * (taxRate / 100)).toFixed(2)) : 0;
  const totalGross = parseFloat((amountNet + vatAmount).toFixed(2));
  const org = invoice.organisation || {};
  const plan = invoice.subscription?.plan || {};
  const orgLogoUrl = org.logoUrl ? resolveAssetUrl(org.logoUrl) : null;

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
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <RiBillLine size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Preview</p>
                <h3 className="text-sm font-black text-secondary">{invoice.invoice_number}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-secondary transition-all">
              <RiCloseLine size={20} />
            </button>
          </div>

          {/* Invoice body — scrollable */}
          <div className="overflow-y-auto flex-1 p-6">
            {/* Invoice paper */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {/* Invoice top band */}
              <div className="h-1.5 w-full bg-primary" />

              <div className="p-6">
                {/* Header: logo left, INVOICE right */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    {orgLogoUrl ? (
                      <img src={orgLogoUrl} alt={org.name} className="h-12 max-w-[140px] object-contain mb-2" onError={e => { e.target.style.display='none'; }} />
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                          {(org.name || 'E')[0]}
                        </div>
                        <span className="font-black text-secondary text-lg">{org.name || 'Organisation'}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400">{org.primaryEmail || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary tracking-wider">INVOICE</p>
                    <p className="text-sm font-bold text-gray-500 mt-1">{invoice.invoice_number}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-gray-200 mb-6" />

                {/* Supplier / Bill To / Invoice Details */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">From</p>
                    <p className="text-sm font-bold text-secondary">EPiC HRIS Platform</p>
                    <p className="text-xs text-gray-500">Elite PiC Ltd</p>
                    <p className="text-xs text-gray-500">United Kingdom</p>
                    {taxEnabled && taxId && <p className="text-xs text-gray-400 mt-1">Tax ID: {taxId}</p>}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
                    <p className="text-sm font-bold text-secondary">{org.name || '—'}</p>
                    <p className="text-xs text-gray-500">{org.primaryEmail || '—'}</p>
                    <p className="text-xs text-gray-500">{org.country || 'United Kingdom'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Invoice Details</p>
                    <div className="space-y-1">
                      {[
                        ['Invoice No', invoice.invoice_number],
                        ['Date', ukDate(invoice.createdAt)],
                        ['Due', ukDate(invoice.due_at)],
                        ['Currency', invoice.currency || 'GBP'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-xs text-gray-400 w-16 shrink-0">{k}:</span>
                          <span className="text-xs font-bold text-secondary">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Line items table */}
                <div className="rounded-xl overflow-hidden border border-gray-100 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-primary text-white">
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Description</th>
                        <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider">Period</th>
                        <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wider">{taxEnabled ? "Unit Price" : "Amount"}</th>
                        {taxEnabled && <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wider">VAT ({taxRate}%)</th>}
                        {taxEnabled && <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider">Total</th>}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-blue-50/30">
                        <td className="px-4 py-4">
                          <p className="font-bold text-secondary text-sm">EPiC HRIS — {plan.name || 'Subscription'} Plan</p>
                          <p className="text-xs text-gray-400 mt-0.5">Payment via {invoice.payment_method || 'N/A'}</p>
                          {invoice.stripe_invoice_id && (
                            <p className="text-xs text-gray-400">Gateway: {invoice.stripe_invoice_id}</p>
                          )}
                        </td>
                        <td className="px-3 py-4 text-center text-xs font-semibold text-gray-600">{plan.billing_cycle || 'Monthly'}</td>
                        <td className="px-3 py-4 text-right text-sm font-semibold text-secondary">{fmtGbp(amountNet)}</td>
                        {taxEnabled && <td className="px-3 py-4 text-right text-sm font-semibold text-gray-500">{fmtGbp(vatAmount)}</td>}
                        {taxEnabled && <td className="px-4 py-4 text-right text-sm font-black text-primary">{fmtGbp(totalGross)}</td>}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-64 rounded-xl overflow-hidden border border-gray-100">
                    {taxEnabled ? (
                      <>
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">Subtotal (ex. VAT)</span>
                          <span className="text-sm font-semibold text-secondary">{fmtGbp(amountNet)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                          <span className="text-xs text-gray-500">VAT @ {taxRate}%</span>
                          <span className="text-sm font-semibold text-secondary">{fmtGbp(vatAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center px-4 py-3 bg-primary">
                          <span className="text-sm font-black text-white">TOTAL DUE</span>
                          <span className="text-base font-black text-white">{fmtGbp(totalGross)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center px-4 py-3 bg-primary">
                        <span className="text-sm font-black text-white">TOTAL DUE</span>
                        <span className="text-base font-black text-white">{fmtGbp(amountNet)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment note */}
                <div className={`rounded-xl p-4 text-xs border ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : 'bg-amber-50 border-amber-100 text-amber-700'
                }`}>
                  {invoice.status === 'paid'
                    ? `✓ Payment received on ${ukDate(invoice.paid_at)}. Thank you for your business.`
                    : `Please quote invoice reference ${invoice.invoice_number} when making payment. Due by ${ukDate(invoice.due_at)}.`
                  }
                </div>

                {/* Footer note */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-300">
                    EPiC HRIS Platform · support@elitepic.co.uk · This is a computer-generated invoice and requires no signature.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400">
              VAT invoice compliant with UK HMRC requirements
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-secondary rounded-xl hover:bg-gray-100 transition-all"
              >
                Close
              </button>
              <button
                onClick={onDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                {downloading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RiFileDownloadLine size={16} />
                )}
                Download PDF
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */

const ITEMS_PER_PAGE = 10;

const SuperadminBilling = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [taxRate, setTaxRate] = useState(0);
  const [taxId, setTaxId] = useState(null);

  const {
    invoices,
    invoicesLoading,
    fetchInvoices,
    fetchInvoiceById,
    dashboardStats,
    statsLoading,
    fetchDashboardStats,
  } = useBilling();

  const { exportSuperadminFinancials, downloadSuperadminInvoicePdf, busy } = useDownloads();

  useEffect(() => {
    fetchInvoices();
    fetchDashboardStats();
    getGatewayStatus().then(res => {
      const gw = res.data?.data?.gateway || {};
      const rate = parseFloat(gw.tax_rate || '0');
      setTaxRate(Number.isFinite(rate) && rate > 0 ? rate : 0);
      setTaxId(gw.tax_id || null);
    }).catch(() => {});
  }, [fetchInvoices, fetchDashboardStats]);

  const stats = [
    { title: 'Monthly Recurring', subtitle: 'MRR', value: `£${dashboardStats?.mrr || '0'}`, icon: RiPulseLine,   bgClass: 'bg-blue-600' },
    { title: 'Annual Recurring',  subtitle: 'ARR', value: `£${dashboardStats?.arr || '0'}`, icon: RiWallet3Line, bgClass: 'bg-indigo-600' },
    { title: 'Churn Rate',        subtitle: '30d',  value: `${dashboardStats?.churnRate || '0'}%`, icon: RiPieChartLine, bgClass: 'bg-amber-500' },
    { title: 'Active Subscriptions', subtitle: 'Live', value: dashboardStats?.activeSubscriptions || '0', icon: RiBillLine, bgClass: 'bg-emerald-600' },
  ];

  const filteredBilling = invoices.filter(item => {
    const matchSearch =
      item.organisation?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || item.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBilling.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredBilling.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleView = async (invoice) => {
    try {
      const res = await fetchInvoiceById(invoice.id);
      if (res.ok) setSelectedInvoice(res.data);
      else toast.error('Failed to load invoice details');
    } catch {
      toast.error('Failed to load invoice details');
    }
  };

  const handleDownload = async (invoice) => {
    const result = await downloadSuperadminInvoicePdf(invoice);
    if (result.ok) toast.success(`Invoice ${invoice.invoice_number} downloaded`);
    else toast.error(result.message || `Failed to download invoice ${invoice.invoice_number}`);
  };

  const handleExport = async () => {
    const result = await exportSuperadminFinancials();
    if (result.ok) toast.success('Financials exported successfully');
    else toast.error(result.message || 'Failed to export financials');
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Page hero */}
      <PageHero
        icon={RiBillLine}
        title="Billing & Revenue"
        subtitle="Monitor platform monetisation, subscription health, and revenue analytics."
      >
        <HeroButton onClick={handleExport}>
          <RiFileDownloadLine size={16} /> Export Financials
        </HeroButton>
      </PageHero>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
            ))
          : stats.map((stat, idx) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.35 }}
                className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-5 group hover:shadow-md transition-shadow"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full ${stat.bgClass} opacity-5 translate-x-8 -translate-y-8 group-hover:opacity-10 transition-opacity`} />
                <div className={`inline-flex p-2 rounded-xl ${stat.bgClass} text-white mb-3 shadow-sm`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-xs font-bold text-gray-400 mb-0.5">{stat.title}</p>
                <p className="text-2xl font-black text-secondary tracking-tight">{stat.value}</p>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{stat.subtitle}</span>
              </motion.div>
            ))}
      </div>

      {/* Ledger table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Table toolbar */}
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-secondary uppercase tracking-widest">Revenue Ledger</h3>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" /> Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
              <input
                type="text"
                placeholder="Search invoice or org…"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-secondary w-48 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
              />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="py-1.5 pl-3 pr-7 bg-white border border-gray-200 rounded-lg text-xs font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {['All', 'Paid', 'Pending', 'Overdue', 'Failed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left">Invoice</th>
                <th className="px-5 py-3 text-left">Organisation</th>
                <th className="px-5 py-3 text-left">Plan</th>
                {taxRate > 0 && <th className="px-5 py-3 text-right">Net Amount</th>}
                {taxRate > 0 && <th className="px-5 py-3 text-right">VAT ({taxRate}%)</th>}
                <th className="px-5 py-3 text-right">{taxRate > 0 ? "Total" : "Amount"}</th>
                <th className="px-5 py-3 text-center">Due</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoicesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: taxRate > 0 ? 9 : 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={taxRate > 0 ? 9 : 7} className="py-16 text-center">
                    <RiBillLine size={32} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm font-bold text-gray-300">No invoices found</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const net = parseFloat(item.amount || 0);
                  const vat = taxRate > 0 ? parseFloat((net * (taxRate / 100)).toFixed(2)) : 0;
                  const total = net + vat;
                  const orgLogoUrl = item.organisation?.logoUrl ? resolveAssetUrl(item.organisation.logoUrl) : null;

                  return (
                    <motion.tr
                      key={item.invoice_number}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-blue-50/20 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                          <RiBillLine size={11} />
                          {item.invoice_number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {orgLogoUrl ? (
                            <img src={orgLogoUrl} alt="" className="w-7 h-7 rounded-lg object-contain border border-gray-100 bg-gray-50" onError={e => { e.target.style.display='none'; }} />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-primary font-black text-xs">
                              {(item.organisation?.name || 'O')[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-secondary leading-tight">{item.organisation?.name || '—'}</p>
                            <p className="text-[10px] text-gray-400">{item.payment_method || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {item.subscription?.plan?.name || '—'}
                        </span>
                      </td>
                      {taxRate > 0 && <td className="px-5 py-3.5 text-right text-xs font-semibold text-secondary">{fmtGbp(net)}</td>}
                      {taxRate > 0 && <td className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">{fmtGbp(vat)}</td>}
                      <td className="px-5 py-3.5 text-right text-sm font-black text-secondary">{taxRate > 0 ? fmtGbp(total) : fmtGbp(net)}</td>
                      <td className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500">
                        <span className="flex items-center justify-center gap-1">
                          <RiCalendarLine size={11} className="text-gray-400" />
                          {item.due_at ? ukDate(item.due_at) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(item)}
                            title="View Invoice"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all"
                          >
                            <RiEyeLine size={15} />
                          </button>
                          <button
                            onClick={() => handleDownload(item)}
                            disabled={busy[`invoicePdf_${item.id}`]}
                            title="Download PDF"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-wait"
                          >
                            {busy[`invoicePdf_${item.id}`]
                              ? <span className="block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              : <RiFileDownloadLine size={15} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400">
            {filteredBilling.length === 0 ? 'No results' : `Showing ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredBilling.length)}–${Math.min(currentPage * ITEMS_PER_PAGE, filteredBilling.length)} of ${filteredBilling.length}`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-secondary hover:bg-white disabled:opacity-30 transition-all"
            >
              <RiArrowLeftSLine size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === page ? 'bg-primary text-white shadow-sm' : 'border border-gray-200 text-gray-400 hover:bg-white hover:text-secondary'}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-secondary hover:bg-white disabled:opacity-30 transition-all"
            >
              <RiArrowRightSLine size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Invoice preview modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onDownload={() => handleDownload(selectedInvoice)}
          downloading={busy[`invoicePdf_${selectedInvoice?.id}`]}
          taxRate={taxRate}
          taxId={taxId}
        />
      )}
    </div>
  );
};

export default SuperadminBilling;
