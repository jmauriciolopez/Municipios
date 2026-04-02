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
    <section>
      <h2>Mapa de Incidentes</h2>

      <div className="filter-bar">
        <div>
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="Bacheo">Bacheo</option>
            <option value="Luminaria">Luminaria</option>
            <option value="Residuos">Residuos</option>
          </select>
        </div>
        <div>
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelto">Resuelto</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label>Fecha desde</label>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label>Fecha hasta</label>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      <div className="map-wrapper" style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <IncidentMap incidents={filteredIncidentes} onSelectIncident={setSelected} />
        </div>

        <aside style={{ width: '320px', padding: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3>Incidentes ({filteredIncidentes.length})</h3>
          {selected ? (
            <div>
              <h4>{selected.tipo}</h4>
              <p>Estado: {selected.estado}</p>
              <p>Prioridad: {selected.prioridad}</p>
              <p>Área: {selected.area}</p>
              <p>Dirección: {selected.direccion}</p>
              <p>Fecha: {selected.fecha}</p>
            </div>
          ) : (
            <p>Haz clic en un punto para ver detalles</p>
          )}
        </aside>
      </div>
    </section>
  );
}
