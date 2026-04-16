const SearchBar = ({ query, onQueryChange, placeholder = "Search…" }) => {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 bg-slate-100 hover:bg-slate-200 focus:bg-white border border-transparent focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150"
      />
      {query && (
        <button
          onClick={() => onQueryChange("")}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Clear"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
