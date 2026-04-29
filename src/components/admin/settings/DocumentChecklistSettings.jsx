import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiFileText, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import Button from "../../Button";
import Modal from "../../Modal";
import { getChecklistByVisaType, createChecklistItem, updateChecklistItem, deleteChecklistItem } from "../../../services/documentChecklistApi";
import { getVisaTypes } from "../../../services/settingsService";

const panelMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const CATEGORY_OPTIONS = [
  { value: 'identity', label: 'Identity Documents' },
  { value: 'education', label: 'Education & Qualifications' },
  { value: 'work', label: 'Work Experience' },
  { value: 'financial', label: 'Financial Documents' },
  { value: 'medical', label: 'Medical Documents' },
  { value: 'legal', label: 'Legal Documents' },
  { value: 'other', label: 'Other Documents' }
];

export default function DocumentChecklistSettings() {
  const [visaTypes, setVisaTypes] = useState([]);
  const [selectedVisaTypeId, setSelectedVisaTypeId] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    documentType: '',
    documentName: '',
    description: '',
    isRequired: true,
    sortOrder: 0,
    category: 'other'
  });

  const fetchVisaTypes = useCallback(async () => {
    try {
      const res = await getVisaTypes();
      if (res.data?.status === 'success') {
        const types = res.data.data?.visa_types || res.data.data || [];
        setVisaTypes(Array.isArray(types) ? types : []);
        if (Array.isArray(types) && types.length > 0 && !selectedVisaTypeId) {
          setSelectedVisaTypeId(types[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch visa types:", err);
    }
  }, [selectedVisaTypeId]);

  const fetchChecklist = useCallback(async () => {
    if (!selectedVisaTypeId) return;
    setLoading(true);
    setError('');
    try {
      const res = await getChecklistByVisaType(selectedVisaTypeId);
      if (res.data?.status === 'success') {
        // Flatten the grouped checklist
        const flatChecklist = Object.values(res.data.data.checklist).flat();
        setChecklist(flatChecklist);
      }
    } catch (err) {
      console.error("Failed to fetch checklist:", err);
      setError('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  }, [selectedVisaTypeId]);

  useEffect(() => {
    fetchVisaTypes();
  }, [fetchVisaTypes]);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      documentType: '',
      documentName: '',
      description: '',
      isRequired: true,
      sortOrder: checklist.length,
      category: 'other'
    });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      documentType: item.documentType,
      documentName: item.documentName,
      description: item.description || '',
      isRequired: item.isRequired,
      sortOrder: item.sortOrder,
      category: item.category
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this checklist item?')) return;
    
    try {
      await deleteChecklistItem(id);
      await fetchChecklist();
    } catch (err) {
      console.error("Failed to delete checklist item:", err);
      alert('Failed to delete checklist item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateChecklistItem(editingItem.id, formData);
      } else {
        await createChecklistItem({
          ...formData,
          visaTypeId: selectedVisaTypeId
        });
      }
      setModalOpen(false);
      await fetchChecklist();
    } catch (err) {
      console.error("Failed to save checklist item:", err);
      alert('Failed to save checklist item');
    }
  };

  const selectedVisa = Array.isArray(visaTypes) ? visaTypes.find(v => v.id === parseInt(selectedVisaTypeId)) : null;

  return (
    <motion.div {...panelMotion} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-semibold flex items-center gap-3">
          <div className="p-1 bg-red-100 rounded-lg">!</div>
          {error}
        </div>
      )}

      {/* Visa Type Selector */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <FiFileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary">Document Checklists</h3>
              <p className="text-xs text-gray-500">Configure required documents for each visa type</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-semibold text-gray-700">Select Visa Type:</label>
            <select
              value={selectedVisaTypeId}
              onChange={(e) => setSelectedVisaTypeId(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              {visaTypes.map((visa) => (
                <option key={visa.id} value={visa.id}>{visa.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !selectedVisaTypeId ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400 italic">Select a visa type to view its document checklist.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{checklist.length}</span> documents configured for <span className="font-semibold">{selectedVisa?.name}</span>
                </p>
                <Button 
                  onClick={handleAdd}
                  className="rounded-xl px-4 py-2 text-xs flex items-center gap-2"
                >
                  <FiPlus /> Add Document
                </Button>
              </div>

              {checklist.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                  <p className="text-sm text-gray-400 italic">No documents configured for this visa type.</p>
                  <p className="text-xs text-gray-400 mt-1">Click "Add Document" to create the checklist.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {checklist
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => (
                    <div 
                      key={item.id}
                      className="group p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-primary/20 hover:shadow-md transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.isRequired ? (
                            <FiCheck size={16} className="text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-secondary">{item.documentName}</p>
                          <p className="text-xs text-gray-500">{item.documentType}</p>
                          {item.description && (
                            <p className="text-xs text-gray-400 mt-1 truncate">{item.description}</p>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {CATEGORY_OPTIONS.find(c => c.value === item.category)?.label || item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
            </>
          )}
        </div>
      </section>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? "Edit Document" : "Add Document"}
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type</label>
            <input
              type="text"
              value={formData.documentType}
              onChange={(e) => setFormData({...formData, documentType: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              placeholder="e.g., passport, english_certificate"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Name</label>
            <input
              type="text"
              value={formData.documentName}
              onChange={(e) => setFormData({...formData, documentName: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              placeholder="e.g., Valid Passport"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              placeholder="Document requirements..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30"
                min="0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isRequired"
              checked={formData.isRequired}
              onChange={(e) => setFormData({...formData, isRequired: e.target.checked})}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-secondary"
            />
            <label htmlFor="isRequired" className="text-sm text-gray-700">Required document</label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
            >
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
