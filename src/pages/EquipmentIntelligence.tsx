import { useState, useMemo } from 'react';
import { 
  Settings, CheckCircle2, AlertTriangle, XCircle, Wrench, Activity, Clock, 
  Layers, Filter, ArrowUpRight, Zap, RefreshCw, Check, MapPin, Truck, ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import cx from 'classnames';
import { useMine, type Equipment } from '../context/MineContext';

export default function EquipmentIntelligence() {
  const { mineData, updateEquipment } = useMine();
  
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');
  const [selectedShift, setSelectedShift] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Available Materials in the current mine's fleet
  const materialsList = useMemo(() => {
    const set = new Set<string>();
    mineData.equipment.forEach(eq => {
      if (eq.materialTarget) set.add(eq.materialTarget);
    });
    return Array.from(set);
  }, [mineData.equipment]);

  // Filtered equipment list based on selected material & shift
  const filteredEquipment = useMemo(() => {
    return mineData.equipment.filter(eq => {
      const matchMaterial = selectedMaterial === 'ALL' || eq.materialTarget === selectedMaterial;
      const matchShift = selectedShift === 'ALL' || 
        (selectedShift === 'SHIFT_1' && (eq.neededShift?.includes('Shift 1') || eq.neededShift?.includes('Continuous') || eq.whenNeeded?.includes('Now'))) ||
        (selectedShift === 'SHIFT_2' && (eq.neededShift?.includes('Shift 2') || eq.neededShift?.includes('Continuous') || eq.whenNeeded?.includes('14:00') || eq.whenNeeded?.includes('13:30'))) ||
        (selectedShift === 'SHIFT_3' && (eq.neededShift?.includes('Shift 3') || eq.status === 'Critical' || eq.status === 'Maintenance Soon'));
      return matchMaterial && matchShift;
    });
  }, [mineData.equipment, selectedMaterial, selectedShift]);

  // Category Colors Palette
  const equipColors = ['#10B981', '#06B6D4', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

  // Dynamic Fleet Utilization Data (6 operating checkpoints)
  const dynamicUtilData = useMemo(() => {
    const timeSlots = [
      { time: '06:00', label: 'Shift 1 Start', factor: 0.75 },
      { time: '08:30', label: 'Morning Peak', factor: 1.05 },
      { time: '11:00', label: 'Mid-Shift Haul', factor: 0.98 },
      { time: '13:30', label: 'Blasting / Handover', factor: 0.65 },
      { time: '16:00', label: 'Shift 2 Peak', factor: 1.02 },
      { time: '18:30', label: 'Evening Haul', factor: 0.94 },
      { time: '21:00', label: 'Night Handover', factor: 0.70 }
    ];

    const targetList = filteredEquipment.length > 0 ? filteredEquipment : mineData.equipment;

    return timeSlots.map(slot => {
      const row: Record<string, any> = { 
        time: slot.time, 
        phase: slot.label 
      };

      targetList.forEach((eq, idx) => {
        const key = `eq_${idx}`;
        let baseUtil = eq.status === 'Critical' ? 15 : eq.status === 'Standby' ? 25 : eq.utilization;
        // Apply operational variance per time slot
        if (slot.time === '13:30' && eq.category === 'Excavator') {
          baseUtil *= 0.5; // Bench cleared for blasting
        } else if (slot.time === '13:30' && eq.category === 'Pumping') {
          baseUtil *= 1.35; // Sump drainage peak
        } else if (slot.time === '08:30' && eq.category === 'Drill') {
          baseUtil *= 1.15; // Blasthole drilling pattern
        } else {
          baseUtil *= slot.factor;
        }
        row[key] = Math.min(100, Math.max(0, Math.round(baseUtil)));
      });

      return row;
    });
  }, [filteredEquipment, mineData.equipment]);

  // Equipment Demand vs Available Fleet (Units)
  const demandVsAvailableData = useMemo(() => {
    const categories: Record<string, { required: number; available: number; total: number }> = {
      'Excavator': { required: 2, available: 0, total: 0 },
      'Haulage': { required: 3, available: 0, total: 0 },
      'Drill': { required: 1, available: 0, total: 0 },
      'Pumping': { required: 1, available: 0, total: 0 },
      'Processing': { required: 1, available: 0, total: 0 }
    };

    mineData.equipment.forEach(eq => {
      const cat = eq.category || 'Excavator';
      if (!categories[cat]) {
        categories[cat] = { required: 1, available: 0, total: 0 };
      }
      categories[cat].total += 1;
      if (eq.status === 'Active') {
        categories[cat].available += 1;
      }
    });

    // Material-based required calculation
    if (selectedMaterial.includes('High-Grade')) {
      if (categories['Excavator']) categories['Excavator'].required = 2;
      if (categories['Haulage']) categories['Haulage'].required = 3;
    } else if (selectedMaterial.includes('Overburden')) {
      if (categories['Excavator']) categories['Excavator'].required = 2;
      if (categories['Haulage']) categories['Haulage'].required = 4;
      if (categories['Drill']) categories['Drill'].required = 2;
    }

    return Object.entries(categories).map(([name, stat]) => ({
      category: name,
      Required: stat.required,
      Available: stat.available,
      Deficit: Math.max(0, stat.required - stat.available)
    }));
  }, [mineData.equipment, selectedMaterial]);

  // Downtime Data for 7d horizontal chart
  const downtimeData = useMemo(() => {
    return (filteredEquipment.length > 0 ? filteredEquipment : mineData.equipment).map(eq => ({
      name: eq.name.split(' ')[0],
      fullName: eq.name,
      value: parseFloat(eq.downtime.toString()) || 0,
      status: eq.status
    }));
  }, [filteredEquipment, mineData.equipment]);

  // Quick Action Handler
  const handleDeployStandby = (eq: Equipment) => {
    updateEquipment(eq.name, {
      status: 'Active',
      whenNeeded: 'Needed Now (Dispatched to Face)',
      utilization: 88,
      availability: 98,
      alert: null
    });
    setActionNotice(`Successfully dispatched ${eq.name} to active face. Equipment deficit cleared!`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleCompleteService = (eq: Equipment) => {
    updateEquipment(eq.name, {
      status: 'Active',
      whenNeeded: 'Needed Now (Returned from Maintenance)',
      availability: 96,
      utilization: 84,
      downtime: Math.max(0, parseFloat(eq.downtime.toString()) - 4),
      alert: null,
      hoursUntilMaintenance: 120
    });
    setActionNotice(`Service completed for ${eq.name}. Unit certified for full production.`);
    setTimeout(() => setActionNotice(null), 4500);
  };

  const handleReassignBench = (eq: Equipment) => {
    const locations = ['Bench 4 North', 'Face 12B High-Grade', 'West Ridge Bench 2', 'Main Haul Siding'];
    const currentIdx = locations.indexOf(eq.benchLocation);
    const nextLoc = locations[(currentIdx + 1) % locations.length];
    updateEquipment(eq.name, { benchLocation: nextLoc });
    setActionNotice(`Reallocated ${eq.name} to ${nextLoc}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Material summary metrics
  const activeCount = filteredEquipment.filter(e => e.status === 'Active').length;
  const standbyCount = filteredEquipment.filter(e => e.status === 'Standby').length;
  const criticalCount = filteredEquipment.filter(e => e.status === 'Critical' || e.status === 'Maintenance Soon').length;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center mb-1">
            <Settings className="text-accentLight mr-2.5 w-7 h-7" /> Equipment Intelligence & Material Allocation
          </h1>
          <p className="text-sm text-textMuted">
            Dynamic fleet allocation, material handling schedules, and predictive maintenance for <strong className="text-white">{mineData.name}</strong>.
          </p>
        </div>

        {/* Global Availability Badge */}
        <div className="flex items-center gap-3 bg-panel border border-border px-4 py-2 rounded-xl shadow-sm">
          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-textMuted block font-bold">Fleet Availability</span>
            <span className="text-xl font-bold text-success font-mono">{mineData.equipmentAvailability}%</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center text-success">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-success/15 border border-success/30 text-success px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">{actionNotice}</span>
        </div>
      )}

      {/* Material & Shift Filter Controls */}
      <div className="bg-panel border border-border rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Material Tabs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textMuted">
              <Layers className="w-3.5 h-3.5 text-accentLight" />
              <span>Target Material Handling:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMaterial('ALL')}
                className={cx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5",
                  selectedMaterial === 'ALL'
                    ? "bg-accent text-white shadow-md font-bold"
                    : "bg-background border border-border text-textMuted hover:text-white hover:border-textMuted/40"
                )}
              >
                <span>All Materials</span>
                <span className="text-[10px] opacity-75 font-mono">({mineData.equipment.length})</span>
              </button>
              {materialsList.map(mat => {
                const count = mineData.equipment.filter(e => e.materialTarget === mat).length;
                return (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={cx(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5",
                      selectedMaterial === mat
                        ? "bg-accent text-white shadow-md font-bold"
                        : "bg-background border border-border text-textMuted hover:text-white hover:border-textMuted/40"
                    )}
                  >
                    <span>{mat}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operational Shift Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-textMuted">
              <Clock className="w-3.5 h-3.5 text-info" />
              <span>When Needed (Operating Window):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'All Shifts (24h)' },
                { id: 'SHIFT_1', label: 'Shift 1 (06:00 - 14:00)' },
                { id: 'SHIFT_2', label: 'Shift 2 (14:00 - 22:00)' },
                { id: 'SHIFT_3', label: 'Shift 3 (Maintenance)' }
              ].map(shift => (
                <button
                  key={shift.id}
                  onClick={() => setSelectedShift(shift.id)}
                  className={cx(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition",
                    selectedShift === shift.id
                      ? "bg-info text-white shadow-md font-bold"
                      : "bg-background border border-border text-textMuted hover:text-white hover:border-textMuted/40"
                  )}
                >
                  {shift.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Context Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
          <div className="bg-background/60 p-2.5 rounded-lg border border-border/60">
            <span className="text-[11px] text-textMuted block">Active In Production</span>
            <span className="text-base font-bold text-success font-mono flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4" /> {activeCount} Units Ready
            </span>
          </div>
          <div className="bg-background/60 p-2.5 rounded-lg border border-border/60">
            <span className="text-[11px] text-textMuted block">Standby Reserves</span>
            <span className="text-base font-bold text-accentLight font-mono flex items-center gap-1.5 mt-0.5">
              <Layers className="w-4 h-4" /> {standbyCount} Units In Reserve
            </span>
          </div>
          <div className="bg-background/60 p-2.5 rounded-lg border border-border/60">
            <span className="text-[11px] text-textMuted block">Critical / Service Due</span>
            <span className={cx("text-base font-bold font-mono flex items-center gap-1.5 mt-0.5", criticalCount > 0 ? "text-danger" : "text-textMuted")}>
              <AlertTriangle className="w-4 h-4" /> {criticalCount} Units Attention
            </span>
          </div>
          <div className="bg-background/60 p-2.5 rounded-lg border border-border/60">
            <span className="text-[11px] text-textMuted block">Material Quota Today</span>
            <span className="text-base font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
              <Truck className="w-4 h-4 text-info" />
              {selectedMaterial === 'ALL' ? `${mineData.dailyTarget.toLocaleString()} MT Target` : `${Math.round(mineData.dailyTarget * 0.65).toLocaleString()} MT Target`}
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipment.map((eq) => (
          <DetailedEquipmentCard
            key={eq.name}
            equipment={eq}
            onDeploy={handleDeployStandby}
            onCompleteService={handleCompleteService}
            onReassign={handleReassignBench}
          />
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="bg-panel border border-border rounded-xl p-8 text-center text-textMuted">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-semibold text-white">No equipment matches the active filter criteria.</p>
          <p className="text-xs mt-1">Try switching to &quot;All Materials&quot; or &quot;All Shifts&quot; above.</p>
        </div>
      )}

      {/* Dynamic Visualizations: Utilization & Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Fleet Utilization Chart */}
        <div className="bg-panel border border-border rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <Activity className="w-4 h-4 mr-2 text-info" /> Dynamic Fleet Hourly Utilization
              </h3>
              <p className="text-xs text-textMuted mt-0.5">
                Real-time operational cycle matching active equipment for {mineData.name}
              </p>
            </div>
            <span className="text-[11px] font-mono bg-info/10 text-info border border-info/30 px-2 py-0.5 rounded">
              {filteredEquipment.length} Active Machines
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicUtilData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} unit="%" domain={[0, 100]} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataItem = dynamicUtilData.find(d => d.time === label);
                      return (
                        <div className="bg-panel border border-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 font-mono">
                          <div className="font-bold text-white border-b border-border pb-1 flex justify-between gap-4">
                            <span>{label}</span>
                            <span className="text-accentLight">{dataItem?.phase}</span>
                          </div>
                          {payload.map((entry: any, i: number) => {
                            const eqObj = (filteredEquipment.length > 0 ? filteredEquipment : mineData.equipment)[i];
                            return (
                              <div key={i} className="flex justify-between items-center gap-3">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke }} />
                                  <span className="text-textMuted">{eqObj?.name.split(' ')[0] || entry.name}</span>
                                </span>
                                <span className="font-bold text-white">{entry.value}%</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(_value, _entry, index) => {
                    const eqObj = (filteredEquipment.length > 0 ? filteredEquipment : mineData.equipment)[index];
                    return <span className="text-[11px] text-textMuted hover:text-white">{eqObj?.name.split(' ')[0] || `Equip ${index+1}`}</span>;
                  }}
                />
                {(filteredEquipment.length > 0 ? filteredEquipment : mineData.equipment).map((eq, idx) => {
                  const color = equipColors[idx % equipColors.length];
                  return (
                    <Area
                      key={eq.name}
                      type="monotone"
                      dataKey={`eq_${idx}`}
                      stackId="1"
                      stroke={color}
                      fill={color}
                      fillOpacity={0.4}
                      name={eq.name.split(' ')[0]}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Demand vs Available Fleet (Units) */}
        <div className="bg-panel border border-border rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 text-warning" /> Fleet Demand vs Available Capacity
              </h3>
              <p className="text-xs text-textMuted mt-0.5">
                Required machinery units to sustain daily target vs currently active units
              </p>
            </div>
            <span className="text-[11px] font-mono bg-warning/10 text-warning border border-warning/30 px-2 py-0.5 rounded">
              Material Target: {selectedMaterial === 'ALL' ? 'Total Pit' : selectedMaterial.split(' ')[0]}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandVsAvailableData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" vertical={false} />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`${val} Units`, name]}
                />
                <Legend verticalAlign="bottom" height={36} iconType="square" />
                <Bar dataKey="Required" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Required Units" />
                <Bar dataKey="Available" fill="#10B981" radius={[4, 4, 0, 0]} name="Available / Active">
                  {demandVsAvailableData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Available < entry.Required ? '#EF4444' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Downtime Trend & Predictive Maintenance Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Downtime Bar Chart */}
        <div className="bg-panel border border-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-danger" /> 7-Day Downtime Breakdown
            </h3>
            <span className="text-xs text-textMuted">Cumulative Hours</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downtimeData} layout="vertical" margin={{ top: 5, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" horizontal={false} vertical={true} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} unit="h" tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={65} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, _name: any, item: any) => [`${val} hours (${item.payload.fullName})`, 'Downtime']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {downtimeData.map((entry, index) => (
                    <Cell key={`dt-cell-${index}`} fill={entry.value > 12 ? '#EF4444' : entry.value > 6 ? '#F59E0B' : '#06B6D4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Predictive Maintenance & Intervention Work Orders */}
        <div className="bg-panel border border-border rounded-xl p-5 shadow-lg lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center">
              <Wrench className="w-4 h-4 mr-2 text-accentLight" /> Predictive Maintenance Advisory & Active Alerts
            </h3>
            <p className="text-xs text-textMuted mb-4">
              AI sensor diagnostic triggers (thermal, pressure, vibration) prioritized by operational criticality.
            </p>

            <div className="space-y-3">
              {mineData.equipment.filter(eq => eq.alert).map((eq) => (
                <div 
                  key={eq.name} 
                  className={cx(
                    "p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition",
                    eq.status === 'Critical' 
                      ? "bg-danger/10 border-danger/40" 
                      : "bg-warning/10 border-warning/40"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cx("px-2 py-0.5 rounded text-[10px] font-bold uppercase", eq.status === 'Critical' ? "bg-danger text-white" : "bg-warning text-gray-900")}>
                        {eq.status}
                      </span>
                      <h4 className="font-bold text-white text-sm">{eq.name}</h4>
                    </div>
                    <p className="text-xs text-textMuted">
                      <strong className="text-white">{eq.alert}</strong> — Next scheduled service in <span className="text-warning font-mono font-bold">{eq.hoursUntilMaintenance || 0} hrs</span>.
                    </p>
                    <div className="text-[11px] text-textMuted flex items-center gap-3">
                      <span>Location: <strong className="text-white">{eq.benchLocation}</strong></span>
                      <span>•</span>
                      <span>Target: <strong className="text-white">{eq.materialTarget}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCompleteService(eq)}
                    className={cx(
                      "px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-md",
                      eq.status === 'Critical' 
                        ? "bg-danger text-white hover:bg-danger/80" 
                        : "bg-warning text-gray-900 hover:bg-warning/90"
                    )}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Complete Service</span>
                  </button>
                </div>
              ))}

              {mineData.equipment.filter(eq => eq.alert).length === 0 && (
                <div className="p-8 text-center text-textMuted border border-dashed border-border rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="font-medium text-white">All fleet telemetry sensors within nominal thresholds.</p>
                  <p className="text-xs mt-0.5">No critical component fatigue or thermal pressure anomalies detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detailed Interactive Equipment Card
function DetailedEquipmentCard({ 
  equipment, 
  onDeploy, 
  onCompleteService, 
  onReassign 
}: { 
  equipment: Equipment;
  onDeploy: (eq: Equipment) => void;
  onCompleteService: (eq: Equipment) => void;
  onReassign: (eq: Equipment) => void;
}) {
  const isStandby = equipment.status === 'Standby';
  const isCritical = equipment.status === 'Critical';
  const isWarning = equipment.status === 'Maintenance Soon';

  const statusColor = isCritical 
    ? 'text-danger bg-danger/10 border-danger/30' 
    : isWarning 
    ? 'text-warning bg-warning/10 border-warning/30'
    : isStandby
    ? 'text-accentLight bg-accentLight/10 border-accentLight/30'
    : 'text-success bg-success/10 border-success/30';

  const borderAccent = isCritical ? 'border-t-danger' : isWarning ? 'border-t-warning' : isStandby ? 'border-t-accentLight' : 'border-t-success';

  return (
    <div className={cx("bg-panel border border-border rounded-xl p-5 shadow-lg flex flex-col justify-between border-t-4 transition-all duration-300 hover:border-textMuted/40", borderAccent)}>
      <div>
        {/* Card Header: Category & Status */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-textMuted bg-background px-2 py-0.5 rounded border border-border/80">
              {equipment.category || 'Heavy Fleet'}
            </span>
            <h3 className="text-base font-bold text-white mt-1.5 leading-snug">{equipment.name}</h3>
          </div>
          <span className={cx("px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1", statusColor)}>
            {isCritical && <XCircle className="w-3.5 h-3.5" />}
            {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
            {isStandby && <Clock className="w-3.5 h-3.5" />}
            {!isCritical && !isWarning && !isStandby && <Check className="w-3.5 h-3.5" />}
            <span>{equipment.status}</span>
          </span>
        </div>

        {/* "When Needed" Badge with clock icon */}
        <div className="bg-background/80 border border-border/80 rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-accentLight shrink-0" />
            <span className="text-textMuted">When Needed:</span>
          </div>
          <span className="font-bold text-white font-mono text-[11px] truncate max-w-[170px]" title={equipment.whenNeeded}>
            {equipment.whenNeeded || 'Shift 1 Ongoing'}
          </span>
        </div>

        {/* Operating Material & Bench Location */}
        <div className="space-y-1.5 text-xs border-b border-border pb-3 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-textMuted flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-info" /> Material Target:
            </span>
            <span className="font-semibold text-white truncate max-w-[160px]" title={equipment.materialTarget}>
              {equipment.materialTarget || 'General ROM'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-textMuted flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-warning" /> Bench / Location:
            </span>
            <span className="font-mono text-textMuted hover:text-white transition flex items-center gap-1">
              <span>{equipment.benchLocation || 'Main Pit'}</span>
              <button onClick={() => onReassign(equipment)} title="Reassign Location" className="text-accentLight hover:underline">
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>

        {/* Availability & Utilization Progress Bars */}
        <div className="space-y-2.5 mb-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-textMuted">Availability</span>
              <span className="font-bold text-white font-mono">{equipment.availability}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
              <div 
                className={cx("h-1.5 rounded-full transition-all duration-500", isCritical ? "bg-danger" : isWarning ? "bg-warning" : "bg-success")}
                style={{ width: `${equipment.availability}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-textMuted">Utilization</span>
              <span className="font-bold text-white font-mono">{equipment.utilization}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-info h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${equipment.utilization}%` }}
              />
            </div>
          </div>
        </div>

        {/* 7-Day Downtime & Maintenance Alert */}
        <div className="flex justify-between items-center text-xs pb-2">
          <span className="text-textMuted">Downtime (7d):</span>
          <span className={cx("font-bold font-mono", parseFloat(equipment.downtime.toString()) > 10 ? "text-danger" : "text-white")}>
            {equipment.downtime} hrs
          </span>
        </div>

        {equipment.alert && (
          <div className="mt-1 p-2 bg-danger/10 border border-danger/30 rounded text-[11px] text-danger flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{equipment.alert}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-border mt-3 flex items-center gap-2">
        {isStandby ? (
          <button
            onClick={() => onDeploy(equipment)}
            className="w-full py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Dispatch to Face</span>
          </button>
        ) : isCritical || isWarning ? (
          <button
            onClick={() => onCompleteService(equipment)}
            className="w-full py-2 bg-panel border border-warning/60 hover:bg-warning/10 text-warning rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Resolve / Certify</span>
          </button>
        ) : (
          <button
            onClick={() => onReassign(equipment)}
            className="w-full py-2 bg-background border border-border hover:bg-border/60 text-textMuted hover:text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reallocate Bench</span>
          </button>
        )}
      </div>
    </div>
  );
}
