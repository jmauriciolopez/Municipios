import { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: number | string;
  icon: ReactNode;
  sub?: string;
  accent?: string;
};


export default function StatCard({ label, value, icon, sub, accent = '#6366f1' }: StatCardProps) {
  return (
    <div className="stat-card border-l-4" style={{ borderLeftColor: accent }}>
      <div className="flex justify-between items-start mb-2">
        <span className="stat-card-label">{label}</span>
        <div className="stat-card-icon opacity-80" style={{ color: accent }}>{icon}</div>
      </div>
      <div className="stat-card-value font-display tracking-tight" style={{ color: accent }}>{value}</div>
      {sub && (
        <div className="mt-2 pt-2 border-t border-slate-50">
          <span className="stat-card-sub flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {sub}
          </span>
        </div>
      )}
    </div>
  );
}

