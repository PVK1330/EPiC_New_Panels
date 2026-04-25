import { useState } from "react";
import { motion } from "framer-motion";
import { FiFolder, FiPlus, FiTrash2, FiHash, FiPlusCircle } from "react-icons/fi";
import Button from "../../Button";
import Input from "../../Input";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

export default function CategorySettings({ 
  categories, 
  loading, 
  onAdd, 
  onDelete, 
  error,
  saving
}) {
  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAdd(newCategory.trim());
      setNewCategory("");
    }
  };

  return (
    <motion.div {...panelMotion} className="space-y-8">
      {/* Categories Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <FiFolder size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Case Categories</h3>
              <p className="text-xs text-gray-500">Define tags and categories for organizing cases</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3">
              <div className="p-1 bg-red-100 rounded-lg">!</div>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            {/* List */}
            <div>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="py-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 italic">No categories created yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div 
                      key={cat.id || cat.name || cat} 
                      className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 bg-white rounded-lg text-emerald-500 shadow-sm border border-gray-50">
                          <FiHash size={14} />
                        </div>
                        <span className="text-sm font-black text-secondary truncate uppercase tracking-tight">
                          {cat.name || cat}
                        </span>
                      </div>
                      <button 
                        onClick={() => onDelete(cat)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Category"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add */}
            <div className="space-y-4">
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 sticky top-0">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiPlusCircle size={14} /> Quick Add Category
                </h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input 
                    label="Category Name" 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Urgent Filing"
                  />
                  <Button 
                    type="submit" 
                    disabled={saving || !newCategory.trim()}
                    className="w-full rounded-2xl py-3 bg-emerald-600 hover:bg-emerald-700 border-none shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    {saving ? "Adding..." : <><FiPlus /> Add Category</>}
                  </Button>
                </form>
                <p className="mt-4 text-[10px] text-gray-400 italic leading-normal">
                  Categories are used as global tags. Be careful when deleting as they might be linked to active cases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
