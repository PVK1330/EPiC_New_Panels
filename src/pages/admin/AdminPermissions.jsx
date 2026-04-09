import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { RiLockLine } from "react-icons/ri";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import PermissionsTabBar from "../../components/permissions/PermissionsTabBar";
import ModuleMatrixPanel from "../../components/permissions/ModuleMatrixPanel";
import RoleAssignmentPanel from "../../components/permissions/RoleAssignmentPanel";
import VisibilityControlsPanel from "../../components/permissions/VisibilityControlsPanel";
import SegregationPanel from "../../components/permissions/SegregationPanel";
import {
  TABS,
  TAB_IDS,
  ASSIGNMENT_ROLES,
  CREATE_ROLE_INHERIT_OPTIONS,
} from "../../components/permissions/permissionsData";

const LANDING_OPTIONS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "cases", label: "Cases" },
  { value: "documents", label: "Documents" },
  { value: "finance", label: "Finance" },
  { value: "reports", label: "Reports" },
];

const EMPTY_ROLE_FORM = {
  displayName: "",
  roleCode: "",
  description: "",
  inheritFrom: "",
  defaultLanding: "dashboard",
  notes: "",
};

const AdminPermissions = () => {
  const [activeTab, setActiveTab] = useState(TAB_IDS.matrix);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [extraRoles, setExtraRoles] = useState([]);
  const [form, setForm] = useState(EMPTY_ROLE_FORM);
  const [errors, setErrors] = useState({});

  const roleOptions = useMemo(
    () => [...ASSIGNMENT_ROLES, ...extraRoles],
    [extraRoles]
  );

  const openCreateRole = () => {
    setForm(EMPTY_ROLE_FORM);
    setErrors({});
    setRoleModalOpen(true);
  };

  const closeCreateRole = () => {
    setRoleModalOpen(false);
    setErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validateRole = () => {
    const e = {};
    if (!form.displayName.trim()) e.displayName = "Required";
    if (!form.roleCode.trim()) e.roleCode = "Required";
    else if (!/^[a-z0-9_]+$/i.test(form.roleCode.trim())) e.roleCode = "Use letters, numbers, underscores only";
    return e;
  };

  const submitCreateRole = () => {
    const e = validateRole();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const code = form.roleCode.trim().toLowerCase();
    setExtraRoles((prev) => [
      ...prev,
      {
        value: code,
        label: `${form.displayName.trim()} (${code})`,
      },
    ]);
    closeCreateRole();
  };

  const tabContent = {
    [TAB_IDS.matrix]: <ModuleMatrixPanel />,
    [TAB_IDS.roles]: <RoleAssignmentPanel roleOptions={roleOptions} />,
    [TAB_IDS.visibility]: <VisibilityControlsPanel />,
    [TAB_IDS.segregation]: <SegregationPanel />,
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <RiLockLine size={32} className="text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-3xl font-black text-secondary tracking-tight">
              Permissions &amp; Access Control
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Role-Based Access Control (RBAC) configuration
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={openCreateRole}
          className="rounded-xl shadow-sm shrink-0 self-start sm:self-center"
        >
          <FiPlus size={14} />
          Create Role
        </Button>
      </div>

      <PermissionsTabBar tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>

      <Modal
        open={roleModalOpen}
        onClose={closeCreateRole}
        title="Create Role"
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" type="button" onClick={closeCreateRole} className="rounded-xl">
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={submitCreateRole} className="rounded-xl">
              Create Role
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Role display name"
            name="displayName"
            value={form.displayName}
            onChange={handleFormChange}
            placeholder="e.g. Compliance Manager"
            required
            error={errors.displayName}
          />
          <Input
            label="Role code (system key)"
            name="roleCode"
            value={form.roleCode}
            onChange={handleFormChange}
            placeholder="e.g. compliance_manager"
            required
            error={errors.roleCode}
          />
          <Input
            label="Description"
            name="description"
            value={form.description}
            onChange={handleFormChange}
            rows={3}
            placeholder="What this role is allowed to do"
          />
          <Input
            label="Inherit permissions from"
            name="inheritFrom"
            value={form.inheritFrom}
            onChange={handleFormChange}
            options={CREATE_ROLE_INHERIT_OPTIONS}
          />
          <Input
            label="Default landing after login"
            name="defaultLanding"
            value={form.defaultLanding}
            onChange={handleFormChange}
            options={LANDING_OPTIONS}
          />
          <Input
            label="Internal notes"
            name="notes"
            value={form.notes}
            onChange={handleFormChange}
            rows={2}
            placeholder="Optional notes for administrators"
          />
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminPermissions;
