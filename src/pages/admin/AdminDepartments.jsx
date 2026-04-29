import { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "../../context/ToastContext";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/caseWorker";

const AdminDepartments = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // create, edit
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      if (res.data?.status === "success") {
        const deptList = res.data.data.departments || [];
        setDepartments(deptList);
      }
    } catch (e) {
      console.error("Failed to fetch departments:", e);
      showToast({ message: "Failed to fetch departments", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalType("create");
    setFormData({ name: "" });
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setModalType("edit");
    setEditingDepartment(department);
    setFormData({ name: department });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createDepartment({ name: formData.name });
      if (res.data?.status === "success") {
        showToast({
          message: "Department created successfully",
          variant: "success",
        });
        setShowModal(false);
        setFormData({ name: "" });
        fetchDepartments();
      }
    } catch (e) {
      console.error("Failed to create department:", e);
      showToast({
        message: e.response?.data?.message || "Failed to create department",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateDepartment({
        oldName: editingDepartment,
        newName: formData.name,
      });
      if (res.data?.status === "success") {
        showToast({
          message: "Department updated successfully",
          variant: "success",
        });
        setShowModal(false);
        setFormData({ name: "" });
        setEditingDepartment(null);
        fetchDepartments();
      }
    } catch (e) {
      console.error("Failed to update department:", e);
      showToast({
        message: e.response?.data?.message || "Failed to update department",
        variant: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (!confirm(`Are you sure you want to delete "${department}"?`)) {
      return;
    }
    try {
      const res = await deleteDepartment({ name: department });
      if (res.data?.status === "success") {
        showToast({
          message: "Department deleted successfully",
          variant: "success",
        });
        fetchDepartments();
      }
    } catch (e) {
      console.error("Failed to delete department:", e);
      showToast({
        message: e.response?.data?.message || "Failed to delete department",
        variant: "danger",
      });
    }
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">
            Departments
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage caseworker departments
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-secondary border border-secondary rounded-xl hover:bg-secondary/90 transition-colors shadow-sm shrink-0 self-start"
        >
          <FiPlus size={14} />
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
              <Loader2 className="w-10 h-10 animate-spin text-secondary" />
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Department Name", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && departments.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr
                    key={department}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">
                      {department}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(department)}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(department)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-secondary">
                {modalType === "create" ? "Add New Department" : "Edit Department"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={modalType === "create" ? handleCreate : handleUpdate}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm"
                  placeholder="e.g., Immigration"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-secondary border border-secondary rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : modalType === "create" ? (
                    "Create"
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDepartments;
