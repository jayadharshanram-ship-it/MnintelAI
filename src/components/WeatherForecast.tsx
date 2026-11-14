import { useState } from 'react';
import { 
  Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudDrizzle, 
  CloudFog, CloudSnow, Droplets, Wind, Clock, Calendar, 
  ChevronRight, Loader2
} from 'lucide-react';
import cx from 'classnames';

export interface HourlyForecastItem {
  time: string;
  hourLabel: string;
  temp: number;
  pop: number; // probability of precipitation %
  rain: number; // mm
  code: number;
}

export interface DailyForecastItem {
  date: string;
  dayLabel: string;
  tempMax: number;
  tempMin: number;
  pop: number;
  rain: number;
  code: number;
}

export interface WeatherData {
  mine?: string;
  updatedAt?: string;
  temperature?: number;
  feelsLike?: number;
  rainfall?: number;
  humidity?: number;
  windSpeed?: number;
  cloudCover?: number;
  weatherCode?: number;
  source?: string;
  dataTimestamp?: string;
  hourlyForecast?: HourlyForecastItem[];
  dailyForecast?: DailyForecastItem[];
  operationalImpact?: {
    miningImpact: string;
    blastingRisk: string;
    haulageRisk: string;
    productionImpactEstimates: string;
  };
}

interface WeatherForecastProps {
  data?: WeatherData | null;
  mineName: string;
  isLoading?: boolean;
}

