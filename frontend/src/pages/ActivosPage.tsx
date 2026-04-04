import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivos, createActivo, updateActivo } from '@shared/services/activos.api';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { reverseGeocode } from '../services/geocoding';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';
import { RiesgoIcon } from '../components/ui/iconMap';
import Modal from '../components/ui/Modal';
import { 
  Activity, 
  MapPin, 
  Layers, 
  Shield, 
  Box, 
  Settings, 
  Navigation, 
  FileText, 
  CheckCircle, 
  Calendar, 
  AlertTriangle, 
  Edit3, 
  ExternalLink,
  ChevronRight,
  Search,
  X,
  Info,
  Maximize2,
  Plus,
  Code
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type ActivoRow = {
  id: string; codigo: string; nombre: string; estado: string;
  tipo: string; tipoId: string; area: string; areaId: string;
  direccion: string; lat: string; lng: string;
};

type FormActivo = {
  codigo: string; nombre: string; tipoActivoId: string; areaResponsableId: string;
  estado: string; lat: string; lng: string; direccion: string;
};

const FORM_EMPTY: FormActivo = { codigo: '', nombre: '', tipoActivoId: '', areaResponsableId: '', estado: 'operativo', lat: '', lng: '', direccion: '' };
const ESTADOS_ACTIVO = ['operativo', 'en_mantenimiento', 'fuera_servicio', 'dado_de_baja'];
const CORRIENTES: [number, number] = [-27.46, -58.83];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function ActivosPage() {
  const navigate = useNavigate();
  const [activos, setActivos] = useState<ActivoRow[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState('');
  const [tipo, setTipo] = useState('');
  const [area, setArea] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [tab, setTab] = useState<'info' | 'incidentes' | 'riesgos'>('info');
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [modalMapa, setModalMapa] = useState(false);
  const [form, setForm] = useState<FormActivo>(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);
  const [cambiando, setCambiando] = useState<string | null>(null);
  const [pinPos, setPinPos] = useState<[number, number] | null>(null);
  const [geocodificando, setGeocodificando] = useState(false);

  const cargar = () =>
    getActivos()
      .then((data: any[]) => setActivos(data.map((a) => ({
        id: a.id, codigo: a.codigo, nombre: a.nombre, estado: a.estado,
        tipo: a.tipoActivo?.nombre ?? '', tipoId: a.tipoActivo?.id ?? '',
        area: a.areaResponsable?.nombre ?? '', areaId: a.areaResponsable?.id ?? '',
        direccion: a.direccion ?? 'N/A',
        lat: a.lat?.toString() ?? '', lng: a.lng?.toString() ?? '',
      }))))
      .catch(() => setError('No se pudieron cargar los activos.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    Promise.all([
      apiFetch<any[]>('/areas').catch(() => []),
      apiFetch<any[]>('/tipos-activo').catch(() => []),
    ]).then(([a, t]) => { setAreas(a ?? []); setTipos(t ?? []); });
  }, []);

  const handleSelectRow = async (row: ActivoRow) => {
    setTab('info');
    setLoadingDetail(true);
    try {
      const detail = await apiFetch<any>(`/activos/${row.id}`);
      setSelected(detail);
    } catch {
      setSelected(row);
    } finally {
      setLoadingDetail(false);
    }
  };

  const tiposUnicos = useMemo(() => [...new Map(activos.filter((a) => a.tipo).map((a) => [a.tipoId, a.tipo])).entries()], [activos]);
  const areasUnicas = useMemo(() => [...new Map(activos.filter((a) => a.area).map((a) => [a.areaId, a.area])).entries()], [activos]);

  const filtered = useMemo(
    () => activos.filter((a) => {
      if (estado && a.estado !== estado) return false;
      if (tipo && a.tipoId !== tipo) return false;
      if (area && a.areaId !== area) return false;
      return true;
    }),
    [activos, estado, tipo, area]
  );

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    setCambiando(id);
    try {
      await updateActivo(id, { estado: nuevoEstado as any });
      setActivos((prev) => prev.map((a) => a.id === id ? { ...a, estado: nuevoEstado } : a));
      if (selected?.id === id) setSelected((s: any) => s ? { ...s, estado: nuevoEstado } : s);
    } catch { toast.error('Error al cambiar el estado.'); }
    finally { setCambiando(null); }
  };

  const abrirCrear = () => { setForm(FORM_EMPTY); setModal('crear'); };
  const abrirEditar = () => {
    if (!selected) return;
    setForm({
      codigo: selected.codigo ?? '',
      nombre: selected.nombre ?? '',
      tipoActivoId: selected.tipoActivo?.id ?? selected.tipoActivoId ?? '',
      areaResponsableId: selected.areaResponsable?.id ?? selected.areaResponsableId ?? '',
      estado: selected.estado ?? 'operativo',
      lat: selected.lat?.toString() ?? '',
      lng: selected.lng?.toString() ?? '',
      direccion: selected.direccion ?? '',
    });
    setModal('editar');
  };

  const handleGeocodificar = async () => {
    if (!form.direccion.trim()) return;
    setGeocodificando(true);
    try {
      const q = encodeURIComponent(`${form.direccion}, Corrientes, Argentina`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=ar&viewbox=-59.0,-27.7,-58.5,-27.2&bounded=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setForm((f) => ({ ...f, lat: Number(data[0].lat).toFixed(6), lng: Number(data[0].lon).toFixed(6) }));
      } else {
        toast.error('No se encontró la dirección.');
      }
    } catch { toast.error('Error al geocodificar.'); }
    finally { setGeocodificando(false); }
  };

  const abrirMapaPicker = () => {
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    const enCorrientes = lat >= -27.7 && lat <= -27.2 && lng >= -59.0 && lng <= -58.5;
    setPinPos(enCorrientes ? [lat, lng] : CORRIENTES);
    setModalMapa(true);
  };

  const confirmarPin = async () => {
    if (!pinPos) return;
    const dir = await reverseGeocode(pinPos[0], pinPos[1]);
    setForm((f) => ({ ...f, lat: pinPos[0].toFixed(6), lng: pinPos[1].toFixed(6), ...(dir ? { direccion: dir } : {}) }));
    setModalMapa(false);
  };

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre || !form.tipoActivoId) { toast.error('Código, nombre y tipo son obligatorios.'); return; }
    setGuardando(true);
    try {
      const payload: any = {
        codigo: form.codigo, nombre: form.nombre,
        tipoActivoId: form.tipoActivoId,
        areaResponsableId: form.areaResponsableId || undefined,
        estado: form.estado as any,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        direccion: form.direccion || undefined,
      };
      if (modal === 'crear') {
        await createActivo(payload);
        toast.success('Activo creado.');
      } else if (modal === 'editar' && selected) {
        const updated = await updateActivo(selected.id, payload);
        setSelected((s: any) => ({ ...s, ...updated }));
        toast.success('Activo actualizado.');
      }
      setModal(null);
      setForm(FORM_EMPTY);
      setLoading(true);
      cargar();
    } catch { toast.error('Error al guardar el activo.'); }
    finally { setGuardando(false); }
  };

  const handleGenerarIncidente = () => {
    if (!selected) return;
    navigate(`/incidentes?activo_id=${selected.id}&activo_nombre=${encodeURIComponent(selected.nombre)}`);
  };

  const columns = [
    { 
      key: 'codigo', 
      label: 'Código', 
      render: (a: ActivoRow) => (
        <span className="font-mono text-[11px] font-black tracking-widest text-slate-500 uppercase">
          {a.codigo}
        </span>
      )
    },
    { 
      key: 'nombre', 
      label: 'Denominación', 
      render: (a: ActivoRow) => (
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {a.nombre}
        </span>
      )
    },
    {
      key: 'estado', 
      label: 'Operatividad',
      render: (a: ActivoRow) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={a.estado} />
          <select
            value={a.estado} 
            disabled={cambiando === a.id}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleCambiarEstado(a.id, e.target.value)}
            className="text-[10px] py-0.5 px-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-brand-500 transition-colors font-bold uppercase tracking-tighter"
          >
            {ESTADOS_ACTIVO.map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      ),
    },
    { 
      key: 'tipo', 
      label: 'Taxonomía',
      render: (a: ActivoRow) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Box size={14} className="opacity-40" />
          <span className="text-xs font-semibold">{a.tipo}</span>
        </div>
      )
    },
    { 
      key: 'area', 
      label: 'Área Responsable',
      render: (a: ActivoRow) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Shield size={14} className="opacity-40" />
          <span className="text-xs font-semibold">{a.area}</span>
        </div>
      )
    },
  ];

  if (loading) return <div className="loading-state">Cargando activos...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="flex gap-8 items-start h-full">
      <section className="flex-1 min-w-0 flex flex-col gap-6 h-full">
        <header className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gestión de Activos</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Inventario Maestro Municipal</p>
          </div>
          <button 
            onClick={abrirCrear}
            className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Registrar Activo
          </button>
        </header>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="p-4 border-bottom border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <FilterBar
              filters={[
                { key: 'estado', label: 'Estado Operativo', value: estado, type: 'select', options: ESTADOS_ACTIVO.map((e) => ({ value: e, label: e.replace(/_/g, ' ').toUpperCase() })) },
                { key: 'tipo', label: 'Clasificación', value: tipo, type: 'select', options: tiposUnicos.map(([id, nombre]) => ({ value: id, label: nombre })) },
                { key: 'area', label: 'Jurisdicción', value: area, type: 'select', options: areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre })) },
              ]}
              onChange={(key, value) => {
                if (key === 'estado') setEstado(String(value));
                if (key === 'tipo') setTipo(String(value));
                if (key === 'area') setArea(String(value));
              }}
              onReset={() => { setEstado(''); setTipo(''); setArea(''); }}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <DataTable 
              data={filtered} 
              columns={columns} 
              onRowClick={handleSelectRow} 
              emptyMessage="No se encontraron activos con los criterios seleccionados." 
            />
          </div>
        </div>
      </section>

      {/* Lateral Insight Panel */}
      {selected && (
        <aside className="w-[420px] h-full flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-in-right relative">
          {/* Header Visual */}
          <div className="h-48 bg-slate-900 relative overflow-hidden flex flex-col justify-end p-8">
            <div className="absolute inset-0 opacity-20">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
               {selected.lat && selected.lng ? (
                 <img 
                    src={`https://static-maps.yandex.ru/1.x/?ll=${selected.lng},${selected.lat}&z=16&l=map&size=450,450&theme=${window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}`} 
                    className="w-full h-full object-cover scale-150 grayscale"
                    alt="Map Context"
                 />
               ) : (
                 <div className="w-full h-full bg-brand-500 opacity-20" />
               )}
            </div>
            
            <div className="relative z-20">
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={selected.estado} />
                <button 
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-2xl font-black text-white leading-tight mb-1">{selected.nombre}</h3>
              <div className="flex items-center gap-2">
                 <span className="font-mono text-[10px] font-black tracking-widest text-white/50 uppercase">{selected.codigo}</span>
                 <div className="w-1 h-1 rounded-full bg-white/20" />
                 <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{selected.tipoActivo?.nombre ?? selected.tipo}</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
            {(['info', 'incidentes', 'riesgos'] as const).map((t) => (
              <button 
                key={t} 
                onClick={() => setTab(t)} 
                className={`py-5 flex-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${tab === t ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t}
                {tab === t && <div className="absolute bottom-0 left-4 right-4 h-1 bg-brand-500 rounded-t-full" />}
              </button>
            ))}
          </div>

          {/* Content Scroll */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4 opacity-40">
                <Activity size={32} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Datos...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {tab === 'info' && (
                  <>
                    <section className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-brand-500 rounded-full" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Diagnóstico Operativo</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                             <Shield size={24} />
                           </div>
                           <div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Área Responsable</span>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selected.areaResponsable?.nombre ?? selected.area ?? 'Sin Asignar'}</p>
                           </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400">
                             <MapPin size={24} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación Técnica</span>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{selected.direccion ?? 'Coordenadas Sin Calle'}</p>
                           </div>
                        </div>
                      </div>

                      {selected.lat && selected.lng && (
                        <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl group">
                           <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                              <MapContainer center={[Number(selected.lat), Number(selected.lng)]} zoom={15} zoomControl={false} scrollWheelZoom={false} dragging={false} className="w-full h-full grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[Number(selected.lat), Number(selected.lng)]} icon={L.divIcon({ className: '', html: '<div class="w-6 h-6 bg-brand-500 rounded-full border-4 border-white shadow-lg animate-pulse-subtle"></div>' })} />
                              </MapContainer>
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`} 
                                target="_blank" 
                                className="absolute bottom-4 right-4 px-4 py-2 bg-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:scale-110 transition-transform flex items-center gap-2"
                              >
                                <ExternalLink size={12} /> Google Maps
                              </a>
                           </div>
                        </div>
                      )}
                    </section>

                    <section className="flex flex-col gap-4">
                       <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Controles de Estado</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={abrirEditar}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-500/5 transition-all flex flex-col items-center gap-2 group"
                        >
                          <Edit3 size={18} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Configurar</span>
                        </button>
                        <button 
                          onClick={handleGenerarIncidente}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:bg-red-500/5 transition-all flex flex-col items-center gap-2 group"
                        >
                          <AlertTriangle size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reportar</span>
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ESTADOS_ACTIVO.filter((e) => e !== selected.estado).map((e) => (
                          <button 
                            key={e} 
                            disabled={cambiando === selected.id} 
                            onClick={() => handleCambiarEstado(selected.id, e)}
                            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-brand-500 transition-all disabled:opacity-50"
                          >
                            Set {e.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {tab === 'incidentes' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-red-500 rounded-full" />
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Línea de Tiempo</h4>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full">{selected.incidentes?.length ?? 0} Reportes</span>
                    </div>

                    {!selected.incidentes?.length ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-300">
                          <CheckCircle size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sin Novedades Críticas</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 relative before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
                        {selected.incidentes.map((inc: any) => (
                          <div 
                            key={inc.id} 
                            onClick={() => navigate(`/incidentes/${inc.id}`)}
                            className="flex gap-6 group cursor-pointer"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex-shrink-0 flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:border-brand-500 group-hover:shadow-lg transition-all">
                               <StatusBadge status={inc.estado} showLabel={false} />
                            </div>
                            <div className="flex-1 pb-6 border-b border-slate-50 dark:border-slate-800/50 group-last:border-0 pt-1">
                               <div className="flex items-center justify-between mb-1">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{inc.fechaReporte?.slice(0, 10)}</span>
                                 <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                               </div>
                               <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">{inc.tipo}</h5>
                               <p className="text-[11px] text-slate-500 font-medium line-clamp-2">{inc.descripcion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'riesgos' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-amber-500 rounded-full" />
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Matriz de Vulnerabilidad</h4>
                    </div>

                    {!selected.riesgos?.length ? (
                      <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                         <Shield size={40} className="mx-auto text-slate-200 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dimensión de Riesgo No Configurada</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {selected.riesgos.map((r: any) => (
                          <div 
                            key={r.id} 
                            className="p-6 rounded-[2.5rem] border transition-all hover:translate-y-[-4px] hover:shadow-xl relative overflow-hidden group"
                            style={{ 
                              background: r.color ? `${r.color}08` : '#f8fafc',
                              borderColor: r.color ? `${r.color}20` : '#e2e8f0'
                            }}
                          >
                            <div 
                              className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700"
                              style={{ color: r.color }}
                            >
                               <RiesgoIcon icono={r.icono} size={120} />
                            </div>
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div 
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                  style={{ background: r.color, color: 'white' }}
                                >
                                  <RiesgoIcon icono={r.icono} size={20} />
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Nivel de Impacto</span>
                                  <p className="text-sm font-black uppercase" style={{ color: r.color }}>Rango {r.nivel}</p>
                                </div>
                              </div>
                              <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{r.nombre}</h5>
                              <div className="flex flex-wrap gap-3">
                                {r.slaSugeridoHoras && (
                                  <div className="px-3 py-1 bg-white/50 dark:bg-slate-900/50 rounded-full border border-slate-200/50 dark:border-slate-800/50 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Activity size={10} /> SLA {r.slaSugeridoHoras}H
                                  </div>
                                )}
                                {r.requiereAccionInmediata && (
                                  <div className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full border border-red-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                                    <AlertTriangle size={10} /> Respuesta Crítica
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Modal Estandarizado de Creación/Edición */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Nuevo Registro de Activo' : 'Configuración Maestra'}
        maxWidth="740px"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button 
              className="btn-primary px-8"
              onClick={handleGuardar} 
              disabled={guardando}
            >
              {guardando ? 'Sincronizando...' : (modal === 'crear' ? 'Registrar Activo' : 'Confirmar Cambios')}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-8 py-2">
          <div className="grid grid-cols-2 gap-x-6 gap-y-6">
            {/* Sección: DNI del Activo */}
            <div className="col-span-2 modal-section-header">
              <div className="line-short" />
              <span>Identidad Sistémica</span>
              <div className="line" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label flex items-center gap-2">
                <Code size={12} className="text-brand-500" /> Código Interno *
              </label>
              <input 
                className="input-premium uppercase font-mono tracking-widest text-brand-600 dark:text-brand-400" 
                value={form.codigo} 
                onChange={(e) => setForm({ ...form, codigo: e.target.value })} 
                placeholder="Ej: LUM-1024" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label flex items-center gap-2">
                <Box size={12} className="text-brand-500" /> Nombre del Activo *
              </label>
              <input 
                className="input-premium" 
                value={form.nombre} 
                onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                placeholder="Ej: Luminaria LED X" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label flex items-center gap-2">
                <Layers size={12} className="text-brand-500" /> Taxonomía *
              </label>
              <select className="input-premium" value={form.tipoActivoId} onChange={(e) => setForm({ ...form, tipoActivoId: e.target.value })}>
                <option value="">Seleccionar Clase...</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label flex items-center gap-2">
                <Shield size={12} className="text-brand-500" /> Jurisdicción Responsable
              </label>
              <select className="input-premium" value={form.areaResponsableId} onChange={(e) => setForm({ ...form, areaResponsableId: e.target.value })}>
                <option value="">Nivel Central</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
               <label className="form-label flex items-center gap-2">
                <Settings size={12} className="text-brand-500" /> Estado Inicial
              </label>
              <select className="input-premium" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                {ESTADOS_ACTIVO.map((e) => <option key={e} value={e}>{e.replace(/_/g, ' ').toUpperCase()}</option>)}
              </select>
            </div>

            {/* Sección: Localización & Operativa */}
            <div className="col-span-2 modal-section-header">
              <div className="line-short" />
              <span>Georreferenciación Técnica</span>
              <div className="line" />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="form-label flex items-center gap-2">
                <MapPin size={12} className="text-brand-500" /> Dirección de Referencia
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    className="input-premium pr-12" 
                    value={form.direccion} 
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })} 
                    onKeyDown={(e) => e.key === 'Enter' && handleGeocodificar()} 
                    placeholder="Calle, Altura / Intersección..." 
                  />
                  <button 
                    onClick={handleGeocodificar}
                    disabled={geocodificando || !form.direccion.trim()}
                    className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-500 transition-all disabled:opacity-20"
                  >
                    {geocodificando ? <Activity size={14} className="animate-spin" /> : <Search size={14} />}
                  </button>
                </div>
                <button 
                  onClick={abrirMapaPicker}
                  className="px-4 bg-slate-900 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  <Navigation size={14} /> Mapa
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label text-slate-400">Latitud</label>
              <input 
                className="input-premium font-mono !bg-slate-50 dark:!bg-slate-800/30 !text-slate-500" 
                type="number" 
                step="any" 
                readOnly
                value={form.lat} 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="form-label text-slate-400">Longitud</label>
              <input 
                className="input-premium font-mono !bg-slate-50 dark:!bg-slate-800/30 !text-slate-500" 
                type="number" 
                step="any" 
                readOnly
                value={form.lng} 
              />
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex gap-4 items-start">
             <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-brand-500 flex-shrink-0">
               <Info size={20} />
             </div>
             <div>
               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aviso de Precisión Geográfica</h5>
               <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                 Utilice el selector de mapa para una precisión milimétrica. La geocodificación se basa en la cartografía oficial.
               </p>
             </div>
          </div>
        </div>
      </Modal>


      {/* Map Picker Modal */}
      {modalMapa && pinPos && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-[680px] flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Geolocalización Industrial</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Captura de coordenadas en tiempo real</p>
              </div>
              <button 
                onClick={() => setModalMapa(false)}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 relative bg-slate-100">
              <MapContainer key={pinPos?.join(',')} center={pinPos} zoom={15} className="w-full h-full z-10">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                <ClickHandler onPick={(lat, lng) => setPinPos([lat, lng])} />
                {pinPos && (
                  <Marker 
                    position={pinPos} 
                    icon={L.divIcon({ 
                      className: '', 
                      html: '<div class="w-8 h-8 bg-brand-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white scale-110"><div class="w-1 h-1 bg-white rounded-full"></div></div>', 
                      iconSize: [32, 32], 
                      iconAnchor: [16, 16] 
                    })} 
                  />
                )}
              </MapContainer>
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                 <div className="px-4 py-2 bg-white/90 backdrop-blur dark:bg-slate-900/90 rounded-xl shadow-xl flex items-center gap-3 border border-slate-200/50 dark:border-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-300">
                      {pinPos[0].toFixed(6)} , {pinPos[1].toFixed(6)}
                    </span>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-brand-500 shadow-sm">
                   <Maximize2 size={24} />
                 </div>
                 <div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Puntero de Precisión</p>
                   <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">Hacé clic en el mapa para anclar el activo</p>
                 </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors" onClick={() => setModalMapa(false)}>
                  Cancelar
                </button>
                <button 
                  onClick={confirmarPin}
                  className="px-10 py-3 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95"
                >
                  Fijar Ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
