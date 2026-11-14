import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Satellite, Database, Brain, Map as MapIcon, ChevronRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      navigate('/app/overview');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background text-textMain flex flex-col md:flex-row">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/3 p-8 lg:p-12 flex flex-col justify-center border-r border-border bg-panel/50 z-10 relative">
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded bg-accent text-white flex items-center justify-center mr-3 font-bold text-lg shadow-[0_0_15px_rgba(217,119,6,0.5)]">
              Mn
            </div>
            <span className="text-3xl font-extrabold tracking-wider text-accentLight">MnIntel</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Manganese Intelligence & Production Optimization</h1>
          <p className="text-textMuted">AI + Space Technology for Smarter Mining</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Username</label>
            <input 
              type="text" 
              defaultValue="demo@mnintel.ai"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
            <input 
              type="password" 
              defaultValue="demo123"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent hover:bg-accentLight text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all disabled:opacity-70"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Demo Login
              </>
            )}
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-border/50 text-xs text-textMuted text-center">
          &copy; 2026 MOIL Limited. All rights reserved.
        </div>
      </div>

      {/* Right side - Visual Hero Element */}
      <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden bg-[#0a0e17]">
        {/* Abstract grids and lights */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjMTUxYzJjIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPjxwYXRoIGQ9Ik02MCAwaC02MHY2MGg2MHYtNjB6Ii8+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        {/* Glow effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-info/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]"></div>

        {/* AI Pipeline Visualization */}
        <div className="relative z-10 flex flex-col items-center">
          
          {/* Pipeline elements */}
          <div className="flex flex-col items-center space-y-6">
            
            <PipelineStep icon={<Satellite className="w-8 h-8 text-info" />} title="Earth Observation" delay="0s" />
            <div className="w-px h-10 bg-gradient-to-b from-info to-success"></div>
            
            <PipelineStep icon={<Database className="w-8 h-8 text-success" />} title="Geological Layers" delay="0.2s" />
            <div className="w-px h-10 bg-gradient-to-b from-success to-warning"></div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-warning/20 rounded-full blur-xl group-hover:bg-warning/30 transition-all duration-1000 animate-pulse"></div>
              <PipelineStep icon={<Brain className="w-10 h-10 text-warning" />} title="AI Analysis Engine" delay="0.4s" large />
            </div>
            <div className="w-px h-10 bg-gradient-to-b from-warning to-accent"></div>
            
            <div className="flex space-x-12">
              <div className="flex flex-col items-center">
                <div className="w-px h-10 bg-accent mb-6 -mt-6 origin-top rotate-45 transform translate-x-6"></div>
                <PipelineStep icon={<MapIcon className="w-8 h-8 text-accent" />} title="Reserve Map" delay="0.6s" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-px h-10 bg-accent mb-6 -mt-6 origin-top -rotate-45 transform -translate-x-6"></div>
                <PipelineStep icon={<ChevronRight className="w-8 h-8 text-accent" />} title="Production Optimization" delay="0.8s" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineStep({ icon, title, delay, large = false }: any) {
  return (
    <div 
      className={`flex items-center bg-panel border border-border rounded-xl shadow-lg backdrop-blur-sm animate-fade-in-up`}
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className={`p-4 flex items-center justify-center ${large ? 'scale-110' : ''}`}>
        {icon}
      </div>
      <div className={`pr-6 py-4 border-l border-border/50 ${large ? 'font-bold text-lg' : 'font-medium text-sm'}`}>
        {title}
      </div>
    </div>
  );
}
