import { useMemo, useState } from 'react';
import IncidentMap from '../components/map/IncidentMap';
import { Incident } from '../types/incident';

const incidentesMock: Incident[] = [
  { id: '1', tipo: 'Bacheo', estado: 'abierto', prioridad: 'alta', area: 'Poda', lat: -34.613, lng: -58.377, direccion: 'Av. 9 de Julio 435', fecha: '2026-04-02' },
  { id: '2', tipo: 'Luminaria', estado: 'en_proceso', prioridad: 'media', area: 'Luminaria', lat: -34.615, lng: -58.381, direccion: 'Calle San Juan 100', fecha: '2026-04-02' },
  { id: '3', tipo: 'Residuos', estado: 'resuelto', prioridad: 'baja', area: 'Higiene Urbana', lat: -34.611, lng: -58.378, direccion: 'Plaza de Mayo', fecha: '2026-04-01' },
];

export default function MapaPage() {
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [selected, setSelected] = useState<Incident | null>(null);

  const filteredIncidentes = useMemo(() => {
    return incidentesMock.filter((inc) => {
      if (tipo && inc.tipo !== tipo) return false;
      if (estado && inc.estado !== estado) return false;
      if (desde && new Date(inc.fecha) < new Date(desde)) return false;
      if (hasta && new Date(inc.fecha) > new Date(hasta)) return false;
      return true;
    });
  }, [tipo, estado, desde, hasta]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mapa de Incidentes</h1>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="Bacheo">Bacheo</option>
              <option value="Luminaria">Luminaria</option>
              <option value="Residuos">Residuos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="abierto">Abierto</option>
              <option value="en_proceso">En proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Mapa y sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
          <IncidentMap incidents={filteredIncidentes} onSelectIncident={setSelected} />
        </div>

        <div className="w-full lg:w-80 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">
            Incidentes ({filteredIncidentes.length})
          </h3>

          {selected ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{selected.tipo}</h4>
                <p className="text-sm text-gray-600">{selected.direccion}</p>
              </div>

              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selected.estado === 'abierto' ? 'bg-red-100 text-red-800' :
                  selected.estado === 'en_proceso' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selected.estado}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selected.prioridad === 'critica' ? 'bg-red-100 text-red-800' :
                  selected.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' :
                  selected.prioridad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selected.prioridad}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Área:</strong> {selected.area}</p>
                <p><strong>Fecha:</strong> {selected.fecha}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Haz clic en un marcador para ver los detalles del incidente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
