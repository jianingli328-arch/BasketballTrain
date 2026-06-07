import React, { useState, useEffect } from 'react';
import { getAllSessions, getAllItems, getAllSets } from '../storage/webStorage';
import { getAllExercises } from '../storage/webStorage';
import StatCard from '../components/StatCard';
import { getTotalWorkoutCount, getTotalDuration, getWeeklyCount, getMonthlyCount, getYearlyCount, getCategoryStats, getShootingStats } from '../utils/stats';
import { formatDuration } from '../utils/date';
import type { WorkoutSession, WorkoutItem, SetRecord } from '../types/workout';
import type { Exercise } from '../types/exercise';

const CAT_COLORS: Record<string, string> = { '原地运球': '#1565C0', '行进间组合': '#E65100', '运球终结': '#2E7D32', '投篮': '#6A1B9A' };

export default function StatsPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => { load(); }, []);
  async function load() {
    const [ss, it, st, ex] = await Promise.all([getAllSessions(), getAllItems(), getAllSets(), getAllExercises()]);
    setSessions(ss); setItems(it); setSets(st); setExercises(ex);
  }

  const total = getTotalWorkoutCount(sessions);
  const dur = getTotalDuration(sessions);
  const weekly = getWeeklyCount(sessions);
  const monthly = getMonthlyCount(sessions);
  const yearly = getYearlyCount(sessions);
  const catStats = getCategoryStats(sessions, items, sets, exercises).filter((c) => c.totalSets > 0);
  const shooting = getShootingStats(sets, items);

  return (
    <div className="page">
      <h1 style={{ fontSize: 'var(--font-xxl)', fontWeight: 700, marginBottom: 20 }}>训练统计</h1>

      <div className="stats-grid">
        <StatCard title="总训练次数" value={total} />
        <StatCard title="总训练时长" value={formatDuration(dur)} />
      </div>
      <div className="stats-grid">
        <StatCard title="本周" value={weekly} subtitle="次训练" />
        <StatCard title="本月" value={monthly} subtitle="次训练" />
        <StatCard title="本年" value={yearly} subtitle="次训练" />
      </div>

      {shooting.totalAttempts > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 12 }}>投篮/上篮统计</h2>
          <div className="stats-grid">
            <StatCard title="总出手" value={shooting.totalAttempts} />
            <StatCard title="总命中" value={shooting.totalMade} />
            <StatCard title="命中率" value={`${shooting.hitRate}%`} color={shooting.hitRate >= 40 ? 'var(--success)' : 'var(--warning)'} />
          </div>
        </div>
      )}

      {catStats.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, marginBottom: 12 }}>各分类训练量</h2>
          {catStats.map((c) => (
            <div key={c.category} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
              padding: '12px 16px', marginBottom: 4, border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[c.category] || '#999', marginRight: 8 }} />
                <span style={{ fontSize: 'var(--font-md)', color: 'var(--text)' }}>{c.category}</span>
              </div>
              <span style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--primary)' }}>{c.totalSets}组</span>
            </div>
          ))}
        </div>
      )}

      {total === 0 && <div className="empty-state">还没有训练数据，开始训练吧！</div>}
    </div>
  );
}