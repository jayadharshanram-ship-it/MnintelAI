import { useState } from 'react';
import { 
  Database, CheckCircle2, ExternalLink, RefreshCw
} from 'lucide-react';

interface DataSourceItem {
  id: string;
  name: string;
  category: 'SATELLITE' | 'WEATHER' | 'PRODUCTION' | 'GEOLOGY';
  provider: string;
  protocol: string;
  endpoint: string;
  frequency: string;
  lastIngestion: string;
  status: 'HEALTHY' | 'ACTIVE' | 'ARCHIVAL';
  latency: string;
  recordsProcessed: string;
  description: string;
  compliance: string;
  link: string;
}

export default function DataSources() {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'SATELLITE' | 'WEATHER' | 'PRODUCTION' | 'GEOLOGY'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  const sources: DataSourceItem[] = [
    {
      id: 'ds-1',
      name: 'Copernicus Sentinel-2 Multi-Spectral (MSI)',
      category: 'SATELLITE',
      provider: 'European Space Agency (ESA) CDSE',
      protocol: 'OData / STAC API v1.0 (BOA Level-2A)',
      endpoint: 'https://dataspace.copernicus.eu/odata/v1/Products',
      frequency: '5-Day Orbital Revisit',
      lastIngestion: '14 Sep 2026, 10:36 UTC',
      status: 'HEALTHY',
      latency: '340 ms',
      recordsProcessed: '13 Spectral Bands (10m - 20m GSD)',
      description: 'Provides bottom-of-atmosphere surface reflectance for calculating NDVI, NDMI, NDWI, Bare Soil Index, and Supergene Iron-Oxide ratios across the mine lease.',
      compliance: 'ESA Earth Observation Data Policy (Open Access)',
      link: 'https://dataspace.copernicus.eu/'
    },
    {
      id: 'ds-2',
      name: 'Open-Meteo High-Resolution Numerical Weather Model',
      category: 'WEATHER',
      provider: 'Open-Meteo GmbH (ECMWF & DWD ICON)',
      protocol: 'REST JSON API v1',
      endpoint: 'https://api.open-meteo.com/v1/forecast',
      frequency: '15-Minute Polling Cycle',
      lastIngestion: '18 Sep 2026, 18:30 IST',
      status: 'HEALTHY',
      latency: '85 ms',
      recordsProcessed: 'Hourly Precipitation, Temperature, Humidity, Soil Moisture',
      description: 'Continuous pit micro-climate telemetry used for opencast haul road trafficability, sump pump dewatering capacity, and blast hole charging safety window.',
      compliance: 'WMO Essential Weather Data Exchange (WMO-No. 1318)',
      link: 'https://open-meteo.com/'
    },
    {
      id: 'ds-3',
      name: 'MOIL Centralized Weighbridge & Dispatch System',
      category: 'PRODUCTION',
      provider: 'MOIL Ltd. IT & Logistics Directorate',
      protocol: 'Internal SQLite Embedded / WAL Journal',
      endpoint: 'moildata.sqlite / Table: production_records',
      frequency: 'Shift-End Ingestion (3 shifts/day)',
      lastIngestion: '18 Sep 2026, 14:15 IST (Shift-1)',
      status: 'ACTIVE',
      latency: '4 ms (Local WAL)',
      recordsProcessed: '18,450 Shift Dispatch Slips (2023 - 2026)',
      description: 'Gross, tare, and net weighbridge tonnage receipts categorized by grade (Fines, Lumps, High-grade 44%+ Mn, Siliceous) and siding rake allocation.',
      compliance: 'DGMS / Ministry of Mines Statutory Returns Form-H',
      link: 'https://moil.nic.in/'
    },
    {
      id: 'ds-4',
      name: 'Geological Survey of India (GSI) Sausar Group Mapping',
      category: 'GEOLOGY',
      provider: 'Geological Survey of India (Central Region)',
      protocol: 'GIS Geodatabase / Vector Shapefiles (EPSG:4326)',
      endpoint: 'Internal GIS Store / Sausar_Belt_Lithology.geojson',
      frequency: 'Quadrennial Statutory Update',
      lastIngestion: '02 Jan 2026, 11:00 IST',
      status: 'ARCHIVAL',
      latency: '< 1 ms (Embedded)',
      recordsProcessed: 'Mansar, Lohangi, Chorbaoli Formations & Fault Lines',
      description: 'Stratigraphic lithology boundaries, synclinal axial planes, and known manganese ore bed contacts within the Sausar Supracrustal Belt.',
      compliance: 'UNFC 1997 / Minerals (Evidence of Mineral Contents) Rules 2015',
      link: 'https://www.gsi.gov.in/'
    }
  ];

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const filtered = sources.filter(s => {
    if (filterCategory === 'ALL') return true;
    return s.category === filterCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Data Architecture & Integrity</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Audited Catalog
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Data Sources & Telemetry Ingestion Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive registry of satellite, atmospheric, ERP weighbridge, and geological feeds driving MnIntel.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded shadow-sm flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Ingesting Feeds...' : 'Verify Ingestion Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Upstream Feeds</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">4 of 4</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 size={12} /> 100% Operational
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Average Ingestion Latency</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">108 ms</div>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">P95: 340 ms</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Lease Ground Coverage</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">1,480 Ha</div>
          <span className="text-[10px] text-slate-500 mt-1 block">5 Active Mining Blocks</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Database WAL Size</span>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">24.2 MB</div>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">SQLite 3.45 • 0 Lockouts</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 pb-2">
        {(['ALL', 'SATELLITE', 'WEATHER', 'PRODUCTION', 'GEOLOGY'] as const).map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
              filterCategory === c 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {c === 'ALL' ? 'All Ingestion Feeds' : c}
          </button>
        ))}
      </div>

      {/* Data Sources Detailed List */}
      <div className="space-y-4">
        {filtered.map(src => (
          <div key={src.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 hover:border-slate-300 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {src.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{src.name}</h3>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Provider: <strong className="text-slate-700">{src.provider}</strong></div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{src.status} ({src.latency})</span>
                </span>
                <a
                  href={src.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Open Provider Portal"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {src.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Protocol & Level</span>
                <span className="font-semibold text-slate-800 text-[11px] truncate block">{src.protocol}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Update Frequency</span>
                <span className="font-semibold text-slate-800 text-[11px] block">{src.frequency}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Latest Ingestion</span>
                <span className="font-semibold text-slate-800 text-[11px] block">{src.lastIngestion}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Processed Volume</span>
                <span className="font-semibold text-slate-800 text-[11px] block truncate">{src.recordsProcessed}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Statutory Alignment: <strong>{src.compliance}</strong></span>
              <span className="font-mono text-slate-400 truncate max-w-sm">Endpoint: {src.endpoint}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
