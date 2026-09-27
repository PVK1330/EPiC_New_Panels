import { Link } from "react-router-dom";

/**
 * Phase 2 UAT 3.3: case references are clickable and open the case file.
 *
 * - role "admin"      → /admin/case-detail/<ref>   (full case page)
 * - role "caseworker" → /caseworker/cases/<ref>    (opens the case detail panel)
 *
 * The backend resolves both current and previous references, so links built
 * from an old CAS-###### value still land on the right case. Clicks do not
 * bubble, so rows that already open something on click are unaffected.
 */
const CASE_ROUTE = {
  admin: "/admin/case-detail/",
  caseworker: "/caseworker/cases/",
};

export default function CaseRefLink({
  caseRef,
  fallbackId,
  role = "admin",
  className = "",
  children,
}) {
  const target = caseRef || fallbackId;
  const label = children ?? caseRef ?? "—";
  if (!target || !CASE_ROUTE[role]) {
    return <span className={className}>{label}</span>;
  }
  return (
    <Link
      to={`${CASE_ROUTE[role]}${encodeURIComponent(String(target))}`}
      onClick={(e) => e.stopPropagation()}
      title="Open case"
      className={`${className} hover:underline underline-offset-2 cursor-pointer`}
    >
      {label}
    </Link>
  );
}
