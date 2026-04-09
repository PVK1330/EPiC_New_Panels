import { CreditCard, Download, Filter, Search, CheckCircle2, AlertCircle, Eye, LayoutDashboard, DollarSign, Clock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const BusinessPayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const payments = [
    {
      id: 1,
      description: "Certificate of Sponsorship - 2 Workers",
      amount: "£7,000.00",
      date: "15 Jan 2024",
      status: "Completed",
      invoiceNo: "INV-2024-001",
      dueDate: "N/A",
    },
    {
      id: 2,
      description: "COS Renewal Fee",
      amount: "£3,500.00",
      date: "10 Jan 2024",
      status: "Completed",
      invoiceNo: "INV-2024-002",
      dueDate: "N/A",
    },
    {
      id: 3,
      description: "Annual Compliance Audit Fee",
      amount: "£2,500.00",
      date: "05 Jan 2024",
      status: "Pending",
      invoiceNo: "INV-2024-003",
      dueDate: "22 Jan 2024",
    },
    {
      id: 4,
      description: "License Renewal Payment",
      amount: "£5,000.00",
      date: "01 Jan 2024",
      status: "Completed",
      invoiceNo: "INV-2024-004",
      dueDate: "N/A",
    },
    {
      id: 5,
      description: "Immigration Health Surcharge - 1 Worker",
      amount: "£1,035.00",
      date: "28 Dec 2023",
      status: "Completed",
      invoiceNo: "INV-2023-301",
      dueDate: "N/A",
    },
    {
      id: 6,
      description: "Admin Fee - Late COS Submission",
      amount: "£500.00",
      date: "20 Dec 2023",
      status: "Completed",
      invoiceNo: "INV-2023-302",
      dueDate: "N/A",
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      payment.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalPaid = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace("£", "").replace(",", "")), 0);

  const totalPending = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace("£", "").replace(",", "")), 0);

  const getStatusColor = (status) => {
    return status === "Completed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    return status === "Completed" ? (
      <CheckCircle2 size={16} className="text-emerald-600" />
    ) : (
      <AlertCircle size={16} className="text-amber-600" />
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const handleView = (payment) => {
    alert(`Viewing payment: ${payment.invoiceNo}`);
  };

  const handleDownload = (payment) => {
    alert(`Downloading invoice: ${payment.invoiceNo}`);
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={36} />
          Payments
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage invoices and payment history.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <DollarSign size={20} className="text-emerald-600" />
            <span className="font-black">Total Paid</span>
          </div>
          <p className="text-3xl font-black text-secondary">£{totalPaid.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Clock size={20} className="text-amber-500" />
            <span className="font-black">Amount Pending</span>
          </div>
          <p className="text-3xl font-black text-secondary">£{totalPending.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CreditCard size={20} className="text-primary" />
            <span className="font-black">Payment Methods</span>
          </div>
          <p className="text-sm font-black text-secondary">3 on file</p>
          <p className="text-xs font-bold text-gray-500 mt-1">•••• 4242</p>
        </motion.div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark">
            <CreditCard size={16} />
            Make Payment
          </button>
        </div>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Description</th>
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
                    {payment.dueDate !== "N/A" && (
                      <p className="text-xs font-bold text-gray-500">Due: {payment.dueDate}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{payment.invoiceNo}</td>
                  <td className="px-4 py-4 text-sm font-black text-secondary">{payment.amount}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{payment.date}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(payment.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(payment)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownload(payment)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <motion.div
          className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 font-bold">No payments found matching your search</p>
        </motion.div>
      )}
    </div>
  );
};

export default BusinessPayment;
