type StatCardProps = { title: string; value: string | number; subtitle?: string };

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <article className="stat-card">
      <h4>{title}</h4>
      <p className="value">{value}</p>
      {subtitle && <small>{subtitle}</small>}
    </article>
  );
}
