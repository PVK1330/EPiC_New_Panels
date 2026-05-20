import { RiAddLine, RiDeleteBin6Line } from 'react-icons/ri';

const PANEL_OPTIONS = ['admin', 'caseworker', 'candidate', 'business'];
const PANEL_LABELS = { admin: 'Admin', caseworker: 'Caseworker', candidate: 'Candidate', business: 'Business' };
const PANEL_ORDER = ['admin', 'caseworker', 'candidate', 'business'];

const ModulesTab = ({
  modules,
  modulesLoading,
  newModule,
  setNewModule,
  newModuleErrors,
  handleAddModule,
  setModuleToDelete,
  setIsDeleteModuleOpen,
}) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-5">
      <div>
        <h4 className="text-sm font-black text-secondary uppercase tracking-widest">Add New Module</h4>
        <p className="text-xs text-gray-400 font-medium mt-1">
          Register a new sidebar item without touching code. The key must match the route segment exactly.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Key</label>
          <input
            type="text"
            placeholder="admin.new-feature"
            value={newModule.key}
            onChange={(e) => setNewModule((p) => ({ ...p, key: e.target.value }))}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all ${newModuleErrors.key ? 'border-red-400' : 'border-gray-100'}`}
          />
          {newModuleErrors.key && <p className="text-[10px] text-red-500 font-bold ml-1">{newModuleErrors.key}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Label</label>
          <input
            type="text"
            placeholder="New Feature"
            value={newModule.label}
            onChange={(e) => setNewModule((p) => ({ ...p, label: e.target.value }))}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all ${newModuleErrors.label ? 'border-red-400' : 'border-gray-100'}`}
          />
          {newModuleErrors.label && <p className="text-[10px] text-red-500 font-bold ml-1">{newModuleErrors.label}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Panel</label>
          <select
            value={newModule.panel}
            onChange={(e) => setNewModule((p) => ({ ...p, panel: e.target.value }))}
            className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          >
            {PANEL_OPTIONS.map((p) => (
              <option key={p} value={p}>{PANEL_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-gray-600 uppercase tracking-widest ml-1">Icon (optional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="RiDashboardLine"
              value={newModule.icon}
              onChange={(e) => setNewModule((p) => ({ ...p, icon: e.target.value }))}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <button
              type="button"
              onClick={handleAddModule}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 shrink-0"
            >
              <RiAddLine size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>

    {modulesLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ) : Object.values(modules).flat().length === 0 ? (
      <div className="text-center py-12">
        <p className="text-sm font-bold text-gray-400">No modules found. Run the module seeder first.</p>
      </div>
    ) : (
      <div className="space-y-6">
        {PANEL_ORDER.filter((panel) => modules[panel]?.length > 0).map((panel) => (
          <div key={panel} className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-xs font-black text-secondary uppercase tracking-widest">{PANEL_LABELS[panel]} Panel</p>
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                {modules[panel].length} modules
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Key</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Label</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-2.5 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {modules[panel].map((mod) => (
                    <tr key={mod.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <code className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">{mod.key}</code>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-secondary">{mod.label}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${
                          mod.is_active
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}>
                          {mod.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { setModuleToDelete(mod); setIsDeleteModuleOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Deactivate"
                        >
                          <RiDeleteBin6Line size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ModulesTab;