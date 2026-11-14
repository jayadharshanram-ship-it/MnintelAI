import { useState, useEffect } from 'react';
import { Smartphone, Server, Wifi, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import cx from 'classnames';

export default function MobileTest() {
  const [ipAddress, setIpAddress] = useState<string>('Detecting...');
  const [port] = useState('5173');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // We can extract the current host from window.location
    setIpAddress(window.location.hostname);

    // Test API connection
    fetch('/api/data-status/test')
      .then(res => {
        if (res.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      })
      .catch(() => {
        setApiStatus('error');
      });
  }, []);

  const isLocalhost = ipAddress === 'localhost' || ipAddress === '127.0.0.1';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Smartphone className="mr-2" /> Mobile Connection Test
        </h1>
        <p className="text-sm text-textMuted mt-1">Diagnostic page for local network mobile testing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center"><Wifi className="mr-2 w-5 h-5" /> Access Information</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col border-b border-border pb-3">
              <span className="text-textMuted text-xs mb-1">Mobile Access URL</span>
              <span className="font-bold text-xl text-accentLight bg-background p-2 rounded text-center font-mono">
                http://{ipAddress}:{port}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">LAN Interface</span>
              <span className={cx("font-bold", isLocalhost ? "text-warning" : "text-success")}>
                {isLocalhost ? "Local Only (Not on LAN)" : "LAN Connected"}
              </span>
            </div>
            
            {isLocalhost && (
              <div className="text-xs text-warning bg-warning/10 p-2 rounded flex items-start">
                <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                You are currently viewing this on localhost. To test on mobile, use your PC's IP address on the same Wi-Fi network.
              </div>
            )}
          </div>
        </div>

        <div className="bg-panel border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center"><Server className="mr-2 w-5 h-5" /> Server Status</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Frontend Server (Vite)</span>
              <span className="font-bold text-success flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" /> Running
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Vite Proxy Host</span>
              <span className="font-bold text-white">0.0.0.0</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Backend API (Express)</span>
              <span className={cx(
                "font-bold flex items-center",
                apiStatus === 'checking' ? "text-warning" : apiStatus === 'connected' ? "text-success" : "text-danger"
              )}>
                {apiStatus === 'checking' && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                {apiStatus === 'connected' && <CheckCircle className="w-3 h-3 mr-1" />}
                {apiStatus === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
                {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'connected' ? 'Connected' : 'Connection Failed'}
              </span>
            </div>
            {apiStatus === 'error' && (
              <div className="text-xs text-danger bg-danger/10 p-2 rounded">
                Could not connect to the backend API. Ensure the backend server is running and accessible via the Vite proxy on port 3000.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
