import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Building2,
  X,
} from "lucide-react";

const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceId: "INV-2024-001",
      case: "Sponsor Licence Application",
      amount: 2500.00,
      status: "Paid",
      dueDate: "2024-02-15",
      paidDate: "2024-02-14",
      paymentMethod: "Bank Transfer",
      receipt: "REC-001",
    },
    {
      id: 2,
      invoiceId: "INV-2024-002",
      case: "CoS Allocation (5 CoS)",
      amount: 1750.00,
      status: "Pending",
      dueDate: "2024-03-20",
      paidDate: "-",
      paymentMethod: "-",
      receipt: "-",
    },
    {
      id: 3,
      invoiceId: "INV-2024-003",
      case: "Worker Visa Processing",
      amount: 1200.00,
      status: "Paid",
      dueDate: "2024-03-10",
      paidDate: "2024-03-08",
      paymentMethod: "Credit Card",
      receipt: "REC-003",
    },
    {
      id: 4,
      invoiceId: "INV-2024-004",
      case: "Compliance Audit",
      amount: 800.00,
      status: "Overdue",
      dueDate: "2024-03-05",
      paidDate: "-",
      paymentMethod: "-",
      receipt: "-",
    },
    {
      id: 5,
      invoiceId: "INV-2024-005",
      case: "Document Verification",
      amount: 450.00,
      status: "Paid",
      dueDate: "2024-03-15",
      paidDate: "2024-03-12",
      paymentMethod: "Bank Transfer",
      receipt: "REC-005",
    },
  ]);

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
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Pending":
        return <Clock size={16} className="text-amber-600" />;
      case "Overdue":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.case.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "paid" && invoice.status === "Paid") ||
      (filterType === "pending" && invoice.status === "Pending") ||
      (filterType === "overdue" && invoice.status === "Overdue");
    return matchesSearch && matchesFilter;
  });

  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter((i) => i.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status !== "Paid").reduce((sum, inv) => sum + inv.amount, 0);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
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
          Invoices
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          View and manage all invoices and payment records.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <FileText size={20} className="text-primary" />
            <span className="font-black">Total Invoices</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalInvoices}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <DollarSign size={20} className="text-primary" />
            <span className="font-black">Total Amount</span>
          </div>
          <p className="text-3xl font-black text-secondary">£{totalAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Paid</span>
          </div>
          <p className="text-3xl font-black text-secondary">£{paidAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Clock size={20} className="text-amber-500" />
            <span className="font-black">Pending</span>
          </div>
          <p className="text-3xl font-black text-secondary">£{pendingAmount.toLocaleString()}</p>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            >
              <option value="all">All Invoices</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Invoices Table */}
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Invoice ID</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Case</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Due Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Paid Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Payment Method</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-black text-secondary">{invoice.invoiceId}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{invoice.case}</td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-black text-secondary">£{invoice.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{invoice.dueDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{invoice.paidDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{invoice.paymentMethod}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusStyle(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-primary">
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

      {/* Invoice Details Modal */}
      {showModal && selectedInvoice && (
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
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-secondary">Invoice Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <FileText size={32} className="text-primary" />
                <div>
                  <p className="text-sm font-black text-secondary">{selectedInvoice.invoiceId}</p>
                  <p className="text-xs font-bold text-gray-500">{selectedInvoice.case}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Amount</p>
                  <p className="text-sm font-black text-secondary mt-1">£{selectedInvoice.amount.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedInvoice.status)}
                    <span className={`text-sm font-black rounded-full px-3 py-1 ${getStatusStyle(selectedInvoice.status)}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Due Date</p>
                  <p className="text-sm font-black text-secondary mt-1">{selectedInvoice.dueDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Paid Date</p>
                  <p className="text-sm font-black text-secondary mt-1">{selectedInvoice.paidDate}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Payment Method</p>
                  <p className="text-sm font-black text-secondary mt-1">{selectedInvoice.paymentMethod}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Receipt</p>
                  <p className="text-sm font-black text-secondary mt-1">{selectedInvoice.receipt}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                >
                  Close
                </button>
                <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition">
                  Download Receipt
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Invoices;
