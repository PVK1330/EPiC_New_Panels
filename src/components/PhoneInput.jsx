import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Phone as PhoneIcon } from "lucide-react";
import {
  parsePhoneNumberFromString,
  isValidPhoneNumber,
  AsYouType,
} from "libphonenumber-js";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryByCode,
  getCountryByDialCode,
} from "../utils/countries";

/**
 * Global phone field: searchable country-code picker + number input, with
 * STRICT per-country validation via libphonenumber-js.
 *
 * TWO MODES:
 *
 * 1) Combined (default) — stores ONE E.164 string:
 *    <PhoneInput name="phone" value={form.phone} onChange={handleChange} />
 *    onChange fires { target: { name, value: "+44…" } }.
 *
 * 2) Split — keeps country_code and mobile as SEPARATE fields (matches the
 *    backend in this app). Pass `split` plus the two values + names:
 *    <PhoneInput
 *      split
 *      dialCode={form.country_code}     // "+44"
 *      national={form.mobile}           // "7911123456"
 *      dialName="country_code"          // field name for the dial code
 *      nationalName="mobile"            // field name for the number
 *      onChange={handleChange}          // fires once per field, event-shaped
 *      onValidityChange={(ok) => ...}
 *    />
 *    onChange fires { target: { name: dialName, value } } and
 *    { target: { name: nationalName, value } } so existing handleChange(e)
 *    handlers update both fields with no extra wiring.
 *
 * `onValidityChange(bool)` reports strict validity so the form can block submit.
 */
export default function PhoneInput({
  // combined mode
  name = "phone",
  value = "",
  // split mode
  split = false,
  dialCode = "",
  national: nationalProp = "",
  dialName = "country_code",
  nationalName = "mobile",
  // shared
  onChange,
  onValidityChange,
  error = "",
  label = "",
  required = false,
  placeholder = "Phone number",
  defaultCountry = DEFAULT_COUNTRY,
  disabled = false,
  className = "",
}) {
  // Resolve the initial ISO country code.
  const [country, setCountry] = useState(() => {
    if (split) {
      const c = getCountryByDialCode(dialCode);
      if (c) return c.code;
      return defaultCountry;
    }
    if (value) {
      const parsed = parsePhoneNumberFromString(value);
      if (parsed?.country) return parsed.country;
    }
    return defaultCountry;
  });

  // We always keep a LOCAL formatted display copy of the national number (with
  // the "as-you-type" spacing). The value EMITTED to the parent is always
  // digits-only, so the backend receives e.g. "7709638776" — never "77096 38776".
  const [nationalLocal, setNationalLocal] = useState(() => {
    const initial = split ? nationalProp : value;
    if (initial) {
      // Format whatever the parent gave us (digits or E.164) for display.
      const parsed = split
        ? null
        : parsePhoneNumberFromString(initial);
      if (parsed) return parsed.formatNational();
      const seedCountry = split
        ? getCountryByDialCode(dialCode)?.code || defaultCountry
        : defaultCountry;
      return new AsYouType(seedCountry).input(String(initial));
    }
    return "";
  });

  const national = nationalLocal;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const searchRef = useRef(null);

  const selectedCountry =
    getCountryByCode(country) || getCountryByCode(defaultCountry);

  // Report strict validity for a given country + national number.
  const computeValidity = (isoCode, nationalNum) => {
    const digits = String(nationalNum || "").replace(/[^\d]/g, "");
    if (!digits) return false;
    try {
      return isValidPhoneNumber(digits, isoCode);
    } catch {
      return false;
    }
  };

  // Emit changes upward, shaped to match each mode's contract. The value sent
  // to the parent is ALWAYS digits-only (national) or E.164 (combined) — never
  // the spaced display string.
  const emit = (nextCountry, nextNational) => {
    const c = getCountryByCode(nextCountry);
    const digits = String(nextNational || "").replace(/[^\d]/g, "");
    const ok = computeValidity(nextCountry, digits);
    if (split) {
      onChange?.({
        target: { name: dialName, value: c?.dialCode || "", type: "tel" },
      });
      onChange?.({
        target: { name: nationalName, value: digits, type: "tel" },
      });
    } else {
      let e164 = "";
      if (digits) {
        const parsed = parsePhoneNumberFromString(digits, nextCountry);
        if (parsed) e164 = parsed.number;
      }
      onChange?.({ target: { name, value: e164, type: "tel" } });
    }
    onValidityChange?.(ok);
  };

  const handleNationalChange = (e) => {
    // Format for display only; emit() strips to digits for the parent/backend.
    const formatted = new AsYouType(country).input(e.target.value);
    setNationalLocal(formatted);
    emit(country, formatted);
  };

  const pickCountry = (c) => {
    setCountry(c.code);
    setOpen(false);
    // Re-format the existing digits for the newly selected country.
    const digits = String(national || "").replace(/[^\d]/g, "");
    const reformatted = digits ? new AsYouType(c.code).input(digits) : "";
    setNationalLocal(reformatted);
    emit(c.code, reformatted);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase() === q,
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

  const wrapCls = `flex items-stretch rounded-lg border transition-all overflow-hidden focus-within:ring-2 focus-within:ring-secondary/30 ${
    error ? "border-red-400" : "border-gray-300"
  } ${disabled ? "bg-slate-50" : "bg-white"}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={split ? nationalName : name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={wrapCls}>
        {/* country code picker */}
        <button
          type="button"
          ref={triggerRef}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          className="flex items-center gap-1.5 px-2.5 border-r border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed shrink-0"
          aria-haspopup="listbox"
        >
          <span className="text-base leading-none">{selectedCountry?.flag}</span>
          <span className="tabular-nums text-gray-600">
            {selectedCountry?.dialCode}
          </span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {/* number input */}
        <div className="relative flex-1">
          <PhoneIcon
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            id={split ? nationalName : name}
            type="tel"
            name={split ? nationalName : name}
            value={national}
            onChange={handleNationalChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-8 pr-3 py-2.5 text-sm font-bold text-gray-900 outline-none bg-transparent placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>
      </div>

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
              minWidth: 260,
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
                  placeholder="Search country or code…"
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
                filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => pickCountry(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                      c.code === country
                        ? "bg-secondary/10 text-secondary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="font-bold flex-1">{c.name}</span>
                    <span className="text-xs font-bold text-gray-400 tabular-nums">
                      {c.dialCode}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
