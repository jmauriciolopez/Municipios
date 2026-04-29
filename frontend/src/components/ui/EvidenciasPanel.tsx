import { useEffect, useState } from 'react';
import { apiFetch } from '../../services/apiFetch';
import Modal from './Modal';
import { Image as ImageIcon, FileText, Trash2, Plus, ExternalLink, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

type Evidencia = { 
  id: string; 
  url: string; 
  tipo: string; 
  caption?: string; 
  timestampFoto: string; 
  tomadoPorU?: { nombre: string; email: string } 
};

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
      .catch((err) => console.error('Error al cargar evidencias:', err))
      .finally(() => setLoading(false));

  useEffect(() => { cargar(); }, [entidadTipo, entidadId]);

  const handleGuardar = async () => {
    if (!form.url) { toast.error('La URL es obligatoria.'); return; }
    setGuardando(true);
    try {
      await apiFetch('/evidencias', { 
        method: 'POST', 
        body: JSON.stringify({ 
          entidadTipo, 
          entidadId, 
          url: form.url, 
          tipo: form.tipo, 
          caption: form.caption || undefined 
        }) 
      });
      setModal(false);
      setForm({ url: '', tipo: 'antes', caption: '' });
      cargar();
      toast.success('Evidencia agregada');
    } catch { 
      toast.error('Error al guardar la evidencia.'); 
    } finally { 
      setGuardando(false); 
    }
  };

  const handleEliminar = async (id: string) => {
    setEliminando(id);
    try {
      await apiFetch(`/evidencias/${id}`, { method: 'DELETE' });
      setEvidencias((prev) => prev.filter((e) => e.id !== id));
      toast.success('Evidencia eliminada');
    } catch { 
      toast.error('Error al eliminar.'); 
    } finally { 
      setEliminando(null); 
    }
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 transition-all hover:shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
            <ImageIcon size={18} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900 leading-none">Documentación Visual</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{evidencias.length} elemento{evidencias.length !== 1 ? 's' : ''} registrado{evidencias.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button 
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-indigo-100 hover:shadow-indigo-200/50 active:scale-95"
          onClick={() => setModal(true)}
        >
          <Plus size={14} />
          Agregar Evidencia
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent shadow-sm"></div>
        </div>
      ) : evidencias.length === 0 ? (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center group transition-colors hover:border-indigo-200 hover:bg-indigo-50/30">
          <div className="w-14 h-14 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm transition-all group-hover:scale-110 group-hover:text-indigo-400 group-hover:border-indigo-100">
            <ImageIcon size={28} />
          </div>
          <p className="text-sm font-medium text-slate-500">No hay evidencias registradas para este elemento.</p>
          <p className="text-[11px] text-slate-400 mt-1">Hacé clic en el botón superior para agregar una nueva.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {evidencias.map((e) => (
            <div key={e.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col">
              <div className="relative aspect-video overflow-hidden bg-slate-100 border-b border-slate-100">
                {isImage(e.url) ? (
                  <img src={e.url} alt={e.caption ?? e.tipo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                    <FileText size={48} strokeWidth={1.2} />
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <a href={e.url} target="_blank" rel="noreferrer" className="p-2.5 bg-white rounded-xl text-slate-800 hover:bg-indigo-600 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95">
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={() => handleEliminar(e.id)}
                    disabled={eliminando === e.id}
                    className="p-2.5 bg-white rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-white/95 backdrop-blur-md text-indigo-700 rounded-lg shadow-sm border border-indigo-100/50">
                    {e.tipo}
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  {e.caption && <p className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 mb-3 min-h-[2.5rem] group-hover:text-indigo-900 transition-colors">{e.caption}</p>}
                  {!e.caption && <p className="text-[13px] italic text-slate-400 mb-3 min-h-[2.5rem]">Sin descripción añadida</p>}
                </div>
                
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Calendar size={12} className="text-slate-300" />
                    <span>{new Date(e.timestampFoto).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {e.tomadoPorU && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold truncate bg-slate-50/80 p-1.5 rounded-lg border border-slate-100/50">
                      <User size={12} className="text-slate-400" />
                      <span>{e.tomadoPorU.nombre ?? e.tomadoPorU.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal 
          isOpen={modal} 
          onClose={() => setModal(false)} 
          title="Nueva evidencia"
          maxWidth="max-w-md"
        >
          <div className="space-y-5">
            <div className="form-group">
              <label className="form-label font-bold text-slate-700 mb-2 block">Imagen o Documento *</label>
              <div className="relative group">
                <input 
                  className="input-premium pl-11 h-12 focus:ring-4 focus:ring-indigo-100/50" 
                  value={form.url} 
                  onChange={(e) => setForm({ ...form, url: e.target.value })} 
                  placeholder="Pegá el enlace de la imagen aquí..." 
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500">
                  <ImageIcon size={20} />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 pl-1 italic">Soporta enlaces públicos de imágenes y documentos PDF.</p>
            </div>

            <div className="form-group font-bold">
              <label className="form-label text-slate-700 mb-2 block">Tipo de registro</label>
              <div className="relative">
                <select 
                  className="input-premium appearance-none h-12 text-slate-700 font-semibold pr-10" 
                  value={form.tipo} 
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {TIPOS.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Plus size={16} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label font-bold text-slate-700 mb-2 block">Notas adicionales</label>
              <textarea 
                className="input-premium min-h-[100px] py-3 text-sm focus:ring-4 focus:ring-indigo-100/50" 
                value={form.caption} 
                onChange={(e) => setForm({ ...form, caption: e.target.value })} 
                placeholder="Escribí una breve reseña de lo que se observa..." 
              />
            </div>

            {form.url && isImage(form.url) && (
              <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 relative group">
                <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-indigo-600 shadow-sm border border-indigo-100 uppercase tracking-tighter shadow-indigo-100">Vista Previa</div>
                <img 
                  src={form.url} 
                  alt="preview" 
                  className="w-full max-h-56 object-cover object-center transition-all duration-500 group-hover:scale-105" 
                  onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')} 
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
              <button 
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all" 
                onClick={() => setModal(false)}
              >
                Cerrar
              </button>
              <button 
                className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(79,70,229,0.4)] flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:hover:bg-indigo-600"
                onClick={handleGuardar} 
                disabled={guardando}
              >
                {guardando ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
                ) : (
                  <>Guardar Evidencia</>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
