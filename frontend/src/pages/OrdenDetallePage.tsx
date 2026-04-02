import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';

type Orden = {
  id: string;
  codigo: string;
  estado: string;
  prioridad: string;
  area: string;
  cuadrilla: string;
  fechaAsignacion: string;
  fechaInicio: string;
  fechaCierre?: string;
  materiales: Array<{ item: string; cantidad: number; estado: string }>;
  evidencias: string[];
};

const ordenes: Orden[] = [
  {
    id: '1',
    codigo: 'OT0001',
    estado: 'asignado',
    prioridad: 'alta',
    area: 'Poda',
    cuadrilla: 'C-01',
    fechaAsignacion: '2026-04-02',
    fechaInicio: '2026-04-02',
    fechaCierre: '',
    materiales: [
      { item: 'Sacos de tierra', cantidad: 5, estado: 'en uso' },
      { item: 'Señalización', cantidad: 10, estado: 'listo' },
    ],
    evidencias: ['foto_antes_1.jpg', 'foto_avance_1.jpg'],
  },
];

export default function OrdenDetallePage() {
  const { id } = useParams();

  const orden = useMemo(() => ordenes.find((o) => o.id === id), [id]);

  if (!orden) {
    return <div>Orden no encontrada</div>;
  }

  return (
    <section>
      <h2>Orden {orden.codigo}</h2>
      <div>
        <strong>Estado:</strong> <StatusBadge status={orden.estado} />
      </div>
      <div>
        <strong>Prioridad:</strong> {orden.prioridad}
      </div>
      <div>
        <strong>Área:</strong> {orden.area}
      </div>
      <div>
        <strong>Cuadrilla:</strong> {orden.cuadrilla}
      </div>
      <div>
        <strong>Fecha asignación:</strong> {orden.fechaAsignacion}
      </div>
      <div>
        <strong>Fecha inicio:</strong> {orden.fechaInicio}
      </div>
      <div>
        <strong>Fecha cierre:</strong> {orden.fechaCierre || 'Pendiente'}
      </div>

      <h3>Timeline de estados</h3>
      <ul>
        <li>Detectado</li>
        <li>Asignado</li>
        <li>En proceso</li>
        {orden.estado === 'resuelto' || orden.estado === 'verificado' ? <li>Resuelto</li> : null}
      </ul>

      <h3>Materiales</h3>
      <table>
        <thead>
          <tr>
            <th>Ítem</th>
            <th>Cantidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {orden.materiales.map((m) => (
            <tr key={m.item}>
              <td>{m.item}</td>
              <td>{m.cantidad}</td>
              <td>{m.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Evidencias</h3>
      <ul>
        {orden.evidencias.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </section>
  );
}
