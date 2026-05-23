import { useEffect } from 'react';
import { RiLoader4Line } from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';
import usePlatformSecurity from '../../../../hooks/usePlatformSecurity';

const TOGGLES = [
  { id: 'mfa_enforced',         label: 'Enforce MFA'     },
  { id: 'ip_whitelist_enabled', label: 'IP Restrictions' },
  { id: 'session_persistence',  label: 'Stay Logged In'  },
];

const SecurityTab = () => {
  const {
    settings,
    setSettings,
    loading,
    saving,
    fetchSecuritySettings,
    saveSecuritySettings,
    toggleSetting,
  } = usePlatformSecurity();

  // Fetch on mount
  useEffect(() => {
    fetchSecuritySettings().then((result) => {
      if (!result.ok) toast.error('Failed to load security settings');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    const result = await saveSecuritySettings(settings);
    if (result.ok) {
      toast.success('Security settings saved');
    } else {
      // result.error may be a plain string (validation) or an axios error object
      const msg = typeof result.error === 'string'
        ? result.error
        : result.error?.response?.data?.message || 'Failed to save security settings';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RiLoader4Line className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Access Policy */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Access Policy</h4>
          <div className="space-y-3">
            {TOGGLES.map((rule) => (
              <div
                key={rule.id}
                onClick={() => toggleSetting(rule.id)}
                className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 cursor-pointer hover:bg-white transition-all"
              >
                <p className="text-xs font-black text-secondary uppercase tracking-tight">{rule.label}</p>
                <div className={`w-8 h-4 rounded-full relative transition-all shadow-inner ${settings[rule.id] ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${settings[rule.id] ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Governance */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Session Governance</h4>
          <div className="p-5 bg-white rounded-xl border border-gray-100 space-y-4 shadow-sm">
            <Input
              label="Inactivity Timeout (Min)"
              type="number"
              min={1}
              value={settings.inactivity_timeout_minutes}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  inactivity_timeout_minutes: e.target.value,
                }))
              }
            />
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              Specifies the duration of inactivity before an administrative session is automatically terminated.
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="text-[10px] font-black uppercase tracking-widest px-8 py-2.5 shadow-lg shadow-primary/20"
        >
          {saving && <RiLoader4Line className="animate-spin inline mr-1" size={14} />}
          {saving ? 'Saving…' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SecurityTab;
