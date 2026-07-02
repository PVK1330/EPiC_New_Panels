import { useState } from 'react';
import { RiLockPasswordLine, RiShieldFlashLine } from 'react-icons/ri';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { validatePasswordStrength } from '../../../utils/constants';

const SecurityTab = ({ changingPassword, onChangePassword }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldError, setFieldError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldError('');
    setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setFieldError('All fields are required');
      return;
    }
    const pwErr = validatePasswordStrength(form.newPassword);
    if (pwErr) {
      setFieldError(pwErr);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setFieldError('New password and confirm password do not match');
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setFieldError('New password must be different from your current password');
      return;
    }

    const result = await onChangePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    });

    if (result?.ok) {
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setFieldError(result?.error || 'Password update failed');
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <RiLockPasswordLine className="text-primary" size={18} />
          <h4 className="text-[11px] font-black text-secondary uppercase tracking-widest">Credential Update</h4>
        </div>
        <Input
          label="Current Password"
          type="password"
          placeholder="••••••••"
          value={form.currentPassword}
          onChange={handleChange('currentPassword')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={form.newPassword}
            onChange={handleChange('newPassword')}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
          />
        </div>
      </div>

      {fieldError && (
        <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">{fieldError}</p>
      )}
      {success && (
        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Password updated successfully.</p>
      )}

      <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-4">
        <RiShieldFlashLine className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-[10px] text-amber-700 font-black uppercase tracking-tight mb-1">Security Protocol</p>
          <p className="text-[9px] text-amber-600/80 font-bold uppercase leading-relaxed">
            Changing your password will terminate all other active administrative sessions across devices for maximum security.
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50 flex justify-end">
        <Button
          className="px-10 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/10 bg-secondary text-white border-secondary"
          onClick={handleSubmit}
          disabled={changingPassword}
        >
          {changingPassword ? 'Updating...' : 'Update Security'}
        </Button>
      </div>
    </div>
  );
};

export default SecurityTab;
