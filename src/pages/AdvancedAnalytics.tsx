import { BarChart3, Filter } from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Area, ComposedChart
} from 'recharts';

const scatterData = [
  { rain: 10, production: 8500 }, { rain: 20, production: 8200 }, { rain: 45, production: 7600 },
  { rain: 60, production: 6200 }, { rain: 80, production: 4800 }, { rain: 5, production: 8600 },
  { rain: 30, production: 7900 }, { rain: 90, production: 4100 },
];

const barData = [
  { name: 'Jan', actual: 240, planned: 245 }, { name: 'Feb', actual: 230, planned: 220 },
  { name: 'Mar', actual: 250, planned: 250 }, { name: 'Apr', actual: 210, planned: 245 },
];

const reserveData = [
  { year: '2022', reserve: 28.4, production: 2.1 },
  { year: '2023', reserve: 27.1, production: 2.3 },
  { year: '2024', reserve: 25.8, production: 2.2 },
  { year: '2025', reserve: 24.2, production: 2.5 },
  { year: '2026', reserve: 24.8, production: 1.8 }, // Discovered new reserves
];

import { useMine } from '../context/MineContext';

const downtimeProdData = [
  { downtime: 2, prod: 8600 }, { downtime: 4, prod: 8200 }, { downtime: 8, prod: 7500 },
  { downtime: 12, prod: 6800 }, { downtime: 18, prod: 5400 }, { downtime: 24, prod: 4200 },
];

export default function AdvancedAnalytics() {
  const { mineData } = useMine();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center mb-2">
            <BarChart3 className="text-accent mr-2 w-7 h-7" /> Advanced Mining Analytics
          </h1>
          <p className="text-sm text-textMuted">Cross-domain data correlation and historical trends.</p>
        </div>
        <button className="flex items-center space-x-2 bg-panel border border-border px-4 py-2 rounded-lg text-sm hover:bg-panelHover transition-colors text-white font-medium">
          <Filter className="w-4 h-4" /> <span>Global Filters</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="bg-panel border border-border px-3 py-1 text-xs rounded-full text-accentLight border-accentLight/50 bg-accent/10 cursor-pointer">Mine: {mineData.name}</span>
        <span className="bg-panel border border-border px-3 py-1 text-xs rounded-full text-textMuted hover:text-white cursor-pointer">Date: YTD</span>
        <span className="bg-panel border border-border px-3 py-1 text-xs rounded-full text-textMuted hover:text-white cursor-pointer">Equipment: All</span>
        <span className="bg-panel border border-border px-3 py-1 text-xs rounded-full text-textMuted hover:text-white cursor-pointer">Production Type: ROM</span>
        <span className="bg-panel border border-border px-3 py-1 text-xs rounded-full text-textMuted hover:text-white cursor-pointer">Ore Grade: High</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-panel border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-textMuted">1. Production vs Rainfall</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                <XAxis type="number" dataKey="rain" name="Rainfall" unit="mm" stroke="#94A3B8" fontSize={12} />
                <YAxis type="number" dataKey="production" name="Prod" unit=" T" stroke="#94A3B8" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0' }} />
                <Scatter data={scatterData} fill="#06B6D4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-panel border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-textMuted">2. Downtime vs Production</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                <XAxis type="number" dataKey="downtime" name="Downtime" unit="h" stroke="#94A3B8" fontSize={12} />
                <YAxis type="number" dataKey="prod" name="Prod" unit=" T" stroke="#94A3B8" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0' }} />
                <Scatter data={downtimeProdData} fill="#EF4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3 */}
        <div className="bg-panel border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-textMuted">3. Monthly Planned vs Actual</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => `${v}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0' }} />
                <Legend iconType="circle" />
                <Bar dataKey="planned" name="Planned" fill="#2A3441" radius={[2, 2, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4 */}
        <div className="bg-panel border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-6 uppercase tracking-wider text-textMuted">4. Reserve Depletion vs Discovery</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={reserveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" vertical={false} />
                <XAxis dataKey="year" stroke="#94A3B8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} domain={['auto', 'auto']} unit="MT" />
                <YAxis yAxisId="right" orientation="right" stroke="#D97706" fontSize={12} unit="MT" />
                <Tooltip contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0' }} />
                <Legend iconType="circle" />
                <Area yAxisId="left" type="monotone" dataKey="reserve" name="Total Reserve" fill="#06B6D4" stroke="#06B6D4" fillOpacity={0.2} />
                <Bar yAxisId="right" dataKey="production" name="Annual Production" fill="#D97706" radius={[2, 2, 0, 0]} barSize={20} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}


