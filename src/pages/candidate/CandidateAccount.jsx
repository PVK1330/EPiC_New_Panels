import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import Modal from "../../components/Modal";
import TwoFactorSetup from "../../components/TwoFactorSetup";
import TwoFactorDisable from "../../components/TwoFactorDisable";
import { useToast } from "../../context/ToastContext";
import { setCredentials } from "../../store/slices/authSlice";
import store from "../../store";
import { getToken } from "../../utils/storage";
import {
  fetchCandidateAccount,
  patchCandidatePreferences,
  submitCandidateFeedback,
  postCandidateConsent,
  postCandidateDataDeletionRequest,
  updateUserProfile,
  changeOwnPassword,
} from "../../services/candidateAccountService";

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

function fullNameFromParts(first, last) {
  return `${first || ""} ${last || ""}`.trim();
}

function splitFullName(full) {
  const t = (full || "").trim();
  if (!t) return { first_name: "-", last_name: "-" };
  const parts = t.split(/\s+/).filter(Boolean);
  const first_name = parts[0];
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : first_name;
  return { first_name, last_name };
}

function formatPhoneDisplay(countryCode, mobile) {
  const c = (countryCode || "").trim();
  const m = (mobile || "").trim();
  if (!c && !m) return "";
  if (c && m) return `${c} ${m}`;
  return c || m;
}

function parsePhoneInput(input, fallbackCode) {
  const t = (input || "").trim();
  if (!t) {
    return { country_code: (fallbackCode || "").trim(), mobile: "" };
  }
  const parts = t.split(/\s+/);
  if (parts[0]?.startsWith("+")) {
    const country_code = parts[0];
    const rest = parts.slice(1).join("");
    const mobile = rest.replace(/\D/g, "");
    return { country_code, mobile };
  }
  return {
    country_code: (fallbackCode || "").trim() || "+44",
    mobile: t.replace(/\D/g, ""),
  };
}

function formatConsentDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function apiErrorMessage(error) {
  const d = error?.response?.data;
  const m = d?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.length) return m[0];
  return error?.message || "Something went wrong";
}

