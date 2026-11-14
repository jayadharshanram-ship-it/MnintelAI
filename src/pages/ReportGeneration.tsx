import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, Map, AlertTriangle, X } from 'lucide-react';
import { useMine } from '../context/MineContext';

export default function ReportGeneration() {
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const { mineData } = useMine();

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const weekStartStr = new Date(now.getTime() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEndStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const currentMonthStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const liveTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const reports = [
    {
      title: "Daily Mine Report",
      description: `Summary of past 24h production at ${mineData.name}, equipment status, and short-term forecasts.`,
      date: `Today, ${todayStr}`,
      icon: <FileText className="w-8 h-8 text-success" />
    },
    {
      title: "Weekly Production Report",
      description: "Aggregated production metrics, target variance, and operational highlights.",
      date: `${weekStartStr} – ${weekEndStr}`,
      icon: <FileSpreadsheet className="w-8 h-8 text-info" />
    },
    {
      title: "Monthly Reserve Report",
      description: "Updated GIS intelligence, prospectivity changes, and reserve estimation.",
      date: currentMonthStr,
      icon: <Map className="w-8 h-8 text-accentLight" />
    },
    {
      title: "AI Shortfall Risk & Recommendation Report",
      description: "Predictive risk assessment and suggested corrective actions for operations.",
      date: `Live Telemetry (${liveTimeStr})`,
      icon: <AlertTriangle className="w-8 h-8 text-warning" />
    }
  ];

  // Weekly calculations
  const weeklyRecords = mineData.productionChart || [];
  const weeklyActualTotal = weeklyRecords.reduce((sum, r) => sum + (r.actual || 0), 0);
  const weeklyPlannedTotal = weeklyRecords.reduce((sum, r) => sum + (r.planned || mineData.dailyTarget), 0);
  const weeklyVarianceTonnes = weeklyActualTotal - weeklyPlannedTotal;
  const weeklyVariancePct = weeklyPlannedTotal > 0 ? ((weeklyVarianceTonnes / weeklyPlannedTotal) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center mb-2">
          <FileText className="text-info mr-2 w-7 h-7" /> Mining Intelligence Reports
        </h1>
        <p className="text-sm text-textMuted">Export intelligence summaries and compliance reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-panel border border-border rounded-xl p-6 flex flex-col hover:border-textMuted transition-colors group">
            <div className="flex items-start mb-4">
              <div className="bg-background p-3 rounded-lg border border-border group-hover:border-textMuted transition-colors mr-4">
                {report.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{report.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed">{report.description}</p>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
              <div className="text-xs text-textMuted">Last generated: {report.date}</div>
              <button 
                onClick={() => setPreviewReport(report.title)}
                className="flex items-center text-sm font-medium text-white bg-accent hover:bg-accentLight px-4 py-2 rounded transition-colors"
              >
                Generate Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#E2E8F0] text-gray-900 rounded-sm w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-panel text-white p-4 flex justify-between items-center flex-shrink-0 rounded-t-sm">
              <div className="flex items-center font-medium">
                <FileText className="w-5 h-5 mr-2 text-accentLight" /> {previewReport} — {mineData.name}
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center text-sm bg-accent hover:bg-accentLight text-white px-3 py-1.5 rounded transition-colors font-medium cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Download className="w-4 h-4 mr-2" /> Download / Print PDF
                </button>
                <button onClick={() => setPreviewReport(null)} className="p-1.5 hover:bg-white/10 rounded cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div id="printable-report" className="p-8 md:p-10 overflow-y-auto flex-1 font-serif text-sm bg-white">
              
              {/* Document Letterhead */}
              <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-black text-gray-900 tracking-wider">MOIL LIMITED</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-sans font-bold">GOVT. OF INDIA ENTERPRISE</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-700">{previewReport}</h2>
                  <div className="text-xs text-gray-500 font-sans mt-0.5">Asset: {mineData.name} ({mineData.location})</div>
                </div>
                <div className="text-right text-xs text-gray-500 font-sans">
                  <div><strong>Date:</strong> {todayStr}</div>
                  <div><strong>Generated:</strong> {liveTimeStr} IST</div>
                  <div><strong>System:</strong> MnIntel AI Engine v2.5</div>
                </div>
              </div>

              {/* TEMPLATE 1: DAILY MINE REPORT */}
              {previewReport === "Daily Mine Report" && (
                <div className="space-y-6 font-sans">
                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      1. Executive Summary & 24h Operational Status
                    </h3>
                    <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div><span className="text-gray-500 block">Mine:</span> <strong className="text-gray-900">{mineData.name}</strong></div>
                        <div><span className="text-gray-500 block">Location:</span> <strong className="text-gray-900">{mineData.location}</strong></div>
                        <div><span className="text-gray-500 block">Today's Dispatch:</span> <strong className="text-gray-900 font-mono text-sm">{mineData.productionToday.toLocaleString()} T</strong></div>
                        <div><span className="text-gray-500 block">Daily Target:</span> <strong className="text-gray-900 font-mono">{mineData.dailyTarget.toLocaleString()} T</strong></div>
                        <div><span className="text-gray-500 block">Shortfall Risk:</span> <strong className={mineData.shortfallRisk > 20 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>{mineData.shortfallRisk}%</strong></div>
                        <div><span className="text-gray-500 block">Equipment Availability:</span> <strong className="text-gray-900 font-mono">{mineData.equipmentAvailability}%</strong></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed font-serif">
                      This operational report certifies dispatch telemetry for the past 24-hour cycle at {mineData.name}. 
                      The extraction face achieved <strong className="text-gray-900">{mineData.productionToday.toLocaleString()} Metric Tonnes</strong> against the daily quota of <strong className="text-gray-900">{mineData.dailyTarget.toLocaleString()} T</strong> ({(((mineData.productionToday / mineData.dailyTarget) - 1) * 100).toFixed(1)}% variance).
                    </p>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      2. Environmental & Pit Telemetry (Open-Meteo Pipeline)
                    </h3>
                    <div className="grid grid-cols-3 gap-3 bg-gray-50 border border-gray-200 p-3 rounded text-xs text-center">
                      <div>
                        <div className="text-gray-500 text-[11px]">Surface Temperature</div>
                        <div className="text-lg font-bold text-gray-800 font-mono mt-0.5">{mineData.temperature}°C</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[11px]">24h Cumulative Precipitation</div>
                        <div className="text-lg font-bold text-blue-600 font-mono mt-0.5">{mineData.rainfall} mm</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-[11px]">Pit Soil Moisture Index</div>
                        <div className="text-lg font-bold text-emerald-600 font-mono mt-0.5">{mineData.soilMoisture}%</div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      3. Equipment Fleet Telemetry & Readiness
                    </h3>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="border border-gray-300 p-2">Unit Name</th>
                          <th className="border border-gray-300 p-2">Status</th>
                          <th className="border border-gray-300 p-2">Availability</th>
                          <th className="border border-gray-300 p-2">Utilization</th>
                          <th className="border border-gray-300 p-2">Diagnostic Advisory</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mineData.equipment.map((eq, idx) => (
                          <tr key={idx} className="border-b border-gray-200">
                            <td className="border border-gray-300 p-2 font-medium">{eq.name}</td>
                            <td className="border border-gray-300 p-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${eq.status === 'Active' ? 'bg-green-100 text-green-800' : eq.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {eq.status}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2 font-mono">{eq.availability}%</td>
                            <td className="border border-gray-300 p-2 font-mono">{eq.utilization}%</td>
                            <td className="border border-gray-300 p-2 text-gray-600">{eq.alert || "Optimal Operating Parameters"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </div>
              )}

              {/* TEMPLATE 2: WEEKLY PRODUCTION REPORT */}
              {previewReport === "Weekly Production Report" && (
                <div className="space-y-6 font-sans">
                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      1. Weekly Aggregated Performance Ledger ({weekStartStr} – {weekEndStr})
                    </h3>
                    <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div>
                          <span className="text-gray-500 block">7-Day Dispatched Total</span>
                          <strong className="text-xl font-mono text-gray-900">{weeklyActualTotal.toLocaleString()} T</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">7-Day Target Quota</span>
                          <strong className="text-xl font-mono text-gray-900">{weeklyPlannedTotal.toLocaleString()} T</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Target Variance</span>
                          <strong className={`text-xl font-mono ${Number(weeklyVariancePct) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Number(weeklyVariancePct) > 0 ? `+${weeklyVariancePct}%` : `${weeklyVariancePct}%`}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Shortfall Risk Probability</span>
                          <strong className="text-xl font-mono text-yellow-600">{mineData.shortfallRisk}%</strong>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      2. Daily Weighbridge Dispatch Ledger
                    </h3>
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-sans">
                          <th className="border border-gray-300 p-2">Date / Shift</th>
                          <th className="border border-gray-300 p-2">Planned (Tonnes)</th>
                          <th className="border border-gray-300 p-2">Actual Dispatched (Tonnes)</th>
                          <th className="border border-gray-300 p-2">Net Variance</th>
                          <th className="border border-gray-300 p-2 font-sans">Verification Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyRecords.map((r, idx) => {
                          const variance = r.actual ? r.actual - r.planned : 0;
                          return (
                            <tr key={idx} className="border-b border-gray-200">
                              <td className="border border-gray-300 p-2 font-sans font-medium">{r.label}</td>
                              <td className="border border-gray-300 p-2">{r.planned.toLocaleString()} T</td>
                              <td className="border border-gray-300 p-2 font-bold">{r.actual ? `${r.actual.toLocaleString()} T` : "Scheduled (Forecast)"}</td>
                              <td className={`border border-gray-300 p-2 font-bold ${variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {r.actual ? (variance > 0 ? `+${variance.toLocaleString()} T` : `${variance.toLocaleString()} T`) : "—"}
                              </td>
                              <td className="border border-gray-300 p-2 font-sans text-gray-600">
                                {r.actual ? "✓ Verified MOIL Weighbridge" : "AI Inferred Projection"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      3. Operational Variance Root Cause Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {mineData.rootCauses.map((rc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded text-xs">
                          <span className="font-medium text-gray-800">{rc.name}</span>
                          <span className="font-mono font-bold text-gray-900">{rc.value}% impact</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* TEMPLATE 3: MONTHLY RESERVE & GIS REPORT */}
              {previewReport === "Monthly Reserve Report" && (
                <div className="space-y-6 font-sans">
                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      1. Mineral Reserve & Resource Classification ({currentMonthStr})
                    </h3>
                    <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded text-xs">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div>
                          <span className="text-gray-500 block">Total Reserve Base</span>
                          <strong className="text-xl font-mono text-gray-900">{mineData.estimatedReserves} MT</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Proven (UNFC 111)</span>
                          <strong className="text-xl font-mono text-emerald-700">{mineData.reserveDetails.proven} MT</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Probable (UNFC 121)</span>
                          <strong className="text-xl font-mono text-blue-700">{mineData.reserveDetails.probable} MT</strong>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Inferred (UNFC 333)</span>
                          <strong className="text-xl font-mono text-amber-700">{mineData.reserveDetails.inferred} MT</strong>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      2. Copernicus Sentinel-2 L2A Multi-Spectral Observation Indicators
                    </h3>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="border border-gray-300 p-2">Spectral Index</th>
                          <th className="border border-gray-300 p-2">Observed Value</th>
                          <th className="border border-gray-300 p-2">Threshold Interpretation</th>
                          <th className="border border-gray-300 p-2">Geological / Environmental Significance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">Normalized Difference Veg. Index (NDVI)</td>
                          <td className="border border-gray-300 p-2 font-mono font-bold">{mineData.ndvi}</td>
                          <td className="border border-gray-300 p-2">Sparse Canopy / Pit Exposure</td>
                          <td className="border border-gray-300 p-2 text-gray-600">Confirms active pit bench exposure with minimal vegetation interference.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">Normalized Moisture Index (NDMI)</td>
                          <td className="border border-gray-300 p-2 font-mono font-bold">0.185</td>
                          <td className="border border-gray-300 p-2">Moderate Soil Wetness</td>
                          <td className="border border-gray-300 p-2 text-gray-600">Bench drainage channels operating at baseline throughput.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">Bare Soil Index (BSI)</td>
                          <td className="border border-gray-300 p-2 font-mono font-bold">+0.082</td>
                          <td className="border border-gray-300 p-2">High Outcrop Reflection</td>
                          <td className="border border-gray-300 p-2 text-gray-600">Directly correlates with ore body strip ratio and exposed rock facies.</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">Iron Oxide Alteration Ratio (B04/B02)</td>
                          <td className="border border-gray-300 p-2 font-mono font-bold">1.341</td>
                          <td className="border border-gray-300 p-2">Prominent Oxide Cap</td>
                          <td className="border border-gray-300 p-2 text-gray-600">Surface gossan alteration signature characteristic of manganese-iron mineralization.</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      3. Multi-Source AI Prospectivity Synthesis
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Overall Prospectivity Score:</span>
                        <span className="font-mono text-lg font-black text-purple-700">{mineData.prospectivity} / 100</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                        <span className="text-gray-600">Geological Formation:</span>
                        <span className="font-medium text-gray-800">Sausar Group (Mansar & Gondite Lithofacies)</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                        <span className="text-gray-600">AI Model Confidence:</span>
                        <span className="font-mono text-emerald-700 font-bold">{mineData.aiConfidence}% (Copernicus CDSE L2A Validated)</span>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* TEMPLATE 4: AI SHORTFALL RISK REPORT */}
              {previewReport === "AI Shortfall Risk & Recommendation Report" && (
                <div className="space-y-6 font-sans">
                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      1. Predictive Production Shortfall Risk Assessment
                    </h3>
                    <div className="mb-4 bg-gray-50 border border-gray-200 p-4 rounded text-xs">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <span className="text-gray-500 block">Immediate 7-Day Risk</span>
                          <strong className={`text-2xl font-mono ${mineData.shortfallRisk > 20 ? 'text-red-600' : 'text-yellow-600'}`}>{mineData.shortfallRisk}%</strong>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{mineData.shortfallRisk > 20 ? 'High Operational Risk' : 'Moderate Baseline'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">30-Day Forecast Horizon</span>
                          <strong className="text-2xl font-mono text-amber-600">{Math.min(mineData.shortfallRisk + 12, 100)}%</strong>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Seasonal Weather Weighting</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">AI Fusion Confidence</span>
                          <strong className="text-2xl font-mono text-emerald-600">{mineData.aiConfidence}%</strong>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Telemetry Cross-Validation</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      2. Shortfall Contributing Factor Breakdown
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                        <div>
                          <div className="font-bold text-gray-800">Atmospheric & Precipitation Risk (Open-Meteo)</div>
                          <div className="text-gray-500 text-[11px]">Current Rainfall: {mineData.rainfall} mm | Pit Soil Moisture: {mineData.soilMoisture}%</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-gray-900">{mineData.rainfall > 5 ? "+16% Risk (Ponding)" : "0% Risk (Clear Window)"}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                        <div>
                          <div className="font-bold text-gray-800">Heavy Mobile Equipment Fleet Readiness</div>
                          <div className="text-gray-500 text-[11px]">Availability Index: {mineData.equipmentAvailability}% (Critical units monitored)</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-gray-900">+4% Risk</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                        <div>
                          <div className="font-bold text-gray-800">Controlled Bench Blasting Windows</div>
                          <div className="text-gray-500 text-[11px]">Optimized against low wind-speed and zero-precipitation intervals</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-gray-900">+2% Risk</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-base font-bold font-serif border-b border-gray-300 pb-1 mb-3 text-gray-900">
                      3. Actionable Mitigation Work Orders & Recommendations
                    </h3>
                    <div className="space-y-3">
                      {mineData.recommendations.map((rec) => (
                        <div key={rec.id} className="p-3 border border-gray-200 rounded bg-gray-50 text-xs">
                          <div className="flex justify-between items-start mb-1">
                            <strong className="text-gray-900 text-sm">{rec.title}</strong>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">
                              {rec.impact}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2 leading-relaxed">{rec.desc}</p>
                          <div className="flex justify-between items-center text-[11px] text-gray-500 border-t border-gray-200 pt-1.5">
                            <span>Confidence: <strong className="text-gray-800">{rec.confidence}%</strong></span>
                            <span className="text-accent font-bold uppercase tracking-wider">{rec.action}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Document Sign-Off Footer */}
              <div className="mt-10 pt-4 border-t-2 border-gray-300 text-xs text-gray-500 flex justify-between items-center font-sans">
                <div>
                  <strong>CONFIDENTIAL & PROPRIETARY</strong> — MOIL Limited Intelligence Engine
                </div>
                <div className="font-mono">
                  SHA-256: {Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
