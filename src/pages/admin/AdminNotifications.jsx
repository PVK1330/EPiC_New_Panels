import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiBell,
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCheck,
  FiRotateCcw,
  FiMail,
} from "react-icons/fi";
import { RiNotification3Line } from "react-icons/ri";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";

const ICON_MAP = {
  info: FiInfo,
  warning: FiAlertTriangle,
  success: FiCheckCircle,
  clock: FiClock,
  alert: FiAlertCircle,
};

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    title: "New Case Assigned",
    message: "Case #CAS-045 has been assigned to you for H-1B visa processing.",
    time: "2 hours ago",
    unread: true,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    iconKey: "info",
  },
  {
    id: "n2",
    title: "Payment Overdue",
    message: "Payment for case #CAS-038 from Tech Solutions Ltd is 2 days overdue.",
    time: "5 hours ago",
    unread: true,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    iconKey: "warning",
  },
  {
    id: "n3",
    title: "Case Approved",
    message: "Case #CAS-042 has been approved. Notification sent to the client.",
    time: "Yesterday at 3:45 PM",
    unread: false,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    iconKey: "success",
  },
  {
    id: "n4",
    title: "System Maintenance",
    message: "Scheduled system maintenance on Sunday, January 28th from 2:00 AM to 4:00 AM.",
    time: "2 days ago",
    unread: false,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    iconKey: "clock",
  },
  {
    id: "n5",
    title: "Document Missing",
    message: "Required documents are missing for case #CAS-039. Please review and update.",
    time: "3 days ago",
    unread: false,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    iconKey: "alert",
  },
];

