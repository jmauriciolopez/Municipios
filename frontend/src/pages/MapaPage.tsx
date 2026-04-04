import { useEffect, useMemo, useState } from 'react';
import { getIncidentes } from '@shared/services/incidentes.api';
import { getMapaCalor } from '@shared/services/dashboard.api';
import IncidentMap from '../components/map/IncidentMap';
import { Incident } from '../types/incident';
import StatusBadge from '../components/ui/StatusBadge';
import FilterBar from '../components/ui/FilterBar';
import { 
  Map as MapIcon, 
  Flame, 
  MapPin, 
  Info, 
  X, 
  Navigation, 
  Calendar, 
  Layers,
  Activity
} from 'lucide-react';

export default function MapaPage() {
  const [incidentes, setIncidentes] = useState<Incident[]>([]);
  const [heatPoints, setHeatPoints] = useState<Array<{ lat: number; lng: number; intensity: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [modoCalor, setModoCalor] = useState(false);
  const [selected, setSelected] = useState<Incident | null>(null);

  useEffect(() => {
    setLoading(true);
    getIncidentes()
      .then((data: any[]) =>
        setIncidentes(
          data.filter((i) => i.lat && i.lng).map((i) => ({
            id: i.id, tipo: i.tipo, estado: i.estado, prioridad: i.prioridad,
            area: i.area?.nombre ?? '', lat: Number(i.lat), lng: Number(i.lng),
            direccion: i.direccion ?? '',
            fecha: (i.fechaReporte ?? i.fecha_reporte ?? '').slice(0, 10),
            categoriaCodigo: i.categoria?.codigo ?? '',
            categoriaColor: i.categoria?.color ?? '',
          }))
        )
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!modoCalor) return;
    getMapaCalor({ fecha_desde: desde || undefined, fecha_hasta: hasta || undefined, tipo: tipo || undefined })
      .then((data: any) => setHeatPoints(data?.puntos ?? []))
      .catch(() => {});
  }, [modoCalor, desde, hasta, tipo]);

  const tiposUnicos = useMemo(() => [...new Set(incidentes.map((i) => i.tipo))], [incidentes]);

  const filtered = useMemo(
    () => incidentes.filter((i) => {
      if (tipo && i.tipo !== tipo) return false;
      if (estado && i.estado !== estado) return false;
      if (desde && i.fecha < desde) return false;
      if (hasta && i.fecha > hasta) return false;
      return true;
    }),
    [incidentes, tipo, estado, desde, hasta]
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cargando cartografía operativa...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 h-full">
      <header className="page-header !mb-0">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Geolocalización Operativa</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monitoreo Territorial de Incidentes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModoCalor((v) => !v)}
            className={`btn ${modoCalor ? 'btn-primary bg-orange-600 hover:bg-orange-700 shadow-orange-500/20' : 'btn-secondary'}`}
          >
            {modoCalor ? <Flame size={16} className="fill-current" /> : <MapPin size={16} />}
            {modoCalor ? 'Modo Calor Activo' : 'Ver Marcadores'}
          </button>
        </div>
      </header>

      <FilterBar
        filters={[
          { key: 'tipo', label: 'Tipo de Incidente', value: tipo, type: 'select', options: tiposUnicos.map((t) => ({ value: t, label: t })) },
          { key: 'estado', label: 'Estado Actual', value: estado, type: 'select', options: ['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'].map((e) => ({ value: e, label: e.replace('_', ' ') })) },
          { key: 'desde', label: 'Desde', value: desde, type: 'date' },
          { key: 'hasta', label: 'Hasta', value: hasta, type: 'date' },
        ]}
        onChange={(key, value) => {
          if (key === 'tipo') setTipo(String(value));
          if (key === 'estado') setEstado(String(value));
          if (key === 'desde') setDesde(String(value));
          if (key === 'hasta') setHasta(String(value));
        }}
        onReset={() => { setTipo(''); setEstado(''); setDesde(''); setHasta(''); }}
      />

      <div className="flex gap-8 items-start flex-1 min-h-0">
        <div className="flex-1 h-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-premium relative">
          <IncidentMap
            incidents={modoCalor ? [] : filtered}
            heatPoints={modoCalor ? heatPoints : []}
            onSelectIncident={setSelected}
          />
          
          {/* Overlay Info */}
          <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Muestra Actual</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">{filtered.length} Incidentes Filtrados</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Info Panel */}
        <div className="w-[340px] flex-shrink-0 h-full animate-scale-in">
          <div className="card-premium h-full flex flex-col p-0 overflow-hidden border-brand-100 shadow-premium-xl">
            {selected ? (
              <>
                {/* Header for selected incident */}
                <div 
                  className="p-6 pb-8 text-white relative overflow-hidden transition-all duration-500"
                  style={{ background: selected.categoriaColor ? `linear-gradient(135deg, ${selected.categoriaColor}, ${selected.categoriaColor}dd)` : 'linear-gradient(135deg, #1e293b, #0f172a)' }}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                      <MapPin size={28} className="text-white" />
                    </div>
                    <button 
                      onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-6 relative z-10">
                    <div className="font-mono text-[10px] font-black tracking-widest uppercase opacity-70 mb-1">
                      {selected.id.slice(0, 8)} — {selected.fecha}
                    </div>
                    <h3 className="text-xl font-black leading-tight tracking-tight">{selected.tipo}</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                       <StatusBadge status={selected.estado} />
                       <StatusBadge status={selected.prioridad} />
                    </div>
                  </div>

                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                  <section>
                    <h4 className="form-label !mb-3">Ubicación del Reporte</h4>
                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 flex-shrink-0">
                        <Navigation size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Dirección</div>
                        <div className="text-xs text-slate-500 font-medium leading-relaxed">{selected.direccion || 'Sin dirección registrada'}</div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div>
                      <h4 className="form-label !mb-3">Información Adicional</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 flex-shrink-0">
                            <Layers size={20} />
                          </div>
                          <div>
                            <div className="form-label !mb-0 !ml-0">Área Responsable</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selected.area}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 flex-shrink-0">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <div className="form-label !mb-0 !ml-0">Fecha de Registro</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selected.fecha}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="mt-auto pt-4">
                    <button 
                      className="btn-primary w-full shadow-lg shadow-brand-500/20"
                      onClick={() => window.open(`/incidentes/${selected.id}`, '_blank')}
                    >
                      Ver Registro Completo
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6 border border-slate-100 dark:border-slate-800/50">
                  {modoCalor ? <Flame size={40} /> : <MapIcon size={40} />}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                  {modoCalor ? 'Vista de Intensidad' : 'Exploración de Mapa'}
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[200px]">
                  {modoCalor ? 'El mapa de calor muestra la densidad de reportes según su prioridad operativa.' : 'Seleccione un marcador en el mapa para visualizar los detalles del reporte.'}
                </p>
                {modoCalor && (
                  <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50 text-left">
                    <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400">
                      <Info size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Información</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
                      Los puntos más brillantes indican una mayor concentración de incidentes críticos o de alta prioridad.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
