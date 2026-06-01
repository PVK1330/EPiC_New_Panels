import { useState, useEffect } from "react";
import { getReportingObligations, updateReportingObligation } from "../../services/licenceApi";
import { API_BASE_URL } from "../../utils/constants";
import DatePicker, { DateTimePicker } from "../../components/DatePicker";
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
  Paperclip,
} from "lucide-react";

const ReportingObligations = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingEvent, setEditingEvent] = useState(null);

  const [events, setEvents] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    workerId: "",
    eventType: "",
    eventDate: "",
    description: "",
    reportedBy: "",
    evidenceFile: null,
    dateReportedToSms: "",
  });

  useEffect(() => {
    fetchEvents();
    // Fetch workers for the dropdown
    import("../../services/sponsoredWorkerApi").then(m => {
      m.getSponsoredWorkers().then(res => setWorkers(res.data?.data || []));
    });
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    getReportingObligations()
      .then((res) => {
        setEvents(res.data?.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

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
    setEditingEvent(null);
    setFormData({
      workerId: "",
      eventType: "",
      eventDate: "",
      description: "",
      reportedBy: "",
      evidenceFile: null,
      dateReportedToSms: "",
    });
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      workerId: event.workerId || "",
      eventType: event.eventType || "",
      eventDate: event.eventDate || "",
      description: event.description || "",
      reportedBy: event.reportedBy || "",
      evidenceFile: null,
      dateReportedToSms: event.dateReportedToSms ? new Date(event.dateReportedToSms).toISOString().slice(0, 16) : "",
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workerId || !formData.eventType || !formData.eventDate) {
      return alert("Please fill in all required fields.");
    }

    try {
      setIsSubmitting(true);
      const { submitReportingObligation } = await import("../../services/licenceApi");
      let res;
      if (editingEvent) {
        res = await updateReportingObligation(editingEvent.id, formData);
      } else {
        res = await submitReportingObligation(formData);
      }
      if (res.data.status === "success") {
        setShowModal(false);
        setFormData({
          workerId: "",
          eventType: "",
          eventDate: "",
          description: "",
          reportedBy: "",
          evidenceFile: null,
          dateReportedToSms: "",
        });
        setEditingEvent(null);
        fetchEvents();
      }
    } catch (err) {
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Evidence</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Actions</th>
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
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">
                    {event.evidenceFile ? (
                      <a
                        href={`${API_BASE_URL}/${event.evidenceFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-black text-xs"
                      >
                        <Paperclip size={12} />
                        View
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-gray-600">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-primary hover:text-primary-dark font-black text-xs hover:underline"
                    >
                      Update
                    </button>
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
              <h3 className="text-xl font-black text-secondary">{editingEvent ? "Update Worker Event" : "Report Worker Event"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Worker *</label>
                <select 
                  required
                  value={formData.workerId}
                  onChange={(e) => setFormData({...formData, workerId: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="">Select worker</option>
                  {workers.map(w => (
                    <option key={w.candidateId} value={w.candidateId}>
                      {w.candidate?.first_name} {w.candidate?.last_name} ({w.caseId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Event Type *</label>
                <select 
                  required
                  value={formData.eventType}
                  onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                >
                  <option value="">Select event type</option>
                  <option value="Role Change">Role Change</option>
                  <option value="Salary Change">Salary Change</option>
                  <option value="Absence >10 days">Absence &gt;10 days</option>
                  <option value="Termination">Termination</option>
                  <option value="Address Change">Address Change</option>
                  <option value="Resignation">Resignation</option>
                  <option value="Dismissal">Dismissal</option>
                  <option value="Visa Curtailment">Visa Curtailment</option>
                  <option value="Reduced Hours">Reduced Hours</option>
                  <option value="Change of Contract Type">Change of Contract Type</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Event Date *</label>
                <DatePicker
                  required
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  placeholder="Select date"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Reported By</label>
                <input
                  type="text"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({...formData, reportedBy: e.target.value})}
                  placeholder="Name of person reporting"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Evidence File</label>
                <input
                  type="file"
                  onChange={(e) => setFormData({...formData, evidenceFile: e.target.files[0]})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
                {editingEvent?.evidenceFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current file: {editingEvent.evidenceFile.split("/").pop()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Date Reported to SMS</label>
                <DateTimePicker
                  name="dateReportedToSms"
                  value={formData.dateReportedToSms}
                  onChange={(e) => setFormData({...formData, dateReportedToSms: e.target.value})}
                  placeholder="Select date & time"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Provide details about the event..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 font-black rounded-xl px-6 py-3 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black rounded-xl px-6 py-3 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : editingEvent ? "Save Changes" : "Submit Report"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportingObligations;
