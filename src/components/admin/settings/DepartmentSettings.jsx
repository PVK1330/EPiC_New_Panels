import { motion } from "framer-motion";
import { FiFolder, FiPlus, FiEdit2, FiTrash2, FiUsers } from "react-icons/fi";
import Button from "../../Button";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function DepartmentSettings({ 
  departments, 
  loading, 
  onAdd, 
  onEdit, 
  onDelete, 
  error 
}) {
  return (
    <motion.div {...panelMotion} className="space-y-8">
      {/* Departments Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <FiFolder size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Organization Departments</h3>
              <p className="text-xs text-gray-500">Categorize your team and workload by department</p>
            </div>
          </div>
          <Button 
            onClick={onAdd}
            className="rounded-xl px-4 py-2 text-xs flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-none shadow-md shadow-indigo-100"
          >
            <FiPlus /> New Department
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : departments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex p-4 bg-indigo-50 rounded-full mb-4 text-indigo-300">
                <FiFolder size={32} />
              </div>
              <p className="text-sm text-gray-400 italic">No departments defined.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div 
                  key={dept} 
                  className="group p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <FiUsers size={18} />
                    </div>
                    <span className="text-sm font-black text-secondary truncate uppercase tracking-tight">{dept.name || dept}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onEdit(dept.name || dept)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(dept.name || dept)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
