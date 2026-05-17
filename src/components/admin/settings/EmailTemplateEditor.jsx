import { useState, useRef } from "react";
import { FiCode, FiType, FiLayout, FiInfo, FiSave, FiX, FiMail } from "react-icons/fi";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import Button from "../../Button";
import Input from "../../Input";

export default function EmailTemplateEditor({ 
  initialData, 
  mode, 
  onSave, 
  onCancel, 
  error,
  saving 
}) {
  const [formData, setFormData] = useState({
    template_key: initialData?.template_key || "",
    subject: initialData?.subject || "",
    body: initialData?.body || ""
  });

  const variables = [
    { key: "{{first_name}}", label: "Candidate First Name" },
    { key: "{{last_name}}", label: "Candidate Last Name" },
    { key: "{{case_id}}", label: "Case ID" },
    { key: "{{visa_type}}", label: "Visa Type" },
    { key: "{{payment_link}}", label: "Payment Link" },
    { key: "{{status}}", label: "Case Status" }
  ];

  const quillRef = useRef(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'color'],
      ['clean']
    ],
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const insertVariable = (variable) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (range) {
      quill.insertText(range.index, variable);
    } else {
      const length = quill.getLength();
      quill.insertText(length - 1, variable);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
            <FiMail size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-secondary tracking-tight">
              {mode === "add" ? "Create New Template" : "Edit Email Template"}
            </h3>
            <p className="text-xs text-gray-500 font-medium">Design professional system notifications</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
          <FiX size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Editor */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-xs font-bold flex items-center gap-3">
                <FiInfo className="shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Template Identifier" 
                value={formData.template_key} 
                onChange={(e) => setFormData({...formData, template_key: e.target.value})} 
                placeholder="e.g. WELCOME_ONBOARDING" 
                disabled={mode === "edit"}
                className="font-black"
                description="Unique system key used to trigger this email"
              />
              <Input 
                label="Email Subject Line" 
                value={formData.subject} 
                onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                placeholder="Welcome to EPiC CRM!" 
                className="font-bold"
                description="What the user sees in their inbox"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-[400px]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FiLayout size={14} /> Email Content (Visual Editor)
                </label>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded border border-gray-100">WYSIWYG Enabled</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col quill-container">
                <ReactQuill 
                  ref={quillRef}
                  theme="snow"
                  value={formData.body}
                  onChange={(content) => setFormData({...formData, body: content})}
                  modules={modules}
                  className="flex-1 h-full rounded-3xl overflow-hidden flex flex-col"
                  placeholder="Design your email here... Use variables from the sidebar to personalize."
                />
              </div>
            </div>
          </div>

          {/* Variables Sidebar */}
          <div className="w-full lg:w-80 bg-gray-50/50 border-l border-gray-100 p-6 flex flex-col gap-6">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiType size={14} /> Dynamic Variables
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {variables.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVariable(v.key)}
                    className="group flex flex-col items-start p-3 bg-white border border-gray-100 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all text-left"
                  >
                    <code className="text-[11px] font-black text-primary group-hover:scale-105 transition-transform">{v.key}</code>
                    <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex gap-3">
                <FiInfo className="text-primary shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-primary/70 leading-relaxed font-medium">
                  Click a variable to insert it at the end of your template content.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="rounded-xl px-6 py-2.5"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
            className="rounded-xl px-8 py-2.5 bg-primary hover:bg-primary/90 border-none shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            {saving ? "Saving..." : <><FiSave /> Save Template</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
