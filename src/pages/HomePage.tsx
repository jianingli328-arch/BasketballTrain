import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSessions } from '../storage/webStorage';
import { getSettings } from '../storage/webStorage';
import { getWeeklyCount, getRecentSessions } from '../utils/stats';
import { formatDateTime, formatDuration } from '../utils/date';
import TrainingCalendar from '../components/TrainingCalendar';
import type { WorkoutSession } from '../types/workout';
import type { Settings } from '../types/settings';

export default function HomePage() {
  const nav = useNavigate();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [recentSession, setRecentSession] = useState<WorkoutSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => { load(); }, []);
  async function load() {
    const s = await getSettings();
    const sess = await getAllSessions();
    setSettings(s); setSessions(sess);
    setWeeklyCount(getWeeklyCount(sess));
    setRecentSession(getRecentSessions(sess, 1)[0] || null);
    setLoaded(true);
  }

  const trainingDates = new Set(sessions.map((s) => s.date));
  const daySessions = selectedDate
    ? sessions.filter((s) => s.date === selectedDate).sort((a, b) => b.startTime - a.startTime)
    : [];
  const target = settings?.weeklyTarget ?? 3;
  if (!loaded) return null;

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 'var(--font-xxl)', fontWeight: 700, color: 'var(--text)' }}>篮球训练</h1>
        <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>记录你的每一次进步</p>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>本周训练进度</span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>本月{weeklyCount}次 / {target}次</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 'var(--font-xxxl)', fontWeight: 700, color: 'var(--primary)' }}>{weeklyCount}</span>
          <span style={{ fontSize: 'var(--font-xxl)', color: 'var(--text-tertiary)', margin: '0 4px' }}>/</span>
          <span style={{ fontSize: 'var(--font-xxl)', fontWeight: 600, color: 'var(--text-secondary)' }}>{target}</span>
          <span style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginLeft: 4 }}>次</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min((weeklyCount / target) * 100, 100)}%` }} />
        </div>
      </div>

      <TrainingCalendar trainingDates={trainingDates} onDayPress={(d) => setSelectedDate(selectedDate === d ? null : d)} />

      {selectedDate && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-title">{selectedDate} 的训练</div>
          {daySessions.length > 0 ? daySessions.map((s) => (
            <div key={s.id} className="day-session" onClick={() => nav(`/session/${s.id}`)}>
              <div className="day-session-dot" />
              <div className="day-session-info">
                <div className="day-session-time">{new Date(s.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="day-session-meta">{formatDuration(s.durationMinutes)}{s.note ? ' · ' + s.note : ''}</div>
              </div>
              <span style={{ color: 'var(--text-tertiary)' }}>{'>'}</span>
            </div>
          )) : <div className="empty-state">当天没有训练记录</div>}
        </div>
      )}

      <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => nav('/session/new')}>+ 开始训练</button>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">最近一次训练</div>
        {recentSession ? (
          <>
            <div style={{ fontSize: 'var(--font-md)', color: 'var(--text)' }}>{formatDateTime(recentSession.startTime)}</div>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>时长 {formatDuration(recentSession.durationMinutes)}</div>
            {recentSession.note && <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>{recentSession.note}</div>}
            <button className="btn-outline primary" style={{ marginTop: 12 }} onClick={() => nav(`/session/${recentSession.id}`)}>查看详情</button>
          </>
        ) : <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>还没有训练记录，开始你的第一次训练吧！</div>}
      </div>
    </div>
  );
}