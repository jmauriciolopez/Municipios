import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Modal from '../components/ui/Modal';
import { 
  ClipboardCheck, 
  Plus, 
  X, 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ShieldCheck,
  Layout,
  Info,
  Clock,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

type InspeccionRow = { 
  id: string; 
  incidente: string; 
  incidenteId: string; 
  activo: string; 
  inspector: string; 
  area: string; 
  areaId: string; 
  resultado: string; 
  fecha: string; 
  observaciones: string 
};

type Opt = { id: string; nombre: string };

const FORM_EMPTY = { 
  incidenteId: '', 
  activoId: '', 
  inspectorId: '', 
  areaId: '', 
  resultado: '', 
  observaciones: '', 
  fechaInspeccion: '' 
};

export default function InspeccionesPage() {
  const [inspecciones, setInspecciones] = useState<InspeccionRow[]>([]);
  const [areas, setAreas] = useState<Opt[]>([]);
  const [usuarios, setUsuarios] = useState<Opt[]>([]);
  const [incidentes, setIncidentes] = useState<Opt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [selected, setSelected] = useState<InspeccionRow | null>(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const cargar = () =>
    apiFetch<any[]>('/inspecciones')
      .then((data) => setInspecciones(data.map((i) => ({
        id: i.id, 
        incidente: i.incidente?.tipo ?? 'General', 
        incidenteId: i.incidenteId,
        activo: i.activo?.nombre ?? 'Sin activo vinculado', 
        inspector: i.inspector?.nombre ?? i.inspector?.email ?? 'Pendiente',
        area: i.area?.nombre ?? 'Sin Área', 
        areaId: i.area?.id ?? '',
        resultado: i.resultado ?? 'Sin diagnóstico', 
        observaciones: i.observaciones ?? 'Sin comentarios adicionales.',
        fecha: i.fechaInspeccion ? i.fechaInspeccion.slice(0, 10) : 'Pendiente',
      }))))
      .catch(() => setError('Error al sincronizar el registro de inspecciones.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    Promise.all([
      apiFetch<any[]>('/areas').catch(() => []),
      apiFetch<any[]>('/usuarios').catch(() => []),
      apiFetch<any[]>('/incidentes').catch(() => []),
    ]).then(([a, u, inc]) => {
      setAreas(a.map((x) => ({ id: x.id, nombre: x.nombre })));
      setUsuarios(u.map((x) => ({ id: x.id, nombre: x.nombre ?? x.email })));
      setIncidentes(inc.map((x) => ({ id: x.id, nombre: `${x.tipo} — ${x.direccion ?? x.id.slice(0, 8)}` })));
    });
  }, []);

  const filtered = useMemo(() => inspecciones.filter((i) => !filtroArea || i.areaId === filtroArea), [inspecciones, filtroArea]);

  const handleGuardar = async () => {
    if (!form.incidenteId) { toast.error('La vinculación a un incidente es obligatoria.'); return; }
    setGuardando(true);
    try {
      await apiFetch('/inspecciones', { 
        method: 'POST', 
        body: JSON.stringify({ 
          ...form, 
          activoId: form.activoId || undefined, 
          inspectorId: form.inspectorId || undefined, 
          areaId: form.areaId || undefined, 
          fechaInspeccion: form.fechaInspeccion || undefined 
        }) 
      });
      setModal(false); 
      setForm(FORM_EMPTY);
      cargar();
      toast.success('Nueva inspección técnica registrada');
    } catch { 
      toast.error('Error al procesar el registro de inspección.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const columns = [
    { 
      key: 'incidente', 
      label: 'Inspección Técnica',
      render: (i: InspeccionRow) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20 shadow-sm">
             <ClipboardCheck size={18} />
          </div>
          <div className="flex flex-col min-w-0">
             <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{i.incidente}</span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{i.activo}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'inspector', 
      label: 'Responsable',
      render: (i: InspeccionRow) => (
        <div className="flex items-center gap-2">
           <User size={12} className="text-slate-400" />
           <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{i.inspector}</span>
        </div>
      )
    },
    { 
      key: 'area', 
      label: 'Área / Jurisdicción',
      render: (i: InspeccionRow) => (
        <div className="flex items-center gap-1.5 opacity-70">
           <MapPin size={12} className="text-slate-400" />
           <span className="text-xs font-bold uppercase tracking-wider">{i.area}</span>
        </div>
      )
    },
    { 
      key: 'resultado', 
      label: 'Diagnóstico',
      render: (i: InspeccionRow) => {
        const isConforme = (i.resultado?.toLowerCase() || '').includes('conforme') && !(i.resultado?.toLowerCase() || '').includes('no');
        return (
          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${isConforme ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
             {isConforme ? <CheckCircle2 size={10} /> : <Info size={10} />}
             {i.resultado}
          </div>
        );
      }
    },
    { 
      key: 'fecha', 
      label: 'Fecha',
      render: (i: InspeccionRow) => (
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
           <Calendar size={12} className="text-slate-300" />
           {i.fecha}
        </div>
      )
    },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
      <Activity size={40} className="text-brand-500 animate-spin" />
      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Auditando Protocolos...</span>
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
               <ShieldCheck size={16} />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Auditoría Técnica</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Inspecciones</h2>
          </div>
          <button className="btn-primary" onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>
            <Plus size={18} /> 
            <span>Nueva Inspección</span>
          </button>
        </header>

        <FilterBar
          filters={[
            {
              key: 'area', label: 'Área / Jurisdicción', value: filtroArea, type: 'select',
              options: [{ value: '', label: 'Todas las Dependencias' }, ...areas.map((a) => ({ value: a.id, label: a.nombre }))]
            }
          ]}
          onChange={(key, value) => {
            if (key === 'area') setFiltroArea(String(value));
          }}
          onReset={() => { setFiltroArea(''); }}
        />

        <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-premium">
           <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No se registran auditorías técnicas en esta sección" />
        </div>
      </section>

      {/* Premium Sidebar */}
      {selected && (
        <div className="w-[360px] flex-shrink-0 animate-scale-in h-fit sticky top-0 pb-10">
          <div className="card-premium h-full flex flex-col p-0 overflow-hidden border-slate-100 shadow-premium-xl">
            {/* Header */}
            <div className="p-6 pb-12 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative overflow-hidden transition-colors">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <ClipboardCheck size={140} />
               </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                   <ClipboardCheck size={28} className="text-white" />
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-2xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-8 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <div className="font-mono text-[10px] font-black tracking-[0.2em] uppercase opacity-60 leading-none">{selected.fecha}</div>
                   <div className="w-1 h-1 rounded-full bg-white/30" />
                   <div className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">ID #{selected.id.slice(-6).toUpperCase()}</div>
                </div>
                <h3 className="text-2xl font-black leading-tight tracking-tighter mb-4">{selected.incidente}</h3>
                
                <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border w-fit backdrop-blur-md ${selected.resultado.toLowerCase().includes('conforme') && !selected.resultado.toLowerCase().includes('no') ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100' : 'bg-white/10 border-white/20 text-white'}`}>
                   {selected.resultado}
                </div>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col gap-8 bg-white dark:bg-slate-900 border-t-0 -mt-6 rounded-t-[2.5rem] relative z-20">
              {/* Context List */}
              <section className="flex flex-col gap-5">
                 {[
                   { label: 'Inspector Municipal', val: selected.inspector, icon: User, sub: 'Certificador Técnico' },
                   { label: 'Activo / Infraestructura', val: selected.activo, icon: Briefcase, sub: 'Sujeto de Inspección' },
                   { label: 'Área de Control', val: selected.area, icon: MapPin, sub: 'Jurisdicción Vinculada' },
                 ].map((item) => (
                   <div key={item.label} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 text-brand-500 shadow-sm">
                         <item.icon size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</span>
                         <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.val}</span>
                         <span className="text-[9px] text-slate-400 italic mt-0.5">{item.sub}</span>
                      </div>
                   </div>
                 ))}
              </section>

              {/* Status Section */}
              <section className="flex flex-col gap-3">
                 <div className="flex items-center gap-2">
                    <FileText size={14} className="text-brand-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones y Hallazgos</span>
                 </div>
                 <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    "{selected.observaciones}"
                 </div>
              </section>

              <div className="flex items-center gap-3 p-5 rounded-[2rem] bg-brand-500/5 border border-brand-500/10 mt-auto">
                 <ShieldCheck size={20} className="text-brand-500 opacity-50" />
                 <p className="text-[10px] text-brand-800/80 dark:text-brand-400/80 font-bold uppercase tracking-tight">
                    Registro auditado y validado en sistema centralizado.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Creación */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Protocolo de Inspección Técnica"
        subtitle="Registro formal de hallazgos, estados de activos y validación catastral"
        maxWidth="650px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors" onClick={() => setModal(false)}>
              Descartar
            </button>
            <button 
              className="px-8 py-2.5 bg-brand-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleGuardar} 
              disabled={guardando}
            >
              {guardando ? 'Certificando...' : 'Registrar Protocolo'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-4">
           {/* Section: Contexto del Incidente */}
           <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Referencia Operativa</span>
                 <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <AlertCircle size={12} className="text-brand-500" />
                  Incidente / Evento de Origen *
                </label>
                <div className="relative">
                  <select 
                    className="input-premium font-bold pl-12 h-14 appearance-none" 
                    value={form.incidenteId} 
                    onChange={(e) => setForm({ ...form, incidenteId: e.target.value })}
                  >
                    <option value="">Vincular a un Incidente...</option>
                    {incidentes.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                     <AlertCircle size={20} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <User size={12} className="text-brand-500" />
                    Inspector Asignado
                  </label>
                  <div className="relative">
                    <select 
                      className="input-premium font-bold pl-12 h-14 appearance-none" 
                      value={form.inspectorId} 
                      onChange={(e) => setForm({ ...form, inspectorId: e.target.value })}
                    >
                      <option value="">Pendiente de Designación</option>
                      {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <User size={18} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <Layout size={12} className="text-brand-500" />
                    Área Jurisdiccional
                  </label>
                  <div className="relative">
                    <select 
                      className="input-premium font-bold pl-12 h-14 appearance-none" 
                      value={form.areaId} 
                      onChange={(e) => setForm({ ...form, areaId: e.target.value })}
                    >
                      <option value="">Sin Área Específica</option>
                      {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <MapPin size={18} />
                    </div>
                  </div>
                </div>
              </div>
           </div>

           {/* Section: Resultados */}
           <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Resultados y Hallazgos</span>
                 <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-brand-500" />
                    Diagnóstico / Resultado
                  </label>
                  <div className="relative">
                    <input 
                      className="input-premium font-bold pl-12 h-14" 
                      value={form.resultado} 
                      onChange={(e) => setForm({ ...form, resultado: e.target.value })} 
                      placeholder="Ej: Conforme para Operación" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <ShieldCheck size={18} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="form-label flex items-center gap-2">
                    <Calendar size={12} className="text-brand-500" />
                    Fecha de Ejecución
                  </label>
                  <div className="relative">
                    <input 
                      className="input-premium font-bold pl-12 h-14" 
                      type="date" 
                      value={form.fechaInspeccion} 
                      onChange={(e) => setForm({ ...form, fechaInspeccion: e.target.value })} 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                       <Clock size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <FileText size={12} className="text-brand-500" />
                  Observaciones Detalladas
                </label>
                <textarea 
                  className="input-premium py-4" 
                  rows={3} 
                  value={form.observaciones} 
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })} 
                  placeholder="Describa el estado actual del activo, fallas detectadas o requerimientos de mantenimiento..." 
                />
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
}
