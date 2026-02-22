import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DemoSettingsPage } from './pages/DemoSettingsPage';
import { DevicesPage } from './pages/DevicesPage';
import { IntegrationsPrivacyPage } from './pages/IntegrationsPrivacyPage';
import { UnitBoardPage } from './pages/UnitBoardPage';
import { useDemoStore } from './store/demoStore';

function AppRouter() {
  const location = useLocation();
  const initFromQuery = useDemoStore((s) => s.initFromQueryParams);
  const tick = useDemoStore((s) => s.tick);
  const clearHighlight = useDemoStore((s) => s.clearHighlight);

  useEffect(() => {
    initFromQuery(location.search);
  }, [initFromQuery, location.search]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      tick();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [tick]);

  useEffect(() => {
    const timer = window.setTimeout(() => clearHighlight(), 2500);
    return () => window.clearTimeout(timer);
  }, [location.pathname, clearHighlight]);

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<UnitBoardPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/integrations" element={<IntegrationsPrivacyPage />} />
        <Route path="/demo-settings" element={<DemoSettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
