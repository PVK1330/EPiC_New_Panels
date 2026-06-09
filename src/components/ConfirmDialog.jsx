import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * App-styled confirmation dialog — drop-in replacement for window.confirm /
 * SweetAlert. Render it controlled via `open`; resolve the user's choice with
 * `onConfirm` / `onClose`.
 *
 *   const [confirm, setConfirm] = useState(false);
 *   <ConfirmDialog open={confirm} title="…" message="…"
 *     onConfirm={() => { setConfirm(false); doThing(); }}
 *     onClose={() => setConfirm(false)} />
 */
export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary", // 'primary' | 'danger'
  busy = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title} maxWidthClass="max-w-md">
      <div className="p-5 sm:p-6">
        <div className="flex gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              variant === "danger"
                ? "bg-red-50 text-red-500"
                : "bg-primary/10 text-primary"
            }`}
          >
            <AlertTriangle size={22} />
          </div>
          <p className="text-sm font-medium leading-relaxed text-gray-600 pt-1">
            {message}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
