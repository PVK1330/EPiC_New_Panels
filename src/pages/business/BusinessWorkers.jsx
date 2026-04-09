import { Users, Filter, Search, Plus, MoreVertical, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
        return "border-green-300 bg-green-100 text-green-700";
      case "Expiring":
        return "border-red-300 bg-red-100 text-red-700";
      case "Warning":
        return "border-amber-300 bg-amber-100 text-amber-700";
      default:
        return "border-slate-300 bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "Expiring":
      case "Warning":
        return <AlertCircle size={16} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const activeCount = workers.filter((w) => w.status === "Active").length;
  const warningCount = workers.filter((w) => w.status === "Warning" || w.status === "Expiring").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Workers</h1>
          <p className="text-slate-600 mt-2">Manage sponsored workers and visa sponsorships</p>
        </div>
        <button onClick={()=>navigate("/business/sponsored-workers")} className="flex items-center gap-2 bg-red-800  text-white px-4 py-2 rounded-lg transition-colors shadow-md">
          <Plus size={18} />
          Add Worker
        </button>
      </div>  
      </motion.div>   

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 relative"
        >

        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />

        </div>
        </motion.div>
        <div className="flex items-center gap-2">

          <Filter size={18} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Workers</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      {/* Workers Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
      
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Name</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Job Title</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Visa Type</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">COS</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Expiry Date</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Status</th>
              <th className="text-right px-6 py-4 text-slate-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredWorkers.map((worker) => (
              <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-slate-900 font-medium">{worker.name}</p>
                  <p className="text-slate-600 text-sm">{worker.email}</p>
                </td>
                <td className="px-6 py-4 text-slate-900">{worker.job}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                    {worker.visa}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 font-mono text-sm">{worker.cos}</td>
                <td className="px-6 py-4 text-slate-700">
                  <div className="flex flex-col">
                    <span>{worker.expiry}</span>
                    <span className="text-slate-500 text-xs">Start: {worker.startDate}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(worker.status)}
                    <span className={`px-3 py-1 rounded text-sm font-semibold border ${getStatusColor(worker.status)}`}>
                      {worker.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={()=> navigate("/business/Sponsorworkerdetails")}
                      className="p-2 w-20 bg-red-800 rounded-xl transition-colors text-white"
                      title="More options"
                    >
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
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">No workers found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default BusinessWorkers;
