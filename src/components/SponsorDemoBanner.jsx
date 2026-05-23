/** Shown when sponsor panel pages fall back to demo data after an API error. */
export default function SponsorDemoBanner({ show }) {
  if (!show) return null;
  return (
    <div
      className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"
      role="status"
    >
      Showing demo data while the live sponsor API is unavailable. Connect the server or refresh
      once migrations are applied to see your real account data.
    </div>
  );
}
