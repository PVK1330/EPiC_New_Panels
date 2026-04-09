import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  APPLICATION_STEP_LABELS,
  getInitialApplicationFormData,
} from "./initialFormState";

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
        className={inputClass}
      />
      {hint ? (
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
        className={inputClass}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function YesNo({ label, name, formData, onChange }) {
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

export default function CandidateApplicationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(getInitialApplicationFormData);
  const [showSecondParent, setShowSecondParent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const lastStep = APPLICATION_STEP_LABELS.length - 1;

  const goNext = () => setStep((s) => Math.min(s + 1, lastStep));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Application submitted:", formData);
    alert("Application submitted. Check the console for the payload.");
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        "elitepic_application_draft",
        JSON.stringify(formData)
      );
      alert("Draft saved on this device.");
    } catch {
      alert("Could not save draft.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Leave this form? Unsaved changes may be lost.")) {
      navigate("/candidate/dashboard");
    }
  };

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      <h1 className="border-b border-gray-100 pb-3 text-2xl font-black tracking-tight text-secondary md:text-3xl">
        Application form
      </h1>
      <p className="mt-2 text-sm font-bold text-gray-500">
        Complete each section. Your progress is stepped so the form stays easy to
        follow.
      </p>

      <FormProgress step={step} labels={APPLICATION_STEP_LABELS} />

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
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

            <SectionTitle>Personal details</SectionTitle>
            <AppInput label="First name" name="firstName" formData={formData} onChange={handleChange} />
            <AppInput label="Last name" name="lastName" formData={formData} onChange={handleChange} />
            <AppInput label="Email" name="email" type="email" formData={formData} onChange={handleChange} />
            <AppSelect
              label="Gender"
              name="gender"
              formData={formData}
              onChange={handleChange}
              options={genderOptions}
            />
            <AppInput label="Contact number" name="contactNumber" type="tel" formData={formData} onChange={handleChange} />
            <AppSelect
              label="Relationship status"
              name="relationshipStatus"
              formData={formData}
              onChange={handleChange}
              options={relationshipOptions}
            />
            <AppInput label="Current address" name="address" formData={formData} onChange={handleChange} className="md:col-span-2" />
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <SectionTitle>Nationality details</SectionTitle>
            <AppInput label="Country of nationality" name="nationality" formData={formData} onChange={handleChange} />
            <AppInput label="Country of birth" name="birthCountry" formData={formData} onChange={handleChange} />
            <AppInput label="Place of birth" name="placeOfBirth" formData={formData} onChange={handleChange} />
            <AppInput label="Date of birth" name="dob" type="date" formData={formData} onChange={handleChange} />
            <AppInput label="Passport number" name="passportNumber" formData={formData} onChange={handleChange} />
            <AppInput label="Issuing authority" name="issuingAuthority" formData={formData} onChange={handleChange} />
            <AppInput label="Issue date" name="issueDate" type="date" formData={formData} onChange={handleChange} />
            <AppInput label="Expiry date" name="expiryDate" type="date" formData={formData} onChange={handleChange} />
            <div className="md:col-span-2">
              <YesNo label="Confirm passport available?" name="passportAvailable" formData={formData} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <SectionTitle>Identity Details</SectionTitle>
            <AppInput
              label="National ID card number"
              name="nationalIdCardNumber"
              placeholder="National ID card number"
              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="National ID number"
              name="nationalIdNumber"
              placeholder="National ID number"
              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="ID issuing authority"
              name="idIssuingAuthorityCard"
              placeholder="For national ID card"
              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="ID issuing authority"
              name="idIssuingAuthorityNational"
              placeholder="For national ID number"
              formData={formData}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <YesNo
                label="Do you hold, or ever held any other nationality or citizenship?"
                name="otherNationality"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Do you have a UK driving licence?"
                name="ukLicense"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Have you ever been given medical treatment in the UK?"
                name="medicalTreatment"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <AppInput
              label="How long have you lived in the UK?"
              name="ukStayDuration"
              placeholder="e.g. 3 years"
              formData={formData}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <AppInput
              label="Contact number"
              name="contactNumber2"
              type="tel"
              formData={formData}
              onChange={handleChange}
              className="md:col-span-2"
            />

            <SectionTitle>Address Details</SectionTitle>
            <AppInput
              label="Your previous full address"
              name="previousFullAddress"
              formData={formData}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <AppInput
              label="Previous address"
              name="previousAddress"
              formData={formData}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <AppInput
              label="When did you start living at this address?"
              name="startDate"
              type="date"

              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="When did you stop living at this address?"
              name="endDate"
              type="date"

              formData={formData}
              onChange={handleChange}
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <SectionTitle>Parent one&apos;s details</SectionTitle>
            <AppInput
              label="Full name"
              name="parentName"
              placeholder="Full name"
              formData={formData}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <AppInput
              label="What is this person's relationship status to you?"
              name="parentRelation"
              placeholder="Relationship"
              formData={formData}
              onChange={handleChange}
              className="md:col-span-2"
            />
            <AppInput
              label="Date of birth"
              name="parentDob"
              type="date"

              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="Country of nationality"
              name="parentNationality"
              formData={formData}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <YesNo
                label="Have they always had the same nationality?"
                name="sameNationality"
                formData={formData}
                onChange={handleChange}
              />
            </div>

            {!showSecondParent ? (
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
                <AppInput
                  label="Full name"
                  name="parent2Name"
                  placeholder="Full name"
                  formData={formData}
                  onChange={handleChange}
                  className="md:col-span-2"
                />
                <AppInput
                  label="What is this person's relationship status to you?"
                  name="parent2Relation"
                  placeholder="Relationship"
                  formData={formData}
                  onChange={handleChange}
                  className="md:col-span-2"
                />
                <AppInput
                  label="Date of birth"
                  name="parent2Dob"
                  type="date"
                  formData={formData}
                  onChange={handleChange}
                />
                <AppInput
                  label="Country of nationality"
                  name="parent2Nationality"
                  formData={formData}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <YesNo
                    label="Have they always had the same nationality?"
                    name="parent2SameNationality"
                    formData={formData}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 gap-5 md:gap-6">
            <SectionTitle>Travel History</SectionTitle>
            <div className="md:col-span-2">
              <YesNo
                label="Entered the UK illegally?"
                name="illegalEntry"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Remained in the UK beyond the validity of your visa or permission to stay?"
                name="overstayed"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Breached the conditions of your leave (worked without permission or received funds without permission)?"
                name="breach"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Given false information when applying for a visa or leave to remain?"
                name="falseInfo"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Breached UK immigration law in any other way?"
                name="otherBreach"
                formData={formData}
                onChange={handleChange}
              />
            </div>

            <SectionTitle>Visa Issues (UK/Other Countries)</SectionTitle>
            <div className="md:col-span-2">
              <YesNo label="Refused a visa" name="refusedVisa" formData={formData} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Refused entry at the border"
                name="refusedEntry"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Refused permission to stay or remain"
                name="refusedPermission"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <div className="md:col-span-2">
              <YesNo label="Refused asylum" name="refusedAsylum" formData={formData} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <YesNo label="Deported" name="deported" formData={formData} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <YesNo label="Removed" name="removed" formData={formData} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <YesNo label="Required to leave" name="requiredToLeave" formData={formData} onChange={handleChange} />
            </div>
            <div className="md:col-span-2">
              <YesNo
                label="Excluded or banned from entry"
                name="banned"
                formData={formData}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <SectionTitle>Travel History (Other Countries)</SectionTitle>
            <div className="md:col-span-2">
              <YesNo
                label="Have you been to any other countries in the past 10 years?"
                name="visitedOther"
                formData={formData}
                onChange={handleChange}
              />
            </div>
            <AppInput
              label="Which country did you visit?"
              name="countryVisited"
              placeholder="Country name"
              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="What was the reason for your visit?"
              name="visitReason"
              placeholder="Reason"
              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="When did you enter this country?"
              name="entryDate"
              type="date"

              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="When did you leave this country?"
              name="leaveDate"
              type="date"

              formData={formData}
              onChange={handleChange}
            />

            <SectionTitle>Current Status</SectionTitle>
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
            <AppInput
              label="Enter your BRP Permit Number"
              name="brpNumber"
              placeholder="BRP permit number"
              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="What is the end date of your permission to be in the UK?"
              name="visaEndDate"
              type="date"

              formData={formData}
              onChange={handleChange}
            />
            <AppInput
              label="Your National Insurance number"
              name="niNumber"
              placeholder="National Insurance number"
              formData={formData}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <YesNo
                label="Have you been sponsored by a Government or International Scholarship agency within the last 2 months?"
                name="sponsored"
                formData={formData}
                onChange={handleChange}
              />
            </div>

            <SectionTitle>English language</SectionTitle>
            <div className="md:col-span-2">
              <YesNo label="Have you provided evidence of your English language ability in a previous application?" name="englishProof" formData={formData} onChange={handleChange} />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 transition-colors hover:border-gray-300"
            >
              Save draft
            </button>
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
            {step < lastStep ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-xl bg-secondary px-6 py-3 text-sm font-black text-white shadow-md shadow-secondary/20 transition-colors hover:bg-secondary-dark"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-dark"
              >
                Submit application
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
