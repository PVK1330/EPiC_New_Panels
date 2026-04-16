import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getMicrosoftStatus, getMicrosoftAuthUrl, disconnectMicrosoft } from '../services/teamsApi';
import { Video, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from './Button';

const MicrosoftConnect = () => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await getMicrosoftStatus();
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to check Microsoft status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const response = await getMicrosoftAuthUrl();
      const authUrl = response.data.authUrl;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to get Microsoft auth URL:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMicrosoft();
      setStatus({ isConnected: false, microsoftEmail: null });
    } catch (error) {
      console.error('Failed to disconnect Microsoft:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 bg-white rounded-xl shadow-sm">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // return (
  //   <div className="bg-white rounded-xl shadow-sm p-6">
  //     <div className="flex items-center justify-between">
  //       <div className="flex items-center gap-4">
  //         <div className={`p-3 rounded-full ${status?.isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
  //           <Video className={`w-6 h-6 ${status?.isConnected ? 'text-green-600' : 'text-gray-400'}`} />
  //         </div>
  //         <div>
  //           <h3 className="font-semibold text-gray-900">Microsoft Teams Integration</h3>
  //           <p className="text-sm text-gray-500">
  //             {status?.isConnected 
  //               ? `Connected as ${status?.microsoftEmail}`
  //               : 'Connect to create and manage Teams meetings'
  //             }
  //           </p>
  //         </div>
  //       </div>

  //       <div className="flex items-center gap-3">
  //         {status?.isConnected ? (
  //           <>
  //             <CheckCircle className="w-5 h-5 text-green-500" />
  //             <Button
  //               variant="outline"
  //               size="sm"
  //               onClick={handleDisconnect}
  //             >
  //               Disconnect
  //             </Button>
  //           </>
  //         ) : (
  //           <>
  //             <XCircle className="w-5 h-5 text-gray-300" />
  //             <Button
  //               size="sm"
  //               onClick={handleConnect}
  //               disabled={connecting}
  //             >
  //               {connecting ? 'Connecting...' : 'Connect'}
  //             </Button>
  //           </>
  //         )}
  //       </div>
  //     </div>

  //     {status?.isConnected && status?.isTokenExpired && (
  //       <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
  //         <p className="text-sm text-yellow-800">
  //           ⚠️ Your Microsoft token has expired. Please reconnect your account.
  //         </p>
  //       </div>
  //     )}
  //   </div>
  // );
};

export default MicrosoftConnect;
