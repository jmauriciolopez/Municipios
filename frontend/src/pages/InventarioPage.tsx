import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';

type ItemRow = { id: string; codigo: string; nombre: string; descripcion: string; cantidad: number; area: string; areaId: string };
type AreaOpt = { id: string; nombre: string };
const FORM_EMPTY = { codigo: '', nombre: '', descripcion: '', cantidad: 0, areaId: '' };

export default function InventarioPage() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [selected, setSelected] = useState<ItemRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);
  const [delta, setDelta] = useState('');
  const [ajustando, setAjustando] = useState(false);

  const cargar = () =>
    apiFetch<any[]>('/inventario')
      .then((data) => setItems(data.map((i) => ({ id: i.id, codigo: i.codigo, nombre: i.nombre, descripcion: i.descripcion ?? '—', cantidad: Number(i.cantidad), area: i.area?.nombre ?? '—', areaId: i.area?.id ?? '' }))))
      .catch(() => setError('No se pudo cargar el inventario.'))
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); apiFetch<any[]>('/areas').then((d) => setAreas(d.map((a) => ({ id: a.id, nombre: a.nombre })))).catch(() => {}); }, []);

  const filtered = useMemo(() => items.filter((i) => {
    if (filtroArea && i.areaId !== filtroArea) return false;
    if (busqueda && !i.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !i.codigo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  }), [items, filtroArea, busqueda]);

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre) { toast.error('Código y nombre son obligatorios.'); return; }
    setGuardando(true);
    try {
      const payload = { ...form, cantidad: Number(form.cantidad), areaId: form.areaId || undefined };
      if (modal === 'crear') await apiFetch('/inventario', { method: 'POST', body: JSON.stringify(payload) });
      else if (modal === 'editar' && selected) await apiFetch(`/inventario/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setModal(null); setLoading(true); cargar();
    } catch { toast.error('Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleAjustar = async (d: number) => {
    if (!selected) return;
    setAjustando(true);
    try {
      const updated = await apiFetch<any>(`/inventario/${selected.id}/ajustar`, { method: 'PATCH', body: JSON.stringify({ delta: d }) });
      const nueva = Number(updated.cantidad);
      setItems((prev) => prev.map((i) => i.id === selected.id ? { ...i, cantidad: nueva } : i));
      setSelected((s) => s ? { ...s, cantidad: nueva } : s);
      setDelta('');
    } catch { toast.error('Stock insuficiente o error al ajustar.'); }
    finally { setAjustando(false); }
  };

  const StockBadge = ({ n }: { n: number }) => (
    <span style={{ fontWeight: 700, color: n === 0 ? '#dc2626' : n < 5 ? '#d97706' : '#166534' }}>{n}</span>
  );

  const columns = [
    { key: 'codigo', label: 'Código', render: (i: ItemRow) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#475569' }}>{i.codigo}</span> },
    { key: 'nombre', label: 'Nombre', render: (i: ItemRow) => <span style={{ fontWeight: 600 }}>{i.nombre}</span> },
    { key: 'cantidad', label: 'Stock', render: (i: ItemRow) => <StockBadge n={i.cantidad} /> },
    { key: 'area', label: 'Área' },
    { key: 'descripcion', label: 'Descripción' },
  ];

  if (loading) return <div className="loading-state">Cargando inventario...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Inventario</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>+ Nuevo ítem</button>
        </header>
        <div className="filter-bar">
          <div className="filter-item"><label>Buscar</label><input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre o código..." /></div>
          <div className="filter-item"><label>Área</label>
            <select value={filtroArea} onChange={(e) => setFiltroArea(e.target.value)}>
              <option value="">Todas</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <button className="btn-secondary" onClick={() => { setBusqueda(''); setFiltroArea(''); }}>Limpiar</button>
        </div>
        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay ítems en el inventario" />
      </section>

      {selected && (
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>{selected.codigo}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: selected.cantidad === 0 ? '#dc2626' : selected.cantidad < 5 ? '#d97706' : '#166534' }}>{selected.cantidad}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>unidades en stock</div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Área:</strong> {selected.area}</div>
              {selected.descripcion !== '—' && <div><strong>Descripción:</strong> {selected.descripcion}</div>}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Ajustar stock</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input className="input-field" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="Ej: 10 o -5" style={{ flex: 1 }} />
                <button disabled={ajustando || !delta} onClick={() => handleAjustar(Number(delta))} style={{ flexShrink: 0 }}>OK</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setForm({ codigo: selected.codigo, nombre: selected.nombre, descripcion: selected.descripcion === '—' ? '' : selected.descripcion, cantidad: selected.cantidad, areaId: selected.areaId }); setModal('editar'); }}>Editar</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{modal === 'crear' ? 'Nuevo ítem' : 'Editar ítem'}</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group"><label>Código *</label><input className="input-field" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} /></div>
              <div className="form-group"><label>Nombre *</label><input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div className="form-group"><label>Cantidad inicial</label><input className="input-field" type="number" min={0} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} /></div>
              <div className="form-group"><label>Área</label>
                <select className="input-field" value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })}>
                  <option value="">Sin área</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label>Descripción</label><textarea className="input-field" rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ resize: 'vertical' }} /></div>
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
