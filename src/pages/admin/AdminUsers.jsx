import { useState, useMemo } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiDownload } from "react-icons/fi";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";

const INITIAL_USERS = [
  {
    id: 1,
    name: "Sarah Anand",
    initials: "SA",
    email: "sarah@visaflow.co.uk",
    phone: "+44 7700 900111",
    role: "Super Admin",
    permissions: "Full Access",
    lastLogin: "Today, 09:14",
    status: "Active",
    avatarBg: "bg-blue-500",
  },
  {
    id: 2,
    name: "Mohamed Rashid",
    initials: "MR",
    email: "m.rashid@visaflow.co.uk",
    phone: "+44 7700 900222",
    role: "Admin",
    permissions: "Cases + Finance",
    lastLogin: "Yesterday",
    status: "Active",
    avatarBg: "bg-yellow-500",
  },
  {
    id: 3,
    name: "Janet Nwosu",
    initials: "JN",
    email: "j.nwosu@visaflow.co.uk",
    phone: "+44 7700 900333",
    role: "Admin",
    permissions: "Cases Only",
    lastLogin: "3 days ago",
    status: "Suspended",
    avatarBg: "bg-red-500",
  },
  {
    id: 4,
    name: "David Osei",
    initials: "DO",
    email: "d.osei@visaflow.co.uk",
    phone: "+44 7700 900444",
    role: "Manager",
    permissions: "Cases + Finance",
    lastLogin: "2 hours ago",
    status: "Active",
    avatarBg: "bg-green-500",
  },
  {
    id: 5,
    name: "Priya Kapoor",
    initials: "PK",
    email: "p.kapoor@visaflow.co.uk",
    phone: "+44 7700 900555",
    role: "Admin",
    permissions: "Finance Only",
    lastLogin: "1 week ago",
    status: "Inactive",
    avatarBg: "bg-purple-500",
  },
];

const ROLE_CHIPS = {
  "Super Admin": "bg-purple-100 text-purple-700",
  Admin:         "bg-blue-100 text-blue-700",
  Manager:       "bg-green-100 text-green-700",
};

const STATUS_CHIPS = {
  Active:    "bg-green-100 text-green-700",
  Inactive:  "bg-gray-100 text-gray-500",
  Suspended: "bg-red-100 text-red-600",
};

const AVATAR_COLORS = [
  "bg-blue-500","bg-yellow-500","bg-red-500",
  "bg-green-500","bg-purple-500","bg-pink-500","bg-teal-500",
];

const ROLE_OPTIONS = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin",       label: "Admin"       },
  { value: "Manager",     label: "Manager"     },
];

const PERMISSIONS_OPTIONS = [
  { value: "Full Access",     label: "Full Access"     },
  { value: "Cases + Finance", label: "Cases + Finance" },
  { value: "Cases Only",      label: "Cases Only"      },
  { value: "Finance Only",    label: "Finance Only"    },
];

const STATUS_OPTIONS = [
  { value: "Active",   label: "Active"   },
  { value: "Inactive", label: "Inactive" },
];

const EMPTY_FORM = {
  name: "", email: "", phone: "",
  role: "Admin", permissions: "Cases Only",
  password: "", confirmPassword: "",
  status: "Active",
};

const AdminUsers = () => {
  const [users, setUsers]           = useState(INITIAL_USERS);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modal, setModal]           = useState({ type: null, data: null });
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter === "All"   || u.role === roleFilter;
      const matchStatus = statusFilter === "All" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal({ type: "create", data: null });
  };

  const openEdit = (user) => {
    setForm({
      name: user.name, email: user.email, phone: user.phone,
      role: user.role, permissions: user.permissions,
      password: "", confirmPassword: "", status: user.status,
    });
    setErrors({});
    setModal({ type: "edit", data: user });
  };

  const openDelete = (user) => setModal({ type: "delete", data: user });

  const closeModal = () => {
    setModal({ type: null, data: null });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = (isEdit) => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!isEdit) {
      if (!form.password)        errs.password        = "Password is required";
      if (!form.confirmPassword) errs.confirmPassword = "Please confirm password";
      else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    } else if (form.password && form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleCreate = () => {
    const errs = validate(false);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const initials = form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const avatarBg = AVATAR_COLORS[users.length % AVATAR_COLORS.length];
    setUsers((p) => [
      ...p,
      { id: Date.now(), name: form.name, initials, email: form.email,
        phone: form.phone, role: form.role, permissions: form.permissions,
        lastLogin: "Never", status: form.status, avatarBg },
    ]);
    closeModal();
  };

  const handleUpdate = () => {
    const errs = validate(true);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setUsers((p) =>
      p.map((u) =>
        u.id !== modal.data.id ? u : {
          ...u,
          name: form.name,
          initials: form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
          email: form.email, phone: form.phone,
          role: form.role, permissions: form.permissions, status: form.status,
        }
      )
    );
    closeModal();
  };

  const handleDelete = () => {
    setUsers((p) => p.filter((u) => u.id !== modal.data.id));
    closeModal();
  };

  const isFormModal = modal.type === "create" || modal.type === "edit";

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Admin Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage administrator accounts and their permissions
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <FiDownload size={14} />
            Export
          </button>
          <Button onClick={openCreate} className="rounded-xl shadow-sm">
            <FiPlus size={14} />
            Create Admin
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filter Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admins…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-gray-50 placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Name", "Email", "Role", "Status", "Last Active", "Actions"].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                    No admin users match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${user.avatarBg}`}
                        >
                          {user.initials}
                        </div>
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          ROLE_CHIPS[user.role] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          STATUS_CHIPS[user.status] ?? "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 font-mono whitespace-nowrap">
                      {user.lastLogin}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => openDelete(user)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
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

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-secondary">{filtered.length}</span> of{" "}
            <span className="font-bold text-secondary">{users.length}</span> admin users
          </p>
        </div>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={modal.type === "create" ? "Create Admin User" : "Edit Admin User"}
        maxWidthClass="max-w-lg"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={modal.type === "create" ? handleCreate : handleUpdate}
              className="rounded-xl"
            >
              {modal.type === "create" ? "Create User" : "Update User"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Sarah Anand"
            required
            error={errors.name}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="sarah@example.com"
            required
            error={errors.email}
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+44 7700 900000"
            required
            error={errors.phone}
          />
          <Input
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
            options={ROLE_OPTIONS}
            required
          />
          <Input
            label="Permissions Group"
            name="permissions"
            value={form.permissions}
            onChange={handleChange}
            options={PERMISSIONS_OPTIONS}
          />
          <Input
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={STATUS_OPTIONS}
            required
          />
          <Input
            label={modal.type === "edit" ? "New Password (optional)" : "Password"}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={modal.type === "edit" ? "Leave blank to keep current" : "••••••••"}
            required={modal.type === "create"}
            error={errors.password}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required={modal.type === "create"}
            error={errors.confirmPassword}
          />
        </div>
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        open={modal.type === "delete"}
        onClose={closeModal}
        title="Delete Admin User"
        maxWidthClass="max-w-sm"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="rounded-xl">
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FiTrash2 size={16} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-black text-secondary">{modal.data?.name}</span>? This action
            cannot be undone and will permanently remove their account and access.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminUsers;
