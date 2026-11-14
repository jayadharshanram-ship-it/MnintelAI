import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, LayersControl, useMap } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, Map as MapIcon, Database, ShieldCheck, HelpCircle, X } from 'lucide-react';
import { useMine } from '../context/MineContext';

const featureImportanceData = [
  { name: 'Geological Features', value: 31, fill: '#06B6D4' },
  { name: 'Spectral Features', value: 26, fill: '#10B981' },
  { name: 'Known Occurrences', value: 18, fill: '#D97706' },
  { name: 'Structural Features', value: 14, fill: '#8B5CF6' },
  { name: 'Terrain', value: 7, fill: '#FBBF24' },
  { name: 'Environmental', value: 4, fill: '#94A3B8' },
];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function ReserveIntelligence() {
  const [activeTab, setActiveTab] = useState('Map');
  const [showWhy, setShowWhy] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const { mineData } = useMine();

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center mb-1">
            <MapIcon className="text-accentLight mr-2 w-6 h-6" /> Reserve Intelligence
          </h1>
          <p className="text-sm text-textMuted">AI-generated exploration prospectivity for {mineData.name}</p>
        </div>
        <div className="flex bg-background border border-border rounded-lg p-1">
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'Map' ? 'bg-panel text-white shadow' : 'text-textMuted hover:text-white'}`}
            onClick={() => setActiveTab('Map')}
          >
            GIS View
          </button>
          <button 
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'Analytics' ? 'bg-panel text-white shadow' : 'text-textMuted hover:text-white'}`}
            onClick={() => setActiveTab('Analytics')}
          >
            Data Analytics
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[500px]">
        {/* Left Sidebar - Map Controls */}
        <div className="lg:col-span-1 bg-panel border border-border rounded-xl p-4 flex flex-col overflow-y-auto">
          <h3 className="font-semibold mb-4 flex items-center text-sm uppercase tracking-wider text-textMuted">
            <Database className="w-4 h-4 mr-2" /> Reserve Data
          </h3>
          
          <div className="mb-6">
            <div className="text-sm text-textMuted mb-1">Total Estimated Reserve</div>
            <div className="text-2xl font-bold">{mineData.estimatedReserves} MT</div>
          </div>

          <div className="space-y-3 text-sm mb-6 pb-6 border-b border-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center"><div className="w-3 h-3 rounded bg-success mr-2"></div> Proven</div>
              <span className="font-bold">{mineData.reserveDetails.proven} MT</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center"><div className="w-3 h-3 rounded bg-info mr-2"></div> Probable</div>
              <span className="font-bold">{mineData.reserveDetails.probable} MT</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center"><div className="w-3 h-3 rounded bg-warning mr-2"></div> Inferred</div>
              <span className="font-bold">{mineData.reserveDetails.inferred} MT</span>
            </div>
          </div>

          <h3 className="font-semibold mb-4 flex items-center text-sm uppercase tracking-wider text-textMuted">
            <Layers className="w-4 h-4 mr-2" /> Map Layers
          </h3>
          
          <div className="space-y-3 flex-1">
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border bg-background text-accent" />
              <span>Satellite</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border bg-background text-accent" />
              <span>Prospectivity Zones</span>
            </label>
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border bg-background text-accent" />
              <span>Mine Boundary</span>
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center mb-2">
              <ShieldCheck className="w-4 h-4 text-success mr-2" />
              <span className="text-xs font-semibold text-white">Prediction Confidence: {mineData.aiConfidence}%</span>
            </div>
            <p className="text-[10px] text-textMuted mt-1 italic">
              Confidence levels derived from extensive ground-truth data validation.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-panel border border-border rounded-xl flex flex-col overflow-hidden relative">
          {activeTab === 'Map' ? (
            <div className="h-full w-full relative">
              <MapContainer 
                center={mineData.coordinates} 
                zoom={14} 
                style={{ height: '100%', width: '100%', background: '#0B0F19' }}
              >
                <MapController center={mineData.coordinates} />
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Satellite">
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                      attribution='&copy; Esri'
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>
                
                {mineData.zones.map((zone: any, idx: number) => (
                  <Polygon 
                    key={`${mineData.name}-poly-${idx}`}
                    positions={zone.polygon}
                    pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: zone.level === 'Very High' ? 0.6 : 0.4, weight: 2 }}
                    eventHandlers={{ click: () => setActiveZone(zone.name) }}
                  />
                ))}
              </MapContainer>

              {activeZone && (() => {
                const zoneData = mineData.zones.find((z: any) => z.name === activeZone);
                if (!zoneData) return null;
                
                return (
                  <div className="fixed inset-x-0 bottom-16 md:bottom-auto md:absolute md:top-4 md:right-4 w-full md:w-80 bg-panel/95 backdrop-blur border-t md:border border-border rounded-t-2xl md:rounded-lg shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-2xl z-[1000] p-5 text-sm animate-fade-in-up pb-safe">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-accentLight">{zoneData.name}</h3>
                        <p className="text-xs text-textMuted">AI-Assisted Exploration Target</p>
                      </div>
                      <button onClick={() => setActiveZone(null)} className="text-textMuted hover:text-white bg-panelHover rounded-full p-1.5 w-7 h-7 flex items-center justify-center">&times;</button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                      <span className="text-textMuted font-medium">Estimated Prospectivity</span>
                      <span className="text-xl font-bold text-success">{zoneData.score}/100</span>
                    </div>
                    
                    <div className="space-y-3 mb-4 hidden sm:block">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-textMuted">Geological Compatibility</span>
                          <span className="font-bold">94%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5"><div className="bg-info h-1.5 rounded-full" style={{width: '94%'}}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-textMuted">Spectral Similarity</span>
                          <span className="font-bold">88%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5"><div className="bg-success h-1.5 rounded-full" style={{width: '88%'}}></div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-textMuted">Structural Evidence</span>
                          <span className="font-bold">91%</span>
                        </div>
                        <div className="w-full bg-border rounded-full h-1.5"><div className="bg-warning h-1.5 rounded-full" style={{width: '91%'}}></div></div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 sm:hidden grid grid-cols-2 gap-2">
                       <div className="bg-background rounded p-2 text-center text-xs">Geo: 94%</div>
                       <div className="bg-background rounded p-2 text-center text-xs">Spec: 88%</div>
                       <div className="bg-background rounded p-2 text-center text-xs">Struct: 91%</div>
                       <div className="bg-background rounded p-2 text-center text-xs">Hist: 90%</div>
                    </div>
                    
                    <button onClick={() => { setActiveZone(null); setShowWhy(zoneData.name); }} className="w-full bg-accent hover:bg-accentLight text-white py-2.5 rounded font-bold text-xs shadow-lg flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 mr-2" /> View AI Explanation
                    </button>
                  </div>
                );
              })()}

              <div className="absolute bottom-4 right-4 bg-panel/90 backdrop-blur border border-border p-3 rounded-lg z-[1000] shadow-lg">
                <h4 className="text-xs font-semibold mb-2">Prospectivity Legend</h4>
                <div className="flex items-center text-xs space-x-2">
                  <div className="w-4 h-4 bg-[#EF4444] opacity-80 rounded"></div> <span>Very High (&gt;90)</span>
                </div>
                <div className="flex items-center text-xs space-x-2 mt-1">
                  <div className="w-4 h-4 bg-[#F97316] opacity-80 rounded"></div> <span>High (75-90)</span>
                </div>
                <div className="flex items-center text-xs space-x-2 mt-1">
                  <div className="w-4 h-4 bg-[#FBBF24] opacity-80 rounded"></div> <span>Moderate (50-75)</span>
                </div>
                <div className="flex items-center text-xs space-x-2 mt-1">
                  <div className="w-4 h-4 bg-[#10B981] opacity-80 rounded"></div> <span>Low (&lt;50)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-6">AI Feature Importance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={featureImportanceData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#94A3B8" />
                        <YAxis dataKey="name" type="category" stroke="#E2E8F0" width={150} tick={{fill: '#E2E8F0', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151C2C', borderColor: '#2A3441', color: '#E2E8F0' }}
                          itemStyle={{ color: '#E2E8F0' }}
                          cursor={{fill: '#1E2638'}}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {featureImportanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6">Exploration Targets</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-textMuted uppercase bg-background">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Target</th>
                          <th className="px-4 py-3">Score</th>
                          <th className="px-4 py-3">Confidence</th>
                          <th className="px-4 py-3 rounded-tr-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mineData.zones.map((zone, idx) => (
                          <tr key={idx} className="border-b border-border bg-panel">
                            <td className="px-4 py-3 font-medium text-white">{zone.name}</td>
                            <td className="px-4 py-3 font-bold" style={{ color: zone.color }}>{zone.score}</td>
                            <td className="px-4 py-3"><span className="bg-success/20 text-success px-2 py-1 rounded text-xs">High</span></td>
                            <td className="px-4 py-3">Field investigation</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WHY Modal */}
      {showWhy && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-panel border border-border rounded-xl w-full max-w-lg shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center">
                <HelpCircle className="w-6 h-6 mr-2 text-info" /> AI Explainability: {showWhy}
              </h2>
              <button onClick={() => setShowWhy(null)} className="text-textMuted hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-4">Feature Contribution</h3>
              <div className="space-y-4">
                {featureImportanceData.map((cause, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium">{cause.name}</span>
                      <span className="text-sm font-bold" style={{ color: cause.fill }}>+{cause.value}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${cause.value}%`, backgroundColor: cause.fill }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-background border border-border rounded-lg text-sm text-textMuted leading-relaxed">
                <strong className="text-white block mb-1">Synthesis:</strong> 
                The high score is predominantly driven by the alignment of <span className="text-white">Geological compatibility</span> and <span className="text-white">Spectral signatures</span> extracted from recent Sentinel-2 imagery, further corroborated by <span className="text-white">Historical proximity</span> data.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
