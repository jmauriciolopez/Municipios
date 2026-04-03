type StatCardProps = {
  label: string;
  value: number | string;
  icon: string;
  sub?: string;
  accent?: string;
};

export default function StatCard({ label, value, icon, sub, accent = '#1d4ed8' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value" style={{ color: accent }}>{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}