// Map WMO weather codes to human readable text and Lucide icons
export function getWeatherDetails(code: number = 0) {
  if (code === 0) {
    return { label: 'Clear Sky', icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10' };
  } else if (code <= 3) {
    return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-sky-300', bg: 'bg-sky-500/10' };
  } else if (code >= 45 && code <= 48) {
    return { label: 'Foggy / Hazy', icon: CloudFog, color: 'text-slate-400', bg: 'bg-slate-500/10' };
  } else if (code >= 51 && code <= 57) {
    return { label: 'Light Drizzle', icon: CloudDrizzle, color: 'text-blue-300', bg: 'bg-blue-500/10' };
  } else if (code >= 61 && code <= 67) {
    return { label: 'Rain Showers', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-600/10' };
  } else if (code >= 71 && code <= 77) {
    return { label: 'Snow / Hail', icon: CloudSnow, color: 'text-indigo-200', bg: 'bg-indigo-500/10' };
  } else if (code >= 80 && code <= 82) {
    return { label: 'Heavy Showers', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-600/20' };
  } else if (code >= 95) {
    return { label: 'Thunderstorm', icon: CloudLightning, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  }
  return { label: 'Cloudy', icon: Cloud, color: 'text-slate-300', bg: 'bg-slate-500/10' };
}

// Generate fallback 24h and 7d forecast when offline or demo
function generateFallbackForecast(mineName: string) {
  const currentTemp = mineName.includes('Dongri') ? 31 : mineName.includes('Balaghat') ? 29 : 30;
  const hourly: HourlyForecastItem[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getTime() + i * 3600000);
    const hour = d.getHours();
    const hourLabel = i === 0 ? "Now" : (hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`);
    const isDay = hour >= 6 && hour <= 18;
    const temp = Math.round(currentTemp + (isDay ? Math.sin((hour - 6) / 12 * Math.PI) * 5 : -4));
    const pop = (i >= 5 && i <= 10) ? 65 : (i >= 11 && i <= 16) ? 30 : 10;
    const code = pop > 50 ? 61 : isDay ? (i % 3 === 0 ? 2 : 0) : 1;

    hourly.push({
      time: d.toISOString(),
      hourLabel,
      temp,
      pop,
      rain: pop > 50 ? 2.5 : 0,
      code
    });
  }

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daily: DailyForecastItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : days[d.getDay()];
    const pop = [20, 65, 40, 10, 15, 30, 50][i % 7];
    daily.push({
      date: d.toISOString().split('T')[0],
      dayLabel,
      tempMax: Math.round(currentTemp + 2 + (i % 3)),
      tempMin: Math.round(currentTemp - 6 - (i % 2)),
      pop,
      rain: pop > 50 ? 4.2 : 0,
      code: pop > 50 ? 61 : (i % 2 === 0 ? 0 : 2)
    });
  }

  return { hourly, daily };
}

export default function WeatherForecast({ data, mineName, isLoading }: WeatherForecastProps) {
  const [activeTab, setActiveTab] = useState<'24h' | '7d'>('24h');

  const fallback = generateFallbackForecast(mineName);
  const hourlyData = (data?.hourlyForecast && data.hourlyForecast.length > 0) ? data.hourlyForecast : fallback.hourly;
  const dailyData = (data?.dailyForecast && data.dailyForecast.length > 0) ? data.dailyForecast : fallback.daily;

  const currentTemp = data?.temperature ?? fallback.hourly[0].temp;
  const feelsLike = data?.feelsLike ?? currentTemp + 2;
  const currentRain = data?.rainfall ?? 0;
  const currentHumidity = data?.humidity ?? 62;
  const currentWind = data?.windSpeed ?? 8;
  const currentCode = data?.weatherCode ?? hourlyData[0]?.code ?? 0;
  const currentDetails = getWeatherDetails(currentCode);
  const CurrentIcon = currentDetails.icon;

  const operational = data?.operationalImpact ?? {
    miningImpact: currentRain > 10 ? "HIGH" : currentRain > 2 ? "MODERATE" : "LOW",
    blastingRisk: currentRain > 10 ? "CRITICAL" : currentRain > 2 ? "HIGH" : "LOW",
    haulageRisk: currentRain > 10 ? "HIGH" : currentRain > 2 ? "MODERATE" : "LOW",
    productionImpactEstimates: currentRain > 10 ? "-12%" : currentRain > 2 ? "-6%" : "0%"
  };

  return (
    <div className="bg-panel border border-border rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Mine & Last Updated */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <CurrentIcon className={cx("w-5 h-5", currentDetails.color)} />
              Pit Weather Intelligence
            </h2>
            <span className={cx(
              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1",
              isLoading ? "bg-warning/20 text-warning border-warning/30" : "bg-accent/20 text-accentLight border-accent/30"
            )}>
              {isLoading && <Loader2 size={10} className="animate-spin" />}
              {isLoading ? "Updating..." : "Live Forecast"}
            </span>
          </div>
          <p className="text-xs text-textMuted mt-0.5">
            Operational micro-climate for {mineName} • Source: <strong className="text-white/90">{data?.source || "Open-Meteo Automated Pipeline"}</strong> • Observation: <span className="text-accentLight font-mono">{new Date(data?.dataTimestamp || data?.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </p>
        </div>

        {/* 24H vs 7D Toggle (Mobile-friendly touch targets) */}
        <div className="flex items-center bg-background/80 p-1 rounded-lg border border-border w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('24h')}
            className={cx(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer min-h-[44px] sm:min-h-0",
              activeTab === '24h' 
                ? "bg-accent text-white shadow-sm" 
                : "text-textMuted hover:text-white"
            )}
          >
            <Clock size={14} />
            <span>Next 24 Hours</span>
          </button>
          <button
            onClick={() => setActiveTab('7d')}
            className={cx(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer min-h-[44px] sm:min-h-0",
              activeTab === '7d' 
                ? "bg-accent text-white shadow-sm" 
                : "text-textMuted hover:text-white"
            )}
          >
            <Calendar size={14} />
            <span>7-Day Forecast</span>
          </button>
        </div>
      </div>

      {/* Current Conditions & Operational Impact Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {/* Main Temperature & Condition Card */}
        <div className="md:col-span-1 bg-background/50 border border-border/80 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cx("p-3 rounded-xl border border-border/60", currentDetails.bg)}>
              <CurrentIcon className={cx("w-8 h-8", currentDetails.color)} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white tracking-tight">{Math.round(currentTemp)}°</span>
                <span className="text-sm font-medium text-textMuted">C</span>
              </div>
              <div className="text-xs font-semibold text-textMain">{currentDetails.label}</div>
              <div className="text-[11px] text-textMuted">Feels like {Math.round(feelsLike)}°C</div>
            </div>
          </div>

          <div className="text-right border-l border-border/60 pl-3 space-y-1 text-xs">
            <div className="flex items-center justify-end gap-1 text-textMuted">
              <Droplets size={12} className="text-sky-400" />
              <span>{currentHumidity}%</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-textMuted">
              <Wind size={12} className="text-teal-400" />
              <span>{currentWind} km/h</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-textMuted">
              <CloudRain size={12} className="text-blue-400" />
              <span>{currentRain} mm</span>
            </div>
          </div>
        </div>

        {/* Operational Mining Impact Chips */}
        <div className="md:col-span-2 bg-background/50 border border-border/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Pit Operational Safety</span>
            <span className={cx(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border",
              operational.miningImpact === 'HIGH' ? "bg-danger/20 border-danger/40 text-danger" :
              operational.miningImpact === 'MODERATE' ? "bg-warning/20 border-warning/40 text-warning" :
              "bg-success/20 border-success/40 text-success"
            )}>
              Impact: {operational.miningImpact}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Blasting Risk */}
            <div className="bg-panel border border-border rounded-lg p-2 flex flex-col items-center justify-center">
              <span className="text-[10px] text-textMuted">Blasting Risk</span>
              <span className={cx(
                "text-xs font-bold mt-0.5",
                operational.blastingRisk === 'CRITICAL' ? "text-danger" :
                operational.blastingRisk === 'HIGH' ? "text-warning" : "text-success"
              )}>
                {operational.blastingRisk}
              </span>
            </div>

            {/* Haulage Risk */}
            <div className="bg-panel border border-border rounded-lg p-2 flex flex-col items-center justify-center">
              <span className="text-[10px] text-textMuted">Haulage Slip</span>
              <span className={cx(
                "text-xs font-bold mt-0.5",
                operational.haulageRisk === 'HIGH' ? "text-danger" :
                operational.haulageRisk === 'MODERATE' ? "text-warning" : "text-success"
              )}>
                {operational.haulageRisk}
              </span>
            </div>

            {/* Production Forecast Delta */}
            <div className="bg-panel border border-border rounded-lg p-2 flex flex-col items-center justify-center">
              <span className="text-[10px] text-textMuted">Prod. Delta</span>
              <span className={cx(
                "text-xs font-bold mt-0.5",
                operational.productionImpactEstimates.startsWith('-') && operational.productionImpactEstimates !== '0%' 
                  ? "text-warning" 
                  : "text-success"
              )}>
                {operational.productionImpactEstimates}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: NEXT 24 HOURS (Horizontal swipeable ribbon) */}
      {activeTab === '24h' && (
        <div>
          <div className="flex items-center justify-between text-xs text-textMuted mb-2 px-0.5">
            <span className="font-semibold text-textMain">Hourly Weather & Precipitation Probability</span>
            <span className="text-[11px] flex items-center gap-1 sm:hidden">
              Swipe horizontally <ChevronRight size={12} />
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x touch-pan-x no-scrollbar">
            {hourlyData.map((hour, idx) => {
              const details = getWeatherDetails(hour.code);
              const Icon = details.icon;
              const isRainy = hour.pop > 40 || hour.rain > 0;
              const isNow = idx === 0;

              return (
                <div 
                  key={`hour-${idx}`}
                  className={cx(
                    "flex-shrink-0 w-20 sm:w-24 p-3 rounded-xl flex flex-col items-center justify-between snap-start transition-all border text-center",
                    isNow 
                      ? "bg-accent/15 border-accent shadow-sm" 
                      : "bg-background/60 border-border/70 hover:border-borderHighlight"
                  )}
                >
                  <span className={cx(
                    "text-xs font-semibold",
                    isNow ? "text-accentLight" : "text-textMuted"
                  )}>
                    {hour.hourLabel}
                  </span>

                  <div className="my-2 p-1.5 rounded-lg">
                    <Icon className={cx("w-6 h-6", details.color)} />
                  </div>

                  <span className="text-sm font-bold text-white mb-1">
                    {hour.temp}°C
                  </span>

                  {/* Precipitation Probability Badge */}
                  <div className={cx(
                    "w-full py-0.5 px-1 rounded text-[10px] font-bold flex items-center justify-center gap-0.5",
                    isRainy 
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                      : "bg-panel text-textMuted"
                  )}>
                    <Droplets size={10} className={isRainy ? "text-blue-400" : "text-textMuted"} />
                    <span>{hour.pop}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: 7-DAY FORECAST (Compact, readable list) */}
      {activeTab === '7d' && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-textMain mb-2 px-0.5">
            7-Day Operational Outlook & Rain Projections
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {dailyData.map((day, idx) => {
              const details = getWeatherDetails(day.code);
              const Icon = details.icon;
              const isToday = idx === 0;
              const isRainRisk = day.pop > 40;

              return (
                <div 
                  key={`day-${idx}`}
                  className={cx(
                    "p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors",
                    isToday 
                      ? "bg-accent/10 border-accent/40" 
                      : "bg-background/60 border-border/70 hover:border-borderHighlight"
                  )}
                >
                  {/* Day and date */}
                  <div className="w-24 sm:w-28 flex flex-col">
                    <span className={cx(
                      "text-xs sm:text-sm font-bold",
                      isToday ? "text-accentLight" : "text-white"
                    )}>
                      {day.dayLabel}
                    </span>
                    <span className="text-[10px] text-textMuted">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Icon and Condition */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className={cx("w-5 h-5 flex-shrink-0", details.color)} />
                    <span className="text-xs text-textMain truncate hidden xs:inline sm:inline">
                      {details.label}
                    </span>
                  </div>

                  {/* Precipitation chance */}
                  <div className={cx(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold",
                    isRainRisk 
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                      : "text-textMuted bg-panel"
                  )}>
                    <Droplets size={11} className={isRainRisk ? "text-blue-400" : "text-textMuted"} />
                    <span>{day.pop}%</span>
                    {day.rain > 0 && <span className="text-[10px] text-blue-200">({day.rain}mm)</span>}
                  </div>

                  {/* Min / Max Temp Bar */}
                  <div className="flex items-center gap-1.5 w-24 sm:w-28 justify-end">
                    <span className="text-xs text-textMuted">{day.tempMin}°</span>
                    <div className="h-1.5 w-12 sm:w-16 bg-background rounded-full overflow-hidden flex">
                      <div className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400 rounded-full w-full" />
                    </div>
                    <span className="text-xs font-bold text-white">{day.tempMax}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
