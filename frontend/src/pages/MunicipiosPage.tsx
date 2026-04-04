import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import { 
  Building2, 
  Hash, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Globe, 
  Activity,
  Info,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Users,
  Shield
} from 'lucide-react';
import { confirm } from '../components/ui/ConfirmDialog';
import DetailDrawer from '../components/ui/DetailDrawer';

type MunicipioRow = { 
  id: string; 
  nombre: string; 
  codigo: string; 
  areas: number; 
  usuarios: number; 
  activos: number 
};

const FORM_EMPTY = { nombre: '', codigo: '' };

export default function MunicipiosPage() {
  const [municipios, setMunicipios] = useState<MunicipioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MunicipioRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setLoading(true);
    apiFetch<any[]>('/municipios')
      .then((data) => setMunicipios(data.map((m) => ({ 
        id: m.id, 
        nombre: m.nombre, 
        codigo: m.codigo, 
        areas: m._count?.areas ?? 0, 
        usuarios: m._count?.usuarios ?? 0, 
        activos: m._count?.activos ?? 0 
      }))))
      .catch(() => setError('No se pudieron cargar los municipios del sistema central.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtered = useMemo(() => 
    municipios.filter(m => 
      !busqueda || 
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      m.codigo.toLowerCase().includes(busqueda.toLowerCase())
    ), [municipios, busqueda]);

  const handleGuardar = async () => {
    if (!form.nombre || !form.codigo) { 
      toast.error('Nombre y código son requeridos para la indexación.'); 
      return; 
    }
    setGuardando(true);
    try {
      if (modal === 'crear') {
        await apiFetch('/municipios', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Municipio registrado correctamente');
      } else if (modal === 'editar' && selected) {
        await apiFetch(`/municipios/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        toast.success('Parámetros institucionales actualizados');
      }
      setModal(null); 
      cargar();
    } catch { 
      toast.error('Error en la comunicación con el servidor central.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ 
      message: '¿Está seguro de eliminar este municipio? Esta acción puede afectar a todos los activos y usuarios asociados.', 
      confirmLabel: 'Confirmar Eliminación', 
      danger: true 
    })) return;
    
    try {
      await apiFetch(`/municipios/${id}`, { method: 'DELETE' });
      toast.success('Jurisdicción eliminada del sistema');
      setSelected(null);
      cargar();
    } catch { 
      toast.error('No se puede eliminar: el municipio contiene dependencias activas.'); 
    }
  };

  const columns = [
    { 
      key: 'nombre', 
      label: 'Jurisdicción', 
      render: (m: MunicipioRow) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20 shadow-sm transition-transform group-hover:scale-110">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-slate-100 text-sm leading-tight tracking-tight uppercase">{m.nombre}</span>
            <span className="font-mono text-[10px] text-slate-400 font-black tracking-[0.2em]">{m.codigo}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'metadata', 
      label: 'Infraestructura', 
      render: (m: MunicipioRow) => (
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Áreas</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{m.areas}</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cuerpo</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{m.usuarios}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'activos', 
      label: 'Patrimonio', 
      render: (m: MunicipioRow) => (
        <div className="flex items-center gap-2.5 px-4 py-1.5 bg-slate-900 text-white rounded-xl border border-slate-700 shadow-lg">
          <Layers size={12} className="text-brand-400" />
          <span className="text-[10px] font-black tracking-widest leading-none">{m.activos} ACTIVOS</span>
        </div>
      )
    },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
      <Activity size={40} className="text-brand-500 animate-spin" />
      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Jurisdicciones...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
      <AlertTriangle size={40} />
      <span className="font-bold text-sm tracking-tight text-center max-w-xs">{error}</span>
      <button className="btn-secondary" onClick={cargar}>Reintentar Conexión</button>
    </div>
  );

  return (
    <div className="flex gap-8 items-start h-full pb-8">
      <section className="flex-1 min-w-0 flex flex-col gap-8 h-full">
        <header className="page-header !mb-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand-500 mb-1">
              <Globe size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestión Territorial</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Municipios</h2>
          </div>
          <button className="btn-primary" onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>
            <Plus size={18} /> 
            <span>Nueva Jurisdicción</span>
          </button>
        </header>

        <FilterBar
          filters={[{ key: 'busqueda', label: 'Búsqueda por nombre o código institucional...', value: busqueda, type: 'text' }]}
          onChange={(_, v) => setBusqueda(String(v))}
          onReset={() => setBusqueda('')}
        />

        <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-premium">
           <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay municipios registrados en el servidor central" />
        </div>
      </section>

      <DetailDrawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Parámetros Institucionales"
        subtitle={selected?.nombre}
      >
        {selected && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
             {/* Identity Card */}
             <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute -right-4 -top-4 p-8 opacity-5 rotate-12">
                   <Building2 size={120} />
                </div>
                
                <div className="flex flex-col items-center text-center relative z-10">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-white/20 to-white/5 p-px shadow-2xl mb-6">
                      <div className="w-full h-full rounded-[2.5rem] bg-slate-950/50 backdrop-blur-3xl flex items-center justify-center overflow-hidden border border-white/10">
                         <Globe size={40} className="text-brand-400" />
                      </div>
                   </div>
                   
                   <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{selected.nombre}</h3>
                   <div className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 mb-6 font-mono text-brand-300">
                      {selected.codigo}
                   </div>

                   <div className="flex gap-4 w-full">
                      <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                         <span className="text-[8px] font-black uppercase tracking-widest block opacity-50 mb-1">ID Central</span>
                         <span className="text-[10px] font-black truncate block uppercase font-mono">{selected.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10">
                         <span className="text-[8px] font-black uppercase tracking-widest block opacity-50 mb-1">Estado de Red</span>
                         <div className="flex items-center justify-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-emerald-400">Operativo</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Statistics Grid */}
             <section className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2 px-1">
                   <Activity size={14} className="text-brand-500" />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimensionamiento Territorial</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Layers, label: 'Unidades de Gestión', value: selected.areas, unit: 'ÁREAS', color: 'indigo' },
                    { icon: Users, label: 'Personal Registrado', value: selected.usuarios, unit: 'USUARIOS', color: 'blue' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:border-brand-500/10 group">
                        <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-600 mb-4 transition-transform group-hover:scale-110`}>
                           <stat.icon size={20} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</span>
                           <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.unit}</span>
                           </div>
                        </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 rounded-[2rem] bg-slate-900 border border-slate-800 relative overflow-hidden group shadow-2xl">
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
                      <Shield size={120} />
                   </div>
                   <div className="relative z-10">
                      <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest mb-1.5 block">Inventario de Patrimonio</span>
                      <div className="flex items-baseline gap-2 text-white">
                         <span className="text-4xl font-black text-brand-400 tracking-tighter">{selected.activos}</span>
                         <span className="text-sm font-bold opacity-50 uppercase tracking-[0.2em]">Activos Totales</span>
                      </div>
                      <p className="mt-4 text-[10px] text-slate-500 font-bold max-w-[200px] leading-relaxed italic">
                        Esta cifra representa el universo de activos materiales bajo la órbita de esta jurisdicción.
                      </p>
                   </div>
                </div>
             </section>

             {/* Actions */}
             <div className="pt-4 space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 <button 
                   className="px-6 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2 text-xs" 
                   onClick={() => { setForm({ nombre: selected.nombre, codigo: selected.codigo }); setModal('editar'); }}
                 >
                   <Edit3 size={16} /> <span>Modificar</span>
                 </button>
                 <button 
                    className="px-6 py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white flex items-center justify-center gap-2 text-xs"
                    onClick={() => handleEliminar(selected.id)}
                 >
                    <Trash2 size={16} /> <span>Eliminar</span>
                 </button>
               </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-2xl border border-slate-200 transition-all"
                >
                  Ocultar Parámetros
                </button>
             </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal Modernizado */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Nueva Jurisdicción' : 'Actualizar Municipio'}
        subtitle="Configuración de parámetros institucionales y prefijos"
        maxWidth="600px"
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
              {guardando ? 'Sincronizando...' : (modal === 'crear' ? 'Registrar Jurisdicción' : 'Guardar Cambios')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-4">
          {/* Main Section */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identidad Institucional</span>
               <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Building2 size={12} className="text-brand-500" />
                  Nombre Oficial del Municipio *
                </label>
                <input 
                  className="input-premium font-bold" 
                  value={form.nombre} 
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                  placeholder="Ej: Municipalidad de Neuquén" 
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Debe coincidir con la razón social fiscal para reportes legales.</p>
              </div>

              <div className="flex items-center gap-3 mt-2">
                 <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Configuración de Prefijos</span>
                 <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Hash size={12} className="text-brand-500" />
                  Código Identificador Institucional *
                </label>
                <div className="relative">
                   <input 
                    className="input-premium uppercase font-mono tracking-[0.2em] text-brand-600 dark:text-brand-400 font-black pl-12" 
                    value={form.codigo} 
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} 
                    placeholder="MNQN_001" 
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50">
                     <MapPin size={18} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold tracking-tight bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Info size={12} className="inline mr-2 text-brand-500" />
                  Este código es la **raíz jerárquica** de todos los activos, áreas y legajos de personal asociados a esta jurisdicción. Se recomienda un acrónimo de 4-6 caracteres.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 dark:bg-emerald-500/10 dark:border-emerald-500/20 group">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                   <CheckCircle2 size={24} />
                </div>
                <div>
                   <h5 className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest leading-none mb-1">Validación de Esquema</h5>
                   <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-bold italic">Configuración lista para despliegue territorial</p>
                </div>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
