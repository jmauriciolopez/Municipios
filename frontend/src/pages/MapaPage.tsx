import { useEffect, useMemo, useState } from 'react';
import { getIncidentes } from '@shared/services/incidentes.api';
import IncidentMap from '../components/map/IncidentMap';
import { Incident } from '../types/incident';
import StatusBadge from '../components/ui/StatusBadge';

export default function MapaPage() {
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    getIncidentes()
      .then((data: any[]) =>
        setIncidentes(
          data
            .filter((i) => i.lat && i.lng)
            .map((i) => ({
              id: i.id,
              tipo: i.tipo,
              estado: i.estado,
              prioridad: i.prioridad,
              area: i.area?.nombre ?? i.area_id ?? '',
              lat: Number(i.lat),
              lng: Number(i.lng),
              direccion: i.direccion ?? '',
              fecha: i.fechaReporte?.slice(0, 10) ?? i.fecha_reporte?.slice(0, 10) ?? '',
            }))
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const tiposUnicos = useMemo(() => [...new Set(incidentes.map((i) => i.tipo))], [incidentes]);

  const filtered = useMemo(
    () =>
      incidentes.filter((i) => {
        if (tipo && i.tipo !== tipo) return false;
        if (estado && i.estado !== estado) return false;
        return true;
      }),
    [incidentes, tipo, estado]
  );

  return (
    <div>
      <div className="page-header">
        <h2>Mapa de incidentes</h2>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <div className="filter-item">
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {tiposUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'].map((e) => (
              <option key={e} value={e}>{e.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
        <button className="btn-secondary" onClick={() => { setTipo(''); setEstado(''); }}>
          Limpiar
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {loading ? (
            <div className="loading-state">Cargando mapa...</div>
          ) : (
            <IncidentMap incidents={filtered} onSelectIncident={setSelected} />
          )}
        </div>

        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="chart-card">
            <h3>Incidentes ({filtered.length})</h3>
            {selected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{selected.tipo}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>{selected.direccion || 'Sin dirección'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <StatusBadge status={selected.estado} />
                  <StatusBadge status={selected.prioridad} />
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span><strong>Área:</strong> {selected.area}</span>
                  <span><strong>Fecha:</strong> {selected.fecha}</span>
                </div>
                <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelected(null)}>
                  Cerrar
                </button>
              </div>
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Hacé clic en un marcador para ver los detalles.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
