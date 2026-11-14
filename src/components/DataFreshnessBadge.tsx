import { Database, Satellite, CloudSun, Clock, Info } from 'lucide-react';
import cx from 'classnames';

interface DataFreshnessBadgeProps {
  source: string;
  timestamp?: string;
  observationDate?: string;
  isLiveMode?: boolean;
  type?: 'weather' | 'satellite' | 'ml' | 'general';
  compact?: boolean;
}

export default function DataFreshnessBadge({
  source,
  timestamp,
  observationDate,
  isLiveMode = true,
  type = 'general',
  compact = false
}: DataFreshnessBadgeProps) {
  const formattedObs = observationDate ? formatDateTime(observationDate) : null;
  const formattedTime = timestamp ? formatDateTime(timestamp) : null;

  function formatDateTime(isoStr: string) {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  }

  const TypeIcon = type === 'weather' ? CloudSun : type === 'satellite' ? Satellite : Database;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-[10px] text-textMuted flex-wrap">
        <span className={cx(
          "px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] border flex items-center gap-1",
          isLiveMode ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30"
        )}>
          {isLiveMode ? "● Real Data" : "▲ Demo Data"}
        </span>
        <span className="truncate">{source}</span>
        {formattedObs && (
          <span className="text-white/80">Observed: {formattedObs}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-panel/90 border border-border/80 rounded-lg p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <div className="p-1.5 rounded-md bg-accent/10 border border-accent/20 text-accentLight flex-shrink-0">
          <TypeIcon size={14} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-white truncate">{source}</span>
            <span className={cx(
              "px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-[9px] border",
              isLiveMode ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30"
            )}>
              {isLiveMode ? "Verified Real Observation" : "Synthetic Demo Model"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-textMuted mt-0.5 flex-wrap">
            {formattedObs && (
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-accentLight" />
                <span>Observation: <strong className="text-white/90">{formattedObs}</strong></span>
              </span>
            )}
            {formattedTime && (
              <span className="hidden sm:inline text-textMuted/70">
                Pipeline Ingestion: {formattedTime}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-textMuted bg-background/60 px-2 py-1 rounded border border-border/60 self-stretch sm:self-auto justify-center">
        <Info size={11} className="text-info" />
        <span>Automated SIH Pipeline</span>
      </div>
    </div>
  );
}
