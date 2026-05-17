import { FiMail, FiX, FiMonitor, FiSmartphone, FiArrowLeft } from "react-icons/fi";
import { useState } from "react";
import Button from "../../Button";

export default function EmailTemplatePreview({
  template,
  onClose
}) {
  const [device, setDevice] = useState("desktop");

  if (!template) return null;

  return (
    <div className="bg-gray-100/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] border border-gray-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-base font-black text-secondary tracking-tight">
              Preview: {template.template_key}
            </h3>
            <p className="text-xs text-gray-400 font-medium italic">Subject: {template.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-2 rounded-xl transition-all ${device === 'desktop' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FiMonitor size={16} />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-2 rounded-xl transition-all ${device === 'mobile' ? 'bg-white text-primary shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FiSmartphone size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar bg-gray-50/50">
        <div
          className={`transition-all duration-500 bg-white shadow-2xl border border-gray-100 flex flex-col ${device === 'desktop' ? 'w-full max-w-3xl rounded-3xl' : 'w-[375px] rounded-[3rem] p-4 border-[8px] border-secondary ring-4 ring-gray-200'
            }`}
        >
          {/* Mock Email Header */}
          <div className="p-6 border-b border-gray-50 bg-white rounded-t-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-6 bg-gray-100 rounded animate-pulse" />
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Incoming Message</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400">From: <span className="text-secondary">EPiC CRM System &lt;noreply@epic-crm.com&gt;</span></p>
              <p className="text-xs font-bold text-gray-400">To: <span className="text-secondary">Candidate Name &lt;candidate@example.com&gt;</span></p>
              <p className="text-[13px] font-black text-secondary mt-3 pt-3 border-t border-gray-50">Subject: {template.subject}</p>
            </div>
          </div>

          {/* Email Body */}
          <div className={`p-8 overflow-y-auto flex-1 ${device === 'mobile' ? 'bg-white rounded-[2rem]' : ''}`}>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: template.body }}
            />
          </div>

          {/* Mock Footer */}
          <div className="p-8 border-t border-gray-50 bg-gray-50/50 rounded-b-3xl">
            <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest leading-loose">
              Powered by EPiC Advanced Case Management System<br />
              &copy; 2026 EPIC. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white flex justify-end px-8">
        <Button onClick={onClose} className="rounded-xl px-8">Close Preview</Button>
      </div>
    </div>
  );
}
