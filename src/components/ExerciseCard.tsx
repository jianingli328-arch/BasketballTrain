import React from 'react';
import type { Exercise } from '../types/exercise';

const CAT_COLORS: Record<string, string> = {
  '原地运球': '#1565C0', '行进间组合': '#E65100', '运球终结': '#2E7D32', '投篮': '#6A1B9A',
};
const UNIT_LABELS: Record<string, string> = { reps: '次', seconds: '秒', made_attempts: '出手', weight_reps: '次' };

type Props = { exercise: Exercise; onPress?: () => void; rightAction?: React.ReactNode };

export default function ExerciseCard({ exercise, onPress, rightAction }: Props) {
  const color = CAT_COLORS[exercise.category] || '#999';
  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '14px 16px',
        marginBottom: 6, border: '1px solid var(--border)', cursor: onPress ? 'pointer' : 'default',
        opacity: exercise.archived ? 0.55 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 12, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text)', textDecoration: exercise.archived ? 'line-through' : 'none' }}>
            {exercise.name}
          </div>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
            {exercise.defaultSets}组 × {exercise.defaultTarget}{UNIT_LABELS[exercise.unitType] || ''}
            {exercise.archived ? ' · 已归档' : ''}
          </div>
        </div>
      </div>
      {rightAction}
    </div>
  );
}