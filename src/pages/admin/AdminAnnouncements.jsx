import { useState } from "react";
import { motion } from "framer-motion";
import { RiMegaphoneLine, RiSendPlaneFill } from "react-icons/ri";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { sendAdminAnnouncement } from "../../services/adminAnnouncement.service";

const AUDIENCE_OPTIONS = [
  { id: "caseworker", label: "All caseworkers (staff)" },
  { id: "sponsor", label: "All sponsors" },
  { id: "candidate", label: "All candidates" },
];

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRoles, setTargetRoles] = useState([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [sending, setSending] = useState(false);

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

    setSending(true);
    try {
      const res = await sendAdminAnnouncement({
        title: title.trim(),
        message: message.trim(),
        targetRoles,
        sendEmail,
      });
      toast.success(res.data?.message || "Announcement sent");
      setTitle("");
      setMessage("");
      setTargetRoles([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-600">
          <RiMegaphoneLine size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-secondary">Announcements</h1>
          <p className="text-sm text-gray-500">
            Send updates to your caseworkers, sponsors, and candidates within your organisation
          </p>
        </div>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-4 space-y-4"
      >
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Office closure notice"
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
            Audience
          </p>
          <div className="space-y-3">
            {AUDIENCE_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
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
