import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Hash,
  ShieldCheck,
  Star,
  Calendar,
  FileText,
  ShieldAlert,
  RefreshCw,
  Clock,
  FilesIcon,
  Pencil, Trash2
} from "lucide-react";


const COSPage = () => {
  // Dummy Data
  const stats = {
    total: 120,
    used: 75,
    remaining: 45,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const progress = (stats.used / stats.total) * 100;
  const cosList = [
  {
    visaType: "Skilled Worker Visa",
    allocated: 50,
    used: 30,
    remaining: 20,
  },
  {
    visaType: "Student Visa",
    allocated: 30,
    used: 20,
    remaining: 10,
  },
  {
    visaType: "Health Care Visa",
    allocated: 40,
    used: 25,
    remaining: 15,
  },
];

// Utility to generate initials
const getInitials = (text) => {
  return text
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// Random background colors
const avatarColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-red-500",
];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-[#004ca5] mb-6">
        COS Management
      </h1>

      {/* 🔹 Stats Cards */}
    
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <FilesIcon size={20} className="text-blue-600" />
                <span className="font-semibold">Total CoS Allocated </span>
              </div>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
            </motion.div>
    
            <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <FileText size={20} className="text-emerald-600" />
                <span className="font-semibold">Cos Used</span>
              </div>
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                {stats.used}
              </span>
            </motion.div>
    
            <motion.div variants={cardVariants} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <FilesIcon size={20} className="text-amber-500" />
                <span className="font-semibold">Cos Remaining</span>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.remaining}</p>
            </motion.div>
          </motion.div>

      {/* 🔹 Progress Bar */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-md rounded-2xl mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          COS Usage Progress
        </h2>

        <div className="w-full bg-gray-200 h-3 rounded-full">
          <div
            className="bg-[#c8102e] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {stats.used} of {stats.total} COS used
        </p>
      </motion.div>

      {/* 🔹 COS Table */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white rounded-2xl shadow-md p-6">
         <h2 className="text-xl font-semibold mb-4">COS Allocation</h2>
     

      <div className="overflow-x-auto">
        <table className="w-full text-left border-full">
          <thead>
            <tr className="text-gray-500 text-sm border-b">
              <th className="py-3">VISA TYPE</th>
              <th className="py-3">ALLOCATED</th>
              <th className="py-3">USED</th>
              <th className="py-3">REMAINING</th>
              <th className="py-3 text-center">STATUS</th>
              <th className="py-3 text-center">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {cosList.map((item, index) => {
              const initials = getInitials(item.visaType);
              const bgColor = avatarColors[index % avatarColors.length];

              const status =
                item.remaining === 0
                  ? "Exhausted"
                  : item.remaining < 10
                  ? "Low"
                  : "Active";

              const statusStyle =
                status === "Active"
                  ? "bg-green-100 text-green-600"
                  : status === "Low"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600";

              return (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-4 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 flex items-center justify-center text-white rounded-2xl ${bgColor}`}
                    >
                      {initials}
                    </div>
                    <span className="font-medium text-gray-800">
                      {item.visaType}
                    </span>
                  </td>

                  <td className="py-4">{item.allocated}</td>
                  <td className="py-4">{item.used}</td>
                  <td className="py-4">{item.remaining}</td>
                  <td className="py-4 text-center">
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${statusStyle}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-4 text-center flex justify-center gap-3">
                    <Pencil className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600" />
                    <Trash2 className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600" />
                  </td>
                </tr>
              );
            })}
            
          </tbody>
          
        </table>
      </div>
      
    </div>
      </motion.div>
    </div>
  );
};

export default COSPage;