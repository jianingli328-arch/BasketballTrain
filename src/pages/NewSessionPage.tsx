import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveExercises } from '../storage/webStorage';
import { createSession, addItemToSession, saveSession, getItemsForSession, removeItemFromSession, getSetsForWorkoutItem, saveSetRecord } from '../storage/webStorage';
import ExerciseCard from '../components/ExerciseCard';
import SetRecordEditor from '../components/SetRecordEditor';
import WorkoutTimer from '../components/WorkoutTimer';
import { generateId } from '../utils/id';
import { formatTimeDisplay } from '../utils/date';
import type { Exercise } from '../types/exercise';
import type { WorkoutSession, WorkoutItem, SetRecord } from '../types/workout';

export default function NewSessionPage() {
  const nav = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [setsMap, setSetsMap] = useState<Record<string, SetRecord[]>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editSetIdx, setEditSetIdx] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => { init(); }, []);
  async function init() {
    const exs = await getActiveExercises();
    setExercises(exs);
    const ns = await createSession(60);
    setSession(ns);
  }

  async function refresh() {
    if (!session) return;
    const itms = await getItemsForSession(session.id);
    setItems(itms);
    const map: Record<string, SetRecord[]> = {};
    for (const item of itms) map[item.id] = await getSetsForWorkoutItem(item.id);
    setSetsMap(map);
  }

  async function addEx(exercise: Exercise) {
    if (!session) return;
    const newItem = await addItemToSession({
      sessionId: session.id, exerciseId: exercise.id, exerciseName: exercise.name,
      category: exercise.category, unitType: exercise.unitType, order: items.length, note: '',
    });
    for (let i = 0; i < exercise.defaultSets; i++) {
      await saveSetRecord({
        id: generateId(), sessionId: session.id, workoutItemId: newItem.id,
        setIndex: i, target: exercise.defaultTarget, actual: null, seconds: null,
        made: null, attempts: null, weight: null, rpe: null, note: '',
      });
    }
    setShowPicker(false);
    await refresh();
  }

  async function handleSaveSet(itemId: string, data: Partial<SetRecord>) {
    if (!session) return;
    await saveSetRecord({
      id: data.id || generateId(), sessionId: session.id, workoutItemId: itemId,
      setIndex: data.setIndex ?? 0, target: data.target ?? 0,
      actual: data.actual ?? null, seconds: data.seconds ?? null,
      made: data.made ?? null, attempts: data.attempts ?? null,
      weight: null, rpe: null, note: data.note ?? '',
    });
    setEditItemId(null); setEditSetIdx(null);
    await refresh();
  }

  async function handleRemoveItem(itemId: string) {
    if (!confirm('确定要移除此动作及其所有组记录吗？')) return;
    await removeItemFromSession(itemId);
    await refresh();
  }

  function handleFinish() {
    if (items.length === 0) return alert('请至少添加一个动作');
    if (!confirm('确定要结束本次训练吗？\n实际训练时长：' + formatTimeDisplay(elapsed))) return;
    handleSaveAndFinish();
  }

  async function handleSaveAndFinish() {
    if (!session) return;
    const durationMinutes = Math.max(Math.round(elapsed / 60), 1);
    await saveSession({ ...session, endTime: Date.now(), durationMinutes, note });
    setIsSaved(true);
    alert('训练已保存！\n实际训练时长：' + formatTimeDisplay(elapsed));
    nav('/');
  }

  function handleDiscard() {
    if (!confirm('确定要放弃本次训练吗？未保存的数据将丢失。')) return;
    nav('/');
  }

  const grouped: Record<string, Exercise[]> = {};
  for (const ex of exercises) { if (!grouped[ex.category]) grouped[ex.category] = []; grouped[ex.category].push(ex); }

  if (!session || isSaved) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="session-header">
        <span className="session-header-btn cancel" onClick={handleDiscard}>放弃</span>
        <span className="session-header-title">新建训练</span>
        <span
          className={'session-header-btn save' + (items.length === 0 ? ' disabled' : '')}
          onClick={handleFinish}
        >结束</span>
      </div>

      <WorkoutTimer onDurationChange={(s) => setElapsed(s)} />

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="训练备注（可选）" style={{ marginBottom: 16 }} />

        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <div><div className="item-name">{item.exerciseName}</div><div className="item-meta">{item.category}</div></div>
              <span className="remove-link" onClick={() => handleRemoveItem(item.id)}>移除</span>
            </div>
            {(setsMap[item.id] || []).map((set, idx) => (
              <div key={set.id} className="set-row" onClick={() => { setEditItemId(item.id); setEditSetIdx(idx); }}>
                <span className="set-label">第{idx + 1}组</span>
                <span className="set-value">
                  {item.unitType === 'reps' ? (set.actual !== null ? `${set.actual}/${set.target}次` : `-/${set.target}次`)
                  : item.unitType === 'seconds' ? (set.seconds !== null ? `${set.seconds}/${set.target}秒` : `-/${set.target}秒`)
                  : item.unitType === 'made_attempts' ? `${set.made ?? 0}/${set.attempts ?? 0}`
                  : `${set.target}`}
                </span>
              </div>
            ))}
          </div>
        ))}

        <button className="btn-dashed" style={{ marginBottom: 16 }} onClick={() => setShowPicker(true)}>+ 添加动作</button>

        {items.length > 0 && (
          <button className="btn-success" style={{ marginBottom: 32 }} onClick={handleFinish}>
            结束训练 · {formatTimeDisplay(elapsed)}
          </button>
        )}
      </div>

      {/* Set Editor */}
      {editItemId !== null && editSetIdx !== null && (
        <div className="overlay" onClick={() => { setEditItemId(null); setEditSetIdx(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <SetRecordEditor
              unitType={items.find((i) => i.id === editItemId)?.unitType || 'reps'}
              target={setsMap[editItemId]?.[editSetIdx]?.target ?? 10}
              setIndex={editSetIdx}
              initial={setsMap[editItemId]?.[editSetIdx]}
              onSave={(data) => handleSaveSet(editItemId, data)}
              onCancel={() => { setEditItemId(null); setEditSetIdx(null); }}
            />
          </div>
        </div>
      )}

      {/* Exercise Picker */}
      {showPicker && (
        <div className="overlay" onClick={() => setShowPicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">选择动作</span>
              <span className="modal-close" onClick={() => setShowPicker(false)}>关闭</span>
            </div>
            <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 8, marginBottom: 8 }}>
              <button className={`chip${!selectedCat ? ' active' : ''}`} onClick={() => setSelectedCat(null)}>全部</button>
              {Object.keys(grouped).map((c) => (
                <button key={c} className={`chip${selectedCat === c ? ' active' : ''}`} onClick={() => setSelectedCat(c)}>{c}</button>
              ))}
            </div>
            {Object.entries(grouped).filter(([c]) => !selectedCat || c === selectedCat).map(([cat, exs]) => (
              <div key={cat}>
                <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text)', marginTop: 12, marginBottom: 6 }}>{cat}</div>
                {exs.map((ex) => <ExerciseCard key={ex.id} exercise={ex} onPress={() => addEx(ex)} />)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}