import { useState, useMemo } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus, FiBarChart2 } from "react-icons/fi";
import { motion } from "framer-motion";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";

const INITIAL_CASEWORKERS = [
  {
    id: 1,
    name: "Alice Patel",
    initials: "AP",
    email: "a.patel@visaflow.co.uk",
    phone: "+44 7700 100111",
    department: "H-1B Processing",
    role: "Senior Caseworker",
    activeCases: 21,
    overdue: 2,
    completed: 84,
    performance: 91,
    status: "Active",
    avatarBg: "bg-blue-500",
  },
  {
    id: 2,
    name: "Marcus Green",
    initials: "MG",
    email: "m.green@visaflow.co.uk",
    phone: "+44 7700 100222",
    department: "L-1 Processing",
    role: "Caseworker",
    activeCases: 16,
    overdue: 5,
    completed: 61,
    performance: 74,
    status: "Active",
    avatarBg: "bg-green-500",
  },
  {
    id: 3,
    name: "James Osei",
    initials: "JO",
    email: "j.osei@visaflow.co.uk",
    phone: "+44 7700 100333",
    department: "General Processing",
    role: "Senior Caseworker",
    activeCases: 23,
    overdue: 8,
    completed: 42,
    performance: 58,
    status: "High Load",
    avatarBg: "bg-purple-500",
  },
  {
    id: 4,
    name: "Fatima Khan",
    initials: "FK",
    email: "f.khan@visaflow.co.uk",
    phone: "+44 7700 100444",
    department: "Compliance",
    role: "Caseworker",
    activeCases: 18,
    overdue: 3,
    completed: 72,
    performance: 79,
    status: "Active",
    avatarBg: "bg-yellow-500",
  },
  {
    id: 5,
    name: "Rina Mehta",
    initials: "RM",
    email: "r.mehta@visaflow.co.uk",
    phone: "+44 7700 100555",
    department: "Quality Assurance",
    role: "Junior Caseworker",
    activeCases: 13,
    overdue: 1,
    completed: 95,
    performance: 88,
    status: "Active",
    avatarBg: "bg-pink-500",
  },
  {
    id: 6,
    name: "David Osei",
    initials: "DO",
    email: "d.osei@visaflow.co.uk",
    phone: "+44 7700 100666",
    department: "Client Relations",
    role: "Manager",
    activeCases: 9,
    overdue: 0,
    completed: 110,
    performance: 96,
    status: "On Leave",
    avatarBg: "bg-teal-500",
  },
];

const KPI_STATS = [
  { label: "Total Caseworkers", value: 24,  bg: "bg-blue-50",   color: "text-blue-600"   },
  { label: "Active",            value: 21,  bg: "bg-green-50",  color: "text-green-600"  },
  { label: "High Load",         value: 2,   bg: "bg-red-50",    color: "text-red-500"    },
  { label: "On Leave",          value: 3,   bg: "bg-yellow-50", color: "text-yellow-600" },
];

const AVATAR_COLORS = [
  "bg-blue-500","bg-green-500","bg-purple-500",
  "bg-yellow-500","bg-pink-500","bg-teal-500","bg-red-500",
];

const ROLE_OPTIONS = [
  { value: "Senior Caseworker", label: "Senior Caseworker" },
  { value: "Caseworker",        label: "Caseworker"        },
  { value: "Junior Caseworker", label: "Junior Caseworker" },
  { value: "Manager",           label: "Manager"           },
];

const DEPARTMENT_OPTIONS = [
  { value: "H-1B Processing",   label: "H-1B Processing"   },
  { value: "L-1 Processing",    label: "L-1 Processing"    },
  { value: "General Processing",label: "General Processing"},
  { value: "Compliance",        label: "Compliance"        },
  { value: "Quality Assurance", label: "Quality Assurance" },
  { value: "Client Relations",  label: "Client Relations"  },
];

const STATUS_OPTIONS = [
  { value: "Active",    label: "Active"    },
  { value: "High Load", label: "High Load" },
  { value: "On Leave",  label: "On Leave"  },
  { value: "Inactive",  label: "Inactive"  },
];

const STATUS_CHIPS = {
  Active:      "bg-green-100 text-green-700",
  "High Load": "bg-yellow-100 text-yellow-700",
  "On Leave":  "bg-blue-100 text-blue-600",
  Inactive:    "bg-gray-100 text-gray-500",
};

const EMPTY_FORM = {
  name: "", email: "", phone: "",
  role: "Caseworker", department: "General Processing",
  status: "Active", password: "", confirmPassword: "",
};

