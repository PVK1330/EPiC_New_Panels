import { useState, useRef } from 'react';
import { RiUser3Line, RiMailLine, RiPhoneLine, RiCamera2Line } from 'react-icons/ri';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

const ProfileTab = ({ profile, saving, uploadingAvatar, onSave, onAvatarUpload }) => {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    mobile: profile?.mobile || '',
    country_code: profile?.country_code || '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaveSuccess(false);
  };

  const handleReset = () => {
    setForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      mobile: profile?.mobile || '',
      country_code: profile?.country_code || '',
    });
    setSaveSuccess(false);
  };

  const handleSubmit = async () => {
    const result = await onSave(form);
    if (result?.ok) setSaveSuccess(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onAvatarUpload(file);
  };

  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`.toUpperCase() || 'SA';

  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex items-center gap-8">
        <div className="relative group">
          <div
            className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl font-black text-secondary shadow-inner relative overflow-hidden group-hover:border-primary/20 transition-all cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {profile?.profile_pic ? (
              <img src={profile.profile_pic} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
            <div className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center">
              {uploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RiCamera2Line size={24} className="text-white mb-1" />
                  <span className="text-[8px] text-white font-black uppercase tracking-widest">Change</span>
                </>
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-primary shadow-md">
            <RiUser3Line size={16} />
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest mb-1.5">Avatar Identity</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-4">Recommended: 512x512px, PNG or JPG</p>
          <Button
            variant="outline"
            className="px-5 py-1.5 text-[9px] font-black uppercase tracking-widest border-gray-200"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? 'Uploading...' : 'Upload New'}
          </Button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          value={form.first_name}
          onChange={handleChange('first_name')}
          icon={<RiUser3Line />}
        />
        <Input
          label="Last Name"
          value={form.last_name}
          onChange={handleChange('last_name')}
        />
        <div className="md:col-span-2">
          <Input
            label="Email Address"
            value={profile?.email || ''}
            disabled
            icon={<RiMailLine />}
            className="bg-gray-50/50"
          />
          <p className="text-[9px] text-gray-400 font-bold uppercase mt-2 ml-1">Contact your system provider to change the primary administrator email.</p>
        </div>
        <Input
          label="Country Code"
          value={form.country_code}
          onChange={handleChange('country_code')}
          placeholder="+44"
        />
        <Input
          label="Phone Number"
          value={form.mobile}
          onChange={handleChange('mobile')}
          icon={<RiPhoneLine />}
        />
      </div>

      {saveSuccess && (
        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Profile saved successfully.</p>
      )}

      <div className="pt-8 border-t border-gray-50 flex justify-end gap-3">
        <Button variant="outline" className="px-8 py-2.5 text-[10px] font-black uppercase tracking-widest" onClick={handleReset}>
          Reset
        </Button>
        <Button
          className="px-10 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
