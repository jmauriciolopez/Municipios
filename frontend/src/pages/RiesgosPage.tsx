import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import { RiesgoIcon } from '../components/ui/iconMap';
import Modal from '../components/ui/Modal';
import { 
  AlertTriangle, 
  Info, 
  Clock, 
  Trash2, 
  Edit3, 
  X, 
  Plus, 
  Zap,
  Activity,
  Hash,
  Shield,
  FileText
} from 'lucide-react';

type RiesgoRow = {
  id: string; codigo: string; nombre: string; descripcion: string;
  severidad: number; probabilidad: number; nivel: number;
  requiereAccion: boolean; esPreventivo: boolean; sla: number | null;
  area: string; areaId: string; categoria: string; categoriaId: string;
  tipoActivo: string; tipoActivoId: string;
  icono: string; color: string; activo: boolean;
  incidentes: number;
};

type Opt = { id: string; nombre: string };

const FORM_EMPTY = {
  codigo: '', nombre: '', descripcion: '',
  severidadBase: 3, probabilidadBase: 3,
  requiereAccionInmediata: false, esPreventivo: false,
  slaSugeridoHoras: '', icono: '', color: '',
  activo: true, areaId: '', categoriaId: '', tipoActivoId: '',
};

const DEFAULT_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

const calcNivel = (s: number, p: number): number => {
  const n = s * p;
  if (n >= 20) return 5;
  if (n >= 15) return 4;
  if (n >= 10) return 3;
  if (n >= 5)  return 2;
  return 1;
};

const NIVEL_CONFIG: Record<number, { bg: string; text: string; label: string }> = {
  5: { bg: '#fecaca', text: '#7f1d1d', label: 'Crítico' },
  4: { bg: '#fed7aa', text: '#7c2d12', label: 'Alto' },
  3: { bg: '#fef9c3', text: '#713f12', label: 'Medio' },
  2: { bg: '#dcfce7', text: '#166534', label: 'Bajo' },
  1: { bg: '#dbeafe', text: '#1e40af', label: 'Muy bajo' },
};

const NivelBadge = ({ s, p }: { s: number; p: number }) => {
  const nivel = calcNivel(s, p);
  const { bg, text, label } = NIVEL_CONFIG[nivel];
  return (
    <span 
      className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300" 
      style={{ background: bg, color: text, borderColor: `${text}40` }}
    >
      {nivel} · {label}
    </span>
  );
};

