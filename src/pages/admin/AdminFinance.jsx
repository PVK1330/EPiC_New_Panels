import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Clock, CheckCircle, TrendingUp, CreditCard, Landmark, Globe, X, RefreshCw } from "lucide-react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { getFinancialReport, getFinancialTransactions } from "../../services/reportingApi";


const paymentMethods = [
  { label: "Credit Card",   sub: "45% of transactions", amount: "£56,250", bg: "bg-blue-100",   color: "text-blue-600",   icon: CreditCard },
  { label: "Bank Transfer", sub: "35% of transactions", amount: "£43,750", bg: "bg-green-100",  color: "text-green-600",  icon: Landmark },
  { label: "PayPal",        sub: "20% of transactions", amount: "£25,000", bg: "bg-purple-100", color: "text-purple-600", icon: Globe },
];

const upcomingPayments = [
  { client: "Tech Solutions Ltd", note: "Due in 3 days",     amount: "£5,000", overdue: false },
  { client: "Global Tech Inc",    note: "Due in 5 days",     amount: "£6,500", overdue: false },
  { client: "Innovation Labs",    note: "Overdue by 2 days", amount: "£4,200", overdue: true },
];

const paymentTermsOptions = [
  "Net 15", "Net 30", "Net 45", "Net 60", "Due on Receipt", "Due on Submission",
];

const typeBadge = {
  Invoice: "bg-blue-100 text-blue-800",
  Refund:  "bg-purple-100 text-purple-800",
};

const statusBadge = {
  Paid:      "bg-green-100 text-green-800",
  Pending:   "bg-yellow-100 text-yellow-800",
  Processed: "bg-green-100 text-green-800",
};

const TABLE_COLS = ["Transaction ID", "Client", "Case ID", "Amount", "Type", "Status", "Date", "Actions"];

const newItem = () => ({ id: `${Date.now()}`, description: "", quantity: 1, rate: 0, amount: 0 });

