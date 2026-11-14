import { Link } from 'react-router-dom';
import { ArrowRight, Satellite, Brain, Activity, TrendingUp, Map as MapIcon, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-textMain flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-info/20 via-background to-background"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/20 via-background to-background"></div>
      </div>
      
      <header className="container mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-wider text-accentLight">MnINTEL</span>
          <span className="text-xs text-textMuted uppercase tracking-widest">MOIL Limited</span>
        </div>
        <Link to="/app" className="hidden md:flex items-center text-sm font-medium hover:text-accentLight transition-colors">
          Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-6 flex flex-col justify-center z-10 relative mt-12 md:mt-0">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Smarter Manganese Mining with <span className="text-transparent bg-clip-text bg-gradient-to-r from-info to-accentLight">AI + Space Technology</span>
          </h1>
          <p className="text-xl md:text-2xl text-textMuted mb-10 max-w-2xl">
            Predict reserves. Forecast production. Detect risks. Optimize operations.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/app" className="bg-accent hover:bg-accentLight text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-colors">
              Explore Intelligence Dashboard
            </Link>
            <button className="bg-panel border border-border hover:bg-panelHover px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center transition-colors">
              View System Architecture
            </button>
          </div>
        </div>

        {/* Stats / Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 border-t border-border/50 pt-10">
          <div>
            <div className="flex items-center text-info mb-2">
              <Brain className="w-5 h-5 mr-2" />
              <span className="font-semibold uppercase tracking-wider text-xs">AI-Powered</span>
            </div>
            <div className="text-lg font-medium">Reserve Intelligence</div>
          </div>
          <div>
            <div className="flex items-center text-success mb-2">
              <Activity className="w-5 h-5 mr-2" />
              <span className="font-semibold uppercase tracking-wider text-xs">Real-Time</span>
            </div>
            <div className="text-lg font-medium">Operational Monitoring</div>
          </div>
          <div>
            <div className="flex items-center text-warning mb-2">
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="font-semibold uppercase tracking-wider text-xs">Predictive</span>
            </div>
            <div className="text-lg font-medium">Production Analytics</div>
          </div>
          <div>
            <div className="flex items-center text-accent mb-2">
              <Satellite className="w-5 h-5 mr-2" />
              <span className="font-semibold uppercase tracking-wider text-xs">Satellite-Driven</span>
            </div>
            <div className="text-lg font-medium">Environmental Intelligence</div>
          </div>
        </div>
        
        {/* Unique Value Proposition */}
        <div className="mt-24 mb-12">
          <h2 className="text-3xl font-bold mb-10 text-center">One Platform. Four Intelligence Layers.</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-panel/50 p-6 rounded-xl border border-border backdrop-blur-sm">
              <Satellite className="w-8 h-8 text-info mb-4" />
              <h3 className="text-lg font-bold mb-2">Space Intelligence</h3>
              <p className="text-textMuted text-sm">Satellite + environmental data analysis for surface indicators.</p>
            </div>
            <div className="bg-panel/50 p-6 rounded-xl border border-border backdrop-blur-sm">
              <MapIcon className="w-8 h-8 text-accentLight mb-4" />
              <h3 className="text-lg font-bold mb-2">Geological Intelligence</h3>
              <p className="text-textMuted text-sm">Reserve estimation and prospectivity analysis.</p>
            </div>
            <div className="bg-panel/50 p-6 rounded-xl border border-border backdrop-blur-sm">
              <Settings className="w-8 h-8 text-success mb-4" />
              <h3 className="text-lg font-bold mb-2">Operational Intelligence</h3>
              <p className="text-textMuted text-sm">Real-time equipment health and mine performance tracking.</p>
            </div>
            <div className="bg-panel/50 p-6 rounded-xl border border-border backdrop-blur-sm">
              <Brain className="w-8 h-8 text-warning mb-4" />
              <h3 className="text-lg font-bold mb-2">Predictive Intelligence</h3>
              <p className="text-textMuted text-sm">Shortfall forecasting and AI-driven corrective recommendations.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
