import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import { 
  Satellite, CloudRain, Droplets, Leaf, 
  Layers, Info, Sparkles 
} from 'lucide-react';
import cx from 'classnames';
import { useMine } from '../context/MineContext';
import { useQuery } from '@tanstack/react-query';
import { fetchSatellite, fetchWeather } from '../api';
import DataFreshnessBadge from '../components/DataFreshnessBadge';

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function SatelliteIntelligence() {
  const { mineData, isLiveMode } = useMine();
  const [selectedLayer, setSelectedLayer] = useState<'trueColor' | 'ndvi' | 'swir' | 'bsi'>('trueColor');

  const { data: satResponse, isError: satError } = useQuery({
    queryKey: ['satellite', mineData.name],
    queryFn: () => fetchSatellite(mineData.name),
    enabled: isLiveMode,
  });

  const { data: weatherData } = useQuery({
    queryKey: ['weather', mineData.name],
    queryFn: () => fetchWeather(mineData.name),
    enabled: isLiveMode,
  });

  const observation = satResponse?.observation;
  const indices = satResponse?.indices;

  const currentRainfall = isLiveMode && weatherData ? (weatherData.current?.rainfall ?? weatherData.rainfall ?? 0) : mineData.rainfall;
  const currentTemp = isLiveMode && weatherData ? (weatherData.current?.temperature ?? weatherData.temperature ?? 30) : mineData.temperature;
  
  // Real Indices from Copernicus Sentinel-2 L2A pipeline (or fallback in demo mode)
  const currentNdvi = isLiveMode && indices ? indices.ndvi : mineData.ndvi;
  const currentNdmi = isLiveMode && indices ? indices.ndmi : 0.22;
  const currentNdwi = isLiveMode && indices ? indices.ndwi : 0.16;
  const currentBsi = isLiveMode && indices ? indices.bsi : 0.28;
  const currentIronOxide = isLiveMode && indices ? indices.iron_oxide_ratio : 1.34;
  const currentCloud = isLiveMode && observation ? (observation.cloud_cover ?? observation.cloudCover ?? 12) : 8;

  const productName = observation?.product_name || observation?.productName || "S2C_MSIL2A_20260914T050651_T44QLJ";
  const acqDate = observation?.acquisition_date || observation?.acquisitionDate || new Date().toISOString();

  return (
    <div className="h-full flex flex-col space-y-5 max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Satellite className="text-info w-6 h-6 sm:w-7 sm:h-7" /> 
            Copernicus Sentinel-2 Earth Observation
          </h1>
          <p className="text-xs sm:text-sm text-textMuted mt-0.5">
            Automated multi-spectral satellite telemetry and spectral indices for {mineData.name}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-info/10 text-info border border-info/30">
            Sentinel-2 Level-2A (Surface Reflectance)
          </span>
        </div>
      </div>

      {/* Disclaimers & Mandatory Scientific Context */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-3.5 flex items-start gap-3 text-xs text-textMuted">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Scientific Remote Sensing Notice:</strong> Satellite imagery measures surface spectral reflectance (visible, NIR, SWIR). Spectral indices serve as <em>satellite-derived indicators</em> of vegetation stress, soil moisture, and surface iron-manganese oxide alteration, not direct subsurface manganese ore grade assay.
        </div>
      </div>

      {/* Freshness Badge */}
      <DataFreshnessBadge 
        source={isLiveMode && satResponse ? satResponse.source : "Sentinel-2 Multi-Spectral (Demo)"}
        observationDate={acqDate}
        timestamp={observation?.created_at || new Date().toISOString()}
        isLiveMode={isLiveMode && !satError}
        type="satellite"
      />

      {/* Spectral Indices Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* NDVI */}
        <div className="bg-panel border border-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-textMuted text-xs mb-1">
            <span className="font-semibold">NDVI (Vegetation)</span>
            <Leaf size={14} className="text-success" />
          </div>
          <div className="text-2xl font-extrabold text-white my-0.5">{currentNdvi}</div>
          <div className="text-[10px] text-textMuted mt-auto pt-1 border-t border-border/40">
            (B08 - B04) / (B08 + B04)
          </div>
        </div>

        {/* NDMI */}
        <div className="bg-panel border border-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-textMuted text-xs mb-1">
            <span className="font-semibold">NDMI (Moisture)</span>
            <Droplets size={14} className="text-accent" />
          </div>
          <div className="text-2xl font-extrabold text-white my-0.5">{currentNdmi}</div>
          <div className="text-[10px] text-textMuted mt-auto pt-1 border-t border-border/40">
            (B08 - B11) / (B08 + B11)
          </div>
        </div>

        {/* NDWI */}
        <div className="bg-panel border border-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-textMuted text-xs mb-1">
            <span className="font-semibold">NDWI (Water Ponding)</span>
            <CloudRain size={14} className="text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white my-0.5">{currentNdwi}</div>
          <div className="text-[10px] text-textMuted mt-auto pt-1 border-t border-border/40">
            (B03 - B08) / (B03 + B08)
          </div>
        </div>

        {/* Bare Soil Index (BSI) */}
        <div className="bg-panel border border-border rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-textMuted text-xs mb-1">
            <span className="font-semibold">Bare Soil (BSI)</span>
            <Layers size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white my-0.5">{currentBsi}</div>
          <div className="text-[10px] text-textMuted mt-auto pt-1 border-t border-border/40">
            Pit Outcrop Exposure
          </div>
        </div>

        {/* Iron/Manganese Oxide Ratio */}
        <div className="bg-panel border border-border rounded-xl p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex justify-between items-center text-textMuted text-xs mb-1">
            <span className="font-semibold">Fe-Oxide Ratio</span>
            <Sparkles size={14} className="text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white my-0.5">{currentIronOxide}</div>
          <div className="text-[10px] text-textMuted mt-auto pt-1 border-t border-border/40">
            B04 / B02 (Alteration)
          </div>
        </div>
      </div>

      {/* Satellite Imagery Map Viewer */}
      <div className="bg-panel border border-border rounded-xl flex flex-col overflow-hidden min-h-[460px]">
        <div className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-background/50">
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs">
            <span className="text-textMuted font-semibold hidden sm:inline">Spectral Layer:</span>
            <button
              onClick={() => setSelectedLayer('trueColor')}
              className={cx("px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer", selectedLayer === 'trueColor' ? "bg-info text-black font-bold" : "bg-panel border border-border text-textMuted hover:text-white")}
            >
              True Color (RGB)
            </button>
            <button
              onClick={() => setSelectedLayer('ndvi')}
              className={cx("px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer", selectedLayer === 'ndvi' ? "bg-info text-black font-bold" : "bg-panel border border-border text-textMuted hover:text-white")}
            >
              NDVI Surface
            </button>
            <button
              onClick={() => setSelectedLayer('swir')}
              className={cx("px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer", selectedLayer === 'swir' ? "bg-info text-black font-bold" : "bg-panel border border-border text-textMuted hover:text-white")}
            >
              SWIR Pit Moisture
            </button>
            <button
              onClick={() => setSelectedLayer('bsi')}
              className={cx("px-2.5 py-1.5 rounded text-xs font-semibold cursor-pointer", selectedLayer === 'bsi' ? "bg-info text-black font-bold" : "bg-panel border border-border text-textMuted hover:text-white")}
            >
              BSI Outcrops
            </button>
          </div>
          
          <div className="text-[11px] text-textMuted flex items-center gap-2">
            <span>Cloud Coverage:</span>
            <span className="font-bold text-sky-400 font-mono">{currentCloud}%</span>
          </div>
        </div>
        
        <div className="flex-1 relative min-h-[380px]">
          <MapContainer 
            center={mineData.coordinates} 
            zoom={14} 
            style={{ height: '100%', width: '100%', background: '#0B0F19' }}
            zoomControl={false}
          >
            <MapController center={mineData.coordinates} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri World Imagery'
            />
            {mineData.zones.map((zone, idx) => (
              <Polygon 
                key={`${mineData.name}-zone-${idx}`}
                positions={zone.polygon}
                pathOptions={{ 
                  color: zone.level === 'Very High' ? '#10B981' : '#06B6D4', 
                  fillColor: zone.level === 'Very High' ? '#10B981' : '#06B6D4',
                  fillOpacity: 0.25,
                  weight: 2 
                }}
              />
            ))}
          </MapContainer>

          {/* Floating Metadata Card */}
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-panel/95 backdrop-blur border border-border p-3 rounded-lg z-[1000] shadow-xl text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1 text-accentLight">
                <Satellite size={13} /> Sentinel-2 Level-2A Tile
              </span>
              <span className="text-[10px] text-textMuted font-mono">
                {new Date(acqDate).toLocaleDateString()}
              </span>
            </div>
            <div className="text-[10px] text-textMuted truncate font-mono" title={productName}>
              Product: {productName}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 text-[10px]">
              <div>Processing: <strong className="text-white">Bottom-of-Atmosphere (L2A)</strong></div>
              <div>Bands: <strong className="text-white">B2, B3, B4, B8, B11, B12</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-panel border border-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-textMuted uppercase">Earth Observation</span>
            <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-success/15 text-success border border-success/30">
              Copernicus CDSE
            </span>
          </div>
          <div className="text-sm font-bold text-white">Sentinel-2 MSI Level-2A</div>
          <div className="text-xs text-textMuted mt-1">Observation: {new Date(acqDate).toLocaleString()}</div>
        </div>

        <div className="bg-panel border border-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-textMuted uppercase">Atmospheric Telemetry</span>
            <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-success/15 text-success border border-success/30">
              Open-Meteo API
            </span>
          </div>
          <div className="text-sm font-bold text-white">Pit Rainfall & Temperature</div>
          <div className="text-xs text-textMuted mt-1">Rain: {currentRainfall}mm • Temp: {currentTemp}°C</div>
        </div>

        <div className="bg-panel border border-border rounded-xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-textMuted uppercase">Geological Base</span>
            <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-info/15 text-info border border-info/30">
              GSI / MOIL Archive
            </span>
          </div>
          <div className="text-sm font-bold text-white">Sausar Group Manganese Belt</div>
          <div className="text-xs text-textMuted mt-1">Lithology: Mansar / Gondite Formations</div>
        </div>
      </div>
    </div>
  );
}
