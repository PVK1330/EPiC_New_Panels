/**
 * Canonical loading skeleton for tables/lists.
 *
 * Standardises the 5 loading variants flagged in the UI audit (skeleton rows /
 * spinner overlay / plain text / full-page spinner / centered block) into one
 * shimmer of placeholder rows that matches the standard cell padding.
 *
 * @param {object} props
 * @param {number} [props.rows]  Placeholder row count.
 * @param {number} [props.cols]  Placeholder column count.
 * @param {string} [props.className]
 */
export default function TableSkeleton({ rows = 6, cols = 5, className = "" }) {
  return (
    <div className={`animate-pulse ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-gray-100 px-4 py-3.5 last:border-0"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className={`h-3.5 rounded bg-gray-100 ${c === 0 ? "w-40" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
