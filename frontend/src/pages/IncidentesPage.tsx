import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';

type Incidente = {
  id: string;
  tipo: string;
  estado: string;
  prioridad: string;
  area: string;
  fecha: string;
  direccion: string;
};

const incidentesSeed: Incidente[] = [
  { id: '1', tipo: 'Bacheo', estado: 'abierto', prioridad: 'alta', area: 'Poda', fecha: '2026-04-02', direccion: 'Av. Principal 123' },
  { id: '2', tipo: 'Luminaria', estado: 'en_proceso', prioridad: 'media', area: 'Luminaria', fecha: '2026-04-01', direccion: 'Calle Falsa 456' },
  { id: '3', tipo: 'Residuos', estado: 'resuelto', prioridad: 'baja', area: 'Higiene Urbana', fecha: '2026-03-30', direccion: 'Plaza Central 1' },
];

export default function IncidentesPage() {
  const navigate = useNavigate();
  const [area, setArea] = useState('');
  const [estado, setEstado] = useState('');
  const [prioridad, setPrioridad] = useState('');

  const filtered = useMemo(
    () =>
      incidentesSeed.filter((item) => {
        if (area && item.area !== area) return false;
        if (estado && item.estado !== estado) return false;
        if (prioridad && item.prioridad !== prioridad) return false;
        return true;
      }),
    [area, estado, prioridad],
  );

  const columns = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'estado', label: 'Estado', render: (item: Incidente) => <StatusBadge status={item.estado} /> },
    { key: 'prioridad', label: 'Prioridad' },
    { key: 'area', label: 'Área' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'direccion', label: 'Dirección' },
  ];

  return (
    <section>
      <header className="page-header">
        <h2>Incidentes</h2>
        <div className="actions">
          <button type="button" onClick={() => navigate('/mapa')}>
            Ver mapa
          </button>
          <button type="button">Crear incidente</button>
        </div>
      </header>

      <FilterBar
        filters={[
          { key: 'area', label: 'Área', value: area, type: 'select', options: [{ value: 'Poda', label: 'Poda' }, { value: 'Luminaria', label: 'Luminaria' }, { value: 'Higiene Urbana', label: 'Higiene Urbana' }] },
          { key: 'estado', label: 'Estado', value: estado, type: 'select', options: [{ value: 'abierto', label: 'Abierto' }, { value: 'en_proceso', label: 'En proceso' }, { value: 'resuelto', label: 'Resuelto' }] },
          { key: 'prioridad', label: 'Prioridad', value: prioridad, type: 'select', options: [{ value: 'baja', label: 'Baja' }, { value: 'media', label: 'Media' }, { value: 'alta', label: 'Alta' }] },
        ]}
        onChange={(key, value) => {
          if (key === 'area') setArea(String(value));
          if (key === 'estado') setEstado(String(value));
          if (key === 'prioridad') setPrioridad(String(value));
        }}
        onReset={() => {
          setArea('');
          setEstado('');
          setPrioridad('');
        }}
      />

      <DataTable
        data={filtered}
        columns={columns}
        onRowClick={(item) => navigate(`/incidentes/${item.id}`)}
        emptyMessage="No se encontraron incidentes"
      />
    </section>
  );
}
