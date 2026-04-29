import { useState, useEffect, useMemo } from 'react';
import { CategoriaIcon } from '../components/ui/iconMap';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import { apiFetch } from '../services/apiFetch';
import { toast } from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import { 
  Plus, 
  Trash2, 
  Layers, 
  AlertTriangle,
  Play,
  Pause,
  Info,
  Type,
  Code,
  Activity,
  Settings,
  Palette,
  Layout
} from 'lucide-react';

interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: number;
  padreId?: string;
  padre?: { id: string; nombre: string };
  activo: boolean;
  orden: number;
  icono?: string;
  color?: string;
  hijos: Categoria[];
}

const FORM_EMPTY = { codigo: '', nombre: '', descripcion: '', nivel: 1, padreId: '', activo: true, orden: 0, icono: '', color: '' };
const DEFAULT_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function CategoriasPage() {
  const [raw, setRaw] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [soloActivas, setSoloActivas] = useState(false);
  const [selected, setSelected] = useState<Categoria | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setLoading(true);
    apiFetch<Categoria[]>('/categorias')
      .then(setRaw)
      .catch(() => setError('No se pudieron sincronizar las taxonomías operativas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const tree = useMemo(() => {
    const padres = raw.filter((c) => c.nivel === 1).sort((a, b) => a.orden - b.orden);
    return padres.map((p) => ({
      ...p,
      hijos: raw.filter((c) => c.padre?.id === p.id).sort((a, b) => a.orden - b.orden),
    }));
  }, [raw]);

  const filtered = useMemo(() => {
    if (!busqueda && !soloActivas) return tree;
    return tree
      .map((p) => ({
        ...p,
        hijos: p.hijos.filter((h) => {
          if (soloActivas && !h.activo) return false;
          if (busqueda && !h.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !h.codigo.toLowerCase().includes(busqueda.toLowerCase())) return false;
          return true;
        }),
      }))
      .filter((p) => {
        if (soloActivas && !p.activo) return false;
        if (busqueda) {
          const matchPadre = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase());
          return matchPadre || p.hijos.length > 0;
        }
        return true;
      });
  }, [tree, busqueda, soloActivas]);

  const padresOptions = useMemo(() => raw.filter((c) => c.nivel === 1), [raw]);

  const abrirCrear = (padreId?: string) => {
    setForm({ ...FORM_EMPTY, nivel: padreId ? 2 : 1, padreId: padreId ?? '' });
    setModal('crear');
  };

  const abrirEditar = (c: Categoria) => {
    setForm({ codigo: c.codigo, nombre: c.nombre, descripcion: c.descripcion ?? '', nivel: c.nivel, padreId: c.padre?.id ?? '', activo: c.activo, orden: c.orden ?? 0, icono: c.icono ?? '', color: c.color ?? '' });
    setSelected(c);
    setModal('editar');
  };

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre) { toast.error('Código y nombre son obligatorios.'); return; }
    if (form.nivel === 2 && !form.padreId) { toast.error('Las subcategorías requieren una categoría padre.'); return; }
    setGuardando(true);
    try {
      const payload = { ...form, padreId: form.padreId || undefined, descripcion: form.descripcion || undefined, color: form.color || undefined, icono: form.icono || undefined };
      if (modal === 'crear') {
        await apiFetch('/categorias', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Categoría registrada');
      } else if (modal === 'editar' && selected) {
        await apiFetch(`/categorias/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Configuración actualizada');
      }
      setModal(null); 
      setSelected(null); 
      cargar();
    } catch { 
      toast.error('Error al procesar la solicitud.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleToggle = async (c: Categoria, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/categorias/${c.id}/toggle-activo`, { method: 'PATCH' });
      cargar();
    } catch { 
      toast.error('No se pudo cambiar el estado.'); 
    }
  };

  const handleEliminar = async (c: Categoria, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!await confirm({ 
      message: `¿Eliminar "${c.nombre}"? Esta acción puede afectar la clasificación de múltiples reportes.`, 
      confirmLabel: 'Confirmar Eliminación', 
      danger: true 
    })) return;
    
    try {
      await apiFetch(`/categorias/${c.id}`, { method: 'DELETE' });
      toast.success('Entidad eliminada');
      cargar();
    } catch { 
      toast.error('No se puede eliminar: existen dependencias activas.'); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Organizando taxonomía...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="card-premium p-8 text-center max-w-md">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Error de Sincronización</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button className="btn-primary w-full" onClick={cargar}>Reintentar Conexión</button>
      </div>
    </div>
  );

  return (
    <div className="flex gap-8 items-start h-full">
      <section className="flex-1 min-w-0 flex flex-col gap-8 h-full">
        <header className="page-header !mb-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Taxonomía de Incidentes</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estructura de Clasificación Municipal</p>
          </div>
          <button className="btn-primary" onClick={() => abrirCrear()}>
            <Plus size={16} /> Nueva Categoría
          </button>
        </header>

        <FilterBar
          filters={[
            { key: 'busqueda', label: 'Búsqueda por nombre o código...', value: busqueda, type: 'text' },
            { 
              key: 'estado', label: 'Filtrar por Visibilidad', value: soloActivas ? 'activas' : 'todas', type: 'select', 
              options: [
                { value: 'todas', label: 'Todas las dimensiones' },
                { value: 'activas', label: 'Solo operativas (Activas)' }
              ] 
            },
          ]}
          onChange={(key, v) => {
            if (key === 'busqueda') setBusqueda(String(v));
            if (key === 'estado') setSoloActivas(v === 'activas');
          }}
          onReset={() => { setBusqueda(''); setSoloActivas(false); }}
        />

        <div className="flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 h-full">
          {filtered.length === 0 && (
            <div className="card-premium p-12 text-center flex flex-col items-center justify-center border-dashed border-2">
              <Layers size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No se encontraron dimensiones de clasificación</p>
            </div>
          )}
          
          {filtered.map((padre) => {
            const color = padre.color || '#64748b';
            return (
              <div 
                key={padre.id} 
                className={`group flex flex-col rounded-3xl border transition-all duration-300 ${padre.activo ? 'bg-white dark:bg-slate-900/50 shadow-premium border-slate-200 dark:border-slate-800' : 'bg-slate-50 dark:bg-slate-900/20 opacity-60 border-slate-100 dark:border-slate-800'}`}
              >
                {/* Parent Row */}
                <div 
                  className="p-5 flex items-center gap-4 cursor-pointer"
                  onClick={() => abrirEditar(padre)}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" 
                    style={{ background: `${color}15`, border: `2px solid ${color}30` }}
                  >
                    <CategoriaIcon codigo={padre.codigo} size={28} color={color} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none">{padre.nombre}</h4>
                      <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded tracking-widest uppercase">
                        {padre.codigo}
                      </span>
                    </div>
                    {padre.descripcion && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">{padre.descripcion}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pr-2">
                    <button 
                      className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center transition-all hover:bg-brand-100"
                      onClick={(e) => { e.stopPropagation(); abrirCrear(padre.id); }}
                      title="Agregar Dimensión Secundaria"
                    >
                      <Plus size={16} />
                    </button>
                    <button 
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center transition-all hover:bg-slate-200"
                      onClick={(e) => { e.stopPropagation(); handleToggle(padre, e); }}
                    >
                      {padre.activo ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                    {padre.hijos.length === 0 && (
                      <button 
                        className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center transition-all hover:bg-red-100"
                        onClick={(e) => handleEliminar(padre, e)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Children Rows */}
                {padre.hijos.length > 0 && (
                  <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {padre.hijos.map((hijo) => {
                      const hijoColor = hijo.color || color;
                      return (
                        <div 
                          key={hijo.id} 
                          className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all hover:translate-x-1 ${hijo.activo ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 shadow-sm' : 'bg-slate-100/50 dark:bg-slate-900/10 border-transparent opacity-60'}`}
                          onClick={(e) => { e.stopPropagation(); abrirEditar(hijo); }}
                        >
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" 
                            style={{ background: `${hijoColor}15` }}
                          >
                            <CategoriaIcon codigo={hijo.codigo} size={18} color={hijoColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">{hijo.nombre}</div>
                            <div className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-tighter opacity-70">{hijo.codigo}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center"
                              onClick={(e) => handleEliminar(hijo, e)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Modernizado */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Nueva Dimensión Taxonómica' : 'Ajuste de Clasificación'}
        maxWidth="680px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button 
              className="px-8 py-2.5 bg-brand-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleGuardar} 
              disabled={guardando}
            >
              {guardando ? 'Sincronizando...' : (modal === 'crear' ? 'Registrar Dimensión' : 'Actualizar Cambios')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-2">
          {/* Header Preview & Info */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4 group hover:border-brand-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Layers size={24} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Nivel Jerárquico</span>
                   <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">Clase {form.nivel}</p>
                </div>
             </div>
             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4 group hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Settings size={24} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Estado Lógico</span>
                   <p className={`text-sm font-black uppercase ${form.activo ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {form.activo ? 'Operativo' : 'Inactivo'}
                   </p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8">
            <div className="col-span-2 flex items-center gap-2 mb-[-1rem]">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Configuración de Estructura</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Activity size={12} className="text-brand-500" />
                Nivel de Profundidad
              </label>
              <select className="input-premium font-bold" value={form.nivel} onChange={(e) => setForm({ ...form, nivel: Number(e.target.value), padreId: Number(e.target.value) === 1 ? '' : form.padreId })}>
                <option value={1}>Dimensión Principal (Nivel 1)</option>
                <option value={2}>Atributo Específico (Nivel 2)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Layout size={12} className="text-brand-500" />
                Referencia Superior (Padre)
              </label>
              <select className="input-premium font-bold" value={form.padreId} onChange={(e) => setForm({ ...form, padreId: e.target.value })} disabled={form.nivel === 1}>
                <option value="">Raíz del Sistema</option>
                {padresOptions.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="col-span-2 flex items-center gap-2 mb-[-1rem] mt-2">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identidad y Clasificación</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Code size={12} className="text-brand-500" />
                Código de Referencia *
              </label>
              <input 
                className="input-premium uppercase font-mono tracking-widest text-brand-600 dark:text-brand-400 font-black" 
                value={form.codigo} 
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} 
                placeholder="ARBOL_CAIDA" 
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Type size={12} className="text-brand-500" />
                Nombre de Clasificación *
              </label>
              <input 
                className="input-premium font-bold" 
                value={form.nombre} 
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                placeholder="Ej: Incidente Vial" 
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2 text-slate-400">
                <Settings size={12} />
                Prioridad (Orden)
              </label>
              <input className="input-premium font-black text-center" type="number" min={0} value={form.orden} onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })} />
            </div>

            <div className="flex flex-col gap-2.5">
               <label className="form-label flex items-center gap-2 text-slate-400">
                 <Activity size={12} />
                 Visibilidad
               </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-brand-500/20 transition-all shadow-sm h-[46px]">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="w-5 h-5 accent-brand-500 rounded-lg" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest leading-none">Activo en Sistema</span>
              </label>
            </div>

            <div className="col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="form-label flex items-center gap-2 mb-0">
                  <Palette size={12} className="text-brand-500" />
                  Identidad Visual (Color Index)
                </label>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{form.color}</span>
              </div>
              <div className="flex flex-wrap gap-2.5 items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800">
                {DEFAULT_COLORS.map((c) => (
                  <button 
                    key={c} 
                    type="button"
                    onClick={() => setForm({ ...form, color: c })} 
                    className={`w-9 h-9 rounded-2xl border-4 transition-all duration-300 ${form.color === c ? 'border-white dark:border-slate-800 scale-125 shadow-xl rotate-12' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'}`}
                    style={{ background: c }}
                  />
                ))}
                <div className="h-9 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />
                <input className="input-premium !py-2 !text-xs !w-28 uppercase font-mono font-bold" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#HEX" />
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Info size={12} className="text-brand-500" />
                Notas de Clasificación / Metadatos
              </label>
              <textarea 
                className="input-premium min-h-[80px] pt-4" 
                value={form.descripcion} 
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                placeholder="Detalle técnico de esta clasificación..." 
                style={{ resize: 'none' }} 
              />
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="p-6 bg-amber-500/5 dark:bg-amber-500/10 rounded-[2.5rem] border border-amber-500/10 dark:border-amber-500/20 flex gap-5 items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Layers size={80} className="text-amber-500" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-amber-500/30 animate-pulse-subtle">
              <Info size={24} />
            </div>
            <div className="relative z-10">
              <h5 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                 Nota Taxonómica Crítica
              </h5>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed font-semibold">
                La estructura de categorías define el comportamiento de los tableros de control y la agregación de KPIs. Modificaciones en la jerarquía pueden alterar reportes históricos.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
