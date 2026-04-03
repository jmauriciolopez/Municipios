import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenes, createOrden, asignarCuadrilla } from '@shared/services/ordenes.api';
import { getCuadrillas } from '@shared/services/cuadrillas.api';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';

type OrdenRow = {
  id: string; codigo: string; estado: string; prioridad: string;
  area: string; areaId: string; cuadrilla: string; cuadrillaId: string;
  fechaAsignacion: string; fechaCierre: string; descripcion: string;
};
type CuadrillaOpt = { id: string; nombre: string };
type AreaOpt = { id: string; nombre: string };

const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];
const ESTADOS_OT = ['detectado', 'asignado', 'en_proceso', 'resuelto', 'verificado', 'cancelado'];
const FORM_EMPTY = { codigo: '', area_id: '', cuadrilla_id: '', prioridad: 'media', descripcion: '', fecha_asignacion: '' };

export default function OrdenesPage() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<OrdenRow[]>([]);
  const [cuadrillas, setCuadrillas] = useState<CuadrillaOpt[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [area, setArea] = useState('');
  const [cuadrilla, setCuadrilla] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [selected, setSelected] = useState<OrdenRow | null>(null);
  const [asignando, setAsignando] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    getOrdenes()
      .then((data: any[]) =>
        setOrdenes(data.map((o) => ({
          id: o.id, codigo: o.codigo, estado: o.estado, prioridad: o.prioridad,
          area: o.area?.nombre ?? '', areaId: o.area?.id ?? '',
          cuadrilla: o.cuadrilla?.nombre ?? 'Sin asignar', cuadrillaId: o.cuadrilla?.id ?? '',
          fechaAsignacion: (o.fechaAsignacion ?? '').slice(0, 10),
          fechaCierre: o.fechaCierre ? o.fechaCierre.slice(0, 10) : 'Pendiente',
          descripcion: o.descripcion ?? '',
        })))
      )
      .catch(() => setError('No se pudieron cargar las órdenes.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    getCuadrillas().then((d: any[]) => setCuadrillas(d.map((c) => ({ id: c.id, nombre: c.nombre })))).catch(() => {});
    apiFetch<any[]>('/areas').then((d) => setAreas(d.map((a) => ({ id: a.id, nombre: a.nombre })))).catch(() => {});
  }, []);

  const areasUnicas = useMemo(
    () => [...new Map(ordenes.filter((o) => o.area).map((o) => [o.areaId, o.area])).entries()],
    [ordenes]
  );

  const filtered = useMemo(
    () => ordenes.filter((o) => {
      if (estado && o.estado !== estado) return false;
      if (prioridad && o.prioridad !== prioridad) return false;
      if (area && o.areaId !== area) return false;
      if (cuadrilla && o.cuadrillaId !== cuadrilla) return false;
      if (desde && o.fechaAsignacion && o.fechaAsignacion < desde) return false;
      if (hasta && o.fechaAsignacion && o.fechaAsignacion > hasta) return false;
      return true;
    }),
    [ordenes, estado, prioridad, area, cuadrilla, desde, hasta]
  );

  const handleAsignarCuadrilla = async (ordenId: string, cuadrillaId: string) => {
    setAsignando(ordenId);
    try {
      await asignarCuadrilla(ordenId, cuadrillaId);
      const nombre = cuadrillas.find((c) => c.id === cuadrillaId)?.nombre ?? '';
      setOrdenes((prev) => prev.map((o) =>
        o.id === ordenId ? { ...o, cuadrillaId, cuadrilla: nombre, estado: 'asignado' } : o
      ));
      if (selected?.id === ordenId) setSelected((s) => s ? { ...s, cuadrillaId, cuadrilla: nombre, estado: 'asignado' } : s);
    } catch { toast.error('Error al asignar la cuadrilla.'); }
    finally { setAsignando(null); }
  };

  const handleCrear = async () => {
    if (!form.codigo) { toast.error('El código es obligatorio.'); return; }
    setGuardando(true);
    try {
      await createOrden({
        codigo: form.codigo,
        area_id: form.area_id || undefined,
        cuadrilla_id: form.cuadrilla_id || undefined,
        prioridad: form.prioridad as any,
        descripcion: form.descripcion || undefined,
        fecha_asignacion: form.fecha_asignacion || undefined,
      } as any);
      setModal(false);
      setForm(FORM_EMPTY);
      setLoading(true);
      cargar();
    } catch { toast.error('Error al crear la orden.'); }
    finally { setGuardando(false); }
  };

  const columns = [
    { key: 'codigo', label: 'Código', render: (o: OrdenRow) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 600 }}>{o.codigo}</span> },
    { key: 'estado', label: 'Estado', render: (o: OrdenRow) => <StatusBadge status={o.estado} /> },
    { key: 'prioridad', label: 'Prioridad', render: (o: OrdenRow) => <StatusBadge status={o.prioridad} /> },
    { key: 'area', label: 'Área' },
    {
      key: 'cuadrilla', label: 'Cuadrilla',
      render: (o: OrdenRow) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: o.cuadrillaId ? '#334155' : '#94a3b8' }}>{o.cuadrilla}</span>
          {['detectado', 'asignado'].includes(o.estado) && (
            <select
              value={o.cuadrillaId} disabled={asignando === o.id}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => e.target.value && handleAsignarCuadrilla(o.id, e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#f8fafc', cursor: 'pointer' }}
            >
              <option value="">Asignar...</option>
              {cuadrillas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          )}
        </div>
      ),
    },
    { key: 'fechaAsignacion', label: 'Asignación' },
    { key: 'fechaCierre', label: 'Cierre' },
  ];

  if (loading) return <div className="loading-state">Cargando órdenes...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Órdenes de trabajo</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>+ Nueva orden</button>
        </header>

        <FilterBar
          filters={[
            { key: 'estado', label: 'Estado', value: estado, type: 'select', options: ESTADOS_OT.map((e) => ({ value: e, label: e.replace(/_/g, ' ') })) },
            { key: 'prioridad', label: 'Prioridad', value: prioridad, type: 'select', options: PRIORIDADES.map((p) => ({ value: p, label: p })) },
            { key: 'area', label: 'Área', value: area, type: 'select', options: areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre })) },
            { key: 'cuadrilla', label: 'Cuadrilla', value: cuadrilla, type: 'select', options: cuadrillas.map((c) => ({ value: c.id, label: c.nombre })) },
            { key: 'desde', label: 'Desde', value: desde, type: 'text' },
            { key: 'hasta', label: 'Hasta', value: hasta, type: 'text' },
          ]}
          onChange={(key, value) => {
            const v = String(value);
            if (key === 'estado') setEstado(v);
            if (key === 'prioridad') setPrioridad(v);
            if (key === 'area') setArea(v);
            if (key === 'cuadrilla') setCuadrilla(v);
            if (key === 'desde') setDesde(v);
            if (key === 'hasta') setHasta(v);
          }}
          onReset={() => { setEstado(''); setPrioridad(''); setArea(''); setCuadrilla(''); setDesde(''); setHasta(''); }}
        />

        <DataTable
          data={filtered} columns={columns}
          onRowClick={(o) => { setSelected(o); }}
          emptyMessage="No se encontraron órdenes"
        />
      </section>

      {selected && (
        <div style={{ width: '290px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.codigo}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>{selected.area || 'Sin área'}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <StatusBadge status={selected.estado} />
              <StatusBadge status={selected.prioridad} />
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1.25rem' }}>
              <div><strong>Cuadrilla:</strong> {selected.cuadrilla}</div>
              <div><strong>Asignación:</strong> {selected.fechaAsignacion || 'N/A'}</div>
              <div><strong>Cierre:</strong> {selected.fechaCierre}</div>
              {selected.descripcion && <div><strong>Descripción:</strong> {selected.descripcion}</div>}
            </div>

            {['detectado', 'asignado'].includes(selected.estado) && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.375rem' }}>Asignar cuadrilla</div>
                <select
                  value={selected.cuadrillaId}
                  disabled={asignando === selected.id}
                  onChange={(e) => e.target.value && handleAsignarCuadrilla(selected.id, e.target.value)}
                  style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#f8fafc' }}
                >
                  <option value="">Seleccionar...</option>
                  {cuadrillas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            )}

            <button
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate(`/ordenes/${selected.id}`)}
            >
              Ver detalle completo →
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div style={overlay}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Nueva orden de trabajo</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label>Código *</label>
                <input className="input-field" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="OT-001" />
              </div>
              <div className="form-group">
                <label>Prioridad</label>
                <select className="input-field" value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })}>
                  {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Área</label>
                <select className="input-field" value={form.area_id} onChange={(e) => setForm({ ...form, area_id: e.target.value })}>
                  <option value="">Sin área</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Cuadrilla</label>
                <select className="input-field" value={form.cuadrilla_id} onChange={(e) => setForm({ ...form, cuadrilla_id: e.target.value })}>
                  <option value="">Sin asignar</option>
                  {cuadrillas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha asignación</label>
                <input className="input-field" type="date" value={form.fecha_asignacion} onChange={(e) => setForm({ ...form, fecha_asignacion: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Descripción</label>
                <textarea className="input-field" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ resize: 'vertical' }} placeholder="Descripción del trabajo a realizar..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button onClick={handleCrear} disabled={guardando}>{guardando ? 'Guardando...' : 'Crear orden'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
const modalBox: React.CSSProperties = { background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '580px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' };
