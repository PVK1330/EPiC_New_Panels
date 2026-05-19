/**
 * Icon action with hover tooltip for data tables.
 * Uses a named Tailwind group so row-level `group` does not show every tooltip at once.
 */
export default function TableActionButton({
  label,
  onClick,
  disabled = false,
  variant = "default",
  children,
}) {
  const variants = {
    default: "text-gray-500 hover:text-primary hover:bg-primary/5",
    edit: "text-gray-500 hover:text-secondary hover:bg-gray-100",
    danger: "text-gray-500 hover:text-red-600 hover:bg-red-50",
  };

  return (
    <div className="relative group/action">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`p-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant] || variants.default}`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover/action:opacity-100 group-focus-within/action:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
