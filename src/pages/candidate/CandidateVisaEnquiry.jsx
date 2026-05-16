import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/Button";
import Input from "../../components/Input";
import CaseWorkflowProgress from "../../components/case/CaseWorkflowProgress";
import { IMMIGRATION_CASE_STEPS, DEFAULT_CASE_STAGE } from "../../constants/immigrationCaseProcess";
import { submitApplication, saveApplicationDraft } from "../../services/candidateApi";

const VISA_OPTIONS = [
  "Skilled Worker",
  "Student Visa",
  "ILR",
  "Graduate Visa",
  "Family Visa",
  "Visitor Visa",
  "Global Talent",
  "Other",
];

/**
 * Step 1 — Client enquiry: candidate describes visa need (Standard Immigration Case Process).
 */
export default function CandidateVisaEnquiry() {
  const navigate = useNavigate();
  const [visaType, setVisaType] = useState("");
  const [enquiry, setEnquiry] = useState("");
  const [nationality, setNationality] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visaType.trim()) {
      toast.error("Please select a visa type");
      return;
    }
    if (!enquiry.trim()) {
      toast.error("Please describe your immigration query");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        visaType,
        nationality: nationality.trim() || null,
        enquiryNotes: enquiry.trim(),
        status: "submitted",
        workflowStage: DEFAULT_CASE_STAGE,
      };
      try {
        await submitApplication(payload);
      } catch {
        await saveApplicationDraft({ ...payload, status: "draft" });
        await submitApplication(payload);
      }
      toast.success("Visa enquiry submitted. Your caseworker will contact you for consultation.");
      navigate("/candidate/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Could not submit enquiry");
    } finally {
      setSaving(false);
    }
  };

  const stepOne = IMMIGRATION_CASE_STEPS[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Step {stepOne.order} of 16</p>
        <h1 className="text-2xl font-bold text-secondary mt-1">{stepOne.title}</h1>
        <p className="text-sm text-gray-500 mt-2">{stepOne.description}</p>
      </div>

      <CaseWorkflowProgress
        caseRecord={{ caseStage: DEFAULT_CASE_STAGE }}
        compact={false}
      />

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5"
      >
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-500">Visa type</label>
          <select
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-semibold text-secondary"
            required
          >
            <option value="">Select visa category</option>
            {VISA_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Nationality (optional)"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          placeholder="e.g. Indian, Nigerian, British"
        />

        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-500">Your immigration query</label>
          <textarea
            value={enquiry}
            onChange={(e) => setEnquiry(e.target.value)}
            rows={5}
            required
            placeholder="Describe your situation, timelines, and what you need help with…"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium text-secondary resize-y min-h-[120px]"
          />
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          After you submit, your firm follows the standard process: consultation → documents →
          application preparation → submission → biometrics → decision → case closure.
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate("/candidate/dashboard")}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Submitting…" : "Submit visa enquiry"}
          </Button>
        </div>
      </form>
    </div>
  );
}

