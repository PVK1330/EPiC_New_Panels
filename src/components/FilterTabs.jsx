const TABS = ["All", "Candidate", "Sponsor", "Internal"];

const FilterTabs = ({ active, onChange }) => {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg transition-all duration-150
            ${active === tab
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
            }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
