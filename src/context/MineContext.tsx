import React, { createContext, useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProduction, fetchRisk, fetchWeather, fetchSatellite } from '../api';

export type Zone = { name: string; score: number; level: string; color: string; polygon: [number, number][] };

export type Equipment = {
  id?: string;
  name: string;
  category: 'Excavator' | 'Haulage' | 'Drill' | 'Pumping' | 'Processing';
  materialTarget: string;
  neededShift: string;
  whenNeeded: string;
  benchLocation: string;
  status: 'Active' | 'Maintenance Soon' | 'Critical' | 'Standby' | string;
  availability: number;
  utilization: number;
  downtime: number | string;
  alert: string | null;
  hoursUntilMaintenance?: number;
};

export type RootCause = { name: string; value: number; color: string };
export type Recommendation = { id: number; title: string; desc: string; impact: string; confidence: number; action: string };

export type MineData = {
  name: string;
  location: string;
  colorIcon: string;
  productionToday: number;
  dailyTarget: number;
  monthlyProduction: number;
  monthlyTarget: number;
  estimatedReserves: number;
  reserveDetails: { proven: number; probable: number; inferred: number };
  shortfallRisk: number;
  equipmentAvailability: number;
  aiConfidence: number;
  rainfall: number;
  soilMoisture: number;
  ndvi: number;
  temperature: number;
  prospectivity: number;
  coordinates: [number, number];
  zones: Zone[];
  equipment: Equipment[];
  productionChart: { label: string; actual: number | null; planned: number; forecast: number | null }[];
  forecastChart: { month: string; actual: number | null; planned: number; forecast: number | null }[];
  rootCauses: RootCause[];
  recommendations: Recommendation[];
};

