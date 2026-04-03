import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import DataTable from '../components/ui/DataTable';

type PersonaRow = {
  id: string; nombre: string; dni: string; telefono: string;
  email: string; activo: boolean; usuario: string; cuadrillas: string[];
};
const FORM_EMPTY = { nombre: '', dni: '', telefono: '', email: '' };

export default function PersonasPage() {
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [soloActivos, setSoloActivos] = useState(true);
  const [selected, setSelected] = useState<PersonaRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const mapPersona = (p: any): PersonaRow => ({
    id: p.id, nombre: p.nombre, dni: p.dni ?? '—',
    telefono: p.telefono ?? '—', email: p.email ?? '—',
    activo: p.activo,
    usuario: p.usuario?.nombre ?? p.usuario?.email ?? '—',
    cuadrillas: p.cuadrillas?.map((c: any) => c.cuadrilla?.nombre).filter(Boolean) ?? [],
  });

  const cargar = () => {
    setLoading(true);
    apiFetch<any[]>(`/personas${soloActivos ? '?activo=true' : ''}`)
      .then((data) => setPersonas(data.map(mapPersona)))
      .catch(() => setError('No se pudieron cargar las personas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [soloActivos]);

  const filtered = useMemo(() =>
    personas.filter((p) =>
      !busqueda ||
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.dni.includes(busqueda) ||
      p.email.toLowerCase().includes(busqueda.toLowerCase())
    ), [personas, busqueda]);

  const handleGuardar = async () => {
    if (!form.nombre) { alert('El nombre es obligatorio.'); return; }
    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre,
        dni: form.dni || undefined,
        telefono: form.telefono || undefined,
        email: form.email || undefined,
      };
      if (modal === 'crear') await apiFetch('/personas', { method: 'POST', body: JSON.stringify(payload) });
      else if (modal === 'editar' && selected) await apiFetch(`/personas/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setModal(null);
      cargar();
    } catch { alert('Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleToggleActivo = async (id: string) => {
    try {
      const updated = await apiFetch<any>(`/personas/${id}/toggle-activo`, { method: 'PATCH' });
      const mapped = mapPersona(updated);
      setPersonas((prev) => prev.map((p) => p.id === id ? mapped : p));
      if (selected?.id === id) setSelected(mapped);
    } catch { alert('Error al cambiar estado.'); }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (p: PersonaRow) => <span style={{ fontWeight: 600 }}>{p.nombre}</span> },
    { key: 'dni', label: 'DNI' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'usuario', label: 'Usuario sistema' },
    {
      key: 'cuadrillas', label: 'Cuadrillas',
      render: (p: PersonaRow) => (
        <span style={{ fontSize: '0.8125rem', color: p.cuadrillas.length > 0 ? '#1d4ed8' : '#94a3b8' }}>
          {p.cuadrillas.length > 0 ? p.cuadrillas.join(', ') : '—'}
        </span>
      ),
    },
    {
      key: 'activo', label: 'Estado',
      render: (p: PersonaRow) => (
        <span style={{ display: 'inline-flex', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: p.activo ? '#dcfce7' : '#f1f5f9', color: p.activo ? '#166534' : '#94a3b8' }}>
          {p.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  if (loading) return <div className="loading-state">Cargando personas...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Personas</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>+ Nueva persona</button>
        </header>

        <div className="filter-bar">
          <div className="filter-item">
            <label>Buscar</label>
            <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, DNI o email..." />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#475569', cursor: 'pointer', alignSelf: 'flex-end', paddingBottom: '0.5rem' }}>
            <input type="checkbox" checked={soloActivos} onChange={(e) => setSoloActivos(e.target.checked)} style={{ accentColor: '#1d4ed8' }} />
            Solo activos
          </label>
          <button className="btn-secondary" style={{ alignSelf: 'flex-end' }} onClick={() => { setBusqueda(''); setSoloActivos(true); }}>Limpiar</button>
        </div>

        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay personas registradas" />
      </section>

      {selected && (
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: selected.activo ? '#1d4ed8' : '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {selected.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
              <div><strong>DNI:</strong> {selected.dni}</div>
              <div><strong>Teléfono:</strong> {selected.telefono}</div>
              <div><strong>Email:</strong> {selected.email}</div>
              <div><strong>Usuario sistema:</strong> {selected.usuario}</div>
            </div>

            {selected.cuadrillas.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>Cuadrillas activas</div>
                {selected.cuadrillas.map((c) => (
                  <span key={c} style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: '9999px', marginRight: '0.25rem', marginBottom: '0.25rem' }}>{c}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                setForm({ nombre: selected.nombre, dni: selected.dni === '—' ? '' : selected.dni, telefono: selected.telefono === '—' ? '' : selected.telefono, email: selected.email === '—' ? '' : selected.email });
                setModal('editar');
              }}>Editar</button>
              <button
                style={{ flex: 1, justifyContent: 'center', background: selected.activo ? '#f1f5f9' : '#dcfce7', color: selected.activo ? '#475569' : '#166534', border: `1px solid ${selected.activo ? '#e2e8f0' : '#bbf7d0'}` }}
                onClick={() => handleToggleActivo(selected.id)}
              >
                {selected.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{modal === 'crear' ? 'Nueva persona' : 'Editar persona'}</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Nombre *</label>
                <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>DNI</label>
                <input className="input-field" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} placeholder="12345678" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input className="input-field" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Email</label>
                <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
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
