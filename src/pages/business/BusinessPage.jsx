import { useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const BusinessPage = ({ page, title }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
        <p className="text-slate-400 mt-2">Manage your {page.toLowerCase()} details</p>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle size={48} className="text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-400">This page is under development</p>
          <p className="text-slate-500 text-sm mt-4">Coming soon with more details</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;
