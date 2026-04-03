import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';

type AreaRow = {
  id: string; nombre: string; descripcion: string; municipio: string; municipioId: string;
  activos: number; cuadrillas: number; incidentes: number; ordenes: number;
};

type FormArea = { nombre: string; descripcion: string; municipioId: string };
const FORM_EMPTY: FormArea = { nombre: '', descripcion: '', municipioId: '' };

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [selected, setSelected] = useState<AreaRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState<FormArea>(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    apiFetch<any[]>('/areas')
      .then((data) => setAreas(data.map((a) => ({
        id: a.id, nombre: a.nombre, descripcion: a.descripcion ?? '—',
        municipio: a.municipio?.nombre ?? '—', municipioId: a.municipio?.id ?? '',
        activos: a.activos?.length ?? 0, cuadrillas: a.cuadrillas?.length ?? 0,
        incidentes: a.incidentes?.length ?? 0, ordenes: a.ordenes?.length ?? 0,
      }))))
      .catch(() => setError('No se pudieron cargar las áreas.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    apiFetch<any[]>('/municipios').then(setMunicipios).catch(() => {});
  }, []);

  const filtered = useMemo(
    () => areas.filter((a) => !busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [areas, busqueda]
  );

  const abrirCrear = () => { setForm(FORM_EMPTY); setModal('crear'); };
  const abrirEditar = (a: AreaRow) => {
    setForm({ nombre: a.nombre, descripcion: a.descripcion === '—' ? '' : a.descripcion, municipioId: a.municipioId });
    setModal('editar');
  };

  const handleGuardar = async () => {
    if (!form.nombre) { toast.error('El nombre es obligatorio.'); return; }
    setGuardando(true);
    try {
      if (modal === 'crear') {
        await apiFetch('/areas', { method: 'POST', body: JSON.stringify(form) });
      } else if (modal === 'editar' && selected) {
        await apiFetch(`/areas/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      }
      setModal(null);
      setLoading(true);
      cargar();
    } catch { toast.error('Error al guardar el área.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ message: '¿Eliminar esta área?', confirmLabel: 'Eliminar', danger: true })) return;
    try {
      await apiFetch(`/areas/${id}`, { method: 'DELETE' });
      setSelected(null);
      setAreas((prev) => prev.filter((a) => a.id !== id));
    } catch { toast.error('Error al eliminar el área.'); }
  };

  const Contador = ({ n, color }: { n: number; color: string }) => (
    <span style={{ fontWeight: 600, color: n > 0 ? color : '#94a3b8' }}>{n}</span>
  );

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (a: AreaRow) => <span style={{ fontWeight: 600, color: '#0f172a' }}>{a.nombre}</span> },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'municipio', label: 'Municipio' },
    { key: 'activos', label: 'Activos', render: (a: AreaRow) => <Contador n={a.activos} color="#1d4ed8" /> },
    { key: 'cuadrillas', label: 'Cuadrillas', render: (a: AreaRow) => <Contador n={a.cuadrillas} color="#0369a1" /> },
    { key: 'incidentes', label: 'Incidentes', render: (a: AreaRow) => <Contador n={a.incidentes} color="#dc2626" /> },
    { key: 'ordenes', label: 'Órdenes', render: (a: AreaRow) => <Contador n={a.ordenes} color="#d97706" /> },
  ];

  if (loading) return <div className="loading-state">Cargando áreas...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Áreas</h2>
          <button onClick={abrirCrear}>+ Nueva área</button>
        </header>

        <FilterBar
          filters={[{ key: 'busqueda', label: 'Buscar', value: busqueda, type: 'text' }]}
          onChange={(_, v) => setBusqueda(String(v))}
          onReset={() => setBusqueda('')}
        />

        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay áreas disponibles" />
      </section>

      {selected && (
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>{selected.municipio}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>

            {selected.descripcion !== '—' && (
              <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>{selected.descripcion}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { label: 'Activos', n: selected.activos, color: '#1d4ed8' },
                { label: 'Cuadrillas', n: selected.cuadrillas, color: '#0369a1' },
                { label: 'Incidentes', n: selected.incidentes, color: '#dc2626' },
                { label: 'Órdenes', n: selected.ordenes, color: '#d97706' },
              ].map(({ label, n, color }) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: n > 0 ? color : '#cbd5e1' }}>{n}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => abrirEditar(selected)}>Editar</button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleEliminar(selected.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={overlay}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{modal === 'crear' ? 'Nueva área' : 'Editar área'}</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Higiene Urbana" />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea className="input-field" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            {municipios.length > 0 && (
              <div className="form-group">
                <label>Municipio</label>
                <select className="input-field" value={form.municipioId} onChange={(e) => setForm({ ...form, municipioId: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {municipios.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
const modalBox: React.CSSProperties = { background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
