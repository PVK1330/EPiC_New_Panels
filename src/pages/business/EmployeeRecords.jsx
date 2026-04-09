import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  Plus,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";

const EmployeeRecords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Ahmed Khan",
      nationality: "Pakistan",
      visaType: "Skilled Worker",
      niNumber: "AB123456C",
      email: "ahmed.khan@company.com",
      phone: "+44 20 7123 4567",
      startDate: "2023-01-15",
      status: "Active",
      documents: {
        passport: "complete",
        visaCopy: "complete",
        cosCopy: "complete",
        contract: "complete",
        payslips: "partial",
      },
    },
    {
      id: 2,
      name: "Priya Sharma",
      nationality: "India",
      visaType: "Skilled Worker",
      niNumber: "CD234567D",
      email: "priya.sharma@company.com",
      phone: "+44 20 7123 4568",
      startDate: "2023-03-20",
      status: "Active",
      documents: {
        passport: "complete",
        visaCopy: "complete",
        cosCopy: "complete",
        contract: "complete",
        payslips: "complete",
      },
    },
    {
      id: 3,
      name: "John Smith",
      nationality: "United Kingdom",
      visaType: "British Citizen",
      niNumber: "EF345678E",
      email: "john.smith@company.com",
      phone: "+44 20 7123 4569",
      startDate: "2022-11-01",
      status: "Active",
      documents: {
        passport: "complete",
        visaCopy: "complete",
        cosCopy: "complete",
        contract: "complete",
        payslips: "complete",
      },
    },
    {
      id: 4,
      name: "Sarah Johnson",
      nationality: "United States",
      visaType: "Skilled Worker",
      niNumber: "GH456789F",
      email: "sarah.johnson@company.com",
      phone: "+44 20 7123 4570",
      startDate: "2023-06-10",
      status: "On Leave",
      documents: {
        passport: "complete",
        visaCopy: "complete",
        cosCopy: "complete",
        contract: "complete",
        payslips: "partial",
      },
    },
  ]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getDocStatusStyle = (status) => {
    switch (status) {
      case "complete":
        return "bg-emerald-100 text-emerald-700";
      case "partial":
        return "bg-amber-100 text-amber-700";
      case "risk":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDocStatusIcon = (status) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 size={12} className="text-emerald-600" />;
      case "partial":
        return <AlertCircle size={12} className="text-amber-600" />;
      case "risk":
        return <ShieldCheck size={12} className="text-red-600" />;
      default:
        return null;
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.niNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "active" && employee.status === "Active") ||
      (filterType === "on-leave" && employee.status === "On Leave");
    return matchesSearch && matchesFilter;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const onLeaveEmployees = employees.filter((e) => e.status === "On Leave").length;

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
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
          Employee Records
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage HR files and document storage for all employees.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Users size={20} className="text-primary" />
            <span className="font-black">Total Employees</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalEmployees}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Active</span>
          </div>
          <p className="text-3xl font-black text-secondary">{activeEmployees}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="font-black">On Leave</span>
          </div>
          <p className="text-3xl font-black text-secondary">{onLeaveEmployees}</p>
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
              placeholder="Search employees..."
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
              <option value="all">All Employees</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </motion.div>

      {/* Employee Table */}
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Employee</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Nationality</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">NI Number</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Start Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Documents</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-black text-primary">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-black text-secondary">{employee.name}</p>
                        <p className="text-[10px] font-bold text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{employee.nationality}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{employee.visaType}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{employee.niNumber}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{employee.phone}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{employee.startDate}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${employee.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {Object.entries(employee.documents).map(([doc, status]) => (
                        <span
                          key={doc}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-[9px] font-black rounded ${getDocStatusStyle(status)}`}
                          title={doc}
                        >
                          {getDocStatusIcon(status)}
                          {doc.charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewEmployee(employee)}
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

      {/* Employee Details Modal */}
      {showModal && selectedEmployee && (
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
            className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-secondary">Employee Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Full Name</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedEmployee.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Nationality</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedEmployee.nationality}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">NI Number</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedEmployee.niNumber}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Start Date</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedEmployee.startDate}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Email</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedEmployee.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Phone</p>
                    <p className="text-sm font-black text-secondary mt-1">{selectedEmployee.phone}</p>
                  </div>
                </div>
              </div>

              {/* Visa Information */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Visa Information</h4>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Visa Type</p>
                  <p className="text-sm font-black text-secondary mt-1">{selectedEmployee.visaType}</p>
                </div>
              </div>

              {/* Document Status */}
              <div>
                <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Document Status</h4>
                <div className="space-y-3">
                  {Object.entries(selectedEmployee.documents).map(([doc, status]) => (
                    <div key={doc} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-500" />
                        <span className="text-sm font-black text-secondary capitalize">{doc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDocStatusIcon(status)}
                        <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getDocStatusStyle(status)}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                >
                  Close
                </button>
                <button className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition">
                  Download All Documents
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default EmployeeRecords;
