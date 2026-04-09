import { CreditCard, Download, Filter, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

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
      ? "bg-green-100 text-green-700"
      : status === "Pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";
  };

  const getStatusIcon = (status) => {
    return status === "Completed" ? (
      <CheckCircle2 size={16} className="text-green-600" />
    ) : (
      <AlertCircle size={16} className="text-amber-600" />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-2">Manage invoices and payment history</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
          <CreditCard size={18} />
          Make Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <p className="text-slate-600 text-sm mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">£{totalPaid.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <p className="text-slate-600 text-sm mb-1">Amount Pending</p>
          <p className="text-2xl font-bold text-amber-600">£{totalPending.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <p className="text-slate-600 text-sm mb-1">Payment Methods</p>
          <p className="text-slate-900 font-semibold">3 on file</p>
          <p className="text-slate-500 text-xs mt-1">•••• 4242</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Description</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Invoice No.</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Amount</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Date</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Status</th>
              <th className="text-right px-6 py-4 text-slate-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-slate-900 font-medium">{payment.description}</p>
                  {payment.dueDate !== "N/A" && (
                    <p className="text-slate-600 text-sm">Due: {payment.dueDate}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-700 font-mono">{payment.invoiceNo}</td>
                <td className="px-6 py-4 text-slate-900 font-semibold">{payment.amount}</td>
                <td className="px-6 py-4 text-slate-700">{payment.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(payment.status)}
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-1 hover:bg-slate-200 rounded transition-colors text-blue-600" title="Download">
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
          <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">No payments found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default BusinessPayment;
