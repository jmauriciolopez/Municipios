import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import DetailDrawer from '../components/ui/DetailDrawer';
import { 
  Building2, 
  Layers, 
  Users, 
  AlertCircle, 
  ClipboardList, 
  Trash2, 
  Edit3, 
  Plus, 
  Layout,
  Info,
  MapPin,
  CheckCircle2,
  Activity,
  TextQuote,
  ArrowRight
} from 'lucide-react';

type AreaRow = {
  id: string; 
  nombre: string; 
  descripcion: string; 
  municipio: string; 
  municipioId: string;
  activos: number; 
  cuadrillas: number; 
  incidentes: number; 
  ordenes: number;
};

type FormArea = { nombre: string; descripcion: string; municipioId: string };
const FORM_EMPTY: FormArea = { nombre: '', descripcion: '', municipioId: '' };

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaRow[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [selected, setSelected] = useState<AreaRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState<FormArea>(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setLoading(true);
    apiFetch<any[]>('/areas')
      .then((data) => setAreas(data.map((a) => ({
        id: a.id, 
        nombre: a.nombre, 
        descripcion: a.descripcion ?? '—',
        municipio: a.municipio?.nombre ?? '—', 
        municipioId: a.municipio?.id ?? '',
        activos: a.activos?.length ?? 0, 
        cuadrillas: a.cuadrillas?.length ?? 0,
        incidentes: a.incidentes?.length ?? 0, 
        ordenes: a.ordenes?.length ?? 0,
      }))))
      .catch(() => setError('No se pudieron cargar las áreas operativas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    apiFetch<any[]>('/municipios').then(setMunicipios).catch((err) => console.error('Error al cargar municipios:', err));
  }, []);

  const filtered = useMemo(
    () => areas.filter((a) => !busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [areas, busqueda]
  );

  const abrirCrear = () => { setForm(FORM_EMPTY); setModal('crear'); };
  const abrirEditar = (a: AreaRow) => {
    setForm({ nombre: a.nombre, descripcion: a.descripcion === '—' ? '' : a.descripcion, municipioId: a.municipioId });
    setModal('editar');
  };

  const handleGuardar = async () => {
    if (!form.nombre) { toast.error('El nombre del área es requerido.'); return; }
    setGuardando(true);
    try {
      if (modal === 'crear') {
        await apiFetch('/areas', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Área operativa registrada');
      } else if (modal === 'editar' && selected) {
        await apiFetch(`/areas/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        toast.success('Definición de área actualizada');
      }
      setModal(null);
      cargar();
    } catch { 
      toast.error('Error al procesar la solicitud en el servidor.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ 
      message: '¿Confirma la eliminación de esta área operativa? Las dependencias podrían quedar huérfanas.', 
      confirmLabel: 'Confirmar Eliminación', 
      danger: true 
    })) return;
    
    try {
      await apiFetch(`/areas/${id}`, { method: 'DELETE' });
      toast.success('Área removida del sistema');
      setSelected(null);
      cargar();
    } catch { 
      toast.error('No se puede eliminar: el área tiene activos o personal asociado.'); 
    }
  };

  const MetricLabel = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} className="text-slate-400" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">{label}</span>
      </div>
      <span className={`text-xs font-black ${value > 0 ? colorClass : 'text-slate-300'}`}>{value}</span>
    </div>
  );

  const columns = [
    { 
      key: 'nombre', 
      label: 'Área Operativa', 
      render: (a: AreaRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-sm">
            <Layout size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{a.nombre}</span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] italic">{a.descripcion}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'municipio', 
      label: 'Jurisdicción',
      render: (a: AreaRow) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Building2 size={12} className="opacity-50" />
          <span className="text-xs font-semibold">{a.municipio}</span>
        </div>
      )
    },
    { 
      key: 'metrics', 
      label: 'Estadísticas del Área', 
      render: (a: AreaRow) => (
        <div className="flex items-center gap-6">
          <MetricLabel icon={Layers} label="Activos" value={a.activos} colorClass="text-brand-600 dark:text-brand-400" />
          <MetricLabel icon={Users} label="Cuadrillas" value={a.cuadrillas} colorClass="text-blue-600 dark:text-blue-400" />
          <MetricLabel icon={AlertCircle} label="Incidentes" value={a.incidentes} colorClass="text-red-600 dark:text-red-400" />
          <MetricLabel icon={ClipboardList} label="Órdenes" value={a.ordenes} colorClass="text-amber-600 dark:text-amber-400" />
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
      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Áreas Operativas...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
      <AlertCircle size={40} />
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
              <Layout size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">División Operativa</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Áreas</h2>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <Plus size={18} /> 
            <span>Nueva Área</span>
          </button>
        </header>

        <FilterBar
          filters={[
            { key: 'busqueda', label: 'Búsqueda por nombre de área...', value: busqueda, type: 'text' },
            { 
              key: 'municipio', label: 'Jurisdicción', value: '', type: 'select', 
              options: [{ value: '', label: 'Todas las Jurisdicciones' }, ...municipios.map(m => ({ value: m.id, label: m.nombre }))]
            },
          ]}
          onChange={(key, v) => {
            if (key === 'busqueda') setBusqueda(String(v));
          }}
          onReset={() => setBusqueda('')}
        />

        <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-premium">
           <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay áreas definidas para esta jurisdicción" />
        </div>
      </section>

      <DetailDrawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Área Operativa"
        subtitle={selected?.nombre}
      >
        {selected && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
            {/* Header / Identity */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden shadow-xl mb-6">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <Layout size={100} />
               </div>
               <div className="relative z-10">
                 <div className="font-mono text-[10px] font-black tracking-[0.2em] uppercase opacity-60 mb-2">{selected.municipio}</div>
                 <h3 className="text-xl font-black uppercase tracking-tight mb-4">{selected.nombre}</h3>
                 
                 <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20">
                       ID: {selected.id.slice(0, 8)}
                    </div>
                 </div>
               </div>
            </div>

            {/* Description */}
            <section className="space-y-3">
               <div className="flex items-center gap-2 px-1">
                  <TextQuote size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Visión del Área</span>
               </div>
               <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-4 border-l-blue-500">
                  {selected.descripcion !== '—' ? selected.descripcion : 'Sin descripción técnica registrada.'}
               </div>
            </section>

            {/* Metrics Grid */}
            <section className="grid grid-cols-2 gap-4">
               {[
                 { label: 'Activos', n: selected.activos, icon: Layers, color: 'brand' },
                 { label: 'Equipos', n: selected.cuadrillas, icon: Users, color: 'blue' },
                 { label: 'Alertas', n: selected.incidentes, icon: AlertCircle, color: 'red' },
                 { label: 'Tareas', n: selected.ordenes, icon: ClipboardList, color: 'amber' },
               ].map(({ label, n, icon: Icon, color }) => (
                 <div key={label} className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                       <Icon size={12} className={`text-${color === 'brand' ? 'brand' : color}-500`} />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">{label}</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform origin-left">{n}</div>
                 </div>
               ))}
            </section>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-xs" 
                  onClick={() => abrirEditar(selected)}
                >
                  <Edit3 size={16} /> <span>Modificar</span>
                </button>
                <button 
                  className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs" 
                  onClick={() => handleEliminar(selected.id)}
                >
                  <Trash2 size={16} /> <span>Remover</span>
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

      {/* Modal Modernizado */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Nueva Área Operativa' : 'Editar Área'}
        subtitle="Definición de divisiones administrativas y operativas"
        maxWidth="600px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors" onClick={() => setModal(null)}>
              Descartar
            </button>
            <button 
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleGuardar} 
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : (modal === 'crear' ? 'Crear Área' : 'Actualizar Cambios')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-4">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Definición de Área</span>
               <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Layout size={12} className="text-blue-500" />
                  Nombre de la División *
                </label>
                <input 
                  className="input-premium font-bold" 
                  value={form.nombre} 
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                  placeholder="Ej: Mantenimiento Vial, Alumbrado Público..." 
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Building2 size={12} className="text-blue-500" />
                  Jurisdicción / Municipio Perteneciente
                </label>
                <div className="relative">
                   <select 
                    className="input-premium font-bold pl-12 active:ring-blue-500 appearance-none" 
                    value={form.municipioId} 
                    onChange={(e) => setForm({ ...form, municipioId: e.target.value })}
                  >
                    <option value="">Seleccionar jurisdicción...</option>
                    {municipios.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 flex items-center justify-center w-6 h-6">
                     <MapPin size={16} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Info size={12} className="text-blue-500" />
                  Descripción y Objetivos del Área
                </label>
                <textarea 
                  className="input-premium !min-h-[120px] font-medium leading-relaxed" 
                  value={form.descripcion} 
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                  placeholder="Describa las responsabilidades principales de esta área..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 dark:bg-blue-500/10 dark:border-blue-500/20 group">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                   <CheckCircle2 size={24} />
                </div>
                <div>
                   <h5 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest leading-none mb-1">Estructura Validada</h5>
                   <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80 font-bold italic">Configuración jerárquica lista</p>
                </div>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
