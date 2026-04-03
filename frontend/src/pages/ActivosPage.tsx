import { useEffect, useMemo, useState } from 'react';
import { getActivos, createActivo, updateActivo } from '@shared/services/activos.api';
import { apiFetch } from '../services/apiFetch';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';

type ActivoRow = {
  id: string; codigo: string; nombre: string; estado: string;
  tipo: string; tipoId: string; area: string; areaId: string;
  direccion: string; lat: string; lng: string;
};

type FormActivo = {
  codigo: string; nombre: string; tipoActivoId: string; areaResponsableId: string;
  estado: string; lat: string; lng: string; direccion: string;
};

const FORM_EMPTY: FormActivo = { codigo: '', nombre: '', tipoActivoId: '', areaResponsableId: '', estado: 'operativo', lat: '', lng: '', direccion: '' };
const ESTADOS_ACTIVO = ['operativo', 'en_mantenimiento', 'fuera_servicio', 'dado_de_baja'];

export default function ActivosPage() {
  const [activos, setActivos] = useState<ActivoRow[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [area, setArea] = useState('');
  const [selected, setSelected] = useState<ActivoRow | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormActivo>(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);
  const [cambiando, setCambiando] = useState<string | null>(null);

  const cargar = () =>
    getActivos()
      .then((data: any[]) => setActivos(data.map((a) => ({
        id: a.id, codigo: a.codigo, nombre: a.nombre, estado: a.estado,
        tipo: a.tipoActivo?.nombre ?? '', tipoId: a.tipoActivo?.id ?? a.tipoActivoId ?? '',
        area: a.areaResponsable?.nombre ?? '', areaId: a.areaResponsable?.id ?? a.areaResponsableId ?? '',
        direccion: a.direccion ?? 'N/A',
        lat: a.lat?.toString() ?? '', lng: a.lng?.toString() ?? '',
      }))))
      .catch(() => setError('No se pudieron cargar los activos.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    Promise.all([
      apiFetch<any[]>('/areas').catch(() => []),
      apiFetch<any[]>('/tipos-activo').catch(() => []),
    ]).then(([a, t]) => { setAreas(a ?? []); setTipos(t ?? []); });
  }, []);

  const tiposUnicos = useMemo(() => [...new Map(activos.filter((a) => a.tipo).map((a) => [a.tipoId, a.tipo])).entries()], [activos]);
  const areasUnicas = useMemo(() => [...new Map(activos.filter((a) => a.area).map((a) => [a.areaId, a.area])).entries()], [activos]);

  const filtered = useMemo(
    () => activos.filter((a) => {
      if (estado && a.estado !== estado) return false;
      if (tipo && a.tipoId !== tipo) return false;
      if (area && a.areaId !== area) return false;
      return true;
    }),
    [activos, estado, tipo, area]
  );

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    setCambiando(id);
    try {
      await updateActivo(id, { estado: nuevoEstado as any });
      setActivos((prev) => prev.map((a) => a.id === id ? { ...a, estado: nuevoEstado } : a));
      if (selected?.id === id) setSelected((s) => s ? { ...s, estado: nuevoEstado } : s);
    } catch { alert('Error al cambiar el estado.'); }
    finally { setCambiando(null); }
  };

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre || !form.tipoActivoId) { alert('Código, nombre y tipo son obligatorios.'); return; }
    setGuardando(true);
    try {
      await createActivo({
        codigo: form.codigo, nombre: form.nombre,
        tipoActivoId: form.tipoActivoId,
        areaResponsableId: form.areaResponsableId || undefined,
        estado: form.estado as any,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        direccion: form.direccion || undefined,
      } as any);
      setModal(false);
      setForm(FORM_EMPTY);
      setLoading(true);
      cargar();
    } catch { alert('Error al crear el activo.'); }
    finally { setGuardando(false); }
  };

  const columns = [
    { key: 'codigo', label: 'Código', render: (a: ActivoRow) => <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#475569' }}>{a.codigo}</span> },
    { key: 'nombre', label: 'Nombre', render: (a: ActivoRow) => <span style={{ fontWeight: 600 }}>{a.nombre}</span> },
    {
      key: 'estado', label: 'Estado',
      render: (a: ActivoRow) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge status={a.estado} />
          <select
            value={a.estado} disabled={cambiando === a.id}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleCambiarEstado(a.id, e.target.value)}
            style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#f8fafc', cursor: 'pointer' }}
          >
            {ESTADOS_ACTIVO.map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      ),
    },
    { key: 'tipo', label: 'Tipo' },
    { key: 'area', label: 'Área' },
    { key: 'direccion', label: 'Dirección' },
  ];

  if (loading) return <div className="loading-state">Cargando activos...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Activos</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>+ Nuevo activo</button>
        </header>

        <FilterBar
          filters={[
            { key: 'estado', label: 'Estado', value: estado, type: 'select', options: ESTADOS_ACTIVO.map((e) => ({ value: e, label: e.replace(/_/g, ' ') })) },
            { key: 'tipo', label: 'Tipo', value: tipo, type: 'select', options: tiposUnicos.map(([id, nombre]) => ({ value: id, label: nombre })) },
            { key: 'area', label: 'Área', value: area, type: 'select', options: areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre })) },
          ]}
          onChange={(key, value) => {
            if (key === 'estado') setEstado(String(value));
            if (key === 'tipo') setTipo(String(value));
            if (key === 'area') setArea(String(value));
          }}
          onReset={() => { setEstado(''); setTipo(''); setArea(''); }}
        />

        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay activos disponibles" />
      </section>

      {selected && (
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>{selected.codigo}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', marginTop: '0.125rem' }}>{selected.nombre}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}><StatusBadge status={selected.estado} /></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569', marginBottom: '1.25rem' }}>
              <div><strong>Tipo:</strong> {selected.tipo || 'N/A'}</div>
              <div><strong>Área:</strong> {selected.area || 'N/A'}</div>
              <div><strong>Dirección:</strong> {selected.direccion}</div>
              {selected.lat && selected.lng && (
                <div><strong>Ubicación:</strong> {selected.lat}, {selected.lng}</div>
              )}
            </div>

            {selected.lat && selected.lng && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}&zoom=17`}
                target="_blank" rel="noreferrer"
                style={{ display: 'block', textAlign: 'center', fontSize: '0.8125rem', color: '#1d4ed8', textDecoration: 'none', padding: '0.5rem', background: '#eff6ff', borderRadius: '0.5rem', marginBottom: '0.75rem' }}
              >
                🗺 Ver en mapa
              </a>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ESTADOS_ACTIVO.filter((e) => e !== selected.estado).map((e) => (
                <button
                  key={e}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', fontSize: '0.6875rem', padding: '0.375rem 0.25rem' }}
                  disabled={cambiando === selected.id}
                  onClick={() => handleCambiarEstado(selected.id, e)}
                >
                  {e.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div style={overlay}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Nuevo activo</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label>Código *</label>
                <input className="input-field" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="ACT-001" />
              </div>
              <div className="form-group">
                <label>Nombre *</label>
                <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Luminaria calle X" />
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select className="input-field" value={form.tipoActivoId} onChange={(e) => setForm({ ...form, tipoActivoId: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {tipos.length > 0
                    ? tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)
                    : tiposUnicos.map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)
                  }
                </select>
              </div>
              <div className="form-group">
                <label>Área responsable</label>
                <select className="input-field" value={form.areaResponsableId} onChange={(e) => setForm({ ...form, areaResponsableId: e.target.value })}>
                  <option value="">Sin área</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select className="input-field" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {ESTADOS_ACTIVO.map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input className="input-field" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Ejemplo 123" />
              </div>
              <div className="form-group">
                <label>Latitud</label>
                <input className="input-field" type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} placeholder="-34.61" />
              </div>
              <div className="form-group">
                <label>Longitud</label>
                <input className="input-field" type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} placeholder="-58.38" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Crear activo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
const modalBox: React.CSSProperties = { background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' };
