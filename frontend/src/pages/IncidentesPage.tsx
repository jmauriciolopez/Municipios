import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidentes, createIncidente } from '@shared/services/incidentes.api';
import { apiFetch } from '../services/apiFetch';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { reverseGeocode } from '../services/geocoding';
import { confirm } from '../components/ui/ConfirmDialog';
import { CategoriaIcon } from '../components/ui/iconMap';
import Modal from '../components/ui/Modal';
import { 
  Plus, 
  MapPin, 
  Activity, 
  FileText, 
  Shield, 
  List,
  Search,
  Map as MapIcon,
  Filter,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Layout,
  Clock
} from 'lucide-react';

type IncidenteRow = {
  id: string; 
  tipo: string; 
  estado: string; 
  prioridad: string;
  area: string; 
  areaId: string; 
  fecha: string; 
  direccion: string;
  categoriaId: string; 
  categoriaCodigo: string; 
  categoriaColor: string;
};

type AreaOpt = { id: string; nombre: string };
type CatOpt = { id: string; nombre: string; codigo: string; color: string; padreId: string };

const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];
const ESTADOS_INC = ['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'];
const CORRIENTES: [number, number] = [-27.46, -58.83];
const FORM_EMPTY = { 
  tipo: '', 
  descripcion: '', 
  prioridad: 'media', 
  estado: 'abierto', 
  lat: '', 
  lng: '', 
  direccion: '', 
  area_id: '', 
  riesgo_id: '', 
  categoria_id: '', 
  reportado_por: '' 
};

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function IncidentesPage() {
  const navigate = useNavigate();
  const [incidentes, setIncidentes] = useState<IncidenteRow[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
  const [riesgos, setRiesgos] = useState<{ id: string; nombre: string }[]>([]);
  const [categorias, setCategorias] = useState<CatOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState('');
  const [prioridad, setPrioridad] = useState('');
  const [area, setArea] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [modal, setModal] = useState(false);
  const [modalMapa, setModalMapa] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [geocodificando, setGeocodificando] = useState(false);
  const [form, setForm] = useState(FORM_EMPTY);
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);

  const cargar = () =>
    getIncidentes()
      .then((data: any[]) =>
        setIncidentes(data.map((i) => ({
          id: i.id, tipo: i.tipo, estado: i.estado, prioridad: i.prioridad,
          area: i.area?.nombre ?? '', areaId: i.area?.id ?? i.areaId ?? '',
          fecha: (i.fechaReporte ?? i.fecha_reporte ?? '').slice(0, 10),
          direccion: i.direccion ?? 'N/A',
          categoriaId: i.categoria?.id ?? '',
          categoriaCodigo: i.categoria?.codigo ?? '',
          categoriaColor: i.categoria?.color ?? '',
        })))
      )
      .catch(() => setError('No se pudieron cargar los incidentes.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    apiFetch<any[]>('/areas').then((data) => setAreas(data.map((a) => ({ id: a.id, nombre: a.nombre })))).catch(() => {});
    apiFetch<any[]>('/riesgos').then((data) => setRiesgos(data.map((r: any) => ({ id: r.id, nombre: r.nombre })))).catch(() => {});
    apiFetch<any[]>('/categorias?activo=true').then((data) => setCategorias(data.map((c: any) => ({ id: c.id, nombre: c.nombre, codigo: c.codigo, color: c.color ?? '', padreId: c.padre?.id ?? '' })))).catch(() => {});
  }, []);

  const areasUnicas = useMemo(
    () => [...new Map(incidentes.filter((i) => i.area).map((i) => [i.areaId, i.area])).entries()],
    [incidentes]
  );

  const filtered = useMemo(
    () => incidentes.filter((i) => {
      if (estado && i.estado !== estado) return false;
      if (prioridad && i.prioridad !== prioridad) return false;
      if (area && i.areaId !== area) return false;
      if (desde && i.fecha < desde) return false;
      if (hasta && i.fecha > hasta) return false;
      return true;
    }),
    [incidentes, estado, prioridad, area, desde, hasta]
  );

  const handleGeocodificar = async () => {
    if (!form.direccion.trim()) return;
    setGeocodificando(true);
    try {
      const q = encodeURIComponent(`${form.direccion}, Corrientes, Argentina`);
      const viewbox = '-59.0,-27.7,-58.5,-27.2';
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ar&viewbox=${viewbox}&bounded=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setForm((f) => ({ ...f, lat: Number(data[0].lat).toFixed(6), lng: Number(data[0].lon).toFixed(6) }));
      } else {
        const res2 = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ar`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data2 = await res2.json();
        if (data2.length > 0) {
          setForm((f) => ({ ...f, lat: Number(data2[0].lat).toFixed(6), lng: Number(data2[0].lon).toFixed(6) }));
        } else {
          const usar = await confirm({ message: 'No se encontró la dirección. ¿Querés elegir la ubicación en el mapa?', confirmLabel: 'Abrir mapa' });
          if (usar) abrirMapaPicker();
        }
      }
    } catch {
      toast.error('Error al geocodificar. Verificá tu conexión.');
    } finally {
      setGeocodificando(false);
    }
  };

  const abrirMapaPicker = () => {
    setPinPos(form.lat && form.lng ? [Number(form.lat), Number(form.lng)] : CORRIENTES);
    setModalMapa(true);
  };

  const confirmarPinMapa = async () => {
    if (!pinPos) return;
    const direccion = await reverseGeocode(pinPos[0], pinPos[1]);
    setForm((f: any) => ({ ...f, lat: pinPos[0].toFixed(6), lng: pinPos[1].toFixed(6), ...(direccion ? { direccion } : {}) }));
    setModalMapa(false);
  };

  const handleGuardar = async () => {
    if (!form.tipo || !form.area_id || !form.lat || !form.lng) {
      toast.error('Tipo, área y coordenadas son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await createIncidente({
        tipo: form.tipo, 
        descripcion: form.descripcion,
        estado: form.estado as any, 
        prioridad: form.prioridad as any,
        lat: Number(form.lat), 
        lng: Number(form.lng),
        direccion: form.direccion || undefined,
        area_id: form.area_id,
        riesgo_id: form.riesgo_id || undefined,
        categoria_id: (form as any).categoria_id || undefined,
        reportado_por: form.reportado_por || undefined,
      } as any);
      setModal(false);
      setForm(FORM_EMPTY);
      setLoading(true);
      cargar();
      toast.success('Incidente registrado correctamente');
    } catch {
      toast.error('Error al crear el incidente.');
    } finally {
      setGuardando(false);
    }
  };

  const columns = [
    {
      key: 'incidente',
      label: 'Incidente / Suceso',
      render: (i: IncidenteRow) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors border border-slate-100">
            {i.categoriaCodigo ? (
              <CategoriaIcon codigo={i.categoriaCodigo} size={18} color={i.categoriaColor || '#64748b'} />
            ) : (
              <Activity size={18} />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-700 leading-none mb-1 capitalize text-wrap">{i.tipo}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 line-clamp-1">
               <MapPin size={10} className="text-rose-400" />
               {i.direccion}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estatus',
      render: (i: IncidenteRow) => <StatusBadge status={i.estado} />
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      render: (i: IncidenteRow) => <StatusBadge status={i.prioridad} />
    },
    {
      key: 'area',
      label: 'Área Responsable',
      render: (i: IncidenteRow) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-600">{i.area || 'Sin Área'}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Dependencia</span>
        </div>
      )
    },
    {
      key: 'fecha',
      label: 'Cronología',
      render: (i: IncidenteRow) => (
        <div className="flex items-center gap-2">
           <Calendar size={12} className="text-slate-300" />
           <span className="text-xs font-mono font-bold text-slate-500">{i.fecha}</span>
        </div>
      )
    },
    {
      key: 'acciones',
      label: '',
      render: () => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
             <ChevronRight size={18} />
           </div>
        </div>
      )
    }
  ];

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;
  if (error) return <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100 font-bold">{error}</div>;

  return (
    <div className="space-y-6">
      <header className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Reporte de Incidentes</h1>
            <p className="text-xs font-bold text-indigo-600/70 uppercase tracking-widest mt-0.5">Gestión de Eventos y Reclamos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="btn-secondary flex-1 md:flex-none justify-center gap-2 h-12 px-6" onClick={() => navigate('/mapa')}>
            <MapIcon size={18} />
            Ver Mapa Global
          </button>
          <button className="btn-primary flex-1 md:flex-none justify-center gap-2 h-12 px-8 shadow-lg shadow-brand-200" onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>
            <Plus size={20} />
            Nuevo Reporte
          </button>
        </div>
      </header>

      <FilterBar
        filters={[
          { key: 'estado', label: 'Estado', value: estado, type: 'select', options: ESTADOS_INC.map((e) => ({ value: e, label: e.replace('_', ' ') })) },
          { key: 'prioridad', label: 'Prioridad', value: prioridad, type: 'select', options: PRIORIDADES.map((p) => ({ value: p, label: p })) },
          { key: 'area', label: 'Área', value: area, type: 'select', options: areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre })) },
          { key: 'desde', label: 'Desde', value: desde, type: 'date' },
          { key: 'hasta', label: 'Hasta', value: hasta, type: 'date' },
        ]}
        onChange={(key, value) => {
          if (key === 'estado') setEstado(String(value));
          if (key === 'prioridad') setPrioridad(String(value));
          if (key === 'area') setArea(String(value));
          if (key === 'desde') setDesde(String(value));
          if (key === 'hasta') setHasta(String(value));
        }}
        onReset={() => { setEstado(''); setPrioridad(''); setArea(''); setDesde(''); setHasta(''); }}
      />

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <DataTable
          data={filtered} 
          columns={columns}
          onRowClick={(i) => navigate(`/incidentes/${i.id}`)}
          emptyMessage="No se encontraron incidentes registrados"
        />
      </div>

      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Registro de Nuevo Incidente"
        subtitle="Carga de reporte técnico con geolocalización"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-10 py-2">
          {/* SECCIÓN 1: IDENTIFICACIÓN */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                 <Activity size={20} />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Clasificación Básica</h4>
                 <div className="h-px bg-gradient-to-r from-indigo-200 to-transparent w-full" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Nombre / Tipo del Suceso *</label>
                <input 
                  className="input-premium h-12 text-sm font-bold" 
                  value={form.tipo} 
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })} 
                  placeholder="Ej: Bacheo, Luminaria s/ funcionar..." 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Área Ejecutora *</label>
                <select 
                  className="input-premium h-12 text-sm font-bold" 
                  value={form.area_id} 
                  onChange={(e) => setForm({ ...form, area_id: e.target.value })}
                >
                  <option value="">Seleccionar área responsable...</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Categoría de Servicio</label>
                <select 
                  className="input-premium h-12 text-sm font-bold border-indigo-100" 
                  value={form.categoria_id} 
                  onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
                >
                  <option value="">Sin categoría específica</option>
                  {categorias.filter(c => !c.padreId).map((padre) => (
                    <optgroup key={padre.id} label={padre.nombre.toUpperCase()}>
                      {categorias.filter(c => c.padreId === padre.id).map((h) => (
                        <option key={h.id} value={h.id}>{h.nombre}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Urgencia</label>
                    <select 
                      className="input-premium h-12 text-xs font-black uppercase tracking-tighter" 
                      value={form.prioridad} 
                      onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                    >
                      {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Estado</label>
                    <select 
                      className="input-premium h-12 text-xs font-black uppercase tracking-tighter" 
                      value={form.estado} 
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    >
                      {ESTADOS_INC.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                    </select>
                 </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: LOCALIZACIÓN */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm">
                 <MapPin size={20} />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Punto Exacto de Intervención</h4>
                 <div className="h-px bg-gradient-to-r from-rose-200 to-transparent w-full" />
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Dirección o Punto de Referencia *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      className="input-premium h-12 pl-12 font-bold"
                      value={form.direccion}
                      onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleGeocodificar()}
                      placeholder="Calle y Nro, o intersección aproximada..."
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50"><MapPin size={18} /></div>
                  </div>
                  <button 
                    type="button" 
                    className="px-5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    onClick={handleGeocodificar} 
                    disabled={geocodificando || !form.direccion.trim()}
                  >
                    {geocodificando ? <div className="w-4 h-4 border-2 border-slate-300 border-t-brand-600 rounded-full animate-spin" /> : <Search size={14} />}
                    Validar
                  </button>
                  <button 
                    type="button" 
                    className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 flex items-center justify-center hover:bg-indigo-100 shadow-sm shadow-indigo-100/50 transition-all active:scale-90"
                    onClick={abrirMapaPicker} 
                  >
                    <MapIcon size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 block pl-1">Latitud Sistema</label>
                  <div className="text-xs font-mono font-bold text-slate-500 pl-1">{form.lat || '0.000000'}</div>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1 block pl-1">Longitud Sistema</label>
                  <div className="text-xs font-mono font-bold text-slate-500 pl-1">{form.lng || '0.000000'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: DESCRIPCIÓN */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
                 <FileText size={20} />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Ampliación del Reporte</h4>
                 <div className="h-px bg-gradient-to-r from-amber-200 to-transparent w-full" />
               </div>
            </div>
            <div className="flex flex-col gap-2">
              <textarea 
                className="input-premium min-h-[120px] py-4 text-sm leading-relaxed" 
                value={form.descripcion} 
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
                placeholder="Detalle aquí cualquier dato adicional relevante para los operarios: dimensiones del daño, obstáculos, riesgos especiales..." 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
             <button className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors uppercase tracking-widest" onClick={() => setModal(false)}>
               Descartar
             </button>
             <button 
               className="flex-[2] py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-brand-100 uppercase tracking-[0.1em] flex items-center justify-center gap-2 active:scale-95 disabled:grayscale"
               onClick={handleGuardar} 
               disabled={guardando}
             >
               {guardando ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Activity size={18} />}
               Registrar Reporte Técnico
             </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalMapa}
        onClose={() => setModalMapa(false)}
        title="Ubicación Georreferenciada"
        subtitle="Hacé clic sobre el mapa para confirmar la posición del evento"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border-4 border-white shadow-2xl shadow-indigo-100/50">
            <MapContainer center={pinPos || CORRIENTES} zoom={14} style={{ height: '400px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <ClickHandler onPick={(lat, lng) => setPinPos([lat, lng])} />
              {pinPos && <Marker position={pinPos} icon={L.divIcon({ className: '', html: '<div class="w-6 h-6 bg-brand-600 border-2 border-white rounded-full shadow-lg ring-4 ring-brand-500/20 active:scale-90 transition-transform"></div>', iconSize: [24, 24], iconAnchor: [12, 12] })} />}
            </MapContainer>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex gap-6">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Latitud</p>
                <p className="text-xs font-mono font-bold text-slate-600 p-2 bg-slate-50 rounded-lg">{pinPos?.[0].toFixed(6) || '—'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Longitud</p>
                <p className="text-xs font-mono font-bold text-slate-600 p-2 bg-slate-50 rounded-lg">{pinPos?.[1].toFixed(6) || '—'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest" onClick={() => setModalMapa(false)}>Cerrar</button>
              <button className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-brand-100 uppercase tracking-widest" onClick={confirmarPinMapa}>
                Aceptar Posición
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
