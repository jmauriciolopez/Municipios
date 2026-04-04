import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrden, cambiarEstadoOrden, asignarCuadrilla } from '@shared/services/ordenes.api';
import { getCuadrillas } from '@shared/services/cuadrillas.api';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import EvidenciasPanel from '../components/ui/EvidenciasPanel';
import Modal from '../components/ui/Modal';
import { 
  ChevronLeft, 
  Package, 
  Trash2, 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  FileText,
  ArrowRight,
  CheckCircle2,
  MapPin
} from 'lucide-react';

const ESTADOS_ORDEN = ['detectado', 'asignado', 'en_proceso', 'resuelto', 'verificado'];
const TRANSICIONES: Record<string, string[]> = {
  detectado: ['asignado', 'cancelado'],
  asignado: ['en_proceso', 'cancelado'],
  en_proceso: ['resuelto', 'cancelado'],
  resuelto: ['verificado'],
  verificado: [],
  cancelado: [],
};

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<any>(null);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [cuadrillas, setCuadrillas] = useState<any[]>([]);
  const [duracion, setDuracion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [modalMaterial, setModalMaterial] = useState(false);
  const [formMaterial, setFormMaterial] = useState({ item: '', cantidad: '', unidad: '', estado: '' });
  const [guardandoMaterial, setGuardandoMaterial] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getOrden(id),
      getCuadrillas(),
      apiFetch<any>(`/ordenes-trabajo/${id}/duracion`).catch(() => null),
      apiFetch<any[]>(`/ordenes-trabajo/${id}/materiales`).catch(() => []),
    ])
      .then(([ord, cuads, dur, mats]: any[]) => {
        setOrden(ord);
        setCuadrillas(cuads ?? []);
        setDuracion(dur);
        setMateriales(Array.isArray(mats) ? mats : ord.materiales ?? []);
      })
      .catch(() => setError('No se pudo cargar la orden.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!id) return;
    if (nuevoEstado === 'cancelado' && !await confirm({ title: 'Cancelar orden', message: '¿Confirmar cancelación de esta orden?', confirmLabel: 'Cancelar orden', danger: true })) return;
    setCambiandoEstado(true);
    try {
      const updated = await cambiarEstadoOrden(id, nuevoEstado);
      setOrden((prev: any) => ({ ...prev, ...(updated as any) }));
      toast.success(`Estado actualizado: ${nuevoEstado.replace(/_/g, ' ')}`);
    } catch (e: any) {
      const msg = e?.message ?? '';
      toast.error(msg.includes('API error') ? 'Transición de estado no permitida.' : 'Error al cambiar el estado.');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleAsignarCuadrilla = async (cuadrillaId: string) => {
    if (!id || !cuadrillaId) return;
    setAsignando(true);
    try {
      const updated = await asignarCuadrilla(id, cuadrillaId);
      const cuadrilla = cuadrillas.find((c: any) => c.id === cuadrillaId);
      setOrden((prev: any) => ({ ...prev, ...(updated as any), cuadrilla }));
      toast.success(`Cuadrilla ${cuadrilla.nombre} asignada`);
    } catch {
      toast.error('Error al asignar la cuadrilla.');
    } finally {
      setAsignando(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!id || !formMaterial.item || !formMaterial.cantidad || !formMaterial.unidad) {
      toast.error('Ítem, cantidad y unidad son obligatorios.');
      return;
    }
    setGuardandoMaterial(true);
    try {
      const nuevo = await apiFetch<any>(`/ordenes-trabajo/${id}/materiales`, {
        method: 'POST',
        body: JSON.stringify({ item: formMaterial.item, cantidad: Number(formMaterial.cantidad), unidad: formMaterial.unidad, estado: formMaterial.estado || undefined }),
      });
      setMateriales((prev) => [...prev, nuevo]);
      setModalMaterial(false);
      setFormMaterial({ item: '', cantidad: '', unidad: '', estado: '' });
      toast.success('Material agregado');
    } catch { toast.error('Error al agregar el material.'); }
    finally { setGuardandoMaterial(false); }
  };

  const handleRemoveMaterial = async (materialId: string) => {
    if (!id || !await confirm({ message: '¿Eliminar este material?', confirmLabel: 'Eliminar', danger: true })) return;
    try {
      await apiFetch(`/ordenes-trabajo/${id}/materiales/${materialId}`, { method: 'DELETE' });
      setMateriales((prev) => prev.filter((m) => m.id !== materialId));
      toast.success('Material eliminado');
    } catch { toast.error('Error al eliminar el material.'); }
  };

  if (loading) return <div className="loading-state">Cargando orden...</div>;
  if (error || !orden) return <div className="error-state">{error ?? 'Orden no encontrada'}</div>;

  const estadoActualIdx = ESTADOS_ORDEN.indexOf(orden.estado);
  const area = orden.area?.nombre ?? '';
  const cuadrilla = orden.cuadrilla?.nombre ?? 'Sin asignar';
  const siguientes = TRANSICIONES[orden.estado] ?? [];

  return (
    <div className="flex flex-col gap-8 h-full pb-8">
      <header className="page-header">
        <div className="flex items-center gap-4">
          <button 
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Package size={14} className="text-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono text-slate-400">{orden.codigo}</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Detalle de Operación</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={orden.estado} />
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <div className="flex items-center gap-2">
            {siguientes.filter((s) => s !== 'cancelado').map((sig) => (
              <button 
                key={sig} 
                className="btn-primary animate-in fade-in slide-in-from-right duration-500" 
                disabled={cambiandoEstado} 
                onClick={() => handleCambiarEstado(sig)}
              >
                {cambiandoEstado ? <Clock size={16} className="animate-spin" /> : <ArrowRight size={18} />}
                <span>{sig.replace(/_/g, ' ').toUpperCase()}</span>
              </button>
            ))}
            {siguientes.includes('cancelado') && (
              <button 
                title="Abortar Misión" 
                className="w-11 h-11 rounded-xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10" 
                disabled={cambiandoEstado} 
                onClick={() => handleCambiarEstado('cancelado')}
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-premium overflow-x-auto">
        <ol className="flex items-center w-full min-w-[600px]">
          {ESTADOS_ORDEN.map((e, idx) => (
            <li key={e} className={`relative flex-1 flex flex-col items-center ${idx < ESTADOS_ORDEN.length - 1 ? "after:content-[''] after:w-full after:h-0.5 after:bg-slate-100 dark:after:bg-slate-800 after:absolute after:top-4 after:left-1/2" : ""}`}>
              <div className={`w-8 h-8 rounded-full border-4 transition-all duration-700 z-10 flex items-center justify-center ${idx <= estadoActualIdx ? 'bg-brand-500 border-brand-100 dark:border-brand-900 shadow-lg shadow-brand-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                {idx < estadoActualIdx ? <CheckCircle2 size={12} className="text-white" /> : <div className={`w-1.5 h-1.5 rounded-full ${idx === estadoActualIdx ? 'bg-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`} />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-3 transition-colors ${idx <= estadoActualIdx ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-600'}`}>
                {e.replace(/_/g, ' ')}
              </span>
              {idx < estadoActualIdx && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-brand-500 z-10 transition-all duration-1000" />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Main Content */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">Especificaciones Técnicas</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Hoja de ruta y parámetros operativos</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prioridad Global</span>
                <StatusBadge status={orden.prioridad} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest flex items-center gap-2">
                       <MapPin size={12} /> Ubicación del Incidente
                    </label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                       {area || 'JURISDICCIÓN NO ESPECIFICADA'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest flex items-center gap-2">
                       <Calendar size={12} /> Fecha de Registro
                    </label>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                       <Clock size={16} className="text-slate-400" />
                       {new Date(orden.createdAt).toLocaleString('es-AR')}
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-brand-500 uppercase tracking-widest flex items-center gap-2">
                       <FileText size={12} /> Reporte de Daños / Tareas
                    </label>
                    <div className="p-6 bg-slate-900 text-slate-300 rounded-3xl border border-slate-800 min-h-[160px] text-sm leading-relaxed font-medium italic relative overflow-hidden group">
                       <FileText size={80} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12 group-hover:scale-110 transition-transform" />
                       <span className="relative z-10 block">"{orden.descripcion || 'Sin descripción detallada disponible en el legajo.'}"</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">Insumos y Logística</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Control de recursos consumidos</p>
                </div>
              </div>
              <button 
                className="btn-secondary rounded-xl px-5 py-2.5 text-[10px] h-auto font-black shadow-lg shadow-slate-100 dark:shadow-none bg-slate-50 border-slate-200" 
                onClick={() => setModalMaterial(true)}
              >
                <Plus size={16} /> REGISTRAR CONSUMO
              </button>
            </div>

            {materiales.length === 0 ? (
              <div className="bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center">
                <Package size={40} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sin consumos registrados para esta orden</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Descripción del Ítem</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Cantidad</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unidad</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {materiales.map((m: any) => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{m.item}</span>
                              {m.estado && <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest mt-1">{m.estado}</span>}
                           </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-black text-slate-900 dark:text-white text-center">{m.cantidad}</td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{m.unidad}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100" 
                            onClick={() => handleRemoveMaterial(m.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                   </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium">
             <EvidenciasPanel entidadTipo="orden" entidadId={id!} />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Users size={20} className="text-brand-500" />
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Cuerpo Operativo</h3>
              </div>
              
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
                   <Users size={100} className="absolute -right-4 -bottom-4 text-white opacity-10 rotate-12 transition-transform group-hover:scale-125" />
                   <div className="relative z-10">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1 block">Cuadrilla Responsable</span>
                      <p className="text-xl font-black uppercase tracking-tighter">{cuadrilla}</p>
                      
                      <div className="mt-4 flex items-center gap-2">
                         <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-brand-600 flex items-center justify-center text-[10px] font-black backdrop-blur-sm">
                                {i}
                             </div>
                           ))}
                         </div>
                         <span className="text-[10px] font-bold text-white/70 italic">Equipo activo</span>
                      </div>
                   </div>
                </div>

                {['detectado', 'asignado'].includes(orden.estado) && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reasignar Unidad de Trabajo</label>
                    <select
                      defaultValue="" disabled={asignando}
                      onChange={(e) => e.target.value && handleAsignarCuadrilla(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 h-14 text-sm font-black text-slate-700 dark:text-slate-200 focus:border-brand-500 transition-all outline-none appearance-none"
                    >
                      <option value="">-- SELECCIONAR CUADRILLA --</option>
                      {cuadrillas.map((c: any) => <option key={c.id} value={c.id}>{c.nombre.toUpperCase()}</option>)}
                    </select>
                  </div>
                )}
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-premium-xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Clock size={160} />
              </div>
              
              <div className="flex items-center gap-3 pb-6 border-b border-white/5 relative z-10">
                <Calendar size={20} className="text-brand-400" />
                <h3 className="font-black text-white uppercase tracking-tight">Trazabilidad Temporal</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                 {[
                   { label: 'Ingreso al Sistema', date: orden.createdAt, icon: Plus, color: 'brand' },
                   { label: 'Asignación de Equipo', date: orden.fechaAsignacion, icon: Users, color: 'blue' },
                   { label: 'Inicio de Labores', date: orden.fechaInicio, icon: Clock, color: 'emerald' },
                   { label: 'Cierre de Legajo', date: orden.fechaCierre, icon: CheckCircle2, color: 'amber', fallback: 'En espera' }
                 ].map((step, i) => (
                   <div key={i} className="flex flex-col gap-3 p-5 rounded-3xl bg-white/5 border border-white/5 transition-all hover:bg-white/10 group">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform`}>
                               <step.icon size={16} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.label}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 pl-11">
                         <Clock size={14} className="text-slate-600" />
                         <span className="text-xs font-black text-white/90">
                           {step.date ? new Date(step.date).toLocaleDateString('es-AR') : <span className="text-slate-600 italic">{step.fallback}</span>}
                         </span>
                      </div>
                   </div>
                 ))}
                 
                 {duracion?.real_horas != null && (
                   <div className="mt-8 p-6 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-center">
                      <span className="text-[9px] font-black text-brand-400 uppercase tracking-[0.2em] mb-2 block">Tiempo de Intervención Total</span>
                      <div className="flex items-baseline justify-center gap-2">
                         <span className="text-4xl font-black text-white leading-none">{duracion.real_horas.toFixed(1)}</span>
                         <span className="text-sm font-bold text-brand-400">Horas Reales</span>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {modalMaterial && (
        <Modal 
          isOpen={modalMaterial} 
          onClose={() => setModalMaterial(false)} 
          title="Consumo de Recursos"
          subtitle="Registro de materiales e insumos utilizados en la intervención"
          maxWidth="550px"
          footer={
             <div className="flex gap-3 justify-end w-full">
               <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors uppercase text-xs tracking-widest" onClick={() => setModalMaterial(false)}>Cancelar</button>
               <button className="btn-primary" onClick={handleAddMaterial} disabled={guardandoMaterial}>
                 {guardandoMaterial ? <Clock size={16} className="animate-spin" /> : <Plus size={18} />}
                 <span>Registrar Consumo</span>
               </button>
             </div>
          }
        >
          <div className="flex flex-col gap-10 py-4">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Detalle del Material</span>
                 <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Package size={12} className="text-brand-500" />
                  Identificador del Insumo / Recurso *
                </label>
                <div className="relative">
                   <input className="input-premium pl-12 font-bold" value={formMaterial.item} onChange={(e) => setFormMaterial({ ...formMaterial, item: e.target.value })} placeholder="Ej: Pintura Vial Reflectiva Amarilla" />
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Plus size={18} />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="form-label font-black text-slate-700 dark:text-slate-300">Cantidad Consumida *</label>
                  <input className="input-premium font-black text-brand-600 dark:text-brand-400 text-center text-lg" type="number" min={0} step="any" value={formMaterial.cantidad} onChange={(e) => setFormMaterial({ ...formMaterial, cantidad: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="form-label font-black text-slate-700 dark:text-slate-300">Unidad de Medida *</label>
                  <input className="input-premium uppercase font-bold text-center" value={formMaterial.unidad} onChange={(e) => setFormMaterial({ ...formMaterial, unidad: e.target.value.toUpperCase() })} placeholder="KG, Lts, Mts..." />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label">Estado / Comentario Adicional (Opcional)</label>
                <input className="input-premium italic font-medium" value={formMaterial.estado} onChange={(e) => setFormMaterial({ ...formMaterial, estado: e.target.value })} placeholder="Ej: Nuevo empaque, material recuperado..." />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
