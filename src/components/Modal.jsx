import { X } from "lucide-react";

const Modal = ({
  open,
  onClose,
  title,
  children,
  footer,
  titleId = "modal-title",
  maxWidthClass = "max-w-md",
  bodyClassName = "",
  headerClassName = "",
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative flex min-h-[100dvh] items-center justify-center px-3 py-6 sm:p-4 md:p-6">
        <div
          className={`relative z-10 flex w-full ${maxWidthClass} max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(90dvh,56rem)] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200`}
        >
          <div
            className={`flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-6 sm:py-4 ${headerClassName}`}
          >
            <h2
              id={titleId}
              className="min-w-0 flex-1 text-base font-black tracking-tight text-secondary sm:text-lg"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}
          >
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
