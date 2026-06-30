import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Button from "../Button";
import Input from "../Input";
import DatePicker from "../DatePicker";
import NationalitySelect from "../NationalitySelect";

const priorityLevels = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

function CaseworkerMultiSelect({ options, value, onChange, error }) {
  const [open, setOpen] = useState(false);

  const toggleId = (id) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else if (value.length < 2) {
      onChange([...value, id]);
    }
  };

  const summaryText = value.length
    ? value.map((id) => { const o = options.find((x) => x.id === id); return o ? `${o.name} (${o.id})` : id; }).join(" · ")
    : "";

  return (
    <div className="relative md:col-span-2 space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Caseworker Assignment <span className="text-red-500">*</span>
        <span className="text-gray-400 font-normal ml-1">(1–2 workers)</span>
      </label>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-left text-sm bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all ${error ? "border-red-500" : "border-slate-200"}`}>
        <span className={value.length ? "text-gray-900 font-semibold" : "text-gray-400"}>
          {value.length ? summaryText : "Choose caseworkers…"}
        </span>
        <span className="text-xs font-bold text-gray-400 tabular-nums shrink-0">{value.length}/2</span>
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-default bg-transparent" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute z-[70] left-0 right-0 mt-1 border border-gray-200 rounded-xl bg-white shadow-xl py-1 max-h-60 overflow-y-auto">
            {options.map((o) => {
              const checked = value.includes(o.id);
              const disabled = !checked && value.length >= 2;
              return (
                <label key={o.id} className={`flex items-center gap-3 px-3 py-2.5 text-sm border-b border-gray-50 last:border-0 ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-secondary/5"}`}>
                  <input type="checkbox" className="accent-secondary rounded border-gray-300" checked={checked} disabled={disabled} onChange={() => toggleId(o.id)} />
                  <span className="font-semibold text-gray-800">{o.name}</span>
                  <span className="text-xs font-mono text-gray-500 ml-auto">{o.id}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
      {value.length > 0 && (
        <p className="text-xs text-gray-600 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
          <span className="font-bold text-secondary">Assigned:</span>{" "}
          {value.map((id) => { const o = options.find((x) => x.id === id); return o ? `${o.name} — ${o.id}` : id; }).join(" · ")}
        </p>
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

function AdminCaseFormModal({
  title,
  subtitle,
  formData,
  errors,
  setErrors,
  isLoading,
  onChange,
  onSubmit,
  onClose,
  onCaseworkerIdsChange,
  candidates = [],
  sponsors = [],
  visaTypes = [],
  petitionTypes = [],
  caseworkers = [],
  departments = [],
  setFormData,
}) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-secondary">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-black text-secondary mb-4">Candidate Information</h4>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Candidate <span className="text-red-500">*</span></label>
                  <select name="candidateId" value={formData.candidateId}
                    onChange={(e) => {
                      const selectedCandidate = candidates.find((c) => c.id === parseInt(e.target.value));
                      setFormData((prev) => ({ ...prev, candidateId: e.target.value, candidateName: selectedCandidate ? `${selectedCandidate.first_name} ${selectedCandidate.last_name}` : "" }));
                      if (errors.candidateId) setErrors((prev) => ({ ...prev, candidateId: "" }));
                    }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all ${errors.candidateId ? "border-red-500" : "border-slate-200"}`}>
                    <option value="">Select candidate</option>
                    {candidates.map((c, idx) => <option key={`${c.id}-${idx}`} value={c.id}>{c.first_name} {c.last_name}</option>)}
                  </select>
                  {errors.candidateId && <span className="text-xs text-red-500">{errors.candidateId}</span>}
                </div>
                <Input label="Candidate Name" name="candidateName" value={formData.candidateName} onChange={onChange} placeholder="Auto-filled from selection" disabled />
                <NationalitySelect label="Nationality" name="nationality" value={formData.nationality} onChange={onChange} placeholder="Select nationality" />
                <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={onChange} placeholder="e.g. Software Engineer" />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <select name="department" value={formData.department} onChange={onChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all">
                    <option value="">Select department</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-black text-secondary mb-4">Business Information</h4>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Sponsor <span className="text-red-500">*</span></label>
                  <select name="businessId" value={formData.businessId}
                    onChange={(e) => {
                      const selectedSponsor = sponsors.find((s) => s.id === parseInt(e.target.value));
                      setFormData((prev) => ({ ...prev, businessId: e.target.value, businessName: selectedSponsor ? `${selectedSponsor.first_name} ${selectedSponsor.last_name}` : "" }));
                      if (errors.businessId) setErrors((prev) => ({ ...prev, businessId: "" }));
                    }}
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all ${errors.businessId ? "border-red-500" : "border-slate-200"}`}>
                    <option value="">Select sponsor</option>
                    {sponsors.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                  </select>
                  {errors.businessId && <span className="text-xs text-red-500">{errors.businessId}</span>}
                </div>
                <Input label="Business Name" name="businessName" value={formData.businessName} onChange={onChange} placeholder="Auto-filled from selection" disabled />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">Case Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Visa Type <span className="text-red-500">*</span></label>
                <select name="visaTypeId" value={formData.visaTypeId} onChange={onChange}
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all ${errors.visaTypeId ? "border-red-500" : "border-slate-200"}`}>
                  <option value="">Select visa type</option>
                  {visaTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {errors.visaTypeId && <span className="text-xs text-red-500">{errors.visaTypeId}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Petition Type</label>
                <select name="petitionTypeId" value={formData.petitionTypeId} onChange={onChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all">
                  <option value="">Select type</option>
                  {petitionTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Priority Level <span className="text-red-500">*</span></label>
                <select name="priority" value={formData.priority} onChange={onChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all">
                  {priorityLevels.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <DatePicker label="Target Submission Date" name="targetSubmissionDate" value={formData.targetSubmissionDate} onChange={onChange} error={errors.targetSubmissionDate} min={new Date().toISOString().split("T")[0]} required />
              <Input label="LCA Number" name="lcaNumber" value={formData.lcaNumber} onChange={onChange} placeholder="e.g. I-200-24001" />
              <Input label="Receipt Number" name="receiptNumber" value={formData.receiptNumber} onChange={onChange} placeholder="e.g. EAC240..." />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">Caseworker Assignment</h4>
            <p className="text-xs font-bold text-gray-500 mb-3 -mt-2">Optional on create — admins receive a task to assign caseworkers if left empty.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CaseworkerMultiSelect
                options={caseworkers.length > 0 ? caseworkers.map((c) => ({ id: c.id, name: `${c.first_name} ${c.last_name}` })) : []}
                value={formData.assignedCaseworkerIds || []}
                onChange={onCaseworkerIdsChange}
                error={errors.assignedCaseworkers} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black text-secondary mb-4">Financial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Salary Offered ($)" name="salaryOffered" type="number" min="0" value={formData.salaryOffered} onChange={onChange} error={errors.salaryOffered} placeholder="Annual salary" />
              <Input label="Total Amount ($)" name="totalAmount" type="number" min="0" step="0.01" value={formData.totalAmount} onChange={onChange} error={errors.totalAmount} placeholder="Total fee" required />
              <Input label="Paid Amount ($)" name="paidAmount" type="number" min="0" step="0.01" value={formData.paidAmount} onChange={onChange} error={errors.paidAmount} placeholder="Amount paid so far" />
              <Input label="CCL fee (£) — amount candidate must pay" name="proposedAmount" type="number" min="0" step="0.01" value={formData.proposedAmount} onChange={onChange} error={errors.proposedAmount} placeholder="e.g. 1500.00" />
            </div>
            <p className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-2">
              Sets the Client Care Letter fee issued to the candidate. This is the amount they must pay.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea name="notes" value={formData.notes} onChange={onChange} rows={3} placeholder="Any notes or comments..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : title.includes("Edit") ? "Save Changes" : "Create Case"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default AdminCaseFormModal;
