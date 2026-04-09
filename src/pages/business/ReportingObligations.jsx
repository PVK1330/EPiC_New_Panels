import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  Filter,
  Search,
  User,
  Briefcase,
  Calendar,
  DollarSign,
  LogOut,
  X,
} from "lucide-react";

const ReportingObligations = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [events, setEvents] = useState([
    {
      id: 1,
      worker: "Ahmed Khan",
      eventType: "Role Change",
      eventDate: "2024-03-15",
      reportedDate: "2024-03-16",
      deadline: "2024-03-25",
      status: "Reported",
      daysRemaining: 9,
      risk: "low",
    },
    {
      id: 2,
      worker: "Priya Sharma",
      eventType: "Salary Change",
      eventDate: "2024-03-10",
      reportedDate: "-",
      deadline: "2024-03-20",
      status: "Pending",
      daysRemaining: 4,
      risk: "medium",
    },
    {
      id: 3,
      worker: "John Smith",
      eventType: "Absence >10 days",
      eventDate: "2024-03-01",
      reportedDate: "-",
      deadline: "2024-03-11",
      status: "Overdue",
      daysRemaining: -4,
      risk: "high",
    },
    {
      id: 4,
      worker: "Sarah Johnson",
      eventType: "Termination",
      eventDate: "2024-02-28",
      reportedDate: "2024-03-01",
      deadline: "2024-03-09",
      status: "Reported",
      daysRemaining: 0,
      risk: "low",
    },
  ]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Reported":
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
      case "Reported":
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case "Pending":
        return <Clock size={16} className="text-amber-600" />;
      case "Overdue":
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getRiskStyle = (risk) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.worker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "reported" && event.status === "Reported") ||
      (filterType === "pending" && event.status === "Pending") ||
      (filterType === "overdue" && event.status === "Overdue");
    return matchesSearch && matchesFilter;
  });

  const totalEvents = events.length;
  const pendingEvents = events.filter((e) => e.status === "Pending").length;
  const overdueEvents = events.filter((e) => e.status === "Overdue").length;

  const handleAddEvent = () => {
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
          Reporting Obligations
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Report worker events within 10 days to maintain compliance.
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
            <span className="font-black">Total Events</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalEvents}</p>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Clock size={20} className="text-amber-500" />
            <span className="font-black">Pending</span>
          </div>
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-700">
            {pendingEvents}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <AlertCircle size={20} className="text-red-600" />
            <span className="font-black">Overdue</span>
          </div>
          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-700">
            {overdueEvents}
          </span>
        </motion.div>

        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Reported</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalEvents - pendingEvents - overdueEvents}</p>
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
              placeholder="Search events..."
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
              <option value="all">All Events</option>
              <option value="reported">Reported</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <button
            onClick={handleAddEvent}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-white transition hover:bg-primary-dark"
          >
            <Plus size={16} />
            Report Event
          </button>
        </div>
      </motion.div>

      {/* Events Table */}
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Worker</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Event Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Event Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Reported Date</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Deadline</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Days Remaining</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User size={16} className="text-primary" />
                      </div>
                      <p className="text-sm font-black text-secondary">{event.worker}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {event.eventType === "Role Change" && <Briefcase size={16} className="text-gray-500" />}
                      {event.eventType === "Salary Change" && <DollarSign size={16} className="text-gray-500" />}
                      {event.eventType === "Absence &gt;10 days" && <Calendar size={16} className="text-gray-500" />}
                      {event.eventType === "Termination" && <LogOut size={16} className="text-gray-500" />}
                      <span className="text-xs font-bold text-gray-700">{event.eventType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{event.eventDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{event.reportedDate}</td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">{event.deadline}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-black ${event.daysRemaining < 0 ? "text-red-600" : event.daysRemaining <= 3 ? "text-amber-600" : "text-gray-600"}`}>
                      {event.daysRemaining < 0 ? `${Math.abs(event.daysRemaining)} days overdue` : `${event.daysRemaining} days`}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(event.status)}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getStatusStyle(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black rounded-full ${getRiskStyle(event.risk)}`}>
                      {event.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Report Event Modal */}
      {showModal && (
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
              <h3 className="text-xl font-black text-secondary">Report Worker Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Worker *</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                  <option value="">Select worker</option>
                  <option value="1">Ahmed Khan</option>
                  <option value="2">Priya Sharma</option>
                  <option value="3">John Smith</option>
                  <option value="4">Sarah Johnson</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Event Type *</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                  <option value="">Select event type</option>
                  <option value="role">Role Change</option>
                  <option value="salary">Salary Change</option>
                  <option value="absence">Absence &gt;10 days</option>
                  <option value="termination">Termination</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Event Date *</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide details about the event..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportingObligations;
