import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { Incident } from '../../types/incident';
import HeatmapLayer from './HeatmapLayer';

type IncidentMapProps = {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
};

export default function IncidentMap({ incidents, onSelectIncident }: IncidentMapProps) {
  const center: LatLngExpression = useMemo(() => {
    if (!incidents.length) return [-34.61, -58.40];
    const avgLat = incidents.reduce((sum, inc) => sum + inc.lat, 0) / incidents.length;
    const avgLng = incidents.reduce((sum, inc) => sum + inc.lng, 0) / incidents.length;
    return [avgLat, avgLng];
  }, [incidents]);

  return (
    <MapContainer center={center} zoom={13} style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatmapLayer points={incidents.map((inc) => ({ lat: inc.lat, lng: inc.lng, intensity: 1 }))} />
      {incidents.map((inc) => (
        <Marker key={inc.id} position={[inc.lat, inc.lng]} eventHandlers={{ click: () => onSelectIncident(inc) }}>
          <Popup>
            <strong>{inc.tipo}</strong><br />
            Estado: {inc.estado}<br />
            Prioridad: {inc.prioridad}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
