import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiFlag, FiSave, FiDownload, FiChevronDown, FiFileText, FiTable } from "react-icons/fi";
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
import { 
  getCaseById, 
  getDocumentsByCaseId, 
  uploadCaseDocument, 
  updateCaseDocumentStatus, 
  deleteCaseDocument, 
  downloadCaseDocument,
  getCaseNotesByCaseId,
  addCaseNote,
  deleteCaseNote,
  getAllCaseTasks,
  getTasksByCaseId,
  addCaseTask,
  updateCaseTask,
  deleteCaseTask,
  exportCaseCSV,
  exportCasePDF
} from "../../services/caseDetailApi";

const DOC_STATUS_LABEL = {
  missing: "Missing",
  uploaded: "Uploaded",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
};
const DOC_STATUS_CLASS = {
  missing: "bg-red-100 text-red-700",
  uploaded: "bg-blue-100 text-blue-800",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
};
const TIMELINE_DOT = {
  case_created: "done", document_uploaded: "done", document_reviewed: "done",
  payment_received: "done", payment_recorded: "done", case_closed: "done",
  note_added: "done", communication_sent: "done", communication_received: "done",
  status_changed: "active", case_updated: "active", case_reopened: "active", assignment_changed: "active",
  deadline_updated: "warn", reminder_sent: "warn",
};

