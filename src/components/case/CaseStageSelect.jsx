import { IMMIGRATION_CASE_STEPS } from "../../constants/immigrationCaseProcess";

/**
 * Dropdown to change case workflow stage (16 steps).
 */
export default function CaseStageSelect({
  value,
  onChange,
  disabled = false,
  className = "",
  id = "case-stage-select",
}) {
  return (
    <select
      id={id}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 ${className}`}
    >
      {IMMIGRATION_CASE_STEPS.map((step) => (
        <option key={step.id} value={step.id}>
          {step.order}. {step.title}
        </option>
      ))}
    </select>
  );
}
