type StatusBadgeProps = { status: string };

const STATUS_CLASS: Record<string, string> = {
  abierto: 'status-abierto',
  en_proceso: 'status-en_proceso',
  resuelto: 'status-resuelto',
  cerrado: 'status-cerrado',
  cancelado: 'status-cancelado',
  detectado: 'status-detectado',
  asignado: 'status-asignado',
  verificado: 'status-verificado',
  operativo: 'status-operativo',
  en_mantenimiento: 'status-en_mantenimiento',
  fuera_servicio: 'status-fuera_servicio',
  dado_de_baja: 'status-dado_de_baja',
  disponible: 'status-disponible',
  ocupada: 'status-ocupada',
  critica: 'status-critica',
  alta: 'status-alta',
  media: 'status-media',
  baja: 'status-baja',
};

const STATUS_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  en_mantenimiento: 'En mantenimiento',
  fuera_servicio: 'Fuera de servicio',
  dado_de_baja: 'Dado de baja',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cls = STATUS_CLASS[status] ?? 'status-default';
  const label = STATUS_LABEL[status] ?? status.replace(/_/g, ' ');
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
