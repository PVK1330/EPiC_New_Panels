import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { RiMegaphoneLine, RiSendPlaneFill } from "react-icons/ri";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { fetchOrganisations } from "../../services/superadminOrganisation.service";
import { sendSuperadminAnnouncement } from "../../services/superadminAnnouncement.service";

export default function SuperadminAnnouncements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [selectedOrgIds, setSelectedOrgIds] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const loadOrgs = useCallback(async () => {
    setLoadingOrgs(true);
    try {
      const res = await fetchOrganisations();
      const list = res.data?.data?.organisations ?? res.data?.organisations ?? [];
      setOrgs(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load organisations");
      setOrgs([]);
    } finally {
      setLoadingOrgs(false);
    }
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  const toggleOrg = (id) => {
    setSelectedOrgIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (target === "selected" && !selectedOrgIds.length) {
      toast.error("Select at least one organisation");
      return;
    }

    setSending(true);
    try {
      const res = await sendSuperadminAnnouncement({
        target,
        orgIds: target === "selected" ? selectedOrgIds : [],
        title: title.trim(),
        message: message.trim(),
        sendEmail,
      });
      toast.success(res.data?.message || "Announcement sent");
      setTitle("");
      setMessage("");
      setSelectedOrgIds([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <RiMegaphoneLine size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-secondary">Announcements</h1>
          <p className="text-sm text-gray-500">
            Notify organisation admins by email and in-app notification
          </p>
        </div>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6"
      >
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Scheduled maintenance"
          required
        />

        <div>
          <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y min-h-[140px]"
            placeholder="Write your announcement…"
            required
          />
        </div>

        <div>
          <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
            Send to
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
              <input
                type="radio"
                name="target"
                checked={target === "all"}
                onChange={() => setTarget("all")}
                className="text-primary focus:ring-primary"
              />
              All organisations
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
              <input
                type="radio"
                name="target"
                checked={target === "selected"}
                onChange={() => setTarget("selected")}
                className="text-primary focus:ring-primary"
              />
              Selected organisations
            </label>
          </div>
        </div>

        {target === "selected" && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-4 max-h-52 overflow-y-auto space-y-2">
            {loadingOrgs ? (
              <p className="text-sm text-gray-400">Loading organisations…</p>
            ) : orgs.length === 0 ? (
              <p className="text-sm text-gray-400">No organisations found</p>
            ) : (
              orgs.map((org) => (
                <label
                  key={org.id}
                  className="flex items-center gap-3 py-1.5 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedOrgIds.includes(org.id)}
                    onChange={() => toggleOrg(org.id)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span className="font-semibold text-secondary">{org.name}</span>
                  <span className="text-gray-400 text-xs">({org.slug})</span>
                </label>
              ))
            )}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="rounded text-primary focus:ring-primary"
          />
          Also send email to recipients
        </label>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={sending}
            className="rounded-2xl px-8 flex items-center gap-2"
          >
            <RiSendPlaneFill />
            {sending ? "Sending…" : "Send announcement"}
          </Button>
        </div>
      </form>
    </div>
  );
}
