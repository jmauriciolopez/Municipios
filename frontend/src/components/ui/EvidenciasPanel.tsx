import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/apiFetch';

type Evidencia = { id: string; url: string; tipo: string; caption?: string; timestampFoto: string; tomadoPorU?: { nombre: string; email: string } };
type Props = { entidadTipo: string; entidadId: string };

const TIPOS = ['antes', 'despues', 'inspeccion', 'intervencion'];

export default function EvidenciasPanel({ entidadTipo, entidadId }: Props) {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ url: '', tipo: 'antes', caption: '' });
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const cargar = () =>
    apiFetch<Evidencia[]>(`/evidencias?entidad_tipo=${entidadTipo}&entidad_id=${entidadId}`)
      .then(setEvidencias)
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); }, [entidadTipo, entidadId]);

  const handleGuardar = async () => {
    if (!form.url) { alert('La URL es obligatoria.'); return; }
    setGuardando(true);
    try {
      await apiFetch('/evidencias', { method: 'POST', body: JSON.stringify({ entidadTipo, entidadId, url: form.url, tipo: form.tipo, caption: form.caption || undefined }) });
      setModal(false);
      setForm({ url: '', tipo: 'antes', caption: '' });
      cargar();
    } catch { alert('Error al guardar la evidencia.'); }
    finally { setGuardando(false); }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    setEliminando(id);
    try {
      await apiFetch(`/evidencias/${id}`, { method: 'DELETE' });
      setEvidencias((prev) => prev.filter((e) => e.id !== id));
    } catch { alert('Error al eliminar.'); }
    finally { setEliminando(null); }
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{evidencias.length} evidencia{evidencias.length !== 1 ? 's' : ''}</span>
        <button style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }} onClick={() => setModal(true)}>+ Agregar</button>
      </div>

      {loading ? (
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Cargando...</p>
      ) : evidencias.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}>Sin evidencias registradas.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {evidencias.map((e) => (
            <div key={e.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
              {isImage(e.url) ? (
                <a href={e.url} target="_blank" rel="noreferrer">
                  <img src={e.url} alt={e.caption ?? e.tipo} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                </a>
              ) : (
                <a href={e.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', fontSize: '2rem', textDecoration: 'none' }}>
                  📎
                </a>
              )}
              <div style={{ padding: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: '#ede9fe', color: '#5b21b6', padding: '0.125rem 0.375rem', borderRadius: '9999px' }}>{e.tipo}</span>
                  <button
                    onClick={() => handleEliminar(e.id)}
                    disabled={eliminando === e.id}
                    style={{ background: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', padding: '0', fontSize: '0.875rem', lineHeight: 1 }}
                  >✕</button>
                </div>
                {e.caption && <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>{e.caption}</p>}
                <p style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  {new Date(e.timestampFoto).toLocaleDateString('es-AR')}
                  {e.tomadoPorU && ` · ${e.tomadoPorU.nombre ?? e.tomadoPorU.email}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.75rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Nueva evidencia</h3>
              <button className="btn-secondary" style={{ padding: '0.25rem 0.625rem' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label>URL de la evidencia *</label>
              <input className="input-field" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select className="input-field" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input className="input-field" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Descripción opcional..." />
            </div>
            {form.url && isImage(form.url) && (
              <div style={{ marginBottom: '1rem' }}>
                <img src={form.url} alt="preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Agregar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
