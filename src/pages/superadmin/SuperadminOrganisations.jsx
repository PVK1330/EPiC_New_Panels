import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  RiSearchLine,
  RiFilter3Line,
  RiErrorWarningLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiLoginBoxLine,
  RiAddLine,
  RiEyeLine,
  RiBuilding2Line,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCloseCircleLine,
  RiFileExcel2Line,
  RiFilePdf2Line,
  RiLoader4Line,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import CreateOrganizationModal from "../../components/superadmin/CreateOrganizationModal";
import Button from "../../components/Button";
import Modal from "../../components/common/Modal";
import Input from "../../components/Input";
import TableActionButton from "../../components/common/TableActionButton";
import Pagination from "../../components/common/Pagination";
import {
  fetchOrganisations,
  fetchOrganisationById,
  createOrganisationWithAdmin,
  updateOrganisation,
  deleteOrganisation,
  activateOrganisation,
  markOrganisationAsPaid,
  impersonateOrganisation,
} from "../../services/superadminOrganisation.service";
import { fetchPlans } from "../../services/superadminPlan.service";
import { getOrganisationSubdomainLabel } from "../../utils/organisationHost";
import { getDashboardRouteForUser } from "../../utils/authResponse";
import { getUser, saveImpersonatorSession } from "../../utils/storage";
import { buildTenantHandoffUrl } from "../../utils/organisationHost";
import useDownloads from "../../hooks/useDownloads";

const capitalize = (s) =>
  s && typeof s === "string"
    ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    : "";

