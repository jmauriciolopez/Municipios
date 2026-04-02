import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
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
};

const ordenesSeed: Orden[] = [
  { id: '1', codigo: 'OT0001', estado: 'detectado', prioridad: 'alta', area: 'Poda', cuadrilla: 'C-01', fechaAsignacion: '2026-04-02', fechaInicio: '', fechaCierre: '' },
  { id: '2', codigo: 'OT0002', estado: 'en_proceso', prioridad: 'media', area: 'Luminaria', cuadrilla: 'C-02', fechaAsignacion: '2026-04-01', fechaInicio: '2026-04-01', fechaCierre: '' },
  { id: '3', codigo: 'OT0003', estado: 'resuelto', prioridad: 'baja', area: 'Higiene Urbana', cuadrilla: 'C-03', fechaAsignacion: '2026-03-30', fechaInicio: '2026-03-30', fechaCierre: '2026-04-01' },
];

export default function OrdenesPage() {
  const navigate = useNavigate();
  const [area, setArea] = useState('');
  const [estado, setEstado] = useState('');

  const filtered = useMemo(
    () =>
      ordenesSeed.filter((item) => {
        if (area && item.area !== area) return false;
        if (estado && item.estado !== estado) return false;
        return true;
      }),
    [area, estado],
  );

  const columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'estado', label: 'Estado', render: (item: Orden) => <StatusBadge status={item.estado} /> },
    { key: 'prioridad', label: 'Prioridad' },
    { key: 'area', label: 'Área' },
    { key: 'cuadrilla', label: 'Cuadrilla' },
    { key: 'fechaAsignacion', label: 'Fecha asignación' },
    { key: 'fechaInicio', label: 'Fecha inicio' },
    { key: 'fechaCierre', label: 'Fecha cierre' },
  ];

  return (
    <section>
      <header className="page-header">
        <h2>Órdenes de trabajo</h2>
      </header>

      <FilterBar
        filters={[
          { key: 'area', label: 'Área', value: area, type: 'select', options: [{ value: 'Poda', label: 'Poda' }, { value: 'Luminaria', label: 'Luminaria' }, { value: 'Higiene Urbana', label: 'Higiene Urbana' }] },
          { key: 'estado', label: 'Estado', value: estado, type: 'select', options: [{ value: 'detectado', label: 'Detectado' }, { value: 'asignado', label: 'Asignado' }, { value: 'en_proceso', label: 'En proceso' }, { value: 'resuelto', label: 'Resuelto' }, { value: 'verificado', label: 'Verificado' }] },
        ]}
        onChange={(key, value) => {
          if (key === 'area') setArea(String(value));
          if (key === 'estado') setEstado(String(value));
        }}
        onReset={() => {
          setArea('');
          setEstado('');
        }}
      />

      <DataTable data={filtered} columns={columns} onRowClick={(item) => navigate(`/ordenes/${item.id}`)} emptyMessage="No se encontraron órdenes" />
    </section>
  );
}