const CandidateAccount = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const finalSectionRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const [accountLoading, setAccountLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);

  const [rating, setRating] = useState(4);
  const [expSelected, setExpSelected] = useState(() => new Set(["easy"]));
  const [comments, setComments] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [feedbackSending, setFeedbackSending] = useState(false);

  const [fullName, setFullName] = useState(() =>
    fullNameFromParts(reduxUser?.first_name, reduxUser?.last_name),
  );
  const [email, setEmail] = useState(reduxUser?.email ?? "");
  const [phone, setPhone] = useState("");
  const [savedCountryCode, setSavedCountryCode] = useState("");

  const [caseInfo, setCaseInfo] = useState(null);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState(null);
  const [termsVersion, setTermsVersion] = useState(null);
  const [dataDeletionRequestedAt, setDataDeletionRequestedAt] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [gender, setGender] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [notifDocs, setNotifDocs] = useState(true);
  const [notifStatus, setNotifStatus] = useState(true);
  const [notifPay, setNotifPay] = useState(true);
  const [notifDeadline, setNotifDeadline] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    !!reduxUser?.two_factor_enabled,
  );
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [twoFactorMode, setTwoFactorMode] = useState("setup");

  const [consentSaving, setConsentSaving] = useState(false);
  const [deletionSaving, setDeletionSaving] = useState(false);

  const applyUserToStore = useCallback((u) => {
    if (!u) return;
    const token = getToken();
    if (!token) return;
    const prev = store.getState().auth.user;
    dispatch(
      setCredentials({
        user: {
          ...prev,
          id: u.id ?? prev?.id,
          first_name: u.first_name ?? prev?.first_name,
          last_name: u.last_name ?? prev?.last_name,
          email: u.email ?? prev?.email,
          role_id: u.role_id ?? prev?.role_id,
          role_name: prev?.role_name,
          status: prev?.status,
          gender: u.gender ?? prev?.gender,
          profile_pic: u.profile_pic ?? prev?.profile_pic,
          two_factor_enabled:
            u.two_factor_enabled ?? prev?.two_factor_enabled,
        },
        token,
      }),
    );
  }, [dispatch]);

  const loadAccount = useCallback(async () => {
    setAccountLoading(true);
    try {
      const res = await fetchCandidateAccount();
      const d = res.data?.data;
      if (!d?.user) return;

      const u = d.user;
      setFullName(fullNameFromParts(u.first_name, u.last_name));
      setEmail(u.email || "");
      setPhone(formatPhoneDisplay(u.country_code, u.mobile));
      setSavedCountryCode((u.country_code || "").trim());
      setGender(u.gender || "");
      setProfilePicPreview(u.profile_pic || null);
      setTwoFactorEnabled(!!u.two_factor_enabled);
      applyUserToStore(u);

      const s = d.settings || {};
      setNotifDocs(!!s.notification_document_requests);
      setNotifStatus(!!s.notification_case_status);
      setNotifPay(!!s.notification_payment_reminders);
      setNotifDeadline(!!s.notification_deadline_alerts);
      setTermsAcceptedAt(s.terms_accepted_at || null);
      setTermsVersion(s.terms_version || null);
      setDataDeletionRequestedAt(s.data_deletion_requested_at || null);

      setCaseInfo(d.case || null);

      const lf = d.lastFeedback;
      if (lf) {
        setRating(Number(lf.rating) || 4);
        setExpSelected(new Set(Array.isArray(lf.experience_tags) ? lf.experience_tags : []));
        setComments(typeof lf.comments === "string" ? lf.comments : "");
      } else {
        setRating(4);
        setExpSelected(new Set(["easy"]));
        setComments("");
      }
    } catch (error) {
      showToast({
        variant: "danger",
        message: apiErrorMessage(error),
      });
    } finally {
      setAccountLoading(false);
    }
  }, [applyUserToStore, showToast]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    setFullName(fullNameFromParts(reduxUser?.first_name, reduxUser?.last_name));
    setEmail(reduxUser?.email ?? "");
    setTwoFactorEnabled(!!reduxUser?.two_factor_enabled);
    setGender(reduxUser?.gender || "");
  }, [reduxUser?.first_name, reduxUser?.last_name, reduxUser?.email, reduxUser?.two_factor_enabled, reduxUser?.gender]);

  const toggleExp = (id) => {
    setExpSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const demoDownload = (label) => {
    window.alert(`Demo: "${label}" would download in a live app.`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast({ variant: "danger", message: "File size must be under 5MB" });
        return;
      }
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    const { first_name, last_name } = splitFullName(fullName);
    const { country_code, mobile } = parsePhoneInput(phone, savedCountryCode);
    if (!mobile || String(mobile).length < 6) {
      showToast({
        variant: "danger",
        message: "Enter a valid phone number (include country code, e.g. +44 …).",
      });
      return;
    }
    setProfileSaving(true);
    try {
      const formData = new FormData();
      formData.append("first_name", first_name);
      formData.append("last_name", last_name);
      formData.append("country_code", country_code);
      formData.append("mobile", mobile);
      formData.append("gender", gender);
      if (profilePicFile) {
        formData.append("profile_pic", profilePicFile, profilePicFile.name);
      }

      const res = await updateUserProfile(formData);
      const user = res.data?.data?.user;
      if (user) {
        applyUserToStore(user);
        setFullName(fullNameFromParts(user.first_name, user.last_name));
        setPhone(formatPhoneDisplay(user.country_code, user.mobile));
        setSavedCountryCode((user.country_code || "").trim());
        setGender(user.gender || "");
        setProfilePicPreview(user.profile_pic || null);
        setProfilePicFile(null);
      }
      showToast({ message: "Profile saved." });
    } catch (error) {
      showToast({ variant: "danger", message: apiErrorMessage(error) });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast({
        variant: "danger",
        message: "Enter current and new password.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        variant: "danger",
        message: "New password and confirmation do not match.",
      });
      return;
    }
    setPasswordSaving(true);
    try {
      await changeOwnPassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast({ message: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showToast({ variant: "danger", message: apiErrorMessage(error) });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleNotifToggle = async (key, nextVal) => {
    const payload = {
      notification_document_requests:
        key === "notification_document_requests" ? nextVal : notifDocs,
      notification_case_status:
        key === "notification_case_status" ? nextVal : notifStatus,
      notification_payment_reminders:
        key === "notification_payment_reminders" ? nextVal : notifPay,
      notification_deadline_alerts:
        key === "notification_deadline_alerts" ? nextVal : notifDeadline,
    };
    if (key === "notification_document_requests") setNotifDocs(nextVal);
    if (key === "notification_case_status") setNotifStatus(nextVal);
    if (key === "notification_payment_reminders") setNotifPay(nextVal);
    if (key === "notification_deadline_alerts") setNotifDeadline(nextVal);
    setPrefsSaving(true);
    try {
      await patchCandidatePreferences(payload);
      showToast({ message: "Preferences saved." });
    } catch (error) {
      if (key === "notification_document_requests") setNotifDocs(!nextVal);
      if (key === "notification_case_status") setNotifStatus(!nextVal);
      if (key === "notification_payment_reminders") setNotifPay(!nextVal);
      if (key === "notification_deadline_alerts") setNotifDeadline(!nextVal);
      showToast({ variant: "danger", message: apiErrorMessage(error) });
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setFeedbackSending(true);
    try {
      await submitCandidateFeedback({
        rating,
        experience_tags: Array.from(expSelected),
        comments,
        caseworker_id: selectedStaffId,
      });
      showToast({ message: "Thanks — your feedback has been recorded." });
      setRating(4);
      setExpSelected(new Set(["easy"]));
      setComments("");
    } catch (error) {
      showToast({ variant: "danger", message: apiErrorMessage(error) });
    } finally {
      setFeedbackSending(false);
    }
  };

  const handleRecordConsent = async () => {
    setConsentSaving(true);
    try {
      const res = await postCandidateConsent({ terms_version: "2026-04" });
      const s = res.data?.data?.settings;
      if (s?.terms_accepted_at) setTermsAcceptedAt(s.terms_accepted_at);
      if (s?.terms_version != null) setTermsVersion(s.terms_version);
      showToast({ message: "Your acceptance has been recorded." });
    } catch (error) {
      showToast({ variant: "danger", message: apiErrorMessage(error) });
    } finally {
      setConsentSaving(false);
    }
  };

  const handleDataDeletion = async () => {
    setDeletionSaving(true);
    try {
      const res = await postCandidateDataDeletionRequest();
      const at = res.data?.data?.data_deletion_requested_at;
      if (at) setDataDeletionRequestedAt(at);
      showToast({
        message:
          res.data?.message ||
          "Request received. Our team will follow up in line with policy.",
      });
    } catch (error) {
      showToast({ variant: "danger", message: apiErrorMessage(error) });
    } finally {
      setDeletionSaving(false);
    }
  };

  const consentDateLabel = formatConsentDate(termsAcceptedAt);

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
          {accountLoading ? (
            <p className="text-sm font-bold text-gray-500">Loading…</p>
          ) : (
            <>
              <h2 className="text-base font-black text-gray-900">
                Share your experience
              </h2>
              {caseInfo?.assignedStaff?.length > 0 ? (
                <div className="mb-6 space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500">
                    Select staff to provide feedback for
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {caseInfo.assignedStaff.map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => setSelectedStaffId(staff.id)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-all ${
                          selectedStaffId === staff.id
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            selectedStaffId === staff.id
                              ? "bg-secondary"
                              : "bg-gray-300"
                          }`}
                        />
                        {staff.first_name} {staff.last_name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedStaffId(null)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition-all ${
                        selectedStaffId === null
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      General Service
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400">
                    Application: {caseInfo.caseId}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-bold text-gray-500 mt-1 mb-6 italic">
                  Help us improve the platform with your feedback.
                </p>
              )}

              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                Overall rating
              </label>
              <div className="flex gap-2 mb-2" role="group" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    disabled={feedbackSending}
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
                      disabled={feedbackSending}
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
                disabled={feedbackSending}
                placeholder="Share any specific feedback, suggestions, or comments…"
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-3 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none resize-y min-h-[100px] mb-5"
              />

              <button
                type="button"
                onClick={handleSubmitFeedback}
                disabled={feedbackSending}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-md shadow-primary/20 hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {feedbackSending ? "Submitting…" : "Submit feedback"}
              </button>
            </>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 max-w-5xl">
          <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
              <span aria-hidden>👤</span> Profile information
            </h2>
            {accountLoading ? (
              <p className="text-sm font-bold text-gray-500 py-8">Loading…</p>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    name="profile_pic"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div className="relative group">
                    {profilePicPreview ? (
                      <img
                        src={profilePicPreview}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-secondary/20 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-indigo-500 text-white flex items-center justify-center text-lg font-black shrink-0">
                        {initialsFromName(
                          fullName ||
                            fullNameFromParts(
                              reduxUser?.first_name,
                              reduxUser?.last_name,
                            ),
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {fullName ||
                        fullNameFromParts(
                          reduxUser?.first_name,
                          reduxUser?.last_name,
                        ) ||
                        "Candidate"}
                    </p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">
                      Case:{" "}
                      {caseInfo?.caseId
                        ? caseInfo.caseId
                        : "No case reference yet"}
                    </p>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="mt-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50"
                    >
                      {profilePicPreview ? "Change photo" : "Upload photo"}
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
                      disabled={profileSaving}
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
                      readOnly
                      disabled
                      className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm font-bold text-gray-600 cursor-not-allowed outline-none"
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
                      disabled={profileSaving}
                      placeholder="+44 7700900123"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={profileSaving}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none appearance-none"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-md shadow-primary/20 hover:bg-primary-dark disabled:opacity-60"
                  >
                    {profileSaving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </>
            )}
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
                      disabled={passwordSaving}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm font-bold text-gray-800 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-md shadow-primary/20 hover:bg-primary-dark disabled:opacity-60"
                >
                  {passwordSaving ? "Updating…" : "Update password"}
                </button>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <span aria-hidden>🔐</span> Two-Factor Authentication
              </h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-secondary">
                    {twoFactorEnabled ? "2FA is enabled" : "2FA is disabled"}
                  </p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">
                    {twoFactorEnabled
                      ? "Your account is protected with 2FA"
                      : "Enable 2FA for enhanced security"}
                  </p>
                </div>
                {twoFactorEnabled ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorMode("disable");
                      setTwoFactorModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorMode("setup");
                      setTwoFactorModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-black text-white bg-primary hover:bg-primary-dark transition"
                  >
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-2 flex items-center gap-2">
                <span aria-hidden>🔔</span> Notification preferences
                {prefsSaving ? (
                  <span className="text-[10px] font-bold text-gray-400 normal-case">
                    Saving…
                  </span>
                ) : null}
              </h2>
              {accountLoading ? (
                <p className="text-sm font-bold text-gray-500 py-4">Loading…</p>
              ) : (
                [
                  {
                    key: "notification_document_requests",
                    title: "Document requests",
                    sub: "When caseworker requests a document",
                    on: notifDocs,
                  },
                  {
                    key: "notification_case_status",
                    title: "Case status updates",
                    sub: "When your application stage changes",
                    on: notifStatus,
                  },
                  {
                    key: "notification_payment_reminders",
                    title: "Payment reminders",
                    sub: "Upcoming payment due dates",
                    on: notifPay,
                  },
                  {
                    key: "notification_deadline_alerts",
                    title: "Deadline alerts",
                    sub: "Reminders 48h before deadlines",
                    on: notifDeadline,
                  },
                ].map((row, i, arr) => (
                  <div
                    key={row.key}
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
                      disabled={prefsSaving}
                      onClick={() => handleNotifToggle(row.key, !row.on)}
                      className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors ${
                        row.on ? "bg-secondary" : "bg-gray-200"
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          row.on ? "translate-x-[18px]" : ""
                        }`}
                      />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-[1.25rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <span aria-hidden>📜</span> Consent & terms
              </h2>
              {accountLoading ? (
                <p className="text-sm font-bold text-gray-500">Loading…</p>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed">
                    Our{" "}
                    <button type="button" className="text-secondary font-black hover:underline">
                      Terms of service
                    </button>{" "}
                    and{" "}
                    <button type="button" className="text-secondary font-black hover:underline">
                      Privacy policy
                    </button>
                    {consentDateLabel ? (
                      <>
                        . You confirmed acceptance on{" "}
                        <span className="text-gray-800 font-black">
                          {consentDateLabel}
                        </span>
                        {termsVersion ? (
                          <span className="text-gray-400">
                            {" "}
                            (version {termsVersion})
                          </span>
                        ) : null}
                        .
                      </>
                    ) : (
                      <>
                        .{" "}
                        <span className="text-gray-700 font-black">
                          We do not have a recorded acceptance date for your account yet.
                        </span>
                      </>
                    )}{" "}
                    Your data is processed securely in line with GDPR.
                  </p>
                  <button
                    type="button"
                    onClick={handleRecordConsent}
                    disabled={consentSaving}
                    className="mt-4 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-2 text-xs font-black text-secondary hover:bg-secondary hover:text-white transition-colors disabled:opacity-60"
                  >
                    {consentSaving ? "Recording…" : "Record acceptance"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDataDeletion}
                    disabled={deletionSaving || !!dataDeletionRequestedAt}
                    className="mt-4 ml-0 block text-xs font-black text-red-500 hover:text-red-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {dataDeletionRequestedAt
                      ? `Data deletion requested on ${formatConsentDate(dataDeletionRequestedAt) || "—"}`
                      : deletionSaving
                        ? "Submitting request…"
                        : "Request data deletion"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title=""
        maxWidthClass="max-w-md"
        bodyClassName="p-0"
        footer={null}
      >
        {twoFactorMode === "setup" ? (
          <TwoFactorSetup
            onSetupComplete={() => {
              setTwoFactorEnabled(true);
              setTwoFactorModalOpen(false);
              loadAccount();
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        ) : (
          <TwoFactorDisable
            onDisableComplete={() => {
              setTwoFactorEnabled(false);
              setTwoFactorModalOpen(false);
              loadAccount();
            }}
            onCancel={() => setTwoFactorModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default CandidateAccount;
