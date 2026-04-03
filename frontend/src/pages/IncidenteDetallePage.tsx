import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIncidente, updateIncidente } from '@shared/services/incidentes.api';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import StatusBadge from '../components/ui/StatusBadge';
import EvidenciasPanel from '../components/ui/EvidenciasPanel';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { confirm } from '../components/ui/ConfirmDialog';
import { reverseGeocode } from '../services/geocoding';

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
    Promise.all([getIncidente(id), apiFetch<any[]>('/areas')])
      .then(([inc, areasData]) => { setIncidente(inc); setAreas(areasData); })
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
      } as any);
      setIncidente((prev: any) => ({ ...prev, ...updated }));
      setModalEditar(false);
      toast.success('Incidente actualizado.');
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
      navigate(`/ordenes/${orden.id}`);
    } catch {
      toast.error('Error al generar la orden de trabajo.');
    } finally {
      setGenerando(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando incidente...</div>;
  if (error || !incidente) return <div className="error-state">{error ?? 'Incidente no encontrado'}</div>;

  const fecha = (incidente.fechaReporte ?? incidente.fecha_reporte ?? '').slice(0, 10);
  const area = incidente.area?.nombre ?? '';
  const ordenId = incidente.orden?.id;

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>{incidente.tipo}</h2>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
            {area && <span>{area}</span>}
            {fecha && <span style={{ marginLeft: '0.75rem' }}>· {fecha}</span>}
          </div>
        </div>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>← Volver</button>
          <button className="btn-secondary" onClick={abrirEditar}>✏️ Editar</button>
          {incidente.estado === 'abierto' && !ordenId && (
            <button onClick={handleGenerarOrden} disabled={generando}>
              {generando ? 'Generando...' : '+ Generar orden'}
            </button>
          )}
        </div>
      </header>

      <div className="detail-grid">
        <div>
          <strong>Estado</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <StatusBadge status={incidente.estado} />
            <select
              value={incidente.estado}
              disabled={cambiandoEstado}
              onChange={(e) => handleCambiarEstado(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#f8fafc', cursor: 'pointer' }}
            >
              {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div><strong>Prioridad</strong><div style={{ marginTop: '0.25rem' }}><StatusBadge status={incidente.prioridad} /></div></div>
        <div><strong>Área</strong><span>{area || 'N/A'}</span></div>
        <div><strong>Dirección</strong><span>{incidente.direccion ?? 'N/A'}</span></div>
        <div><strong>Ubicación</strong><span>{incidente.lat}, {incidente.lng}</span></div>
        <div>
          <strong>Orden asociada</strong>
          {ordenId
            ? <button className="btn-secondary" style={{ marginTop: '0.25rem', padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }} onClick={() => navigate(`/ordenes/${ordenId}`)}>Ver orden →</button>
            : <span>Sin orden</span>
          }
        </div>
        {incidente.descripcion && (
          <div className="col-span-2"><strong>Descripción</strong><span>{incidente.descripcion}</span></div>
        )}
      </div>

      <h3>Evidencias</h3>
      <EvidenciasPanel entidadTipo="incidente" entidadId={id!} />

      {modalEditar && form && (
        <div style={overlay}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Editar incidente</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModalEditar(false)}>✕</button>
            </div>
            <div style={grid2}>
              <div className="form-group">
                <label>Tipo *</label>
                <input className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Área</label>
                <select className="input-field" value={form.area_id} onChange={(e) => setForm({ ...form, area_id: e.target.value })}>
                  <option value="">Sin área</option>
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
                  {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Dirección</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleGeocodificar()} style={{ flex: 1 }} />
                  <button type="button" className="btn-secondary" style={{ flexShrink: 0 }} onClick={handleGeocodificar} disabled={geocodificando || !form.direccion.trim()}>
                    {geocodificando ? '...' : '📍 Buscar'}
                  </button>
                  <button type="button" className="btn-secondary" style={{ flexShrink: 0 }} onClick={abrirMapaPicker} title="Elegir en el mapa">🗺️</button>
                </div>
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8' }}>Latitud</label>
                <input className="input-field" type="number" step="any" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} style={{ background: form.lat ? '#f0fdf4' : '#f8fafc' }} />
              </div>
              <div className="form-group">
                <label style={{ color: '#94a3b8' }}>Longitud</label>
                <input className="input-field" type="number" step="any" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} style={{ background: form.lng ? '#f0fdf4' : '#f8fafc' }} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Descripción</label>
                <textarea className="input-field" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setModalEditar(false)}>Cancelar</button>
              <button onClick={handleGuardarEdicion} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
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
            {pinPos && <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>Seleccionado: {pinPos[0].toFixed(6)}, {pinPos[1].toFixed(6)}</div>}
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

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 };
const modalBox: React.CSSProperties = { background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '640px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' };
const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' };
