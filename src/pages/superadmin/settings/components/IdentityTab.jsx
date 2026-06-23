import { useEffect, useRef } from 'react';
import {
  RiUploadCloud2Line, RiDeleteBinLine,
  RiNotification3Line, RiUserLine, RiPulseLine,
  RiLoader4Line, RiImageLine,
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';
import usePlatformIdentity from '../../../../hooks/usePlatformIdentity';
import { resolveAssetUrl } from '../../../../utils/assetUrl';

const LOCALES = [
  { value: 'en-GB', label: 'UK (GBP)'       },
  { value: 'en-US', label: 'US (USD)'       },
  { value: 'en-AU', label: 'AU (AUD)'       },
];

const TIMEZONES = [
  { value: 'Europe/London',       label: 'GMT / London'      },
  { value: 'America/New_York',    label: 'EST / New York'    },
  { value: 'America/Chicago',     label: 'CST / Chicago'     },
  { value: 'America/Denver',      label: 'MST / Denver'      },
  { value: 'America/Los_Angeles', label: 'PST / Los Angeles' },
  { value: 'Asia/Dubai',          label: 'GST / Dubai'       },
];

const TOGGLES = [
  { id: 'maintenance_mode',  label: 'Maintenance', icon: RiNotification3Line, color: 'text-amber-500' },
  { id: 'signups_enabled',   label: 'Signups',     icon: RiUserLine,          color: 'text-blue-500'  },
  { id: 'analytics_enabled', label: 'Analytics',   icon: RiPulseLine,         color: 'text-primary'   },
];

// ── Reusable upload zone ─────────────────────────────────────────────────────
const UploadZone = ({ label, currentUrl, uploading, accept, onFile, onClear }) => {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFile(file);
      // reset so the same file can be re-selected after a clear
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {/* Drop / preview zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`
          aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center
          relative overflow-hidden transition-all cursor-pointer group
          ${uploading ? 'opacity-60 cursor-wait' : ''}
          ${currentUrl
            ? 'border-primary/30 bg-primary/5 hover:border-primary/60'
            : 'border-gray-200 bg-gray-50 hover:border-primary/40 hover:bg-primary/5'}
        `}
      >
        {uploading ? (
          <RiLoader4Line className="animate-spin text-primary" size={24} />
        ) : currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <>
            <RiUploadCloud2Line size={22} className="text-gray-300 group-hover:text-primary transition-colors" />
            <p className="text-[10px] font-black text-gray-400 mt-1.5 uppercase tracking-widest group-hover:text-primary transition-colors">
              {label}
            </p>
            <p className="text-[9px] text-gray-300 mt-0.5">Click or drag & drop</p>
          </>
        )}

        {/* Hover overlay when image is set */}
        {currentUrl && !uploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <RiUploadCloud2Line size={20} className="text-white" />
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Replace</p>
            </div>
          </div>
        )}
      </div>

      {/* Clear button — only shown when an image is set */}
      {currentUrl && !uploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="flex items-center gap-1 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
        >
          <RiDeleteBinLine size={12} />
          Remove
        </button>
      )}
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────
const IdentityTab = () => {
  const {
    settings,
    setSettings,
    loading,
    saving,
    uploadingLogo,
    uploadingFavicon,
    fetchIdentitySettings,
    saveIdentitySettings,
    uploadLogo,
    uploadFavicon,
  } = usePlatformIdentity();

  useEffect(() => {
    fetchIdentitySettings().then((r) => {
      if (!r.ok) toast.error('Failed to load identity settings');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (key, value) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleToggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogoFile = async (file) => {
    const result = await uploadLogo(file);
    if (result.ok) toast.success('Logo uploaded');
    else toast.error(result.error?.response?.data?.message || 'Logo upload failed');
  };

  const handleFaviconFile = async (file) => {
    const result = await uploadFavicon(file);
    if (result.ok) toast.success('Favicon uploaded');
    else toast.error(result.error?.response?.data?.message || 'Favicon upload failed');
  };

  const handleSave = async () => {
    // Strip logo_url / favicon_url — those are saved via their own upload endpoints
    const { logo_url, favicon_url, ...textSettings } = settings;
    const result = await saveIdentitySettings(textSettings);
    if (result.ok) toast.success('Identity settings saved');
    else
      toast.error(
        result.error?.response?.data?.message ||
          result.error?.message ||
          'Failed to save',
      );
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

        {/* ── Brand Assets ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Brand Assets</h4>
          <p className="text-[10px] text-gray-400 font-medium -mt-2">
            Logo: PNG, JPG, WEBP · max 2 MB · Favicon: PNG, ICO, WEBP · max 512 KB · changes apply immediately
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-0.5 flex items-center gap-1">
                <RiImageLine size={11} /> App Logo
              </p>
              <UploadZone
                label="App Logo"
                currentUrl={resolveAssetUrl(settings.logo_url)}
                uploading={uploadingLogo}
                accept="image/png,image/jpeg,image/webp"
                onFile={handleLogoFile}
                onClear={() => handleChange('logo_url', null)}
              />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-0.5 flex items-center gap-1">
                <RiImageLine size={11} /> Favicon
              </p>
              <UploadZone
                label="Favicon"
                currentUrl={resolveAssetUrl(settings.favicon_url)}
                uploading={uploadingFavicon}
                accept="image/png,image/x-icon,image/webp"
                onFile={handleFaviconFile}
                onClear={() => handleChange('favicon_url', null)}
              />
            </div>
          </div>
        </div>

        {/* ── General Info ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          <h4 className="text-xs font-black text-secondary uppercase tracking-widest">General Info</h4>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Platform Name"
              value={settings.platform_name}
              onChange={(e) => handleChange('platform_name', e.target.value)}
            />
            <Input
              label="Support Email"
              type="email"
              value={settings.support_email}
              onChange={(e) => handleChange('support_email', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Default Locale
                </label>
                <select
                  value={settings.default_locale}
                  onChange={(e) => handleChange('default_locale', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-secondary outline-none"
                >
                  {LOCALES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-secondary outline-none"
                >
                  {TIMEZONES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Core Toggles ─────────────────────────────────────────────────── */}
      <div className="pt-6 border-t border-gray-50 space-y-4">
        <h4 className="text-xs font-black text-secondary uppercase tracking-widest">Core Toggles</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TOGGLES.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white transition-all"
            >
              <div className="flex items-center gap-3">
                <item.icon className={item.color} size={18} />
                <p className="text-xs font-black text-secondary uppercase tracking-tight">{item.label}</p>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-all shadow-inner ${settings[item.id] ? 'bg-primary' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${settings[item.id] ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || uploadingLogo || uploadingFavicon}
          className="text-[10px] font-black uppercase tracking-widest px-8 py-2.5 shadow-lg shadow-primary/20"
        >
          {saving && <RiLoader4Line className="animate-spin inline mr-1" size={14} />}
          {saving ? 'Saving…' : 'Save Identity Settings'}
        </Button>
      </div>
    </div>
  );
};

export default IdentityTab;