const preferencesList = [
  { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email", on: true },
  { key: "caseUpdates", label: "Case Updates", desc: "Get notified about case status changes", on: true },
  { key: "paymentAlerts", label: "Payment Alerts", desc: "Receive payment due and overdue notifications", on: false },
  { key: "systemMessages", label: "System Messages", desc: "Get system updates and maintenance notices", on: true },
];

const notificationTypes = [
  { value: "info", label: "Information", Icon: FiInfo, activeClass: "border-blue-500 bg-blue-50" },
  { value: "success", label: "Success", Icon: FiCheckCircle, activeClass: "border-green-500 bg-green-50" },
  { value: "warning", label: "Warning", Icon: FiAlertTriangle, activeClass: "border-yellow-500 bg-yellow-50" },
  { value: "error", label: "Error", Icon: FiAlertCircle, activeClass: "border-red-500 bg-red-50" },
];

const priorityLevels = [
  { value: "low", label: "Low", activeClass: "border-gray-400 bg-gray-50" },
  { value: "medium", label: "Medium", activeClass: "border-blue-500 bg-blue-50" },
  { value: "high", label: "High", activeClass: "border-red-500 bg-red-50" },
];

const recipientTypes = [
  { value: "all", label: "All Users", description: "Send to all system users" },
  { value: "caseworkers", label: "Caseworkers Only", description: "Send to all caseworkers" },
  { value: "managers", label: "Managers Only", description: "Send to all managers" },
  { value: "specific", label: "Specific Users", description: "Send to selected users" },
];

const typePreviewClass = {
  info: "bg-blue-50 border-blue-400",
  success: "bg-green-50 border-green-400",
  warning: "bg-yellow-50 border-yellow-400",
  error: "bg-red-50 border-red-400",
};

const priorityBadgeClass = {
  high: "bg-red-100 text-red-800",
  medium: "bg-blue-100 text-blue-800",
  low: "bg-gray-100 text-gray-800",
};

const emptyForm = {
  title: "",
  message: "",
  type: "info",
  priority: "medium",
  recipientType: "all",
  specificUsers: [],
  caseId: "",
  businessId: "",
  sendEmail: false,
  isScheduled: false,
  scheduledDate: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const FORM_ID = "create-notification-form";

export default function AdminNotifications() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [newUserInput, setNewUserInput] = useState("");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const initialPrefs = useMemo(() => Object.fromEntries(preferencesList.map((p) => [p.key, p.on])), []);
  const [prefs, setPrefs] = useState(initialPrefs);

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);
  const readCount = useMemo(() => notifications.filter((n) => !n.unread).length, [notifications]);

  const stats = useMemo(
    () => [
      { label: "Total notifications", value: notifications.length, bg: "bg-blue-100", color: "text-blue-600" },
      { label: "Unread", value: unreadCount, bg: "bg-yellow-100", color: "text-yellow-600" },
      { label: "Read", value: readCount, bg: "bg-green-100", color: "text-green-600" },
    ],
    [notifications.length, unreadCount, readCount],
  );

  const togglePref = (key) => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markUnread = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: true } : n)));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const addSpecificUser = () => {
    const trimmed = newUserInput.trim();
    if (trimmed && !formData.specificUsers.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, specificUsers: [...prev.specificUsers, trimmed] }));
      setNewUserInput("");
    }
  };

  const removeSpecificUser = (user) => {
    setFormData((prev) => ({
      ...prev,
      specificUsers: prev.specificUsers.filter((u) => u !== user),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Notification title is required";
    if (!formData.message.trim()) newErrors.message = "Notification message is required";
    if (formData.recipientType === "specific" && formData.specificUsers.length === 0)
      newErrors.specificUsers = "At least one recipient is required";
    if (formData.isScheduled && !formData.scheduledDate) newErrors.scheduledDate = "Scheduled date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newEntry = {
        id: `n-${Date.now()}`,
        title: formData.title.trim(),
        message: formData.message.trim(),
        time: "Just now",
        unread: true,
        iconBg:
          formData.type === "success"
            ? "bg-green-100"
            : formData.type === "warning"
              ? "bg-yellow-100"
              : formData.type === "error"
                ? "bg-red-100"
                : "bg-blue-100",
        iconColor:
          formData.type === "success"
            ? "text-green-600"
            : formData.type === "warning"
              ? "text-yellow-600"
              : formData.type === "error"
                ? "text-red-600"
                : "text-blue-600",
        iconKey: formData.type === "success" ? "success" : formData.type === "warning" ? "warning" : formData.type === "error" ? "alert" : "info",
      };
      setNotifications((prev) => [newEntry, ...prev]);
      closeModal();
    } catch (error) {
      console.error("Failed to create notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData(emptyForm);
    setErrors({});
    setNewUserInput("");
  };

  const TypeIconPreview = notificationTypes.find((t) => t.value === formData.type)?.Icon ?? FiInfo;

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-secondary tracking-tight flex items-center gap-3">
            <RiNotification3Line className="text-primary shrink-0" size={36} />
            Notifications
          </h1>
          <p className="text-primary font-bold text-sm mt-1">Manage system notifications and alerts</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0">
          <Button type="button" variant="ghost" className="rounded-xl" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
          <Button type="button" className="rounded-xl shadow-sm" onClick={() => setModalOpen(true)}>
            Create notification
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map(({ label, value, bg, color }) => (
          <motion.div
            key={label}
            variants={cardVariants}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 ${bg} rounded-lg`}>
              <FiBell className={`${color} h-6 w-6`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-black text-secondary">{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-secondary">Recent notifications</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.map((item, index) => {
            const IconComponent = ICON_MAP[item.iconKey] ?? FiInfo;
            return (
              <motion.div
                key={item.id}
                className={`p-6 transition-colors ${
                  item.unread ? "bg-blue-50/80 hover:bg-blue-100/90" : "hover:bg-gray-50"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.07 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                    <IconComponent className={`${item.iconColor} h-5 w-5`} aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <h4 className="text-sm font-bold text-secondary">{item.title}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.unread ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold">
                            <FiMail size={14} aria-hidden />
                            Unread
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-semibold">
                            <FiCheckCircle size={14} className="text-green-600" aria-hidden />
                            Read
                          </span>
                        )}
                        <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
                          {item.unread ? (
                            <button
                              type="button"
                              onClick={() => markRead(item.id)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                              title="Mark as read"
                              aria-label="Mark as read"
                            >
                              <FiCheck size={18} strokeWidth={2.5} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => markUnread(item.id)}
                              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                              title="Mark as unread"
                              aria-label="Mark as unread"
                            >
                              <FiRotateCcw size={17} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                    <p className="mt-2 text-xs text-gray-400">{item.time}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-black text-secondary">Notification preferences</h3>
        </div>
        <div className="p-6 space-y-5">
          {preferencesList.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-secondary">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => togglePref(key)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
                  prefs[key] ? "bg-primary" : "bg-gray-200"
                }`}
                aria-pressed={prefs[key]}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    prefs[key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Create notification"
        maxWidthClass="max-w-3xl"
        bodyClassName="px-5 py-5 sm:px-6"
        footer={
          <>
            <Button type="button" variant="ghost" className="rounded-xl" onClick={closeModal} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" form={FORM_ID} className="rounded-xl" disabled={isLoading}>
              {isLoading ? "Sending…" : formData.isScheduled ? "Schedule notification" : "Send notification"}
            </Button>
          </>
        }
      >
        <p className="text-xs text-gray-500 mb-5">Send notifications to system users</p>
        <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-black text-secondary mb-3">
                Notification type <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {notificationTypes.map(({ value, label, Icon, activeClass }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: value }))}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-colors text-sm font-medium ${
                      formData.type === value ? activeClass : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-black text-secondary mb-3">
                Priority <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {priorityLevels.map(({ value, label, activeClass }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: value }))}
                    className={`w-full flex items-center justify-between p-3 border-2 rounded-lg transition-colors text-sm font-medium ${
                      formData.priority === value ? activeClass : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {label}
                    {formData.priority === value && <FiCheck size={16} className="text-secondary" aria-hidden />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">Notification content</h4>
            <div className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="Enter notification title"
                required
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="notif-message" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Message <span className="text-primary">*</span>
                </label>
                <textarea
                  id="notif-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter notification message…"
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-y min-h-[100px] ${
                    errors.message ? "border-primary" : "border-gray-200"
                  }`}
                />
                {errors.message && <span className="text-xs text-primary">{errors.message}</span>}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">Recipients</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recipientTypes.map(({ value, label, description }) => (
                <div
                  key={value}
                  role="button"
                  tabIndex={0}
                  onClick={() => setFormData((prev) => ({ ...prev, recipientType: value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFormData((prev) => ({ ...prev, recipientType: value }));
                    }
                  }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.recipientType === value ? "border-secondary bg-secondary/5" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value={value}
                      checked={formData.recipientType === value}
                      onChange={() => setFormData((prev) => ({ ...prev, recipientType: value }))}
                      className="h-4 w-4 accent-secondary"
                    />
                    <span className="text-sm font-bold text-secondary">{label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">{description}</p>
                </div>
              ))}
            </div>

            {formData.recipientType === "specific" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 block">Add recipients</label>
                <div className="flex gap-2">
                  <Input
                    name="newUser"
                    value={newUserInput}
                    onChange={(e) => setNewUserInput(e.target.value)}
                    placeholder="User ID or email"
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" className="rounded-xl shrink-0" onClick={addSpecificUser}>
                    Add
                  </Button>
                </div>
                {errors.specificUsers && <span className="text-xs text-primary mt-1 block">{errors.specificUsers}</span>}
                {formData.specificUsers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.specificUsers.map((user) => (
                      <span
                        key={user}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
                      >
                        {user}
                        <button
                          type="button"
                          onClick={() => removeSpecificUser(user)}
                          className="text-secondary hover:text-primary font-bold leading-none p-0.5"
                          aria-label={`Remove ${user}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">Related to (optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Case ID" name="caseId" value={formData.caseId} onChange={handleInputChange} placeholder="Related case ID" />
              <Input label="Business ID" name="businessId" value={formData.businessId} onChange={handleInputChange} placeholder="Related business ID" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">Delivery</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="sendEmail"
                  name="sendEmail"
                  checked={formData.sendEmail}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 accent-secondary"
                />
                <span className="text-sm text-gray-700">Also send as email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="isScheduled"
                  name="isScheduled"
                  checked={formData.isScheduled}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 accent-secondary"
                />
                <span className="text-sm text-gray-700">Schedule for later</span>
              </label>
              {formData.isScheduled && (
                <div className="ml-6">
                  <Input
                    label="Scheduled date & time"
                    name="scheduledDate"
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    error={errors.scheduledDate}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="text-sm font-black text-secondary mb-3">Preview</h4>
            <div className={`p-3 rounded-lg border-l-4 ${typePreviewClass[formData.type]}`}>
              <div className="flex items-start gap-2">
                <TypeIconPreview className="h-5 w-5 shrink-0 mt-0.5 text-secondary" aria-hidden />
                <div>
                  <p className="font-bold text-sm text-secondary">{formData.title || "Notification title"}</p>
                  <p className="text-sm text-gray-600 mt-1">{formData.message || "Message preview…"}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityBadgeClass[formData.priority]}`}>
                      {priorityLevels.find((p) => p.value === formData.priority)?.label} priority
                    </span>
                    {formData.isScheduled && (
                      <span className="text-xs text-gray-500">Scheduled: {formData.scheduledDate || "Not set"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
