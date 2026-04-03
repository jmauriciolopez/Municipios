import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';

type TipoRow = { id: string; nombre: string; descripcion: string; activos: number };
const FORM_EMPTY = { nombre: '', descripcion: '' };

export default function TiposActivoPage() {
  const [tipos, setTipos] = useState<TipoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [selected, setSelected] = useState<TipoRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    apiFetch<any[]>('/tipos-activo')
      .then((data) => setTipos(data.map((t) => ({ id: t.id, nombre: t.nombre, descripcion: t.descripcion ?? '—', activos: t._count?.activos ?? 0 }))))
      .catch(() => setError('No se pudieron cargar los tipos.'))
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); }, []);

  const filtered = useMemo(() =>
    tipos.filter((t) => !busqueda || t.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [tipos, busqueda]);

  const handleGuardar = async () => {
    if (!form.nombre) { toast.error('El nombre es obligatorio.'); return; }
    setGuardando(true);
    try {
      if (modal === 'crear') await apiFetch('/tipos-activo', { method: 'POST', body: JSON.stringify(form) });
      else if (modal === 'editar' && selected) await apiFetch(`/tipos-activo/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setModal(null);
      setLoading(true);
      cargar();
    } catch { toast.error('Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ message: '¿Eliminar este tipo de activo?', confirmLabel: 'Eliminar', danger: true })) return;
    try {
      await apiFetch(`/tipos-activo/${id}`, { method: 'DELETE' });
      setSelected(null);
      setTipos((prev) => prev.filter((t) => t.id !== id));
    } catch { toast.error('No se puede eliminar si tiene activos asociados.'); }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (t: TipoRow) => <span style={{ fontWeight: 600 }}>{t.nombre}</span> },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'activos', label: 'Activos', render: (t: TipoRow) => <span style={{ fontWeight: 600, color: t.activos > 0 ? '#1d4ed8' : '#94a3b8' }}>{t.activos}</span> },
  ];

  if (loading) return <div className="loading-state">Cargando tipos de activo...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Tipos de activo</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>+ Nuevo tipo</button>
        </header>

        <div className="filter-bar">
          <div className="filter-item">
            <label>Buscar</label>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre..." />
          </div>
          <button className="btn-secondary" onClick={() => setBusqueda('')}>Limpiar</button>
        </div>

        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay tipos de activo" />
      </section>

      {selected && (
        <div style={{ width: '260px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>{selected.activos} activos asociados</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            {selected.descripcion !== '—' && <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>{selected.descripcion}</p>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setForm({ nombre: selected.nombre, descripcion: selected.descripcion === '—' ? '' : selected.descripcion }); setModal('editar'); }}>Editar</button>
              <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleEliminar(selected.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{modal === 'crear' ? 'Nuevo tipo de activo' : 'Editar tipo'}</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group"><label>Nombre *</label><input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="form-group"><label>Descripción</label><textarea className="input-field" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ resize: 'vertical' }} /></div>
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
