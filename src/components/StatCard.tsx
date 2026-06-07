import React from 'react';

type Props = { title: string; value: string | number; subtitle?: string; color?: string };
export default function StatCard({ title, value, subtitle, color }: Props) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value" style={color ? { color } : undefined}>{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}