const AdminCaseDetail = () => {
  const { caseId } = useParams();
  const [tab, setTab] = useState(TAB_IDS.overview);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagErr, setFlagErr] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  // State for data
  const [caseData, setCaseData] = useState(null);
  const [caseLoading, setCaseLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const cleanId = caseId ? caseId.replace(/^#/, "") : "";

  // Fetch case detail
  const fetchCaseDetail = useCallback(async (id) => {
    setCaseLoading(true);
    try {
      const res = await getCaseById(id);
      if (res.data?.status === "success") {
        setCaseData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching case detail:", error);
    } finally {
      setCaseLoading(false);
    }
  }, []);

  // Fetch documents
  const fetchDocuments = useCallback(async (id) => {
    setDocsLoading(true);
    try {
      const res = await getDocumentsByCaseId(id);
      if (res.data?.status === "success") {
        setDocuments(res.data.data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  // Fetch notes
  const fetchNotes = useCallback(async (id) => {
    setNotesLoading(true);
    try {
      const res = await getCaseNotesByCaseId(id, 1, 20);
      if (res.data?.status === "success") {
        setNotes(res.data.data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async (id) => {
    setTasksLoading(true);
    try {
      const res = await getTasksByCaseId(id);
      if (res.data?.status === "success") {
        setTasks(res.data.data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Upload document
  const uploadDocumentHandler = useCallback(async (formData) => {
    return uploadCaseDocument(formData);
  }, []);

  // Change document status
  const changeDocumentStatusHandler = useCallback(async (id, data) => {
    const res = await updateCaseDocumentStatus(id, data);
    return res;
  }, []);

  // Download document
  const downloadDocumentHandler = useCallback(async (id) => {
    return downloadCaseDocument(id);
  }, []);

  // Remove document
  const removeDocumentHandler = useCallback(async (id) => {
    const res = await deleteCaseDocument(id);
    return res;
  }, []);

  // Add note
  const addNoteHandler = useCallback(async (data) => {
    const res = await addCaseNote(data);
    return res;
  }, []);

  // Remove note
  const removeNoteHandler = useCallback(async (noteId) => {
    const res = await deleteCaseNote(noteId);
    return res;
  }, []);

  // Add task
  const addTaskHandler = useCallback(async (data) => {
    const res = await addCaseTask(data);
    return res;
  }, []);

  // Edit task
  const editTaskHandler = useCallback(async (id, data) => {
    const res = await updateCaseTask(id, data);
    return res;
  }, []);

  // Remove task
  const removeTaskHandler = useCallback(async (id) => {
    const res = await deleteCaseTask(id);
    return res;
  }, []);

  // Export PDF
  const exportPDFHandler = useCallback(async (id) => {
    return exportCasePDF(id);
  }, []);

  // Export CSV
  const exportCSVHandler = useCallback(async (id) => {
    return exportCaseCSV(id);
  }, []);

  useEffect(() => {
    if (!caseId) return;
    fetchCaseDetail(cleanId);
    fetchTasks(cleanId);
    fetchNotes(cleanId);
    fetchDocuments(cleanId);
  }, [caseId, cleanId, fetchCaseDetail, fetchTasks, fetchNotes, fetchDocuments]);

  // Map tasks from hook to component-expected shape
  const mappedTasks = useMemo(
    () =>
      tasks.map((t) => ({
        id: t.id,
        title: t.title || "Untitled task",
        status: t.status || "pending",
        priority: t.priority || "medium",
        due: t.due_date || null,
        assignee: t.assigned_to || null,
        description: t.description || "",
      })),
    [tasks]
  );

  // Map notes from hook to component-expected shape
  const mappedNotes = useMemo(
    () =>
      notes.map((n) => ({
        id: n.id,
        author: n.author
          ? `${n.author.first_name} ${n.author.last_name}`
          : "Unknown",
        date: n.created_at
          ? new Date(n.created_at).toLocaleDateString()
          : "N/A",
        body: n.content || "",
      })),
    [notes]
  );

  // Map documents from hook to component-expected shape (supplement main caseData docs with real-time list)
  const mappedDocuments = useMemo(() => {
    const source = documents.length > 0 ? documents : caseData?.documents?.list || [];
    return source.map((doc) => ({
      id: doc.id,
      name: doc.documentName || doc.userFileName || "Unnamed Document",
      meta: [
        doc.uploader
          ? `Uploaded by ${doc.uploader.first_name} ${doc.uploader.last_name}`
          : null,
        doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : null,
        doc.documentType || null,
      ]
        .filter(Boolean)
        .join(" · "),
      status: DOC_STATUS_LABEL[doc.status] || doc.status,
      statusClass:
        DOC_STATUS_CLASS[doc.status] || "bg-gray-100 text-gray-600",
      actions: doc.status === "under_review" ? "review" : null,
      rawStatus: doc.status,
      documentUrl: doc.documentUrl,
    }));
  }, [documents, caseData]);

  const data = useMemo(() => {
    if (!caseData) {
      return {
        ...DEFAULT_CASE_DETAIL,
        caseId: caseId || DEFAULT_CASE_DETAIL.caseId,
        tasks: mappedTasks,
        internalNotes: mappedNotes,
        documents: mappedDocuments,
      };
    }

    const {
      overview,
      candidate,
      business,
      visaType,
      caseworkers,
      keyDates,
      financial,
      documents: caseDocuments,
      timeline,
      communications,
    } = caseData;

    const timelineList = (timeline || []).map((item) => ({
      id: item.id,
      dot: TIMELINE_DOT[item.actionType] || "done",
      time: item.actionDate ? new Date(item.actionDate).toLocaleString() : "N/A",
      desc: item.description,
      user: item.performer
        ? `by ${item.performer.first_name} ${item.performer.last_name}`
        : item.isSystemAction
        ? "by System (Auto)"
        : "by Unknown",
    }));

    const paymentHistory = (financial?.payments || []).map((p) => ({
      date: p.paymentDate || "N/A",
      amount: `$${parseFloat(p.amount || 0).toLocaleString()}`,
      method: p.paymentMethod || "N/A",
      invoice: p.invoiceNumber || "N/A",
    }));

    const threadsList = (communications || []).map((c, i) => ({
      id: c.id,
      name: c.sender
        ? `${c.sender.first_name} ${c.sender.last_name}`
        : c.recipientEmail || `Thread ${i + 1}`,
      preview: c.subject || (c.message ? c.message.substring(0, 60) : "No content"),
      active: i === 0,
    }));

    const docSummary = caseDocuments?.summary || {};
    const totalFee = parseFloat(financial?.totalFee || 0);
    const totalPaid = parseFloat(financial?.totalPaid || 0);
    const outstanding = parseFloat(financial?.outstandingBalance || 0);

    return {
      ...DEFAULT_CASE_DETAIL,
      caseId: overview?.caseId,
      candidateName: candidate
        ? `${candidate.first_name} ${candidate.last_name}`
        : "Unknown",
      statusChip: overview?.status || "Unknown",
      visaChip: visaType?.name || "Unknown",
      subtitle: `${business?.businessId || "N/A"} · Assigned to ${
        caseworkers
          ?.map((cw) => `${cw.first_name} ${cw.last_name}`)
          .join(", ") || "Unassigned"
      } · Target: ${keyDates?.targetSubmissionDate || "N/A"}`,
      candidate: {
        fullName: candidate
          ? `${candidate.first_name} ${candidate.last_name}`
          : "Unknown",
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
        contact: business?.sponsor
          ? `${business.sponsor.first_name} ${business.sponsor.last_name}`
          : "N/A",
        caseworker:
          caseworkers
            ?.map((cw) => `${cw.first_name} ${cw.last_name}`)
            .join(", ") || "Unassigned",
      },
      case: {
        visaType: visaType?.name || "Unknown",
        caseStatus: overview?.status || "Unknown",
        dateOpened: keyDates?.submitted || "N/A",
        targetDate: keyDates?.targetSubmissionDate || "N/A",
        visaExpiry: "N/A",
        paymentStatus: outstanding === 0 ? "Fully Paid" : "Partially Paid",
      },
      progress: {
        pct:
          outstanding === 0
            ? 100
            : Math.round((totalPaid / (totalFee || 1)) * 100),
        documents: docSummary.total
          ? `${docSummary.approved ?? 0}/${docSummary.total} approved`
          : "0/0 approved",
        tasks:
          mappedTasks.length > 0
            ? `${mappedTasks.filter((t) => t.status === "completed").length}/${mappedTasks.length} done`
            : "N/A",
        payment: `$${totalPaid.toLocaleString()} paid`,
        daysLeft: "N/A",
      },
      // Use real-time docs from hook when available; fall back to case-detail aggregate
      documents: mappedDocuments.length > 0 ? mappedDocuments : DEFAULT_CASE_DETAIL.documents,
      // Real tasks from separate /api/tasks/case/:id endpoint
      tasks: mappedTasks,
      payments: {
        total: `$${totalFee.toLocaleString()}`,
        paid: `$${totalPaid.toLocaleString()}`,
        balance: `$${outstanding.toLocaleString()}`,
        history: paymentHistory,
        invoiceId: financial?.payments?.[0]?.invoiceNumber || "N/A",
      },
      timeline: timelineList,
      threads: threadsList,
      messages: [],
      // Real notes from /api/case-notes endpoint
      internalNotes: mappedNotes,
      audit: DEFAULT_CASE_DETAIL.audit,
    };
  }, [caseData, caseId, mappedTasks, mappedNotes, mappedDocuments]);

  const displayId = `#${data.caseId}`;

  // ── Export handlers ────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!caseId) return;
    try {
      const cleanId = caseId.replace(/^#/, "");
      const response = await exportPDFHandler(cleanId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Case_${cleanId}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportOpen(false);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };

  const handleExportCSV = async () => {
    if (!caseId) return;
    try {
      const cleanId = caseId.replace(/^#/, "");
      const response = await exportCSVHandler(cleanId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Case_${cleanId}_Data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportOpen(false);
    } catch (error) {
      console.error("CSV Export failed:", error);
    }
  };

  // ── Flag handler ───────────────────────────────────────────────────────────
  const submitFlag = () => {
    if (!flagReason.trim()) {
      setFlagErr("Reason is required");
      return;
    }
    setFlagOpen(false);
    setFlagReason("");
    setFlagErr("");
  };

  // ── Note handlers (passed as props so CaseDetailNotes can wire them up) ───
  const handleAddNote = async (content) => {
    if (!caseId || !content?.trim()) return;
    const cleanId = caseId.replace(/^#/, "");
    await addNoteHandler({ caseId: Number(cleanId), content });
    await fetchNotes(cleanId);
  };

  const handleDeleteNote = async (noteId) => {
    await removeNoteHandler(noteId);
    const cleanId = caseId.replace(/^#/, "");
    await fetchNotes(cleanId);
  };

  // ── Task handlers (passed as props so CaseDetailTasks can wire them up) ───
  const handleAddTask = async (taskData) => {
    const cleanId = caseId.replace(/^#/, "");
    await addTaskHandler({ ...taskData, case_id: cleanId });
    await fetchTasks(cleanId);
  };

  const handleEditTask = async (id, taskData) => {
    await editTaskHandler(id, taskData);
    const cleanId = caseId.replace(/^#/, "");
    await fetchTasks(cleanId);
  };

  const handleDeleteTask = async (id) => {
    await removeTaskHandler(id);
    const cleanId = caseId.replace(/^#/, "");
    await fetchTasks(cleanId);
  };

  // ── Document handlers ──────────────────────────────────────────────────────
  const handleUploadDocument = async (formData) => {
    await uploadDocumentHandler(formData);
    const cleanId = caseId.replace(/^#/, "");
    await fetchDocuments(cleanId);
  };

  const handleChangeDocumentStatus = async (docId, status) => {
    await changeDocumentStatusHandler(docId, { status });
    const cleanId = caseId.replace(/^#/, "");
    await fetchDocuments(cleanId);
  };

  const handleDownloadDocument = async (docId) => {
    const response = await downloadDocumentHandler(docId);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `document_${docId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDeleteDocument = async (docId) => {
    await removeDocumentHandler(docId);
    const cleanId = caseId.replace(/^#/, "");
    await fetchDocuments(cleanId);
  };

  const panels = {
    [TAB_IDS.overview]: <CaseDetailOverview data={data} />,
    [TAB_IDS.documents]: (
      <CaseDetailDocuments
        documents={data.documents}
        caseId={cleanId}
        uploadDocument={handleUploadDocument}
        changeDocumentStatus={handleChangeDocumentStatus}
      />
    ),
    [TAB_IDS.tasks]: (
      <CaseDetailTasks
        tasks={data.tasks}
        loading={tasksLoading}
        onAdd={handleAddTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    ),
    [TAB_IDS.payments]: <CaseDetailPayments payments={data.payments} />,
    [TAB_IDS.timeline]: <CaseDetailTimeline items={data.timeline} />,
    [TAB_IDS.communication]: (
      <CaseDetailCommunication threads={data.threads} messages={data.messages} />
    ),
    [TAB_IDS.notes]: (
      <CaseDetailNotes
        notes={data.internalNotes}
        loading={notesLoading}
        onAdd={handleAddNote}
        onDelete={handleDeleteNote}
      />
    ),
    [TAB_IDS.audit]: <CaseDetailAuditLog rows={data.audit} />,
  };

  return (
    <motion.div
      className="space-y-6 pb-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {caseLoading ? (
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
                  <span className="font-mono text-lg font-black text-primary">
                    {displayId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-green-100 text-green-800">
                    {data.statusChip}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">
                    {data.visaChip}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
                  {data.candidateName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{data.subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0 relative">
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-xl border border-gray-200 shadow-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 pr-2"
                    onClick={() => setExportOpen(!exportOpen)}
                  >
                    <FiDownload size={14} />
                    Export Case
                    <FiChevronDown
                      size={14}
                      className={`ml-1 transition-transform ${exportOpen ? "rotate-180" : ""}`}
                    />
                  </Button>

                  <AnimatePresence>
                    {exportOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setExportOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2"
                        >
                          <button
                            onClick={handleExportPDF}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                          >
                            <FiFileText className="text-red-500" />
                            Comprehensive PDF
                          </button>
                          <button
                            onClick={handleExportCSV}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                          >
                            <FiTable className="text-green-600" />
                            Data Export (CSV)
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl border border-gray-200 shadow-sm"
                  onClick={() => setFlagOpen(true)}
                >
                  <FiFlag size={14} />
                  Flag
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="rounded-xl shadow-md shadow-primary/20"
                >
                  <FiFlag size={14} style={{ display: "none" }} />
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
            onClose={() => {
              setFlagOpen(false);
              setFlagReason("");
              setFlagErr("");
            }}
            title="Flag case"
            maxWidthClass="max-w-md"
            bodyClassName="px-5 py-5"
            footer={
              <>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setFlagOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={submitFlag}
                  className="rounded-xl"
                >
                  Submit flag
                </Button>
              </>
            }
          >
            <Input
              label="Reason"
              name="flagReason"
              value={flagReason}
              onChange={(e) => {
                setFlagReason(e.target.value);
                setFlagErr("");
              }}
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
