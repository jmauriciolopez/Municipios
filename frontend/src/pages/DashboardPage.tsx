import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getResumen,
  getIncidentesPorEstado,
  getOrdenesPorArea,
} from '@shared/services/dashboard.api';
import StatCard from '../components/ui/StatCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState<any>(null);
  const [porEstado, setPorEstado] = useState<any[]>([]);
  const [porArea, setPorArea] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getResumen(), getIncidentesPorEstado(), getOrdenesPorArea()])
      .then(([r, e, a]) => {
        setResumen(r);
        setPorEstado(e as any[]);
        setPorArea(a as any[]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Cargando dashboard...</div>;

  const maxEstado = Math.max(1, ...porEstado.map((e) => e.cantidad));
  const maxArea = Math.max(1, ...porArea.map((a) => a.cantidad));

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="page-grid">
        <StatCard
          label="Total incidentes"
          value={resumen?.totalIncidentes ?? 0}
          icon="⚠️"
          sub="Registrados en el sistema"
          accent="#1d4ed8"
        />
        <StatCard
          label="Órdenes de trabajo"
          value={resumen?.totalOrdenes ?? 0}
          icon="📋"
          sub="Total generadas"
          accent="#0369a1"
        />
        <StatCard
          label="Órdenes en proceso"
          value={resumen?.ordenesEnProceso ?? 0}
          icon="🔧"
          sub="Actualmente en ejecución"
          accent="#d97706"
        />
        <StatCard
          label="Incidentes críticos"
          value={resumen?.incidentesCriticos ?? 0}
          icon="🚨"
          sub="Requieren atención inmediata"
          accent="#dc2626"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="chart-card">
          <h3>Incidentes por estado</h3>
          {porEstado.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin datos</p>
          ) : (
            <div className="bar-chart">
              {porEstado.map((item) => (
                <div key={item.estado} className="bar-row">
                  <span className="bar-label">{item.estado.replace(/_/g, ' ')}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(item.cantidad / maxEstado) * 100}%` }}
                    />
                  </div>
                  <span className="bar-count">{item.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>Órdenes por área</h3>
          {porArea.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin datos</p>
          ) : (
            <div className="bar-chart">
              {porArea.map((item) => (
                <div key={item.area} className="bar-row">
                  <span className="bar-label">{item.area}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(item.cantidad / maxArea) * 100}%`, background: '#0369a1' }}
                    />
                  </div>
                  <span className="bar-count">{item.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button onClick={() => navigate('/incidentes')}>Ver incidentes</button>
        <button className="btn-secondary" onClick={() => navigate('/ordenes')}>Ver órdenes</button>
        <button className="btn-secondary" onClick={() => navigate('/mapa')}>Ver mapa</button>
      </div>
    </div>
  );
}
