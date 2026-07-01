import { Search } from "lucide-react";

/**
 * Canonical search field for list toolbars.
 *
 * Standardises the drift flagged in the UI audit (rounded-lg vs rounded-xl,
 * ring-1/20 vs ring-2/30, bg-white vs slate-50, uppercase placeholder text).
 * Always: rounded-lg · border-gray-200 · bg-white · focus ring-2 secondary/15 ·
 * normal-case placeholder.
 *
 * @param {object}   props
 * @param {string}   props.value
 * @param {Function} props.onChange
 * @param {string}   [props.placeholder]
 * @param {string}   [props.className]  Applied to the wrapper (e.g. width).
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
  ...rest
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-bold text-gray-800 outline-none placeholder:font-medium placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15"
        {...rest}
      />
    </div>
  );
}
