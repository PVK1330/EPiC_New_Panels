import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { formatDate } from "../utils/datetime";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseValue(value) {
  if (!value || typeof value !== "string") return null;
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  let hh = 0;
  let mm = 0;
  if (timePart) {
    const [h, min] = timePart.split(":").map((x) => parseInt(x, 10));
    if (!Number.isNaN(h)) hh = h;
    if (!Number.isNaN(min)) mm = min;
  }
  return { y, m, d, hh, mm };
}

function toDateValue(y, m, d) {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function toDateTimeValue(y, m, d, hh, mm) {
  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}`;
}

/** Format the time portion (for the trigger label) as e.g. "02:05 PM". */
function formatTimeLabel(hh, mm) {
  const period = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${pad(h12)}:${pad(mm)} ${period}`;
}

/** Days in a given month (1-indexed month). */
function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

/** Day of week (0=Sun) for the 1st of a month. */
function firstWeekday(y, m) {
  return new Date(y, m - 1, 1).getDay();
}

function ymdCompare(a, b) {
  // a, b: {y,m,d}
  if (a.y !== b.y) return a.y - b.y;
  if (a.m !== b.m) return a.m - b.m;
  return a.d - b.d;
}

function todayParts() {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

export default function DatePicker({
  name,
  value,
  onChange,
  error = "",
  label = "",
  required = false,
  placeholder,
  min,
  max,
  disabled = false,
  withTime = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  // Which panel is showing inside the popover: 'days' | 'months' | 'years'.
  const [mode, setMode] = useState("days");
  // First year of the 12-year block shown in the year panel.
  const [yearBlockStart, setYearBlockStart] = useState(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const parsed = useMemo(() => parseValue(value), [value]);

  // The month currently shown in the calendar grid.
  const [view, setView] = useState(() => {
    const p = parsed || todayParts();
    return { y: p.y, m: p.m };
  });

  // Time state for the time picker (only used when withTime).
  const [hh, setHh] = useState(parsed?.hh ?? 9);
  const [mm, setMm] = useState(parsed?.mm ?? 0);

  // Snap the calendar + time draft to the current value whenever the popover
  // opens. Doing this on open (not in a value-watching effect) avoids the
  // cascading-render anti-pattern while still reflecting outside changes.
  const openPicker = () => {
    if (disabled) return;
    const p = parseValue(value) || todayParts();
    setView({ y: p.y, m: p.m });
    if (p.hh != null) setHh(p.hh);
    if (p.mm != null) setMm(p.mm);
    setMode("days");
    setYearBlockStart(p.y - (p.y % 12)); // align block to a 12-year window
    setOpen(true);
  };

  const minP = useMemo(() => parseValue(min), [min]);
  const maxP = useMemo(() => parseValue(max), [max]);

  const placeText =
    placeholder || (withTime ? "Select date & time" : "Select date");

  /* ── positioning (portal, so it escapes overflow:hidden / scroll containers) */
  const positionPopover = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popHeight = withTime ? 430 : 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < popHeight && rect.top > popHeight;
    setCoords({
      top: openUp ? rect.top - popHeight - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [withTime]);

  useEffect(() => {
    if (!open) return;
    positionPopover();
    const onScroll = () => positionPopover();
    const onResize = () => positionPopover();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, positionPopover]);

  // Close on outside click / Escape.
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
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const emit = (next) => {
    onChange?.({
      target: { name, value: next, type: withTime ? "datetime-local" : "date" },
    });
  };

  const isDisabledDay = (day) => {
    const p = { y: view.y, m: view.m, d: day };
    if (minP && ymdCompare(p, minP) < 0) return true;
    if (maxP && ymdCompare(p, maxP) > 0) return true;
    return false;
  };

  const selectDay = (day) => {
    if (isDisabledDay(day)) return;
    if (withTime) {
      emit(toDateTimeValue(view.y, view.m, day, hh, mm));
    } else {
      emit(toDateValue(view.y, view.m, day));
      setOpen(false);
    }
  };

  const changeTime = (nextHh, nextMm) => {
    setHh(nextHh);
    setMm(nextMm);
    // Only emit if a day is already chosen.
    if (parsed) {
      emit(toDateTimeValue(parsed.y, parsed.m, parsed.d, nextHh, nextMm));
    }
  };

  const gotoMonth = (delta) => {
    setView((v) => {
      let m = v.m + delta;
      let y = v.y;
      if (m < 1) {
        m = 12;
        y -= 1;
      } else if (m > 12) {
        m = 1;
        y += 1;
      }
      return { y, m };
    });
  };

  const pickMonth = (m) => {
    setView((v) => ({ ...v, m: m + 1 }));
    setMode("days");
  };

  const pickYear = (y) => {
    setView((v) => ({ ...v, y }));
    setMode("months");
  };

  const handleToday = () => {
    const t = todayParts();
    setView({ y: t.y, m: t.m });
    if (withTime) {
      const now = new Date();
      changeTime(now.getHours(), now.getMinutes());
      emit(toDateTimeValue(t.y, t.m, t.d, now.getHours(), now.getMinutes()));
    } else {
      const p = { y: t.y, m: t.m, d: t.d };
      const blocked =
        (minP && ymdCompare(p, minP) < 0) || (maxP && ymdCompare(p, maxP) > 0);
      if (!blocked) {
        emit(toDateValue(t.y, t.m, t.d));
        setOpen(false);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    emit("");
    setOpen(false);
  };

  /* ── trigger display text ─────────────────────────────────────────────── */
  const displayText = (() => {
    if (!parsed) return "";
    const dateStr = formatDate(toDateValue(parsed.y, parsed.m, parsed.d));
    if (withTime)
      return `${dateStr} · ${formatTimeLabel(parsed.hh, parsed.mm)}`;
    return dateStr;
  })();

  /* ── calendar grid ────────────────────────────────────────────────────── */
  const grid = useMemo(() => {
    const total = daysInMonth(view.y, view.m);
    const lead = firstWeekday(view.y, view.m);
    const cells = [];
    for (let i = 0; i < lead; i += 1) cells.push(null);
    for (let d = 1; d <= total; d += 1) cells.push(d);
    return cells;
  }, [view]);

  const today = todayParts();

  const fieldCls = `w-full flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-all outline-none focus:ring-2 focus:ring-secondary/30 ${
    disabled
      ? "bg-slate-50 cursor-not-allowed text-slate-400 border-slate-200"
      : "bg-white cursor-pointer hover:border-secondary/50"
  } ${error ? "border-red-400" : "border-gray-300"}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        id={name}
        ref={triggerRef}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={fieldCls}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={withTime ? "text-secondary" : "text-secondary"}>
          {withTime ? <ClockIcon size={16} /> : <CalendarIcon size={16} />}
        </span>
        <span
          className={`flex-1 font-bold ${
            displayText ? "text-gray-900" : "text-gray-400 font-normal"
          }`}
        >
          {displayText || placeText}
        </span>
        {displayText && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            onClick={handleClear}
            className="text-gray-300 hover:text-red-500 transition-colors"
            title="Clear"
          >
            <X size={15} />
          </span>
        )}
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
              minWidth: Math.max(coords.width, 280),
              zIndex: 9999,
            }}
            className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-secondary/10 p-3 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* header: nav + clickable label (jump to month / year panels) */}
            <div className="flex items-center justify-between px-1 pb-2">
              <button
                type="button"
                onClick={() => {
                  if (mode === "days") gotoMonth(-1);
                  else if (mode === "months") setView((v) => ({ ...v, y: v.y - 1 }));
                  else setYearBlockStart((s) => (s ?? view.y) - 12);
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-secondary/5 hover:text-secondary transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setMode((mDe) =>
                    mDe === "days" ? "months" : mDe === "months" ? "years" : "days",
                  )
                }
                className="text-sm font-black text-secondary tabular-nums px-3 py-1 rounded-lg hover:bg-secondary/5 transition-colors"
                title="Click to jump to month / year"
              >
                {mode === "days" && `${MONTHS[view.m - 1]} ${view.y}`}
                {mode === "months" && view.y}
                {mode === "years" &&
                  yearBlockStart != null &&
                  `${yearBlockStart} – ${yearBlockStart + 11}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mode === "days") gotoMonth(1);
                  else if (mode === "months") setView((v) => ({ ...v, y: v.y + 1 }));
                  else setYearBlockStart((s) => (s ?? view.y) + 12);
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-secondary/5 hover:text-secondary transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* ── DAYS panel ──────────────────────────────────────────── */}
            {mode === "days" && (
              <>
                {/* weekday header */}
                <div className="grid grid-cols-7 gap-1 px-1 mb-1">
                  {WEEKDAYS.map((w) => (
                    <div
                      key={w}
                      className="text-[10px] font-black uppercase text-gray-400 text-center py-1"
                    >
                      {w}
                    </div>
                  ))}
                </div>

                {/* days grid */}
                <div className="grid grid-cols-7 gap-1 px-1">
                  {grid.map((day, idx) => {
                    if (day === null)
                      return <div key={`e-${idx}`} className="h-9" />;
                    const isSelected =
                      parsed &&
                      parsed.y === view.y &&
                      parsed.m === view.m &&
                      parsed.d === day;
                    const isToday =
                      today.y === view.y &&
                      today.m === view.m &&
                      today.d === day;
                    const blocked = isDisabledDay(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={blocked}
                        onClick={() => selectDay(day)}
                        className={`h-9 rounded-lg text-sm font-bold tabular-nums transition-colors ${
                          isSelected
                            ? "bg-secondary text-white shadow-md shadow-secondary/30"
                            : blocked
                              ? "text-gray-300 cursor-not-allowed"
                              : isToday
                                ? "text-secondary bg-secondary/10 hover:bg-secondary/20"
                                : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── MONTHS panel ────────────────────────────────────────── */}
            {mode === "months" && (
              <div className="grid grid-cols-3 gap-2 px-1 py-1">
                {MONTHS.map((mName, idx) => {
                  const isCur = view.m - 1 === idx;
                  return (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => pickMonth(idx)}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                        isCur
                          ? "bg-secondary text-white shadow-md shadow-secondary/30"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {mName.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── YEARS panel (12-year block, page with arrows) ───────── */}
            {mode === "years" && yearBlockStart != null && (
              <div className="grid grid-cols-3 gap-2 px-1 py-1">
                {Array.from({ length: 12 }, (_, i) => yearBlockStart + i).map(
                  (yr) => {
                    const isCur = view.y === yr;
                    const blocked =
                      (minP && yr < minP.y) || (maxP && yr > maxP.y);
                    return (
                      <button
                        key={yr}
                        type="button"
                        disabled={blocked}
                        onClick={() => pickYear(yr)}
                        className={`py-2.5 rounded-lg text-sm font-bold tabular-nums transition-colors ${
                          isCur
                            ? "bg-secondary text-white shadow-md shadow-secondary/30"
                            : blocked
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {yr}
                      </button>
                    );
                  },
                )}
              </div>
            )}

            {/* time picker */}
            {withTime && mode === "days" && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-2">
                <ClockIcon size={16} className="text-secondary" />
                <select
                  value={hh}
                  onChange={(e) => changeTime(parseInt(e.target.value, 10), mm)}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/20 tabular-nums"
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {pad(h)}
                    </option>
                  ))}
                </select>
                <span className="font-black text-gray-400">:</span>
                <select
                  value={mm}
                  onChange={(e) => changeTime(hh, parseInt(e.target.value, 10))}
                  className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/20 tabular-nums"
                >
                  {Array.from({ length: 60 }, (_, m) => (
                    <option key={m} value={m}>
                      {pad(m)}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-bold text-gray-500 ml-1">
                  {formatTimeLabel(hh, mm)}
                </span>
              </div>
            )}

            {/* footer */}
            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleToday}
                className="text-xs font-black text-secondary hover:underline px-2 py-1"
              >
                Today
              </button>
              {withTime && parsed && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-black text-white bg-secondary hover:bg-secondary-dark rounded-lg px-3 py-1.5 transition-colors"
                >
                  Done
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleClear(e)}
                className="text-xs font-black text-gray-400 hover:text-red-500 px-2 py-1"
              >
                Clear
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/** Date + time variant — same props, value is "YYYY-MM-DDTHH:mm". */
export function DateTimePicker(props) {
  return <DatePicker {...props} withTime />;
}