const emptyForm = () => ({
  clientName:   "",
  clientEmail:  "",
  caseId:       "",
  invoiceNumber: `INV-${Date.now()}`,
  invoiceDate:  new Date().toISOString().split("T")[0],
  dueDate:      "",
  items:        [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
  subtotal:     0,
  taxRate:      20,
  taxAmount:    0,
  total:        0,
  notes:        "",
  paymentTerms: "Net 30",
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const recalcTotals = (items, taxRate) => {
  const subtotal  = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
};

export default function AdminFinance() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData]   = useState(emptyForm());
  const [errors, setErrors]       = useState({});

  const [financeStats, setFinanceStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, transRes] = await Promise.all([
        getFinancialReport(),
        getFinancialTransactions({ page: pagination.page, limit: 10 })
      ]);

      if (statsRes.data?.status === 'success') {
        setFinanceStats(statsRes.data.data);
      }
      if (transRes.data?.status === 'success') {
        setTransactions(transRes.data.data.transactions);
        setPagination(transRes.data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load finance data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = [
    { 
      label: "Total Revenue",    
      value: `£${(financeStats?.summary?.totalRevenue || 0).toLocaleString()}`, 
      sub: `${financeStats?.summary?.totalPaid || 0} payments received`, 
      bg: "bg-green-100",  
      color: "text-green-600",  
      subColor: "text-green-600",  
      icon: DollarSign 
    },
    { 
      label: "Outstanding",      
      value: `£${(financeStats?.summary?.totalOutstanding || 0).toLocaleString()}`,  
      sub: "Pending payments",   
      bg: "bg-yellow-100", 
      color: "text-yellow-600", 
      subColor: "text-yellow-600", 
      icon: Clock 
    },
    { 
      label: "Revenue Status",  
      value: financeStats?.statusBreakdown?.find(s => s.status === 'completed')?.count || 0,  
      sub: "Completed transactions", 
      bg: "bg-blue-100",  
      color: "text-blue-600",  
      subColor: "text-blue-600",   
      icon: CheckCircle 
    },
    { 
      label: "Avg. Revenue",     
      value: `£${(financeStats?.summary?.totalRevenue / (financeStats?.summary?.totalPaid || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})}`,   
      sub: "Per successful payment",             
      bg: "bg-purple-100", 
      color: "text-purple-600", 
      subColor: "text-purple-600", 
      icon: TrendingUp 
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = formData.items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "rate") {
        updated.amount = updated.quantity * updated.rate;
      }
      return updated;
    });
    setFormData((prev) => ({ ...prev, items: newItems, ...recalcTotals(newItems, prev.taxRate) }));
  };

  const handleTaxRateChange = (value) => {
    const taxRate = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, taxRate, ...recalcTotals(prev.items, taxRate) }));
  };

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem()] }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems, ...recalcTotals(newItems, prev.taxRate) }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.clientName.trim())  newErrors.clientName  = "Client name is required";
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "Client email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = "Please enter a valid email address";
    }
    if (!formData.caseId.trim())      newErrors.caseId      = "Case ID is required";
    if (!formData.dueDate)            newErrors.dueDate     = "Due date is required";
    const hasEmptyItems = formData.items.some(
      (item) => !item.description.trim() || item.quantity <= 0 || item.rate <= 0
    );
    if (hasEmptyItems) newErrors.items = "All line items must have description, quantity, and rate";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Invoice generated:", formData);
      closeModal();
    } catch (error) {
      console.error("Failed to generate invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData(emptyForm());
    setErrors({});
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <DollarSign className="text-primary" size={36} />
            Finance
          </h1>
          <p className="text-primary font-bold text-sm mt-1">
            Manage payments, invoices, and financial reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={loadData} disabled={isLoading}>
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setModalOpen(true)}>Generate Invoice</Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, sub, bg, color, subColor, icon: Icon }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4"
          >
            <div className={`p-3 ${bg} rounded-lg shrink-0`}>
              <Icon className={`${color} h-6 w-6`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-black text-secondary">{value}</p>
              <p className={`text-xs ${subColor} mt-0.5`}>{sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Transactions Table */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-secondary">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_COLS.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {transactions.map(({ id, client, caseId, amount, type, status, date }, index) => (
                <motion.tr
                  key={id}
                  className="hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">{id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{client}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{caseId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary">{amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeBadge[type]}`}>{type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge[status]}`}>{status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary font-bold hover:underline">View</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Methods + Upcoming Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Sources (Dynamic from stats) */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-black text-secondary">Revenue Sources</h3>
          </div>
          <div className="p-6 space-y-4">
            {financeStats?.byVisaType?.map((v, i) => (
              <div key={v.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${['bg-blue-100', 'bg-purple-100', 'bg-green-100', 'bg-amber-100'][i % 4]} rounded-lg`}>
                    <Globe className={`${['text-blue-600', 'text-purple-600', 'text-green-600', 'text-amber-600'][i % 4]} h-5 w-5`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary">{v.name}</p>
                    <p className="text-xs text-gray-500">Total volume</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-secondary">£{v.total.toLocaleString()}</span>
              </div>
            )) || (
              <p className="text-sm text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </motion.div>

        {/* Pending Payments (Dynamic from transactions) */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-black text-secondary">Pending Payments</h3>
          </div>
          <div className="p-6 space-y-4">
            {transactions.filter(t => t.status === 'Pending').map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-yellow-50 border-yellow-200"
              >
                <div>
                  <p className="text-sm font-bold text-secondary">{t.client}</p>
                  <p className="text-xs text-gray-500">Case: {t.caseId} · Due soon</p>
                </div>
                <span className="text-sm font-bold text-secondary">{t.amount}</span>
              </div>
            )) || (
              <p className="text-sm text-gray-400 text-center py-4">All caught up!</p>
            )}
            {transactions.filter(t => t.status === 'Pending').length === 0 && (
              <div className="p-12 text-center flex flex-col items-center gap-2">
                 <CheckCircle className="text-green-500" size={32} />
                 <p className="text-sm text-gray-400 font-bold italic">No pending payments found.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Generate Invoice Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Panel */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-secondary">Generate Invoice</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Create a new invoice for client billing</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Client Information */}
                <div>
                  <h4 className="text-sm font-black text-secondary mb-4">Client Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Client Name"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      error={errors.clientName}
                      placeholder="Enter client name"
                      required
                    />
                    <Input
                      label="Client Email"
                      name="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      error={errors.clientEmail}
                      placeholder="Enter client email"
                      required
                    />
                    <Input
                      label="Case ID"
                      name="caseId"
                      value={formData.caseId}
                      onChange={handleInputChange}
                      error={errors.caseId}
                      placeholder="Enter case ID"
                      required
                    />
                    <Input
                      label="Invoice Number"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                      placeholder="Enter invoice number"
                      required
                    />
                  </div>
                </div>

                {/* Invoice Details */}
                <div>
                  <h4 className="text-sm font-black text-secondary mb-4">Invoice Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Invoice Date"
                      name="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      label="Due Date"
                      name="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      error={errors.dueDate}
                      required
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Payment Terms <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        {paymentTermsOptions.map((term) => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black text-secondary">Line Items</h4>
                    <Button type="button" variant="ghost" onClick={addItem}>+ Add Item</Button>
                  </div>

                  <div className="space-y-3">
                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-3 px-1">
                      {["Description", "Qty", "Rate (£)", "Amount (£)", ""].map((h) => (
                        <span
                          key={h}
                          className={`text-xs font-bold text-gray-500 uppercase ${
                            h === "Description" ? "col-span-5" :
                            h === ""            ? "col-span-1" : "col-span-2"
                          }`}
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    {formData.items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5">
                          <input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            placeholder="Item description"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.amount.toFixed(2)}
                            disabled
                            className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-100 text-gray-500"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.items && (
                    <p className="text-xs text-red-500 mt-2">{errors.items}</p>
                  )}
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-full md:w-72 space-y-3">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-bold">£{formData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>Tax Rate:</span>
                        <input
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) => handleTaxRateChange(e.target.value)}
                          min="0"
                          max="100"
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                        <span>%</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700">£{formData.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-secondary border-t border-gray-200 pt-3">
                      <span>Total:</span>
                      <span>£{formData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Invoice Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter any additional notes or payment instructions..."
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <Button type="button" variant="ghost" onClick={closeModal} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Invoice"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
