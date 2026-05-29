import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getGoogleAuthUrl, getGoogleStatus, disconnectGoogle } from '../services/googleApi';
import { Video, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from './Button';
import { useToast } from '../context/ToastContext';

const SYNC_MESSAGES = {
  google_success: { variant: 'success', message: 'Google Calendar connected successfully.' },
  google_access_denied: {
    variant: 'danger',
    message: 'Google access was denied. Add your Gmail as a test user in Google Cloud Console, then try again.',
  },
  google_error: { variant: 'danger', message: 'Google connection failed. Please try again.' },
  google_unauthorized: { variant: 'danger', message: 'Session expired during Google sign-in. Log in and connect again.' },
};

const GoogleConnect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sync = params.get('sync');
    if (!sync || !sync.startsWith('google_')) return;

    const info = SYNC_MESSAGES[sync];
    if (info) {
      showToast({ message: info.message, variant: info.variant });
    }

    if (sync === 'google_success') {
      checkStatus();
    }

    params.delete('sync');
    const nextSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : '' },
      { replace: true },
    );
  }, [location.search, location.pathname, navigate, showToast]);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await getGoogleStatus();
      // some endpoints return nested `data` or flat; normalize
      const data = response?.data || response;
      setStatus(data);
    } catch (error) {
      console.error('Failed to check Google status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setConnectError("");
      const response = await getGoogleAuthUrl();
      const authUrl = response.data?.url || response.url || response?.authUrl;
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }
      setConnectError("No Google authorization URL was returned by the server.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start Google sign-in.";
      setConnectError(message);
      console.error("Failed to get Google auth URL:", error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogle();
      setStatus({ connected: false, email: null });
    } catch (error) {
      console.error('Failed to disconnect Google:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-white rounded-xl shadow-sm">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${status?.connected ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Video className={`w-6 h-6 ${status?.connected ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Google Meet Integration</h3>
            <p className="text-sm text-gray-500">
              {status?.connected 
                ? `Connected as ${status?.email || status?.microsoftEmail}`
                : 'Connect to sync Google Calendar and create Meet links'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status?.connected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-gray-300" />
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </Button>
            </>
          )}
        </div>
      </div>

      {connectError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{connectError}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleConnect;
