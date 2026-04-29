import { LayoutDashboard, Inbox, CheckCircle, Clock, Users, Bell, AlertTriangle, Briefcase, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    label: "Active Workers",
    value: 45,
    icon: Users,
    bg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    label: "Pending Requests",
    value: 12,
    icon: Inbox,
    bg: "bg-orange-100",
    color: "text-orange-600",
  },
  {
    label: "Completed Cases",
    value: 234,
    icon: CheckCircle,
    bg: "bg-green-100",
    color: "text-green-600",
  },
  {
    label: "In Progress",
    value: 28,
    icon: Clock,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
  },
  {
    label: "Licence Status",
    value: "Active",
    icon: ShieldCheck,
    bg: "bg-purple-100",
    color: "text-purple-600",
  },
];
const remindersData = [
  {
    id: 1,
    title: "Visa Renewal - John Doe",
    description: "Visa expiring soon",
    dueDate: "2026-04-10",
    priority: "High",
    status: "Pending",
  },
  {
    id: 2,
    title: "Upload Compliance Document",
    description: "Case #102 missing contract file",
    dueDate: "2026-04-08",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 3,
    title: "Medical Check - Alex",
    description: "Worker health verification pending",
    dueDate: "2026-04-15",
    priority: "Low",
    status: "Completed",
  },
  {
    id: 4,
    title: "Work Permit Expiry - Sarah",
    description: "Renew permit before deadline",
    dueDate: "2026-04-05",
    priority: "High",
    status: "Overdue",
  },
];
const casesData = [
  {
    id: 1,
    name: "John Doe",
    caseType: "Skilled Worker Visa",
    status: "In Progress",
    deadline: "2026-04-10",
    priority: "High",
  },
  {
    id: 2,
    name: "Sarah Smith",
    caseType: "Student Visa",
    status: "Pending",
    deadline: "2026-04-15",
    priority: "Medium",
  },
  {
    id: 3,
    name: "Alex Johnson",
    caseType: "Work Permit",
    status: "Completed",
    deadline: "2026-04-05",
    priority: "Low",
  },
];

const workersData = [
  {
    id: 1,
    name: "Mohammed Ali",
    visaType: "Skilled Worker Visa",
    cosNumber: "COS-1024",
    jobTitle: "Mechanical Engineer",
    visaExpiry: "2026-10-12",
    status: "Active",
  },
  {
    id: 2,
    name: "Aisha Khan",
    visaType: "Student Visa",
    cosNumber: "COS-1087",
    jobTitle: "Digital Marketing Specialist",
    visaExpiry: "2026-08-03",
    status: "Pending",
  },
  {
    id: 3,
    name: "Rahul Sharma",
    visaType: "Intra-company Transfer",
    cosNumber: "COS-1135",
    jobTitle: "Project Manager",
    visaExpiry: "2026-09-21",
    status: "Active",
  },
  {
    id: 4,
    name: "Sara Williams",
    visaType: "Work Permit",
    cosNumber: "COS-1178",
    jobTitle: "HR Coordinator",
    visaExpiry: "2026-07-14",
    status: "Expiring",
  },
];
const notification = [
  {
    "id": 1,
    "type": "visa_update",
    "title": "New Skilled Worker Visa Rules",
    "message": "Updated salary threshold requirements announced for Skilled Worker visas.",
    "date": "2026-04-20",
    "time": "10:30 AM",
    "priority": "High",
    "status": "unread"
  },
  {
    "id": 2,
    "type": "event",
    "title": "Immigration Webinar 2026",
    "message": "Join our webinar to understand the latest immigration policies.",
    "date": "2026-04-22",
    "time": "03:00 PM",
    "priority": "Medium",
    "status": "read"
  },
  {
    "id": 3,
    "type": "meeting",
    "title": "Client Meeting - Visa Consultation",
    "message": "Discuss visa application process with client John Doe.",
    "date": "2026-04-18",
    "time": "11:00 AM",
    "priority": "High",
    "status": "unread"
  },
  {
    "id": 4,
    "type": "visa_update",
    "title": "Student Visa Policy Change",
    "message": "New rules for part-time work hours for international students.",
    "date": "2026-04-25",
    "time": "09:00 AM",
    "priority": "Medium",
    "status": "unread"
  },
  {
    "id": 5,
    "type": "event",
    "title": "Compliance Deadline Reminder",
    "message": "Submit all required documents before deadline.",
    "date": "2026-04-28",
    "time": "05:00 PM",
    "priority": "High",
    "status": "unread"
  },
  {
    "id": 6,
    "type": "meeting",
    "title": "Internal Team Sync",
    "message": "Weekly sync meeting with development team.",
    "date": "2026-04-17",
    "time": "04:30 PM",
    "priority": "low",
    "status": "read"
  },
  {
    "id": 7,
    "type": "event",
    "title": "HR Compliance Workshop",
    "message": "Workshop on latest HR compliance regulations.",
    "date": "2026-05-02",
    "time": "02:00 PM",
    "priority": "Medium",
    "status": "unread"
  },
  {
    "id": 8,
    "type": "meeting",
    "title": "Sponsor License Review Meeting",
    "message": "Review sponsor license status with legal team.",
    "date": "2026-04-19",
    "time": "01:00 PM",
    "priority": "High",
    "status": "unread"
  }
]

