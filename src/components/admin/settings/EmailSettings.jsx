import { motion } from "framer-motion";
import { FiMail, FiPlus, FiEdit2, FiTrash2, FiEye, FiCode } from "react-icons/fi";
import Button from "../../Button";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function EmailSettings({ 
  templates, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete, 
  onView,
  error 
}) {
  return (
    <motion.div {...panelMotion} className="space-y-8">
      {/* Templates Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FiMail size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Email Templates</h3>
              <p className="text-xs text-gray-500">Customize dynamic system emails and notifications</p>
            </div>
          </div>
          <Button 
            onClick={onAdd}
            className="rounded-xl px-4 py-2 text-xs flex items-center gap-2"
          >
            <FiPlus /> New Template
          </Button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3">
              <div className="p-1 bg-red-100 rounded-lg">!</div>
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4 text-gray-300">
                <FiMail size={32} />
              </div>
              <p className="text-sm text-gray-400 italic">No email templates found.</p>
              <button 
                onClick={onAdd}
                className="mt-4 text-xs font-bold text-primary hover:underline"
              >
                Create your first template
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr] gap-4 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                <span>Template Key</span>
                <span>Subject Line</span>
                <span className="text-right">Actions</span>
              </div>
              
              {templates.map((t) => (
                <div 
                  key={t.template_key} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="flex flex-col sm:grid sm:grid-cols-[1.5fr_2fr] gap-4 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl text-primary shadow-sm border border-gray-50">
                        <FiCode size={14} />
                      </div>
                      <span className="text-sm font-black text-secondary truncate uppercase tracking-tight">
                        {t.template_key}
                      </span>
                    </div>
                    <div className="flex items-center min-w-0">
                      <span className="text-xs text-gray-500 font-medium truncate italic">
                        {t.subject || "(No Subject)"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => onView(t.template_key)}
                      className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="Preview"
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      onClick={() => onEdit(t.template_key)}
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Edit Template"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(t.template_key)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Help Tip */}
        <div className="mx-6 mb-6 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
          <div className="flex gap-3">
            <div className="text-secondary mt-0.5">
              <FiCode size={16} />
            </div>
            <div>
              <h5 className="text-[11px] font-black text-secondary uppercase tracking-wider mb-1">Developer Note</h5>
              <p className="text-[11px] text-secondary/70 leading-relaxed italic">
                You can use dynamic placeholders like {"{{first_name}}"}, {"{{case_id}}"}, and {"{{payment_link}}"} in your templates. These will be replaced automatically by the system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
