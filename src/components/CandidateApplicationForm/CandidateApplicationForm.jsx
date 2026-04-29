import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  APPLICATION_STEP_LABELS,
  getInitialApplicationFormData,
  loadFieldVisibilityFromStorage,
  loadCustomFieldDefinitionsFromStorage,
} from "./initialFormState";
import {
  pruneCustomResponsesToDefinitions,
  candidateRowToApplicationForm,
} from "./applicationFormMapping";
import useCandidate from "../../hooks/useCandidate";
import { getCaseworkers } from "../../services/caseWorker";

const inputClass =
  "mt-1 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-shadow";

/** Single typography for every field label, question, and section heading */
const fieldLabelClass =
  "mb-2 block text-sm font-bold leading-snug tracking-normal text-gray-800";

const sectionHeadingClass =
  "mb-3 mt-1 block border-l-4 border-secondary pl-3 text-sm font-bold leading-snug tracking-normal text-secondary md:col-span-2";

function SectionTitle({ children }) {
  return <h3 className={sectionHeadingClass}>{children}</h3>;
}

function AppInput({
  label,
  name,
  type = "text",
  formData,
  onChange,
  className = "",
  placeholder = "",
  hint = "",
  error = "",
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className={fieldLabelClass}>
        {label}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={formData[name] ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
      />
      {error ? (
        <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] font-bold text-gray-400">{hint}</p>
      ) : null}
    </div>
  );
}

function AppSelect({
  label,
  name,
  formData,
  onChange,
  options,
  placeholder = "Select",
  question,
  error = "",
}) {
  return (
    <div>
      {question ? <p className={fieldLabelClass}>{question}</p> : null}
      <label htmlFor={name} className={fieldLabelClass}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={formData[name] ?? ""}
        onChange={onChange}
        className={`${inputClass} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function AppTextarea({ label, id, value, onChange, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={4}
        className={`${inputClass} min-h-[6rem] resize-y`}
      />
    </div>
  );
}

function YesNo({ label, name, formData, onChange, error = "" }) {
  return (
    <div>
      <span className={fieldLabelClass}>{label}</span>
      <div className="flex flex-wrap gap-4">
        {["Yes", "No"].map((val) => (
          <label
            key={val}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-gray-800"
          >
            <input
              type="radio"
              name={name}
              value={val}
              checked={formData[name] === val}
              onChange={onChange}
              className="accent-secondary"
            />
            {val}
          </label>
        ))}
      </div>
      {error ? (
        <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}

function FormProgress({ step, labels }) {
  const last = Math.max(labels.length - 1, 1);
  return (
    <div className="mb-8">
      <div className="flex justify-between gap-1 overflow-x-auto pb-2 sm:gap-2">
        {labels.map((lbl, idx) => (
          <div
            key={lbl}
            className="flex min-w-[4.5rem] flex-1 flex-col items-center sm:min-w-0"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-10 sm:w-10 sm:text-sm ${idx <= step
                  ? "bg-secondary text-white shadow-md shadow-secondary/20"
                  : "bg-gray-200 text-gray-600"
                }`}
            >
              {idx + 1}
            </div>
            <span
              className={`mt-1.5 text-center text-xs font-bold leading-snug tracking-normal sm:text-sm ${idx <= step ? "text-secondary" : "text-gray-400"
                }`}
            >
              {lbl}
            </span>
          </div>
        ))}
      </div>
      <div className="relative mt-1 h-1 w-full rounded-full bg-gray-200">
        <div
          className="absolute left-0 top-0 h-1 rounded-full bg-secondary transition-all duration-300"
          style={{ width: `${(step / last) * 100}%` }}
        />
      </div>
    </div>
  );
}

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const relationshipOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
  { value: "Civil partnership", label: "Civil partnership" },
  { value: "Other", label: "Other" },
];

const visaTypeOptions = [
  { value: "Visitor", label: "Visitor" },
  { value: "Student", label: "Student" },
  { value: "Work", label: "Work" },
  { value: "Family", label: "Family" },
  { value: "Settlement", label: "Settlement" },
  { value: "Other", label: "Other" },
];

/** All DATE-type fields — empty strings must be converted to null before the API call. */
const DATE_FIELDS = [
  "dob", "issueDate", "expiryDate",
  "startDate", "endDate",
  "parentDob", "parent2Dob",
  "entryDate", "leaveDate",
  "visaEndDate",
];

