import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { ArrowUp, ArrowDown, AlertTriangle, ShieldCheck, CloudRain } from 'lucide-react';
import cx from 'classnames';
import { useMine } from '../context/MineContext';
import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '../api';
import DataStatusPanel from '../components/DataStatusPanel';
import WeatherForecast from '../components/WeatherForecast';

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Dashboard() {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "3M" | "1Y">("7D");
  const { mineData, isLiveMode } = useMine();

  const { data: liveWeather } = useQuery({
    queryKey: ['weather', mineData.name],
    queryFn: () => fetchWeather(mineData.name),
    enabled: isLiveMode,
    refetchInterval: 300000 // 5 minutes
  });

  // Change zone when mine changes so we don't have dangling state
  useEffect(() => { setActiveZone(null); }, [mineData.name]);

  // Generate chart data based on selected mine and time range
  const getProductionData = (mine: any, range: string) => {
    const baseTarget = mine.dailyTarget;
    const data = [];
    
    if (range === "7D") {
      // 7 Daily Points
      for (let i = 1; i <= 7; i++) {
        const isFuture = i > 5;
        data.push({
          label: `Day ${i}`,
          planned: baseTarget,
          actual: isFuture ? null : Math.floor(baseTarget * (0.85 + Math.random() * 0.2)),
          forecast: isFuture ? Math.floor(baseTarget * (0.88 + Math.random() * 0.15)) : null
        });
      }
    } else if (range === "30D") {
      // 30 Daily Points
      for (let i = 1; i <= 30; i++) {
        const isFuture = i > 25;
        data.push({
          label: `D${i}`,
          planned: baseTarget,
          actual: isFuture ? null : Math.floor(baseTarget * (0.8 + Math.random() * 0.25)),
          forecast: isFuture ? Math.floor(baseTarget * (0.85 + Math.random() * 0.2)) : null
        });
      }
    } else if (range === "3M") {
      // 13 Weekly Points
      const weeklyTarget = baseTarget * 7;
      for (let i = 1; i <= 13; i++) {
        const isFuture = i > 10;
        data.push({
          label: `Wk ${i}`,
          planned: weeklyTarget,
          actual: isFuture ? null : Math.floor(weeklyTarget * (0.85 + Math.random() * 0.2)),
          forecast: isFuture ? Math.floor(weeklyTarget * (0.9 + Math.random() * 0.15)) : null
        });
      }
    } else if (range === "1Y") {
      // 12 Monthly Points (similar to existing forecastChart)
      return mine.forecastChart;
    }
    
    return data;
  };

  const productionData = getProductionData(mineData, timeRange);

  const getChartTitle = () => {
    switch (timeRange) {
      case "7D": return "Production Performance — Last 7 Days";
      case "30D": return "Production Performance — Last 30 Days";
      case "3M": return "Production Performance — Last 3 Months";
      case "1Y": return "Production Performance — Last 12 Months";
    }
  };

  const isShortfallExpected = mineData.shortfallRisk > 15;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Mining Operations Overview</h1>
        <p className="text-sm text-textMuted mt-1">AI-powered monitoring of reserves, production and operational risks for {mineData.name}.</p>
      </div>

      <DataStatusPanel />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <KPICard 
          title="Estimated Manganese Reserves" 
          value={`${mineData.estimatedReserves} MT`} 
          trend="+4.2%" 
          trendUp={true}
          subtitle="vs previous assessment"
        />
        <KPICard 
          title="Today's Production" 
          value={`${mineData.productionToday.toLocaleString()} T`} 
          subtitle={`${Math.round((mineData.productionToday / mineData.dailyTarget) * 100)}% of daily target`}
        />
        <KPICard 
          title="Monthly Forecast" 
          value={`${mineData.monthlyProduction.toLocaleString()} T`} 
          subtitle={mineData.monthlyProduction >= mineData.monthlyTarget ? "+3.8% projected" : "-4.2% projected"}
        />
        <KPICard 
          title="Shortfall Risk" 
          value={`${mineData.shortfallRisk}%`} 
          status={mineData.shortfallRisk > 20 ? "High" : mineData.shortfallRisk > 10 ? "Moderate" : "Low"}
          statusColor={mineData.shortfallRisk > 20 ? "text-danger" : mineData.shortfallRisk > 10 ? "text-warning" : "text-success"}
        />
        <KPICard 
          title="Equipment Availability" 
          value={`${mineData.equipmentAvailability}%`} 
          trend={mineData.equipmentAvailability > 85 ? "+3.1%" : "-1.2%"}
          trendUp={mineData.equipmentAvailability > 85}
        />
        <KPICard 
          title="AI Confidence" 
          value={`${mineData.aiConfidence}%`} 
          status="High"
          statusColor="text-success"
          icon={<ShieldCheck className="text-info w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Production Chart */}
        <div className="xl:col-span-2 bg-panel border border-border rounded-xl p-5 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-semibold">{getChartTitle()}</h2>
            <div className="flex space-x-1 sm:space-x-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button 
                onClick={() => setTimeRange("7D")}
                className={cx("px-3 py-2 sm:py-1 text-xs rounded border transition-colors whitespace-nowrap cursor-pointer min-h-[44px] sm:min-h-0", timeRange === "7D" ? "bg-accent border-accent text-white" : "bg-panelHover border-border text-textMuted hover:text-white")}
              >
                <span className="sm:hidden">7D</span><span className="hidden sm:inline">7 Days</span>
              </button>
              <button 
                onClick={() => setTimeRange("30D")}
                className={cx("px-3 py-2 sm:py-1 text-xs rounded border transition-colors whitespace-nowrap cursor-pointer min-h-[44px] sm:min-h-0", timeRange === "30D" ? "bg-accent border-accent text-white" : "bg-panelHover border-border text-textMuted hover:text-white")}
              >
                <span className="sm:hidden">30D</span><span className="hidden sm:inline">30 Days</span>
              </button>
              <button 
                onClick={() => setTimeRange("3M")}
                className={cx("px-3 py-2 sm:py-1 text-xs rounded border transition-colors whitespace-nowrap cursor-pointer min-h-[44px] sm:min-h-0", timeRange === "3M" ? "bg-accent border-accent text-white" : "bg-panelHover border-border text-textMuted hover:text-white")}
              >
                <span className="sm:hidden">3M</span><span className="hidden sm:inline">3 Months</span>
              </button>
              <button 
                onClick={() => setTimeRange("1Y")}
                className={cx("px-3 py-2 sm:py-1 text-xs rounded border transition-colors whitespace-nowrap cursor-pointer min-h-[44px] sm:min-h-0", timeRange === "1Y" ? "bg-accent border-accent text-white" : "bg-panelHover border-border text-textMuted hover:text-white")}
              >
                <span className="sm:hidden">1Y</span><span className="hidden sm:inline">1 Year</span>
              </button>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                <XAxis dataKey={timeRange === "1Y" ? "month" : "label"} stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                {timeRange === "7D" && <ReferenceLine x="Day 5" stroke="#FBBF24" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#94A3B8', fontSize: 12 }} />}
                {timeRange === "30D" && <ReferenceLine x="D25" stroke="#FBBF24" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#94A3B8', fontSize: 12 }} />}
                {timeRange === "3M" && <ReferenceLine x="Wk 10" stroke="#FBBF24" strokeDasharray="3 3" label={{ position: 'top', value: 'This Week', fill: '#94A3B8', fontSize: 12 }} />}
                {timeRange === "1Y" && <ReferenceLine x="May" stroke="#FBBF24" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: '#94A3B8', fontSize: 12 }} />}
                <Line type="monotone" dataKey="planned" stroke="#94A3B8" strokeWidth={2} name="Planned" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} name="Actual" />
                <Line type="monotone" dataKey="forecast" stroke="#FBBF24" strokeWidth={3} strokeDasharray="5 5" name="Forecast" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {isShortfallExpected && (
            <div className="mt-4 flex flex-col p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning text-sm">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="font-medium">⚠ Production shortfall risk detected in Week 4</span>
              </div>
              {isLiveMode && liveWeather?.operationalImpact && (
                <div className="mt-2 text-xs text-textMuted flex items-center border-t border-warning/20 pt-2">
                  <CloudRain className="w-3 h-3 mr-1" />
                  Live Weather Impact: {liveWeather.operationalImpact.productionImpactEstimates} (Rainfall: {liveWeather.rainfall}mm)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Centerpiece */}
        <div className="xl:col-span-1 bg-panel border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold">Manganese Reserve Intelligence</h2>
            <p className="text-xs text-textMuted mt-1">AI-generated exploration prospectivity for {mineData.name}</p>
          </div>
          <div className="flex-1 relative min-h-[300px]">
            <MapContainer 
              center={mineData.coordinates} 
              zoom={13} 
              style={{ height: '100%', width: '100%', background: '#0B0F19' }}
              zoomControl={false}
            >
              <MapController center={mineData.coordinates} />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
              />
              {mineData.zones.map((zone, idx) => (
                <CircleMarker 
                  key={`${mineData.name}-zone-${idx}`}
                  center={[zone.polygon[0][0], zone.polygon[0][1]]} 
                  radius={zone.level === 'Very High' ? 20 : 15} 
                  pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.4 }} 
                  eventHandlers={{ click: () => setActiveZone(zone.name) }}
                >
                  <Popup className="custom-popup">{zone.name} — {zone.level}</Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            
            {activeZone && (() => {
              const zoneData = mineData.zones.find(z => z.name === activeZone);
              if (!zoneData) return null;
              
              return (
                <div className="fixed inset-x-0 bottom-16 md:bottom-auto md:inset-x-auto md:absolute md:top-2 md:right-2 w-full md:w-64 bg-panel/95 backdrop-blur border-t md:border border-border rounded-t-2xl md:rounded-lg shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-xl z-[1000] p-4 text-sm animate-fade-in-up pb-safe">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-accentLight">{zoneData.name}</h3>
                    <button onClick={() => setActiveZone(null)} className="text-textMuted hover:text-white bg-panelHover rounded-full p-1 w-6 h-6 flex items-center justify-center">&times;</button>
                  </div>
                  <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                    <span className="text-textMuted">Prospectivity Score</span>
                    <span className="font-bold text-success">{zoneData.score}/100</span>
                  </div>
                  <div className="space-y-1 text-xs mb-3 hidden sm:block">
                    <div className="flex justify-between"><span>Geological:</span> <span>94%</span></div>
                    <div className="flex justify-between"><span>Spectral:</span> <span>88%</span></div>
                    <div className="flex justify-between"><span>Structural:</span> <span>91%</span></div>
                  </div>
                  <div className="space-y-1 text-xs mb-3 sm:hidden">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-background rounded p-1.5 text-center">Geo: 94%</div>
                      <div className="bg-background rounded p-1.5 text-center">Spec: 88%</div>
                      <div className="bg-background rounded p-1.5 text-center">Struct: 91%</div>
                    </div>
                  </div>
                  <div className="bg-success/10 text-success p-2 rounded text-xs mb-2 text-center font-bold">
                    🟢 High Confidence
                  </div>
                  <button className="w-full bg-accent hover:bg-accentLight text-white py-2 rounded font-bold text-xs">
                    View AI Explanation
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Mobile-friendly Weather Intelligence (Next 24h & 7D Forecast) */}
      <WeatherForecast 
        data={liveWeather} 
        mineName={mineData.name} 
        isLoading={isLiveMode && !liveWeather} 
      />
    </div>
  );
}

function KPICard({ title, value, trend, trendUp, subtitle, status, statusColor, icon }: any) {
  return (
    <div className="bg-panel border border-border rounded-xl p-3 md:p-4 flex flex-col justify-between hover:border-borderHighlight transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[10px] md:text-xs font-medium text-textMuted truncate">{title}</h3>
        {icon && <div>{icon}</div>}
      </div>
      <div className="my-1">
        <span className="text-lg md:text-2xl font-bold text-white group-hover:text-accentLight transition-colors truncate">{value}</span>
      </div>
      <div className="mt-auto flex items-center text-[10px] md:text-xs flex-wrap">
        {trend && (
          <span className={cx("flex items-center font-medium mr-2", trendUp ? "text-success" : "text-danger")}>
            {trendUp ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
            {trend}
          </span>
        )}
        {status && (
          <span className={cx("font-medium flex items-center", statusColor)}>
            <div className={cx("w-2 h-2 rounded-full mr-1.5", statusColor.replace('text-', 'bg-'))}></div>
            {status}
          </span>
        )}
        {subtitle && <span className="text-textMuted truncate ml-1 hidden sm:inline-block">{subtitle}</span>}
      </div>
    </div>
  );
}
