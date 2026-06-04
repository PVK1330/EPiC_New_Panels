import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Clock as ClockIcon } from "lucide-react";

/**
 * Global, reusable time-only picker.
 *
 * Drop-in replacement for `<input type="time">`. Value contract is identical:
 * a 24-hour "HH:mm" string. onChange fires `{ target: { name, value } }` so it
 * wires straight into existing handlers.
 *
 * Props mirror a native input: name, value, onChange, error, label, required,
 * placeholder, disabled, className. `minuteStep` controls the minute options
 * (default 5).
 */

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseTime(value) {
  if (!value || typeof value !== "string") return null;
  const [h, m] = value.split(":").map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { hh: h, mm: m };
}

function label12(hh, mm) {
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${pad(h12)}:${pad(mm)} ${period}`;
}

export default function TimePicker({
  name,
  value = "",
  onChange,
  error = "",
  label = "",
  required = false,
  placeholder = "Select time",
  disabled = false,
  minuteStep = 5,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const parsed = parseTime(value);

  const minutes = [];
  for (let m = 0; m < 60; m += minuteStep) minutes.push(m);
  // Ensure the current minute is selectable even if off-step.
  if (parsed && !minutes.includes(parsed.mm)) {
    minutes.push(parsed.mm);
    minutes.sort((a, b) => a - b);
  }

  const emit = (hh, mm) => {
    onChange?.({ target: { name, value: `${pad(hh)}:${pad(mm)}`, type: "time" } });
  };

  const setHour = (hh) => emit(hh, parsed?.mm ?? 0);
  const setMinute = (mm) => emit(parsed?.hh ?? 9, mm);

  const positionPopover = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < popHeight && rect.top > popHeight;
    setCoords({
      top: openUp ? rect.top - popHeight - 8 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  };

  const openMenu = () => {
    if (disabled) return;
    positionPopover();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onScroll = () => positionPopover();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        popoverRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const display = parsed ? label12(parsed.hh, parsed.mm) : "";

  const fieldCls = `w-full flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-all outline-none focus:ring-2 focus:ring-secondary/30 ${
    disabled
      ? "bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200"
      : "bg-white cursor-pointer hover:border-secondary/50"
  } ${error ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={fieldCls}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ClockIcon size={16} className="text-secondary shrink-0" />
        <span
          className={`flex-1 font-bold tabular-nums ${
            display ? "text-gray-900" : "text-gray-400 font-normal"
          }`}
        >
          {display || placeholder}
        </span>
      </button>

      {error && <span className="text-xs text-red-500">{error}</span>}

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: 280,
              zIndex: 9999,
            }}
            className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-secondary/10 p-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-2">
              {/* Hours */}
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-gray-400 text-center mb-1">
                  Hour
                </p>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-100">
                  {Array.from({ length: 24 }, (_, h) => h).map((h) => {
                    const active = parsed?.hh === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHour(h)}
                        className={`w-full px-2 py-1.5 text-sm font-bold tabular-nums transition-colors ${
                          active
                            ? "bg-secondary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pad(h)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <span className="text-lg font-black text-gray-300 pt-5">:</span>

              {/* Minutes */}
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-gray-400 text-center mb-1">
                  Min
                </p>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-100">
                  {minutes.map((m) => {
                    const active = parsed?.mm === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMinute(m)}
                        className={`w-full px-2 py-1.5 text-sm font-bold tabular-nums transition-colors ${
                          active
                            ? "bg-secondary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pad(m)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-black text-secondary tabular-nums">
                {display || "--:--"}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-black text-white bg-secondary hover:bg-secondary-dark rounded-lg px-3 py-1.5 transition-colors"
              >
                Done
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
