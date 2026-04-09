import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Video,
  Plus,
  Clock,
  MapPin,
  ArrowRight,
  History,
  MonitorPlay,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Modal from "../../components/Modal";

const PLATFORMS = [
  {
    value: "teams",
    label: "Microsoft Teams",
    shortLabel: "Teams",
    joinLabel: "Join in Teams",
    hint: "teams.microsoft.com / meeting link",
  },
  {
    value: "meet",
    label: "Google Meet",
    shortLabel: "Google Meet",
    joinLabel: "Join in Google Meet",
    hint: "meet.google.com / link",
  },
  {
    value: "zoom",
    label: "Zoom",
    shortLabel: "Zoom",
    joinLabel: "Join in Zoom",
    hint: "zoom.us / meeting link",
  },
];

const platformMeta = (value) =>
  PLATFORMS.find((p) => p.value === value) ?? PLATFORMS[2];

const formatDisplayDate = (isoDate) => {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTimeFromInput = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const AppointmentCard = ({
  title,
  date,
  time,
  location,
  status,
  joinable = false,
  meetingUrl,
  platform,
  onView,
}) => {
  const isCompleted = status === "Completed";
  const meta = platform ? platformMeta(platform) : null;

  const handleJoin = () => {
    if (meetingUrl) {
      const url = meetingUrl.match(/^https?:\/\//i)
        ? meetingUrl
        : `https://${meetingUrl}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-6 rounded-3xl mb-6 transition-all hover:shadow-lg border ${
        joinable
          ? "bg-white border-primary/10 shadow-md"
          : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-5 items-start">
          <div
            className={`w-14 h-14 rounded-3xl flex items-center justify-center flex-shrink-0 ${
              joinable
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            {joinable ? <Video size={28} /> : <Calendar size={28} />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="text-lg font-black text-secondary">{title}</h3>
              {meta && (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-secondary/10 text-secondary border border-secondary/20">
                  {meta.shortLabel}
                </span>
              )}
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isCompleted
                    ? "bg-green-50 text-green-600 border-green-100"
                    : joinable
                      ? "bg-orange-50 text-orange-600 border-orange-100 animate-pulse"
                      : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
              >
                {status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <Calendar size={14} className="text-primary" />
                {date}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <Clock size={14} className="text-primary" />
                {time}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <MapPin size={14} className="text-primary" />
                {location}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {joinable && meetingUrl ? (
            <button
              type="button"
              onClick={handleJoin}
              className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-black  shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-95 flex items-center gap-2"
            >
              {meta?.joinLabel ?? "Join meeting"} <ArrowRight size={18} />
            </button>
          ) : joinable ? (
            <button
              type="button"
              disabled
              className="bg-gray-200 text-gray-500 px-8 py-3 rounded-xl text-sm font-black cursor-not-allowed flex items-center gap-2"
            >
              Link pending
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onView && onView({ title, date, time, location, status, platform, meetingUrl })}
              className="text-gray-400 hover:text-primary font-black text-sm transition-colors px-4 py-2"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const initialUpcoming = [
  {
    id: "1",
    title: "Consultation Meeting",
    dateDisplay: "20 April 2026",
    dateIso: "2026-04-20",
    time: "10:30 AM",
    location: "Online — Microsoft Teams",
    status: "Live Now",
    joinable: true,
    platform: "teams",
    meetingUrl: "https://teams.microsoft.com",
  },
  {
    id: "2",
    title: "Visa Interview Prep",
    dateDisplay: "22 April 2026",
    dateIso: "2026-04-22",
    time: "01:30 PM",
    location: "Online — Zoom",
    status: "Scheduled",
    joinable: true,
    platform: "zoom",
    meetingUrl: "https://zoom.us",
  },
];

const initialPast = [
  {
    id: "p1",
    title: "Document Review",
    dateDisplay: "25 March 2026",
    dateIso: "2026-03-25",
    time: "02:00 PM",
    location: "Main Office, Sector 5",
    status: "Completed",
    joinable: false,
    platform: null,
    meetingUrl: "",
  },
  {
    id: "p2",
    title: "Initial Consultation",
    dateDisplay: "10 March 2026",
    dateIso: "2026-03-10",
    time: "11:00 AM",
    location: "Main Office, Sector 5",
    status: "Completed",
    joinable: false,
    platform: null,
    meetingUrl: "",
  },
];

const Appointments = () => {
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [past] = useState(initialPast);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    platform: "teams",
    meetingUrl: "",
  });

  const resetScheduleForm = () => {
    setForm({
      title: "",
      date: "",
      time: "",
      platform: "teams",
      meetingUrl: "",
    });
  };

  const closeSchedule = () => {
    setScheduleOpen(false);
    resetScheduleForm();
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setViewOpen(true);
  };

  const closeView = () => {
    setSelectedAppointment(null);
    setViewOpen(false);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title || !form.date || !form.time) return;

    const meta = platformMeta(form.platform);
    const dateDisplay = formatDisplayDate(form.date);
    const url = form.meetingUrl.trim();
    const timeDisplay = formatTimeFromInput(form.time);

    setUpcoming((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        dateDisplay,
        dateIso: form.date,
        time: timeDisplay,
        location: `Online — ${meta.label}`,
        status: "Scheduled",
        joinable: true,
        platform: form.platform,
        meetingUrl: url,
      },
      ...prev,
    ]);
    closeSchedule();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const totalAppointments = upcoming.length + past.length;
  const upcomingCount = upcoming.length;
  const completedCount = past.length;

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
          Appointments
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Join video calls on{" "}
          <span className="text-secondary">Microsoft Teams</span>,{" "}
          <span className="text-secondary">Google Meet</span>, or{" "}
          <span className="text-secondary">Zoom</span>. Schedule a new
          meeting anytime.
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
            <Calendar size={20} className="text-primary" />
            <span className="font-black">Total Appointments</span>
          </div>
          <p className="text-3xl font-black text-secondary">{totalAppointments}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Video size={20} className="text-primary" />
            <span className="font-black">Upcoming</span>
          </div>
          <p className="text-3xl font-black text-secondary">{upcomingCount}</p>
        </motion.div>
        <motion.div variants={cardVariants} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-900">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-black">Completed</span>
          </div>
          <p className="text-3xl font-black text-secondary">{completedCount}</p>
        </motion.div>
      </motion.div>

      {/* Meeting Platforms */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
          Meeting platforms
        </p>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.value}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700"
            >
              <MonitorPlay size={18} className="text-primary shrink-0" />
              {p.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming & Live Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-black text-secondary mb-6 tracking-tight flex items-center gap-2">
          <Video className="text-primary" size={24} />
          Upcoming & Live
        </h2>
        <div className="space-y-4">
          {upcoming.map((apt) => (
            <AppointmentCard
              key={apt.id}
              title={apt.title}
              date={apt.dateDisplay}
              time={apt.time}
              location={apt.location}
              status={apt.status}
              joinable={apt.joinable}
              meetingUrl={apt.meetingUrl}
              platform={apt.platform}
              onView={handleView}
            />
          ))}
        </div>
      </motion.div>

      {/* Appointment History Section */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-black text-secondary mb-6 tracking-tight flex items-center gap-2">
          <History size={24} className="text-primary" />
          Appointment History
        </h2>
        <div className="space-y-4">
          {past.map((apt) => (
            <AppointmentCard
              key={apt.id}
              title={apt.title}
              date={apt.dateDisplay}
              time={apt.time}
              location={apt.location}
              status={apt.status}
              joinable={apt.joinable}
              meetingUrl={apt.meetingUrl}
              platform={apt.platform}
              onView={handleView}
            />
          ))}
        </div>
      </motion.div>

      <Modal
        open={scheduleOpen}
        onClose={closeSchedule}
        title="Schedule meeting"
        titleId="schedule-appointment-title"
        maxWidthClass="max-w-lg"
        bodyClassName="p-4 sm:p-6"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label
              htmlFor="apt-title"
              className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2"
            >
              Meeting title
            </label>
            <input
              id="apt-title"
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="e.g. Case review"
              className="w-full min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-shadow sm:px-4 sm:py-3"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <label
                htmlFor="apt-date"
                className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2"
              >
                Date
              </label>
              <input
                id="apt-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className="w-full min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-900 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-shadow sm:px-4 sm:py-3"
                required
              />
            </div>
            <div>
              <label
                htmlFor="apt-time"
                className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2"
              >
                Time
              </label>
              <input
                id="apt-time"
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, time: e.target.value }))
                }
                className="w-full min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-900 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-shadow sm:px-4 sm:py-3"
                required
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2">
              Platform
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PLATFORMS.map((p) => (
                <label
                  key={p.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-colors sm:p-3 ${
                    form.platform === p.value
                      ? "border-secondary bg-secondary/5 ring-2 ring-secondary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value={p.value}
                    checked={form.platform === p.value}
                    onChange={() =>
                      setForm((f) => ({ ...f, platform: p.value }))
                    }
                    className="mt-1 shrink-0 accent-secondary"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-black text-gray-900">
                      {p.label}
                    </span>
                    <p className="mt-0.5 break-words text-[11px] font-bold leading-snug text-gray-400">
                      {p.hint}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="apt-url"
              className="block text-xs font-black text-gray-600 uppercase tracking-wider mb-2"
            >
              Meeting link
            </label>
            <input
              id="apt-url"
              type="url"
              inputMode="url"
              value={form.meetingUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, meetingUrl: e.target.value }))
              }
              placeholder="https://..."
              className="w-full min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-shadow sm:px-4 sm:py-3"
            />
            <p className="mt-1.5 text-[11px] font-bold leading-snug text-gray-400">
              Paste your Teams, Meet, or Zoom invitation link. You can add it
              later from caseworker instructions.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={closeSchedule}
              className="w-full flex-1 rounded-xl bg-gray-100 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-200 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full flex-1 rounded-xl bg-secondary py-3 text-sm font-black text-white transition-colors hover:bg-secondary-dark sm:w-auto"
            >
              Create appointment
            </button>
          </div>
        </form>
      </Modal>

      {/* View Appointment Details Modal */}
      <Modal
        open={viewOpen}
        onClose={closeView}
        title="Appointment Details"
        titleId="view-appointment-title"
        maxWidthClass="max-w-lg"
        bodyClassName="p-4 sm:p-6"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-black text-secondary">{selectedAppointment.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                {selectedAppointment.platform && (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-secondary/10 text-secondary border border-secondary/20">
                    {platformMeta(selectedAppointment.platform)?.shortLabel}
                  </span>
                )}
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  selectedAppointment.status === "Completed"
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : selectedAppointment.status === "Live Now"
                      ? "bg-orange-50 text-orange-600 border-orange-100 animate-pulse"
                      : "bg-blue-50 text-blue-600 border-blue-100"
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar size={18} className="text-primary" />
                <div>/
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Date</p>
                  <p className="text-sm font-black text-secondary">{selectedAppointment.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock size={18} className="text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Time</p>
                  <p className="text-sm font-black text-secondary">{selectedAppointment.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin size={18} className="text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Location</p>
                  <p className="text-sm font-black text-secondary">{selectedAppointment.location}</p>
                </div>
              </div>

              {selectedAppointment.meetingUrl && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Video size={18} className="text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Meeting Link</p>
                    <p className="text-sm font-black text-secondary truncate">{selectedAppointment.meetingUrl}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeView}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-200"
              >
                Close
              </button>
              {selectedAppointment.meetingUrl && selectedAppointment.status !== "Completed" && (
                <button
                  type="button"
                  onClick={() => {
                    const url = selectedAppointment.meetingUrl.match(/^https?:\/\//i)
                      ? selectedAppointment.meetingUrl
                      : `https://${selectedAppointment.meetingUrl}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-black text-white transition-colors hover:bg-primary-dark"
                >
                  Join Meeting
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
