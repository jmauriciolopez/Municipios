type EmptyStateProps = { message?: string };

export default function EmptyState({ message = 'No hay resultados.' }: EmptyStateProps) {
  return <div className="empty-state">{message}</div>;
}
