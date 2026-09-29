import React from "react";

/**
 * Presentational pagination control for tables.
 *
 * Self-contained: inline Tailwind only, no external deps. The parent owns the
 * page state and re-fetches on change — this component is purely about
 * rendering the "Showing X to Y of Z" summary and the Prev / page / Next
 * controls, then calling onPageChange(newPage).
 *
 * Returns null when there is a single page (or fewer) — nothing to paginate.
 *
 * @param {object}   props
 * @param {number}   props.page         Current 1-based page.
 * @param {number}   props.totalPages   Total number of pages.
 * @param {number}   props.total        Total number of records across all pages.
 * @param {number}   props.limit        Page size (records per page).
 * @param {Function} props.onPageChange Called with the next 1-based page number.
 */
export default function Pagination({ page, totalPages, total, limit, onPageChange, hideIfSinglePage = false, className = "" }) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  if (hideIfSinglePage && safeTotalPages <= 1) return null;

  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
  const safeTotal = typeof total === "number" ? Math.max(0, total) : (safeTotalPages > 1 ? safeTotalPages * safeLimit : 0);
  const from = safeTotal === 0 ? 0 : (safePage - 1) * safeLimit + 1;
  const to = safeTotal === 0 ? 0 : Math.min(safePage * safeLimit, safeTotal);

  const goTo = (next) => {
    const clamped = Math.min(Math.max(1, next), safeTotalPages);
    if (clamped !== safePage && typeof onPageChange === "function") {
      onPageChange(clamped);
    }
  };

  // Compact window of page numbers around the current page so the control
  // stays the same width regardless of how many pages exist.
  const windowSize = 5;
  let start = Math.max(1, safePage - Math.floor(windowSize / 2));
  let end = Math.min(safeTotalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = [];
  for (let p = start; p <= end; p += 1) pages.push(p);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p className="text-xs font-bold text-gray-500">
        Showing {from} to {to} of {safeTotal}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(safePage - 1)}
          disabled={safePage <= 1}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            aria-current={p === safePage ? "page" : undefined}
            className={`rounded-lg border px-3 py-1.5 text-xs font-black transition-colors ${
              p === safePage
                ? "border-secondary bg-secondary text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => goTo(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
