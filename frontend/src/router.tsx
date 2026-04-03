import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import IncidentesPage from './pages/IncidentesPage';
import IncidenteDetallePage from './pages/IncidenteDetallePage';
import OrdenesPage from './pages/OrdenesPage';
import OrdenDetallePage from './pages/OrdenDetallePage';
import ActivosPage from './pages/ActivosPage';
import CuadrillasPage from './pages/CuadrillasPage';
import AreasPage from './pages/AreasPage';
import MapaPage from './pages/MapaPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';


export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/incidentes" element={<ProtectedRoute><AppLayout><IncidentesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/incidentes/:id" element={<ProtectedRoute><AppLayout><IncidenteDetallePage /></AppLayout></ProtectedRoute>} />
      <Route path="/ordenes" element={<ProtectedRoute><AppLayout><OrdenesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/ordenes/:id" element={<ProtectedRoute><AppLayout><OrdenDetallePage /></AppLayout></ProtectedRoute>} />
      <Route path="/areas" element={<ProtectedRoute><AppLayout><AreasPage /></AppLayout></ProtectedRoute>} />
      <Route path="/activos" element={<ProtectedRoute><AppLayout><ActivosPage /></AppLayout></ProtectedRoute>} />
      <Route path="/cuadrillas" element={<ProtectedRoute><AppLayout><CuadrillasPage /></AppLayout></ProtectedRoute>} />
      <Route path="/mapa" element={<ProtectedRoute><AppLayout><MapaPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to='/' replace />} />
    </Routes>
  );
}
