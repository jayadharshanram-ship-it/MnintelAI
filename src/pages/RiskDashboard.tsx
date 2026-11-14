import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useMine } from '../context/MineContext';

export default function RiskDashboard() {
  const [showWhy, setShowWhy] = useState(false);
  const { mineData } = useMine();

  const riskLevel = mineData.shortfallRisk > 20 ? "HIGH RISK" : mineData.shortfallRisk > 10 ? "MODERATE RISK" : "LOW RISK";
  const riskColor = mineData.shortfallRisk > 20 ? "text-danger bg-danger/10 border-danger/20" : mineData.shortfallRisk > 10 ? "text-warning bg-warning/10 border-warning/20" : "text-success bg-success/10 border-success/20";
  const riskBarColor = mineData.shortfallRisk > 20 ? "bg-danger" : mineData.shortfallRisk > 10 ? "bg-warning" : "bg-success";
  const riskTextColor = mineData.shortfallRisk > 20 ? "text-danger" : mineData.shortfallRisk > 10 ? "text-warning" : "text-success";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center mb-2">
          Production Shortfall Intelligence
        </h1>
        <p className="text-sm text-textMuted">AI-powered risk forecasting and root-cause analysis for {mineData.name}.</p>
      </div>

      {/* Main Risk Indicator */}
      <div className="bg-panel border border-border rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1 ${riskBarColor}`}></div>
        <div className={`text-7xl font-extrabold mb-2 ${riskTextColor}`}>{mineData.shortfallRisk}%</div>
        <div className={`text-xl font-bold tracking-widest px-4 py-2 rounded-lg border ${riskColor}`}>{riskLevel}</div>
        
        <button 
          onClick={() => setShowWhy(true)}
          className="absolute top-6 right-6 flex items-center space-x-2 bg-background hover:bg-panelHover border border-border px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <HelpCircle className="w-4 h-4 text-info" />
          <span>WHY?</span>
        </button>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-panel border border-border rounded-xl p-6 relative overflow-hidden text-center">
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4">Next 7 Days</h3>
          <div className="text-4xl font-extrabold text-warning">{mineData.shortfallRisk}%</div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-6 relative overflow-hidden text-center">
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4">Next 30 Days</h3>
          <div className="text-4xl font-extrabold text-accentLight">{Math.min(mineData.shortfallRisk + 14, 100)}%</div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-6 relative overflow-hidden text-center">
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4">Next 90 Days</h3>
          <div className="text-4xl font-extrabold text-warning">{Math.min(mineData.shortfallRisk + 9, 100)}%</div>
        </div>
      </div>

      {/* Risk Timeline */}
      <div className="bg-panel border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-8">Risk Timeline (7 Days)</h3>
        <div className="flex justify-between items-center w-full relative px-4">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-border -translate-y-1/2 z-0"></div>
          
          {[
            { day: 'Day 1', label: 'Low', color: 'bg-success border-success' },
            { day: 'Day 2', label: 'Low', color: 'bg-success border-success' },
            { day: 'Day 3', label: 'Moderate', color: 'bg-warning border-warning text-background' },
            { day: 'Day 4', label: 'Moderate', color: 'bg-warning border-warning text-background' },
            { day: 'Day 5', label: mineData.shortfallRisk > 20 ? 'Critical' : 'High', color: mineData.shortfallRisk > 20 ? 'bg-danger border-danger' : 'bg-accentLight border-accentLight' },
            { day: 'Day 6', label: mineData.shortfallRisk > 15 ? 'Critical' : 'Moderate', color: mineData.shortfallRisk > 15 ? 'bg-danger border-danger' : 'bg-warning border-warning' },
            { day: 'Day 7', label: 'High', color: 'bg-accentLight border-accentLight' },
          ].map((item, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className="text-sm font-medium text-textMuted mb-3">{item.day}</div>
              <div className={`w-4 h-4 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.5)] ring-4 ring-background`}>
              </div>
              <div className="text-xs font-semibold mt-3 mt-4">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather vs Production Correlation */}
      <div className="bg-panel border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-2">Weather vs Production Impact (Historical)</h3>
        <p className="text-sm text-textMuted mb-6">Historical correlation between environmental conditions and operational output.</p>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mineData.forecastChart.map((d: any) => ({
              ...d, 
              rainfall: Math.floor(Math.random() * 80) + 10,
            }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
              <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#06B6D4" fontSize={12} tickFormatter={(val) => `${val}mm`} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#E2E8F0' }}
              />
              <Legend iconType="circle" />
              <Bar yAxisId="right" dataKey="rainfall" name="Rainfall (mm)" fill="#06B6D4" opacity={0.3} radius={[4,4,0,0]} barSize={20} />
              <Line yAxisId="left" type="monotone" dataKey="actual" name="Production (T)" stroke="#10B981" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Root-Cause Analysis Modal */}
      {showWhy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-panel border border-border rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-info" /> Why is a shortfall predicted?
              </h2>
              <button onClick={() => setShowWhy(false)} className="text-textMuted hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mineData.rootCauses}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {mineData.rootCauses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0', borderRadius: '0.5rem' }}
                      itemStyle={{ color: '#E2E8F0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-6 flex flex-col justify-center">
                {mineData.rootCauses.map((cause, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium">{cause.name}</span>
                      <span className="text-sm font-bold" style={{ color: cause.color }}>+{cause.value}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${cause.value}%`, backgroundColor: cause.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-border bg-background/50 text-sm text-textMuted">
              <strong>AI Summary:</strong> The prediction model strongly correlates the impending weather front with a high probability of equipment failure, leading to severe haulage constraints.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
