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
  Briefcase,
  AlertCircle,
  FileText,
  ArrowRight
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
    <section className="space-y-6">
      <header className="page-header bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
            <Package size={28} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{orden.codigo}</h2>
              <StatusBadge status={orden.estado} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-bold">
              <span className="flex items-center gap-1"><Briefcase size={12} /> {area || 'Sin Área'}</span>
              <span className="text-slate-200">|</span>
              {duracion?.real_horas != null && (
                 <span className="text-indigo-600/70">Duración: <strong>{duracion.real_horas.toFixed(1)}h</strong></span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="btn-secondary flex-1 md:flex-none justify-center" onClick={() => navigate(-1)}>
            <ChevronLeft size={16} /> Volver
          </button>
          
          <div className="flex items-center gap-2 flex-2 md:flex-none">
            {siguientes.filter((s) => s !== 'cancelado').map((sig) => (
              <button key={sig} className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95" disabled={cambiandoEstado} onClick={() => handleCambiarEstado(sig)}>
                {cambiandoEstado ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <ArrowRight size={18} />}
                {sig.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
            {siguientes.includes('cancelado') && (
              <button title="Cancelar Orden" className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all" disabled={cambiandoEstado} onClick={() => handleCambiarEstado('cancelado')}>
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200/40 shadow-inner">
        <ol className="flex items-center w-full">
          {ESTADOS_ORDEN.map((e, idx) => (
            <li key={e} className={`relative flex-1 flex flex-col items-center group ${idx < ESTADOS_ORDEN.length - 1 ? "after:content-[''] after:w-full after:h-1 after:bg-slate-100 after:absolute after:top-3 after:left-1/2 after:-z-10" : ""}`}>
              <div className={`w-6 h-6 rounded-full border-4 transition-all duration-500 z-10 ${idx <= estadoActualIdx ? 'bg-indigo-600 border-indigo-100' : 'bg-white border-slate-100'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest mt-2 transition-colors ${idx <= estadoActualIdx ? 'text-indigo-600' : 'text-slate-300'}`}>
                {e.replace(/_/g, ' ')}
              </span>
              {idx < estadoActualIdx && (
                <div className="absolute top-3 left-1/2 w-full h-1 bg-indigo-600 -z-10 transition-all duration-1000" />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText size={18} className="text-indigo-500" />
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Registro de Tareas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Código Identificador</label>
                  <p className="text-sm font-black text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono">{orden.codigo}</p>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Prioridad Asignada</label>
                  <div className="p-2 flex items-center h-10">
                    <StatusBadge status={orden.prioridad} />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Unidad de Gestión</label>
                  <p className="text-sm font-bold text-slate-700 p-1 truncate">{area || 'SIN ÁREA'}</p>
               </div>

               <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Observaciones Operativas</label>
                  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                    "{orden.descripcion || 'Sin descripción detallada para esta orden.'}"
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Materiales e Insumos</h3>
              </div>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95" 
                onClick={() => setModalMaterial(true)}
              >
                <Plus size={14} /> Agregar Item
              </button>
            </div>

            {materiales.length === 0 ? (
              <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-xl p-8 text-center">
                <p className="text-xs text-slate-400 font-medium italic">No se han registrado materiales consumidos para esta orden.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ítem / Recurso</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cantidad</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad</th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materiales.map((m: any) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-3 text-sm font-bold text-slate-700">{m.item}</td>
                        <td className="px-4 py-3 text-sm font-black text-slate-900 text-center">{m.cantidad}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-500">{m.unidad}</td>
                        <td className="px-4 py-3 text-xs">
                          {m.estado ? <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold">{m.estado}</span> : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="p-1.5 text-slate-300 hover:text-red-500 transition-colors" onClick={() => handleRemoveMaterial(m.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
             <EvidenciasPanel entidadTipo="orden" entidadId={id!} />
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Users size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Equipo de Trabajo</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm mb-3 border border-indigo-50">
                      <Users size={24} />
                   </div>
                   <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-1">Cuadrilla Asignada</p>
                   <p className="text-sm font-black text-slate-700 uppercase">{cuadrilla}</p>
                </div>

                {['detectado', 'asignado'].includes(orden.estado) && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Asignar Nuevo Equipo</label>
                    <select
                      defaultValue="" disabled={asignando}
                      onChange={(e) => e.target.value && handleAsignarCuadrilla(e.target.value)}
                      className="input-premium h-11 text-xs font-bold text-slate-700"
                    >
                      <option value="">SELECCIONAR CUADRILLA...</option>
                      {cuadrillas.map((c: any) => <option key={c.id} value={c.id}>{c.nombre.toUpperCase()}</option>)}
                    </select>
                  </div>
                )}
              </div>
           </div>

           <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calendar size={18} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Línea de Tiempo</h3>
              </div>
              
              <div className="space-y-3">
                 {[
                   { label: 'Asignación', date: orden.fechaAsignacion },
                   { label: 'Inicio', date: orden.fechaInicio },
                   { label: 'Cierre', date: orden.fechaCierre, fallback: 'Pendiente' }
                 ].map((step, i) => (
                   <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:bg-slate-50">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{step.label}</span>
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-300" />
                        {step.date ? new Date(step.date).toLocaleDateString('es-AR') : <span className="text-slate-300 italic">{step.fallback}</span>}
                      </span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {modalMaterial && (
        <Modal 
          isOpen={modalMaterial} 
          onClose={() => setModalMaterial(false)} 
          title="Agregar Consumo de Material"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label font-black text-slate-700 mb-1.5 block">Ítem / Recurso *</label>
              <div className="relative">
                 <input className="input-premium h-11 pl-10" value={formMaterial.item} onChange={(e) => setFormMaterial({ ...formMaterial, item: e.target.value })} placeholder="Ej: Bolsa de cemento 50kg" />
                 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300"><Plus size={16} /></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label font-black text-slate-700 mb-1.5 block">Cantidad *</label>
                <input className="input-premium h-11 font-black text-indigo-600" type="number" min={0} step="any" value={formMaterial.cantidad} onChange={(e) => setFormMaterial({ ...formMaterial, cantidad: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label font-black text-slate-700 mb-1.5 block">Unidad *</label>
                <input className="input-premium h-11" value={formMaterial.unidad} onChange={(e) => setFormMaterial({ ...formMaterial, unidad: e.target.value })} placeholder="kg, m3, unid..." />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label font-black text-slate-700 mb-1.5 block">Estado del Material (Opcional)</label>
              <input className="input-premium h-11" value={formMaterial.estado} onChange={(e) => setFormMaterial({ ...formMaterial, estado: e.target.value })} placeholder="Ej: Nuevo, recuperado..." />
            </div>

            <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 mt-4">
              <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest" onClick={() => setModalMaterial(false)}>Cerrar</button>
              <button className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-indigo-200/50 flex items-center gap-2 active:scale-95" onClick={handleAddMaterial} disabled={guardandoMaterial}>
                {guardandoMaterial ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
                REGISTRAR ITEM
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