const perfColor = (p) => {
  if (p >= 85) return { bar: "bg-green-500", text: "text-green-600" };
  if (p >= 70) return { bar: "bg-yellow-500", text: "text-yellow-600" };
  return { bar: "bg-red-500", text: "text-red-500" };
};

const AdminCaseworkers = () => {
  const [caseworkers, setCaseworkers]   = useState(INITIAL_CASEWORKERS);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deptFilter, setDeptFilter]     = useState("All");
  const [modal, setModal]               = useState({ type: null, data: null });
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [errors, setErrors]             = useState({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return caseworkers.filter((c) => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchDept   = deptFilter   === "All" || c.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [caseworkers, search, statusFilter, deptFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal({ type: "create", data: null });
  };

  const openEdit = (cw) => {
    setForm({
      name: cw.name, email: cw.email, phone: cw.phone,
      role: cw.role, department: cw.department,
      status: cw.status, password: "", confirmPassword: "",
    });
    setErrors({});
    setModal({ type: "edit", data: cw });
  };

  const openDelete = (cw) => setModal({ type: "delete", data: cw });

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
    const avatarBg = AVATAR_COLORS[caseworkers.length % AVATAR_COLORS.length];
    setCaseworkers((p) => [
      ...p,
      {
        id: Date.now(), name: form.name, initials, email: form.email, phone: form.phone,
        role: form.role, department: form.department, status: form.status,
        activeCases: 0, overdue: 0, completed: 0, performance: 0, avatarBg,
      },
    ]);
    closeModal();
  };

  const handleUpdate = () => {
    const errs = validate(true);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setCaseworkers((p) =>
      p.map((c) =>
        c.id !== modal.data.id ? c : {
          ...c,
          name: form.name,
          initials: form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
          email: form.email, phone: form.phone,
          role: form.role, department: form.department, status: form.status,
        }
      )
    );
    closeModal();
  };

  const handleDelete = () => {
    setCaseworkers((p) => p.filter((c) => c.id !== modal.data.id));
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
          <h1 className="text-3xl font-black text-secondary tracking-tight">Case Workers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Team performance and case assignment overview</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <FiBarChart2 size={14} />
            Performance Report
          </button>
          <Button onClick={openCreate} className="rounded-xl shadow-sm">
            <FiPlus size={14} />
            Add Caseworker
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_STATS.map(({ label, value, bg, color }) => (
          <div key={label} className={`${bg} rounded-xl p-4 border border-gray-100`}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Filter Bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="text-sm font-black text-secondary">All Caseworkers</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search caseworkers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/30 bg-gray-50 w-48 placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="High Load">High Load</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/30 text-gray-600"
            >
              <option value="All">All Departments</option>
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {["Name", "Email", "Active Cases", "Overdue", "Completed", "Performance", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    No caseworkers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((cw) => {
                  const { bar, text } = perfColor(cw.performance);
                  return (
                    <tr key={cw.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 ${cw.avatarBg}`}>
                            {cw.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{cw.name}</p>
                            <p className="text-[11px] text-gray-400 whitespace-nowrap">{cw.role}</p>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{cw.email}</td>
                      {/* Active Cases */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${cw.activeCases >= 20 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}>
                          {cw.activeCases}
                        </span>
                      </td>
                      {/* Overdue */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${cw.overdue >= 6 ? "bg-red-100 text-red-600" : cw.overdue >= 3 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {cw.overdue}
                        </span>
                      </td>
                      {/* Completed */}
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {cw.completed}
                      </td>
                      {/* Performance */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${cw.performance}%` }} />
                          </div>
                          <span className={`text-xs font-black ${text}`}>{cw.performance}%</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${STATUS_CHIPS[cw.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {cw.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(cw)}
                            className="p-2 text-gray-400 hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => openDelete(cw)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Showing <span className="font-bold text-secondary">{filtered.length}</span> of{" "}
            <span className="font-bold text-secondary">{caseworkers.length}</span> caseworkers
          </p>
        </div>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        open={isFormModal}
        onClose={closeModal}
        title={modal.type === "create" ? "Add Caseworker" : "Edit Caseworker"}
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
              {modal.type === "create" ? "Create Caseworker" : "Update Caseworker"}
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
            placeholder="Alice Patel"
            required
            error={errors.name}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="alice@visaflow.co.uk"
            required
            error={errors.email}
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+44 7700 000000"
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
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            options={DEPARTMENT_OPTIONS}
            required
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
        title="Delete Caseworker"
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
            <span className="font-black text-secondary">{modal.data?.name}</span>? All assigned cases will need to be reassigned.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminCaseworkers;
