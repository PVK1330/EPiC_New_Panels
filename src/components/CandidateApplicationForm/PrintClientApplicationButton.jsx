import { useState } from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import Modal from "../Modal";
import { getCandidateById } from "../../services/candidateApi";
import CandidateApplicationReadonly, {
  printCandidateApplication,
} from "./CandidateApplicationReadonly";
import { loadCustomFieldDefinitionsFromStorage } from "./initialFormState";
import { downloadCandidateApplicationPdf } from "../../utils/exportCandidateApplicationPdf";
import { useToast } from "../../context/ToastContext";

/**
 * Fetches candidate + application and opens a printable read-only view (admin & caseworker).
 */
export default function PrintClientApplicationButton({
  candidateId,
  label = "Print application",
  className = "",
  showPdf = true,
}) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState("");

  const customDefs = loadCustomFieldDefinitionsFromStorage();

  const handleOpen = async () => {
    if (!candidateId) return;
    setOpen(true);
    setLoading(true);
    setError("");
    try {
      const res = await getCandidateById(candidateId);
      const data = res.data?.data ?? res.data;
      setCandidate(data?.candidate ?? data);
    } catch (e) {
      setError(e.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handlePdf = async () => {
    setExporting(true);
    try {
      const name = candidate
        ? [candidate.first_name, candidate.last_name].filter(Boolean).join("-") || "client"
        : "client";
      await downloadCandidateApplicationPdf(
        "candidate-application-print",
        `application-${name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
      );
      showToast({ message: "PDF downloaded." });
    } catch (e) {
      showToast({ message: e.message || "PDF export failed", variant: "danger" });
    } finally {
      setExporting(false);
    }
  };

  const name = candidate
    ? [candidate.first_name, candidate.last_name].filter(Boolean).join(" ")
    : "Client";

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={!candidateId}
        className={
          className ||
          "inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        }
      >
        <FiPrinter size={14} />
        {label}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={candidate ? `Application — ${name}` : "Client application"}
        maxWidthClass="max-w-4xl"
        bodyClassName="p-0"
      >
        <div className="border-b border-gray-100 px-4 py-3 flex justify-end gap-2 print:hidden">
          {showPdf && (
            <button
              type="button"
              onClick={handlePdf}
              disabled={!candidate || exporting}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-700 inline-flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiDownload size={14} />
              {exporting ? "Generating…" : "Download PDF"}
            </button>
          )}
          <button
            type="button"
            onClick={() => printCandidateApplication()}
            disabled={!candidate}
            className="rounded-xl bg-secondary text-white px-3 py-2 text-xs font-black inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <FiPrinter size={14} />
            Print
          </button>
        </div>
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          {loading && (
            <p className="text-sm text-gray-500 text-center py-8">Loading application…</p>
          )}
          {error && (
            <p className="text-sm text-red-600 text-center py-8">{error}</p>
          )}
          {!loading && !error && candidate && (
            <CandidateApplicationReadonly
              candidate={candidate}
              customFieldDefinitions={customDefs}
              tabId="overview"
            />
          )}
        </div>
      </Modal>
    </>
  );
}
