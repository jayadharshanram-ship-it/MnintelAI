import { Pickaxe } from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useMine } from '../context/MineContext';

export default function ProductionForecast() {
  const { mineData } = useMine();
  
  const expectedGap = mineData.monthlyTarget - mineData.monthlyProduction;
  const isGap = expectedGap > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center mb-2">
          <Pickaxe className="text-success mr-2 w-7 h-7" /> Production Forecast & Planning
        </h1>
        <p className="text-sm text-textMuted">Forecast and planning metrics for {mineData.name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Current Production</h3>
          <div className="text-3xl font-bold">{mineData.productionToday.toLocaleString()} <span className="text-sm font-normal text-textMuted">T/day</span></div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">Monthly Target</h3>
          <div className="text-3xl font-bold text-textMuted">{mineData.monthlyTarget.toLocaleString()} <span className="text-sm font-normal">T</span></div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>
          <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">AI Forecast</h3>
          <div className="text-3xl font-bold text-warning">{mineData.monthlyProduction.toLocaleString()} <span className="text-sm font-normal">T</span></div>
        </div>
        <div className="bg-panel border border-border rounded-xl p-5 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${isGap ? 'bg-danger' : 'bg-success'}`}></div>
          <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2">{isGap ? 'Expected Gap' : 'Expected Surplus'}</h3>
          <div className={`text-3xl font-bold ${isGap ? 'text-danger' : 'text-success'}`}>{Math.abs(expectedGap).toLocaleString()} <span className="text-sm font-normal">T</span></div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-panel border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Historical vs Planned vs AI Forecast</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mineData.forecastChart} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0', borderRadius: '0.5rem' }}
                formatter={(value: any) => [`${value.toLocaleString()} T`, undefined]}
              />
              <Legend />
              <Bar dataKey="planned" name="Planned Production" fill="#1E2638" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="actual" name="Actual Production" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
              <Line type="monotone" dataKey="forecast" name="AI Forecast" stroke="#FBBF24" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#FBBF24', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-2">7 Day Forecast</h3>
          <div className="text-4xl font-light text-white">{(mineData.productionToday * 7).toLocaleString()} <span className="text-base text-textMuted font-normal">T</span></div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
            <span className="text-textMuted">vs Target</span>
            <span className={mineData.productionToday < mineData.dailyTarget ? "text-danger font-medium" : "text-success font-medium"}>
              {(((mineData.productionToday / mineData.dailyTarget) - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-background border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-2">30 Day Forecast</h3>
          <div className="text-4xl font-light text-white">{mineData.monthlyProduction.toLocaleString()} <span className="text-base text-textMuted font-normal">T</span></div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
            <span className="text-textMuted">vs Target</span>
            <span className={mineData.monthlyProduction < mineData.monthlyTarget ? "text-danger font-medium" : "text-success font-medium"}>
              {(((mineData.monthlyProduction / mineData.monthlyTarget) - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-background border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-2">90 Day Forecast</h3>
          <div className="text-4xl font-light text-white">{(mineData.monthlyProduction * 3).toLocaleString()} <span className="text-base text-textMuted font-normal">T</span></div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
            <span className="text-textMuted">vs Target</span>
            <span className={mineData.monthlyProduction < mineData.monthlyTarget ? "text-danger font-medium" : "text-success font-medium"}>
              {(((mineData.monthlyProduction / mineData.monthlyTarget) - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