const getStatusIcon = (status) => {
  if (status === "Completed") return <CheckCircle size={16} className="text-green-600" />;
  if (status === "In Progress") return <Clock size={16} className="text-blue-600" />;
  return <AlertTriangle size={16} className="text-yellow-600" />;
};

const getPriorityColor = (priority) => {
  if (priority === "High") return "text-red-600 bg-red-100";
  if (priority === "Medium") return "text-yellow-600 bg-yellow-100";
  return "text-green-600 bg-green-100";
};


export default function BusinessDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-red-600" size={36} />
          Business Dashboard
        </h1>
        <p className="text-primary font-bold text-sm mt-1">
          Manage your business operations and workers
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 ${bg} rounded-xl`}>
              <Icon className={`${color} h-6 w-6`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-600">{label}</p>
              <p className="text-2xl font-black text-secondary">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 cursor-default  ">
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-secondary flex items-center gap-2">
              <Bell size={25} className="text-primary" /> Compliance Reminders
            </h3>
            <button className="text-xs font-bold text-primary hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">

            {remindersData.map((item) => (
              <div
                key={item.id}
                className=" p-4 hover:bg-gray-50 transition"
              >

                <div className="flex justify-between items-start">

                  {/* Left */}
                  <div>
                    <h4 className="text-sm font-black text-secondary">
                      {item.title}
                    </h4>
                    <p className="text-xs font-bold text-gray-500">
                      {item.description}
                    </p>

                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                      Due: {item.dueDate}
                    </p>
                  </div>

                  {/* Right */}
                  <div className="flex flex-col items-end gap-2">

                    {/* Priority */}
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>

                    {/* Status */}
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      {getStatusIcon(item.status)}
                      {item.status}
                    </div>

                  </div>

                </div>
              </div>
            ))}

          </div>

        </motion.div>
        {/* Active Cases */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-white p-5 rounded-2xl shadow">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-secondary flex items-center gap-2">
                <Briefcase size={25} className="text-primary" /> Active Cases
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">
                View All
              </button>
            </div>

            {/* List */}
            <div className="space-y-4">

              {casesData.map((item) => (
                <div
                  key={item.id}
                  className=" p-4 hover:bg-gray-50 transition cursor-pointer"
                >

                  <div className="flex justify-between items-start">

                    {/* Left */}
                    <div>
                      <h4 className="text-sm font-black text-secondary">
                        {item.name}
                      </h4>
                      <p className="text-xs font-bold text-gray-500">
                        {item.caseType}
                      </p>

                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        Deadline: {item.deadline}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-2">

                      {/* Priority */}
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${getPriorityColor(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>

                      <div className="flex items-center gap-1 text-[10px] font-bold">
                        {getStatusIcon(item.status)}
                        {item.status}
                      </div>

                    </div>

                  </div>
                </div>
              ))}

            </div>

          </div>


        </motion.div>
      </div>

      {/* Recent Sponsored Workers */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-secondary flex items-center gap-2">
            <Users size={25} className="text-primary" /> Recent Sponsored Workers
          </h3>
          <button className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Worker Name</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Type</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">CoS No.</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Job Title</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Visa Expiry</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workersData.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-black text-secondary">{worker.name}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.visaType}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.cosNumber}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.jobTitle}</td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-600">{worker.visaExpiry}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black ${worker.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : worker.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {worker.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      <div className="grid md:grid-cols-1">

        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-secondary flex items-center gap-2">
              <Bell size={25} className="text-primary" /> New Updates and Notifications
            </h3>
            <button className="text-xs font-bold text-primary hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">

            {notification.map((item) => (
              <div
                key={item.id}
                className=" p-4 hover:bg-gray-50 transition"
              >

                <div className="flex justify-between items-start">

                  {/* Left */}
                  <div>
                    <h4 className="text-sm font-black text-secondary">
                      {item.title}
                    </h4>
                    <p className="text-xs font-bold text-gray-500">
                      {item.message}
                    </p>

                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                      Due: {item.date}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">
                      Due: {item.time}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded ${getPriorityColor(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>



                </div>
              </div>
            ))}

          </div>

        </motion.div>
      </div>
    </div>
  );
}