/** Replace empty strings with null for every date field so PostgreSQL never
 *  receives the literal string "" or "Invalid date". */
function sanitizeForApi(payload) {
  const out = { ...payload };
  for (const key of DATE_FIELDS) {
    const v = out[key];
    if (!v || String(v).trim() === "") {
      out[key] = null;
    }
  }
  return out;
}

/** Per-step required-field validation. Returns { fieldName: "error message" }. */
function validateStep(stepIndex, data) {
  const errs = {};

  if (stepIndex === 0) {
    if (!data.firstName?.toString().trim())
      errs.firstName = "First name is required";
    if (!data.lastName?.toString().trim())
      errs.lastName = "Last name is required";
    if (!data.email?.toString().trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = "Enter a valid email address";
    }
    if (!data.contactNumber?.toString().trim())
      errs.contactNumber = "Contact number is required";
    if (!data.gender)
      errs.gender = "Please select a gender";
  }

  if (stepIndex === 1) {
    if (!data.nationality?.toString().trim()) errs.nationality = "Nationality is required";
    if (!data.dob) errs.dob = "Date of birth is required";

    // If passport number is provided, require details
    if (data.passportNumber?.toString().trim()) {
      if (!data.issuingAuthority?.toString().trim()) errs.issuingAuthority = "Issuing authority is required";
      if (!data.issueDate) errs.issueDate = "Issue date is required";
      if (!data.expiryDate) errs.expiryDate = "Expiry date is required";
    }
  }

  if (stepIndex === 2) {
    if (data.ukLicense === "Yes" && !data.ukStayDuration?.toString().trim()) {
      errs.ukStayDuration = "Please specify duration of stay";
    }
    // Validation for dates if both provided
    if (data.startDate && data.endDate) {
      if (new Date(data.startDate) > new Date(data.endDate)) {
        errs.endDate = "End date cannot be before start date";
      }
    }
  }

  if (stepIndex === 3) {
    if (data.parentName?.toString().trim() && !data.parentRelation?.toString().trim()) {
      errs.parentRelation = "Relationship is required if name is provided";
    }
  }

  if (stepIndex === 5) {
    if (data.visaType && data.visaType !== "Other" && !data.brpNumber?.toString().trim()) {
      errs.brpNumber = "BRP number is required for your visa type";
    }
    if (data.brpNumber?.toString().trim() && !data.visaEndDate) {
      errs.visaEndDate = "Visa expiry date is required";
    }
  }

  return errs;
}

