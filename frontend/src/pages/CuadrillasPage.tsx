import { useEffect, useMemo, useState } from 'react';
import { getCuadrillas, setDisponibilidadCuadrilla, getOrdenesCuadrilla, createCuadrilla } from '@shared/services/cuadrillas.api';
import { apiFetch } from '../services/apiFetch';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';

type Miembro = { id: string; nombre: string; rol?: string; usuario?: any };

type CuadrillaRow = {
  id: string; nombre: string; estado: string;
  area: string; areaId: string; supervisor: string;
  miembros: Miembro[]; ordenes: number;
};

type FormCuadrilla = { nombre: string; areaId: string; supervisorId: string };
const FORM_EMPTY: FormCuadrilla = { nombre: '', areaId: '', supervisorId: '' };
const ESTADOS = ['disponible', 'ocupada', 'fuera_servicio'] as const;

export default function CuadrillasPage() {
  const [cuadrillas, setCuadrillas] = useState<CuadrillaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState('');
  const [area, setArea] = useState('');
  const [selected, setSelected] = useState<CuadrillaRow | null>(null);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [cambiando, setCambiando] = useState<string | null>(null);
  const [modalMiembro, setModalMiembro] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);
  const [formMiembro, setFormMiembro] = useState({ personaId: '', rol: '' });
  const [guardandoMiembro, setGuardandoMiembro] = useState(false);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormCuadrilla>(FORM_EMPTY);
  const [areas, setAreas] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setLoading(true);
    getCuadrillas()
      .then((data: any[]) =>
        setCuadrillas(
          data.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            estado: c.estado,
            area: c.area?.nombre ?? '',
            areaId: c.area?.id ?? c.areaId ?? '',
            supervisor: c.supervisor?.nombre ?? c.supervisor?.email ?? 'Sin asignar',
            miembros: (c.miembros ?? []).map((m: any) => ({
              id: m.id,
              nombre: m.persona?.nombre ?? m.persona?.usuario?.nombre ?? '',
              rol: m.rol,
              usuario: m.persona?.usuario ?? null,
            })),
            ordenes: c.ordenes?.length ?? 0,
          }))
        )
      )
      .catch(() => setError('No se pudieron cargar las cuadrillas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    apiFetch<any[]>('/areas').then(setAreas).catch(() => {});
    apiFetch<any[]>('/personas?activo=true').then(setPersonas).catch(() => {});
  }, []);

  const areasUnicas = useMemo(
    () => [...new Map(cuadrillas.filter((c) => c.area).map((c) => [c.areaId, c.area])).entries()],
    [cuadrillas]
  );

  const filtered = useMemo(
    () =>
      cuadrillas.filter((c) => {
        if (estado && c.estado !== estado) return false;
        if (area && c.areaId !== area) return false;
        return true;
      }),
    [cuadrillas, estado, area]
  );

  const handleSelect = async (c: CuadrillaRow) => {
    setSelected(c);
    setLoadingOrdenes(true);
    try {
      const data = await getOrdenesCuadrilla(c.id) as any[];
      setOrdenes(data ?? []);
    } catch {
      setOrdenes([]);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    setCambiando(id);
    try {
      await setDisponibilidadCuadrilla(id, nuevoEstado);
      setCuadrillas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
      );
      if (selected?.id === id) setSelected((s) => s ? { ...s, estado: nuevoEstado } : s);
    } catch {
      alert('Error al cambiar el estado.');
    } finally {
      setCambiando(null);
    }
  };

  const handleCrear = async () => {
    if (!form.nombre) { alert('El nombre es obligatorio.'); return; }
    setGuardando(true);
    try {
      await createCuadrilla({ nombre: form.nombre, areaId: form.areaId || undefined, supervisorId: form.supervisorId || undefined } as any);
      setModal(false); setForm(FORM_EMPTY); cargar();
    } catch { alert('Error al crear la cuadrilla.'); }
    finally { setGuardando(false); }
  };

  const handleAddMiembro = async () => {
    if (!selected || !formMiembro.personaId) { alert('Seleccioná una persona.'); return; }
    setGuardandoMiembro(true);
    try {
      const nuevo = await apiFetch<any>(`/cuadrillas/${selected.id}/miembros`, {
        method: 'POST',
        body: JSON.stringify({ personaId: formMiembro.personaId, rol: formMiembro.rol || undefined }),
      });
      const miembroMapeado = {
        id: nuevo.id,
        usuario: nuevo.persona?.usuario ?? null,
        nombre: nuevo.persona?.nombre ?? '',
        rol: nuevo.rol,
      };
      setSelected((s) => s ? { ...s, miembros: [...s.miembros, miembroMapeado] } : s);
      setCuadrillas((prev) => prev.map((c) => c.id === selected.id ? { ...c, miembros: [...c.miembros, miembroMapeado] } : c));
      setModalMiembro(false);
      setFormMiembro({ personaId: '', rol: '' });
    } catch { alert('Error al agregar el miembro.'); }
    finally { setGuardandoMiembro(false); }
  };

  const handleRemoveMiembro = async (miembroId: string) => {
    if (!selected || !confirm('¿Quitar este miembro de la cuadrilla?')) return;
    try {
      await apiFetch(`/cuadrillas/${selected.id}/miembros/${miembroId}`, { method: 'DELETE' });
      setSelected((s) => s ? { ...s, miembros: s.miembros.filter((m) => m.id !== miembroId) } : s);
      setCuadrillas((prev) => prev.map((c) => c.id === selected.id ? { ...c, miembros: c.miembros.filter((m) => m.id !== miembroId) } : c));
    } catch { alert('Error al quitar el miembro.'); }
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'estado', label: 'Estado',
      render: (c: CuadrillaRow) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StatusBadge status={c.estado} />
          <select
            value={c.estado}
            disabled={cambiando === c.id}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleCambiarEstado(c.id, e.target.value)}
            style={{
              fontSize: '0.75rem', padding: '0.125rem 0.375rem',
              border: '1px solid #e2e8f0', borderRadius: '0.375rem',
              background: '#f8fafc', cursor: 'pointer',
            }}
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      ),
    },
    { key: 'area', label: 'Área' },
    { key: 'supervisor', label: 'Supervisor' },
    {
      key: 'miembros', label: 'Miembros',
      render: (c: CuadrillaRow) => <span>{c.miembros.length}</span>,
    },
    {
      key: 'ordenes', label: 'Órdenes activas',
      render: (c: CuadrillaRow) => (
        <span style={{ fontWeight: c.ordenes > 0 ? 600 : 400, color: c.ordenes > 0 ? '#d97706' : '#94a3b8' }}>
          {c.ordenes}
        </span>
      ),
    },
  ];

  if (loading) return <div className="loading-state">Cargando cuadrillas...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Cuadrillas</h2>
          <button onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>+ Nueva cuadrilla</button>
        </header>

        <FilterBar
          filters={[
            {
              key: 'estado', label: 'Estado', value: estado, type: 'select',
              options: [
                { value: 'disponible', label: 'Disponible' },
                { value: 'ocupada', label: 'Ocupada' },
                { value: 'fuera_servicio', label: 'Fuera de servicio' },
              ],
            },
            {
              key: 'area', label: 'Área', value: area, type: 'select',
              options: areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre })),
            },
          ]}
          onChange={(key, value) => {
            if (key === 'estado') setEstado(String(value));
            if (key === 'area') setArea(String(value));
          }}
          onReset={() => { setEstado(''); setArea(''); }}
        />

        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={handleSelect}
          emptyMessage="No hay cuadrillas disponibles"
        />
      </section>

      {selected && (
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>{selected.area}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <StatusBadge status={selected.estado} />
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>
              <div><strong>Supervisor:</strong> {selected.supervisor}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: 0, borderBottom: 'none', margin: 0 }}>
                Miembros ({selected.miembros.length})
              </h3>
              <button style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => { setFormMiembro({ usuarioId: '', rol: '' }); setModalMiembro(true); }}>+ Agregar</button>
            </div>
            {selected.miembros.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1rem' }}>Sin miembros asignados.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
                {selected.miembros.map((m: Miembro) => (
                  <li key={m.id} style={{ fontSize: '0.8125rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span>{m.nombre}</span>
                      {m.usuario && <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.375rem' }}>({m.usuario.email})</span>}
                      {m.rol && <span style={{ color: '#94a3b8', marginLeft: '0.375rem', fontSize: '0.75rem' }}>· {m.rol}</span>}
                    </div>
                    <button onClick={() => handleRemoveMiembro(m.id)} style={{ background: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', padding: '0', fontSize: '0.875rem', lineHeight: 1 }}>✕</button>
                  </li>
                ))}
              </ul>
            )}
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingBottom: 0, borderBottom: 'none' }}>
              Órdenes asignadas
            </h3>
            {loadingOrdenes ? (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Cargando...</p>
            ) : ordenes.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Sin órdenes activas.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {ordenes.map((o: any) => (
                  <li key={o.id} style={{ fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>{o.codigo}</span>
                    <StatusBadge status={o.estado} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Nueva cuadrilla</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Nombre *</label>
              <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Cuadrilla Norte" />
            </div>
            <div className="form-group">
              <label>Área</label>
              <select className="input-field" value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })}>
                <option value="">Sin área</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button onClick={handleCrear} disabled={guardando}>{guardando ? 'Guardando...' : 'Crear cuadrilla'}</button>
            </div>
          </div>
        </div>
      )}
      {modalMiembro && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Agregar miembro</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModalMiembro(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>Persona *</label>
              <select className="input-field" value={formMiembro.personaId} onChange={(e) => setFormMiembro({ ...formMiembro, personaId: e.target.value })}>
                <option value="">Seleccionar...</option>
                {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}{p.dni ? ` (DNI: ${p.dni})` : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Rol en la cuadrilla</label>
              <input className="input-field" value={formMiembro.rol} onChange={(e) => setFormMiembro({ ...formMiembro, rol: e.target.value })} placeholder="Ej: operario, conductor..." />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setModalMiembro(false)}>Cancelar</button>
              <button onClick={handleAddMiembro} disabled={guardandoMiembro}>{guardandoMiembro ? 'Guardando...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
