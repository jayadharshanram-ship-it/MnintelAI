import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, User, Map as MapIcon, Pickaxe, AlertTriangle, 
  Settings, Satellite, Bot, BarChart3, FileText, Home, Loader2, 
  CheckCircle, WifiOff, Activity, Smartphone, Globe
} from 'lucide-react';
import cx from 'classnames';
import { useMine, minesData } from '../context/MineContext';
import CustomSelect from './CustomSelect';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { selectedMineName, setSelectedMineName, isChanging, isLiveMode, setIsLiveMode } = useMine();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const network = useNetworkStatus();

  const navItems = [
    { name: 'Overview', path: '/app/overview', icon: Home },
    { name: 'Reserve Intelligence', path: '/app/reserve', icon: MapIcon },
    { name: 'Production Forecast', path: '/app/production', icon: Pickaxe },
    { name: 'Shortfall Risk', path: '/app/risk', icon: AlertTriangle },
    { name: 'Equipment', path: '/app/equipment', icon: Settings },
    { name: 'Satellite Intelligence', path: '/app/satellite', icon: Satellite },
    { name: 'AI Recommendations', path: '/app/ai-advisor', icon: Bot },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/app/reports', icon: FileText },
  ];

  const mineOptions = Object.keys(minesData).map(key => ({
    value: key,
    label: key,
    icon: minesData[key].colorIcon
  }));

  const handleMineChange = (newMine: string) => {
    setSelectedMineName(newMine);
    setToastMessage(`Switched to ${newMine}`);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="flex h-screen bg-background overflow-hidden text-textMain relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 right-6 z-[9999] bg-panel border border-success/30 shadow-2xl rounded-lg p-4 flex items-center animate-fade-in-up">
          <CheckCircle className="text-success w-5 h-5 mr-3" />
          <span className="font-medium text-white">{toastMessage}</span>
        </div>
      )}

      {/* Loading Transition State */}
      {isChanging && (
        <div className="absolute inset-0 z-[1000] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white tracking-wider">Loading mine intelligence...</h2>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-panel border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:w-64 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded bg-accent text-white flex items-center justify-center mr-3 font-bold">
              Mn
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wider text-accentLight leading-none">MnIntel</span>
              <span className="text-[10px] text-textMuted uppercase tracking-widest leading-tight mt-1">Manganese Intelligence</span>
            </div>
          </div>
          <button className="lg:hidden text-textMuted hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {/* Mobile Controls */}
          <div className="px-4 pb-4 mb-4 border-b border-border lg:hidden flex flex-col space-y-4">
            <div>
              <span className="text-xs text-textMuted block mb-1">Mine:</span>
              <div className="relative z-50">
                <CustomSelect 
                  options={mineOptions} 
                  value={selectedMineName} 
                  onChange={handleMineChange} 
                />
              </div>
            </div>
            <button 
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={cx(
                "flex items-center text-[10px] uppercase font-bold px-3 py-1.5 rounded border transition-colors w-full justify-center",
                isLiveMode 
                  ? "text-success bg-success/10 border-success/30 hover:bg-success/20"
                  : "text-warning bg-warning/10 border-warning/30 hover:bg-warning/20"
              )}
            >
              <div className={cx("w-2 h-2 rounded-full mr-2", isLiveMode ? "bg-success animate-pulse" : "bg-warning")}></div>
              {isLiveMode ? "LIVE DATA" : "DEMO DATA"}
            </button>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cx(
                "flex items-center px-4 py-2.5 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-accent/10 text-accentLight border-r-2 border-accentLight" 
                  : "text-textMuted hover:bg-panelHover hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-textMuted uppercase tracking-wider">System Status</h3>
            <div className="flex space-x-2">
              <NavLink to="/app/connection-status" title="Global Connection" className="text-textMuted hover:text-white transition-colors">
                <Globe className="w-3 h-3" />
              </NavLink>
              <NavLink to="/app/mobile-test" title="Mobile Test" className="text-textMuted hover:text-white transition-colors">
                <Smartphone className="w-3 h-3" />
              </NavLink>
              <NavLink to="/app/network-test" title="Network Test" className="text-textMuted hover:text-white transition-colors">
                <Settings className="w-3 h-3" />
              </NavLink>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
              <span>AI Engine Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
              <span>Satellite Data Updated</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-success mr-2"></div>
              <span>Production Data Synced</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 bg-panel border-b border-border z-40 flex-shrink-0 relative">
          <div className="flex items-center">
            <button 
              className="mr-4 lg:hidden text-textMuted hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold hidden sm:block">MOIL Mining Intelligence Center</h1>
            <h1 className="text-lg font-semibold sm:hidden">MnIntel</h1>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm z-50">
              <span className="text-textMuted hidden sm:inline-block mr-1">Mine:</span>
              <CustomSelect 
                options={mineOptions} 
                value={selectedMineName} 
                onChange={handleMineChange} 
              />
            </div>
            
            <div className="hidden xl:block text-xs text-textMuted">
              <span className="text-white mr-1">Date:</span> {new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </div>
            
            <button 
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={cx(
                "hidden lg:flex items-center text-[10px] uppercase font-bold px-3 py-1.5 rounded border transition-colors",
                isLiveMode 
                  ? "text-success bg-success/10 border-success/30 hover:bg-success/20"
                  : "text-warning bg-warning/10 border-warning/30 hover:bg-warning/20"
              )}
            >
              <div className={cx("w-2 h-2 rounded-full mr-2", isLiveMode ? "bg-success animate-pulse" : "bg-warning")}></div>
              {isLiveMode ? "LIVE DATA" : "DEMO DATA"}
            </button>

            <button className="relative text-textMuted hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-danger"></span>
              </span>
            </button>
            
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent text-accentLight flex items-center justify-center">
                <User size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative z-0 mb-16 md:mb-0">
          {!network.online && (
            <div className="bg-danger text-white text-xs font-bold p-2 text-center flex items-center justify-center rounded-lg mb-4">
              <WifiOff className="w-4 h-4 mr-2" />
              OFFLINE MODE: Showing last synchronized data
            </div>
          )}
          {network.online && network.effectiveType?.includes('2g') && (
            <div className="bg-warning text-background text-xs font-bold p-2 text-center flex items-center justify-center rounded-lg mb-4">
              <Activity className="w-4 h-4 mr-2" />
              SLOW NETWORK DETECTED: Using cached intelligence
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-panel border-t border-border z-50 flex justify-around items-center h-16 px-2 pb-safe">
        {[
          { name: 'Home', path: '/app/overview', icon: Home },
          { name: 'Map', path: '/app/reserve', icon: MapIcon },
          { name: 'Risk', path: '/app/risk', icon: AlertTriangle },
          { name: 'AI', path: '/app/ai-advisor', icon: Bot },
        ].map(item => (
          <NavLink 
            key={item.name}
            to={item.path} 
            className={({ isActive }) => cx(
              "flex flex-col items-center justify-center w-1/5 py-1 transition-colors",
              isActive ? "text-accentLight" : "text-textMuted hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center w-1/5 py-1 text-textMuted hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>
    </div>
  );
}
