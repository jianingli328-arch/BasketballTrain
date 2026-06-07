import React, { useState, useEffect } from 'react';
import { getAllExercises, addExercise, archiveExercise, saveExercise } from '../storage/webStorage';
import ExerciseCard from '../components/ExerciseCard';
import type { Exercise, ExerciseUnitType } from '../types/exercise';

const CATEGORIES = ['原地运球', '行进间组合', '运球终结', '投篮'];
const CAT_COLORS: Record<string, string> = { '原地运球': '#1565C0', '行进间组合': '#E65100', '运球终结': '#2E7D32', '投篮': '#6A1B9A' };

const emptyForm = () => ({ name: '', category: CATEGORIES[0], unitType: 'reps' as ExerciseUnitType, sets: '3', target: '10', note: '' });

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => { load(); }, []);
  async function load() { setExercises(await getAllExercises()); }

  function openNew() { setEditing(null); setForm(emptyForm()); setShowModal(true); }
  function openEdit(ex: Exercise) { setEditing(ex); setForm({ name: ex.name, category: ex.category, unitType: ex.unitType, sets: ex.defaultSets.toString(), target: ex.defaultTarget.toString(), note: ex.note }); setShowModal(true); }

  async function handleSave() {
    if (!form.name.trim()) return alert('请输入动作名称');
    const data = {
      name: form.name.trim(), category: form.category, unitType: form.unitType,
      defaultSets: parseInt(form.sets) || 3, defaultTarget: parseInt(form.target) || 10,
      note: form.note, archived: editing?.archived ?? false,
    };
    if (editing) await saveExercise({ ...editing, ...data, updatedAt: Date.now() });
    else await addExercise({ id: `custom_${Date.now().toString(36)}`, ...data });
    setShowModal(false); load();
  }

  async function handleArchive(ex: Exercise) {
    if (confirm(`确定要归档"${ex.name}"吗？`)) { await archiveExercise(ex.id); load(); }
  }

  const display = showArchived ? exercises : exercises.filter((e) => !e.archived);
  const grouped: Record<string, Exercise[]> = {};
  for (const e of display) { if (!grouped[e.category]) grouped[e.category] = []; grouped[e.category].push(e); }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className={`btn-outline${showArchived ? ' primary' : ''}`} onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? '显示活跃' : '显示已归档'}
        </button>
        <button className="btn-outline primary" onClick={openNew}>+ 新增</button>
      </div>

      {CATEGORIES.filter((c) => grouped[c]?.length > 0).map((cat) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[cat] || '#999', marginRight: 8 }} />
            <span style={{ fontSize: 'var(--font-lg)', fontWeight: 600, color: 'var(--text)' }}>{cat}</span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginLeft: 8 }}>{grouped[cat].length}个动作</span>
          </div>
          {grouped[cat].map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} onPress={() => openEdit(ex)}
              rightAction={!ex.archived ? <button className="btn-outline danger" style={{ fontSize: 'var(--font-xs)', padding: '4px 10px' }} onClick={(e) => { e.stopPropagation(); handleArchive(ex); }}>归档</button> : undefined}
            />
          ))}
        </div>
      ))}

      {display.length === 0 && <div className="empty-state">{showArchived ? '没有已归档的动作' : '动作库为空，点击右上角新增'}</div>}

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? '编辑动作' : '新增动作'}</span>
              <span className="modal-close" onClick={() => setShowModal(false)}>关闭</span>
            </div>
            <label className="input-label">动作名称</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例如：背后运球" />

            <label className="input-label">分类</label>
            <div className="chip-group">
              {CATEGORIES.map((c) => (
                <button key={c} className={`chip${form.category === c ? ' active' : ''}`} onClick={() => setForm({ ...form, category: c })}>{c}</button>
              ))}
            </div>

            <label className="input-label">记录方式</label>
            <div className="chip-group">
              {[{ v: 'reps' as const, l: '次数' }, { v: 'seconds' as const, l: '秒数' }, { v: 'made_attempts' as const, l: '命中/出手' }].map(({ v, l }) => (
                <button key={v} className={`chip${form.unitType === v ? ' active' : ''}`} onClick={() => setForm({ ...form, unitType: v })}>{l}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">默认组数</label>
                <input className="input" value={form.sets} onChange={(e) => setForm({ ...form, sets: e.target.value })} type="number" />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">默认目标</label>
                <input className="input" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} type="number" />
              </div>
            </div>

            <label className="input-label">备注</label>
            <textarea className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="可选" />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <button className="btn-outline" onClick={() => setShowModal(false)}>取消</button>
              <button style={{ background: 'var(--primary)', color: '#fff', padding: '8px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 'var(--font-md)' }} onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}