export default function RiesgosPage() {
  const [riesgos, setRiesgos] = useState<RiesgoRow[]>([]);
  const [areas, setAreas] = useState<Opt[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [tipos, setTipos] = useState<Opt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [selected, setSelected] = useState<RiesgoRow | null>(null);
  const [modal, setModal] = useState<'crear' | 'editar' | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [guardando, setGuardando] = useState(false);

  const map = (r: any): RiesgoRow => ({
    id: r.id, codigo: r.codigo, nombre: r.nombre,
    descripcion: r.descripcion ?? '—',
    severidad: r.severidadBase, probabilidad: r.probabilidadBase,
    nivel: r.severidadBase * r.probabilidadBase,
    requiereAccion: r.requiereAccionInmediata, esPreventivo: r.esPreventivo,
    sla: r.slaSugeridoHoras ?? null,
    area: r.area?.nombre ?? '—', areaId: r.area?.id ?? '',
    categoria: r.categoria?.nombre ?? '—', categoriaId: r.categoria?.id ?? '',
    tipoActivo: r.tipoActivo?.nombre ?? '—', tipoActivoId: r.tipoActivo?.id ?? '',
    icono: r.icono ?? '', color: r.color ?? '',
    activo: r.activo, incidentes: r._count?.incidentes ?? 0,
  });

  const cargar = () => {
    setLoading(true);
    apiFetch<any[]>('/riesgos')
      .then((data) => setRiesgos(data.map(map)))
      .catch(() => setError('No se pudieron cargar los riesgos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    apiFetch<any[]>('/areas').then((d) => setAreas(d.map((a) => ({ id: a.id, nombre: a.nombre })))).catch((err) => console.error('Error al cargar áreas:', err));
    apiFetch<any[]>('/categorias?activo=true').then(setCategorias).catch((err) => console.error('Error al cargar categorías:', err));
    apiFetch<any[]>('/tipos-activo').then((d) => setTipos(d.map((t) => ({ id: t.id, nombre: t.nombre })))).catch((err) => console.error('Error al cargar tipos de activo:', err));
  }, []);

  const filtered = useMemo(() => riesgos.filter((r) => {
    if (filtroArea && r.areaId !== filtroArea) return false;
    if (filtroTipo && r.tipoActivoId !== filtroTipo) return false;
    if (filtroActivo === 'activo' && !r.activo) return false;
    if (filtroActivo === 'inactivo' && r.activo) return false;
    return true;
  }), [riesgos, filtroArea, filtroTipo, filtroActivo]);

  const abrirCrear = () => { setForm(FORM_EMPTY); setModal('crear'); };
  const abrirEditar = (r: RiesgoRow) => {
    setForm({
      codigo: r.codigo, nombre: r.nombre, descripcion: r.descripcion === '—' ? '' : r.descripcion,
      severidadBase: r.severidad, probabilidadBase: r.probabilidad,
      requiereAccionInmediata: r.requiereAccion, esPreventivo: r.esPreventivo,
      slaSugeridoHoras: r.sla?.toString() ?? '',
      icono: r.icono, color: r.color, activo: r.activo,
      areaId: r.areaId, categoriaId: r.categoriaId, tipoActivoId: r.tipoActivoId,
    });
    setModal('editar');
  };

  const handleGuardar = async () => {
    if (!form.codigo || !form.nombre) { toast.error('Código y nombre son obligatorios.'); return; }
    setGuardando(true);
    try {
      const payload: any = {
        codigo: form.codigo, nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        severidadBase: Number(form.severidadBase),
        probabilidadBase: Number(form.probabilidadBase),
        requiereAccionInmediata: form.requiereAccionInmediata,
        esPreventivo: form.esPreventivo,
        slaSugeridoHoras: form.slaSugeridoHoras ? Number(form.slaSugeridoHoras) : undefined,
        icono: form.icono || undefined, color: form.color || undefined,
        activo: form.activo,
        areaId: form.areaId || undefined,
        categoriaId: form.categoriaId || undefined,
        tipoActivoId: form.tipoActivoId || undefined,
      };
      if (modal === 'crear') await apiFetch('/riesgos', { method: 'POST', body: JSON.stringify(payload) });
      else if (modal === 'editar' && selected) await apiFetch(`/riesgos/${selected.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      setModal(null); cargar();
    } catch { toast.error('Error al guardar.'); }
    finally { setGuardando(false); }
  };

  const handleToggle = async (r: RiesgoRow) => {
    try {
      await apiFetch(`/riesgos/${r.id}/toggle-activo`, { method: 'PATCH' });
      cargar();
    } catch { toast.error('Error al cambiar estado.'); }
  };

  const handleEliminar = async (id: string) => {
    if (!await confirm({ message: '¿Eliminar este riesgo?', confirmLabel: 'Eliminar', danger: true })) return;
    try { await apiFetch(`/riesgos/${id}`, { method: 'DELETE' }); setSelected(null); cargar(); }
    catch { toast.error('Error al eliminar.'); }
  };

  const columns = [
    {
      key: 'nombre', label: 'Riesgo',
      render: (r: RiesgoRow) => (
        <div className="flex items-center gap-2">
          <RiesgoIcon icono={r.icono} size={16} color={r.color || '#64748b'} />
          <div>
            <div className={`font-semibold ${r.activo ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{r.nombre}</div>
            <div className="font-mono text-[10px] uppercase text-slate-400">{r.codigo}</div>
          </div>
        </div>
      ),
    },
    { key: 'nivel', label: 'Nivel', render: (r: RiesgoRow) => <NivelBadge s={r.severidad} p={r.probabilidad} /> },
    { key: 'tipoActivo', label: 'Tipo activo' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'sla', label: 'SLA', render: (r: RiesgoRow) => <span className={`text-[13px] font-medium ${r.sla ? 'text-brand-600' : 'text-slate-400'}`}>{r.sla ? `${r.sla}h` : '—'}</span> },
    {
      key: 'flags', label: '',
      render: (r: RiesgoRow) => (
        <div className="flex gap-1">
          {r.requiereAccion && <span title="Acción inmediata" className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">⚡</span>}
          {r.esPreventivo && <span title="Preventivo" className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">🛡</span>}
          {!r.activo && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">INACTIVO</span>}
        </div>
      ),
    },
    { key: 'incidentes', label: 'Inc.', render: (r: RiesgoRow) => <span className={`font-bold ${r.incidentes > 0 ? 'text-red-600' : 'text-slate-400'}`}>{r.incidentes}</span> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cargando riesgos operativos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="card-premium p-8 text-center max-w-md">
        <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Error de Conexión</h3>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <button className="btn-primary w-full" onClick={cargar}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <div className="flex gap-8 items-start h-full">
      <section className="flex-1 min-w-0 flex flex-col gap-8 h-full">
        <header className="page-header !mb-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Matriz de Riesgos</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Definición y Control Operativo</p>
          </div>
          <button className="btn-primary" onClick={abrirCrear}>
            <Plus size={16} /> Definir Riesgo
          </button>
        </header>

        <FilterBar
          filters={[
            { key: 'area', label: 'Área', value: filtroArea, type: 'select', options: areas.map(a => ({ value: a.id, label: a.nombre })) },
            { key: 'tipo', label: 'Tipo Activo', value: filtroTipo, type: 'select', options: tipos.map(t => ({ value: t.id, label: t.nombre })) },
            { key: 'activo', label: 'Estado', value: filtroActivo, type: 'select', options: [{ value: 'activo', label: 'Solo Activos' }, { value: 'inactivo', label: 'Solo Inactivos' }] },
          ]}
          onChange={(k, v) => {
            if (k === 'area') setFiltroArea(String(v));
            if (k === 'tipo') setFiltroTipo(String(v));
            if (k === 'activo') setFiltroActivo(String(v));
          }}
          onReset={() => { setFiltroArea(''); setFiltroTipo(''); setFiltroActivo(''); }}
        />

        <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-premium">
          <DataTable data={filtered} columns={columns} onRowClick={setSelected} emptyMessage="No hay riesgos registrados" />
        </div>
      </section>

      {/* Detail panel */}
      {selected && (
        <div className="w-[340px] flex-shrink-0 animate-scale-in h-fit sticky top-0">
          <div className="card-premium h-full flex flex-col p-0 overflow-hidden border-brand-100 shadow-premium-xl">
            {/* Header con color de nivel */}
            <div 
              className="p-6 pb-8 text-white relative overflow-hidden" 
              style={{ background: `linear-gradient(135deg, ${NIVEL_CONFIG[calcNivel(selected.severidad, selected.probabilidad)].text}, ${NIVEL_CONFIG[calcNivel(selected.severidad, selected.probabilidad)].text}dd)` }}
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                  <RiesgoIcon icono={selected.icono} size={28} color="white" />
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="mt-6 relative z-10">
                <div className="font-mono text-[10px] font-black tracking-widest uppercase opacity-70 mb-1">{selected.codigo}</div>
                <h3 className="text-xl font-black leading-tight tracking-tight">{selected.nombre}</h3>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-wider">
                  {NIVEL_CONFIG[calcNivel(selected.severidad, selected.probabilidad)].label} — NIVEL {calcNivel(selected.severidad, selected.probabilidad)}
                </div>
              </div>

              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
              <section>
                <h4 className="form-label !mb-3">Métricas de Riesgo</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Severidad</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">{selected.severidad}/5</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Probabilidad</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white">{selected.probabilidad}/5</div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="form-label !mb-3">Clasificación</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 flex-shrink-0">
                      <Info size={20} />
                    </div>
                    <div>
                      <div className="form-label !mb-0 !ml-0">Tipo y Categoría</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {selected.tipoActivo} <span className="text-slate-300 dark:text-slate-600 mx-1">·</span> {selected.categoria}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 flex-shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="form-label !mb-0 !ml-0">SLA Sugerido</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selected.sla ? `${selected.sla} horas` : 'No especificado'}</div>
                    </div>
                  </div>
                </div>
              </section>

              {selected.descripcion !== '—' && (
                <section>
                  <h4 className="form-label !mb-2">Descripción del Riesgo</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {selected.descripcion}
                  </p>
                </section>
              )}

              <section className="mt-auto pt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    className="btn-primary flex-1 shadow-lg shadow-brand-500/20" 
                    onClick={() => abrirEditar(selected)}
                  >
                    <Edit3 size={16} /> Editar
                  </button>
                  <button 
                    className={`btn-secondary flex-1 ${selected.activo ? '' : '!bg-emerald-50 !text-emerald-700 !border-emerald-100'}`} 
                    onClick={() => handleToggle(selected)}
                  >
                    {selected.activo ? 'Desactivar' : 'Reactivar'}
                  </button>
                </div>
                <button 
                  className="btn-danger w-full justify-center" 
                  onClick={() => handleEliminar(selected.id)}
                >
                  <Trash2 size={16} /> Eliminar Riesgo
                </button>
              </section>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'crear' ? 'Definición de Riesgo' : 'Edición de Riesgo'}
        subtitle={modal === 'crear' ? 'Registro de Amenazas Operativas' : 'Ajuste de Parámetros Críticos'}
        maxWidth="720px"
      >
        <div className="space-y-10 py-2">
          {/* SECCIÓN 1: IDENTIDAD */}
          <section>
            <div className="modal-section-header">
              <Shield className="text-brand-500" size={18} />
              <h4 className="flex items-center gap-2">
                Identidad y Clasificación
                <span className="line"></span>
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="form-group md:col-span-1">
                <label className="form-label flex items-center gap-2">
                  <Hash size={12} className="text-brand-500" />
                  Código de Sistema *
                </label>
                <input 
                  className="input-premium uppercase font-mono tracking-widest text-brand-600 font-bold" 
                  value={form.codigo} 
                  onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} 
                  placeholder="EJ: RI-VIV-01" 
                />
              </div>

              <div className="form-group md:col-span-1">
                <label className="form-label">Nombre del Riesgo *</label>
                <input 
                  className="input-premium" 
                  value={form.nombre} 
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                  placeholder="Nombre técnico del riesgo..." 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Área Responsable</label>
                <select className="input-premium" value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })}>
                  <option value="">Seleccionar área...</option>
                  {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Categoría de Servicio</label>
                <select className="input-premium" value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
                  <option value="">Sin categoría</option>
                  {categorias.filter((c: any) => !c.padre).map((padre: any) => (
                    <optgroup key={padre.id} label={padre.nombre}>
                      {categorias.filter((c: any) => c.padre?.id === padre.id).map((h: any) => (
                        <option key={h.id} value={h.id}>{h.nombre}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: MATRIZ */}
          <section>
            <div className="modal-section-header">
              <Activity className="text-indigo-500" size={18} />
              <h4 className="flex items-center gap-2">
                Análisis de Criticidad
                <span className="line"></span>
              </h4>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-2xl mb-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle size={120} className="text-brand-400" />
              </div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <label className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severidad Base</span>
                      <span className="text-emerald-400 font-mono font-bold">{form.severidadBase}/5</span>
                    </label>
                    <input 
                      type="range" min={1} max={5} 
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" 
                      value={form.severidadBase} 
                      onChange={(e) => setForm({ ...form, severidadBase: Number(e.target.value) })} 
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Probabilidad Base</span>
                      <span className="text-blue-400 font-mono font-bold">{form.probabilidadBase}/5</span>
                    </label>
                    <input 
                      type="range" min={1} max={5} 
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                      value={form.probabilidadBase} 
                      onChange={(e) => setForm({ ...form, probabilidadBase: Number(e.target.value) })} 
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-l border-slate-800 pl-8 space-y-4">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Resultado</span>
                    <NivelBadge s={Number(form.severidadBase)} p={Number(form.probabilidadBase)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-white italic">
                        {Number(form.severidadBase) * Number(form.probabilidadBase)}
                      </span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Puntaje</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">SLA Respuesta (Horas)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="number" className="input-premium pl-10" 
                    value={form.slaSugeridoHoras} 
                    onChange={(e) => setForm({ ...form, slaSugeridoHoras: e.target.value })} 
                    placeholder="Ej: 24" 
                  />
                </div>
              </div>

              <div className="form-group flex items-end">
                <label className="flex items-center gap-3 p-3 w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-all border border-slate-100 dark:border-slate-800">
                  <input 
                    type="checkbox" checked={form.requiereAccionInmediata} 
                    onChange={(e) => setForm({ ...form, requiereAccionInmediata: e.target.checked })} 
                    className="w-5 h-5 accent-red-600 rounded-lg shadow-sm" 
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Acción Inmediata ⚡</span>
                  </div>
                </label>
              </div>

              <div className="form-group flex items-end">
                <label className="flex items-center gap-3 p-3 w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-all border border-slate-100 dark:border-slate-800">
                  <input 
                    type="checkbox" checked={form.esPreventivo} 
                    onChange={(e) => setForm({ ...form, esPreventivo: e.target.checked })} 
                    className="w-5 h-5 accent-brand-500 rounded-lg shadow-sm" 
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estrategia</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Preventivo 🛡</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: ESTÉTICA */}
          <section>
            <div className="modal-section-header">
              <Zap className="text-amber-500" size={18} />
              <h4 className="flex items-center gap-2">
                Identificador Visual
                <span className="line-short"></span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
               <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label opacity-60">Símbolo Lucide (Referencia)</label>
                    <input 
                      className="input-premium font-mono text-sm" 
                      value={form.icono} 
                      onChange={(e) => setForm({ ...form, icono: e.target.value })} 
                      placeholder="Ej: AlertTriangle, Fire..." 
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_COLORS.map((c) => (
                      <button 
                        key={c} type="button"
                        onClick={() => setForm({ ...form, color: c })} 
                        className={`w-10 h-10 rounded-full border-4 transition-all ${form.color === c ? 'border-brand-500 scale-110 shadow-xl shadow-brand-500/20' : 'border-white dark:border-slate-800 shadow-sm opacity-80 hover:opacity-100'}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
               </div>

               <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-500/10 rounded-full blur-2xl group-hover:bg-brand-500/20 transition-colors" />
                    <div 
                      className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex items-center justify-center border border-white dark:border-slate-800 relative z-10 transition-transform group-hover:scale-110 duration-500"
                    >
                      <RiesgoIcon icono={form.icono} size={48} color={form.color || '#64748b'} />
                    </div>
                  </div>
               </div>
            </div>
          </section>

          {/* SECCIÓN 4: DESCRIPCIÓN */}
          <section>
            <div className="modal-section-header">
              <FileText className="text-slate-500" size={18} />
              <h4 className="flex items-center gap-2">
                Documentación Técnica
                <span className="line"></span>
              </h4>
            </div>
            <textarea 
              className="input-premium min-h-[120px] py-4" 
              value={form.descripcion} 
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
              placeholder="Describa el riesgo, sus posibles impactos en la infraestructura y las medidas de mitigación recomendadas..." 
            />
          </section>
        </div>

        <div className="modal-footer mt-10">
          <button className="btn-secondary" onClick={() => setModal(null)}>
            Cancelar
          </button>
          <button 
            className="btn-primary min-w-[180px]"
            onClick={handleGuardar} 
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : (modal === 'crear' ? 'Registrar Riesgo' : 'Actualizar Definición')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
