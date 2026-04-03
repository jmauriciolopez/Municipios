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

type IncidenteRow = {
  id: string; tipo: string; estado: string; prioridad: string;
  area: string; areaId: string; fecha: string; direccion: string;
};
type AreaOpt = { id: string; nombre: string };

const PRIORIDADES = ['baja', 'media', 'alta', 'critica'];
const ESTADOS_INC = ['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'];
const CORRIENTES: [number, number] = [-27.46, -58.83];
const FORM_EMPTY = { tipo: '', descripcion: '', prioridad: 'media', estado: 'abierto', lat: '', lng: '', direccion: '', area_id: '', reportado_por: '' };

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function IncidentesPage() {
  const navigate = useNavigate();
  const [incidentes, setIncidentes] = useState<IncidenteRow[]>([]);
  const [areas, setAreas] = useState<AreaOpt[]>([]);
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
        })))
      )
      .catch(() => setError('No se pudieron cargar los incidentes.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    cargar();
    apiFetch<any[]>('/areas').then((data) => setAreas(data.map((a) => ({ id: a.id, nombre: a.nombre })))).catch(() => {});
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
        tipo: form.tipo, descripcion: form.descripcion,
        estado: form.estado as any, prioridad: form.prioridad as any,
        lat: Number(form.lat), lng: Number(form.lng),
        direccion: form.direccion || undefined,
        area_id: form.area_id,
        reportado_por: form.reportado_por || undefined,
      } as any);
      setModal(false);
      setForm(FORM_EMPTY);
      setLoading(true);
      cargar();
    } catch {
      toast.error('Error al crear el incidente.');
    } finally {
      setGuardando(false);
    }
  };

  const columns = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'estado', label: 'Estado', render: (i: IncidenteRow) => <StatusBadge status={i.estado} /> },
    { key: 'prioridad', label: 'Prioridad', render: (i: IncidenteRow) => <StatusBadge status={i.prioridad} /> },
    { key: 'area', label: 'Área' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'direccion', label: 'Dirección' },
  ];

  if (loading) return <div className="loading-state">Cargando incidentes...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <section>
      <header className="page-header">
        <h2>Incidentes</h2>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigate('/mapa')}>Ver mapa</button>
          <button onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>+ Nuevo incidente</button>
        </div>
      </header>

      <FilterBar
        filters={[
          { key: 'estado', label: 'Estado', value: estado, type: 'select', options: ESTADOS_INC.map((e) => ({ value: e, label: e.replace('_', ' ') })) },
          { key: 'prioridad', label: 'Prioridad', value: prioridad, type: 'select', options: PRIORIDADES.map((p) => ({ value: p, label: p })) },
          { key: 'area', label: 'Área', value: area, type: 'select', options: areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre })) },
          { key: 'desde', label: 'Desde', value: desde, type: 'text' },
          { key: 'hasta', label: 'Hasta', value: hasta, type: 'text' },
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

      <DataTable
        data={filtered} columns={columns}
        onRowClick={(i) => navigate(`/incidentes/${i.id}`)}
        emptyMessage="No se encontraron incidentes"
      />

      {modal && (
        <div style={overlay}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Nuevo incidente</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={grid2}>
              <div className="form-group">
                <label>Tipo *</label>
                <input className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} placeholder="Ej: Bacheo, Luminaria..." />
              </div>
              <div className="form-group">
                <label>Área *</label>
                <select className="input-field" value={form.area_id} onChange={(e) => setForm({ ...form, area_id: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Prioridad</label>
                <select className="input-field" value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })}>
                  {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select className="input-field" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                  {ESTADOS_INC.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Dirección *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="input-field"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleGeocodificar()}
                    placeholder="Av. Ejemplo 1234 o cruce de calles..."
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn-secondary" style={{ flexShrink: 0 }} onClick={handleGeocodificar} disabled={geocodificando || !form.direccion.trim()}>
                    {geocodificando ? '...' : '📍 Buscar'}
                  </button>
                  <button type="button" className="btn-secondary" style={{ flexShrink: 0 }} onClick={abrirMapaPicker} title="Elegir en el mapa">
                    🗺️
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8' }}>Latitud <span style={{ fontSize: '0.7rem' }}>(automático)</span></label>
                <input className="input-field" type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} style={{ background: form.lat ? '#f0fdf4' : '#f8fafc', color: '#64748b' }} />
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8' }}>Longitud <span style={{ fontSize: '0.7rem' }}>(automático)</span></label>
                <input className="input-field" type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} style={{ background: form.lng ? '#f0fdf4' : '#f8fafc', color: '#64748b' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Descripción</label>
                <textarea className="input-field" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción del incidente..." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Crear incidente'}</button>
            </div>
          </div>
        </div>
      )}

      {modalMapa && pinPos && (
        <div style={{ ...overlay, zIndex: 60 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Hacé clic en el mapa para marcar la ubicación</span>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModalMapa(false)}>✕</button>
            </div>
            <MapContainer center={pinPos} zoom={14} style={{ height: '380px', width: '100%', borderRadius: '0.5rem' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <ClickHandler onPick={(lat, lng) => setPinPos([lat, lng])} />
              {pinPos && <Marker position={pinPos} icon={L.divIcon({ className: '', html: '<div style="background:red;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })} />}
            </MapContainer>
            {pinPos && (
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>
                Seleccionado: {pinPos[0].toFixed(6)}, {pinPos[1].toFixed(6)}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setModalMapa(false)}>Cancelar</button>
              <button onClick={confirmarPinMapa}>Confirmar ubicación</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
};
const modalBox: React.CSSProperties = {
  background: '#fff', borderRadius: '0.75rem', padding: '1.75rem',
  width: '100%', maxWidth: '640px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  maxHeight: '90vh', overflowY: 'auto',
};
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem',
};
