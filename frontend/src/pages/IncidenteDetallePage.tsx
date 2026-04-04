import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIncidente, updateIncidente } from '@shared/services/incidentes.api';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import StatusBadge from '../components/ui/StatusBadge';
import EvidenciasPanel from '../components/ui/EvidenciasPanel';
import Modal from '../components/ui/Modal';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { confirm } from '../components/ui/ConfirmDialog';
import { reverseGeocode } from '../services/geocoding';
import { CategoriaIcon } from '../components/ui/iconMap';
import { 
  ChevronLeft, 
  Edit3, 
  PlusCircle, 
  MapPin, 
  Search, 
  Map as MapIcon, 
  Clock, 
  AlertCircle,
  FileText,
  Activity,
  History,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Layout,
  Tag,
  Briefcase
} from 'lucide-react';

const ESTADOS = ['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'];
const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];
const CORRIENTES: [number, number] = [-27.46, -58.83];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function IncidenteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incidente, setIncidente] = useState<any>(null);
  const [areas, setAreas] = useState<any[]>([]);
  const [riesgos, setRiesgos] = useState<{ id: string; nombre: string }[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalMapa, setModalMapa] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [geocodificando, setGeocodificando] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getIncidente(id), apiFetch<any[]>('/areas'), apiFetch<any[]>('/riesgos'), apiFetch<any[]>('/categorias?activo=true')])
      .then(([inc, areasData, riesgosData, catsData]) => {
        setIncidente(inc);
        setAreas(areasData);
        setRiesgos(riesgosData.map((r: any) => ({ id: r.id, nombre: r.nombre })));
        setCategorias(catsData);
      })
      .catch(() => setError('No se pudo cargar el incidente.'))
      .finally(() => setLoading(false));
  }, [id]);

  const abrirEditar = () => {
    setForm({
      tipo: incidente.tipo ?? '',
      descripcion: incidente.descripcion ?? '',
      prioridad: incidente.prioridad ?? 'media',
      estado: incidente.estado ?? 'abierto',
      direccion: incidente.direccion ?? '',
      lat: incidente.lat ? String(incidente.lat) : '',
      lng: incidente.lng ? String(incidente.lng) : '',
      area_id: incidente.area?.id ?? '',
      riesgo_id: incidente.riesgo?.id ?? '',
      categoria_id: incidente.categoria?.id ?? '',
    });
    setModalEditar(true);
  };

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
        setForm((f: any) => ({ ...f, lat: Number(data[0].lat).toFixed(6), lng: Number(data[0].lon).toFixed(6) }));
      } else {
        const res2 = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ar`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data2 = await res2.json();
        if (data2.length > 0) {
          setForm((f: any) => ({ ...f, lat: Number(data2[0].lat).toFixed(6), lng: Number(data2[0].lon).toFixed(6) }));
        } else {
          const usar = await confirm({ message: 'No se encontró la dirección. ¿Querés elegir la ubicación en el mapa?', confirmLabel: 'Abrir mapa' });
          if (usar) abrirMapaPicker();
        }
      }
    } catch {
      toast.error('Error al geocodificar.');
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

  const handleGuardarEdicion = async () => {
    if (!id || !form.tipo || !form.lat || !form.lng) {
      toast.error('Tipo y coordenadas son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      const updated = await updateIncidente(id, {
        tipo: form.tipo,
        descripcion: form.descripcion || undefined,
        prioridad: form.prioridad,
        estado: form.estado,
        direccion: form.direccion || undefined,
        lat: Number(form.lat),
        lng: Number(form.lng),
        area_id: form.area_id || undefined,
        riesgo_id: form.riesgo_id || undefined,
        categoria_id: form.categoria_id || undefined,
      } as any);
      setIncidente((prev: any) => ({ ...prev, ...updated }));
      setModalEditar(false);
      toast.success('Detalles del incidente actualizados.');
    } catch {
      toast.error('Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!id) return;
    setCambiandoEstado(true);
    try {
      const updated = await updateIncidente(id, { estado: nuevoEstado as any });
      setIncidente((prev: any) => ({ ...prev, estado: (updated as any).estado ?? nuevoEstado }));
      toast.success(`Estado actualizado a ${nuevoEstado.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Error al cambiar el estado.');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleGenerarOrden = async () => {
    if (!id) return;
    setGenerando(true);
    try {
      const orden = await apiFetch<any>(`/incidentes/${id}/convertir-a-orden`, { method: 'POST' });
      toast.success('Orden de trabajo generada con éxito');
      navigate(`/ordenes/${orden.id}`);
    } catch {
      toast.error('Error al generar la orden de trabajo.');
    } finally {
      setGenerando(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div></div>;
  if (error || !incidente) return <div className="bg-rose-50 text-rose-600 p-8 rounded-3xl border border-rose-100 font-bold m-6">{error ?? 'Incidente no encontrado'}</div>;

  const fecha = (incidente.fechaReporte ?? incidente.fecha_reporte ?? '').slice(0, 10);
  const area = incidente.area?.nombre ?? '';
  const ordenId = incidente.orden?.id;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      <header className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shadow-sm active:scale-90" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
              {incidente.categoria ? (
                <CategoriaIcon codigo={incidente.categoria.codigo} size={32} color={incidente.categoria.color || '#4f46e5'} />
              ) : (
                <Activity size={32} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{incidente.tipo}</h2>
                <StatusBadge status={incidente.estado} size="large" />
              </div>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand-400" /> {fecha}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="text-brand-600/80">{area || 'Sin Área Asignada'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="btn-secondary h-12 px-6 flex-1 md:flex-none justify-center gap-2" onClick={abrirEditar}>
            <Edit3 size={18} />
            <span className="uppercase text-xs font-black tracking-widest">Editar Reporte</span>
          </button>
          {incidente.estado === 'abierto' && !ordenId && (
            <button className="btn-primary h-12 px-8 flex-1 md:flex-none justify-center gap-2 shadow-lg shadow-brand-100" onClick={handleGenerarOrden} disabled={generando}>
              {generando ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <PlusCircle size={20} />}
              <span className="uppercase text-xs font-black tracking-widest">Generar OT</span>
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 border border-indigo-100 shadow-sm">
                 <FileText size={20} />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Información de Campo</h4>
                 <div className="h-px bg-gradient-to-r from-indigo-200 to-transparent w-full" />
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Estado de Intervención</label>
                <div className="relative group">
                  <select
                    value={incidente.estado}
                    disabled={cambiandoEstado}
                    onChange={(e) => handleCambiarEstado(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 h-12 px-4 rounded-xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-brand-500/20 focus:text-brand-600 focus:bg-white transition-all appearance-none cursor-pointer group-hover:border-brand-200"
                  >
                    {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ').toUpperCase()}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-brand-500">
                    {cambiandoEstado ? <div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /> : <ChevronLeft size={16} className="-rotate-90" />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Nivel de Prioridad</label>
                <div className="h-12 bg-slate-50 border border-slate-100 px-4 rounded-xl flex items-center shadow-inner">
                   <StatusBadge status={incidente.prioridad} size="large" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Gravedad / Riesgo</label>
                <div className="h-12 bg-rose-50/30 border border-rose-100/50 px-4 rounded-xl flex items-center gap-3">
                  <ShieldAlert size={16} className="text-rose-500" />
                  <span className="text-sm font-bold text-slate-700">{incidente.riesgo?.nombre ?? 'Normal / Sin Riesgo'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Orden de Trabajo Vinculada</label>
                <div className="h-12 flex items-center">
                  {ordenId ? (
                     <button className="flex items-center justify-between w-full px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-100 hover:bg-emerald-100 transition-all group active:scale-95 shadow-sm" onClick={() => navigate(`/ordenes/${ordenId}`)}>
                       <div className="flex items-center gap-2">
                         <Layout size={14} />
                         OT-#{ordenId.slice(-6).toUpperCase()}
                       </div>
                       <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center">
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Pendiente de Conversión</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-2 mt-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Descripción del Reporte</label>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 leading-relaxed italic relative">
                  <FileText className="absolute top-4 right-4 text-slate-200" size={32} />
                  "{incidente.descripcion || 'Sin descripción adicional para este reporte técnico.'}"
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                 <Tag size={20} />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Evidencia Documental</h4>
                 <div className="h-px bg-gradient-to-r from-amber-200 to-transparent w-full" />
               </div>
            </div>
             <EvidenciasPanel entidadTipo="incidente" entidadId={id!} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 shadow-sm">
                 <MapPin size={20} />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Localización</h4>
                 <div className="h-px bg-gradient-to-r from-rose-200 to-transparent w-full" />
               </div>
            </div>
            
            <div className="space-y-5">
              <div className="p-4 bg-rose-50/20 rounded-2xl border border-rose-100/50 flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                   <TrendingUp size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-rose-400 tracking-widest mb-1 leading-none">Punto de Intervención</p>
                  <p className="text-xs font-bold text-slate-700 leading-tight">{incidente.direccion || 'Sin dirección específica'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center flex flex-col gap-1 shadow-inner">
                   <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em] leading-none">Latitud</p>
                   <p className="text-[11px] font-mono font-bold text-slate-500">{incidente.lat}</p>
                </div>
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center flex flex-col gap-1 shadow-inner">
                   <p className="text-[9px] uppercase font-black text-slate-300 tracking-[0.2em] leading-none">Longitud</p>
                   <p className="text-[11px] font-mono font-bold text-slate-500">{incidente.lng}</p>
                </div>
              </div>
              
              <div className="group relative">
                <div className="h-64 w-full rounded-2xl border-4 border-white shadow-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 cursor-zoom-in" onClick={abrirMapaPicker}>
                  <MapContainer center={[incidente.lat, incidente.lng]} zoom={15} zoomControl={false} scrollWheelZoom={false} dragging={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[incidente.lat, incidente.lng]} icon={L.divIcon({ className: '', html: '<div class="w-4 h-4 bg-brand-600 border-2 border-white rounded-full shadow-lg pulse-brand"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })} />
                  </MapContainer>
                </div>
                <div className="absolute inset-0 bg-brand-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl flex items-center justify-center">
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] font-black text-brand-600 uppercase tracking-widest shadow-lg">Abrir Selector</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 overflow-hidden relative group">
            <Activity className="absolute -right-8 -bottom-8 text-slate-800 scale-150 rotate-12 opacity-50 group-hover:scale-[2] transition-transform duration-1000" size={160} />
            <div className="relative z-10 space-y-4">
              <h4 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <History size={16} className="text-brand-400" />
                 Línea de Tiempo
              </h4>
              <div className="space-y-4 pt-2">
                 <div className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0 ring-4 ring-brand-500/20"></div>
                    <div>
                       <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-0.5">Detectado y Reportado</p>
                       <p className="text-xs font-bold text-slate-300">{fecha}</p>
                    </div>
                 </div>
                 {ordenId && (
                   <div className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 ring-4 ring-emerald-500/20"></div>
                      <div>
                         <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Asignado a Operativa</p>
                         <p className="text-xs font-bold text-slate-300">OT activa vinculada</p>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={modalEditar} 
        onClose={() => setModalEditar(false)} 
        title="Modificar Detalles"
        subtitle="Actualización de datos técnicos del incidente"
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
          <div className="flex flex-col gap-2.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Nombre / Tipo del Suceso *</label>
            <div className="relative">
              <input className="input-premium pl-12 h-14 font-bold text-sm" value={form?.tipo || ''} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Ej: Bacheo Urgente" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Activity size={18} /></div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Área de Responsabilidad</label>
            <div className="relative">
              <select className="input-premium pl-12 h-14 font-bold text-sm" value={form?.area_id || ''} onChange={(e) => setForm({ ...form, area_id: e.target.value })}>
                <option value="">Sin área específica</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre.toUpperCase()}</option>)}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Briefcase size={18} /></div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Categoría Técnica</label>
            <div className="relative">
              <select className="input-premium pl-12 h-14 font-bold text-sm" value={form?.categoria_id || ''} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                <option value="">Sin categoría</option>
                {categorias.filter((c: any) => !c.padre).map((padre: any) => (
                  <optgroup key={padre.id} label={padre.nombre.toUpperCase()}>
                    {categorias.filter((c: any) => c.padre?.id === padre.id).map((h: any) => (
                      <option key={h.id} value={h.id}>{h.nombre}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Tag size={18} /></div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Nivel de Alerta</label>
            <div className="relative">
              <select className="input-premium pl-12 h-14 font-black uppercase tracking-tighter text-xs" value={form?.prioridad || 'media'} onChange={(e) => setForm({ ...form, prioridad: e.target.value })}>
                {PRIORIDADES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><AlertCircle size={18} /></div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Estado de Avance</label>
            <div className="relative">
              <select className="input-premium pl-12 h-14 font-black uppercase tracking-tighter text-xs" value={form?.estado || 'abierto'} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ').toUpperCase()}</option>)}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><TrendingUp size={18} /></div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 md:col-span-2 mt-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Geolocalización / Dirección *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                 <input className="input-premium h-14 pl-12 font-bold" value={form?.direccion || ''} onChange={(e) => setForm({ ...form, direccion: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleGeocodificar()} placeholder="Calle 123..." />
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400"><MapPin size={18} /></div>
              </div>
              <button type="button" className="px-5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center gap-2 text-brand-600 shadow-sm active:scale-95 disabled:opacity-50" onClick={handleGeocodificar} disabled={geocodificando || !form?.direccion?.trim()}>
                {geocodificando ? <div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" /> : <Search size={14} />}
                VALIDAR
              </button>
              <button type="button" className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-2xl text-brand-600 flex items-center justify-center hover:bg-brand-100 shadow-sm transition-all active:scale-90" onClick={abrirMapaPicker}>
                <MapIcon size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 md:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Notas del Reporte</label>
            <textarea className="input-premium min-h-[120px] py-4 text-sm font-medium leading-relaxed" rows={3} value={form?.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalles operativos..." />
          </div>

          <div className="md:col-span-2 flex gap-4 pt-6 border-t border-slate-100 mt-4">
            <button className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setModalEditar(false)}>Descartar Cambios</button>
            <button className="flex-[2] py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-brand-100 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:grayscale" onClick={handleGuardarEdicion} disabled={guardando}>
              {guardando ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Edit3 size={18} />}
              Guardar Actualización
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={modalMapa} 
        onClose={() => setModalMapa(false)} 
        title="Ubicación Georreferenciada"
        subtitle="Hacé clic sobre el mapa para confirmar la nueva posición"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          <div className="rounded-3xl border-4 border-white shadow-2xl overflow-hidden">
            <MapContainer center={pinPos || CORRIENTES} zoom={14} style={{ height: '420px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <ClickHandler onPick={(lat, lng) => setPinPos([lat, lng])} />
              {pinPos && <Marker position={pinPos} icon={L.divIcon({ className: '', html: '<div class="w-6 h-6 bg-rose-500 border-2 border-white rounded-full shadow-lg pulse-rose"></div>', iconSize: [24, 24], iconAnchor: [12, 12] })} />}
            </MapContainer>
          </div>
          
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
             <div className="flex gap-6">
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">Latitud</p>
                  <p className="text-xs font-mono font-bold text-slate-500">{pinPos?.[0].toFixed(6)}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">Longitud</p>
                  <p className="text-xs font-mono font-bold text-slate-500">{pinPos?.[1].toFixed(6)}</p>
                </div>
             </div>
             <div className="flex gap-4">
               <button className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400" onClick={() => setModalMapa(false)}>SALIR</button>
               <button className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-100 active:scale-95 transition-all" onClick={confirmarPinMapa}>
                 CONFIRMAR
               </button>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
