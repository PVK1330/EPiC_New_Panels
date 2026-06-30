import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import ConfirmDialog from "../components/ConfirmDialog";

const ConfirmContext = createContext(null);

/**
 * App-wide imperative confirmation, backed by the custom <ConfirmDialog>.
 * Drop-in replacement for SweetAlert's `await Swal.fire(...)` pattern:
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({
 *     title: "Delete Visa Type?",
 *     message: "This cannot be undone.",
 *     confirmLabel: "Delete",
 *     variant: "danger",
 *   });
 *   if (!ok) return;
 *
 * Returns a Promise<boolean> — true when confirmed, false on cancel/close.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, options: {} });
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ open: true, options: options || {} });
    });
  }, []);

  const settle = useCallback((result) => {
    setState((prev) => ({ ...prev, open: false }));
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const { title, message, confirmLabel, cancelLabel, variant } = state.options;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={title || "Are you sure?"}
        message={message || ""}
        confirmLabel={confirmLabel || "Confirm"}
        cancelLabel={cancelLabel || "Cancel"}
        variant={variant || "primary"}
        onConfirm={() => settle(true)}
        onClose={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx.confirm;
}

export default ConfirmContext;
