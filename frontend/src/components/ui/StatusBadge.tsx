type StatusBadgeProps = { status: string };

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = status.toLowerCase().includes('abierto')
    ? 'status-open'
    : status.toLowerCase().includes('resuelto')
    ? 'status-resolved'
    : 'status-default';

  return <span className={`status-badge ${colorClass}`}>{status}</span>;
}
