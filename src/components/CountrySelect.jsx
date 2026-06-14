import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check } from "lucide-react";
import { COUNTRIES } from "../utils/countries";

/**
 * Global, reusable searchable Country (name) dropdown.
 *
 * Drop-in for a `<select>` / free-text country input — call with attributes:
 *   <CountrySelect name="country" value={form.country} onChange={handleChange} />
 *
 * Value is the country name string (e.g. "United Kingdom"), so it stays
 * compatible with existing free-text `country` fields & API payloads.
 * onChange fires `{ target: { name, value } }` like a native input.
 */
export default function CountrySelect({
  name = "country",
  value = "",
  onChange,
  error = "",
  label = "",
  required = false,
  placeholder = "Select country",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const searchRef = useRef(null);

  const selected = useMemo(
    () => COUNTRIES.find((c) => c.name === value) || null,
    [value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nationality.toLowerCase().includes(q),
    );
  }, [query]);

  const positionPopover = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popHeight = 320;
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
    setQuery("");
    positionPopover();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 30);
    const onScroll = () => positionPopover();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(t);
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

  const pick = (c) => {
    onChange?.({ target: { name, value: c.name, type: "text" } });
    setOpen(false);
  };

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
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={fieldCls}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected && (
          <span className="text-base leading-none">{selected.flag}</span>
        )}
        <span
          className={`flex-1 font-bold ${
            selected ? "text-gray-900" : "text-gray-400 font-normal"
          }`}
        >
          {selected ? selected.name : value || placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400 shrink-0" />
      </button>

      {error && <span className="text-xs text-red-500">{error}</span>}

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            role="listbox"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              minWidth: Math.max(coords.width, 240),
              zIndex: 9999,
            }}
            className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-secondary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country…"
                  className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-2 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm font-bold text-gray-400">
                  No matches
                </div>
              ) : (
                filtered.map((c) => {
                  const isSel = c.name === value;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => pick(c)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                        isSel
                          ? "bg-secondary/10 text-secondary"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="font-bold flex-1">{c.name}</span>
                      {isSel && <Check size={15} className="text-secondary" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
