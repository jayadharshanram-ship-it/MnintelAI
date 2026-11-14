import { useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useMine } from '../context/MineContext';
import { Activity, Wifi, WifiOff, Server, HardDrive, RefreshCw } from 'lucide-react';
import cx from 'classnames';
import { fetchWeather, fetchSatellite, fetchDataStatus } from '../api';

export default function NetworkTest() {
  const network = useNetworkStatus();
  const { mineData, dataSaverMode, setDataSaverMode } = useMine();
  
  const [latencyTests, setLatencyTests] = useState<Record<string, { time: number, status: string }>>({});
  const [isTesting, setIsTesting] = useState(false);

  const runLatencyTest = async () => {
    setIsTesting(true);
    const tests = { weather: 0, satellite: 0, status: 0 };
    
    try {
      const startW = performance.now();
      await fetchWeather(mineData.name).catch(() => {});
      tests.weather = performance.now() - startW;
      setLatencyTests(prev => ({ ...prev, weather: { time: tests.weather, status: getStatus(tests.weather) } }));

      const startS = performance.now();
      await fetchSatellite(mineData.name).catch(() => {});
      tests.satellite = performance.now() - startS;
      setLatencyTests(prev => ({ ...prev, satellite: { time: tests.satellite, status: getStatus(tests.satellite) } }));

      const startD = performance.now();
      await fetchDataStatus(mineData.name).catch(() => {});
      tests.status = performance.now() - startD;
      setLatencyTests(prev => ({ ...prev, status: { time: tests.status, status: getStatus(tests.status) } }));

    } finally {
      setIsTesting(false);
    }
  };

  const getStatus = (ms: number) => {
    if (ms < 300) return 'success';
    if (ms < 1000) return 'warning';
    return 'danger';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <Activity className="mr-2" /> MnIntel Network & Device Test Center
        </h1>
        <p className="text-sm text-textMuted mt-1">Developer tools for testing application resilience and caching.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center"><Wifi className="mr-2 w-5 h-5" /> Current Connection</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Status</span>
              <span className={cx("font-bold", network.online ? "text-success" : "text-danger")}>
                {network.online ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Effective Type</span>
              <span className="font-bold text-white uppercase">{network.effectiveType || 'Unknown'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Downlink</span>
              <span className="font-bold text-white">{network.downlink ? `${network.downlink} Mbps` : 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">RTT (Latency)</span>
              <span className="font-bold text-white">{network.rtt ? `${network.rtt} ms` : 'N/A'}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-textMuted">Data Saver</span>
              <span className={cx("font-bold", network.saveData ? "text-warning" : "text-textMuted")}>
                {network.saveData ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center"><HardDrive className="mr-2 w-5 h-5" /> Storage & Cache</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">Service Worker</span>
              <span className="font-bold text-success">Active (Vite PWA)</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-textMuted">React Query Cache</span>
              <span className="font-bold text-success">Active</span>
            </div>
            <div className="flex justify-between items-center border-b border-border pb-2">
              <span className="text-textMuted">Data Saver Mode</span>
              <button 
                onClick={() => setDataSaverMode(!dataSaverMode)}
                className={cx("px-3 py-1 rounded text-xs font-bold transition-colors", dataSaverMode ? "bg-warning text-background" : "bg-panelHover text-white")}
              >
                {dataSaverMode ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-xl p-6 md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center"><Server className="mr-2 w-5 h-5" /> API Latency Monitor</h2>
            <button 
              onClick={runLatencyTest}
              disabled={isTesting || !network.online}
              className="bg-accent hover:bg-accentLight disabled:opacity-50 px-4 py-2 rounded text-sm font-bold flex items-center transition-colors text-white"
            >
              <RefreshCw className={cx("w-4 h-4 mr-2", isTesting && "animate-spin")} />
              {isTesting ? "Testing..." : "Run Latency Test"}
            </button>
          </div>
          
          {!network.online && (
            <div className="p-4 bg-danger/10 border border-danger/30 rounded text-danger text-sm mb-4">
              <WifiOff className="w-4 h-4 inline mr-2" />
              Cannot run API tests while offline.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <LatencyCard name="Weather API" result={latencyTests.weather} />
            <LatencyCard name="Satellite API" result={latencyTests.satellite} />
            <LatencyCard name="Data Status API" result={latencyTests.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LatencyCard({ name, result }: { name: string, result?: { time: number, status: string } }) {
  if (!result) {
    return (
      <div className="bg-background border border-border rounded-lg p-4 flex flex-col items-center justify-center opacity-50">
        <div className="text-sm font-bold text-textMuted">{name}</div>
        <div className="text-xs text-textMuted mt-1">Not tested</div>
      </div>
    );
  }

  const isSuccess = result.status === 'success';
  const isWarning = result.status === 'warning';
  
  return (
    <div className={cx(
      "border rounded-lg p-4 flex flex-col items-center justify-center relative overflow-hidden",
      isSuccess ? "bg-success/10 border-success/30 text-success" :
      isWarning ? "bg-warning/10 border-warning/30 text-warning" : "bg-danger/10 border-danger/30 text-danger"
    )}>
      <div className="text-sm font-bold text-white mb-1 z-10 relative">{name}</div>
      <div className="text-2xl font-extrabold z-10 relative flex items-center">
        {Math.round(result.time)} <span className="text-sm ml-1 opacity-70">ms</span>
      </div>
      <div className="text-[10px] uppercase font-bold tracking-wider mt-1 z-10 relative">
        {isSuccess ? 'Excellent' : isWarning ? 'Moderate' : 'Slow'}
      </div>
    </div>
  );
}
