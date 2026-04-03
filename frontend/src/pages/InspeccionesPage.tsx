import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';

type InspeccionRow = { id: string; incidente: string; incidenteId: string; activo: string; inspector: string; area: string; areaId: string; resultado: string; fecha: string; observaciones: string };
type Opt = { id: string; nombre: string };
const FORM_EMPTY = { incidenteId: '', activoId: '', inspectorId: '', areaId: '', resultado: '', observaciones: '', fechaInspeccion: '' };

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<InspeccionRow[]>([]);
  const [areas, setAreas] = useState<Opt[]>([]);
  const [usuarios, setUsuarios] = useState<Opt[]>([]);
  const [incidentes, setIncidentes] = useState<Opt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [selected, setSelected] = useState<InspeccionRow | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    apiFetch<any[]>('/inspecciones')
      .then((data) => setInspecciones(data.map((i) => ({
        id: i.id, incidente: i.incidente?.tipo ?? '—', incidenteId: i.incidenteId,
        activo: i.activo?.nombre ?? '—', inspector: i.inspector?.nombre ?? i.inspector?.email ?? '—',
        area: i.area?.nombre ?? '—', areaId: i.area?.id ?? '',
        resultado: i.resultado ?? '—', observaciones: i.observaciones ?? '',
        fecha: i.fechaInspeccion?.slice(0, 10) ?? '',
      }))))
      .catch(() => setError('No se pudieron cargar las inspecciones.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    Promise.all([
      apiFetch<any[]>('/areas').catch(() => []),
      apiFetch<any[]>('/usuarios').catch(() => []),
      apiFetch<any[]>('/incidentes').catch(() => []),
    ]).then(([a, u, inc]) => {
      setAreas(a.map((x) => ({ id: x.id, nombre: x.nombre })));
      setUsuarios(u.map((x) => ({ id: x.id, nombre: x.nombre ?? x.email })));
      setIncidentes(inc.map((x) => ({ id: x.id, nombre: `${x.tipo} — ${x.direccion ?? x.id.slice(0, 8)}` })));
    });
  }, []);

  const filtered = useMemo(() => inspecciones.filter((i) => !filtroArea || i.areaId === filtroArea), [inspecciones, filtroArea]);

  const handleGuardar = async () => {
    if (!form.incidenteId) { toast.error('El incidente es obligatorio.'); return; }
    setGuardando(true);
    try {
      await apiFetch('/inspecciones', { method: 'POST', body: JSON.stringify({ ...form, activoId: form.activoId || undefined, inspectorId: form.inspectorId || undefined, areaId: form.areaId || undefined, fechaInspeccion: form.fechaInspeccion || undefined }) });
      setModal(false); setLoading(true); cargar();
    } catch { toast.error('Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const columns = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'incidente', label: 'Incidente', render: (i: InspeccionRow) => <span style={{ fontWeight: 600 }}>{i.incidente}</span> },
    { key: 'activo', label: 'Activo' },
    { key: 'inspector', label: 'Inspector' },
    { key: 'area', label: 'Área' },
    { key: 'resultado', label: 'Resultado' },
  ];

  if (loading) return <div className="loading-state">Cargando inspecciones...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Inspecciones</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>+ Nueva inspección</button>
        </header>
        <div className="filter-bar">
          <div className="filter-item"><label>Área</label>
            <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
              <option value="">Todas</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <button className="btn-secondary" onClick={() => setFiltroArea('')}>Limpiar</button>
        </div>
        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay inspecciones registradas" />
      </section>

      {selected && (
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{selected.incidente}</div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div><strong>Fecha:</strong> {selected.fecha}</div>
              <div><strong>Inspector:</strong> {selected.inspector}</div>
              <div><strong>Activo:</strong> {selected.activo}</div>
              <div><strong>Área:</strong> {selected.area}</div>
              <div><strong>Resultado:</strong> {selected.resultado}</div>
              {selected.observaciones && <div><strong>Observaciones:</strong> {selected.observaciones}</div>}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '540px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Nueva inspección</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Incidente *</label>
                <select className="input-field" value={form.incidenteId} onChange={(e) => setForm({ ...form, incidenteId: e.target.value })}>
                  <option value="">Seleccionar...</option>{incidentes.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Inspector</label>
                <select className="input-field" value={form.inspectorId} onChange={(e) => setForm({ ...form, inspectorId: e.target.value })}>
                  <option value="">Sin asignar</option>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Área</label>
                <select className="input-field" value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })}>
                  <option value="">Sin área</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Resultado</label><input className="input-field" value={form.resultado} onChange={(e) => setForm({ ...form, resultado: e.target.value })} placeholder="Conforme / No conforme..." /></div>
              <div className="form-group"><label>Fecha</label><input className="input-field" type="date" value={form.fechaInspeccion} onChange={(e) => setForm({ ...form, fechaInspeccion: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Observaciones</label><textarea className="input-field" rows={3} value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} style={{ resize: 'vertical' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Crear inspección'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
