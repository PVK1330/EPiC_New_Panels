/**
 * Canonical table primitives — single source of truth for the list-table styling
 * that had drifted across the superadmin / admin / caseworker / sponsor panels
 * (header weight+color+tracking, cell padding, row hover, row divider, container
 * radius+border). Use the components for new/refactored tables; the exported
 * TABLE_CLASS constants are available for tables that keep bespoke markup so they
 * still land on identical tokens.
 *
 * Canonical decisions (from the UI audit "Expected" column):
 *   container : rounded-2xl border border-gray-100 bg-white shadow-sm
 *   thead     : bg-gray-50/60, border-b border-gray-100
 *   th        : px-4 py-3 text-[11px] font-black uppercase tracking-wider text-gray-500
 *   tbody     : divide-y divide-gray-100
 *   tr        : hover:bg-gray-50 (cursor-pointer when clickable)
 *   td        : px-4 py-3 text-sm text-gray-600
 *   cell id   : text-sm font-bold text-gray-900 (primary-identity text)
 */

export const TABLE_CLASS = {
  container:
    "overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm",
  scroll: "overflow-x-auto",
  table: "w-full border-collapse text-left",
  thead: "border-b border-gray-100 bg-gray-50/60",
  th: "px-4 py-3 text-[11px] font-black uppercase tracking-wider text-gray-500",
  tbody: "divide-y divide-gray-100",
  tr: "transition-colors hover:bg-gray-50",
  td: "px-4 py-3 text-sm text-gray-600",
  /** Primary-identity cell text (names, references). */
  cellPrimary: "text-sm font-bold text-gray-900",
  /** Secondary/meta cell text. */
  cellMuted: "text-xs font-bold text-gray-500",
};

const alignClass = (align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

export function TableShell({ children, className = "" }) {
  return (
    <div className={`${TABLE_CLASS.container} ${className}`}>
      <div className={TABLE_CLASS.scroll}>
        <table className={TABLE_CLASS.table}>{children}</table>
      </div>
    </div>
  );
}

export function Thead({ children }) {
  return <thead className={TABLE_CLASS.thead}>{children}</thead>;
}

export function Th({ children, align = "left", className = "" }) {
  return (
    <th scope="col" className={`${TABLE_CLASS.th} ${alignClass(align)} ${className}`}>
      {children}
    </th>
  );
}

export function Tbody({ children }) {
  return <tbody className={TABLE_CLASS.tbody}>{children}</tbody>;
}

export function Tr({ children, onClick, className = "" }) {
  return (
    <tr
      onClick={onClick}
      className={`${TABLE_CLASS.tr} ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

export function Td({ children, align = "left", className = "" }) {
  return <td className={`${TABLE_CLASS.td} ${alignClass(align)} ${className}`}>{children}</td>;
}
