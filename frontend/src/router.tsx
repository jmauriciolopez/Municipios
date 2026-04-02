import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import IncidentesPage from './pages/IncidentesPage';
import IncidenteDetallePage from './pages/IncidenteDetallePage';
import OrdenesPage from './pages/OrdenesPage';
import OrdenDetallePage from './pages/OrdenDetallePage';
import ActivosPage from './pages/ActivosPage';
import CuadrillasPage from './pages/CuadrillasPage';
import MapaPage from './pages/MapaPage';

export default function AppRouter() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/incidentes" element={<IncidentesPage />} />
        <Route path="/incidentes/:id" element={<IncidenteDetallePage />} />
        <Route path="/ordenes" element={<OrdenesPage />} />
        <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
        <Route path="/activos" element={<ActivosPage />} />
        <Route path="/cuadrillas" element={<CuadrillasPage />} />
        <Route path="/mapa" element={<MapaPage />} />
        <Route path="*" element={<Navigate to='/' replace />} />
      </Routes>
    </AppLayout>
  );
}
