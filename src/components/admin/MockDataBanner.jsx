export default function MockDataBanner({ message }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
      {message ||
        "Live API data is unavailable — showing sample data for preview. Reconnect the server to see real figures."}
    </div>
  );
}