export const minesData: Record<string, MineData> = {
  "Dongri Buzurg Mine": {
    name: "Dongri Buzurg Mine",
    location: "Maharashtra",
    colorIcon: "🟠",
    productionToday: 8420,
    dailyTarget: 9000,
    monthlyProduction: 246000,
    monthlyTarget: 270000,
    estimatedReserves: 24.8,
    reserveDetails: { proven: 12.4, probable: 7.8, inferred: 4.6 },
    shortfallRisk: 18,
    equipmentAvailability: 87.4,
    aiConfidence: 91.2,
    rainfall: 68,
    soilMoisture: 74,
    ndvi: 0.43,
    temperature: 34.8,
    prospectivity: 91,
    coordinates: [21.40, 79.65],
    zones: [
      { name: "Zone A", score: 91, level: "Very High", color: "#EF4444", polygon: [[21.415, 79.645], [21.415, 79.655], [21.405, 79.655], [21.405, 79.645]] },
      { name: "Zone B", score: 78, level: "High", color: "#F97316", polygon: [[21.395, 79.665], [21.395, 79.675], [21.385, 79.675], [21.385, 79.665]] },
      { name: "Zone C", score: 64, level: "Moderate", color: "#FBBF24", polygon: [[21.400, 79.630], [21.400, 79.640], [21.390, 79.640], [21.390, 79.630]] }
    ],
    equipment: [
      { 
        id: "eq-db-1",
        name: "EX-102 Hydraulic Excavator (PC-800)", 
        category: "Excavator",
        materialTarget: "High-Grade Pyrolusite Ore",
        neededShift: "Shift 1 (06:00 - 14:00)",
        whenNeeded: "Needed Now (Active Loading)",
        benchLocation: "Pit 2 - Bench 4 North",
        status: "Active", 
        availability: 94, 
        utilization: 88, 
        downtime: 4.2, 
        alert: null,
        hoursUntilMaintenance: 86
      },
      { 
        id: "eq-db-2",
        name: "EX-105 Heavy Shovel (EX-1200)", 
        category: "Excavator",
        materialTarget: "Overburden Waste Rock",
        neededShift: "Shift 2 (14:00 - 22:00)",
        whenNeeded: "Needed at 14:00 (Bench 2 Stripping)",
        benchLocation: "West Ridge - Bench 2",
        status: "Standby", 
        availability: 98, 
        utilization: 45, 
        downtime: 0.8, 
        alert: null,
        hoursUntilMaintenance: 140
      },
      { 
        id: "eq-db-3",
        name: "DT-204 Dump Truck (CAT 773E)", 
        category: "Haulage",
        materialTarget: "High-Grade Pyrolusite Ore",
        neededShift: "Shift 1 (06:00 - 14:00)",
        whenNeeded: "Needed Now (Pit to Siding Haul)",
        benchLocation: "Main Haul Road A",
        status: "Maintenance Soon", 
        availability: 81, 
        utilization: 74, 
        downtime: 9.8, 
        alert: "Engine Temp Spikes on Ramp Incline",
        hoursUntilMaintenance: 12
      },
      { 
        id: "eq-db-4",
        name: "DT-208 Heavy Tipper (BEML 35T)", 
        category: "Haulage",
        materialTarget: "Overburden Waste Rock",
        neededShift: "Continuous (Shifts 1 & 2)",
        whenNeeded: "Needed Now (Waste Dump Circuit)",
        benchLocation: "North Dump Circuit",
        status: "Active", 
        availability: 92, 
        utilization: 86, 
        downtime: 3.5, 
        alert: null,
        hoursUntilMaintenance: 94
      },
      { 
        id: "eq-db-5",
        name: "DR-08 Rotary Blasthole Drill", 
        category: "Drill",
        materialTarget: "Overburden Waste Rock",
        neededShift: "Shift 1 (06:00 - 08:30)",
        whenNeeded: "Urgent - Blast Prep Window",
        benchLocation: "Bench 5 South Extension",
        status: "Critical", 
        availability: 63, 
        utilization: 59, 
        downtime: 21, 
        alert: "Hydraulic Pressure Drop in Feed Cylinder",
        hoursUntilMaintenance: 0
      },
      { 
        id: "eq-db-6",
        name: "WP-03 High-Head Dewatering Pump", 
        category: "Pumping",
        materialTarget: "Deep Pit Sump Inflow",
        neededShift: "Shift 2 (Pre-monsoon runoff)",
        whenNeeded: "Needed at 13:30 (Rainfall Inflow)",
        benchLocation: "Pit Floor Deep Sump",
        status: "Active", 
        availability: 96, 
        utilization: 70, 
        downtime: 1.5, 
        alert: null,
        hoursUntilMaintenance: 210
      }
    ],
    productionChart: [
      { label: "Day 1", actual: 7800, planned: 8500, forecast: null },
      { label: "Day 2", actual: 8100, planned: 8500, forecast: null },
      { label: "Day 3", actual: 7950, planned: 8500, forecast: null },
      { label: "Day 4", actual: 8420, planned: 8500, forecast: null },
      { label: "Day 5", actual: 8300, planned: 8500, forecast: null },
      { label: "Day 6", actual: null, planned: 8500, forecast: 8500 },
      { label: "Day 7", actual: null, planned: 8500, forecast: 8420 }
    ],
    forecastChart: [
      { month: "Jan", actual: 240000, planned: 245000, forecast: null },
      { month: "Feb", actual: 230000, planned: 220000, forecast: null },
      { month: "Mar", actual: 250000, planned: 250000, forecast: null },
      { month: "Apr", actual: 210000, planned: 245000, forecast: null },
      { month: "May", actual: 265000, planned: 250000, forecast: null },
      { month: "Jun", actual: null, planned: 250000, forecast: 238000 },
      { month: "Jul", actual: null, planned: 260000, forecast: 246000 },
      { month: "Aug", actual: null, planned: 260000, forecast: 254000 }
    ],
    rootCauses: [
      { name: "Equipment Downtime", value: 38, color: '#EF4444' },
      { name: "Weather Conditions", value: 24, color: '#F59E0B' },
      { name: "Blasting Delays", value: 19, color: '#FBBF24' },
      { name: "Haulage Constraints", value: 12, color: '#06B6D4' },
      { name: "Other", value: 7, color: '#94A3B8' }
    ],
    recommendations: [
      { id: 1, title: "Re-deploy Equipment", desc: "Move available excavator capacity from Zone B to Zone A.", impact: "+6% production", confidence: 89, action: "Apply Recommendation" },
      { id: 2, title: "Optimize Blasting Schedule", desc: "Move blasting activity to a lower-risk weather window.", impact: "+3% production", confidence: 84, action: "View Schedule" },
      { id: 3, title: "Preventive Maintenance", desc: "Schedule maintenance for Drill DR-08 before predicted failure window.", impact: "15–20% downtime reduction", confidence: 91, action: "Schedule Maintenance" }
    ]
  },
  "Balaghat Mine": {
    name: "Balaghat Mine",
    location: "Madhya Pradesh",
    colorIcon: "🟢",
    productionToday: 7650,
    dailyTarget: 8500,
    monthlyProduction: 221000,
    monthlyTarget: 255000,
    estimatedReserves: 31.6,
    reserveDetails: { proven: 16.2, probable: 9.4, inferred: 6.0 },
    shortfallRisk: 27,
    equipmentAvailability: 88.6,
    aiConfidence: 88.7,
    rainfall: 74,
    soilMoisture: 81,
    ndvi: 0.51,
    temperature: 32.4,
    prospectivity: 84,
    coordinates: [21.81, 80.19],
    zones: [
      { name: "Zone A", score: 84, level: "High", color: "#F97316", polygon: [[21.825, 80.185], [21.825, 80.195], [21.815, 80.195], [21.815, 80.185]] },
      { name: "Zone B", score: 72, level: "Moderate", color: "#FBBF24", polygon: [[21.805, 80.205], [21.805, 80.215], [21.795, 80.215], [21.795, 80.205]] },
      { name: "Zone C", score: 61, level: "Moderate", color: "#FBBF24", polygon: [[21.810, 80.170], [21.810, 80.180], [21.800, 80.180], [21.800, 80.170]] }
    ],
    equipment: [
      { 
        id: "eq-bg-1",
        name: "LHD-01 Underground Loader (Sandvik LH203)", 
        category: "Excavator",
        materialTarget: "High-Grade Braunite Ore",
        neededShift: "Shift 1 (06:00 - 14:00)",
        whenNeeded: "Needed Now (Stope 12 Mucking)",
        benchLocation: "Level 3 - Stope 12 East",
        status: "Active", 
        availability: 89, 
        utilization: 82, 
        downtime: 6.1, 
        alert: null,
        hoursUntilMaintenance: 64
      },
      { 
        id: "eq-bg-2",
        name: "LPDT-04 Low Profile Dumper (20T)", 
        category: "Haulage",
        materialTarget: "High-Grade Braunite Ore",
        neededShift: "Continuous (Shifts 1 & 2)",
        whenNeeded: "Needed Now (Decline Haul to Ore Pass)",
        benchLocation: "Main Decline Ramp",
        status: "Maintenance Soon", 
        availability: 86, 
        utilization: 79, 
        downtime: 7.2, 
        alert: "Brake Lining Wear Limit Alert",
        hoursUntilMaintenance: 16
      },
      { 
        id: "eq-bg-3",
        name: "DR-12 Underground Jumbo Drill", 
        category: "Drill",
        materialTarget: "Medium-Grade Ore Heading",
        neededShift: "Shift 1 (07:00 - 11:00)",
        whenNeeded: "Urgent (Face Round Drilling)",
        benchLocation: "Level 4 - Crosscut 6",
        status: "Critical", 
        availability: 78, 
        utilization: 65, 
        downtime: 14, 
        alert: "Rotational Motor Thermal Alert",
        hoursUntilMaintenance: 0
      },
      { 
        id: "eq-bg-4",
        name: "HOIST-01 Main Shaft Koepe Winder", 
        category: "Processing",
        materialTarget: "High-Grade Braunite Ore",
        neededShift: "Continuous 24h",
        whenNeeded: "Needed Continuous (Skip Hoisting)",
        benchLocation: "Holmes Shaft Headframe",
        status: "Active", 
        availability: 97, 
        utilization: 91, 
        downtime: 1.1, 
        alert: null,
        hoursUntilMaintenance: 180
      },
      { 
        id: "eq-bg-5",
        name: "PUMP-05 Multi-stage Sump Pump", 
        category: "Pumping",
        materialTarget: "Underground Aquifer Drainage",
        neededShift: "Shift 2 & 3 (De-watering)",
        whenNeeded: "Needed at 14:00 (Night Sump Balance)",
        benchLocation: "Level 5 Main Pump Chamber",
        status: "Active", 
        availability: 93, 
        utilization: 78, 
        downtime: 2.8, 
        alert: null,
        hoursUntilMaintenance: 110
      }
    ],
    productionChart: [
      { label: "Day 1", actual: 7200, planned: 8500, forecast: null },
      { label: "Day 2", actual: 7400, planned: 8500, forecast: null },
      { label: "Day 3", actual: 7600, planned: 8500, forecast: null },
      { label: "Day 4", actual: 7450, planned: 8500, forecast: null },
      { label: "Day 5", actual: 7650, planned: 8500, forecast: null },
      { label: "Day 6", actual: null, planned: 8500, forecast: 7520 },
      { label: "Day 7", actual: null, planned: 8500, forecast: 7650 }
    ],
    forecastChart: [
      { month: "Jan", actual: 235000, planned: 255000, forecast: null },
      { month: "Feb", actual: 220000, planned: 230000, forecast: null },
      { month: "Mar", actual: 245000, planned: 255000, forecast: null },
      { month: "Apr", actual: 200000, planned: 255000, forecast: null },
      { month: "May", actual: 250000, planned: 255000, forecast: null },
      { month: "Jun", actual: null, planned: 255000, forecast: 215000 },
      { month: "Jul", actual: null, planned: 255000, forecast: 221000 },
      { month: "Aug", actual: null, planned: 255000, forecast: 228000 }
    ],
    rootCauses: [
      { name: "Equipment Downtime", value: 31, color: '#EF4444' },
      { name: "Weather Conditions", value: 29, color: '#F59E0B' },
      { name: "Blasting Delays", value: 21, color: '#FBBF24' },
      { name: "Haulage Constraints", value: 11, color: '#06B6D4' },
      { name: "Other", value: 8, color: '#94A3B8' }
    ],
    recommendations: [
      { id: 1, title: "Re-deploy Equipment", desc: "Re-deploy Excavator EX-201 to Zone A.", impact: "+5% production", confidence: 85, action: "Apply Recommendation" },
      { id: 2, title: "Enhance Haulage Routes", desc: "Grade alternative haulage route C to avoid waterlogging.", impact: "+4% production", confidence: 78, action: "Issue Work Order" },
      { id: 3, title: "Preventive Maintenance", desc: "Schedule motor replacement for Drill DR-12.", impact: "Avoid 48h downtime", confidence: 94, action: "Schedule Maintenance" }
    ]
  },
  "Mine 3": {
    name: "Mine 3",
    location: "Gumgaon / Tirodi",
    colorIcon: "🔵",
    productionToday: 9150,
    dailyTarget: 9200,
    monthlyProduction: 267000,
    monthlyTarget: 275000,
    estimatedReserves: 18.9,
    reserveDetails: { proven: 9.1, probable: 5.6, inferred: 4.2 },
    shortfallRisk: 11,
    equipmentAvailability: 92.6,
    aiConfidence: 94.1,
    rainfall: 42,
    soilMoisture: 61,
    ndvi: 0.37,
    temperature: 35.6,
    prospectivity: 76,
    coordinates: [20.95, 78.90],
    zones: [
      { name: "Zone A", score: 76, level: "High", color: "#F97316", polygon: [[20.965, 78.895], [20.965, 78.905], [20.955, 78.905], [20.955, 78.895]] },
      { name: "Zone B", score: 68, level: "Moderate", color: "#FBBF24", polygon: [[20.945, 78.915], [20.945, 78.925], [20.935, 78.925], [20.935, 78.915]] },
      { name: "Zone C", score: 54, level: "Moderate", color: "#FBBF24", polygon: [[20.950, 78.880], [20.950, 78.890], [20.940, 78.890], [20.940, 78.880]] }
    ],
    equipment: [
      { 
        id: "eq-m3-1",
        name: "EX-305 Surface Excavator (Komatsu)", 
        category: "Excavator",
        materialTarget: "Siliceous Manganese Ore",
        neededShift: "Shift 1 (06:00 - 14:00)",
        whenNeeded: "Needed Now (Bench Face Loading)",
        benchLocation: "Pit East - Bench 1",
        status: "Active", 
        availability: 97, 
        utilization: 92, 
        downtime: 1.2, 
        alert: null,
        hoursUntilMaintenance: 155
      },
      { 
        id: "eq-m3-2",
        name: "DT-412 Mining Tipper (25T)", 
        category: "Haulage",
        materialTarget: "Siliceous Manganese Ore",
        neededShift: "Shift 1 & 2",
        whenNeeded: "Needed Now (Stockpile Haul)",
        benchLocation: "Internal Haul Road C",
        status: "Active", 
        availability: 95, 
        utilization: 88, 
        downtime: 2.1, 
        alert: null,
        hoursUntilMaintenance: 120
      },
      { 
        id: "eq-m3-3",
        name: "DR-21 Blast Rig (Atlas Copco)", 
        category: "Drill",
        materialTarget: "Overburden Quartzite",
        neededShift: "Shift 2 (15:00 - 18:00)",
        whenNeeded: "Needed at 15:00 (Pattern Drilling)",
        benchLocation: "North Face Ridge",
        status: "Maintenance Soon", 
        availability: 84, 
        utilization: 79, 
        downtime: 8.5, 
        alert: "Bit Wear Detected - Replace Before Shift 2",
        hoursUntilMaintenance: 8
      },
      { 
        id: "eq-m3-4",
        name: "CRUSH-01 Primary Jaw Crusher", 
        category: "Processing",
        materialTarget: "Siliceous Manganese Ore",
        neededShift: "Continuous (Shifts 1 & 2)",
        whenNeeded: "Needed at 10:00 (Feed Cycle)",
        benchLocation: "ROM Ore Stockpile Yard",
        status: "Active", 
        availability: 91, 
        utilization: 84, 
        downtime: 4.0, 
        alert: null,
        hoursUntilMaintenance: 75
      },
      { 
        id: "eq-m3-5",
        name: "DOZER-02 Track Dozer (D8R)", 
        category: "Excavator",
        materialTarget: "Overburden Waste Rock",
        neededShift: "Shift 2 (Waste Push)",
        whenNeeded: "Standby (Bench Leveling)",
        benchLocation: "Overburden Waste Dump #2",
        status: "Standby", 
        availability: 96, 
        utilization: 52, 
        downtime: 1.0, 
        alert: null,
        hoursUntilMaintenance: 190
      }
    ],
    productionChart: [
      { label: "Day 1", actual: 8600, planned: 9200, forecast: null },
      { label: "Day 2", actual: 8800, planned: 9200, forecast: null },
      { label: "Day 3", actual: 8950, planned: 9200, forecast: null },
      { label: "Day 4", actual: 9000, planned: 9200, forecast: null },
      { label: "Day 5", actual: 9050, planned: 9200, forecast: null },
      { label: "Day 6", actual: null, planned: 9200, forecast: 9100 },
      { label: "Day 7", actual: null, planned: 9200, forecast: 9150 }
    ],
    forecastChart: [
      { month: "Jan", actual: 260000, planned: 275000, forecast: null },
      { month: "Feb", actual: 250000, planned: 250000, forecast: null },
      { month: "Mar", actual: 270000, planned: 275000, forecast: null },
      { month: "Apr", actual: 255000, planned: 275000, forecast: null },
      { month: "May", actual: 280000, planned: 275000, forecast: null },
      { month: "Jun", actual: null, planned: 275000, forecast: 262000 },
      { month: "Jul", actual: null, planned: 275000, forecast: 267000 },
      { month: "Aug", actual: null, planned: 275000, forecast: 272000 }
    ],
    rootCauses: [
      { name: "Equipment Downtime", value: 15, color: '#EF4444' },
      { name: "Weather Conditions", value: 12, color: '#F59E0B' },
      { name: "Blasting Delays", value: 45, color: '#FBBF24' },
      { name: "Haulage Constraints", value: 20, color: '#06B6D4' },
      { name: "Other", value: 8, color: '#94A3B8' }
    ],
    recommendations: [
      { id: 1, title: "Optimize Blasting Schedule", desc: "Optimize blasting schedule during the next low-rainfall window.", impact: "+8% production", confidence: 96, action: "Apply Recommendation" },
      { id: 2, title: "Replace Drill Bits", desc: "Proactively replace bits on DR-21 to maintain penetration rate.", impact: "Maintain efficiency", confidence: 92, action: "Issue Work Order" },
      { id: 3, title: "Increase Haulage Fleet", desc: "Deploy standby truck to alleviate minor bottleneck.", impact: "+2% production", confidence: 75, action: "Deploy Standby" }
    ]
  }
};

