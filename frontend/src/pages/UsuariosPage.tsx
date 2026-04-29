import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import { 
  User, Mail, Phone, Activity, 
  Trash2, Edit3, X, CheckCircle2, 
  XCircle, Lock, Plus,
  ShieldCheck, ShieldAlert,
  Building
} from 'lucide-react';

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
    apiFetch<Rol[]>('/usuarios/roles').then(setRoles).catch((err) => console.error('Error al cargar roles:', err));
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
    if (!await confirm({ message: '¿Eliminar este usuario definitivamente?', confirmLabel: 'Eliminar Acceso', danger: true })) return;
    try {
      await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
      setSelected(null);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      toast.success('Usuario eliminado');
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

  const columns = [
    { 
      key: 'nombre', 
      label: 'Identidad', 
      render: (u: UsuarioRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-[10px]">
             {u.nombre.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">{u.nombre}</span>
            <span className="text-[10px] text-slate-400 font-medium">{u.email}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'roles', 
      label: 'Permisos', 
      render: (u: UsuarioRow) => (
        <div className="flex flex-wrap gap-1">
          {u.roles.map((r) => (
            <span key={r} className="px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-[9px] font-black uppercase tracking-wider border border-brand-100 dark:border-brand-500/20">
              {r}
            </span>
          ))}
          {u.roles.length === 0 && <span className="text-[10px] text-slate-300 italic">Sin roles</span>}
        </div>
      ) 
    },
    { 
      key: 'municipio', 
      label: 'Jurisdicción',
      render: (u: UsuarioRow) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Building size={12} />
          <span className="text-xs font-semibold">{u.municipio}</span>
        </div>
      )
    },
    {
      key: 'estado', label: 'Acceso',
      render: (u: UsuarioRow) => (
        <div className="flex items-center gap-2">
          {u.estado ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 size={10} /> ACTIVO
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
              <XCircle size={10} /> BLOQUEADO
            </div>
          )}
        </div>
      ),
    },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
      <Activity size={40} className="text-brand-500 animate-spin" />
      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Usuarios...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
      <ShieldAlert size={40} />
      <span className="font-bold">{error}</span>
      <button className="btn-secondary" onClick={cargar}>Reintentar</button>
    </div>
  );

  return (
    <div className="flex gap-8 items-start h-full">
      <section className="flex-1 min-w-0">
        <header className="page-header">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand-500 mb-1">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestión de Accesos</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Panel de Seguridad</h2>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <Plus size={18} />
            <span>Nuevo Usuario</span>
          </button>
        </header>

        <FilterBar
          filters={[
            { key: 'busqueda', label: 'Buscar por nombre o email', value: busqueda, type: 'text' },
            { 
              key: 'estado', label: 'Filtrar Acceso', value: filtroEstado, type: 'select', 
              options: [
                { value: 'activo', label: 'Solo Activos' }, 
                { value: 'inactivo', label: 'Solo Bloqueados' }
              ] 
            },
          ]}
          onChange={(key, v) => { if (key === 'busqueda') setBusqueda(String(v)); if (key === 'estado') setFiltroEstado(String(v)); }}
          onReset={() => { setBusqueda(''); setFiltroEstado(''); }}
        />

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No se encontraron usuarios en los registros" />
        </div>
      </section>

      {selected && (
        <aside className="w-[320px] flex-shrink-0 animate-scale-in sticky top-0">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-fit">
            <div className="p-8 bg-slate-900 relative">
               <div className="absolute top-0 right-0 p-4">
                  <button 
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 flex items-center justify-center transition-all"
                  >
                    <X size={16} />
                  </button>
               </div>
               
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-14 h-14 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white font-black text-xl border-4 border-white/10">
                   {selected.nombre.slice(0, 2).toUpperCase()}
                 </div>
                 <div className="flex flex-col min-w-0">
                    <h3 className="text-white font-black tracking-tight truncate">{selected.nombre}</h3>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest truncate">{selected.email}</span>
                 </div>
               </div>

               <div className="flex gap-2">
                 <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Estado de Cuenta</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selected.estado ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-[10px] font-black text-white uppercase">{selected.estado ? 'Activo' : 'Cerrado'}</span>
                    </div>
                 </div>
                 <div className="flex-1 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Jurisdicción</span>
                    <span className="text-[10px] font-black text-white uppercase truncate block">{selected.municipio}</span>
                 </div>
               </div>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
              <section>
                <div className="flex items-center gap-2 mb-4 opacity-40">
                  <ShieldCheck size={14} className="text-brand-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configuración de Roles</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {roles.map((rol) => {
                    const tiene = selected.roles.includes(rol.nombre);
                    return (
                      <label 
                        key={rol.id} 
                        className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${tiene ? 'bg-brand-50 border-brand-100 dark:bg-brand-500/5 dark:border-brand-500/20' : 'bg-slate-50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800 hover:border-slate-200'}`}
                      >
                        <div className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${tiene ? 'bg-brand-500 border-brand-500 text-white' : 'border-slate-300 bg-white'}`}>
                             {tiene && <CheckCircle2 size={12} />}
                             <input
                                type="checkbox" className="hidden"
                                checked={tiene}
                                disabled={togglingRol === rol.id}
                                onChange={() => handleToggleRol(selected.id, rol.id, tiene)}
                              />
                           </div>
                           <div className="flex flex-col leading-tight">
                             <span className={`text-xs font-bold ${tiene ? 'text-brand-700 dark:text-brand-400' : 'text-slate-600'}`}>{rol.nombre}</span>
                             {rol.descripcion && <span className="text-[9px] text-slate-400 font-medium group-hover:text-slate-500 transition-colors uppercase tracking-tight">{rol.descripcion}</span>}
                           </div>
                        </div>
                         {togglingRol === rol.id && <Activity size={12} className="animate-spin text-brand-500" />}
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-2 mb-2 opacity-40">
                  <Activity size={14} className="text-slate-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Acciones de Terminal</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-secondary w-full justify-center" onClick={() => abrirEditar(selected)}>
                    <Edit3 size={14} />
                    <span>Ajustar</span>
                  </button>
                  <button className="btn-danger w-full justify-center" onClick={() => handleEliminar(selected.id)}>
                    <Trash2 size={14} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </aside>
      )}

      {/* Modal Estandarizado */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Registro de Operador' : 'Actualización de Perfil'}
        subtitle={modal === 'crear' ? 'Configurar nuevo acceso' : `ID: ${selected?.id?.slice(0, 8)}`}
        maxWidth="640px"
      >
        <div className="space-y-8 py-2">
          <section>
             <div className="modal-section-header">
               <User className="text-brand-500" size={18} />
               <h4 className="flex items-center gap-2">
                 Perfil de Identidad
                 <span className="line"></span>
               </h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-group md:col-span-1">
                  <label className="form-label">Nombre y Apellido *</label>
                  <input className="input-premium" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Juan Pérez" />
                </div>
                <div className="form-group md:col-span-1">
                  <label className="form-label">Email de Sistema *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input className="input-premium pl-10" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@municipio.gob.ar" />
                  </div>
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">Línea Telefónica</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input className="input-premium pl-10" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej: 299123456" />
                  </div>
                </div>
             </div>
          </section>

          <section>
             <div className="modal-section-header">
               <Lock className="text-brand-500" size={18} />
               <h4 className="flex items-center gap-2">
                 Credenciales de Acceso
                 <span className="line"></span>
               </h4>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                <div className="form-group">
                  <label className="form-label">{modal === 'editar' ? 'Modificar Contraseña' : 'Password de Acceso *'}</label>
                  <input className="input-premium" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={modal === 'editar' ? 'Dejar en blanco si no cambia' : '●●●●●●●●'} />
                </div>
                
                <div className="form-group">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                    <input type="checkbox" checked={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.checked })} className="w-5 h-5 accent-brand-500 rounded-lg shadow-sm" />
                    <div className="flex flex-col leading-tight">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo SSO</span>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Cuenta Habilitada ✅</span>
                    </div>
                  </label>
                </div>
             </div>
          </section>
        </div>

        <div className="modal-footer mt-10">
          <button className="btn-secondary" onClick={() => setModal(null)}>Cancelar</button>
          <button className="btn-primary min-w-[160px]" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Procesando...' : (modal === 'crear' ? 'Registrar Acceso' : 'Actualizar Perfil')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
