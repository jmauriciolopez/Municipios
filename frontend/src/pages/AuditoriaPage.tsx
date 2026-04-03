import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';

type Evento = {
  id: string; entidadTipo: string; entidadId: string; accion: string;
  createdAt: string; datos?: any;
  usuario?: { id: string; nombre: string; email: string };
};

const ACCION_COLOR: Record<string, string> = {
  CREATE: '#dcfce7', UPDATE: '#dbeafe', DELETE: '#fee2e2',
  LOGIN: '#ede9fe', LOGOUT: '#f1f5f9', CONVERT_TO_ORDER: '#fef3c7',
};
const ACCION_TEXT: Record<string, string> = {
  CREATE: '#166534', UPDATE: '#1e40af', DELETE: '#991b1b',
  LOGIN: '#5b21b6', LOGOUT: '#475569', CONVERT_TO_ORDER: '#92400e',
};

export default function AuditoriaPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [selected, setSelected] = useState<Evento | null>(null);

  useEffect(() => {
    apiFetch<Evento[]>('/auditoria?limit=200')
      .then(setEventos)
      .catch(() => setError('No se pudo cargar el registro de auditoría.'))
      .finally(() => setLoading(false));
  }, []);

  const tiposUnicos = useMemo(() => [...new Set(eventos.map((e) => e.entidadTipo))].sort(), [eventos]);
  const accionesUnicas = useMemo(() => [...new Set(eventos.map((e) => e.accion))].sort(), [eventos]);

  const filtered = useMemo(() =>
    eventos.filter((e) => {
      if (filtroTipo && e.entidadTipo !== filtroTipo) return false;
      if (filtroAccion && e.accion !== filtroAccion) return false;
      if (filtroUsuario && !(e.usuario?.nombre?.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
        e.usuario?.email?.toLowerCase().includes(filtroUsuario.toLowerCase()))) return false;
      return true;
    }), [eventos, filtroTipo, filtroAccion, filtroUsuario]);

  const AccionBadge = ({ accion }: { accion: string }) => (
    <span style={{ display: 'inline-flex', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: ACCION_COLOR[accion] ?? '#f1f5f9', color: ACCION_TEXT[accion] ?? '#475569', letterSpacing: '0.03em' }}>
      {accion}
    </span>
  );

  if (loading) return <div className="loading-state">Cargando auditoría...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Auditoría</h2>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{filtered.length} eventos</span>
        </header>

        <div className="filter-bar">
          <div className="filter-item">
            <label>Entidad</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todas</option>
              {tiposUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>Acción</label>
            <select value={filtroAccion} onChange={(e) => setFiltroAccion(e.target.value)}>
              <option value="">Todas</option>
              {accionesUnicas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label>Usuario</label>
            <input value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} placeholder="Buscar..." />
          </div>
          <button className="btn-secondary" onClick={() => { setFiltroTipo(''); setFiltroAccion(''); setFiltroUsuario(''); }}>Limpiar</button>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="empty-state">Sin eventos registrados.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((ev, idx) => (
                <div
                  key={ev.id}
                  onClick={() => setSelected(ev)}
                  style={{
                    display: 'grid', gridTemplateColumns: '140px 100px 120px 1fr 160px',
                    gap: '0 1rem', padding: '0.75rem 1rem', cursor: 'pointer',
                    borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: selected?.id === ev.id ? '#f8fafc' : 'transparent',
                    transition: 'background 0.1s',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {new Date(ev.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <AccionBadge accion={ev.accion} />
                  <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>{ev.entidadTipo}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.entidadId}</span>
                  <span style={{ fontSize: '0.8125rem', color: '#334155', textAlign: 'right' }}>{ev.usuario?.nombre ?? ev.usuario?.email ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <AccionBadge accion={selected.accion} />
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>
              <div><strong>Entidad:</strong> {selected.entidadTipo}</div>
              <div style={{ wordBreak: 'break-all' }}><strong>ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{selected.entidadId}</span></div>
              <div><strong>Usuario:</strong> {selected.usuario?.nombre ?? selected.usuario?.email ?? '—'}</div>
              <div><strong>Fecha:</strong> {new Date(selected.createdAt).toLocaleString('es-AR')}</div>
            </div>
            {selected.datos && (
              <>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Datos</div>
                <pre style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.6875rem', color: '#334155', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(selected.datos, null, 2)}
                </pre>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
