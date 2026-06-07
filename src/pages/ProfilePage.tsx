import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../storage/webStorage';
import type { Settings } from '../types/settings';

export default function ProfilePage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [weeklyTarget, setWeeklyTarget] = useState('3');
  const [defaultDuration, setDefaultDuration] = useState('60');
  const [trainingGoal, setTrainingGoal] = useState('');

  useEffect(() => { load(); }, []);
  async function load() {
    const s = await getSettings();
    setSettings(s);
    setWeeklyTarget(s.weeklyTarget.toString());
    setDefaultDuration(s.defaultDurationMinutes.toString());
    setTrainingGoal(s.trainingGoal);
  }

  async function handleSave() {
    const ns: Settings = {
      weeklyTarget: parseInt(weeklyTarget) || 3,
      defaultDurationMinutes: parseInt(defaultDuration) || 60,
      trainingGoal: trainingGoal.trim(),
    };
    await saveSettings(ns);
    setSettings(ns);
    alert('设置已保存');
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: 'var(--font-xxl)', fontWeight: 700, marginBottom: 20 }}>个人设置</h1>
      <div className="card">
        <div className="card-title">训练设置</div>
        <label className="input-label">每周目标训练次数</label>
        <input className="input" value={weeklyTarget} onChange={(e) => setWeeklyTarget(e.target.value)} type="number" />
        <label className="input-label">默认训练时长（分钟）</label>
        <input className="input" value={defaultDuration} onChange={(e) => setDefaultDuration(e.target.value)} type="number" />
        <label className="input-label">当前训练目标</label>
        <textarea className="input" value={trainingGoal} onChange={(e) => setTrainingGoal(e.target.value)} placeholder="例如：突破型锋线 + 投手" />
        <button className="btn-primary" style={{ marginTop: 20 }} onClick={handleSave}>保存设置</button>
      </div>
      {settings?.trainingGoal && (
        <div className="card">
          <div className="card-title">当前训练方向</div>
          <div style={{ fontSize: 'var(--font-md)', color: 'var(--primary)', fontWeight: 500 }}>{settings.trainingGoal}</div>
        </div>
      )}
      <div className="card">
        <div className="card-title">关于</div>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>篮球训练成长记录 v1.1.0</div>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>个人训练工具 · 本地数据</div>
      </div>
    </div>
  );
}