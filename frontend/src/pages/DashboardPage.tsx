import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getResumen,
  getIncidentesPorEstado,
  getOrdenesPorArea,
  getTiemposResolucion,
} from '@shared/services/dashboard.api';
import StatCard from '../components/ui/StatCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState<any>(null);
  const [porEstado, setPorEstado] = useState<any[]>([]);
  const [porArea, setPorArea] = useState<any[]>([]);
  const [tiempos, setTiempos] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getResumen(), getIncidentesPorEstado(), getOrdenesPorArea(), getTiemposResolucion()])
      .then(([r, e, a, t]) => {
        setResumen(r);
        setPorEstado(e as any[]);
        setPorArea(a as any[]);
        setTiempos(t);
      })
      .catch(err => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Cargando dashboard municipal...</p>
      </div>
    );
  }

  const maxEstado = Math.max(1, ...porEstado.map((e) => e.cantidad));
  const maxArea = Math.max(1, ...porArea.map((a) => a.cantidad));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Visión general del estado operativo de la gestión municipal.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2 shadow-indigo-200 dark:shadow-none" onClick={() => navigate('/incidentes')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            Nuevo Incidente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total incidentes"
          value={resumen?.totalIncidentes ?? 0}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          sub="Registrados"
          accent="#6366f1"
        />
        <StatCard
          label="Trabajo Activo"
          value={resumen?.totalOrdenes ?? 0}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>}
          sub="Órdenes de trabajo"
          accent="#0ea5e9"
        />
        <StatCard
          label="En ejecución"
          value={resumen?.ordenesEnProceso ?? 0}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>}
          sub="Personal asignado"
          accent="#f59e0b"
        />
        <StatCard
          label="Tiempo Resolución"
          value={`${tiempos?.promedioHoras ?? 0}h`}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          sub="Promedio histórico"
          accent="#10b981"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-premium h-full dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Distribución de Incidentes</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Por Estado</span>
          </div>
          
          {porEstado.length === 0 ? (
            <div className="flex items-center justify-center h-48 italic text-slate-400">Sin datos registrados</div>
          ) : (
            <div className="space-y-6">
              {porEstado.map((item) => (
                <div key={item.estado} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight group-hover:text-indigo-500 transition-colors">
                      {item.estado.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 transition-transform group-hover:scale-110">
                      {item.cantidad}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-1000 ease-out group-hover:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      style={{ width: `${(item.cantidad / maxEstado) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-premium h-full dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Órdenes por Área</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operatividad</span>
          </div>

          {porArea.length === 0 ? (
            <div className="flex items-center justify-center h-48 italic text-slate-400">Sin datos registrados</div>
          ) : (
            <div className="space-y-6">
              {porArea.map((item) => (
                <div key={item.area} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                      {item.area}
                    </span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 transition-transform group-hover:scale-110">
                      {item.cantidad}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-sky-500 transition-all duration-1000 ease-out group-hover:bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
                      style={{ width: `${(item.cantidad / maxArea) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-10">
        <button className="btn-secondary flex items-center gap-2 group" onClick={() => navigate('/incidentes')}>
          Gestionar Incidentes
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
        <button className="btn-secondary flex items-center gap-2 group" onClick={() => navigate('/ordenes')}>
          Ver Órdenes
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
        <button className="btn-secondary flex items-center gap-2 group" onClick={() => navigate('/mapa')}>
          Mapa Operativo
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
}

