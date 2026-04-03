import { useEffect, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import DataTable from '../components/ui/DataTable';

type MunicipioRow = { id: string; nombre: string; codigo: string; areas: number; usuarios: number; activos: number };
const FORM_EMPTY = { nombre: '', codigo: '' };

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<MunicipioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MunicipioRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    apiFetch<any[]>('/municipios')
      .then((data) => setMunicipios(data.map((m) => ({ id: m.id, nombre: m.nombre, codigo: m.codigo, areas: m._count?.areas ?? 0, usuarios: m._count?.usuarios ?? 0, activos: m._count?.activos ?? 0 }))))
      .catch(() => setError('No se pudieron cargar los municipios.'))
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); }, []);

  const handleGuardar = async () => {
    if (!form.nombre || !form.codigo) { alert('Nombre y código son obligatorios.'); return; }
    setGuardando(true);
    try {
      if (modal === 'crear') await apiFetch('/municipios', { method: 'POST', body: JSON.stringify(form) });
      else if (modal === 'editar' && selected) await apiFetch(`/municipios/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setModal(null); setLoading(true); cargar();
    } catch { alert('Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (m: MunicipioRow) => <span style={{ fontWeight: 600 }}>{m.nombre}</span> },
    { key: 'codigo', label: 'Código', render: (m: MunicipioRow) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#475569' }}>{m.codigo}</span> },
    { key: 'areas', label: 'Áreas', render: (m: MunicipioRow) => <span style={{ fontWeight: 600, color: '#1d4ed8' }}>{m.areas}</span> },
    { key: 'usuarios', label: 'Usuarios', render: (m: MunicipioRow) => <span style={{ fontWeight: 600, color: '#0369a1' }}>{m.usuarios}</span> },
    { key: 'activos', label: 'Activos', render: (m: MunicipioRow) => <span style={{ fontWeight: 600, color: '#d97706' }}>{m.activos}</span> },
  ];

  if (loading) return <div className="loading-state">Cargando municipios...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Municipios</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>+ Nuevo municipio</button>
        </header>
        <DataTable data={municipios} columns={columns} onRowClick={setSelected} emptyMessage="No hay municipios registrados" />
      </section>

      {selected && (
        <div style={{ width: '260px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>{selected.codigo}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[{ label: 'Áreas', n: selected.areas, color: '#1d4ed8' }, { label: 'Usuarios', n: selected.usuarios, color: '#0369a1' }, { label: 'Activos', n: selected.activos, color: '#d97706' }].map(({ label, n, color }) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.625rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{n}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setForm({ nombre: selected.nombre, codigo: selected.codigo }); setModal('editar'); }}>Editar</button>
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{modal === 'crear' ? 'Nuevo municipio' : 'Editar municipio'}</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group"><label>Nombre *</label><input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="form-group"><label>Código *</label><input className="input-field" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="MUNICIPIO_001" /></div>
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
