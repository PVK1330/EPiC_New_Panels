/**
 * Lightweight shell for caseworker routes that are not fully built yet.
 */
export default function CaseworkerPlaceholderPage({
  title,
  subtitle = "This area will connect to your workflow when the backend is ready.",
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-black text-secondary tracking-tight">{title}</h1>
      <p className="mt-3 text-sm font-medium text-gray-600 max-w-xl leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}
