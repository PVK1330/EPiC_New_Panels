import { useState, useCallback } from 'react';
import { RiShieldCheckLine, RiShieldKeyholeLine } from 'react-icons/ri';
import Button from '../../../components/Button';
import Input from '../../../components/Input';

const TwoFactorTab = ({ profile, twoFactorLoading, onInitiateSetup, onConfirmSetup, onDisable }) => {
  const twoFactorEnabled = profile?.two_factor_enabled ?? false;

  const [mode, setMode] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [success, setSuccess] = useState('');

  const handleActivate = useCallback(async () => {
    setFieldError('');
    setSuccess('');
    const result = await onInitiateSetup();
    if (result?.ok) {
      setQrCode(result.data?.qrCode);
      setMode('setup');
    } else {
      setFieldError(result?.error || '2FA setup failed');
    }
  }, [onInitiateSetup]);

  const handleVerify = useCallback(async () => {
    const code = otpCode.trim();
    if (!code || code.length !== 6) {
      setFieldError('Enter a valid 6-digit code');
      return;
    }
    setFieldError('');
    const result = await onConfirmSetup(code);
    if (result?.ok) {
      setSuccess('2FA enabled successfully.');
      setMode(null);
      setOtpCode('');
      setQrCode(null);
    } else {
      setFieldError(result?.error || 'Verification failed');
    }
  }, [otpCode, onConfirmSetup]);

  const handleDisable = useCallback(async () => {
    if (!disablePassword) {
      setFieldError('Password is required to disable 2FA');
      return;
    }
    setFieldError('');
    const result = await onDisable({ password: disablePassword });
    if (result?.ok) {
      setSuccess('2FA disabled successfully.');
      setMode(null);
      setDisablePassword('');
    } else {
      setFieldError(result?.error || 'Failed to disable 2FA');
    }
  }, [disablePassword, onDisable]);

  const handleCancel = () => {
    setMode(null);
    setOtpCode('');
    setDisablePassword('');
    setFieldError('');
    setSuccess('');
    setQrCode(null);
  };

  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
        <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
          <RiShieldCheckLine size={32} />
        </div>
        <div className="flex-1">
          <h4 className="text-[12px] font-black text-secondary uppercase tracking-widest mb-1">Two-Factor Authentication</h4>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter leading-relaxed">
            Add an extra layer of security to your administrative account using time-based OTPs.
          </p>
          <div className="mt-3 flex items-center">
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
              twoFactorEnabled
                ? 'bg-green-50 text-green-600 border-green-100'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${twoFactorEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              {twoFactorEnabled ? 'Protection Active' : 'Protection Inactive'}
            </div>
          </div>
        </div>
      </div>

      {success && (
        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">{success}</p>
      )}

      {mode === 'setup' && (
        <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tight">
            Scan the QR code with Google Authenticator or Microsoft Authenticator, then enter the 6-digit code below.
          </p>
          {qrCode && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-gray-100">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            </div>
          )}
          <Input
            label="Enter the 6-digit code from your app"
            type="text"
            value={otpCode}
            onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setFieldError(''); }}
            placeholder="123456"
            maxLength={6}
          />
          {fieldError && (
            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">{fieldError}</p>
          )}
          <div className="flex gap-3">
            <Button
              className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest"
              onClick={handleVerify}
              disabled={twoFactorLoading}
            >
              {twoFactorLoading ? 'Verifying...' : 'Verify and Enable 2FA'}
            </Button>
            <Button variant="outline" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {mode === 'disable' && (
        <div className="p-6 bg-white rounded-2xl border border-red-100 shadow-sm space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-[10px] text-yellow-800 font-bold uppercase">
              Disabling 2FA will reduce your account security. Enter your password to confirm.
            </p>
          </div>
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={disablePassword}
            onChange={(e) => { setDisablePassword(e.target.value); setFieldError(''); }}
          />
          {fieldError && (
            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">{fieldError}</p>
          )}
          <div className="flex gap-3">
            <Button
              className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest bg-red-600 border-red-600 hover:bg-red-700"
              onClick={handleDisable}
              disabled={twoFactorLoading}
            >
              {twoFactorLoading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
            <Button variant="outline" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!mode && (
        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
              <RiShieldKeyholeLine size={24} />
            </div>
            <div className="space-y-1">
              <h5 className="text-[11px] font-black text-secondary uppercase tracking-widest">Authenticator App</h5>
              <p className="text-[9px] text-gray-400 font-bold uppercase">Configure Google or Microsoft Authenticator</p>
            </div>
          </div>
          <button
            onClick={() => { setFieldError(''); setSuccess(''); twoFactorEnabled ? setMode('disable') : handleActivate(); }}
            disabled={twoFactorLoading}
            className={`px-8 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all disabled:opacity-60 ${
              twoFactorEnabled
                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                : 'bg-secondary text-white border-secondary hover:shadow-lg shadow-secondary/20'
            }`}
          >
            {twoFactorLoading ? 'Loading...' : twoFactorEnabled ? 'Disable 2FA' : 'Activate 2FA'}
          </button>
        </div>
      )}

      <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
        <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed text-center tracking-widest">
          MFA IS MANDATORY FOR GLOBAL ADMINISTRATORS TO ENSURE COMPLIANCE WITH DATA PROTECTION STANDARDS.
        </p>
      </div>
    </div>
  );
};

export default TwoFactorTab;
