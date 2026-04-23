import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiFlag, FiSave } from "react-icons/fi";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import CaseDetailTabBar from "../../components/caseDetail/CaseDetailTabBar";
import CaseDetailOverview from "../../components/caseDetail/CaseDetailOverview";
import CaseDetailDocuments from "../../components/caseDetail/CaseDetailDocuments";
import CaseDetailTasks from "../../components/caseDetail/CaseDetailTasks";
import CaseDetailPayments from "../../components/caseDetail/CaseDetailPayments";
import CaseDetailTimeline from "../../components/caseDetail/CaseDetailTimeline";
import CaseDetailCommunication from "../../components/caseDetail/CaseDetailCommunication";
import CaseDetailNotes from "../../components/caseDetail/CaseDetailNotes";
import CaseDetailAuditLog from "../../components/caseDetail/CaseDetailAuditLog";
import { CASE_DETAIL_TABS, TAB_IDS, DEFAULT_CASE_DETAIL } from "../../components/caseDetail/caseDetailData";
import { getCaseDetails } from "../../services/caseDetailApi";

const AdminCaseDetail = () => {
  const { caseId } = useParams();
  const [tab, setTab] = useState(TAB_IDS.overview);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagErr, setFlagErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    if (!caseId) return;
    setLoading(true);
    try {
      // Remove # prefix if present
      const cleanCaseId = caseId.replace(/^#/, '');
      const res = await getCaseDetails(cleanCaseId);
      if (res.data?.status === "success") {
        setCaseData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch case details:", error);
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(() => {
    if (!caseData) {
      return {
        ...DEFAULT_CASE_DETAIL,
        caseId: caseId || DEFAULT_CASE_DETAIL.caseId,
      };
    }

    const { overview, candidate, business, visaType, caseworkers, keyDates, financial, documents, timeline, communications, caseNotes } = caseData;

    return {
      ...DEFAULT_CASE_DETAIL,
      caseId: overview.caseId,
      candidateName: candidate ? `${candidate.first_name} ${candidate.last_name}` : "Unknown",
      statusChip: overview.status || "Unknown",
      visaChip: visaType?.name || "Unknown",
      subtitle: `${business?.businessId || 'N/A'} · Assigned to ${caseworkers?.map(cw => `${cw.first_name} ${cw.last_name}`).join(', ') || 'Unassigned'} · Target: ${keyDates?.targetSubmissionDate || 'N/A'}`,
      candidate: {
        fullName: candidate ? `${candidate.first_name} ${candidate.last_name}` : "Unknown",
        dob: "N/A",
        nationality: "N/A",
        passport: "N/A",
        email: candidate?.email || "N/A",
        phone: candidate?.mobile || "N/A",
      },
      sponsor: {
        company: business?.businessId || "N/A",
        licenceNo: business?.businessId || "N/A",
        licenceStatus: "Active",
        licenceExpiry: "N/A",
        contact: business?.sponsor ? `${business.sponsor.first_name} ${business.sponsor.last_name}` : "N/A",
        caseworker: caseworkers?.map(cw => `${cw.first_name} ${cw.last_name}`).join(', ') || "Unassigned",
      },
      case: {
        visaType: visaType?.name || "Unknown",
        caseStatus: overview.status || "Unknown",
        dateOpened: keyDates?.submitted || "N/A",
        targetDate: keyDates?.targetSubmissionDate || "N/A",
        visaExpiry: "N/A",
        paymentStatus: financial?.outstandingBalance === 0 ? "Fully Paid" : "Partially Paid",
      },
      progress: {
        pct: financial?.outstandingBalance === 0 ? 100 : Math.round(((financial?.totalPaid || 0) / (financial?.totalFee || 1)) * 100),
        documents: documents?.summary || { total: 0, uploaded: 0, approved: 0 },
        tasks: "N/A",
        payment: `$${(financial?.totalPaid || 0).toLocaleString()} paid`,
        daysLeft: "N/A",
      },
      documents: documents?.list || [],
      tasks: [],
      payments: {
        total: `$${(financial?.totalFee || 0).toLocaleString()}`,
        paid: `$${(financial?.totalPaid || 0).toLocaleString()}`,
        balance: `$${(financial?.outstandingBalance || 0).toLocaleString()}`,
        history: financial?.payments || [],
        invoiceId: "N/A",
      },
      timeline: timeline || [],
      threads: communications || [],
      messages: [],
      internalNotes: caseNotes || [],
      audit: [],
    };
  }, [caseData, caseId]);

  const displayId = `#${data.caseId}`;

  const submitFlag = () => {
    if (!flagReason.trim()) {
      setFlagErr("Reason is required");
      return;
    }
    setFlagOpen(false);
    setFlagReason("");
    setFlagErr("");
  };

  const panels = {
    [TAB_IDS.overview]: <CaseDetailOverview data={data} />,
    [TAB_IDS.documents]: <CaseDetailDocuments documents={data.documents} />,
    [TAB_IDS.tasks]: <CaseDetailTasks tasks={data.tasks} />,
    [TAB_IDS.payments]: <CaseDetailPayments payments={data.payments} />,
    [TAB_IDS.timeline]: <CaseDetailTimeline items={data.timeline} />,
    [TAB_IDS.communication]: <CaseDetailCommunication threads={data.threads} messages={data.messages} />,
    [TAB_IDS.notes]: <CaseDetailNotes notes={data.internalNotes} />,
    [TAB_IDS.audit]: <CaseDetailAuditLog rows={data.audit} />,
  };

  return (
    <motion.div className="space-y-6 pb-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading case details...</div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <Link
              to="/admin/cases"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary w-fit transition-colors"
            >
              <FiArrowLeft size={16} />
              Back to cases
            </Link>

            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-mono text-lg font-black text-primary">{displayId}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-green-100 text-green-800">{data.statusChip}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">{data.visaChip}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">{data.candidateName}</h1>
                <p className="text-sm text-gray-500 mt-1">{data.subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Link
                  to="/admin/assign"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Reassign
                </Link>
                <Button type="button" variant="ghost" className="rounded-xl border border-gray-200 shadow-sm" onClick={() => setFlagOpen(true)}>
                  <FiFlag size={14} />
                  Flag
                </Button>
                <Button type="button" variant="primary" className="rounded-xl shadow-md shadow-primary/20">
                  <FiSave size={14} />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <CaseDetailTabBar tabs={CASE_DETAIL_TABS} activeId={tab} onChange={setTab} />

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {panels[tab]}
            </motion.div>
          </AnimatePresence>

          <Modal
            open={flagOpen}
            onClose={() => { setFlagOpen(false); setFlagReason(""); setFlagErr(""); }}
            title="Flag case"
            maxWidthClass="max-w-md"
            bodyClassName="px-5 py-5"
            footer={
              <>
                <Button variant="ghost" type="button" onClick={() => setFlagOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={submitFlag} className="rounded-xl">
                  Submit flag
                </Button>
              </>
            }
          >
            <Input
              label="Reason"
              name="flagReason"
              value={flagReason}
              onChange={(e) => { setFlagReason(e.target.value); setFlagErr(""); }}
              rows={3}
              placeholder="Explain why this case is flagged…"
              required
              error={flagErr}
            />
          </Modal>
        </>
      )}
    </motion.div>
  );
};

export default AdminCaseDetail;
