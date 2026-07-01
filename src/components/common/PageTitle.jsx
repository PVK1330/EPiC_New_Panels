/**
 * Canonical page heading for list/detail screens.
 *
 * Standardises the H1/subtitle drift flagged in the UI audit (superadmin used
 * text-2xl, tenant panels drifted to text-4xl and one raw #004ca5 hex). Always:
 *   H1  → text-2xl md:text-3xl font-black tracking-tight text-secondary
 *   sub → text-sm font-bold text-gray-500
 *
 * @param {object}   props
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.subtitle]
 * @param {React.ReactNode} [props.actions]  Right-aligned header actions (e.g. a CTA Button).
 * @param {string}   [props.className]
 */
export default function PageTitle({ title, subtitle, actions, className = "" }) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-black tracking-tight text-secondary md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm font-bold text-gray-500">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
