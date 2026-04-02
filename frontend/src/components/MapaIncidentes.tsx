import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Incidente {
  id: string;
  tipo: string;
  descripcion: string;
  lat: number;
  lng: number;
  estado: string;
  prioridad: string;
}

interface MapaIncidentesProps {
  incidentes?: Incidente[];
  onMarkerClick?: (incidente: Incidente) => void;
}

const MapaIncidentes: React.FC<MapaIncidentesProps> = ({
  incidentes = [],
  onMarkerClick
}) => {
  const center: [number, number] = [-34.6037, -58.3816]; // Buenos Aires por defecto

  // Datos simulados si no se pasan incidentes
  const incidentesSimulados: Incidente[] = [
    {
      id: '1',
      tipo: 'Caída de rama',
      descripcion: 'Rama grande en riesgo de caída',
      lat: -34.6037,
      lng: -58.3816,
      estado: 'abierto',
      prioridad: 'alta'
    },
    {
      id: '2',
      tipo: 'Luminaria rota',
      descripcion: 'Farola sin funcionar en plaza',
      lat: -34.6050,
      lng: -58.3830,
      estado: 'en_proceso',
      prioridad: 'media'
    },
    {
      id: '3',
      tipo: 'Bache en calle',
      descripcion: 'Bache peligroso en avenida principal',
      lat: -34.6020,
      lng: -58.3800,
      estado: 'resuelto',
      prioridad: 'baja'
    }
  ];

  const datosIncidentes = incidentes.length > 0 ? incidentes : incidentesSimulados;

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
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {datosIncidentes.map((incidente) => (
          <Marker
            key={incidente.id}
            position={[incidente.lat, incidente.lng]}
            icon={createCustomIcon(getMarkerColor(incidente.prioridad))}
            eventHandlers={{
              click: () => onMarkerClick?.(incidente),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm">{incidente.tipo}</h3>
                <p className="text-xs text-gray-600 mt-1">{incidente.descripcion}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    incidente.estado === 'abierto' ? 'bg-red-100 text-red-800' :
                    incidente.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {incidente.estado}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    incidente.prioridad === 'critica' ? 'bg-red-100 text-red-800' :
                    incidente.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                    incidente.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {incidente.prioridad}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaIncidentes;