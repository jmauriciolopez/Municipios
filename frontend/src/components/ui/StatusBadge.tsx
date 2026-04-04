type StatusBadgeProps = { 
  status: string;
  showLabel?: boolean;
};

const STATUS_CLASS: Record<string, string> = {
  // Incidentes / Tareas
  abierto: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  en_proceso: 'bg-blue-50 text-blue-700 border-blue-100',
  resuelto: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cerrado: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelado: 'bg-rose-50 text-rose-700 border-rose-100',
  
  // Flujo de revision
  detectado: 'bg-amber-50 text-amber-700 border-amber-100',
  asignado: 'bg-violet-50 text-violet-700 border-violet-100',
  verificado: 'bg-teal-50 text-teal-700 border-teal-100',
  
  // Activos / Equipos
  operativo: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  en_mantenimiento: 'bg-amber-50 text-amber-700 border-amber-100',
  fuera_servicio: 'bg-rose-50 text-rose-700 border-rose-100',
  dado_de_baja: 'bg-slate-200 text-slate-700 border-slate-300',
  
  // Otros
  disponible: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  ocupada: 'bg-amber-50 text-amber-700 border-amber-100',
  
  // Prioridades
  critica: 'bg-rose-100 text-rose-800 border-rose-200 font-bold animate-pulse',
  alta: 'bg-rose-50 text-rose-700 border-rose-100 font-semibold',
  media: 'bg-amber-50 text-amber-700 border-amber-100 font-semibold',
  baja: 'bg-slate-50 text-slate-600 border-slate-100 font-medium',
};

const STATUS_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  en_mantenimiento: 'En mantenimiento',
  fuera_servicio: 'Fuera de servicio',
  dado_de_baja: 'Dado de baja',
};

export default function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() ?? 'default';
  const cls = STATUS_CLASS[normalizedStatus] ?? 'bg-slate-50 text-slate-600 border-slate-100';
  const label = STATUS_LABEL[normalizedStatus] ?? status?.replace(/_/g, ' ') ?? 'Desconocido';
  
  return (
    <span className={`inline-flex items-center ${showLabel ? 'px-2.5 py-0.5' : 'p-1.5'} rounded-full text-xs font-medium border transition-colors duration-200 ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-60 ${showLabel ? 'mr-1.5' : ''}`}></span>
      {showLabel && label}
    </span>
  );
}


