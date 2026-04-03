import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { Incident } from '../../types/incident';
import HeatmapLayer from './HeatmapLayer';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type IncidentMapProps = {
  incidents: Incident[];
  heatPoints?: Array<{ lat: number; lng: number; intensity: number }>;
  onSelectIncident: (incident: Incident) => void;
};

export default function IncidentMap({ incidents, heatPoints = [], onSelectIncident }: IncidentMapProps) {
  const center: LatLngExpression = useMemo(() => {
    if (!incidents.length) return [-34.61, -58.40];
    const avgLat = incidents.reduce((sum, inc) => sum + inc.lat, 0) / incidents.length;
    const avgLng = incidents.reduce((sum, inc) => sum + inc.lng, 0) / incidents.length;
    return [avgLat, avgLng];
  }, [incidents]);

  const getMarkerColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'red';
      case 'alta': return 'orange';
      case 'media': return 'yellow';
      case 'baja': return 'green';
      default: return 'blue';
    }
  };

  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <MapContainer center={center} zoom={13} style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatmapLayer points={heatPoints.length > 0 ? heatPoints : incidents.map((inc) => ({ lat: inc.lat, lng: inc.lng, intensity: 1 }))} />
      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={[inc.lat, inc.lng]}
          icon={createCustomIcon(getMarkerColor(inc.prioridad))}
          eventHandlers={{ click: () => onSelectIncident(inc) }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-sm">{inc.tipo}</h3>
              <p className="text-xs text-gray-600 mt-1">{inc.direccion || 'Sin dirección'}</p>
              <div className="mt-2 flex gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  inc.estado === 'abierto' ? 'bg-red-100 text-red-800' :
                  inc.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {inc.estado}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  inc.prioridad === 'critica' ? 'bg-red-100 text-red-800' :
                  inc.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                  inc.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {inc.prioridad}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
