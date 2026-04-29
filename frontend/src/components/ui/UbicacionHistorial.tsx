import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/apiFetch';

type Ubicacion = { id: string; lat: string; lng: string; direccion?: string; createdAt: string };

type Props = { entidadTipo: string; entidadId: string };

export default function UbicacionHistorial({ entidadTipo, entidadId }: Props) {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Ubicacion[]>(`/ubicaciones?entidad_tipo=${entidadTipo}&entidad_id=${entidadId}`)
      .then(setUbicaciones)
      .catch((err) => console.error('Error al cargar historial:', err))
      .finally(() => setLoading(false));
  }, [entidadTipo, entidadId]);

  if (loading) return <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Cargando historial...</p>;
  if (ubicaciones.length === 0) return <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Sin historial de ubicaciones.</p>;

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {ubicaciones.map((u) => (
        <li key={u.id} style={{ fontSize: '0.8125rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.375rem 0', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <span style={{ fontFamily: 'monospace' }}>{Number(u.lat).toFixed(5)}, {Number(u.lng).toFixed(5)}</span>
            {u.direccion && <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>— {u.direccion}</span>}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0, marginLeft: '0.5rem' }}>
            {new Date(u.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        </li>
      ))}
    </ul>
  );
}
