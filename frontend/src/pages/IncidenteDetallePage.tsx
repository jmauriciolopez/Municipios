import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIncidente, updateIncidente } from '@shared/services/incidentes.api';
import { apiFetch } from '../services/apiFetch';
import StatusBadge from '../components/ui/StatusBadge';
import EvidenciasPanel from '../components/ui/EvidenciasPanel';

const ESTADOS = ['abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado'];

export default function IncidenteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incidente, setIncidente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getIncidente(id),
    ])
      .then(([inc]) => { setIncidente(inc); })
      .catch(() => setError('No se pudo cargar el incidente.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!id) return;
    setCambiandoEstado(true);
    try {
      const updated = await updateIncidente(id, { estado: nuevoEstado as any });
      setIncidente((prev: any) => ({ ...prev, estado: (updated as any).estado ?? nuevoEstado }));
    } catch {
      alert('Error al cambiar el estado.');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleGenerarOrden = async () => {
    if (!id) return;
    setGenerando(true);
    try {
      const orden = await apiFetch<any>(`/incidentes/${id}/convertir-a-orden`, { method: 'POST' });
      navigate(`/ordenes/${orden.id}`);
    } catch {
      alert('Error al generar la orden de trabajo.');
    } finally {
      setGenerando(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando incidente...</div>;
  if (error || !incidente) return <div className="error-state">{error ?? 'Incidente no encontrado'}</div>;

  const fecha = (incidente.fechaReporte ?? incidente.fecha_reporte ?? '').slice(0, 10);
  const area = incidente.area?.nombre ?? '';
  const ordenId = incidente.orden?.id;

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>{incidente.tipo}</h2>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
            {area && <span>{area}</span>}
            {fecha && <span style={{ marginLeft: '0.75rem' }}>· {fecha}</span>}
          </div>
        </div>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>← Volver</button>
          {incidente.estado === 'abierto' && !ordenId && (
            <button onClick={handleGenerarOrden} disabled={generando}>
              {generando ? 'Generando...' : '+ Generar orden'}
            </button>
          )}
        </div>
      </header>

      <div className="detail-grid">
        <div>
          <strong>Estado</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <StatusBadge status={incidente.estado} />
            <select
              value={incidente.estado}
              disabled={cambiandoEstado}
              onChange={(e) => handleCambiarEstado(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#f8fafc', cursor: 'pointer' }}
            >
              {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div><strong>Prioridad</strong><div style={{ marginTop: '0.25rem' }}><StatusBadge status={incidente.prioridad} /></div></div>
        <div><strong>Área</strong><span>{area || 'N/A'}</span></div>
        <div><strong>Dirección</strong><span>{incidente.direccion ?? 'N/A'}</span></div>
        <div><strong>Ubicación</strong><span>{incidente.lat}, {incidente.lng}</span></div>
        <div>
          <strong>Orden asociada</strong>
          {ordenId
            ? <button className="btn-secondary" style={{ marginTop: '0.25rem', padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }} onClick={() => navigate(`/ordenes/${ordenId}`)}>Ver orden →</button>
            : <span>Sin orden</span>
          }
        </div>
        {incidente.descripcion && (
          <div className="col-span-2"><strong>Descripción</strong><span>{incidente.descripcion}</span></div>
        )}
      </div>

      <h3>Evidencias</h3>
      <EvidenciasPanel entidadTipo="incidente" entidadId={id!} />
    </section>
  );
}
