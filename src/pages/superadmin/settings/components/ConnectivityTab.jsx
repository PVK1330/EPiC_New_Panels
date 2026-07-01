import { useEffect, useState } from 'react';
import {
  RiMailLine, RiUploadCloud2Line,
  RiLoader4Line, RiCheckLine, RiErrorWarningLine,
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';
import usePlatformConnectivity from '../../../../hooks/usePlatformConnectivity';

const ENCRYPTION_OPTIONS = [
  { value: 'tls',  label: 'TLS (STARTTLS)' },
  { value: 'ssl',  label: 'SSL'             },
  { value: 'none', label: 'None'            },
];

const ConnectivityTab = () => {
  const {
    smtp, setSmtp,
    s3,   setS3,
    loading, saving, testing, sendingTest, testResult, sendTestResult,
    markDirty,
    fetchConnectivitySettings,
    saveConnectivitySettings,
    runSmtpTest,
    runSmtpSendTest,
  } = usePlatformConnectivity();

  const [testRecipient, setTestRecipient] = useState('demo@gmail.com');

  // Fetch on mount
  useEffect(() => {
    fetchConnectivitySettings().then((result) => {
      if (!result.ok) toast.error('Failed to load connectivity settings');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSmtp = (key, value) => {
    setSmtp((prev) => ({ ...prev, [key]: value }));
    if (key === 'password') markDirty('smtp_password');
  };

  const handleS3 = (key, value) => {
    setS3((prev) => ({ ...prev, [key]: value }));
    if (key === 'access_key') markDirty('s3_access_key');
    if (key === 'secret_key') markDirty('s3_secret_key');
  };

  const handleSave = async () => {
    const result = await saveConnectivitySettings({ smtp, s3 });
    if (result.ok) {
      toast.success('Connectivity settings saved');
    } else {
      toast.error(result.error?.response?.data?.message || result.error || 'Failed to save connectivity settings');
    }
  };

  const handleTestSmtp = async () => {
    const result = await runSmtpTest();
    if (result.ok) {
      toast.success('SMTP connection verified');
    } else {
      toast.error(result.error || 'SMTP connection failed');
    }
  };

  const handleSendTestEmail = async () => {
    const to = testRecipient.trim().toLowerCase();
    if (!to || !to.includes('@')) {
      toast.error('Enter a valid test recipient email');
      return;
    }
    const result = await runSmtpSendTest(to);
    if (result.ok) {
      toast.success(result.message || `Test email sent to ${to}.`);
    } else if (result.ownerNotified) {
      toast.error(
        `${result.error || 'Test email could not be sent'}. A delivery failure notice was sent to your SMTP inbox (check for "Address not found").`,
        { duration: 12000 },
      );
    } else {
      toast.error(result.error || 'Test email could not be sent');
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
      {/* ── SMTP — full-width card, two internal columns ─────────────────── */}
      <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 text-primary">
            <RiMailLine size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-secondary uppercase tracking-tight">
              Email Server (SMTP)
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Outbound mail delivery
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — server configuration */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Server Configuration
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="SMTP Host"
                value={smtp.host}
                onChange={(e) => handleSmtp('host', e.target.value)}
                placeholder="smtp.sendgrid.net"
              />
              <Input
                label="Username"
                value={smtp.username}
                onChange={(e) => handleSmtp('username', e.target.value)}
                placeholder="apikey"
              />
            </div>
            <Input
              label="Password"
              type="password"
              value={smtp.password}
              onChange={(e) => handleSmtp('password', e.target.value)}
              placeholder="Enter new password to change"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Port"
                type="number"
                value={smtp.port}
                onChange={(e) => handleSmtp('port', e.target.value)}
                placeholder="587"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Encryption
                </label>
                <select
                  value={smtp.encryption}
                  onChange={(e) => handleSmtp('encryption', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-black text-secondary outline-none"
                >
                  {ENCRYPTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test result banner */}
            {testResult && (
              <div className={`flex items-start gap-2 p-3 rounded-lg text-xs font-bold border ${
                testResult.ok
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {testResult.ok
                  ? <RiCheckLine size={16} className="shrink-0 mt-0.5" />
                  : <RiErrorWarningLine size={16} className="shrink-0 mt-0.5" />}
                <span>
                  {testResult.ok
                    ? 'Connection verified successfully.'
                    : (testResult.error || 'Connection failed.')}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              onClick={handleTestSmtp}
              disabled={testing}
              className="w-full text-[10px] font-black uppercase tracking-widest"
            >
              {testing
                ? <><RiLoader4Line className="animate-spin inline mr-1" size={13} />Testing…</>
                : 'Test Connection'}
            </Button>
          </div>

          {/* Right — send real test email */}
          <div className="lg:border-l lg:border-gray-100 lg:pl-8 space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Send Real Test Email
            </p>
            <div className="p-4 bg-gray-50/60 rounded-xl border border-gray-100 space-y-3">
              <Input
                label="Recipient"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="demo@gmail.com"
              />
              {sendTestResult && (
                <div className={`flex items-start gap-2 p-3 rounded-lg text-xs font-bold border ${
                  sendTestResult.ok
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {sendTestResult.ok
                    ? <RiCheckLine size={16} className="shrink-0 mt-0.5" />
                    : <RiErrorWarningLine size={16} className="shrink-0 mt-0.5" />}
                  <span>
                    {sendTestResult.ok
                      ? 'Test message accepted by SMTP server. Check the recipient inbox (and spam).'
                      : sendTestResult.ownerNotified
                        ? `Send failed. A delivery failure notice was sent to ${sendTestResult.smtpOwnerInbox || smtp.username || 'your SMTP account'}.`
                        : (sendTestResult.error || 'Send failed.')}
                  </span>
                </div>
              )}
              <Button
                variant="primary"
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="w-full text-[10px] font-black uppercase tracking-widest"
              >
                {sendingTest
                  ? <><RiLoader4Line className="animate-spin inline mr-1" size={13} />Sending…</>
                  : 'Send Test Email'}
              </Button>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Sends a one-off message through the configured server to confirm
                end-to-end delivery. Save your settings first if you changed them.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── S3 (disabled) ────────────────────────────────────────────────── */}
      {/* <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <RiUploadCloud2Line className="text-primary" size={20} />
            <h4 className="text-xs font-black text-secondary uppercase tracking-widest">
              Cloud Storage (S3)
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Bucket Name"
              value={s3.bucket_name}
              onChange={(e) => handleS3('bucket_name', e.target.value)}
              placeholder="epic-assets"
            />
            <Input
              label="Region"
              value={s3.region}
              onChange={(e) => handleS3('region', e.target.value)}
              placeholder="eu-west-1"
            />
            <Input
              label="Access Key"
              value={s3.access_key}
              onChange={(e) => handleS3('access_key', e.target.value)}
              placeholder="Enter new access key to change"
            />
            <Input
              label="Secret Key"
              type="password"
              value={s3.secret_key}
              onChange={(e) => handleS3('secret_key', e.target.value)}
              placeholder="Enter new secret key to change"
            />
            <Input
              label="Endpoint (optional)"
              value={s3.endpoint}
              onChange={(e) => handleS3('endpoint', e.target.value)}
              placeholder="https://s3.custom-provider.com"
            />
          </div>
        </div> */}

      {/* Save */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="text-[10px] font-black uppercase tracking-widest px-8 py-2.5 shadow-lg shadow-primary/20"
        >
          {saving && <RiLoader4Line className="animate-spin inline mr-1" size={14} />}
          {saving ? 'Saving…' : 'Save Connectivity Settings'}
        </Button>
      </div>
    </div>
  );
};

export default ConnectivityTab;
