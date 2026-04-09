import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Download,
  FileText,
  FolderArchive,
  BarChart3,
  ScrollText,
  BadgeCheck,
  Plane,
  Lock,
  Settings,
  Star,
} from "lucide-react";

const RATING_LABELS = ["", "Needs work", "Fair", "Good", "Very good", "Excellent"];

const EXP_TAGS = [
  { id: "easy", label: "Easy to use", emoji: "✅" },
  { id: "fast", label: "Fast process", emoji: "⚡" },
  { id: "support", label: "Great support", emoji: "💬" },
  { id: "guidance", label: "Clear guidance", emoji: "📋" },
];

const PACK_ITEMS = [
  {
    icon: FileText,
    name: "Filled application forms",
    meta: "PDF · Generated 11 Apr 2026 · 2.4 MB",
    available: true,
  },
  {
    icon: FolderArchive,
    name: "Supporting documents bundle",
    meta: "ZIP · All approved documents · 12.8 MB",
    available: true,
  },
  {
    icon: BarChart3,
    name: "Case summary report",
    meta: "PDF · Auto-generated overview",
    available: true,
  },
];

const FINAL_ITEMS = [
  {
    icon: ScrollText,
    name: "Decision letter",
    meta: "Available after UKVI decision",
    available: false,
  },
  {
    icon: BadgeCheck,
    name: "Approval notice",
    meta: "Available upon approval",
    available: false,
  },
  {
    icon: Plane,
    name: "Visa copy / BRP information",
    meta: "Available upon approval",
    available: false,
  },
];

