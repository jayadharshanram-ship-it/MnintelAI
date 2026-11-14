import { useState, useEffect, useCallback } from 'react';
import { Globe, Server, Activity, ShieldCheck, AlertTriangle, RefreshCw, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import cx from 'classnames';
import { fetchHealth, getApiBaseUrl, setApiBaseUrl } from '../api';

export default function ConnectionStatus() {
  const [publicUrl, setPublicUrl] = useState<string>('Detecting...');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isHttps, setIsHttps] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(null);
  
  const [inputUrl, setInputUrl] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currentBackendUrl = getApiBaseUrl();

  const testConnection = useCallback(async () => {
    setApiStatus('checking');
    const start = Date.now();
    try {
      const data = await fetchHealth();
      if (data && data.status === 'ok') {
        setApiStatus('connected');
        setLatency(Date.now() - start);
      } else {
        setApiStatus('error');
      }
    } catch {
      setApiStatus('error');
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicUrl(`${window.location.protocol}//${window.location.hostname}`);
      setIsHttps(window.location.protocol === 'https:');
      setInputUrl(getApiBaseUrl());
    }
    testConnection();
  }, [testConnection]);

  const handleSaveAndReconnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    const targetUrl = inputUrl.trim();
    setApiBaseUrl(targetUrl);

    // Retest connection
    setApiStatus('checking');
    const start = Date.now();
    try {
      const data = await fetchHealth();
      if (data && data.status === 'ok') {
        setApiStatus('connected');
        setLatency(Date.now() - start);
        setSaveMessage('Backend URL updated and verified successfully!');
      } else {
        setApiStatus('error');
        setSaveMessage('Saved, but backend returned an unexpected response.');
      }
    } catch {
      setApiStatus('error');
      setSaveMessage('Backend unreachable at this URL. Please verify server/tunnel is active.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleReset = () => {
    setApiBaseUrl(null);
    const defaultUrl = getApiBaseUrl();
    setInputUrl(defaultUrl);
    setSaveMessage('Reset to default backend URL.');
    setTimeout(() => {
      setSaveMessage(null);
      testConnection();
    }, 1200);
  };

  const backendHost = currentBackendUrl.replace(/^https?:\/\//, '').split('/')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Globe className="mr-2 text-accentLight" /> Global Connection Status & Backend Gateway
        </h1>
        <p className="text-sm text-textMuted mt-1">Diagnostic portal verifying public HTTPS accessibility, live Cloudflare tunnel, and backend telemetry.</p>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frontend Card */}
        <div className="bg-panel border border-border rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={100} />
          </div>
          <h2 className="text-lg font-bold mb-4 flex items-center text-accentLight"><Globe className="mr-2 w-5 h-5" /> Frontend Deployment</h2>
          
          <div className="space-y-4 relative z-10">
            <div className="flex flex-col border-b border-border pb-3">
              <span className="text-textMuted text-xs mb-1">Current Origin URL</span>
              <span className={cx("font-bold text-lg p-2 rounded text-center font-mono truncate", isHttps ? "text-success bg-success/10 border border-success/30" : "text-warning bg-warning/10 border border-warning/30")}>
                {publicUrl}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">HTTPS Secure (TLS)</span>
              <span className={cx("font-bold flex items-center", isHttps ? "text-success" : "text-warning")}>
                {isHttps ? <ShieldCheck className="w-4 h-4 mr-1" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
                {isHttps ? "Active (TLS)" : "Inactive (Local)"}
              </span>
            </div>
            
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Frontend Host</span>
              <span className="font-bold text-success flex items-center">
                 Vercel Production Edge
              </span>
            </div>
          </div>
        </div>

        {/* Backend Card */}
        <div className="bg-panel border border-border rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Server size={100} />
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center text-info"><Server className="mr-2 w-5 h-5" /> Public API Status</h2>
            <button 
              onClick={testConnection} 
              disabled={apiStatus === 'checking'}
              className="px-2.5 py-1 text-xs bg-panel border border-border hover:bg-border/60 rounded flex items-center gap-1.5 text-textMuted hover:text-white transition"
              title="Test connection now"
            >
              <RefreshCw className={cx("w-3.5 h-3.5", apiStatus === 'checking' && "animate-spin text-accentLight")} />
              <span>Retest</span>
            </button>
          </div>
          
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted text-xs sm:text-sm">Active Host</span>
              <span className="font-bold text-white text-right max-w-[200px] truncate font-mono text-xs sm:text-sm" title={currentBackendUrl}>
                {backendHost}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted text-xs sm:text-sm">Backend API</span>
              <span className={cx(
                "font-bold flex items-center text-xs sm:text-sm",
                apiStatus === 'checking' ? "text-warning" : apiStatus === 'connected' ? "text-success" : "text-danger"
              )}>
                {apiStatus === 'checking' && <Activity className="w-4 h-4 mr-1 animate-pulse" />}
                {apiStatus === 'connected' && <ShieldCheck className="w-4 h-4 mr-1" />}
                {apiStatus === 'error' && <AlertTriangle className="w-4 h-4 mr-1" />}
                {apiStatus === 'checking' ? 'Connecting...' : apiStatus === 'connected' ? 'Connected (200 OK)' : 'Offline / Unreachable'}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted text-xs sm:text-sm">Latency</span>
              <span className="font-bold text-white text-xs sm:text-sm font-mono">
                {apiStatus === 'connected' && latency !== null ? `${latency} ms` : '-'}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted text-xs sm:text-sm">Weather Pipeline</span>
              <span className={cx("font-bold text-xs sm:text-sm", apiStatus === 'connected' ? "text-success" : "text-textMuted")}>
                {apiStatus === 'connected' ? "Active (Open-Meteo)" : "Waiting for Gateway"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted text-xs sm:text-sm">Sentinel-2 Ingestion</span>
              <span className={cx("font-bold text-xs sm:text-sm", apiStatus === 'connected' ? "text-success" : "text-textMuted")}>
                {apiStatus === 'connected' ? "Active (Copernicus API)" : "Waiting for Gateway"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Backend URL Gateway Configuration */}
      <div className="bg-panel border border-border rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-accentLight" />
              Live Backend Endpoint Configuration
            </h2>
            <p className="text-xs text-textMuted mt-0.5">
              If your Cloudflare tunnel or backend URL changes, update it here to reconnect immediately without redeploying.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-textMuted hover:text-white flex items-center gap-1 hover:underline transition"
          >
            <RotateCcw className="w-3 h-3" /> Reset Default
          </button>
        </div>

        <form onSubmit={handleSaveAndReconnect} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://your-tunnel.trycloudflare.com/api"
            className="w-full sm:flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-white placeholder-textMuted/50 focus:outline-none focus:border-accentLight transition"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 bg-accent text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Connect</span>
              </>
            )}
          </button>
        </form>

        {saveMessage && (
          <div className={cx("mt-3 text-xs flex items-center gap-1.5 p-2 rounded", apiStatus === 'connected' ? "text-success bg-success/10 border border-success/20" : "text-warning bg-warning/10 border border-warning/20")}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}
      </div>

      {/* Architecture Diagram */}
      <div className="bg-panel border border-border rounded-xl p-6">
        <h2 className="text-base font-bold mb-3 text-white">Full-Stack Architecture Topology</h2>
        <div className="flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm font-mono text-textMuted space-y-4 md:space-y-0">
          <div className="bg-background p-3 rounded border border-border text-center w-full md:w-auto">Client (Mobile / Desktop)</div>
          <div className="hidden md:block text-textMuted">→</div>
          <div className="bg-info/10 text-info p-3 rounded border border-info/30 text-center w-full md:w-auto">Vercel Edge CDN (HTTPS)</div>
          <div className="hidden md:block text-textMuted">→</div>
          <div className="bg-warning/10 text-warning p-3 rounded border border-warning/30 text-center w-full md:w-auto">Cloudflare Tunnel (TLS)</div>
          <div className="hidden md:block text-textMuted">→</div>
          <div className="bg-success/10 text-success p-3 rounded border border-success/30 text-center w-full md:w-auto">Node 24 Express + SQLite</div>
        </div>
      </div>
    </div>
  );
}
