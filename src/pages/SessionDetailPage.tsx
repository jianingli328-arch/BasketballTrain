import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllSessions, getItemsForSession, getSetsForWorkoutItem, deleteSession, addItemToSession, removeItemFromSession, saveSetRecord, deleteSetRecord } from '../storage/webStorage';
import { getActiveExercises } from '../storage/webStorage';
import ExerciseCard from '../components/ExerciseCard';
import SetRecordEditor from '../components/SetRecordEditor';
import { formatDateTime, formatDuration } from '../utils/date';
import { generateId } from '../utils/id';
import type { WorkoutSession, WorkoutItem, SetRecord } from '../types/workout';
import type { Exercise } from '../types/exercise';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [setsMap, setSetsMap] = useState<Record<string, SetRecord[]>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editSetIdx, setEditSetIdx] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => { load(); }, [id]);

  async function load() {
    if (!id) return;
    const sessions = await getAllSessions();
    const s = sessions.find((s) => s.id === id);
    if (!s) return;
    setSession(s); setNote(s.note || '');
    const itms = await getItemsForSession(id);
    setItems(itms);
    const map: Record<string, SetRecord[]> = {};
    for (const item of itms) map[item.id] = await getSetsForWorkoutItem(item.id);
    setSetsMap(map);
    setExercises(await getActiveExercises());
    setLoaded(true);
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
    setHasChanges(true); setShowPicker(false);
    await refresh();
  }

  async function handleRemoveItem(itemId: string) {
    if (!confirm('确定要移除此动作及其所有组记录吗？')) return;
    await removeItemFromSession(itemId);
    setHasChanges(true);
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
    setEditItemId(null); setEditSetIdx(null); setHasChanges(true);
    await refresh();
  }

  async function addSet(itemId: string) {
    if (!session) return;
    const itemSets = setsMap[itemId] || [];
    await saveSetRecord({
      id: generateId(), sessionId: session.id, workoutItemId: itemId,
      setIndex: itemSets.length, target: 10, actual: null, seconds: null,
      made: null, attempts: null, weight: null, rpe: null, note: '',
    });
    setHasChanges(true);
    await refresh();
  }

  async function handleDeleteSet(itemId: string, setId: string) {
    if (!confirm('确定要删除此组记录吗？')) return;
    await deleteSetRecord(setId);
    setEditItemId(null); setEditSetIdx(null); setHasChanges(true);
    await refresh();
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm('确定要删除本次训练记录吗？此操作不可撤销。')) return;
    await deleteSession(id);
    nav('/');
  }

  async function saveChanges() {
    if (!session || !id) return;
    const { saveSession } = await import('../storage/webStorage');
    await saveSession({ ...session, note, updatedAt: Date.now() });
    setHasChanges(false); setIsEditing(false);
    alert('训练记录已更新');
  }

  async function refresh() {
    if (!id) return;
    const itms = await getItemsForSession(id);
    setItems(itms);
    const map: Record<string, SetRecord[]> = {};
    for (const item of itms) map[item.id] = await getSetsForWorkoutItem(item.id);
    setSetsMap(map);
  }

  const grouped: Record<string, Exercise[]> = {};
  for (const ex of exercises) { if (!grouped[ex.category]) grouped[ex.category] = []; grouped[ex.category].push(ex); }

  if (!loaded || !session) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="session-header">
        <div>
          {isEditing ? (
            <span className="session-header-btn cancel" onClick={() => { setIsEditing(false); load(); }}>取消</span>
          ) : (
            <span className="session-header-btn cancel" onClick={() => nav(-1)}>{'< 返回'}</span>
          )}
        </div>
        <span className="session-header-title">训练详情</span>
        <div>
          {isEditing ? (
            <span className="session-header-btn save" onClick={saveChanges}>保存</span>
          ) : (
            <span className="session-header-btn save" onClick={() => setIsEditing(true)}>编辑</span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <div className="card">
          <div style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text)' }}>{formatDateTime(session.startTime)}</div>
          <div style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', marginTop: 4 }}>时长：{formatDuration(session.durationMinutes)}</div>
          {isEditing ? (
            <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="训练备注" style={{ marginTop: 12, minHeight: 60 }} />
          ) : session.note ? (
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic' }}>{session.note}</div>
          ) : null}
        </div>

        {items.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-header">
              <div><div className="item-name">{item.exerciseName}</div><div className="item-meta">{item.category}</div></div>
              {isEditing && <span className="remove-link" onClick={() => handleRemoveItem(item.id)}>移除</span>}
            </div>
            {(setsMap[item.id] || []).map((set) => (
              <div key={set.id} className="set-row"
                onClick={() => { if (isEditing) { setEditItemId(item.id); setEditSetIdx(set.setIndex); } }}
                style={{ cursor: isEditing ? 'pointer' : 'default' }}>
                <span className="set-label">第{set.setIndex + 1}组</span>
                <span className="set-value">
                  {item.unitType === 'reps' ? (set.actual !== null ? `${set.actual}/${set.target}次` : `-/${set.target}次`)
                  : item.unitType === 'seconds' ? (set.seconds !== null ? `${set.seconds}/${set.target}秒` : `-/${set.target}秒`)
                  : item.unitType === 'made_attempts' ? `${set.made ?? 0}/${set.attempts ?? 0} (${set.attempts ? Math.round(((set.made ?? 0) / set.attempts) * 100) : 0}%)`
                  : (set.actual !== null ? `${set.actual}/${set.target}` : `-/${set.target}`)}
                </span>
              </div>
            ))}
            {isEditing && (
              <button className="btn-dashed" style={{ padding: '8px', fontSize: 'var(--font-xs)', marginTop: 8 }} onClick={() => addSet(item.id)}>+ 添加一组</button>
            )}
          </div>
        ))}

        {isEditing && (
          <button className="btn-dashed" style={{ marginBottom: 16 }} onClick={() => setShowPicker(true)}>+ 添加动作</button>
        )}

        {!isEditing ? (
          <button className="btn-danger" onClick={handleDelete}>删除本次训练</button>
        ) : (
          <button className="btn-primary" onClick={saveChanges} style={{ marginBottom: 32 }}>
            {hasChanges ? '保存修改' : '完成编辑'}
          </button>
        )}
      </div>

      {/* Set Editor Modal */}
      {editItemId !== null && editSetIdx !== null && isEditing && (
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
            <button className="btn-danger" style={{ marginTop: 12 }}
              onClick={() => { const sid = setsMap[editItemId]?.[editSetIdx]?.id; if (sid) handleDeleteSet(editItemId, sid); }}>
              删除此组
            </button>
          </div>
        </div>
      )}

      {/* Exercise Picker */}
      {showPicker && isEditing && (
        <div className="overlay" onClick={() => setShowPicker(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">添加动作到本次训练</span>
              <span className="modal-close" onClick={() => setShowPicker(false)}>关闭</span>
            </div>
            <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 8 }}>
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