import { FileText, Download, Upload, Trash2, Filter, Search } from "lucide-react";
import { useState } from "react";

const BusinessDocuments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const documents = [
    { id: 1, name: "Company Registration Certificate", type: "certificate", uploadDate: "15 Jan 2024", size: "2.4 MB", status: "Verified" },
    { id: 2, name: "License Agreement 2024", type: "agreement", uploadDate: "10 Jan 2024", size: "1.8 MB", status: "Verified" },
    { id: 3, name: "Financial Statements Q4 2023", type: "financial", uploadDate: "05 Jan 2024", size: "3.2 MB", status: "Pending Review" },
    { id: 4, name: "Worker Sponsorship Guidelines", type: "guidelines", uploadDate: "01 Jan 2024", size: "945 KB", status: "Verified" },
    { id: 5, name: "Health & Safety Policy", type: "policy", uploadDate: "28 Dec 2023", size: "1.1 MB", status: "Verified" },
    { id: 6, name: "COS Payment Receipt", type: "receipt", uploadDate: "20 Dec 2023", size: "567 KB", status: "Verified" },
  ];

  const getStatusColor = (status) => {
    return status === "Verified"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  };

  const getTypeIcon = (type) => {
    const icons = {
      certificate: "📜",
      agreement: "📋",
      financial: "📊",
      guidelines: "📖",
      policy: "⚖️",
      receipt: "🧾",
    };
    return icons[type] || "📄";
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-2">Manage your business documents and certificates</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md">
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Documents</option>
            <option value="certificate">Certificates</option>
            <option value="agreement">Agreements</option>
            <option value="financial">Financial</option>
            <option value="policy">Policies</option>
            <option value="receipt">Receipts</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Document Name</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Upload Date</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Size</th>
              <th className="text-left px-6 py-4 text-slate-700 font-semibold">Status</th>
              <th className="text-right px-6 py-4 text-slate-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTypeIcon(doc.type)}</span>
                    <span className="text-slate-900 font-medium">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{doc.uploadDate}</td>
                <td className="px-6 py-4 text-slate-700">{doc.size}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-1 hover:bg-slate-200 rounded transition-colors text-blue-600" title="Download">
                      <Download size={18} />
                    </button>
                    <button className="p-1 hover:bg-slate-200 rounded transition-colors text-red-600" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">No documents found matching your search</p>
        </div>
      )}
    </div>
  );
};

export default BusinessDocuments;
