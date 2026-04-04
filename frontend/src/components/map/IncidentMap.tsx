import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '../../types/incident';
import HeatmapLayer from './HeatmapLayer';

const CORRIENTES = [-27.46, -58.83] as [number, number];

const PRIORIDAD_COLORS: Record<string, string> = {
  critica: '#dc2626', alta: '#f97316', media: '#eab308', baja: '#22c55e',
};

const createIcon = (color: string) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function FlyToIncidents({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  useEffect(() => {
    if (!incidents.length) return;
    const avgLat = incidents.reduce((s, i) => s + i.lat, 0) / incidents.length;
    const avgLng = incidents.reduce((s, i) => s + i.lng, 0) / incidents.length;
    map.flyTo([avgLat, avgLng], 13, { duration: 1 });
  }, [incidents]);
  return null;
}

type IncidentMapProps = {
  incidents: Incident[];
  heatPoints?: Array<{ lat: number; lng: number; intensity: number }>;
  onSelectIncident: (incident: Incident) => void;
};

let iconsFixed = false;

export default function IncidentMap({ incidents, heatPoints = [], onSelectIncident }: IncidentMapProps) {
  if (!iconsFixed) {
    iconsFixed = true;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
  return (
    <MapContainer center={CORRIENTES} zoom={13} style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToIncidents incidents={incidents} />
      {heatPoints.length > 0 && <HeatmapLayer points={heatPoints} />}
      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.lat, inc.lng]}
          icon={createIcon(inc.categoriaColor || PRIORIDAD_COLORS[inc.prioridad] || '#64748b')}
          eventHandlers={{ click: () => onSelectIncident(inc) }}
        >
          <Popup>
            <div>
              <strong>{inc.tipo}</strong>
              <p style={{ margin: '0.25rem 0', fontSize: '0.8125rem', color: '#64748b' }}>{inc.direccion || 'Sin dirección'}</p>
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                <span>{inc.estado}</span>
                <span>{inc.prioridad}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
