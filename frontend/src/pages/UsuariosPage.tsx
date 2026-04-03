import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';

type UsuarioRow = {
  id: string; nombre: string; email: string; telefono: string;
  estado: boolean; municipio: string; roles: string[];
};
type Rol = { id: string; nombre: string; descripcion?: string };
const FORM_EMPTY = { nombre: '', email: '', password: '', telefono: '', estado: true };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [selected, setSelected] = useState<UsuarioRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);
  const [togglingRol, setTogglingRol] = useState<string | null>(null);

  const mapUsuario = (u: any): UsuarioRow => ({
    id: u.id, nombre: u.nombre, email: u.email,
    telefono: u.telefono ?? '—', estado: u.estado,
    municipio: u.municipio?.nombre ?? '—',
    roles: u.roles?.map((r: any) => r.rol?.nombre ?? r.nombre) ?? [],
  });

  const cargar = () =>
    apiFetch<any[]>('/usuarios')
      .then((data) => setUsuarios(data.map(mapUsuario)))
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    apiFetch<Rol[]>('/usuarios/roles').then(setRoles).catch(() => {});
  }, []);

  const filtered = useMemo(() =>
    usuarios.filter((u) => {
      if (busqueda && !u.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
          !u.email.toLowerCase().includes(busqueda.toLowerCase())) return false;
      if (filtroEstado === 'activo' && !u.estado) return false;
      if (filtroEstado === 'inactivo' && u.estado) return false;
      return true;
    }), [usuarios, busqueda, filtroEstado]);

  const abrirCrear = () => { setForm(FORM_EMPTY); setModal('crear'); };
  const abrirEditar = (u: UsuarioRow) => {
    setForm({ nombre: u.nombre, email: u.email, password: '', telefono: u.telefono === '—' ? '' : u.telefono, estado: u.estado });
    setModal('editar');
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.email) { toast.error('Nombre y email son obligatorios.'); return; }
    setGuardando(true);
    try {
      const payload: any = { nombre: form.nombre, email: form.email, telefono: form.telefono || undefined, estado: form.estado };
      if (form.password) payload.password = form.password;
      if (modal === 'crear') await apiFetch('/usuarios', { method: 'POST', body: JSON.stringify(payload) });
      else if (modal === 'editar' && selected) await apiFetch(`/usuarios/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setModal(null);
      setLoading(true);
      cargar();
    } catch { toast.error('Error al guardar el usuario.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ message: '¿Eliminar este usuario?', confirmLabel: 'Eliminar', danger: true })) return;
    try {
      await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
      setSelected(null);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch { toast.error('Error al eliminar.'); }
  };

  const handleToggleRol = async (usuarioId: string, rolId: string, tieneRol: boolean) => {
    setTogglingRol(rolId);
    try {
      if (tieneRol) await apiFetch(`/usuarios/${usuarioId}/roles/${rolId}`, { method: 'DELETE' });
      else await apiFetch(`/usuarios/${usuarioId}/roles/${rolId}`, { method: 'POST' });
      const updated = await apiFetch<any>(`/usuarios/${usuarioId}`);
      const mapped = mapUsuario(updated);
      setUsuarios((prev) => prev.map((u) => u.id === usuarioId ? mapped : u));
      setSelected(mapped);
    } catch { toast.error('Error al modificar el rol.'); }
    finally { setTogglingRol(null); }
  };

  const RolBadge = ({ nombre }: { nombre: string }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, background: '#ede9fe', color: '#5b21b6', marginRight: '0.25rem' }}>
      {nombre}
    </span>
  );

  const columns = [
    { key: 'nombre', label: 'Nombre', render: (u: UsuarioRow) => <span style={{ fontWeight: 600 }}>{u.nombre}</span> },
    { key: 'email', label: 'Email', render: (u: UsuarioRow) => <span style={{ fontSize: '0.8125rem', color: '#475569' }}>{u.email}</span> },
    { key: 'roles', label: 'Roles', render: (u: UsuarioRow) => <>{u.roles.map((r) => <RolBadge key={r} nombre={r} />)}</> },
    { key: 'municipio', label: 'Municipio' },
    {
      key: 'estado', label: 'Estado',
      render: (u: UsuarioRow) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: u.estado ? '#dcfce7' : '#f1f5f9', color: u.estado ? '#166534' : '#94a3b8' }}>
          {u.estado ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  if (loading) return <div className="loading-state">Cargando usuarios...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header className="page-header">
          <h2>Usuarios</h2>
          <button onClick={abrirCrear}>+ Nuevo usuario</button>
        </header>

        <FilterBar
          filters={[
            { key: 'busqueda', label: 'Buscar', value: busqueda, type: 'text' },
            { key: 'estado', label: 'Estado', value: filtroEstado, type: 'select', options: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] },
          ]}
          onChange={(key, v) => { if (key === 'busqueda') setBusqueda(String(v)); if (key === 'estado') setFiltroEstado(String(v)); }}
          onReset={() => { setBusqueda(''); setFiltroEstado(''); }}
        />

        <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay usuarios" />
      </section>

      {selected && (
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {selected.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{selected.nombre}</div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{selected.email}</div>
              </div>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div><strong>Teléfono:</strong> {selected.telefono}</div>
              <div><strong>Municipio:</strong> {selected.municipio}</div>
              <div><strong>Estado:</strong> {selected.estado ? 'Activo' : 'Inactivo'}</div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Roles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {roles.map((rol) => {
                  const tiene = selected.roles.includes(rol.nombre);
                  return (
                    <label key={rol.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#334155' }}>
                      <input
                        type="checkbox" checked={tiene}
                        disabled={togglingRol === rol.id}
                        onChange={() => handleToggleRol(selected.id, rol.id, tiene)}
                        style={{ width: 16, height: 16, accentColor: '#1d4ed8' }}
                      />
                      <span style={{ fontWeight: tiene ? 600 : 400 }}>{rol.nombre}</span>
                      {rol.descripcion && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>— {rol.descripcion}</span>}
                    </label>
                  );
                })}
              </div>
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
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>{modal === 'crear' ? 'Nuevo usuario' : 'Editar usuario'}</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label>Nombre *</label>
                <input className="input-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>{modal === 'editar' ? 'Nueva contraseña' : 'Contraseña'}</label>
                <input className="input-field" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={modal === 'editar' ? 'Dejar vacío para no cambiar' : ''} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input className="input-field" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="estado" checked={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#1d4ed8' }} />
                <label htmlFor="estado" style={{ margin: 0, cursor: 'pointer' }}>Usuario activo</label>
              </div>
            </div>
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
const modalBox: React.CSSProperties = { background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
