import { LayoutDashboard, Inbox, CheckCircle, Clock, Users, Bell, AlertTriangle, Briefcase, MessageSquare, Send, File, UserRoundCogIcon,Calendar } from "lucide-react";
import { motion } from "framer-motion";


const BusinessCompliance = () => {
    const stats = [
        {
            label: "Total Sponsored Workers",
            value: 45,
            icon: Users,
            bg: "bg-blue-100",
            color: "text-blue-600",
        },
        {
            label: "Expiring Visas (<60 days)",
            value: 12,
            icon: Bell,
            bg: "bg-orange-100",
            color: "text-orange-600",
        },
        {
            label: "Missing Documents",
            value: 5,
            icon: File,
            bg: "bg-green-100",
            color: "text-green-600",
        },
        {
            label: "Compliance Score",
            value: "94%",
            icon: CheckCircle,
            bg: "bg-green-100",
            color: "text-green-600",
        },
    ]
    const riskByWorkers = [
  {
    id: 1,
    name: "John Doe",
    visaType: "Skilled Worker Visa",
    riskLevel: "High",
    issue: "Visa expiring in 5 days",
    expiryDate: "2026-04-15",
    status: "Urgent",
  },
  {
    id: 2,
    name: "Priya Sharma",
    visaType: "Student Visa",
    riskLevel: "Medium",
    issue: "Passport expiring soon",
    expiryDate: "2026-05-10",
    status: "Warning",
  },
  {
    id: 3,
    name: "Michael Lee",
    visaType: "Health Care Visa",
    riskLevel: "Low",
    issue: "All documents valid",
    expiryDate: "2027-01-20",
    status: "Safe",
  },
  {
    id: 4,
    name: "Amit Patel",
    visaType: "Skilled Worker Visa",
    riskLevel: "High",
    issue: "Missing employment contract",
    expiryDate: "N/A",
    status: "Critical",
  },
  {
    id: 5,
    name: "Sara Khan",
    visaType: "Dependent Visa",
    riskLevel: "Medium",
    issue: "Visa renewal pending",
    expiryDate: "2026-06-01",
    status: "Pending",
  },
  {
    id: 6,
    name: "David Brown",
    visaType: "Work Permit Visa",
    riskLevel: "High",
    issue: "Visa already expired",
    expiryDate: "2026-03-30",
    status: "Expired",
  },
    ];
    const reportingDeadlines = [
  {
    id: 1,
    workerName: "John Doe",
    reportType: "Visa Renewal Report",
    dueDate: "2026-04-15",
    daysLeft: 6,
    priority: "High",
    status: "Pending",
  },
  {
    id: 2,
    workerName: "Priya Sharma",
    reportType: "Document Verification",
    dueDate: "2026-04-20",
    daysLeft: 11,
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: 3,
    workerName: "Michael Lee",
    reportType: "Annual Compliance Report",
    dueDate: "2026-05-01",
    daysLeft: 22,
    priority: "Low",
    status: "Not Started",
  },
  {
    id: 4,
    workerName: "Amit Patel",
    reportType: "Work Permit Renewal",
    dueDate: "2026-04-12",
    daysLeft: 3,
    priority: "High",
    status: "Urgent",
  },
  {
    id: 5,
    workerName: "Sara Khan",
    reportType: "Address Verification",
    dueDate: "2026-04-25",
    daysLeft: 16,
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 6,
    workerName: "David Brown",
    reportType: "Visa Expiry Submission",
    dueDate: "2026-04-10",
    daysLeft: 1,
    priority: "High",
    status: "Critical",
  },
    ];

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
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };
    return (
        <>
            <div className="space-y-8 pb-10">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="text-red-600" size={36} />
                        Compliance Dashboard
                    </h1>
                    <p className="text-primary font-bold text-sm mt-1">
                        Track your business operations and workers
                    </p>
                </motion.div>
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
                            <div className={`p-3 ${bg} rounded-lg`}>
                                <Icon className={`${color} h-6 w-6`} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{label}</p>
                                <p className="text-2xl font-black text-secondary">{value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
                 <div className="grid md:grid-cols-2 gap-6 mb-8 cursor-default  ">
                      <motion.div
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                         
                        <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                          <UserRoundCogIcon size={25} className="text-red-700" /> Risk by Worker
                        </h3>

                      </div>
                        <div className="space-y-4">
                
                        {riskByWorkers.map((item) => (
                          <div
                            key={item.id}
                            className=" p-4 hover:bg-gray-50 transition"
                          >
                
                            <div className="flex justify-between items-start">
                
                              {/* Left */}
                              <div>
                                <h4 className="font-medium text-sm">
                                  {item.name} - {item.visaType}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {item.issue}
                                </p>
                
                                <p className="text-xs text-gray-400 mt-1">
                                  Due: {item.expiryDate}
                                </p>
                              </div>
                
                              {/* Right */}
                              <div className="flex flex-col items-end gap-2">
                
                                {/* Priority */}
                                <span
                                  className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                                    item.riskLevel
                                  )}`}
                                >
                                  {item.riskLevel}
                                </span>
                
                                {/* Status */}
                                <div className="flex items-center gap-1 text-xs">
                                  {getStatusIcon(item.status)}
                                  {item.status}
                                </div>
                
                              </div>
                
                            </div>
                          </div>
                        ))}
                
                      </div>
                       
                      </motion.div>
                       <motion.div
                              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden px-5 pt-5"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                              >
                                 <div className="bg-white p-5 rounded-2xl shadow">
                                
                                      {/* Header */}
                                      <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                                          <Calendar size={25} className="text-red-700" /> Upcoming Reporting Deadlines
                                        </h3>
                                      </div>
                                
                                      {/* List */}
                                      <div className="space-y-4">
                                
                                        {reportingDeadlines.map((item) => (
                                          <div
                                            key={item.id}
                                            className=" p-4 hover:bg-gray-50 transition cursor-pointer"
                                          >
                                
                                            <div className="flex justify-between items-start">
                                
                                              {/* Left */}
                                              <div>
                                                <h4 className="font-medium text-sm">
                                                  {item.workerName} - 
                                                </h4>
                                                
                                                <p className="text-xs text-gray-500">
                                                  
                                                </p>
                                
                                                <p className="text-xs text-gray-400 mt-1">
                                                  Deadline: {item.dueDate} 
                                                </p>
                                              </div>
                                
                                              {/* Right */}
                                              <div className="flex flex-col items-end gap-2">
                                
                                                {/* Priority */}
                                                <span
                                                  className={`text-sm px-2 py-1 rounded ${getPriorityColor(
                                                    item.priority
                                                  )}`}
                                                >
                                                  ({item.daysLeft} days left)
                                                </span>
                                                
                                
                                              </div>
                                
                                            </div>
                                          </div>
                                        ))}
                                
                                      </div>
                                
                                    </div>
                      
                      
                              </motion.div>
                      </div>


            </div>


        </>
    )
}

export default BusinessCompliance