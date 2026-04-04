import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Settings, 
  Box, 
  Info, 
  Shield,
  AlertTriangle,
  Activity,
  FileText,
  Layout,
  ClipboardList,
  CheckCircle
} from 'lucide-react';

type TipoRow = { 
  id: string; 
  nombre: string; 
  descripcion: string; 
  activos: number; 
  riesgos: number 
};

const FORM_EMPTY = { nombre: '', descripcion: '' };

export default function TiposActivoPage() {
  const [tipos, setTipos] = useState<TipoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [selected, setSelected] = useState<TipoRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setLoading(true);
    apiFetch<any[]>('/tipos-activo')
      .then((data) => setTipos(data.map((t) => ({ 
        id: t.id, 
        nombre: t.nombre, 
        descripcion: t.descripcion ?? '—', 
        activos: t._count?.activos ?? 0, 
        riesgos: t._count?.riesgos ?? 0 
      }))))
      .catch(() => setError('No se pudieron sincronizar los tipos de activos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtered = useMemo(() =>
    tipos.filter((t) => !busqueda || t.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [tipos, busqueda]);

  const handleGuardar = async () => {
    if (!form.nombre) { toast.error('El nombre es obligatorio.'); return; }
    setGuardando(true);
    try {
      if (modal === 'crear') {
        await apiFetch('/tipos-activo', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Tipo de activo registrado');
      } else if (modal === 'editar' && selected) {
        await apiFetch(`/tipos-activo/${selected.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        toast.success('Configuración actualizada');
      }
      setModal(null);
      cargar();
    } catch { 
      toast.error('Error al guardar la configuración.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ 
      message: '¿Eliminar este tipo de activo? Se perderá la clasificación de los activos asociados.', 
      confirmLabel: 'Eliminar Configuración', 
      danger: true 
    })) return;
    
    try {
      await apiFetch(`/tipos-activo/${id}`, { method: 'DELETE' });
      toast.success('Tipo de activo eliminado');
      setSelected(null);
      setTipos((prev) => prev.filter((t) => t.id !== id));
    } catch { 
      toast.error('No se puede eliminar: tiene activos o riesgos vinculados.'); 
    }
  };

  const columns = [
    { 
      key: 'nombre', 
      label: 'Clasificación', 
      render: (t: TipoRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
            <Settings size={16} />
          </div>
          <div className="font-bold text-slate-900 dark:text-white leading-tight">{t.nombre}</div>
        </div>
      )
    },
    { 
      key: 'descripcion', 
      label: 'Descripción Técnica',
      render: (t: TipoRow) => <span className="text-slate-400 font-medium italic">{t.descripcion.length > 50 ? t.descripcion.slice(0, 50) + '...' : t.descripcion}</span>
    },
    { 
      key: 'activos', 
      label: 'Activos Vinc.', 
      render: (t: TipoRow) => (
        <div className="flex items-center gap-2">
          <Box size={14} className={t.activos > 0 ? 'text-brand-500' : 'text-slate-300'} />
          <span className={`font-black ${t.activos > 0 ? 'text-brand-600' : 'text-slate-400'}`}>{t.activos}</span>
        </div>
      ) 
    },
    { 
      key: 'riesgos', 
      label: 'Matriz Riesgos', 
      render: (t: TipoRow) => (
        <div className="flex items-center gap-2">
          <Shield size={14} className={t.riesgos > 0 ? 'text-red-500' : 'text-slate-300'} />
          <span className={`font-black ${t.riesgos > 0 ? 'text-red-600' : 'text-slate-400'}`}>{t.riesgos}</span>
        </div>
      ) 
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cargando configuraciones...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="card-premium p-8 text-center max-w-md">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Error de Configuración</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button className="btn-primary w-full" onClick={cargar}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className="flex gap-8 items-start h-full">
      <section className="flex-1 min-w-0 flex flex-col gap-8 h-full">
        <header className="page-header !mb-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tipos de Activo</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Definición de Categorías Técnicas</p>
          </div>
          <button className="btn-primary" onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>
            <Plus size={16} /> Nueva Categoría
          </button>
        </header>

        <FilterBar
          filters={[{ key: 'busqueda', label: 'Buscar por nombre...', value: busqueda, type: 'text' }]}
          onChange={(_, v) => setBusqueda(String(v))}
          onReset={() => setBusqueda('')}
        />

        <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-premium">
          <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay tipos de activo definidos" />
        </div>
      </section>

      {/* Side Detail Panel */}
      {selected && (
        <div className="w-[340px] flex-shrink-0 animate-scale-in h-fit sticky top-0">
          <div className="card-premium h-full flex flex-col p-0 overflow-hidden border-brand-100 shadow-premium-xl">
            {/* Header */}
            <div className="p-6 pb-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                  <Settings size={28} className="text-white" />
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="mt-6 relative z-10">
                <div className="font-mono text-[10px] font-black tracking-widest uppercase opacity-70 mb-1">Configuración Técnica</div>
                <h3 className="text-xl font-black leading-tight tracking-tight">{selected.nombre}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
                    ID: {selected.id.slice(0, 8)}
                  </span>
                </div>
              </div>

              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8">
              <section className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Activos</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{selected.activos}</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Riesgos</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{selected.riesgos}</div>
                </div>
              </section>

              <section>
                <h4 className="form-label !ml-0">Descripción</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {selected.descripcion === '—' ? 'Sin especificaciones técnicas.' : selected.descripcion}
                </p>
              </section>

              <section className="mt-auto grid grid-cols-2 gap-3 pb-2 pt-4">
                <button 
                  className="btn-primary w-full justify-center shadow-lg shadow-brand-500/20" 
                  onClick={() => { setForm({ nombre: selected.nombre, descripcion: selected.descripcion === '—' ? '' : selected.descripcion }); setModal('editar'); }}
                >
                  <Edit3 size={16} /> Editar
                </button>
                <button 
                  className="btn-danger w-full justify-center" 
                  onClick={() => handleEliminar(selected.id)}
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modernizado */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Nueva Arquitectura de Activo' : 'Ajuste de Especificación Técnica'}
        maxWidth="650px"
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
              {guardando ? 'Sincronizando...' : (modal === 'crear' ? 'Registrar Tipo' : 'Actualizar Cambios')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-8 py-2">
          {/* Quick Metrics / Preview */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4 group hover:border-brand-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Box size={24} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Contexto</span>
                   <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">Clase Sistémica</p>
                </div>
             </div>
             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4 group hover:border-blue-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Shield size={24} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Seguridad</span>
                   <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">Vínculo de Riesgo</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="col-span-2 flex items-center gap-2 mb-[-1rem]">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identidad de Categoría</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="col-span-2 flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Layout size={12} className="text-brand-500" />
                Nombre de la Categoría *
              </label>
              <input 
                className="input-premium font-bold" 
                value={form.nombre} 
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                placeholder="Ej: Infraestructura Vial, Alumbrado Público..." 
              />
            </div>

            <div className="col-span-2 flex items-center gap-2 mb-[-1rem] mt-2">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Especificaciones Técnicas</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="col-span-2 flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <FileText size={12} className="text-brand-500" />
                Definición y Alcance Operativo
              </label>
              <textarea 
                className="input-premium min-h-[120px] pt-4 leading-relaxed font-medium" 
                value={form.descripcion} 
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                placeholder="Especifique el alcance técnico y operativo de esta categoría de activo..." 
                style={{ resize: 'none' }} 
              />
            </div>
            
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <CheckCircle size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Validación Activa</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-600">
                   <Activity size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monitoreo KPI</span>
              </div>
            </div>
          </div>
          
          {/* Information Panel */}
          <div className="p-6 bg-brand-500/5 dark:bg-brand-500/10 rounded-[2.5rem] border border-brand-500/10 dark:border-brand-500/20 flex gap-5 items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <ClipboardList size={80} className="text-brand-500" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-brand-500/30 animate-pulse-subtle">
              <Info size={24} />
            </div>
            <div className="relative z-10">
              <h5 className="text-xs font-black text-brand-900 dark:text-brand-300 uppercase tracking-widest mb-1.5">
                 Lineamiento Jerárquico
              </h5>
              <p className="text-[11px] text-brand-700/80 dark:text-brand-400/80 leading-relaxed font-semibold">
                La definición de tipos de activo es fundamental para la segmentación del inventario municipal. Cada categoría permite una gestión diferenciada de mantenimientos y riesgos asociados.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