const mapApiOrgToRow = (o) => ({
  id: o.id,
  name: o.name,
  slug: o.slug,
  plan: capitalize(o.plan?.name || o.plan || "—"),
  plan_id: o.plan?.id ?? o.plan_id ?? "",
  users: Array.isArray(o.users) ? o.users.length : 0,
  status: capitalize(o.status || "trial"),
  country: o.country || "—",
  primaryEmail: o.primaryEmail,
  _raw: o,
});

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all"
  >
    <div className={`p-2.5 rounded-lg border ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
        {title}
      </p>
      <span className="text-2xl font-black text-secondary leading-none">
        {value}
      </span>
    </div>
  </motion.div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="h-6 w-7 bg-gray-100 rounded-lg" />
    </td>
    <td className="px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="space-y-1.5">
          <div className="h-3 w-32 bg-gray-100 rounded" />
          <div className="h-2 w-24 bg-gray-50 rounded" />
        </div>
      </div>
    </td>
    <td className="px-5 py-3">
      <div className="h-5 w-16 bg-gray-100 rounded-md" />
    </td>
    <td className="px-5 py-3">
      <div className="h-3 w-6 bg-gray-100 rounded mx-auto" />
    </td>
    <td className="px-5 py-3">
      <div className="h-5 w-16 bg-gray-100 rounded-full" />
    </td>
    <td className="px-5 py-3">
      <div className="h-7 w-28 bg-gray-100 rounded-lg ml-auto" />
    </td>
  </tr>
);

const SuperadminOrganisations = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [markPaidOrg, setMarkPaidOrg] = useState(null);
  const [markPaidMethod, setMarkPaidMethod] = useState("bank_transfer");
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  // BUG-050: require the org name to be typed before the destructive delete is enabled.
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [blockedHandoffUrl, setBlockedHandoffUrl] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOrg, setViewOrg] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  // Server-side pagination: GET /superadmin/organisations paginates by ?page & ?limit
  // and returns a { total, page, limit, totalPages } meta block alongside the rows.
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit,
    totalPages: 0,
  });

  const {
    busy: downloadBusy,
    exportOrganisationsExcel,
    exportOrganisationsPdf,
  } = useDownloads();

  const handleExportExcel = async () => {
    const result = await exportOrganisationsExcel();
    if (!result.ok) toast.error(result.message || "Excel export failed");
  };

  const handleExportPdf = async () => {
    const result = await exportOrganisationsPdf();
    if (!result.ok) toast.error(result.message || "PDF export failed");
  };

  const loadOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrganisations({ page, limit });
      const payload = res.data?.data ?? res.data ?? {};
      const list = payload.organisations ?? res.data?.organisations ?? [];
      const meta = res.data?.pagination ?? payload.pagination ?? null;
      setOrgs(Array.isArray(list) ? list.map(mapApiOrgToRow) : []);
      setPagination({
        total: meta?.total ?? (Array.isArray(list) ? list.length : 0),
        page: meta?.page ?? page,
        limit: meta?.limit ?? limit,
        totalPages: meta?.totalPages ?? 1,
      });
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e.message ||
          "Failed to load organisations",
      );
      setOrgs([]);
      setPagination({ total: 0, page: 1, limit, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  const tabs = ["All", "Active", "Trial", "Suspended"];

  // Tab + search refine the rows of the current server page on the client. The
  // backend list endpoint does not accept status/search params, so filtering is
  // applied to the page already fetched.
  const filteredOrgs = orgs.filter((org) => {
    const tab = activeTab.toLowerCase();
    const st = (org.status || "").toLowerCase();
    const matchesTab = activeTab === "All" || st === tab.toLowerCase();
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(org.country).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const countByStatus = (status) =>
    orgs.filter((o) => (o.status || "").toLowerCase() === status).length;
  const stats = {
    total: pagination.total || orgs.length,
    active: countByStatus("active"),
    trial: countByStatus("trial"),
    suspended: countByStatus("suspended"),
  };
  const tabCount = (tab) =>
    tab === "All" ? orgs.length : countByStatus(tab.toLowerCase());

  const handleCreateOrg = async (data) => {
    if (!data.adminFirstName?.trim() || !data.adminLastName?.trim()) {
      throw new Error("Administrator first and last name are required");
    }

    const res = await createOrganisationWithAdmin({
      name: data.name.trim(),
      slug: data.slug?.trim() || undefined,
      primaryEmail: data.primaryEmail.trim(),
      country: data.country?.trim() || null,
      plan_id: data.plan_id ? parseInt(data.plan_id, 10) : undefined,
      status: "trial",
      adminEmail: data.adminEmail.trim().toLowerCase(),
      adminFirstName: data.adminFirstName.trim(),
      adminLastName: data.adminLastName.trim(),
      adminCountryCode: (data.adminCountryCode || "+44").trim(),
      adminMobile:
        String(data.adminMobile || "").replace(/\s/g, "") || "0000000001",
    });

    const payload = res.data?.data ?? res.data;
    const inner = payload;
    const apiMessage = res.data?.message;

    if (inner?.email_sent === false) {
      const errDetail = inner?.email_error || "unknown";
      console.warn("[createOrg] Welcome email not sent:", errDetail, inner);
    }
    const tempPw = inner?.temporary_password;
    const emailSent = inner?.email_sent === true;
    const emailError = inner?.email_error;
    const ownerNotified = inner?.owner_notified === true;

    if (emailSent) {
      toast.success(
        `Organisation created. Welcome email sent to ${data.adminEmail.trim().toLowerCase()}.`,
        { duration: 8000 },
      );
    } else if (tempPw) {
      toast.success(
        `Organisation created.\n\nAdmin login:\nEmail: ${data.adminEmail.trim().toLowerCase()}\nPassword: ${tempPw}`,
        { duration: 20000 },
      );
      toast.error(
        emailError === "mail_not_configured"
          ? "SMTP is not configured. Set Superadmin → Settings → Connectivity (SMTP), or EMAIL_USER/EMAIL_PASS in .env."
          : ownerNotified
            ? `Welcome email could not be delivered${emailError ? ` (${emailError})` : ""}. A failure notice was sent to your SMTP inbox — check ${data.adminEmail.trim().toLowerCase()} and share the password above if needed.`
            : `Welcome email was not sent${emailError ? `: ${emailError}` : ""}. Share the password above manually.`,
        { duration: 12000 },
      );
    } else {
      toast.success(apiMessage || `Organisation and admin created.`);
      if (!emailSent) {
        toast.error(
          emailError === "mail_not_configured"
            ? "SMTP not configured — admin could not receive credentials by email."
            : ownerNotified
              ? `Welcome email failed${emailError ? `: ${emailError}` : ""}. A delivery failure notice was sent to your SMTP inbox.`
              : `Welcome email failed${emailError ? `: ${emailError}` : ""}.`,
          { duration: 10000 },
        );
      }
    }
    await loadOrgs();
  };

  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await fetchPlans();
      const list = (res.data?.data?.plans || []).filter(
        (p) => p.status === "active",
      );
      setPlans(list);
    } catch {
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Load the real plan list whenever the edit modal opens so the dropdown
  // reflects every plan created on the Plans page (not a hardcoded list).
  useEffect(() => {
    if (isEditModalOpen) loadPlans();
  }, [isEditModalOpen, loadPlans]);

  const handleEditOrg = async () => {
    if (!selectedOrg?.id) return;
    try {
      // Resolve the chosen plan by id so we can persist both the FK link
      // (plan_id) and the human-readable name string the row badge shows.
      const chosen = plans.find(
        (p) => String(p.id) === String(selectedOrg.plan_id),
      );
      await updateOrganisation(selectedOrg.id, {
        name: selectedOrg.name?.trim(),
        plan_id: chosen ? chosen.id : undefined,
        plan: (chosen?.name || selectedOrg.plan || "starter").toLowerCase(),
        status: (selectedOrg.status || "active").toLowerCase(),
      });
      toast.success("Organisation updated");
      await loadOrgs();
      setIsEditModalOpen(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Update failed");
    }
  };

  const handleActivateOrg = async (org) => {
    if (!org?.id) return;
    setActionLoading(true);
    try {
      await activateOrganisation(org.id);
      toast.success(
        `${org.name} activated. The organisation can sign in again.`,
      );
      await loadOrgs();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Activation failed",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!markPaidOrg?.id) return;
    setMarkPaidLoading(true);
    try {
      await markOrganisationAsPaid(markPaidOrg.id, markPaidMethod);
      toast.success(`${markPaidOrg.name} marked as paid. Invoice generated and emailed.`);
      setIsMarkPaidModalOpen(false);
      setMarkPaidOrg(null);
      await loadOrgs();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to mark as paid");
    } finally {
      setMarkPaidLoading(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!selectedOrg?.id) return;
    // BUG-050: guard against accidental deletion — the typed name must match.
    if (deleteConfirmText.trim() !== (selectedOrg?.name || "").trim()) return;
    setActionLoading(true);
    try {
      await deleteOrganisation(selectedOrg.id);
      toast.success(
        "Organisation deleted. You can recreate it with the same admin email/mobile.",
      );
      await loadOrgs();
      setIsDeleteModalOpen(false);
      setDeleteConfirmText("");
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const openView = async (org) => {
    setIsViewModalOpen(true);
    setViewLoading(true);
    setViewOrg(null);
    try {
      const res = await fetchOrganisationById(org.id);
      const detail = res.data?.data?.organisation ?? res.data?.organisation;
      setViewOrg(detail || org._raw || org);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e.message || "Failed to load details",
      );
      setViewOrg(org._raw || org);
    } finally {
      setViewLoading(false);
    }
  };

  const handleLoginAs = async (org) => {
    // Open a blank window synchronously. We omit "noopener" so we can navigate it after the async call completes.
    const win = window.open("", "_blank");
    setActionLoading(true);
    try {
      const res = await impersonateOrganisation(org.id);
      const inner = res.data?.data ?? res.data;
      const ticket = inner?.ticket;
      const user = inner?.user;
      if (!ticket || !user)
        throw new Error(res.data?.message || "Impersonation failed");
      const slug = inner?.organisation?.slug || org.slug;

      const superUser = getUser();
      if (superUser) saveImpersonatorSession(null, superUser);
      const handoffUrl = buildTenantHandoffUrl(slug, {
        ticket,
        nextPath: getDashboardRouteForUser(user),
      });

      if (win) {
        win.location.href = handoffUrl;
        try {
          win.focus();
        } catch (err) {
          // ignore focus error if browser blocks it
        }
      } else {
        // Fallback warning if window.open was still blocked (extremely rare when called synchronously).
        setBlockedHandoffUrl(handoffUrl);
      }
    } catch (e) {
      if (win) win.close();
      toast.error(e?.response?.data?.message || e.message || "Login as failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrg}
      />

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View organisation"
        subtitle={viewOrg?.name || "Details"}
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="secondary"
              onClick={() => setIsViewModalOpen(false)}
            >
              Close
            </Button>
            {/* {viewOrg && (
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleLoginAs(mapApiOrgToRow(viewOrg));
                }}
              >
                <RiLoginBoxLine className="inline mr-1" size={16} />
                Login as
              </Button>
            )} */}
          </div>
        }
      >
        {viewLoading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
        ) : viewOrg ? (
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Name</dt>
              <dd className="font-bold text-secondary text-right">
                {viewOrg.name}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Slug</dt>
              <dd className="font-mono text-xs text-secondary">
                {viewOrg.slug}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Email</dt>
              <dd className="font-medium text-secondary">
                {viewOrg.primaryEmail}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Country</dt>
              <dd className="font-medium text-secondary">
                {viewOrg.country || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Plan</dt>
              <dd className="font-medium text-secondary">
                {viewOrg.plan?.name || viewOrg.plan || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Status</dt>
              <dd className="font-medium text-secondary capitalize">
                {viewOrg.status}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Subdomain</dt>
              <dd className="font-mono text-xs text-primary">
                {getOrganisationSubdomainLabel(viewOrg.slug)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400 font-semibold">Users</dt>
              <dd className="font-medium text-secondary">
                {viewOrg.users?.length ?? 0}
              </dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Organisation"
        subtitle="Update organisation details."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditOrg}
              className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-1">
          <Input
            label="Name"
            value={selectedOrg?.name || ""}
            onChange={(e) =>
              setSelectedOrg({ ...selectedOrg, name: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Plan
              </label>
              <select
                value={selectedOrg?.plan_id ? String(selectedOrg.plan_id) : ""}
                disabled={plansLoading}
                onChange={(e) =>
                  setSelectedOrg({ ...selectedOrg, plan_id: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none disabled:opacity-60"
              >
                {plansLoading && <option value="">Loading plans…</option>}
                {!plansLoading && plans.length === 0 && (
                  <option value="">No active plans found</option>
                )}
                {/* Current plan has no matching active plan row (e.g. legacy
                    free-text plan) — keep it selectable so the value isn't lost. */}
                {!plansLoading &&
                  !selectedOrg?.plan_id &&
                  selectedOrg?.plan && (
                    <option value="">{selectedOrg.plan} (current)</option>
                  )}
                {!plansLoading &&
                  plans.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Status
              </label>
              <select
                value={selectedOrg?.status || "Active"}
                onChange={(e) =>
                  setSelectedOrg({ ...selectedOrg, status: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-secondary outline-none appearance-none"
              >
                <option>Active</option>
                <option>Trial</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Mark as Paid Modal */}
      <Modal
        isOpen={isMarkPaidModalOpen}
        onClose={() => { setIsMarkPaidModalOpen(false); setMarkPaidOrg(null); }}
        title="Mark as Paid"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            This will activate <span className="font-semibold">{markPaidOrg?.name}</span>'s
            subscription, generate a paid invoice, and email it to the organisation.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
            <select
              value={markPaidMethod}
              onChange={(e) => setMarkPaidMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="manual">Manual / Other</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setIsMarkPaidModalOpen(false); setMarkPaidOrg(null); }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkAsPaid}
              disabled={markPaidLoading}
              className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {markPaidLoading ? "Processing…" : "Confirm & Generate Invoice"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteConfirmText("");
        }}
        title="Delete Organisation"
        subtitle="This action cannot be undone."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmText("");
              }}
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600 border-red-600 px-6 py-2 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                actionLoading ||
                deleteConfirmText.trim() !== (selectedOrg?.name || "").trim()
              }
              onClick={handleDeleteOrg}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3">
          <RiErrorWarningLine className="text-red-500 shrink-0" size={20} />
          <p className="text-[10px] text-red-800 font-bold uppercase leading-tight">
            Delete {selectedOrg?.name}? All data will be permanently removed.
          </p>
        </div>
        {/* BUG-050: type-to-confirm gate (AWS/Azure style) */}
        <div className="mt-4">
          <label
            htmlFor="delete-org-confirm"
            className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1"
          >
            Type <span className="text-red-600">{selectedOrg?.name}</span> to
            confirm
          </label>
          <input
            id="delete-org-confirm"
            type="text"
            autoComplete="off"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={selectedOrg?.name || "Organisation name"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
      </Modal>

      {/* Popup Blocked Fallback Modal */}
      <Modal
        isOpen={!!blockedHandoffUrl}
        onClose={() => setBlockedHandoffUrl(null)}
        title="Popup Blocked"
        subtitle="Your browser blocked the login tab."
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="secondary"
              onClick={() => setBlockedHandoffUrl(null)}
              className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest"
            >
              Cancel
            </Button>
            <a
              href={blockedHandoffUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setBlockedHandoffUrl(null)}
              className="inline-flex items-center justify-center px-6 py-2 bg-primary hover:bg-primary/95 text-white border border-primary text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm"
            >
              Open Tab Manually
            </a>
          </div>
        }
      >
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
          <RiErrorWarningLine className="text-blue-500 shrink-0" size={20} />
          <p className="text-xs text-blue-800 font-bold leading-normal">
            To log in automatically next time, please allow popups for this site
            in your browser's address bar. For now, you can open the session
            using the button below.
          </p>
        </div>
      </Modal>

      {/* Branded gradient hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-secondary to-secondary-dark p-8 shadow-lg"
      >
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-12 -right-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/10 border border-white/20 items-center justify-center backdrop-blur-sm">
              <RiBuilding2Line className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-1">
                Organisations
              </h1>
              <p className="text-sm text-white/70 font-medium">
                Manage all client organisations, plans and access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={downloadBusy.exportOrganisationsExcel}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/25 text-sm font-bold backdrop-blur-sm hover:bg-white/20 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {downloadBusy.exportOrganisationsExcel ? (
                <RiLoader4Line size={16} className="animate-spin" />
              ) : (
                <RiFileExcel2Line size={16} />
              )}
              Excel
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={downloadBusy.exportOrganisationsPdf}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white border border-white/25 text-sm font-bold backdrop-blur-sm hover:bg-white/20 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {downloadBusy.exportOrganisationsPdf ? (
                <RiLoader4Line size={16} className="animate-spin" />
              ) : (
                <RiFilePdf2Line size={16} />
              )}
              PDF
            </button>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-secondary text-sm font-bold shadow-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <RiAddLine size={18} /> Create Organisation
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total"
          value={stats.total}
          icon={RiBuilding2Line}
          color="bg-secondary/5 text-secondary border-secondary/10"
          delay={0.05}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={RiCheckboxCircleLine}
          color="bg-green-50 text-green-600 border-green-100"
          delay={0.1}
        />
        <StatCard
          title="Trial"
          value={stats.trial}
          icon={RiTimeLine}
          color="bg-blue-50 text-blue-600 border-blue-100"
          delay={0.15}
        />
        <StatCard
          title="Suspended"
          value={stats.suspended}
          icon={RiCloseCircleLine}
          color="bg-red-50 text-red-600 border-red-100"
          delay={0.2}
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-50 p-1 rounded-lg w-fit border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-white text-primary shadow-sm border border-gray-100"
                  : "text-gray-400 hover:text-secondary"
              }`}
            >
              {tab}
              <span
                className={`inline-flex items-center justify-center min-w-[1.1rem] px-1 rounded-full text-[9px] leading-none py-0.5 ${
                  activeTab === tab
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-200/70 text-gray-400"
                }`}
              >
                {tabCount(tab)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <RiSearchLine
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              placeholder="Search organisations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-secondary w-full md:w-48 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-300 uppercase"
            />
          </div>
          <button
            type="button"
            className="p-1.5 bg-white border border-gray-100 text-gray-400 hover:text-secondary rounded-lg transition-all shadow-sm"
          >
            <RiFilter3Line size={16} />
          </button>
        </div>
      </div>

      {/* Organisations Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[68vh] no-scrollbar">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="sticky top-0 z-10 text-[11px] uppercase text-gray-500 tracking-wider font-black">
              <tr className="border-b border-gray-100 bg-gray-50">
                <th scope="col" className="px-4 py-3 text-left">
                  Sr No
                </th>
                <th scope="col" className="px-5 py-3 text-left">
                  Organisation
                </th>
                <th scope="col" className="px-5 py-3 text-left">
                  Tier
                </th>
                <th scope="col" className="px-5 py-3 text-center">
                  Users
                </th>
                <th scope="col" className="px-5 py-3 text-left">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                      No organisations yet
                    </p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="text-[10px] font-bold uppercase tracking-widest"
                    >
                      <RiAddLine size={16} /> Create your first organisation
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org, index) => (
                  <tr
                    key={org.id}
                    className="hover:bg-gray-50 transition-colors group/row"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center min-w-[26px] h-6 px-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-black text-gray-500 tabular-nums">
                        {(page - 1) * pagination.limit + index + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-black text-xs group-hover/row:bg-primary group-hover/row:text-white transition-all">
                          {org.name.charAt(0)}
                        </div>
                        <div className="min-w-0 max-w-[260px]">
                          <p className="font-bold text-secondary text-sm flex items-center gap-2">
                            <span className="truncate">{org.name}</span>
                            {org.country && org.country !== "—" && (
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight shrink-0">
                                {org.country}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono truncate">
                            {getOrganisationSubdomainLabel(org.slug)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          org.plan === "Enterprise"
                            ? "bg-primary/5 text-primary border-primary/10"
                            : org.plan === "Pro"
                              ? "bg-secondary/5 text-secondary border-secondary/10"
                              : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}
                      >
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-bold text-secondary text-sm">
                      {org.users}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          org.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : org.status === "Trial"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {org.status === "Suspended" && (
                          <TableActionButton
                            label="Activate"
                            onClick={() => handleActivateOrg(org)}
                            disabled={actionLoading}
                          >
                            <RiCheckboxCircleLine
                              size={17}
                              className="text-green-600"
                            />
                          </TableActionButton>
                        )}
                        {(org.status === "Suspended" || org.status === "Trial") && org._raw?.plan_id && (
                          <TableActionButton
                            label="Mark as Paid"
                            onClick={() => {
                              setMarkPaidOrg(org);
                              setMarkPaidMethod("bank_transfer");
                              setIsMarkPaidModalOpen(true);
                            }}
                            disabled={actionLoading}
                          >
                            <RiMoneyDollarCircleLine size={17} className="text-blue-600" />
                          </TableActionButton>
                        )}
                        <TableActionButton
                          label="View"
                          onClick={() => openView(org)}
                        >
                          <RiEyeLine size={17} />
                        </TableActionButton>
                        {/* <TableActionButton
                        label="Login as"
                        onClick={() => handleLoginAs(org)}
                        disabled={actionLoading}
                      >
                        <RiLoginBoxLine size={17} />
                      </TableActionButton> */}
                        <TableActionButton
                          label="Edit"
                          variant="edit"
                          onClick={() => {
                            setSelectedOrg({
                              ...org,
                              plan_id: org.plan_id ? String(org.plan_id) : (org._raw?.plan_id ? String(org._raw.plan_id) : ""),
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <RiEditLine size={17} />
                        </TableActionButton>
                        <TableActionButton
                          label="Delete"
                          variant="danger"
                          onClick={() => {
                            setSelectedOrg(org);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <RiDeleteBin6Line size={17} />
                        </TableActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/30">
          {pagination.totalPages > 1 ? (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          ) : (
            <p className="text-xs font-bold text-gray-400">
              Showing{" "}
              {pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1}{" "}
              to {Math.min(page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} results
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperadminOrganisations;
