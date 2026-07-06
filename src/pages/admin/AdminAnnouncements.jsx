import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RiMegaphoneLine,
  RiSendPlaneFill,
  RiAddLine,
  RiEdit2Line,
  RiDeleteBin6Line,
  RiDownloadLine,
} from "react-icons/ri";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import {
  sendAdminAnnouncement,
  listAdminAnnouncements,
  updateAdminAnnouncement,
  deleteAdminAnnouncement,
  exportAdminAnnouncements,
} from "../../services/adminAnnouncement.service";

const AUDIENCE_OPTIONS = [
  { id: "caseworker", label: "All caseworkers (staff)" },
  { id: "sponsor", label: "All sponsors" },
  { id: "candidate", label: "All candidates" },
];

const ROLE_LABEL = {
  caseworker: "Caseworkers",
  sponsor: "Sponsors",
  candidate: "Candidates",
  business: "Sponsors",
};

const FORM_ID = "admin-announcement-form";
const PAGE_SIZE = 10;

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function AdminAnnouncements() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRoles, setTargetRoles] = useState([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [sending, setSending] = useState(false);

  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportAdminAnnouncements();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Announcements_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export announcements");
    } finally {
      setExporting(false);
    }
  };

  const loadList = useCallback(async (nextPage = 1) => {
    setLoadingList(true);
    try {
      const res = await listAdminAnnouncements({ page: nextPage, limit: PAGE_SIZE });
      const d = res.data?.data || {};
      setItems(d.announcements || []);
      setTotal(d.total || 0);
      setTotalPages(d.totalPages || 1);
      setPage(d.page || nextPage);
    } catch {
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList(1);
  }, [loadList]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setTargetRoles([]);
    setSendEmail(true);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setTitle(a.title || "");
    setMessage(a.message || "");
    setTargetRoles(Array.isArray(a.target_roles) ? a.target_roles : []);
    setSendEmail(a.send_email !== false);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (sending) return;
    setModalOpen(false);
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete the announcement “${a.title}”? This removes it from history.`)) {
      return;
    }
    setDeletingId(a.id);
    try {
      await deleteAdminAnnouncement(a.id);
      toast.success("Announcement deleted");
      // Reload; step back a page if we just removed the last row on this page.
      loadList(items.length === 1 && page > 1 ? page - 1 : page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete announcement");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleRole = (role) => {
    setTargetRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (!targetRoles.length) {
      toast.error("Select at least one audience");
      return;
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      targetRoles,
      sendEmail,
    };

    setSending(true);
    try {
      const res = editingId
        ? await updateAdminAnnouncement(editingId, payload)
        : await sendAdminAnnouncement(payload);
      toast.success(res.data?.message || (editingId ? "Announcement updated" : "Announcement sent"));
      const stayPage = editingId ? page : 1; // new ones appear on page 1 (newest first)
      setModalOpen(false);
      resetForm();
      loadList(stayPage);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-600">
            <RiMegaphoneLine size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-secondary">Announcements</h1>
            <p className="text-sm text-gray-500">
              Send updates to your caseworkers, sponsors, and candidates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting || items.length === 0}
            className="rounded-2xl flex items-center gap-2"
          >
            <RiDownloadLine size={18} />
            {exporting ? "Exporting…" : "Export"}
          </Button>
          <Button onClick={openCreate} className="rounded-2xl flex items-center gap-2">
            <RiAddLine size={18} />
            New announcement
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-black text-secondary uppercase tracking-wide">
            Previous announcements
          </h2>
          <span className="text-xs text-gray-400">{total} total</span>
        </div>

        {loadingList ? (
          <p className="text-sm text-gray-400 py-12 text-center">Loading…</p>
        ) : items.length === 0 ? (
          <div className="py-14 text-center">
            <RiMegaphoneLine size={36} className="mx-auto text-gray-300" />
            <p className="text-sm text-gray-500 mt-3 font-semibold">No announcements yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Click “New announcement” to send your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50/60 border-b border-gray-100">
                  <th className="py-2.5 px-4 font-bold">Date</th>
                  <th className="py-2.5 px-4 font-bold">Title</th>
                  <th className="py-2.5 px-4 font-bold">Audience</th>
                  <th className="py-2.5 px-4 font-bold text-right">Recipients</th>
                  <th className="py-2.5 px-4 font-bold text-center">Email</th>
                  <th className="py-2.5 px-4 font-bold">Sent by</th>
                  <th className="py-2.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 last:border-0 align-top hover:bg-gray-50/50"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500">
                      {formatDateTime(a.createdAt)}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-semibold text-secondary">{a.title}</p>
                      <p className="text-gray-500 line-clamp-2">{a.message}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(a.target_roles || []).map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-700 text-xs font-semibold"
                          >
                            {ROLE_LABEL[r] || r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-secondary">
                      {a.recipients ?? 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {a.send_email ? (
                        <span className="text-green-600 font-semibold">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{a.created_by_name || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          title="Edit & resend"
                          className="p-2 rounded-lg text-gray-500 hover:bg-violet-500/10 hover:text-violet-600 transition-colors"
                        >
                          <RiEdit2Line size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a)}
                          disabled={deletingId === a.id}
                          title="Delete"
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-500/10 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <RiDeleteBin6Line size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loadingList && items.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={PAGE_SIZE}
              onPageChange={loadList}
            />
          </div>
        )}
      </div>

      {/* Create modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId ? "Edit announcement" : "New announcement"}
        subtitle={
          editingId
            ? "Saving re-sends the notification (and email) to the selected audience"
            : "Notify your organisation members by in-app notification (and optional email)"
        }
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="outline" onClick={closeModal} disabled={sending} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              disabled={sending}
              className="rounded-xl flex items-center gap-2"
            >
              <RiSendPlaneFill />
              {sending
                ? editingId
                  ? "Updating…"
                  : "Sending…"
                : editingId
                  ? "Update & resend"
                  : "Send announcement"}
            </Button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Office closure notice"
            required
          />

          <Input
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Write your announcement…"
            required
          />

          <div>
            <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              Audience
            </p>
            <div className="space-y-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={targetRoles.includes(opt.id)}
                    onChange={() => toggleRole(opt.id)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-secondary">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            Also send email to recipients
          </label>
        </form>
      </Modal>
    </div>
  );
}