function initialsFromName(name) {
  if (!name || typeof name !== "string") return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const CandidateAccount = () => {
  const user = useSelector((state) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const finalSectionRef = useRef(null);

  const tabParam = searchParams.get("tab");
  const tab = useMemo(() => {
    if (tabParam === "feedback" || tabParam === "profile") return tabParam;
    return "downloads";
  }, [tabParam]);

  const setTab = useCallback(
    (next) => {
      if (next === "downloads") {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: next }, { replace: true });
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (tab === "downloads" && searchParams.get("section") === "final") {
      finalSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [tab, searchParams]);

  const header = useMemo(() => {
    switch (tab) {
      case "feedback":
        return {
          title: "Feedback",
          sub: "Share your experience with ElitePic.",
        };
      case "profile":
        return {
          title: "Profile & settings",
          sub: "Manage your account settings and preferences.",
        };
      default:
        return {
          title: "Downloads",
          sub: "Download your application pack and final documents.",
        };
    }
  }, [tab]);

  const [rating, setRating] = useState(4);
  const [expSelected, setExpSelected] = useState(() => new Set(["easy"]));
  const [comments, setComments] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const toggleExp = (id) => {
    setExpSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("+44 7700 900123");

  useEffect(() => {
    setFullName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user?.name, user?.email]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifDocs, setNotifDocs] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);
  const [notifPay, setNotifPay] = useState(true);
  const [notifDeadline, setNotifDeadline] = useState(false);

  const demoDownload = (label) => {
    window.alert(`Demo: "${label}" would download in a live app.`);
  };

  return (
    <div className="pb-10 animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
          {header.title}
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">{header.sub}</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: "downloads", label: "Downloads", icon: Download },
          { id: "feedback", label: "Feedback", icon: Star },
          { id: "profile", label: "Profile & settings", icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all ${
              tab === id
                ? "border-secondary bg-secondary text-white shadow-md shadow-secondary/20"
                : "border-gray-200 bg-white text-gray-600 hover:border-primary/30 hover:text-primary"
            }`}
          >
            <Icon size={16} strokeWidth={2.5} className="shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {tab === "downloads" && (
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 mb-3">
              <span className="text-base leading-none" aria-hidden>
                📦
              </span>
              Application pack
            </h2>
            <div className="space-y-2.5">
              {PACK_ITEMS.map((row) => (
                <div
                  key={row.name}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-secondary/25 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <row.icon size={24} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900">{row.name}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">
                      {row.meta}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => demoDownload(row.name)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2.5 text-xs font-black text-secondary transition-all hover:bg-secondary hover:text-white shrink-0"
                  >
                    <Download size={16} strokeWidth={2.5} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section ref={finalSectionRef}>
            <h2 className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-500 mb-3">
              <span className="text-base leading-none" aria-hidden>
                📥
              </span>
              Final documents
              <span className="normal-case font-bold tracking-normal rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-500">
                Available after decision
              </span>
            </h2>
            <div className="space-y-2.5">
              {FINAL_ITEMS.map((row) => (
                <div
                  key={row.name}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 opacity-90 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-200/80 text-gray-500">
                    <row.icon size={24} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-800">{row.name}</p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">
                      {row.meta}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-black text-gray-500 shrink-0">
                    <Lock size={12} strokeWidth={2.5} />
                    Locked
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === "feedback" && (
        <div className="max-w-xl rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-base font-black text-gray-900">
            Share your experience
          </h2>
          <p className="text-sm font-bold text-gray-500 mt-1 mb-6">
            Help us improve the platform with your feedback.
          </p>

          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
            Overall rating
          </label>
          <div className="flex gap-2 mb-2" role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-3xl leading-none transition-transform hover:scale-110 ${
                  n <= rating ? "" : "grayscale opacity-40"
                }`}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-sm font-black text-amber-600 mb-6">
            {rating} out of 5 — {RATING_LABELS[rating]}
          </p>

          <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
            Experience feedback
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
            {EXP_TAGS.map((tag) => {
              const on = expSelected.has(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleExp(tag.id)}
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-sm font-bold transition-all ${
                    on
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-1.5" aria-hidden>
                    {tag.emoji}
                  </span>
                  {tag.label}
                </button>
              );
            })}
          </div>

          <label
            htmlFor="feedback-comments"
            className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2"
          >
            Comments
          </label>
          <textarea
            id="feedback-comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share any specific feedback, suggestions, or comments…"
            rows={5}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-3 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-y min-h-[100px] mb-5"
          />

          {feedbackSent ? (
            <p className="text-sm font-black text-emerald-600">
              Thanks — your feedback has been recorded (demo).
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setFeedbackSent(true)}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors"
            >
              Submit feedback
            </button>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 max-w-5xl">
          <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
              <span aria-hidden>👤</span> Profile information
            </h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-indigo-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                {initialsFromName(fullName || user?.name)}
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">
                  {fullName || user?.name || "Candidate"}
                </p>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  Case: VT-2024-0841
                </p>
                <button
                  type="button"
                  onClick={() =>
                    window.alert("Demo: photo upload would open here.")
                  }
                  className="mt-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50"
                >
                  Change photo
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => window.alert("Demo: profile changes saved.")}
                className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
              >
                Save changes
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                <span aria-hidden>🔒</span> Change password
              </h2>
              <div className="space-y-4">
                {[
                  ["Current password", currentPassword, setCurrentPassword],
                  ["New password", newPassword, setNewPassword],
                  [
                    "Confirm new password",
                    confirmPassword,
                    setConfirmPassword,
                  ],
                ].map(([label, val, setVal]) => (
                  <div key={label}>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
                      {label}
                    </label>
                    <input
                      type="password"
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (newPassword && newPassword !== confirmPassword) {
                      window.alert("New password and confirmation do not match.");
                      return;
                    }
                    window.alert("Demo: password updated.");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
                >
                  Update password
                </button>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-2 flex items-center gap-2">
                <span aria-hidden>🔔</span> Notification preferences
              </h2>
              {[
                {
                  title: "Document requests",
                  sub: "When caseworker requests a document",
                  on: notifDocs,
                  set: setNotifDocs,
                },
                {
                  title: "Case status updates",
                  sub: "When your application stage changes",
                  on: notifStatus,
                  set: setNotifStatus,
                },
                {
                  title: "Payment reminders",
                  sub: "Upcoming payment due dates",
                  on: notifPay,
                  set: setNotifPay,
                },
                {
                  title: "Deadline alerts",
                  sub: "Reminders 48h before deadlines",
                  on: notifDeadline,
                  set: setNotifDeadline,
                },
              ].map((row, i, arr) => (
                <div
                  key={row.title}
                  className={`flex items-center justify-between gap-3 py-3 ${
                    i < arr.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {row.title}
                    </p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">
                      {row.sub}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.on}
                    onClick={() => row.set(!row.on)}
                    className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors ${
                      row.on ? "bg-secondary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        row.on ? "translate-x-[18px]" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <span aria-hidden>📜</span> Consent & terms
              </h2>
              <p className="text-sm font-bold text-gray-500 leading-relaxed">
                You agreed to our{" "}
                <button
                  type="button"
                  className="text-secondary font-black hover:underline"
                >
                  Terms of service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-secondary font-black hover:underline"
                >
                  Privacy policy
                </button>{" "}
                on 5 Apr 2026. Your data is processed securely in line with GDPR.
              </p>
              <button
                type="button"
                onClick={() =>
                  window.alert(
                    "Demo: data deletion request would be submitted to support.",
                  )
                }
                className="mt-4 text-xs font-black text-red-500 hover:text-red-600"
              >
                Request data deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateAccount;
