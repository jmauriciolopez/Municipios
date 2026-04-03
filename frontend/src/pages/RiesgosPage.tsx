import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import DataTable from '../components/ui/DataTable';

type RiesgoRow = { id: string; nombre: string; descripcion: string; nivel: number; area: string; areaId: string; incidentes: number };
type AreaOpt = { id: string; nombre: string };
const FORM_EMPTY = { nombre: '', descripcion: '', nivel: 3, areaId: '' };

const NIVEL_COLOR = ['', '#dcfce7', '#fef9c3', '#fef3c7', '#fed7aa', '#fecaca'];
const NIVEL_TEXT  = ['', '#166534', '#713f12', '#92400e', '#7c2d12', '#7f1d1d'];
const NIVEL_LABEL = ['', 'Muy bajo', 'Bajo', 'Medio', 'Alto', 'Crítico'];

export default function RiesgosPage() {
  const [riesgos, setRiesgos] = useState<RiesgoRow[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [selected, setSelected] = useState<RiesgoRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    apiFetch<any[]>('/riesgos')
      .then((data) => setRiesgos(data.map((r) => ({ id: r.id, nombre: r.nombre, descripcion: r.descripcion ?? '—', nivel: r.nivel, area: r.area?.nombre ?? '—', areaId: r.area?.id ?? '', incidentes: r._count?.incidentes ?? 0 }))))
      .catch(() => setError('No se pudieron cargar los riesgos.'))
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); apiFetch<any[]>('/areas').then((d) => setAreas(d.map((a) => ({ id: a.id, nombre: a.nombre })))).catch(() => {}); }, []);

  const filtered = useMemo(() => riesgos.filter((r) => {
    if (filtroArea && r.areaId !== filtroArea) return false;
    if (filtroNivel && r.nivel !== Number(filtroNivel)) return false;
    return true;
  }), [riesgos, filtroArea, filtroNivel]);

  const NivelBadge = ({ nivel }: { nivel: number }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: NIVEL_COLOR[nivel], color: NIVEL_TEXT[nivel] }}>
      {'●'.repeat(nivel)}{'○'.repeat(5 - nivel)} {NIVEL_LABEL[nivel]}
    </span>
  );

  const handleGuardar = async () => {
    if (!form.nombre) { alert('El nombre es obligatorio.'); return; }
    setGuardando(true);
    try {
      const payload = { nombre: form.nombre, descripcion: form.descripcion || undefined, nivel: Number(form.nivel), areaId: form.areaId || undefined };
      if (modal === 'crear') await apiFetch('/riesgos', { method: 'POST', body: JSON.stringify(payload) });
      else if (modal === 'editar' && selected) await apiFetch(`/riesgos/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setModal(null); setLoading(true); cargar();
    } catch { alert('Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este riesgo?')) return;
    try { await apiFetch(`/riesgos/${id}`, { method: 'DELETE' }); setSelected(null); setRiesgos((p) => p.filter((r) => r.id !== id)); }
    catch { alert('Error al eliminar.'); }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (r: RiesgoRow) => <span style={{ fontWeight: 600 }}>{r.nombre}</span> },
    { key: 'nivel', label: 'Nivel', render: (r: RiesgoRow) => <NivelBadge nivel={r.nivel} /> },
    { key: 'area', label: 'Área' },
    { key: 'incidentes', label: 'Incidentes', render: (r: RiesgoRow) => <span style={{ fontWeight: 600, color: r.incidentes > 0 ? '#dc2626' : '#94a3b8' }}>{r.incidentes}</span> },
  ];

  if (loading) return <div className="loading-state">Cargando riesgos...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Riesgos</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>+ Nuevo riesgo</button>
        </header>
        <div className="filter-bar">
          <div className="filter-item"><label>Área</label>
            <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
              <option value="">Todas</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div className="filter-item"><label>Nivel</label>
            <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}>
              <option value="">Todos</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} — {NIVEL_LABEL[n]}</option>)}
            </select>
          </div>
          <button className="btn-secondary" onClick={() => { setFiltroArea(''); setFiltroNivel(''); }}>Limpiar</button>
        </div>
        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay riesgos registrados" />
      </section>

      {selected && (
        <div style={{ width: '270px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ marginBottom: '1rem' }}><NivelBadge nivel={selected.nivel} /></div>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Área:</strong> {selected.area}</div>
              <div><strong>Incidentes:</strong> {selected.incidentes}</div>
              {selected.descripcion !== '—' && <div><strong>Descripción:</strong> {selected.descripcion}</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setForm({ nombre: selected.nombre, descripcion: selected.descripcion === '—' ? '' : selected.descripcion, nivel: selected.nivel, areaId: selected.areaId }); setModal('editar'); }}>Editar</button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleEliminar(selected.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{modal === 'crear' ? 'Nuevo riesgo' : 'Editar riesgo'}</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Nombre *</label><input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div className="form-group"><label>Nivel (1-5) *</label><input className="input-field" type="number" min={1} max={5} value={form.nivel} onChange={(e) => setForm({ ...form, nivel: Number(e.target.value) })} /></div>
              <div className="form-group"><label>Área</label>
                <select className="input-field" value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })}>
                  <option value="">Sin área</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Descripción</label><textarea className="input-field" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ resize: 'vertical' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
