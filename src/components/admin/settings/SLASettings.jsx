import { motion } from "framer-motion";
import { FiClock, FiPlus, FiEdit2, FiTrash2, FiInfo, FiZap } from "react-icons/fi";
import Button from "../../Button";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function SLASettings({ 
  rules, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete, 
  error 
}) {
  return (
    <motion.div {...panelMotion} className="space-y-8">
      {/* SLA Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <FiClock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Service Level Agreements (SLA)</h3>
              <p className="text-xs text-gray-500">Manage processing targets and escalation triggers</p>
            </div>
          </div>
          <Button 
            onClick={onAdd}
            className="rounded-xl px-4 py-2 text-xs flex items-center gap-2 bg-amber-600 hover:bg-amber-700 border-none"
          >
            <FiPlus /> Define New Rule
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="py-16 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <div className="inline-flex p-4 bg-white rounded-full mb-4 text-amber-500 shadow-sm">
                <FiClock size={32} />
              </div>
              <p className="text-sm text-gray-500 font-bold">No SLA rules configured.</p>
              <p className="text-xs text-gray-400 mt-1">SLA rules help track case delays and trigger escalations.</p>
              <button 
                onClick={onAdd}
                className="mt-6 text-xs font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest"
              >
                + Add First Rule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className="group p-5 rounded-3xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-2xl ${
                      rule.rule_type === 'Visa' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      <FiZap size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-secondary truncate uppercase tracking-tight">{rule.name}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                          rule.rule_type === 'Visa' ? 'bg-blue-100/50 text-blue-700 border-blue-100' : 'bg-purple-100/50 text-purple-700 border-purple-100'
                        }`}>
                          {rule.rule_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                        <FiClock size={12} className="text-amber-500" />
                        Target: <span className="text-secondary">{rule.days} Days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => onEdit(rule.id)}
                      className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(rule.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Info Box */}
        <div className="mx-6 mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
          <div className="text-amber-500 shrink-0 mt-0.5">
            <FiInfo size={18} />
          </div>
          <div>
            <h5 className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-1">How SLAs Work</h5>
            <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
              SLA rules automatically track the age of cases. If a case exceeds its target days based on its Visa Type or a Global Rule, it will be flagged as <span className="font-bold">Overdue</span> and trigger a high-priority escalation in the dashboard.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
