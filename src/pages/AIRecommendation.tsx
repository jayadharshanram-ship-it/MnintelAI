import { useState, useEffect } from 'react';
import { Bot, AlertTriangle, CheckCircle, BrainCircuit, FileCheck, ArrowRight } from 'lucide-react';
import cx from 'classnames';
import { useMine } from '../context/MineContext';

export default function AIRecommendation() {
  const { mineData } = useMine();
  const [simulated, setSimulated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Reset simulation state when mine changes
  useEffect(() => {
    setSimulated(false);
  }, [mineData.name]);

  const applyRecommendation = () => {
    setShowModal(true);
    setTimeout(() => {
      setSimulated(true);
      setShowModal(false);
    }, 1500);
  };

  const isShortfall = mineData.shortfallRisk > 15;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center">
            <Bot className="text-info mr-2 w-6 h-6" /> AI Mine Operations Advisor
          </h1>
          <p className="text-sm text-textMuted mt-1">AI-powered corrective actions and scenario testing for {mineData.name}.</p>
        </div>
        <div className="flex items-center text-sm font-medium text-success bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
          <BrainCircuit className="w-4 h-4 mr-2" />
          Optimization Engine Active
        </div>
      </div>

      {isShortfall && (
        <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-lg flex items-start">
          <AlertTriangle className="text-danger w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-danger font-bold text-sm">⚠ Production shortfall predicted</h3>
            <p className="text-danger/80 text-sm mt-1">Current equipment availability and weather conditions indicate a potential {Math.round(((mineData.monthlyTarget - mineData.monthlyProduction) / mineData.monthlyTarget) * 100)}% production reduction.</p>
          </div>
        </div>
      )}

      {simulated && (
        <div className="bg-success/10 border-l-4 border-success p-6 rounded-r-lg mt-6 animate-fade-in-up">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-success font-bold text-lg mb-2 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" /> Simulation Results Applied
              </h3>
              <p className="text-textMuted text-sm">The forecast has been updated based on your selected actions.</p>
            </div>
            <div className="flex space-x-6">
              <div>
                <div className="text-xs text-textMuted uppercase tracking-wider mb-1">Before</div>
                <div className="text-xl font-bold text-textMuted line-through">{mineData.monthlyProduction.toLocaleString()} T</div>
              </div>
              <div>
                <div className="text-xs text-success uppercase tracking-wider mb-1">After</div>
                <div className="text-2xl font-bold text-success">{Math.round(mineData.monthlyProduction * 1.049).toLocaleString()} T</div>
              </div>
              <div className="flex flex-col justify-end pb-1">
                <span className="text-sm font-bold text-success bg-success/20 px-2 py-1 rounded">+4.9% Improved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-4 border-b border-border pb-2">Recommended Actions</h2>

      <div className="space-y-4">
        {mineData.recommendations.map((rec, i) => (
          <div key={rec.id} className={cx(
            "bg-panel border rounded-xl p-5 transition-colors",
            i === 0 && simulated ? "border-success bg-success/5" : "border-border hover:border-info/50",
            i !== 0 ? "opacity-70" : ""
          )}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-info font-bold mr-3 uppercase tracking-wider text-xs">Recommendation {i + 1}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{rec.title}</h3>
                <p className="text-textMuted text-sm mb-4">
                  {rec.desc}
                </p>
                
                <div className="flex space-x-6 mb-4">
                  <div>
                    <div className="text-xs text-textMuted uppercase tracking-wider mb-1">Expected Impact</div>
                    <div className="text-success font-bold text-lg">{rec.impact}</div>
                  </div>
                  <div>
                    <div className="text-xs text-textMuted uppercase tracking-wider mb-1">Confidence</div>
                    <div className="text-info font-bold text-lg">{rec.confidence}%</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2 min-w-[200px]">
                {i === 0 ? (
                  <button 
                    onClick={applyRecommendation}
                    disabled={simulated}
                    className="bg-info hover:bg-info/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded text-sm flex justify-center items-center transition-colors"
                  >
                    {simulated ? <CheckCircle className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    {simulated ? "Applied" : rec.action}
                  </button>
                ) : (
                  <button className="bg-panelHover border border-border text-white font-medium py-2 px-4 rounded text-sm flex justify-center items-center">
                    <FileCheck className="w-4 h-4 mr-2" /> {rec.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 bg-info/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-info/30 border-t-info rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-bold mb-2">Running Simulation...</h3>
            <p className="text-textMuted text-sm">Applying "{mineData.recommendations[0].title}" to the forecast model.</p>
          </div>
        </div>
      )}
    </div>
  );
}
