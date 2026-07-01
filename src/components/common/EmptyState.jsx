/**
 * Canonical empty-state block for tables/lists.
 *
 * Standardises the 5 different empty treatments flagged in the UI audit into one
 * icon + heading + subtext + optional CTA card.
 *
 * @param {object}   props
 * @param {React.ElementType} [props.icon]  A lucide icon component.
 * @param {React.ReactNode}   props.title
 * @param {React.ReactNode}   [props.subtitle]
 * @param {React.ReactNode}   [props.action]  Optional CTA (e.g. a Button).
 * @param {string}            [props.className]
 */
export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-6 py-12 text-center ${className}`}
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
          <Icon size={22} strokeWidth={2} />
        </div>
      ) : null}
      <div>
        <p className="text-sm font-black text-gray-800">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-xs font-bold text-gray-500">{subtitle}</p>
        ) : null}
      </div>
      {action || null}
    </div>
  );
}
