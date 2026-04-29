import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenes, createOrden, asignarCuadrilla } from '@shared/services/ordenes.api';
import { getCuadrillas } from '@shared/services/cuadrillas.api';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import DetailDrawer from '../components/ui/DetailDrawer';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Hash,
  MoreHorizontal,
  Users,
  Layout,
  Clock,
  Tag,
  Briefcase
} from 'lucide-react';

type OrdenRow = {
  id: string; 
  codigo: string; 
  estado: string; 
  prioridad: string;
  area: string; 
  areaId: string; 
  cuadrilla: string; 
  cuadrillaId: string;
  fechaAsignacion: string; 
  fechaCierre: string; 
  descripcion: string;
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
          id: o.id, 
          codigo: o.codigo, 
          estado: o.estado, 
          prioridad: o.prioridad,
          area: o.area?.nombre ?? 'Sin Área', 
          areaId: o.area?.id ?? '',
          cuadrilla: o.cuadrilla?.nombre ?? 'Sin Asignar', 
          cuadrillaId: o.cuadrilla?.id ?? '',
          fechaAsignacion: o.fechaAsignacion ? o.fechaAsignacion.slice(0, 10) : 'Pendiente',
          fechaCierre: o.fechaCierre ? o.fechaCierre.slice(0, 10) : 'Pendiente',
          descripcion: o.descripcion ?? 'Sin descripción proporcionada.',
        })))
      )
      .catch(() => setError('No se pudieron sincronizar las órdenes de trabajo.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    getCuadrillas().then((d: any[]) => setCuadrillas(d.map((c) => ({ id: c.id, nombre: c.nombre })))).catch((err) => console.error('Error al cargar cuadrillas:', err));
    apiFetch<any[]>('/areas').then((d) => setAreas(d.map((a) => ({ id: a.id, nombre: a.nombre })))).catch((err) => console.error('Error al cargar áreas:', err));
  }, []);

  const areasUnicas = useMemo(
    () => [...new Map(ordenes.filter((o) => o.area !== 'Sin Área').map((o) => [o.areaId, o.area])).entries()],
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
      toast.success(`Cuadrilla ${nombre} asignada exitosamente`);
    } catch { 
      toast.error('Error al procesar la asignación.'); 
    } finally { 
      setAsignando(null); 
    }
  };

  const handleCrear = async () => {
    if (!form.codigo) { toast.error('El código de orden es obligatorio.'); return; }
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
      toast.success('Nueva Orden de Trabajo registrada');
    } catch { 
      toast.error('Error al registrar la orden.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const columns = [
    { 
      key: 'codigo', 
      label: 'Identificador', 
      render: (o: OrdenRow) => (
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20">
              <Hash size={14} />
           </div>
           <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tracking-widest">{o.codigo}</span>
        </div>
      ) 
    },
    { key: 'estado', label: 'Estatus', render: (o: OrdenRow) => <StatusBadge status={o.estado} /> },
    { key: 'prioridad', label: 'Severidad', render: (o: OrdenRow) => <StatusBadge status={o.prioridad} /> },
    { 
      key: 'area', 
      label: 'Dependencia',
      render: (o: OrdenRow) => (
        <div className="flex items-center gap-1.5 grayscale opacity-70">
           <MapPin size={12} className="text-slate-400" />
           <span className="text-xs font-bold uppercase tracking-wider">{o.area}</span>
        </div>
      )
    },
    {
      key: 'cuadrilla', 
      label: 'Asignación Operativa',
      render: (o: OrdenRow) => (
        <div className="flex items-center gap-2 group/cuad">
          <div className="flex flex-col">
            <span className={`text-xs font-bold ${o.cuadrillaId ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 italic'}`}>
              {o.cuadrilla}
            </span>
          </div>
          {['detectado', 'asignado'].includes(o.estado) && (
            <div className="relative group/sel">
              <select
                value={o.cuadrillaId} 
                disabled={asignando === o.id}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => e.target.value && handleAsignarCuadrilla(o.id, e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500 cursor-pointer hover:border-brand-500/50 transition-all focus:ring-0 focus:outline-none pr-6"
              >
                <option value="">REASIGNAR...</option>
                {cuadrillas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/sel:text-brand-500">
                 <MoreHorizontal size={10} />
              </div>
            </div>
          )}
        </div>
      ),
    },
    { 
      key: 'fechas', 
      label: 'Cronología',
      render: (o: OrdenRow) => (
        <div className="flex flex-col gap-0.5">
           <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              <Calendar size={10} />
              <span>IN: {o.fechaAsignacion}</span>
           </div>
           <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              <CheckCircle2 size={10} className={o.fechaCierre !== 'Pendiente' ? 'text-emerald-500' : 'opacity-30'} />
              <span>OUT: {o.fechaCierre}</span>
           </div>
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
      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Órdenes de Trabajo...</span>
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
               <ClipboardList size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Gestión Operativa</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Ordenes</h2>
          </div>
          <button className="btn-primary" onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>
            <Plus size={18} /> 
            <span>Nueva Orden</span>
          </button>
        </header>

        <FilterBar
          filters={[
            { key: 'estado', label: 'Estatus', value: estado, type: 'select', options: [{ value: '', label: 'Todos los Estatus' }, ...ESTADOS_OT.map((e) => ({ value: e, label: e.replace(/_/g, ' ').toUpperCase() }))] },
            { key: 'prioridad', label: 'Prioridad', value: prioridad, type: 'select', options: [{ value: '', label: 'Cualquier Prioridad' }, ...PRIORIDADES.map((p) => ({ value: p, label: p.toUpperCase() }))] },
            { key: 'area', label: 'Área / Jurisdicción', value: area, type: 'select', options: [{ value: '', label: 'Todas las Áreas' }, ...areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre }))] },
            { key: 'cuadrilla', label: 'Fuerza Operativa', value: cuadrilla, type: 'select', options: [{ value: '', label: 'Todas las Cuadrillas' }, ...cuadrillas.map((c) => ({ value: c.id, label: c.nombre }))] },
          ]}
          onChange={(key, value) => {
            const v = String(value);
            if (key === 'estado') setEstado(v);
            if (key === 'prioridad') setPrioridad(v);
            if (key === 'area') setArea(v);
            if (key === 'cuadrilla') setCuadrilla(v);
          }}
          onReset={() => { setEstado(''); setPrioridad(''); setArea(''); setCuadrilla(''); setDesde(''); setHasta(''); }}
        />

        <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-premium">
           <DataTable 
            data={filtered} 
            columns={columns} 
            onRowClick={setSelected} 
            emptyMessage="No se detectaron órdenes de trabajo bajo los criterios seleccionados" 
           />
        </div>
      </section>

      <DetailDrawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Legajo de Orden"
        subtitle={selected?.codigo}
      >
        {selected && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
            <div className={`p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl mb-6 ${selected.prioridad === 'critica' || selected.prioridad === 'alta' ? 'bg-gradient-to-br from-red-600 to-rose-700' : 'bg-gradient-to-br from-brand-600 to-indigo-700'}`}>
               <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                  <ClipboardList size={120} />
               </div>
               <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center gap-2 mb-2">
                    <Hash size={14} className="opacity-50" />
                    <span className="font-mono text-xs font-black tracking-[0.3em] opacity-60">ID: {selected.codigo}</span>
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight mb-6 leading-tight max-w-[80%]">{selected.area}</h3>
                 <div className="flex gap-3">
                    <StatusBadge status={selected.estado} />
                    <StatusBadge status={selected.prioridad} />
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Emitida el</span>
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
                        <Calendar size={16} />
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">{selected.fechaAsignacion}</span>
                  </div>
               </div>
               <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cierre Estimado</span>
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selected.fechaCierre !== 'Pendiente' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <CheckCircle2 size={16} />
                     </div>
                     <span className="text-sm font-black text-slate-700 dark:text-slate-200">{selected.fechaCierre}</span>
                  </div>
               </div>
            </div>

            <section className="flex flex-col gap-6">
               <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-slate-900 border border-slate-800 relative overflow-hidden group">
                  <Users size={60} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12 transition-transform group-hover:scale-110" />
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 border border-brand-500/20">
                    <Users size={22} />
                  </div>
                  <div className="flex-1 relative z-10">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block mb-1">Cuerpo Operativo</label>
                    <p className="text-lg font-black text-white uppercase tracking-tight">{selected.cuadrilla}</p>
                  </div>
               </div>
            </section>

            <section className="space-y-4">
               <div className="flex items-center gap-3 px-1">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumen de Novedades</span>
               </div>
               <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  "{selected.descripcion}"
               </div>
            </section>

            <div className="pt-8 space-y-4">
               <button
                 className="btn-primary w-full justify-center group h-16 rounded-2xl shadow-premium-lg bg-brand-500 hover:bg-brand-600"
                 onClick={() => navigate(`/ordenes/${selected.id}`)}
               >
                 <span className="text-[10px] tracking-[0.2em] uppercase font-black">Acceder al Control de Misión</span>
                 <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
               </button>
               <button 
                 onClick={() => setSelected(null)}
                 className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-slate-600 transition-colors"
               >
                 Cerrar Vista Rápida
               </button>
            </div>
          </div>
        )}
      </DetailDrawer>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Nueva Orden de Trabajo"
        subtitle="Registro de siniestros, fallas y planes operativos de mantenimiento"
        maxWidth="650px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors" onClick={() => setModal(false)}>
              Descartar
            </button>
            <button 
              className="px-8 py-2.5 bg-brand-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleCrear} 
              disabled={guardando}
            >
              {guardando ? 'Emitiendo Orden...' : 'Generar Orden de Trabajo'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-4">
           {/* Primary Identifiers */}
           <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <Hash size={12} className="text-brand-500" />
                    Código de Orden *
                  </label>
                  <input 
                    className="input-premium font-mono font-black tracking-widest" 
                    value={form.codigo} 
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })} 
                    placeholder="OT-XXXX-2024" 
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <AlertTriangle size={12} className="text-brand-500" />
                    Criterio de Prioridad
                  </label>
                  <div className="relative">
                    <select 
                      className="input-premium font-bold pl-12 h-14 appearance-none" 
                      value={form.prioridad} 
                      onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                    >
                      {PRIORIDADES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <Tag size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Asignación Inicial</span>
                 <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <Layout size={12} className="text-brand-500" />
                    Área Responsable
                  </label>
                  <div className="relative">
                    <select 
                      className="input-premium font-bold pl-12 h-14 appearance-none" 
                      value={form.area_id} 
                      onChange={(e) => setForm({ ...form, area_id: e.target.value })}
                    >
                      <option value="">Sin Área Específica</option>
                      {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <MapPin size={18} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <Briefcase size={12} className="text-brand-500" />
                    Equipo Operativo Directo
                  </label>
                  <div className="relative">
                    <select 
                      className="input-premium font-bold pl-12 h-14 appearance-none" 
                      value={form.cuadrilla_id} 
                      onChange={(e) => setForm({ ...form, cuadrilla_id: e.target.value })}
                    >
                      <option value="">Postergar Asignación</option>
                      {cuadrillas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <Users size={18} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <Calendar size={12} className="text-brand-500" />
                    Fecha Programada de Inicio
                  </label>
                  <div className="relative">
                    <input 
                      className="input-premium pl-12 h-14 font-bold" 
                      type="date" 
                      value={form.fecha_asignacion} 
                      onChange={(e) => setForm({ ...form, fecha_asignacion: e.target.value })} 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <Clock size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <ClipboardList size={12} className="text-brand-500" />
                  Descripción del Requerimiento Operativo
                </label>
                <textarea 
                  className="input-premium min-h-[120px] py-4" 
                  rows={3} 
                  value={form.descripcion} 
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                  placeholder="Detalle de la tarea, ubicación exacta y requerimientos técnicos..." 
                />
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
}
