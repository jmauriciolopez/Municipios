import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Layers, 
  AlertTriangle,
  Box,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  MapPin,
  Activity,
  FileText,
  Info
} from 'lucide-react';
import { confirm } from '../components/ui/ConfirmDialog';

type ItemRow = { 
  id: string; 
  codigo: string; 
  nombre: string; 
  descripcion: string; 
  cantidad: number; 
  area: string; 
  areaId: string;
};

type AreaOpt = { id: string; nombre: string };

const FORM_EMPTY = { 
  codigo: '', 
  nombre: '', 
  descripcion: '', 
  cantidad: 0, 
  areaId: '' 
};

export default function InventarioPage() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [selected, setSelected] = useState<ItemRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);
  const [delta, setDelta] = useState('');
  const [ajustando, setAjustando] = useState(false);

  const cargar = () => {
    setLoading(true);
    apiFetch<any[]>('/inventario')
      .then((data) => setItems(data.map((i) => ({ 
        id: i.id, 
        codigo: i.codigo, 
        nombre: i.nombre, 
        descripcion: i.descripcion ?? '—', 
        cantidad: Number(i.cantidad), 
        area: i.area?.nombre ?? '—', 
        areaId: i.area?.id ?? '' 
      }))))
      .catch(() => setError('No se pudo cargar el catálogo de inventario.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { 
    cargar(); 
    apiFetch<any[]>('/areas').then((d) => setAreas(d.map((a) => ({ id: a.id, nombre: a.nombre })))).catch(err => console.error(err)); 
  }, []);

  const filtered = useMemo(() => items.filter((i) => {
    if (filtroArea && i.areaId !== filtroArea) return false;
    const term = busqueda.toLowerCase();
    if (busqueda && !i.nombre.toLowerCase().includes(term) && !i.codigo.toLowerCase().includes(term)) return false;
    return true;
  }), [items, filtroArea, busqueda]);

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre) { toast.error('Código y nombre son obligatorios.'); return; }
    setGuardando(true);
    try {
      const payload = { ...form, cantidad: Number(form.cantidad), areaId: form.areaId || undefined };
      if (modal === 'crear') {
        await apiFetch('/inventario', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Ítem creado correctamente');
      } else if (modal === 'editar' && selected) {
        await apiFetch(`/inventario/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Ítem actualizado correctamente');
      }
      setModal(null); 
      cargar();
    } catch { 
      toast.error('Error al procesar la solicitud.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleAjustar = async (d: number) => {
    if (!selected) return;
    if (d === 0) return;
    setAjustando(true);
    try {
      const updated = await apiFetch<any>(`/inventario/${selected.id}/ajustar`, { method: 'PATCH', body: JSON.stringify({ delta: d }) });
      const nueva = Number(updated.cantidad);
      setItems((prev) => prev.map((i) => i.id === selected.id ? { ...i, cantidad: nueva } : i));
      setSelected((s) => s ? { ...s, cantidad: nueva } : s);
      setDelta('');
      toast.success(`Stock actualizado: ${nueva} unidades`);
    } catch { 
      toast.error('Error en el ajuste. Verifique el stock disponible.'); 
    } finally { 
      setAjustando(false); 
    }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ 
      message: '¿Está seguro de eliminar este ítem del inventario? Esta acción no se puede deshacer.', 
      confirmLabel: 'Eliminar Ítem', 
      danger: true 
    })) return;
    
    try {
      await apiFetch(`/inventario/${id}`, { method: 'DELETE' });
      toast.success('Ítem eliminado correctamente');
      setSelected(null);
      cargar();
    } catch {
      toast.error('No se pudo eliminar el ítem.');
    }
  };

  const StockBadge = ({ n }: { n: number }) => {
    const isCritical = n === 0;
    const isLow = n > 0 && n < 5;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-tight uppercase border ${
        isCritical ? 'bg-red-50 text-red-700 border-red-200' : 
        isLow ? 'bg-amber-50 text-amber-700 border-amber-200' : 
        'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}>
        {n} UNIDADES
      </span>
    );
  };

  const columns = [
    { 
      key: 'nombre', 
      label: 'Material / Insumo', 
      render: (i: ItemRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
            <Package size={16} />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white leading-tight">{i.nombre}</div>
            <div className="font-mono text-[10px] uppercase text-slate-400 tracking-wider font-bold">{i.codigo}</div>
          </div>
        </div>
      )
    },
    { key: 'cantidad', label: 'Stock Actual', render: (i: ItemRow) => <StockBadge n={i.cantidad} /> },
    { 
      key: 'area', 
      label: 'Área Asignada',
      render: (i: ItemRow) => (
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Layers size={14} className="opacity-50" />
          {i.area}
        </div>
      )
    },
    { 
      key: 'descripcion', 
      label: 'Observaciones',
      render: (i: ItemRow) => <span className="text-slate-400 font-medium italic">{i.descripcion.length > 40 ? i.descripcion.slice(0, 40) + '...' : i.descripcion}</span>
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sincronizando inventario...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="card-premium p-8 text-center max-w-md">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Error de Almacén</h3>
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
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Almacén Central</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Control de Stock y Suministros</p>
          </div>
          <button className="btn-primary" onClick={() => { setForm(FORM_EMPTY); setModal('crear'); }}>
            <Plus size={16} /> Registrar Entrada
          </button>
        </header>

        <FilterBar
          filters={[
            { key: 'busqueda', label: 'Búsqueda por nombre o código', value: busqueda, type: 'text' },
            { key: 'area', label: 'Área Responsable', value: filtroArea, type: 'select', options: areas.map((a) => ({ value: a.id, label: a.nombre })) },
          ]}
          onChange={(key, value) => {
            if (key === 'busqueda') setBusqueda(String(value));
            if (key === 'area') setFiltroArea(String(value));
          }}
          onReset={() => { setBusqueda(''); setFiltroArea(''); }}
        />

        <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-premium">
          <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay materiales registrados en el inventario" />
        </div>
      </section>

      {/* Side Detail Panel */}
      {selected && (
        <div className="w-[340px] flex-shrink-0 animate-scale-in h-fit sticky top-0">
          <div className="card-premium h-full flex flex-col p-0 overflow-hidden border-brand-100 shadow-premium-xl">
            {/* Header */}
            <div className="p-6 pb-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                  <Package size={28} className="text-brand-300" />
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="mt-6 relative z-10">
                <div className="font-mono text-[10px] font-black tracking-widest uppercase opacity-50 mb-1">{selected.codigo}</div>
                <h3 className="text-xl font-black leading-tight tracking-tight">{selected.nombre}</h3>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 bg-brand-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {selected.area}
                  </span>
                </div>
              </div>

              {/* Decorative circle */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8">
              {/* Stock Highlight */}
              <section className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 text-center relative group">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Disponibilidad Actual</div>
                <div className={`text-5xl font-black transition-colors ${selected.cantidad === 0 ? 'text-red-500' : selected.cantidad < 5 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                  {selected.cantidad}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">unidades</div>
                <Box size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200 dark:text-slate-700/30 -z-10 opacity-50 transition-transform group-hover:scale-110" />
              </section>

              {/* Adjustment Controls */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="form-label !mb-0 !ml-0">Gestión de Stock</h4>
                  <History size={14} className="text-slate-400" />
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      className="input-premium pl-10 !text-sm" 
                      value={delta} 
                      onChange={(e) => setDelta(e.target.value)} 
                      placeholder="Cantidad..."
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {Number(delta) >= 0 ? <ArrowUpRight size={16} className="text-emerald-500" /> : <ArrowDownRight size={16} className="text-red-500" />}
                    </div>
                  </div>
                  <button 
                    disabled={ajustando || !delta} 
                    onClick={() => handleAjustar(Number(delta))}
                    className="btn-primary !px-4 h-[46px] shadow-lg shadow-brand-500/20"
                  >
                    {ajustando ? '...' : 'Ajustar'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide text-center">
                  Use valores negativos para indicar salidas
                </p>
              </section>

              {/* Info section */}
              <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="form-label !ml-0">Descripción del Material</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {selected.descripcion === '—' ? 'Sin descripción técnica registrada.' : selected.descripcion}
                  </p>
                </div>
              </section>

              {/* Actions */}
              <section className="mt-auto grid grid-cols-2 gap-3 pb-2">
                <button 
                  className="btn-secondary w-full justify-center" 
                  onClick={() => { setForm({ codigo: selected.codigo, nombre: selected.nombre, descripcion: selected.descripcion === '—' ? '' : selected.descripcion, cantidad: selected.cantidad, areaId: selected.areaId }); setModal('editar'); }}
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
        title={modal === 'crear' ? 'Registro de Nuevo Recurso' : 'Edición de Material'}
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
              {guardando ? 'Procesando...' : (modal === 'crear' ? 'Confirmar Registro' : 'Guardar Cambios')}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-2">
          {/* Header Visual Shortcut */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4 group hover:border-brand-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-500/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Package size={24} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tipo de Registro</span>
                   <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase">Material de Almacén</p>
                </div>
             </div>
             <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-4 group hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Activity size={24} />
                </div>
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Estado Inicial</span>
                   <p className="text-sm font-black text-emerald-600 uppercase">Operativo / Disp.</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8">
            <div className="col-span-2 flex items-center gap-2 mb-[-1rem]">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identificación Patrimonial</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Hash size={12} className="text-brand-500" />
                Código de Referencia *
              </label>
              <input 
                className="input-premium uppercase font-mono tracking-widest text-brand-600 dark:text-brand-400 font-bold" 
                value={form.codigo} 
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} 
                placeholder="EJ: MAT-001" 
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Box size={12} className="text-brand-500" />
                Nombre del Material *
              </label>
              <input 
                className="input-premium font-bold" 
                value={form.nombre} 
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                placeholder="Ej: Luminaria LED 50W" 
              />
            </div>

            <div className="col-span-2 flex items-center gap-2 mb-[-1rem] mt-2">
              <div className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Logística y Existencias</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Layers size={12} className="text-brand-500" />
                Stock de Apertura
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  className="input-premium pl-12 font-black text-brand-600" 
                  min={0} 
                  value={form.cantidad} 
                  onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} 
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                   <Box size={16} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <MapPin size={12} className="text-brand-500" />
                Área de Depósito / Asignación
              </label>
              <select className="input-premium font-bold" value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })}>
                <option value="">Depósito General</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="form-label flex items-center gap-2">
                <FileText size={12} className="text-brand-500" />
                Especificaciones Técnicas / Descripción
              </label>
              <textarea 
                className="input-premium min-h-[100px] pt-4" 
                value={form.descripcion} 
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                placeholder="Indique características, marcas o detalles relevantes del registro..." 
                style={{ resize: 'none' }} 
              />
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="p-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-[2rem] border border-blue-500/10 dark:border-blue-500/20 flex gap-5 items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Info size={80} className="text-blue-500" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/30 animate-pulse-subtle">
              <ArrowUpRight size={24} />
            </div>
            <div className="relative z-10">
              <h5 className="text-xs font-black text-blue-900 dark:text-blue-300 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                 Validación de Integridad
              </h5>
              <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 leading-relaxed font-semibold">
                Al confirmar, el recurso será indexado en el sistema de gestión patrimonial. Los movimientos posteriores quedarán registrados en el histórico de trazabilidad automática.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
