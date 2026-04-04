import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import DetailDrawer from '../components/ui/DetailDrawer';
import { 
  User, 
  Fingerprint, 
  Phone, 
  Mail, 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Activity, 
  Users, 
  CheckCircle2, 
  XCircle,
  Contact,
  Info,
  ShieldCheck,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { confirm } from '../components/ui/ConfirmDialog';

type PersonaRow = {
  id: string; 
  nombre: string; 
  dni: string; 
  telefono: string;
  email: string; 
  activo: boolean; 
  usuario: string; 
  cuadrillas: string[];
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
    id: p.id, 
    nombre: p.nombre, 
    dni: p.dni ?? '—',
    telefono: p.telefono ?? '—', 
    email: p.email ?? '—',
    activo: p.activo,
    usuario: p.usuario?.nombre ?? p.usuario?.email ?? '—',
    cuadrillas: p.cuadrillas?.map((c: any) => c.cuadrilla?.nombre).filter(Boolean) ?? [],
  });

  const cargar = () => {
    setLoading(true);
    apiFetch<any[]>(`/personas${soloActivos ? '?activo=true' : ''}`)
      .then((data) => setPersonas(data.map(mapPersona)))
      .catch(() => setError('No se pudieron sincronizar los legajos de personal.'))
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
    if (!form.nombre) { toast.error('El nombre completo es obligatorio.'); return; }
    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre,
        dni: form.dni || undefined,
        telefono: form.telefono || undefined,
        email: form.email || undefined,
      };
      if (modal === 'crear') {
        await apiFetch('/personas', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Nuevo legajo registrado');
      } else if (modal === 'editar' && selected) {
        await apiFetch(`/personas/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Información de personal actualizada');
      }
      setModal(null);
      cargar();
    } catch { 
      toast.error('Error al procesar el registro.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleToggleActivo = async (id: string) => {
    try {
      const updated = await apiFetch<any>(`/personas/${id}/toggle-activo`, { method: 'PATCH' });
      const mapped = mapPersona(updated);
      setPersonas((prev) => prev.map((p) => p.id === id ? mapped : p));
      if (selected?.id === id) setSelected(mapped);
      toast.success(mapped.activo ? 'Legajo activado' : 'Legajo inhabilitado');
    } catch { 
      toast.error('Error al modificar el estado del personal.'); 
    }
  };

  const columns = [
    { 
      key: 'nombre', 
      label: 'Identidad del Personal', 
      render: (p: PersonaRow) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] border shadow-sm ${p.activo ? 'bg-brand-500/10 text-brand-600 border-brand-500/20' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'}`}>
             {p.nombre.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{p.nombre}</span>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] text-slate-400 font-mono tracking-wider">DNI {p.dni}</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      key: 'contacto', 
      label: 'Comunicaciones',
      render: (p: PersonaRow) => (
        <div className="flex flex-col gap-0.5">
           <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Mail size={10} className="text-slate-300" />
              <span className="truncate max-w-[150px]">{p.email}</span>
           </div>
           <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Phone size={10} className="text-slate-300" />
              <span>{p.telefono}</span>
           </div>
        </div>
      )
    },
    {
      key: 'cuadrillas',
      label: 'Equipos de Trabajo',
      render: (p: PersonaRow) => (
        <div className="flex flex-wrap gap-1.5 min-w-[200px]">
          {p.cuadrillas.length > 0 ? (
            p.cuadrillas.map((c) => (
              <span key={c} className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-tight border border-blue-100 dark:border-blue-800">
                {c}
              </span>
            ))
          ) : (
             <span className="text-[10px] text-slate-300 italic">Sin equipo asignado</span>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      label: '',
      render: () => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
             <ArrowRight size={18} />
           </div>
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
      <Activity size={40} className="text-brand-500 animate-spin" />
      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Legajos...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
      <Shield size={40} />
      <span className="font-bold text-sm tracking-tight text-center max-w-xs">{error}</span>
      <button className="btn-secondary" onClick={cargar}>Reintentar Sincronización</button>
    </div>
  );

  return (
    <div className="flex gap-8 items-start h-full pb-8">
      <section className="flex-1 min-w-0 flex flex-col gap-8 h-full">
        <header className="page-header !mb-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand-500 mb-1">
               <Contact size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestión de Personal</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Personas</h2>
          </div>
          <button className="btn-primary" onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>
            <Plus size={18} /> 
            <span>Nueva Persona</span>
          </button>
        </header>

        <FilterBar
          filters={[
            { key: 'busqueda', label: 'Búsqueda por nombre, DNI o email...', value: busqueda, type: 'text' },
            { 
              key: 'estado', label: 'Estado Laboral', value: soloActivos ? 'activos' : 'todos', type: 'select', 
              options: [{ value: 'todos', label: 'Todos los Legajos' }, { value: 'activos', label: 'Solo Personal Activo' }] 
            },
          ]}
          onChange={(key, v) => {
            if (key === 'busqueda') setBusqueda(String(v));
            if (key === 'estado') setSoloActivos(v === 'activos');
          }}
          onReset={() => { setBusqueda(''); setSoloActivos(true); }}
        />

        <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-premium">
           <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay personas registradas en la base de datos municipal" />
        </div>
      </section>

      <DetailDrawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Legajo de Personal"
        subtitle={selected?.nombre}
      >
        {selected && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
             {/* Identity Card */}
             <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -right-4 -top-4 p-8 opacity-5 rotate-12">
                   <User size={120} />
                </div>
                
                <div className="flex flex-col items-center text-center relative z-10">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-brand-500 to-indigo-600 p-1 shadow-2xl mb-6 ring-4 ring-white/10">
                      <div className="w-full h-full rounded-[2.2rem] bg-slate-900 flex items-center justify-center overflow-hidden">
                         <span className="text-4xl font-black text-white">{selected.nombre.slice(0, 2).toUpperCase()}</span>
                      </div>
                   </div>
                   
                   <h3 className="text-2xl font-black tracking-tight mb-2">{selected.nombre}</h3>
                   <div className="px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 mb-6">
                      DNI: {selected.dni}
                   </div>

                   <div className="flex gap-4 w-full">
                      <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/10">
                         <span className="text-[8px] font-black uppercase tracking-widest block opacity-50 mb-1">Estado</span>
                         <div className="flex items-center justify-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${selected.activo ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                            <span className="text-[10px] font-black uppercase">{selected.activo ? 'Activo' : 'Inactivo'}</span>
                         </div>
                      </div>
                      <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/10">
                         <span className="text-[8px] font-black uppercase tracking-widest block opacity-50 mb-1">Usuario</span>
                         <span className="text-[10px] font-black truncate block uppercase">{selected.usuario}</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* Contact Info */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                   <Info size={14} className="text-brand-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información de Contacto</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   {[
                     { icon: Mail, label: 'Email Institucional', value: selected.email, color: 'blue' },
                     { icon: Phone, label: 'Línea de Contacto', value: selected.telefono, color: 'emerald' },
                     { icon: Briefcase, label: 'Cuadrilla Asignada', value: selected.cuadrillas[0] ?? 'Sin asignación', color: 'indigo' },
                   ].map(({ icon: Icon, label, value, color }) => (
                     <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 transition-all">
                        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
                           <Icon size={18} />
                        </div>
                        <div>
                           <span className="block text-[9px] font-black text-slate-400 uppercase tracking-tight leading-none mb-1">{label}</span>
                           <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </section>

             {/* Actions */}
             <div className="pt-4 space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <button 
                   className="px-6 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 text-xs" 
                   onClick={() => {
                     setForm({ 
                       nombre: selected.nombre, 
                       dni: selected.dni === '—' ? '' : selected.dni, 
                       telefono: selected.telefono === '—' ? '' : selected.telefono, 
                       email: selected.email === '—' ? '' : selected.email 
                     });
                     setModal('editar');
                   }}
                 >
                   <Edit3 size={16} /> <span>Modificar</span>
                 </button>
                 <button 
                    className={`px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-xs border ${selected.activo ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white'}`}
                    onClick={() => handleToggleActivo(selected.id)}
                 >
                    {selected.activo ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{selected.activo ? 'Inhabilitar' : 'Reactivar'}</span>
                 </button>
               </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-2xl border border-slate-200 transition-all"
                >
                  Ocultar Panel
                </button>
             </div>
          </div>
        )}
      </DetailDrawer>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Nuevo Registro de Persona' : 'Actualizar Información'}
        subtitle="Sincronización de legajos y datos de contacto de personal municipal"
        maxWidth="650px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors" onClick={() => setModal(null)}>
              Cancelar operacion
            </button>
            <button 
              className="px-8 py-2.5 bg-brand-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleGuardar} 
              disabled={guardando}
            >
              {guardando ? 'Sincronizando...' : (modal === 'crear' ? 'Registrar Legajo' : 'Actualizar Datos')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-4">
          {/* Identity Section */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identidad y Documentación</span>
               <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2 text-[11px]">
                  <Contact size={12} className="text-brand-500" />
                  Nombre Completo del Personal *
                </label>
                <input 
                  className="input-premium font-bold" 
                  value={form.nombre} 
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                  placeholder="Ej: Juan Sebastian Pérez" 
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2 text-[11px]">
                  <Fingerprint size={12} className="text-brand-500" />
                  DNI / Documentación
                </label>
                <div className="relative">
                  <input 
                    className="input-premium font-mono pl-12" 
                    value={form.dni} 
                    onChange={(e) => setForm({ ...form, dni: e.target.value })} 
                    placeholder="12345678" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 flex items-center justify-center w-6 h-6">
                     <Fingerprint size={16} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2 text-[11px]">
                  <Phone size={12} className="text-brand-500" />
                  Teléfono de Contacto
                </label>
                <div className="relative">
                  <input 
                    className="input-premium pl-12" 
                    value={form.telefono} 
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })} 
                    placeholder="299123456" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 flex items-center justify-center w-6 h-6">
                     <Phone size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Comunicaciones Digitales</span>
               <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2 text-[11px]">
                <Mail size={12} className="text-brand-500" />
                Dirección de Email Institucional
              </label>
              <div className="relative">
                <input 
                  className="input-premium pl-12 italic" 
                  type="email"
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  placeholder="usuario@municipio.gob.ar" 
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 flex items-center justify-center w-6 h-6">
                   <Mail size={16} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-1">
                <Info size={12} className="inline mr-2 text-brand-500" />
                Se utilizará para notificaciones de órdenes de trabajo y alertas operativas.
              </p>
            </div>
          </div>

          {/* Status Check */}
          <div className="p-6 rounded-[2rem] bg-brand-500/5 border border-brand-500/10 dark:bg-brand-500/10 dark:border-brand-500/20 group">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h5 className="text-xs font-black text-brand-900 dark:text-brand-300 uppercase tracking-widest leading-none mb-1">Integridad de Legajo</h5>
                   <p className="text-[10px] text-brand-700/80 dark:text-brand-400/80 font-bold italic">Validación de identidad corporativa exitosa</p>
                </div>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
