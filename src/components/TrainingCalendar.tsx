import React, { useState } from 'react';
import { getCalendarGrid, toDateString, formatDate } from '../utils/date';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

type Props = { trainingDates: Set<string>; onDayPress?: (dateStr: string) => void };

export default function TrainingCalendar({ trainingDates, onDayPress }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const todayStr = formatDate(today);
  const grid = getCalendarGrid(year, month);
  const weeks = [];
  for (let i = 0; i < 6; i++) weeks.push(grid.slice(i * 7, i * 7 + 7));

  const go = (dy: number, dm: number) => {
    const d = new Date(year + dy, month + dm, 1);
    setYear(d.getFullYear()); setMonth(d.getMonth());
  };

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 12, border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn-outline" style={{ fontSize: 16, padding: '4px 10px' }} onClick={() => go(0, -1)}>{'<'}</button>
        <button style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }}>
          {year}年{month + 1}月
        </button>
        <button className="btn-outline" style={{ fontSize: 16, padding: '4px 10px' }} onClick={() => go(0, 1)}>{'>'}</button>
      </div>
      {/* Weekday labels */}
      <div style={{ display: 'flex', marginBottom: 4 }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ flex: 1, textAlign: 'center', padding: '2px 0', fontSize: 'var(--font-xs)', color: (w === '六' || w === '日') ? 'var(--text-tertiary)' : 'var(--text-secondary)', fontWeight: 500 }}>{w}</div>
        ))}
      </div>
      {/* Days */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex' }}>
          {week.map((cell, ci) => {
            const dateStr = toDateString(cell.year, cell.month, cell.day);
            const isToday = dateStr === todayStr;
            const hasTraining = trainingDates.has(dateStr);
            const isCurrent = cell.isCurrentMonth;
            return (
              <div key={ci} style={{ flex: 1, textAlign: 'center', padding: 2 }}>
                <div
                  onClick={() => onDayPress?.(dateStr)}
                  style={{
                    width: 32, height: 32, margin: '0 auto', borderRadius: '50%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    background: isToday ? 'var(--primary)' : hasTraining && isCurrent ? 'var(--primary)10' : undefined,
                    border: hasTraining && isCurrent && !isToday ? '1.5px solid var(--primary)60' : undefined,
                    position: 'relative',
                  }}
                >
                  <span style={{
                    fontSize: 'var(--font-sm)', fontWeight: isToday ? 700 : 500,
                    color: isToday ? '#fff' : !isCurrent ? 'var(--text-tertiary)' : 'var(--text)',
                  }}>
                    {cell.day}
                  </span>
                  {hasTraining && isCurrent && (
                    <span style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: isToday ? '#fff' : 'var(--primary)',
                      position: 'absolute', bottom: 2,
                    }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}