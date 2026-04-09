import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Filter,
  Search,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
  Briefcase,
  ShieldCheck,
} from "lucide-react";

const BusinessWorkers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const workers = [
    {
      id: 1,
      name: "John Doe",
      visa: "Skilled Worker",
      cos: "X1A2B3456",
      job: "Software Engineer",
      department: "Engineering",
      salary: "£45,000",
      phone: "+44 20 7123 4567",
      startDate: "15 Jan 2023",
      expiry: "12 Jan 2025",
      status: "Expiring",
      email: "john.doe@example.com",
    },
    {
      id: 2,
      name: "Priya Shah",
      visa: "Skilled Worker",
      cos: "X7C8D9012",
      job: "Data Analyst",
      department: "Analytics",
      salary: "£38,000",
      phone: "+44 20 7123 4568",
      startDate: "20 Mar 2022",
      expiry: "30 Jun 2026",
      status: "Active",
      email: "priya.shah@example.com",
    },
    {
      id: 3,
      name: "Ahmed Khan",
      visa: "Intra-company",
      cos: "X9G0H1234",
      job: "Finance Manager",
      department: "Finance",
      salary: "£55,000",
      phone: "+44 20 7123 4569",
      startDate: "01 Sep 2021",
      expiry: "22 Dec 2025",
      status: "Active",
      email: "ahmed.khan@example.com",
    },
    {
      id: 4,
      name: "Mike Torres",
      visa: "ICT",
      cos: "X4E5F6789",
      job: "Project Manager",
      department: "Operations",
      salary: "£50,000",
      phone: "+44 20 7123 4570",
      startDate: "10 Jul 2023",
      expiry: "15 Mar 2025",
      status: "Warning",
      email: "mike.torres@example.com",
    },
    {
      id: 5,
      name: "Sarah Johnson",
      visa: "Skilled Worker",
      cos: "X2J3K4567",
      job: "HR Manager",
      department: "Human Resources",
      salary: "£42,000",
      phone: "+44 20 7123 4571",
      startDate: "05 Nov 2023",
      expiry: "08 Jan 2027",
      status: "Active",
      email: "sarah.johnson@example.com",
    },
  ];

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.cos.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || worker.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700";
      case "Expiring":
        return "bg-red-100 text-red-700";
      case "Warning":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Expiring":
        return <AlertCircle size={16} className="text-red-600" />;
      case "Warning":
        return <AlertCircle size={16} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const activeCount = workers.filter((w) => w.status === "Active").length;
  const warningCount = workers.filter((w) => w.status === "Warning" || w.status === "Expiring").length;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
          Workers
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage sponsored workers and visa sponsorships.
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
            <span className="font-black">Total Workers</span>
          </div>
          <p className="text-3xl font-black text-secondary">{workers.length}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span className="font-black">Active</span>
          </div>
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
            {activeCount}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="font-black">Expiring/Warning</span>
          </div>
          <p className="text-3xl font-black text-secondary">{warningCount}</p>
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
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            >
              <option value="all">All Workers</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <button
            onClick={()=>navigate("/business/sponsored-workers")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <Plus size={16} />
            Add Worker
          </button>
        </div>
      </motion.div>

      {/* Workers Table */}
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Job Title</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Department</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">COS</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Expiry Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-secondary">{worker.name}</p>
                    <p className="text-xs font-bold text-gray-600">{worker.email}</p>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">{worker.job}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-700">{worker.department}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full bg-primary/10 text-primary">
                      {worker.visa}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600 font-mono">{worker.cos}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">{worker.expiry}</span>
                      <span className="text-[10px] font-bold text-gray-500">Start: {worker.startDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(worker.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusColor(worker.status)}`}>
                        {worker.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate("/business/Sponsorworkerdetails")}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark"
                        title="View details"
                      >
                        <Eye size={14} />
                        View
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
      {filteredWorkers.length === 0 && (
        <motion.div
          className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-sm font-bold text-gray-600">No workers found matching your search</p>
        </motion.div>
      )}
    </div>
  );
};

export default BusinessWorkers;
