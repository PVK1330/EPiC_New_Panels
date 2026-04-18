import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ToastContext = createContext(null);

function getVariantClasses(variant) {
  if (variant === "danger")
    return "bg-red-600 text-white border border-red-700 shadow-red-900/20";
  if (variant === "warning")
    return "bg-amber-500 text-white border border-amber-600 shadow-amber-900/20";
  return "bg-emerald-600 text-white border border-emerald-700 shadow-emerald-900/20";
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, variant = "success" }) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, variant }]);
      window.setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-4 right-4 z-200 flex max-w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${getVariantClasses(t.variant)} animate-in fade-in slide-in-from-right-4 duration-200`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export default ToastContext;
