import { motion } from "framer-motion";
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";
import Button from "../../Button";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function VisaSettings({ 
  visaTypes, 
  petitionTypes, 
  loading, 
  onAddVisa, 
  onEditVisa, 
  onDeleteVisa,
  onAddPetition,
  onEditPetition,
  onDeletePetition,
  error
}) {
  return (
    <motion.div {...panelMotion} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3">
          <div className="p-1 bg-red-100 rounded-lg">!</div>
          {error}
        </div>
      )}

      {/* Visa Types Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FiLayers size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Visa Types</h3>
              <p className="text-xs text-gray-500">Configure available visa categories for cases</p>
            </div>
          </div>
          <Button 
            onClick={onAddVisa}
            className="rounded-xl px-4 py-2 text-xs flex items-center gap-2"
          >
            <FiPlus /> Add Visa Type
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : visaTypes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400 italic">No visa types configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visaTypes.map((visa) => (
                <div 
                  key={visa.id}
                  className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                      <FiLayers size={16} />
                    </div>
                    <span className="text-sm font-bold text-secondary truncate">{visa.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEditVisa(visa.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteVisa(visa.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
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

      {/* Petition Types Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <FiFileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Petition Types</h3>
              <p className="text-xs text-gray-500">Manage petition categories for case filing</p>
            </div>
          </div>
          <Button 
            onClick={onAddPetition}
            variant="secondary"
            className="rounded-xl px-4 py-2 text-xs flex items-center gap-2"
          >
            <FiPlus /> Add Petition Type
          </Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : petitionTypes.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400 italic">No petition types configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {petitionTypes.map((pet) => (
                <div 
                  key={pet.id}
                  className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-500/20 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-indigo-500 transition-colors">
                      <FiFileText size={16} />
                    </div>
                    <span className="text-sm font-bold text-secondary truncate">{pet.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEditPetition(pet.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDeletePetition(pet.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
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
