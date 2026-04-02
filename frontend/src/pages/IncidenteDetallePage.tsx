import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';

type Incidente = {
  id: string;
  tipo: string;
  estado: string;
  prioridad: string;
  area: string;
  fecha: string;
  direccion: string;
  descripcion: string;
  lat: number;
  lng: number;
};

const incidentes: Incidente[] = [
  { id: '1', tipo: 'Bacheo', estado: 'abierto', prioridad: 'alta', area: 'Poda', fecha: '2026-04-02', direccion: 'Av. Principal 123', descripcion: 'Gran bache en la vía.', lat: -34.61, lng: -58.36 },
  { id: '2', tipo: 'Luminaria', estado: 'en_proceso', prioridad: 'media', area: 'Luminaria', fecha: '2026-04-01', direccion: 'Calle Falsa 456', descripcion: 'Falta de iluminación nocturna.', lat: -34.62, lng: -58.37 },
];

export default function IncidenteDetallePage() {
  const { id } = useParams();

  const incidente = useMemo(() => incidentes.find((inc) => inc.id === id), [id]);

  if (!incidente) {
    return <div>Incidente no encontrado</div>;
  }

  return (
    <section>
      <h2>Incidente {incidente.id}</h2>
      <div>
        <strong>Tipo:</strong> {incidente.tipo}
      </div>
      <div>
        <strong>Estado:</strong> <StatusBadge status={incidente.estado} />
      </div>
      <div>
        <strong>Prioridad:</strong> {incidente.prioridad}
      </div>
      <div>
        <strong>Área:</strong> {incidente.area}
      </div>
      <div>
        <strong>Fecha:</strong> {incidente.fecha}
      </div>
      <div>
        <strong>Dirección:</strong> {incidente.direccion}
      </div>
      <div>
        <strong>Descripción:</strong> {incidente.descripcion}
      </div>
      <div>
        <strong>Ubicación:</strong> {incidente.lat}, {incidente.lng}
      </div>
      <button type="button">Generar orden</button>
      <h3>Evidencias</h3>
      <ul>
        <li>Foto antes 1</li>
        <li>Informe técnico 1</li>
      </ul>
    </section>
  );
}
