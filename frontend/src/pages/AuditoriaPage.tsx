import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import DetailDrawer from '../components/ui/DetailDrawer';
import { 
  History, 
  User as UserIcon, 
  Clock, 
  Database, 
  Activity, 
  Code,
  ShieldCheck,
  ChevronRight,
  Eye
} from 'lucide-react';

type Evento = {
  id: string; 
  entidadTipo: string; 
  entidadId: string; 
  accion: string;
  createdAt: string; 
  datos?: any;
  usuario?: { id: string; nombre: string; email: string };
};

const ACCION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
  LOGIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  LOGOUT: 'bg-slate-50 text-slate-700 border-slate-200',
  CONVERT_TO_ORDER: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ENTIDAD_ICONS: Record<string, any> = {
  Persona: UserIcon,
  Activo: Database,
  Incidente: Activity,
  Orden: ShieldCheck,
  Usuario: UserIcon,
};

export default function AuditoriaPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [selected, setSelected] = useState<Evento | null>(null);

  useEffect(() => {
    apiFetch<Evento[]>('/auditoria?limit=250')
      .then(setEventos)
      .catch(() => setError('No se pudo cargar el registro de auditoría.'))
      .finally(() => setLoading(false));
  }, []);

  const tiposUnicos = useMemo(() => [...new Set(eventos.map((e) => e.entidadTipo))].sort(), [eventos]);
  const accionesUnicas = useMemo(() => [...new Set(eventos.map((e) => e.accion))].sort(), [eventos]);

  const filtered = useMemo(() =>
    eventos.filter((e) => {
      if (filtroTipo && e.entidadTipo !== filtroTipo) return false;
      if (filtroAccion && e.accion !== filtroAccion) return false;
      if (filtroUsuario && !(e.usuario?.nombre?.toLowerCase().includes(filtroUsuario.toLowerCase()) ||
        e.usuario?.email?.toLowerCase().includes(filtroUsuario.toLowerCase()))) return false;
      return true;
    }), [eventos, filtroTipo, filtroAccion, filtroUsuario]);

  const columns = [
    {
      key: 'fecha',
      label: 'Fecha y Hora',
      render: (ev: Evento) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
            <Clock size={14} />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {new Date(ev.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        </div>
      )
    },
    {
      key: 'accion',
      label: 'Acción Realizada',
      render: (ev: Evento) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${ACCION_COLORS[ev.accion] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {ev.accion.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'entidad',
      label: 'Entidad / Objeto',
      render: (ev: Evento) => {
        const Icon = ENTIDAD_ICONS[ev.entidadTipo] || Database;
        return (
          <div className="flex items-center gap-2">
            <Icon size={14} className="text-brand-500/60" />
            <span className="text-sm font-bold text-slate-700">{ev.entidadTipo}</span>
          </div>
        );
      }
    },
    {
      key: 'usuario',
      label: 'Operador',
      render: (ev: Evento) => (
        <div className="flex items-center gap-2">
           <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">
             {(ev.usuario?.nombre || 'S')[0]}
           </div>
           <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-700 leading-none">{ev.usuario?.nombre ?? 'Sistema'}</span>
             <span className="text-[9px] font-medium text-slate-400 truncate max-w-[100px]">{ev.usuario?.email ?? 'auto@muni.gov'}</span>
           </div>
        </div>
      )
    },
    {
      key: 'detalles',
      label: '',
      render: (ev: Evento) => (
        <div className="flex justify-end pr-2">
          <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight size={18} />
          </div>
        </div>
      )
    }
  ];

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;
  if (error) return <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 font-bold">{error}</div>;

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0 space-y-6">
        <header className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Registro de Auditoría</h1>
              <p className="text-xs font-bold text-brand-600/70 uppercase tracking-widest mt-0.5">Control de Trazabilidad Operativa</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
             <History size={16} className="text-slate-400" />
             <span className="text-sm font-black text-slate-600">{filtered.length} <span className="text-slate-400">Eventos</span></span>
          </div>
        </header>

        <FilterBar
          filters={[
            { 
              key: 'tipo', label: 'Entidad', value: filtroTipo, type: 'select', 
              options: [{ value: '', label: 'Cualquier Entidad' }, ...tiposUnicos.map(t => ({ value: t, label: t }))] 
            },
            { 
              key: 'accion', label: 'Operación', value: filtroAccion, type: 'select', 
              options: [{ value: '', label: 'Toda Acción' }, ...accionesUnicas.map(a => ({ value: a, label: a }))] 
            },
            { key: 'usuario', label: 'Buscar Usuario', value: filtroUsuario, type: 'text' },
          ]}
          onChange={(key, v) => {
            if (key === 'tipo') setFiltroTipo(String(v));
            if (key === 'accion') setFiltroAccion(String(v));
            if (key === 'usuario') setFiltroUsuario(String(v));
          }}
          onReset={() => { setFiltroTipo(''); setFiltroAccion(''); setFiltroUsuario(''); }}
        />

        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <DataTable
            data={filtered}
            columns={columns}
            onRowClick={setSelected}
          />
        </div>
      </div>

      <DetailDrawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Detalles del Log"
        subtitle="Registro técnico de actividad"
      >
        {selected && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
              <div className={`mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase border ${ACCION_COLORS[selected.accion] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {selected.accion}
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selected.entidadTipo}</h3>
              <p className="text-[10px] font-mono font-bold text-slate-300 mt-2 truncate w-full px-4">UUID: {selected.id}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">Operado por</label>
                    <p className="text-sm font-bold text-slate-700">{selected.usuario?.nombre ?? 'Sistema Automático'}</p>
                  </div>
               </div>

               <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-500">
                    <Clock size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-0.5">Marca Temporal</label>
                    <p className="text-xs font-bold text-slate-700">{new Date(selected.createdAt).toLocaleString('es-AR')}</p>
                  </div>
               </div>

               <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                    <Database size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest block mb-0.5">ID Objeto</label>
                    <p className="text-[11px] font-mono font-bold text-slate-600">{selected.entidadId}</p>
                  </div>
               </div>
            </div>

            {selected.datos && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                   <Code size={14} className="text-slate-400" />
                   <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Carga Útil de Datos (JSON)</h4>
                </div>
                <div className="relative group">
                  <pre className="bg-slate-900 rounded-2xl p-5 text-[10px] font-mono text-emerald-400/90 overflow-auto max-h-[400px] leading-relaxed shadow-xl border border-slate-800 scrollbar-hide">
                    {JSON.stringify(selected.datos, null, 2)}
                  </pre>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-slate-800 text-[9px] font-black text-slate-500 px-2 py-1 rounded-md border border-slate-700">READONLY</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-4">
               <button 
                 onClick={() => setSelected(null)}
                 className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2"
               >
                 Cerrar Vista
               </button>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
