type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
};

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      {trend ? <p className="stat-trend">{trend}</p> : null}
    </div>
  );
}
