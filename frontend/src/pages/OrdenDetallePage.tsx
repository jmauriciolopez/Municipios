import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrden, cambiarEstadoOrden, asignarCuadrilla } from '@shared/services/ordenes.api';
import { getCuadrillas } from '@shared/services/cuadrillas.api';
import { apiFetch } from '../services/apiFetch';
import StatusBadge from '../components/ui/StatusBadge';
import EvidenciasPanel from '../components/ui/EvidenciasPanel';

const ESTADOS_ORDEN = ['detectado', 'asignado', 'en_proceso', 'resuelto', 'verificado'];
const TRANSICIONES: Record<string, string[]> = {
  detectado: ['asignado', 'cancelado'],
  asignado: ['en_proceso', 'cancelado'],
  en_proceso: ['resuelto', 'cancelado'],
  resuelto: ['verificado'],
  verificado: [],
  cancelado: [],
};

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [orden, setOrden] = useState<any>(null);
  const [cuadrillas, setCuadrillas] = useState<any[]>([]);
  const [duracion, setDuracion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getOrden(id),
      getCuadrillas(),
      apiFetch<any>(`/ordenes-trabajo/${id}/duracion`).catch(() => null),
    ])
      .then(([ord, cuads, dur]: any[]) => {
        setOrden(ord);
        setCuadrillas(cuads ?? []);
        setDuracion(dur);
      })
      .catch(() => setError('No se pudo cargar la orden.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!id) return;
    if (nuevoEstado === 'cancelado' && !confirm('¿Confirmar cancelación de esta orden?')) return;
    setCambiandoEstado(true);
    try {
      const updated = await cambiarEstadoOrden(id, nuevoEstado);
      setOrden((prev: any) => ({ ...prev, ...(updated as any) }));
    } catch (e: any) {
      const msg = e?.message ?? '';
      alert(msg.includes('API error') ? 'Transición de estado no permitida.' : 'Error al cambiar el estado.');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleAsignarCuadrilla = async (cuadrillaId: string) => {
    if (!id || !cuadrillaId) return;
    setAsignando(true);
    try {
      const updated = await asignarCuadrilla(id, cuadrillaId);
      const cuadrilla = cuadrillas.find((c: any) => c.id === cuadrillaId);
      setOrden((prev: any) => ({ ...prev, ...(updated as any), cuadrilla }));
    } catch {
      alert('Error al asignar la cuadrilla.');
    } finally {
      setAsignando(false);
    }
  };

  if (loading) return <div className="loading-state">Cargando orden...</div>;
  if (error || !orden) return <div className="error-state">{error ?? 'Orden no encontrada'}</div>;

  const estadoActualIdx = ESTADOS_ORDEN.indexOf(orden.estado);
  const area = orden.area?.nombre ?? '';
  const cuadrilla = orden.cuadrilla?.nombre ?? 'Sin asignar';
  const siguientes = TRANSICIONES[orden.estado] ?? [];
  const materiales: any[] = orden.materiales ?? [];

  return (
    <section>
      <header className="page-header">
        <div>
          <h2>{orden.codigo}</h2>
          <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
            {area && <span>{area}</span>}
            {duracion?.real_horas != null && (
              <span>· Duración: <strong>{duracion.real_horas.toFixed(1)}h</strong></span>
            )}
          </div>
        </div>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>← Volver</button>
          {siguientes.filter((s) => s !== 'cancelado').map((sig) => (
            <button key={sig} disabled={cambiandoEstado} onClick={() => handleCambiarEstado(sig)}>
              {cambiandoEstado ? '...' : `→ ${sig.replace(/_/g, ' ')}`}
            </button>
          ))}
          {siguientes.includes('cancelado') && (
            <button className="btn-danger" disabled={cambiandoEstado} onClick={() => handleCambiarEstado('cancelado')}>
              Cancelar orden
            </button>
          )}
        </div>
      </header>

      <ol className="timeline">
        {ESTADOS_ORDEN.map((e, idx) => (
          <li key={e} className={idx <= estadoActualIdx ? 'timeline-done' : 'timeline-pending'}>
            {e.replace(/_/g, ' ')}
          </li>
        ))}
      </ol>

      <div className="detail-grid">
        <div>
          <strong>Estado</strong>
          <div style={{ marginTop: '0.25rem' }}><StatusBadge status={orden.estado} /></div>
        </div>
        <div>
          <strong>Prioridad</strong>
          <div style={{ marginTop: '0.25rem' }}><StatusBadge status={orden.prioridad} /></div>
        </div>
        <div><strong>Área</strong><span>{area || 'N/A'}</span></div>
        <div>
          <strong>Cuadrilla</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <span>{cuadrilla}</span>
            {['detectado', 'asignado'].includes(orden.estado) && (
              <select
                defaultValue="" disabled={asignando}
                onChange={(e) => e.target.value && handleAsignarCuadrilla(e.target.value)}
                style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', background: '#f8fafc', cursor: 'pointer' }}
              >
                <option value="">Reasignar...</option>
                {cuadrillas.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            )}
          </div>
        </div>
        <div><strong>Fecha asignación</strong><span>{orden.fechaAsignacion?.slice(0, 10) ?? 'N/A'}</span></div>
        <div><strong>Fecha inicio</strong><span>{orden.fechaInicio?.slice(0, 10) ?? 'N/A'}</span></div>
        <div><strong>Fecha cierre</strong><span>{orden.fechaCierre?.slice(0, 10) ?? 'Pendiente'}</span></div>
        <div>
          <strong>Incidente origen</strong>
          {orden.incidente
            ? <button className="btn-secondary" style={{ marginTop: '0.25rem', padding: '0.25rem 0.75rem', fontSize: '0.8125rem' }} onClick={() => navigate(`/incidentes/${orden.incidente.id}`)}>Ver incidente →</button>
            : <span>Sin incidente</span>
          }
        </div>
        {duracion && (
          <div>
            <strong>Duración estimada</strong>
            <span>{duracion.estimada_horas != null ? `${Number(duracion.estimada_horas).toFixed(1)}h` : 'N/A'}</span>
          </div>
        )}
        {orden.descripcion && (
          <div className="col-span-2"><strong>Descripción</strong><span>{orden.descripcion}</span></div>
        )}
      </div>

      {materiales.length > 0 && (
        <>
          <h3>Materiales</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m: any) => (
                <tr key={m.id}>
                  <td>{m.item}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.unidad}</td>
                  <td>{m.estado ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3>Evidencias</h3>
      <EvidenciasPanel entidadTipo="orden" entidadId={id!} />
    </section>
  );
}
