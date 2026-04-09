import React, { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard,Eye } from "lucide-react";

const documentsData = [
  {
    id: 1,
    name: "Sponsor Licence Letter",
    uploadDate: "1 Apr 2026",
    expiry: "Jun 2028",
    status: "Approved",
    reviewedBy: "Ahmed Al-Rashid",
  },
  {
    id: 2,
    name: "HR Policies",
    uploadDate: "3 Apr 2026",
    expiry: "-",
    status: "Under Review",
    reviewedBy: "Ahmed Al-Rashid",
  },
  {
    id: 3,
    name: "Employer Liability Insurance",
    uploadDate: "28 Mar 2026",
    expiry: "Apr 2027",
    status: "Approved",
    reviewedBy: "TechCorp HR",
  },
  {
    id: 4,
    name: "Employment Contracts Template",
    uploadDate: "25 Mar 2026",
    expiry: "Sep 2030",
    status: "Approved",
    reviewedBy: "Priya Sharma",
  },
  {
    id: 5,
    name: "Right to Work Policy",
    uploadDate: "25 Mar 2026",
    expiry: "Sep 2030",
    status: "Approved",
    reviewedBy: "Priya Sharma",
  },
  
];

const DocumentList = () => {
  const [filter, setFilter] = useState("All");

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-600";
      case "Under Review":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const filteredDocs = documentsData.filter((doc) => {
    if (filter === "All") return true;
    if (filter === "Valid") return doc.status === "Approved";
    if (filter === "Expiring Soon") return doc.expiry !== "-" && doc.expiry.includes("2026");
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
        <h1 className="text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
                  <LayoutDashboard className="text-red-600" size={36} />
                 Compliance Documents
                </h1>
        </motion.div>
        <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-900">
          All Documents
        </h2>

        <button className="bg-red-800 text-white px-4 py-2 rounded-lg shadow ">
          Upload Document
        </button>
      </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        {["All", "Valid", "Expiring Soon"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              filter === item
                ? "bg-red-800 text-white"
                : "bg-white text-slate-600 border-slate-300"
            }`} 

          >
            {item}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              <th className="text-left px-6 py-3">Document Name</th>
              <th className="text-left px-6 py-3">Upload Date</th>
              <th className="text-left px-6 py-3">Expiry</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Reviewed By</th>
              <th className="text-left px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocs.map((doc) => (
              <tr
                key={doc.id}
                className="border-t hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4 font-medium text-slate-800">
                  {doc.name}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {doc.uploadDate}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {doc.expiry}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {doc.reviewedBy}
                </td>

                <td className="px-6 py-4">
                    
                  <button className=" flex px-4 py-1.5 text-sm rounded-lg  bg-red-800 text-white">
                    <Eye className="inline-block mr-2 mt-1" size={16} />
                    View
                  </button>
                 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;