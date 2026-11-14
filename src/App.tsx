import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

// Lazy load all pages for better mobile performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ReserveIntelligence = lazy(() => import('./pages/ReserveIntelligence'));
const ProductionForecast = lazy(() => import('./pages/ProductionForecast'));
const RiskDashboard = lazy(() => import('./pages/RiskDashboard'));
const EquipmentIntelligence = lazy(() => import('./pages/EquipmentIntelligence'));
const SatelliteIntelligence = lazy(() => import('./pages/SatelliteIntelligence'));
const AIRecommendation = lazy(() => import('./pages/AIRecommendation'));
const AdvancedAnalytics = lazy(() => import('./pages/AdvancedAnalytics'));
const ReportGeneration = lazy(() => import('./pages/ReportGeneration'));
const NetworkTest = lazy(() => import('./pages/NetworkTest'));
const MobileTest = lazy(() => import('./pages/MobileTest'));
const ConnectionStatus = lazy(() => import('./pages/ConnectionStatus'));

import { MineProvider } from './context/MineContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 5, // 5 minutes (saves data, caches intelligence)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (keep data available offline)
      retry: (failureCount, error: any) => {
        // Retry 3 times for network errors, but stop if offline
        if (!navigator.onLine) return false;
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff up to 10s
    },
  },
});

const LoadingFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-accent animate-spin mb-4" />
    <div className="text-textMuted font-medium animate-pulse">Loading module...</div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MineProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={
                <Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>
              } />
              <Route path="reserve" element={
                <Suspense fallback={<LoadingFallback />}><ReserveIntelligence /></Suspense>
              } />
              <Route path="production" element={
                <Suspense fallback={<LoadingFallback />}><ProductionForecast /></Suspense>
              } />
              <Route path="risk" element={
                <Suspense fallback={<LoadingFallback />}><RiskDashboard /></Suspense>
              } />
              <Route path="equipment" element={
                <Suspense fallback={<LoadingFallback />}><EquipmentIntelligence /></Suspense>
              } />
              <Route path="satellite" element={
                <Suspense fallback={<LoadingFallback />}><SatelliteIntelligence /></Suspense>
              } />
              <Route path="ai-advisor" element={
                <Suspense fallback={<LoadingFallback />}><AIRecommendation /></Suspense>
              } />
              <Route path="analytics" element={
                <Suspense fallback={<LoadingFallback />}><AdvancedAnalytics /></Suspense>
              } />
              <Route path="reports" element={
                <Suspense fallback={<LoadingFallback />}><ReportGeneration /></Suspense>
              } />
              <Route path="network-test" element={
                <Suspense fallback={<LoadingFallback />}><NetworkTest /></Suspense>
              } />
              <Route path="mobile-test" element={
                <Suspense fallback={<LoadingFallback />}><MobileTest /></Suspense>
              } />
              <Route path="connection-status" element={
                <Suspense fallback={<LoadingFallback />}><ConnectionStatus /></Suspense>
              } />
            </Route>
          </Routes>
        </Router>
      </MineProvider>
    </QueryClientProvider>
  );
}

export default App;