export default function CandidateApplicationForm({
  variant = "candidate",
  embedded = false,
  fieldVisibility: fieldVisibilityProp,
  customFieldDefinitions: customFieldDefinitionsProp,
  formData: controlledFormData,
  setFormData: setControlledFormData,
  onAdminSubmit,
  onAdminCancel,
  containerClassName,
}) {
  const navigate = useNavigate();
  const {
    submitApplication,
    saveApplicationDraft,
    getMyApplication,
    applicationLoading,
  } = useCandidate();

  const [internalForm, setInternalForm] = useState(getInitialApplicationFormData);
  const [step, setStep] = useState(0);
  const [showSecondParent, setShowSecondParent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [caseworkers, setCaseworkers] = useState([]);
  const [caseworkersLoading, setCaseworkersLoading] = useState(false);

  const isControlled =
    controlledFormData !== undefined && setControlledFormData !== undefined;
  const formData = isControlled ? controlledFormData : internalForm;
  const setFormData = isControlled ? setControlledFormData : setInternalForm;

  // ── Load saved draft on mount (candidate, uncontrolled form only) ──────────
  useEffect(() => {
    if (variant !== "candidate" || isControlled) return;

    let cancelled = false;

    async function loadDraft() {
      setDraftLoading(true);
      try {
        const result = await getMyApplication();

        if (cancelled) return;

        if (result.ok && result.application) {
          // Use the existing mapper: it normalises null→"", ISO dates→YYYY-MM-DD
          const restored = candidateRowToApplicationForm({
            first_name: result.application.firstName ?? "",
            last_name: result.application.lastName ?? "",
            email: result.application.email ?? "",
            country_code: "",
            mobile: result.application.contactNumber ?? "",
            application: result.application,
          });
          setInternalForm(restored);
          if (restored.parent2Name) setShowSecondParent(true);
          // Only show "Draft restored" banner if it's NOT already submitted
          if (result.application.status !== "submitted") {
            setDraftRestored(true);
          }
        } else {
          // API ok but no record yet — try localStorage fallback
          tryLocalStorageFallback();
        }
      } catch {
        if (!cancelled) tryLocalStorageFallback();
      } finally {
        if (!cancelled) setDraftLoading(false);
      }
    }

    function tryLocalStorageFallback() {
      try {
        const raw = localStorage.getItem("elitepic_application_draft");
        if (raw) {
          const parsed = JSON.parse(raw);
          setInternalForm((prev) => ({ ...prev, ...parsed }));
          if (parsed.parent2Name) setShowSecondParent(true);
          setDraftRestored(true);
        }
      } catch {
        /* nothing to restore */
      }
    }

    loadDraft();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize showSecondParent based on existing parent2 details (controlled mode)
  if (isControlled && controlledFormData?.parent2Name && !showSecondParent) {
    setShowSecondParent(true);
  }

  useEffect(() => {
    if (variant === "admin") {
      const fetchCaseworkers = async () => {
        setCaseworkersLoading(true);
        try {
          const res = await getCaseworkers(1, 100);
          setCaseworkers(res.data?.data?.caseworkers || []);
        } catch (error) {
          console.error("Failed to fetch caseworkers:", error);
        } finally {
          setCaseworkersLoading(false);
        }
      };
      fetchCaseworkers();
    }
  }, [variant]);

  const resolvedVisibility =
    fieldVisibilityProp === undefined
      ? loadFieldVisibilityFromStorage()
      : fieldVisibilityProp;
  const show = (key) => resolvedVisibility[key] !== false;

  const customFieldDefinitions =
    customFieldDefinitionsProp === undefined
      ? loadCustomFieldDefinitionsFromStorage()
      : customFieldDefinitionsProp;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as soon as the user edits it
    if (formErrors[name]) {
      setFormErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleCustomResponseChange = (fieldId, value) => {
    setFormData((prev) => {
      const prevMap =
        prev.customResponses && typeof prev.customResponses === "object"
          ? prev.customResponses
          : {};
      return {
        ...prev,
        customResponses: { ...prevMap, [fieldId]: value },
      };
    });
  };

  const lastStep = APPLICATION_STEP_LABELS.length - 1;

  const goNext = () => {
    // Only validate on candidate-facing form; admin form skips step validation
    if (variant === "candidate") {
      const errs = validateStep(step, formData);
      if (Object.keys(errs).length > 0) {
        setFormErrors(errs);
        return; // Block advancement until errors are fixed
      }
    }
    setFormErrors({});
    setStep((s) => Math.min(s + 1, lastStep));
  };

  const goPrev = () => {
    setFormErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const defs =
      customFieldDefinitionsProp === undefined
        ? loadCustomFieldDefinitionsFromStorage()
        : customFieldDefinitionsProp;
    const cleaned = pruneCustomResponsesToDefinitions(formData, defs);

    if (variant === "admin" && typeof onAdminSubmit === "function") {
      onAdminSubmit(cleaned);
      return;
    }

    // Candidate variant — validate all required steps before submitting
    const step0Errs = validateStep(0, cleaned);
    const step1Errs = validateStep(1, cleaned);
    const allErrs = { ...step0Errs, ...step1Errs };
    if (Object.keys(allErrs).length > 0) {
      setFormErrors(allErrs);
      // Jump back to the first step that has errors
      if (Object.keys(step0Errs).length > 0) setStep(0);
      else if (Object.keys(step1Errs).length > 0) setStep(1);
      return;
    }

    // Sanitize date fields — convert empty strings to null
    const payload = sanitizeForApi(cleaned);

    setSubmitting(true);
    const result = await submitApplication(payload);
    setSubmitting(false);

    if (result.ok) {
      alert("Application submitted successfully!");
      navigate("/candidate/dashboard");
    } else {
      const msg =
        result.error?.response?.data?.message ||
        result.error?.message ||
        "Submission failed. Please try again.";
      alert(msg);
    }
  };

  const handleSaveDraft = async () => {
    if (variant !== "candidate") return;
    const defs =
      customFieldDefinitionsProp === undefined
        ? loadCustomFieldDefinitionsFromStorage()
        : customFieldDefinitionsProp;
    const cleaned = pruneCustomResponsesToDefinitions(formData, defs);

    // Sanitize dates — save-draft never rejects incomplete forms
    const payload = sanitizeForApi(cleaned);

    const result = await saveApplicationDraft(payload);

    if (result.ok) {
      try {
        localStorage.setItem(
          "elitepic_application_draft",
          JSON.stringify(formData),
        );
      } catch {
        /* ignore storage errors */
      }
      alert("Draft saved successfully.");
    } else {
      // Fall back to local-only save if API fails
      try {
        localStorage.setItem(
          "elitepic_application_draft",
          JSON.stringify(formData),
        );
        alert("Saved locally on this device (server unavailable).");
      } catch {
        alert("Could not save draft.");
      }
    }
  };

  const handleCancel = () => {
    if (variant === "admin") {
      if (typeof onAdminCancel === "function") onAdminCancel();
      return;
    }
    if (window.confirm("Leave this form? Unsaved changes may be lost.")) {
      navigate("/candidate/dashboard");
    }
  };

  const outerClass =
    containerClassName ??
    "mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8";

  return (
    <div className={embedded ? "w-full" : outerClass}>
      {!embedded && (
        <>
          <h1 className="border-b border-gray-100 pb-3 text-2xl font-black tracking-tight text-secondary md:text-3xl">
            Application form
          </h1>
          <p className="mt-2 text-sm font-bold text-gray-500">
            Complete each section. Your progress is stepped so the form stays
            easy to follow.
          </p>
        </>
      )}

      {embedded && variant === "admin" && (
        <p className="mb-4 text-sm font-bold text-gray-500">
          Same application fields as the candidate portal. Data is saved to the
          client record using one shared structure.
        </p>
      )}

      {/* Loading skeleton shown while fetching saved draft */}
      {draftLoading && (
        <div className="flex flex-col items-center gap-3 py-16 text-sm font-bold text-gray-400">
          <svg
            className="h-7 w-7 animate-spin text-secondary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            />
          </svg>
          Restoring your saved progress…
        </div>
      )}

      {!draftLoading && (
        <>
          {/* Draft-restored banner */}
          {draftRestored && variant === "candidate" && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="text-sm font-black text-green-800">Draft restored</p>
                <p className="text-xs font-bold text-green-700 mt-0.5">
                  Your previously saved progress has been loaded. You can continue from where you left off.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDraftRestored(false)}
                className="ml-auto shrink-0 text-green-500 hover:text-green-700"
                aria-label="Dismiss"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <FormProgress step={step} labels={APPLICATION_STEP_LABELS} />

          {/* Validation error banner */}
          {Object.keys(formErrors).length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Please fix the highlighted fields before continuing.
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {step === 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                {show("applicationType") && (
                  <>
                    <SectionTitle>Application type</SectionTitle>
                    <div className="md:col-span-2">
                      <span className={fieldLabelClass}>Type</span>
                      <div className="mt-2 flex flex-wrap gap-6">
                        {["Single", "Family"].map((val) => (
                          <label
                            key={val}
                            className="inline-flex cursor-pointer items-center gap-2 font-bold text-gray-800"
                          >
                            <input
                              type="radio"
                              name="applicationType"
                              value={val}
                              checked={formData.applicationType === val}
                              onChange={handleChange}
                              className="accent-secondary"
                            />
                            {val}
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <SectionTitle>Personal details</SectionTitle>
                {show("firstName") && (
                  <AppInput
                    label="First name *"
                    name="firstName"
                    formData={formData}
                    onChange={handleChange}
                    error={formErrors.firstName}
                  />
                )}
                {show("lastName") && (
                  <AppInput
                    label="Last name *"
                    name="lastName"
                    formData={formData}
                    onChange={handleChange}
                    error={formErrors.lastName}
                  />
                )}
                {show("email") && (
                  <AppInput
                    label="Email *"
                    name="email"
                    type="email"
                    formData={formData}
                    onChange={handleChange}
                    error={formErrors.email}
                  />
                )}
                {show("gender") && (
                  <AppSelect
                    label="Gender *"
                    name="gender"
                    formData={formData}
                    onChange={handleChange}
                    options={genderOptions}
                    error={formErrors.gender}
                  />
                )}
                {show("contactNumber") && (
                  <AppInput
                    label="Contact number *"
                    name="contactNumber"
                    type="tel"
                    formData={formData}
                    onChange={handleChange}
                    error={formErrors.contactNumber}
                  />
                )}
                {show("relationshipStatus") && (
                  <AppSelect
                    label="Relationship status"
                    name="relationshipStatus"
                    formData={formData}
                    onChange={handleChange}
                    options={relationshipOptions}
                  />
                )}
                {show("address") && (
                  <AppInput
                    label="Current address"
                    name="address"
                    formData={formData}
                    onChange={handleChange}
                    className="md:col-span-2"
                  />
                )}

                {variant === "admin" && (
                  <div className="md:col-span-2 space-y-4 border-t border-gray-100 pt-6 mt-2">
                    <SectionTitle>Case Assignment (Admin only)</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label htmlFor="caseworkerId" className={fieldLabelClass}>
                          Assign Caseworker
                        </label>
                        <select
                          id="caseworkerId"
                          name="caseworkerId"
                          value={formData.caseworkerId || ""}
                          onChange={handleChange}
                          className={inputClass}
                          disabled={caseworkersLoading}
                        >
                          <option value="">-- Select Caseworker --</option>
                          {caseworkers.map((cw) => (
                            <option key={cw.id} value={cw.id}>
                              {cw.first_name} {cw.last_name} ({cw.email})
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[10px] text-gray-400 font-bold">
                          This caseworker will be notified and assigned to handle this candidate&apos;s case.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <SectionTitle>Nationality details</SectionTitle>
                {show("nationality") && (
                  <AppInput
                    label="Country of nationality *"
                    name="nationality"
                    formData={formData}
                    onChange={handleChange}
                    error={formErrors.nationality}
                  />
                )}
                {show("birthCountry") && (
                  <AppInput
                    label="Country of birth"
                    name="birthCountry"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("placeOfBirth") && (
                  <AppInput
                    label="Place of birth"
                    name="placeOfBirth"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("dob") && (
                  <AppInput
                    label="Date of birth *"
                    name="dob"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                    error={formErrors.dob}
                  />
                )}
                {show("passportNumber") && (
                  <AppInput
                    label="Passport number"
                    name="passportNumber"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("issuingAuthority") && (
                  <AppInput
                    label="Issuing authority"
                    name="issuingAuthority"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("issueDate") && (
                  <AppInput
                    label="Issue date"
                    name="issueDate"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("expiryDate") && (
                  <AppInput
                    label="Expiry date"
                    name="expiryDate"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("passportAvailable") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Confirm passport available?"
                      name="passportAvailable"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <SectionTitle>Identity Details</SectionTitle>
                {show("nationalIdNumber") && (
                  <AppInput
                    label="National ID number"
                    name="nationalIdNumber"
                    placeholder="Enter ID number"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("idIssuingAuthorityNational") && (
                  <AppInput
                    label="ID issuing authority"
                    name="idIssuingAuthorityNational"
                    placeholder="Enter authority"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}

                {show("otherNationality") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Do you hold, or ever held any other nationality or citizenship?"
                      name="otherNationality"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("ukLicense") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Do you have a UK driving licence?"
                      name="ukLicense"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("medicalTreatment") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Have you ever been given medical treatment in the UK?"
                      name="medicalTreatment"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("ukStayDuration") && (
                  <AppInput
                    label="How long have you lived in the UK?"
                    name="ukStayDuration"
                    placeholder="e.g. 3 years"
                    formData={formData}
                    onChange={handleChange}
                    className="md:col-span-2"
                  />
                )}
                {show("contactNumber2") && (
                  <AppInput
                    label="Alternate contact number"
                    name="contactNumber2"
                    type="tel"
                    formData={formData}
                    onChange={handleChange}
                    className="md:col-span-2"
                  />
                )}

                <SectionTitle>Address Details</SectionTitle>
                {show("previousAddress") && (
                  <AppInput
                    label="Previous full address"
                    name="previousAddress"
                    placeholder="Enter your previous address"
                    formData={formData}
                    onChange={handleChange}
                    className="md:col-span-2"
                  />
                )}
                {show("startDate") && (
                  <AppInput
                    label="When did you start living at this address?"
                    name="startDate"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("endDate") && (
                  <AppInput
                    label="When did you stop living at this address?"
                    name="endDate"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <SectionTitle>Parent one&apos;s details</SectionTitle>
                {show("parentName") && (
                  <AppInput
                    label="Full name"
                    name="parentName"
                    placeholder="Full name"
                    formData={formData}
                    onChange={handleChange}
                    className="md:col-span-2"
                  />
                )}
                {show("parentRelation") && (
                  <AppInput
                    label="What is this person's relationship status to you?"
                    name="parentRelation"
                    placeholder="Relationship"
                    formData={formData}
                    onChange={handleChange}
                    className="md:col-span-2"
                  />
                )}
                {show("parentDob") && (
                  <AppInput
                    label="Date of birth"
                    name="parentDob"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("parentNationality") && (
                  <AppInput
                    label="Country of nationality"
                    name="parentNationality"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("sameNationality") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Have they always had the same nationality?"
                      name="sameNationality"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {!showSecondParent && !formData.parent2Name ? (
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setShowSecondParent(true)}
                      className="w-full rounded-2xl border-2 border-dashed border-secondary/40 bg-secondary/5 py-4 text-sm font-black text-secondary transition-colors hover:border-secondary hover:bg-secondary/10 sm:w-auto sm:px-8"
                    >
                      + Add parent details
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="border-t border-gray-100 pt-6 md:col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className={sectionHeadingClass}>
                          Parent two&apos;s details
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              parent2Name: "",
                              parent2Relation: "",
                              parent2Dob: "",
                              parent2Nationality: "",
                              parent2SameNationality: "",
                            }));
                            setShowSecondParent(false);
                          }}
                          className="text-xs font-black uppercase tracking-wider text-gray-500 underline-offset-4 hover:text-primary hover:underline"
                        >
                          Remove second parent
                        </button>
                      </div>
                    </div>
                    {show("parent2Name") && (
                      <AppInput
                        label="Full name"
                        name="parent2Name"
                        placeholder="Full name"
                        formData={formData}
                        onChange={handleChange}
                        className="md:col-span-2"
                      />
                    )}
                    {show("parent2Relation") && (
                      <AppInput
                        label="What is this person's relationship status to you?"
                        name="parent2Relation"
                        placeholder="Relationship"
                        formData={formData}
                        onChange={handleChange}
                        className="md:col-span-2"
                      />
                    )}
                    {show("parent2Dob") && (
                      <AppInput
                        label="Date of birth"
                        name="parent2Dob"
                        type="date"
                        formData={formData}
                        onChange={handleChange}
                      />
                    )}
                    {show("parent2Nationality") && (
                      <AppInput
                        label="Country of nationality"
                        name="parent2Nationality"
                        formData={formData}
                        onChange={handleChange}
                      />
                    )}
                    {show("parent2SameNationality") && (
                      <div className="md:col-span-2">
                        <YesNo
                          label="Have they always had the same nationality?"
                          name="parent2SameNationality"
                          formData={formData}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 gap-5 md:gap-6">
                <SectionTitle>Travel History</SectionTitle>
                {show("illegalEntry") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Entered the UK illegally?"
                      name="illegalEntry"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("overstayed") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Remained in the UK beyond the validity of your visa or permission to stay?"
                      name="overstayed"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("breach") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Breached the conditions of your leave (worked without permission or received funds without permission)?"
                      name="breach"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("falseInfo") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Given false information when applying for a visa or leave to remain?"
                      name="falseInfo"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("otherBreach") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Breached UK immigration law in any other way?"
                      name="otherBreach"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <SectionTitle>Visa Issues (UK/Other Countries)</SectionTitle>
                {show("refusedVisa") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Refused a visa"
                      name="refusedVisa"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("refusedEntry") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Refused entry at the border"
                      name="refusedEntry"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("refusedPermission") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Refused permission to stay or remain"
                      name="refusedPermission"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("refusedAsylum") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Refused asylum"
                      name="refusedAsylum"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("deported") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Deported"
                      name="deported"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("removed") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Removed"
                      name="removed"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("requiredToLeave") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Required to leave"
                      name="requiredToLeave"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("banned") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Excluded or banned from entry"
                      name="banned"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
                <SectionTitle>Travel History (Other Countries)</SectionTitle>
                {show("visitedOther") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Have you been to any other countries in the past 10 years?"
                      name="visitedOther"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}
                {show("countryVisited") && (
                  <AppInput
                    label="Which country did you visit?"
                    name="countryVisited"
                    placeholder="Country name"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("visitReason") && (
                  <AppInput
                    label="What was the reason for your visit?"
                    name="visitReason"
                    placeholder="Reason"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("entryDate") && (
                  <AppInput
                    label="When did you enter this country?"
                    name="entryDate"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("leaveDate") && (
                  <AppInput
                    label="When did you leave this country?"
                    name="leaveDate"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}

                <SectionTitle>Current Status</SectionTitle>
                {show("visaType") && (
                  <div className="md:col-span-2">
                    <AppSelect
                      question="What UK visa, entry clearance or grant of leave do you have?"
                      label="Type of Visa"
                      name="visaType"
                      formData={formData}
                      onChange={handleChange}
                      options={visaTypeOptions}
                      placeholder="Select type"
                    />
                  </div>
                )}
                {show("brpNumber") && (
                  <AppInput
                    label="Enter your BRP Permit Number"
                    name="brpNumber"
                    placeholder="BRP permit number"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("visaEndDate") && (
                  <AppInput
                    label="What is the end date of your permission to be in the UK?"
                    name="visaEndDate"
                    type="date"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("niNumber") && (
                  <AppInput
                    label="Your National Insurance number"
                    name="niNumber"
                    placeholder="National Insurance number"
                    formData={formData}
                    onChange={handleChange}
                  />
                )}
                {show("sponsored") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Have you been sponsored by a Government or International Scholarship agency within the last 2 months?"
                      name="sponsored"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <SectionTitle>English language</SectionTitle>
                {show("englishProof") && (
                  <div className="md:col-span-2">
                    <YesNo
                      label="Have you provided evidence of your English language ability in a previous application?"
                      name="englishProof"
                      formData={formData}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {customFieldDefinitions.length > 0 && (
                  <>
                    <SectionTitle>Additional information</SectionTitle>
                    <p className="mb-2 text-xs font-bold text-gray-500 md:col-span-2">
                      Extra questions configured by your organisation.
                    </p>
                    {customFieldDefinitions.map((def) => {
                      const label =
                        (def.label && def.label.trim()) || "Additional field";
                      const val =
                        (formData.customResponses &&
                          formData.customResponses[def.id]) ??
                        "";
                      const id = `cust_${def.id}`;
                      const wrapClass =
                        def.type === "textarea" ? "md:col-span-2" : "";
                      if (def.type === "textarea") {
                        return (
                          <div key={def.id} className={wrapClass}>
                            <AppTextarea
                              label={label}
                              id={id}
                              value={val}
                              onChange={(e) =>
                                handleCustomResponseChange(def.id, e.target.value)
                              }
                            />
                          </div>
                        );
                      }
                      const inputType =
                        def.type === "number"
                          ? "number"
                          : def.type === "date"
                            ? "date"
                            : "text";
                      return (
                        <div key={def.id} className={wrapClass}>
                          <label htmlFor={id} className={fieldLabelClass}>
                            {label}
                          </label>
                          <input
                            id={id}
                            type={inputType}
                            value={val}
                            onChange={(e) =>
                              handleCustomResponseChange(def.id, e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                {variant === "candidate" && (
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={submitting || applicationLoading}
                    className="rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 transition-colors hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {applicationLoading ? "Saving…" : "Save draft"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl px-5 py-3 text-sm font-black text-gray-500 transition-colors hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={step === 0}
                  className="rounded-xl bg-gray-200 px-6 py-3 text-sm font-black text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                {step < lastStep && (
                  <button
                    key="next-btn"
                    type="button"
                    onClick={goNext}
                    className="rounded-xl bg-secondary px-6 py-3 text-sm font-black text-white shadow-md shadow-secondary/20 transition-colors hover:bg-secondary-dark"
                  >
                    Next
                  </button>
                )}
                {step >= lastStep && (
                  <button
                    key="submit-btn"
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || applicationLoading}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting
                      ? "Submitting…"
                      : variant === "admin"
                        ? "Save client"
                        : "Submit application"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </> // closes {!draftLoading && (
      )}
    </div>
  );
}
