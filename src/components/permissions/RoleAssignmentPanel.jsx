import { useState } from "react";
import Input from "../Input";
import Button from "../Button";
import {
  ASSIGNMENT_USERS,
  ASSIGNMENT_ROLES,
  ACCESS_SCOPE_OPTIONS,
  MODULE_OPTIONS_MULTI,
} from "./permissionsData";

const RoleAssignmentPanel = ({ roleOptions = ASSIGNMENT_ROLES }) => {
  const [userId, setUserId] = useState("u1");
  const [role, setRole] = useState(roleOptions[0]?.value ?? "Caseworker");
  const [accessScope, setAccessScope] = useState("own");
  const [modules, setModules] = useState(() => new Set(["cases", "documents"]));
  const [saved, setSaved] = useState(false);

  const toggleModule = (value) => {
    setModules((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-black text-secondary">Role Assignment</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Map users to roles, access scope, and permitted modules
        </p>
      </div>
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Select User"
            name="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            options={ASSIGNMENT_USERS}
          />
          <Input
            label="Assign Role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={roleOptions}
          />
          <Input
            label="Access Scope"
            name="accessScope"
            value={accessScope}
            onChange={(e) => setAccessScope(e.target.value)}
            options={ACCESS_SCOPE_OPTIONS}
          />
        </div>

        <div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Assigned Modules</p>
          <p className="text-[11px] text-gray-400 mb-3">
            Grant module-level access for this user. Changes apply on save.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {MODULE_OPTIONS_MULTI.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                  modules.has(m.value)
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={modules.has(m.value)}
                  onChange={() => toggleModule(m.value)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-semibold text-secondary">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="button" variant="primary" onClick={handleSave} className="rounded-xl">
            Save Role Assignment
          </Button>
          {saved && (
            <span className="text-xs font-bold text-green-600">Assignment saved locally.</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentPanel;
