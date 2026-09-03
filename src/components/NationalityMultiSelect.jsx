import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, X, Check } from "lucide-react";
import { COUNTRIES } from "../utils/countries";

/**
 * Reusable searchable multi-select component for Nationalities.
 * Allows applicants/clients to record more than one nationality (BUG-008).
 *
 * Props:
 *  - name: form field name (default: "nationalities")
 *  - value: array of nationality strings e.g. ["British", "Indian"] or single string
 *  - onChange: callback receiving `{ target: { name, value: string[] } }`
 *  - error: error message string
 *  - placeholder: string
 *  - disabled: boolean
 *  - className: string
 */
export default function NationalityMultiSelect({
  name = "nationalities",
  value = [],
  onChange,
  error = "",
  placeholder = "Select or search nationalities…",
  disabled = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const searchRef = useRef(null);

  // Normalize incoming value into an array of strings
  const selectedList = useMemo(() => {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    if (typeof value === "string" && value.trim()) {
      return value.includes(",")
        ? value.split(",").map((s) => s.trim()).filter(Boolean)
        : [value.trim()];
    }
    return [];
  }, [value]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...COUNTRIES].sort((a, b) =>
      a.nationality.localeCompare(b.nationality),
    );
    if (!q) return list;
    return list.filter(
      (c) =>
        c.nationality.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
  }, [query]);

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
    setQuery("");
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        popoverRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      ) {
        return;
      }
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

  const addNationality = (nationality) => {
    if (!nationality || selectedList.includes(nationality)) return;
    const updated = [...selectedList, nationality];
    onChange?.({ target: { name, value: updated, type: "select-multiple" } });
  };

  const removeNationality = (e, nationality) => {
    e.stopPropagation();
    const updated = selectedList.filter((n) => n !== nationality);
    onChange?.({ target: { name, value: updated, type: "select-multiple" } });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Box */}
      <div
        ref={triggerRef}
        onClick={toggleOpen}
        className={`min-h-[42px] w-full flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm cursor-pointer transition-all bg-white ${
          error
            ? "border-red-400 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-200"
            : open
            ? "border-secondary ring-2 ring-secondary/20"
            : "border-slate-300 hover:border-slate-400"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""}`}
      >
        {selectedList.length === 0 ? (
          <span className="text-gray-400 font-normal select-none">
            {placeholder}
          </span>
        ) : (
          selectedList.map((nat) => (
            <span
              key={nat}
              className="inline-flex items-center gap-1 rounded-md bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary border border-secondary/20 animate-fadeIn"
            >
              {nat}
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => removeNationality(e, nat)}
                  className="rounded p-0.5 hover:bg-secondary/20 hover:text-red-600 transition-colors focus:outline-none"
                  aria-label={`Remove ${nat}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))
        )}

        <div className="ml-auto flex items-center gap-1 text-gray-400 shrink-0">
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180 text-secondary" : ""
            }`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-[11px] font-bold text-red-500">{error}</p>
      )}

      {/* Popover Dropdown */}
      {open && (
        <div
          ref={popoverRef}
          className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-gray-200 bg-white shadow-xl py-2 max-h-72 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Search Input */}
          <div className="px-3 pb-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search nationality or country…"
                className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs font-medium placeholder-gray-400 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/30"
              />
            </div>
          </div>

          {/* List Options */}
          <div className="overflow-y-auto max-h-56 py-1 px-1 divide-y divide-gray-50">
            {filteredCountries.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400 font-medium">
                No nationalities found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedList.includes(c.nationality);
                return (
                  <button
                    key={`${c.code}-${c.nationality}`}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        const updated = selectedList.filter(
                          (n) => n !== c.nationality,
                        );
                        onChange?.({
                          target: {
                            name,
                            value: updated,
                            type: "select-multiple",
                          },
                        });
                      } else {
                        addNationality(c.nationality);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                      isSelected
                        ? "bg-secondary/10 text-secondary font-bold"
                        : "text-gray-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{c.nationality}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({c.name})
                      </span>
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-secondary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
