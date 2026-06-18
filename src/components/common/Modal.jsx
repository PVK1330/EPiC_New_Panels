import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';
import useModalKeyboard from '../../hooks/useModalKeyboard';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(el) {
  return [...el.querySelectorAll(FOCUSABLE)];
}

const Modal = ({ isOpen, onClose, title, subtitle, children, footer, maxWidth = 'max-w-lg' }) => {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useModalKeyboard({ isOpen, onClose });

  // Capture the element that opened the modal so we can return focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current) {
      triggerRef.current.focus?.();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Move focus into the modal when it opens
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const focusable = getFocusable(panelRef.current);
      if (focusable.length) focusable[0].focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = getFocusable(panelRef.current);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  if (!isOpen) return null;

  const titleId = 'modal-title';
  const descId = subtitle ? 'modal-desc' : undefined;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Panel */}
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onKeyDown={handleKeyDown}
          className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">{title}</h2>
              {subtitle && <p id={descId} className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <RiCloseLine size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
