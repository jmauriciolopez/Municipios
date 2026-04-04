import { useEffect, useMemo, useState } from 'react';
import { getCuadrillas, setDisponibilidadCuadrilla, getOrdenesCuadrilla, createCuadrilla } from '@shared/services/cuadrillas.api';
import { apiFetch } from '../services/apiFetch';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import DetailDrawer from '../components/ui/DetailDrawer';
import {
  Users,
  UserPlus,
  Plus,
  Shield,
  MapPin,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Activity,
  MoreHorizontal,
  Trash,
  UserCheck,
  Briefcase,
  History,
  Layout,
  Contact,
  Info,
  ArrowRight
} from 'lucide-react';

type Miembro = { id: string; nombre: string; rol?: string; usuario?: any };

type CuadrillaRow = {
  id: string;
  nombre: string;
  estado: string;
  area: string;
  areaId: string;
  supervisor: string;
  miembros: Miembro[];
  ordenes: number;
};

type FormCuadrilla = { nombre: string; areaId: string; supervisorId: string };
const FORM_EMPTY: FormCuadrilla = { nombre: '', areaId: '', supervisorId: '' };
const ESTADOS = ['disponible', 'ocupada', 'fuera_servicio'] as const;

export default function CuadrillasPage() {
  const [cuadrillas, setCuadrillas] = useState<CuadrillaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estado, setEstado] = useState('');
  const [area, setArea] = useState('');
  const [selected, setSelected] = useState<CuadrillaRow | null>(null);
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [cambiando, setCambiando] = useState<string | null>(null);
  const [modalMiembro, setModalMiembro] = useState(false);
  const [personas, setPersonas] = useState<any[]>([]);
  const [formMiembro, setFormMiembro] = useState({ personaId: '', rol: '' });
  const [guardandoMiembro, setGuardandoMiembro] = useState(false);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormCuadrilla>(FORM_EMPTY);
  const [areas, setAreas] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);

  const cargar = () => {
    setLoading(true);
    getCuadrillas()
      .then((data: any[]) =>
        setCuadrillas(
          data.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            estado: c.estado,
            area: c.area?.nombre ?? 'Sin Área',
            areaId: c.area?.id ?? c.areaId ?? '',
            supervisor: c.supervisor?.nombre ?? c.supervisor?.email ?? 'Sin asignar',
            miembros: (c.miembros ?? []).map((m: any) => ({
              id: m.id,
              nombre: m.persona?.nombre ?? m.persona?.usuario?.nombre ?? '',
              rol: m.rol,
              usuario: m.persona?.usuario ?? null,
            })),
            ordenes: c.ordenes?.length ?? 0,
          }))
        )
      )
      .catch(() => setError('No se pudieron sincronizar los equipos operativos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
    apiFetch<any[]>('/areas').then(setAreas).catch(() => { });
    apiFetch<any[]>('/personas?activo=true').then(setPersonas).catch(() => { });
  }, []);

  const areasUnicas = useMemo(
    () => [...new Map(cuadrillas.filter((c) => c.area !== 'Sin Área').map((c) => [c.areaId, c.area])).entries()],
    [cuadrillas]
  );

  const filtered = useMemo(
    () =>
      cuadrillas.filter((c) => {
        if (estado && c.estado !== estado) return false;
        if (area && c.areaId !== area) return false;
        return true;
      }),
    [cuadrillas, estado, area]
  );

  const handleSelect = async (c: CuadrillaRow) => {
    setSelected(c);
    setLoadingOrdenes(true);
    try {
      const data = await getOrdenesCuadrilla(c.id) as any[];
      setOrdenes(data ?? []);
    } catch {
      setOrdenes([]);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: string) => {
    setCambiando(id);
    try {
      await setDisponibilidadCuadrilla(id, nuevoEstado);
      setCuadrillas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
      );
      if (selected?.id === id) setSelected((s) => s ? { ...s, estado: nuevoEstado } : s);
      toast.success(`Estado de cuadrilla: ${nuevoEstado.replace('_', ' ')}`);
    } catch {
      toast.error('Error al actualizar disponibilidad.');
    } finally {
      setCambiando(null);
    }
  };

  const handleCrear = async () => {
    if (!form.nombre) { toast.error('El nombre de la cuadrilla es obligatorio.'); return; }
    setGuardando(true);
    try {
      await createCuadrilla({ nombre: form.nombre, areaId: form.areaId || undefined, supervisorId: form.supervisorId || undefined } as any);
      setModal(false);
      setForm(FORM_EMPTY);
      cargar();
      toast.success('Equipo operativo registrado');
    } catch {
      toast.error('Error al registrar la cuadrilla.');
    } finally {
      setGuardando(false);
    }
  };

  const handleAddMiembro = async () => {
    if (!selected || !formMiembro.personaId) { toast.error('Seleccione un recurso humano.'); return; }
    setGuardandoMiembro(true);
    try {
      const nuevo = await apiFetch<any>(`/cuadrillas/${selected.id}/miembros`, {
        method: 'POST',
        body: JSON.stringify({ personaId: formMiembro.personaId, rol: formMiembro.rol || undefined }),
      });
      const miembroMapeado = {
        id: nuevo.id,
        usuario: nuevo.persona?.usuario ?? null,
        nombre: nuevo.persona?.nombre ?? '',
        rol: nuevo.rol,
      };
      setSelected((s) => s ? { ...s, miembros: [...s.miembros, miembroMapeado] } : s);
      setCuadrillas((prev) => prev.map((c) => c.id === selected.id ? { ...c, miembros: [...c.miembros, miembroMapeado] } : c));
      setModalMiembro(false);
      setFormMiembro({ personaId: '', rol: '' });
      toast.success('Recurso asignado al equipo');
    } catch {
      toast.error('Error al procesar asignación.');
    } finally {
      setGuardandoMiembro(false);
    }
  };

  const handleRemoveMiembro = async (miembroId: string) => {
    if (!selected || !await confirm({
      message: '¿Confirma la desvinculación de este miembro de la cuadrilla?',
      confirmLabel: 'Desvincular Recurso',
      danger: true
    })) return;

    try {
      await apiFetch(`/cuadrillas/${selected.id}/miembros/${miembroId}`, { method: 'DELETE' });
      setSelected((s) => s ? { ...s, miembros: s.miembros.filter((m) => m.id !== miembroId) } : s);
      setCuadrillas((prev) => prev.map((c) => c.id === selected.id ? { ...c, miembros: c.miembros.filter((m) => m.id !== miembroId) } : c));
      toast.success('Vínculo operativo removido');
    } catch {
      toast.error('Error al remover el miembro.');
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Equipo Operativo',
      render: (c: CuadrillaRow) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 border border-brand-500/20 shadow-sm">
            <Briefcase size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">{c.nombre}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.area}</span>
          </div>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Disponibilidad',
      render: (c: CuadrillaRow) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={c.estado} />
          <div className="relative group/sel">
            <select
              value={c.estado}
              disabled={cambiando === c.id}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleCambiarEstado(c.id, e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 cursor-pointer hover:border-brand-500/50 transition-all focus:ring-0 focus:outline-none pr-6"
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e.replace('_', ' ')}</option>
              ))}
            </select>
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/sel:text-brand-500 transition-colors">
              <MoreHorizontal size={10} />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'miembros',
      label: 'Dotación',
      render: (c: CuadrillaRow) => (
        <div className="flex items-center gap-2">
          <Users size={12} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{c.miembros.length} Miembros</span>
        </div>
      ),
    },
    {
      key: 'ordenes',
      label: 'Carga Laboral',
      render: (c: CuadrillaRow) => (
        <div className="flex items-center gap-2">
          <ClipboardList size={12} className={c.ordenes > 0 ? 'text-amber-500' : 'text-slate-300'} />
          <span className={`text-xs font-black ${c.ordenes > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-300 leading-none'}`}>
            {c.ordenes} ÓRDENES
          </span>
        </div>
      ),
    },
    {
      key: 'acciones',
      label: '',
      render: () => (
        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
             <ArrowRight size={18} />
           </div>
        </div>
      )
    }
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
      <Activity size={40} className="text-brand-500 animate-spin" />
      <span className="font-black text-[10px] uppercase tracking-[0.4em]">Sincronizando Escuadrones...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-red-500">
      <AlertCircle size={40} />
      <span className="font-bold text-sm tracking-tight text-center max-w-xs">{error}</span>
      <button className="btn-secondary" onClick={cargar}>Reintentar Conexión</button>
    </div>
  );

  return (
    <div className="flex gap-8 items-start h-full pb-8">
      <section className="flex-1 min-w-0 flex flex-col gap-8 h-full">
        <header className="page-header !mb-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-brand-500 mb-1">
              <Users size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cuerpo Operativo</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Cuadrillas</h2>
          </div>
          <button className="btn-primary" onClick={() => { setForm(FORM_EMPTY); setModal(true); }}>
            <Plus size={18} />
            <span>Nueva Cuadrilla</span>
          </button>
        </header>

        <FilterBar
          filters={[
            {
              key: 'estado', label: 'Disponibilidad', value: estado, type: 'select',
              options: [
                { value: '', label: 'Todos los Estados' },
                { value: 'disponible', label: 'Disponible' },
                { value: 'ocupada', label: 'Ocupada' },
                { value: 'fuera_servicio', label: 'Fuera de Servicio' },
              ],
            },
            {
              key: 'area', label: 'Área Operativa', value: area, type: 'select',
              options: [{ value: '', label: 'Todas las Áreas' }, ...areasUnicas.map(([id, nombre]) => ({ value: id, label: nombre }))],
            },
          ]}
          onChange={(key, value) => {
            if (key === 'estado') setEstado(String(value));
            if (key === 'area') setArea(String(value));
          }}
          onReset={() => { setEstado(''); setArea(''); }}
        />

        <div className="flex-1 overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-premium">
          <DataTable data={filtered} columns={columns} onRowClick={handleSelect} emptyMessage="No hay equipos operativos registrados" />
        </div>
      </section>

      <DetailDrawer
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Equipo Operativo"
        subtitle={selected?.nombre}
      >
        {selected && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
            <div className={`p-6 rounded-3xl text-white relative overflow-hidden shadow-xl mb-6 ${selected.estado === 'disponible' ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : selected.estado === 'ocupada' ? 'bg-gradient-to-br from-brand-600 to-brand-800' : 'bg-gradient-to-br from-slate-600 to-slate-800'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                <Briefcase size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                   <div className="font-mono text-[10px] font-black tracking-[0.2em] uppercase opacity-60 leading-none">{selected.area}</div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4">{selected.nombre}</h3>
                <StatusBadge status={selected.estado} showLabel={true} />
              </div>
            </div>

            <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 text-brand-500 shadow-sm">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1">Supervisor de Equipo</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">{selected.supervisor}</span>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-brand-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dotación ({selected.miembros.length})</span>
                </div>
                <button
                  onClick={() => { setFormMiembro({ personaId: '', rol: '' }); setModalMiembro(true); }}
                  className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg text-[10px] font-black border border-brand-200 transition-all flex items-center gap-1.5"
                >
                  <UserPlus size={10} /> ASIGNAR
                </button>
              </div>

              {selected.miembros.length === 0 ? (
                <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-3 opacity-50">
                  <Users size={24} className="text-slate-300" />
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Sin Personal Asignado</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {selected.miembros.map((m: Miembro) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 group/item">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-black border border-slate-100 dark:border-slate-800 text-slate-400 uppercase">
                        {m.nombre.slice(0, 2)}
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{m.nombre}</span>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{m.rol || 'Operario'}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMiembro(m.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-400 opacity-0 group-hover/item:opacity-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <History size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tareas en Ejecución</span>
              </div>

              {loadingOrdenes ? (
                <div className="flex items-center gap-3 p-4">
                  <Activity size={14} className="animate-spin text-slate-300" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Consultando Registro...</span>
                </div>
              ) : ordenes.length === 0 ? (
                <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 text-center border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-300 uppercase italic">Libre de Siniestros y Tareas</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {ordenes.map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] font-black text-brand-600 dark:text-brand-400 tracking-widest leading-none">{o.codigo}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 leading-none">REF: #{o.id.slice(-4)}</span>
                      </div>
                      <StatusBadge status={o.estado} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="pt-4">
               <button 
                 onClick={() => setSelected(null)}
                 className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-2xl border border-slate-200 transition-all"
               >
                 Ocultar Panel
               </button>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Modal Creación */}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Nuevo Equipo Operativo"
        subtitle="Definición de cuadrillas y estructura de mando"
        maxWidth="550px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors" onClick={() => setModal(false)}>
              Descartar
            </button>
            <button
              className="px-8 py-2.5 bg-brand-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleCrear}
              disabled={guardando}
            >
              {guardando ? 'Procesando...' : 'Registrar Cuadrilla'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10 py-4">
          {/* Section Identity */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identidad de Equipo</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="form-label flex items-center gap-2">
                <Briefcase size={12} className="text-brand-500" />
                Nombre / Designación de Escuadrón *
              </label>
              <input
                className="input-premium font-bold"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Cuadrilla Alfa 1 - Zona Norte"
              />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estructura Operativa</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Layout size={12} className="text-brand-500" />
                  Área Jurisdiccional
                </label>
                <div className="relative">
                  <select
                    className="input-premium font-bold pl-12 appearance-none active:ring-brand-500"
                    value={form.areaId}
                    onChange={(e) => setForm({ ...form, areaId: e.target.value })}
                  >
                    <option value="">Sin Área Asignada</option>
                    {areas.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none opacity-50">
                    <MapPin size={16} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="form-label flex items-center gap-2">
                  <Shield size={12} className="text-brand-500" />
                  Supervisor / Responsable
                </label>
                <div className="relative">
                  <select
                    className="input-premium font-bold pl-12 appearance-none active:ring-brand-500"
                    value={form.supervisorId}
                    onChange={(e) => setForm({ ...form, supervisorId: e.target.value })}
                  >
                    <option value="">Sin Supervisor</option>
                    {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none opacity-50">
                    <UserCheck size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Footer */}
          <div className="p-6 rounded-[2rem] bg-brand-500/5 border border-brand-500/10 dark:bg-brand-500/10 dark:border-brand-500/20 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h5 className="text-xs font-black text-brand-900 dark:text-brand-300 uppercase tracking-widest leading-none mb-1">Equipo Verificado</h5>
                <p className="text-[10px] text-brand-700/80 dark:text-brand-400/80 font-bold italic">Configuración jerárquica completada</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Agregar Miembro */}
      <Modal
        isOpen={modalMiembro}
        onClose={() => setModalMiembro(false)}
        title="Asignación de Recurso Humano"
        subtitle="Incorporación de personal al desplegué operativo"
        maxWidth="500px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors" onClick={() => setModalMiembro(false)}>
              Cancelar
            </button>
            <button
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleAddMiembro}
              disabled={guardandoMiembro}
            >
              {guardandoMiembro ? 'Asignando...' : 'Vincular al Equipo'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-8 py-4">
          {/* Person Selection */}
          <div className="flex flex-col gap-2.5">
            <label className="form-label flex items-center gap-2">
              <Contact size={12} className="text-blue-500" />
              Personal Disponible *
            </label>
            <div className="relative">
              <select
                className="input-premium font-bold pl-12 h-14 appearance-none"
                value={formMiembro.personaId}
                onChange={(e) => setFormMiembro({ ...formMiembro, personaId: e.target.value })}
              >
                <option value="">Seleccionar Personal...</option>
                {personas.map((p) => <option key={p.id} value={p.id}>{p.nombre}{p.dni ? ` (DNI: ${p.dni})` : ''}</option>)}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                <Users size={20} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Solo se listan recursos con legajo activo en sistema.</p>
          </div>

          {/* Role Definition */}
          <div className="flex flex-col gap-2.5">
            <label className="form-label flex items-center gap-2">
              <Shield size={12} className="text-blue-500" />
              Rol Operativo / Función
            </label>
            <div className="relative">
              <input
                className="input-premium pl-12 h-14 font-bold"
                value={formMiembro.rol}
                onChange={(e) => setFormMiembro({ ...formMiembro, rol: e.target.value })}
                placeholder="Ej: Conductor de Maquinaria, Operario Especializado..."
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 opacity-50 pointer-events-none">
                <Shield size={20} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
            <Info size={20} className="text-blue-500 opacity-50" />
            <p className="text-[11px] text-blue-700/80 font-bold leading-tight">
              La asignación registrará la disponibilidad inmediata del recurso para las órdenes de trabajo enviadas a este equipo.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