type MineContextType = {
  selectedMineName: string;
  setSelectedMineName: (name: string) => void;
  mineData: MineData;
  isChanging: boolean;
  isLiveMode: boolean;
  setIsLiveMode: (isLive: boolean) => void;
  dataSaverMode: boolean;
  setDataSaverMode: (enabled: boolean) => void;
  updateEquipment: (equipmentName: string, updates: Partial<Equipment>) => void;
};

const MineContext = createContext<MineContextType | undefined>(undefined);

export function getMineSlug(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('dongri')) return 'dongri-buzurg';
  if (n.includes('balaghat')) return 'balaghat';
  return 'mine-3';
}

export function MineProvider({ children }: { children: React.ReactNode }) {
  const [selectedMineName, setSelectedMineName] = useState('Dongri Buzurg Mine');
  const [isChanging, setIsChanging] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [equipmentOverrides, setEquipmentOverrides] = useState<Record<string, Record<string, Partial<Equipment>>>>({});

  const mineSlug = getMineSlug(selectedMineName);

  const { data: prodData } = useQuery({
    queryKey: ['mineProduction', mineSlug],
    queryFn: () => fetchProduction(mineSlug),
    enabled: isLiveMode,
    refetchInterval: 30000
  });

  const { data: riskData } = useQuery({
    queryKey: ['risk', mineSlug],
    queryFn: () => fetchRisk(mineSlug),
    enabled: isLiveMode,
    refetchInterval: 45000
  });

  const { data: weatherData } = useQuery({
    queryKey: ['weather', mineSlug],
    queryFn: () => fetchWeather(mineSlug),
    enabled: isLiveMode,
    refetchInterval: 60000
  });

  const { data: satData } = useQuery({
    queryKey: ['satellite', mineSlug],
    queryFn: () => fetchSatellite(mineSlug),
    enabled: isLiveMode,
    refetchInterval: 120000
  });

  const handleMineChange = (name: string) => {
    setIsChanging(true);
    setSelectedMineName(name);
    setTimeout(() => setIsChanging(false), 250);
  };

  const updateEquipment = (equipmentName: string, updates: Partial<Equipment>) => {
    setEquipmentOverrides(prev => {
      const currentMineOverrides = prev[selectedMineName] || {};
      return {
        ...prev,
        [selectedMineName]: {
          ...currentMineOverrides,
          [equipmentName]: {
            ...(currentMineOverrides[equipmentName] || {}),
            ...updates
          }
        }
      };
    });
  };

  const dynamicMineData = useMemo<MineData>(() => {
    const base = minesData[selectedMineName] || minesData['Dongri Buzurg Mine'];
    const clone: MineData = JSON.parse(JSON.stringify(base));

    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 1. Production Records
    if (prodData && prodData.records && prodData.records.length > 0) {
      const records = prodData.records;
      const latestRecord = records[records.length - 1];
      if (latestRecord && typeof latestRecord.actual_tonnes === 'number') {
        clone.productionToday = latestRecord.actual_tonnes;
      }
      if (prodData.dailyTarget) clone.dailyTarget = prodData.dailyTarget;
      if (prodData.monthlyTarget) clone.monthlyTarget = prodData.monthlyTarget;
      if (prodData.estimatedReserves) clone.estimatedReserves = prodData.estimatedReserves;

      const chartRecords = records.slice(-7);
      clone.productionChart = chartRecords.map((r: any, idx: number) => {
        let label = r.record_date;
        try {
          const d = new Date(r.record_date);
          label = idx === chartRecords.length - 1 ? 'Today' : `${monthNames[d.getMonth()]} ${d.getDate()}`;
        } catch {
          label = r.record_date;
        }
        return {
          label,
          actual: r.actual_tonnes ?? null,
          planned: r.planned_tonnes,
          forecast: r.forecast_tonnes ?? null
        };
      });

      const totalActual = records.reduce((sum: number, r: any) => sum + (r.actual_tonnes || 0), 0);
      clone.monthlyProduction = Math.round(totalActual * (30 / records.length));
    } else {
      const dynamicChart = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        const isToday = i === 0;
        const label = isToday ? 'Today' : `${monthNames[d.getMonth()]} ${d.getDate()}`;
        const baseVariance = (i % 2 === 0 ? 1 : -1) * (i * 120);
        dynamicChart.push({
          label,
          actual: isToday ? clone.productionToday : clone.productionToday + baseVariance,
          planned: clone.dailyTarget,
          forecast: isToday ? clone.dailyTarget : null
        });
      }
      clone.productionChart = dynamicChart;
    }

    // Dynamic rolling forecast
    const currentMonthIdx = now.getMonth();
    const dynamicForecast = [];
    for (let offset = -5; offset <= 2; offset++) {
      const mIdx = (currentMonthIdx + offset + 12) % 12;
      const mName = monthNames[mIdx];
      const isPast = offset <= 0;
      dynamicForecast.push({
        month: mName,
        actual: isPast ? clone.monthlyTarget - 12000 + (offset * 3000) : null,
        planned: clone.monthlyTarget,
        forecast: isPast ? null : clone.monthlyTarget - 8000 + (offset * 4000)
      });
    }
    clone.forecastChart = dynamicForecast;

    // 2. Risk Predictions
    if (riskData) {
      if (typeof riskData.shortfallRiskPct === 'number') {
        clone.shortfallRisk = riskData.shortfallRiskPct;
      }
      if (riskData.recommendations && riskData.recommendations.length > 0) {
        clone.recommendations = riskData.recommendations.map((r: any, idx: number) => ({
          id: idx + 1,
          title: r.title || r.category || 'Operational Advisory',
          desc: r.description || r.action || '',
          impact: r.estimatedMitigation || '+4% production',
          confidence: r.urgency === 'HIGH' ? 95 : 88,
          action: r.urgency === 'HIGH' ? 'Prioritize Action' : 'Apply Advisory'
        }));
      }
      if (riskData.confidence) clone.aiConfidence = riskData.confidence;
    }

    // 3. Weather
    if (weatherData) {
      if (typeof weatherData.rainfall === 'number') clone.rainfall = weatherData.rainfall;
      if (typeof weatherData.temperature === 'number') clone.temperature = weatherData.temperature;
      if (typeof weatherData.humidity === 'number') clone.soilMoisture = weatherData.humidity;
    }

    // 4. Satellite
    if (satData) {
      if (satData.indices?.ndvi) clone.ndvi = satData.indices.ndvi;
      if (satData.prospectivityScore) clone.prospectivity = satData.prospectivityScore;
    }

    // 5. Apply Equipment Overrides & Dynamic Availability
    if (equipmentOverrides[selectedMineName]) {
      const overrides = equipmentOverrides[selectedMineName];
      clone.equipment = clone.equipment.map(eq => {
        if (overrides[eq.name]) {
          return { ...eq, ...overrides[eq.name] };
        }
        return eq;
      });
    }

    if (clone.equipment && clone.equipment.length > 0) {
      const avgAvail = clone.equipment.reduce((acc, eq) => acc + (typeof eq.availability === 'number' ? eq.availability : 0), 0) / clone.equipment.length;
      clone.equipmentAvailability = Math.round(avgAvail * 10) / 10;
    }

    return clone;
  }, [selectedMineName, prodData, riskData, weatherData, satData, equipmentOverrides]);

  const value = {
    selectedMineName,
    mineData: dynamicMineData,
    setSelectedMineName: handleMineChange,
    isChanging,
    isLiveMode,
    setIsLiveMode,
    dataSaverMode,
    setDataSaverMode,
    updateEquipment
  };

  return (
    <MineContext.Provider value={value}>
      {children}
    </MineContext.Provider>
  );
}

export function useMine() {
  const context = useContext(MineContext);
  if (!context) throw new Error('useMine must be used within MineProvider');
  return context;
}
