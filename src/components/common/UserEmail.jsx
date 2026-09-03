import { parseDeletedEmail } from "../../utils/userIdentity";

/**
 * Renders a user's email. Tombstoned addresses (account deleted, email
 * released for reuse) show the original address struck through with a
 * "Deleted" tag instead of the raw `+deleted…` value.
 */
export default function UserEmail({ email, className = "" }) {
  const info = parseDeletedEmail(email);
  if (!info.deleted) return <span className={className}>{info.email}</span>;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      title={`Account deleted — ${info.originalEmail} has been released and can be used again`}
    >
      <span className="line-through text-gray-400">{info.originalEmail}</span>
      <span className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-wide">
        Deleted
      </span>
    </span>
  );
}
