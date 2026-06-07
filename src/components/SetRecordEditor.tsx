import React, { useState } from 'react';
import type { ExerciseUnitType } from '../types/exercise';
import type { SetRecord } from '../types/workout';

type Props = {
  unitType: ExerciseUnitType; target: number; setIndex: number;
  initial?: Partial<SetRecord>;
  onSave: (data: Partial<SetRecord>) => void; onCancel: () => void;
};

export default function SetRecordEditor({ unitType, target, setIndex, initial, onSave, onCancel }: Props) {
  const [actual, setActual] = useState(initial?.actual?.toString() ?? '');
  const [seconds, setSeconds] = useState(initial?.seconds?.toString() ?? '');
  const [made, setMade] = useState(initial?.made?.toString() ?? '');
  const [attempts, setAttempts] = useState(initial?.attempts?.toString() ?? '');
  const [note, setNote] = useState(initial?.note ?? '');

  function handleSave() {
    onSave({
      target, setIndex,
      actual: actual ? parseInt(actual) : null,
      seconds: seconds ? parseInt(seconds) : null,
      made: made ? parseInt(made) : null,
      attempts: attempts ? parseInt(attempts) : null,
      note,
    });
  }

  const attemptsNum = parseInt(attempts);
  const madeNum = parseInt(made);
  const hitRate = attemptsNum > 0 && !isNaN(madeNum) ? Math.round((madeNum / attemptsNum) * 100) : null;

  return (
    <div style={{ background: 'var(--surface-variant)', borderRadius: 'var(--radius-sm)', padding: 14, marginTop: 8 }}>
      <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>第{setIndex + 1}组</div>

      {unitType === 'reps' && (
        <>
          <InputRow label="目标次数" value={target.toString()} disabled />
          <InputRow label="实际完成" value={actual} onChange={setActual} type="number" />
        </>
      )}
      {unitType === 'seconds' && (
        <>
          <InputRow label="目标秒数" value={target.toString()} disabled />
          <InputRow label="实际秒数" value={seconds} onChange={setSeconds} type="number" />
        </>
      )}
      {unitType === 'made_attempts' && (
        <>
          <InputRow label="出手数" value={attempts} onChange={setAttempts} type="number" />
          <InputRow label="命中数" value={made} onChange={setMade} type="number" />
          {hitRate !== null && <div style={{ fontSize: 'var(--font-sm)', color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>命中率：{hitRate}%</div>}
        </>
      )}
      <InputRow label="备注" value={note} onChange={setNote} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button className="btn-outline" onClick={onCancel}>取消</button>
        <button style={{ background: 'var(--primary)', color: '#fff', padding: '8px 20px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 'var(--font-sm)' }} onClick={handleSave}>保存</button>
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, disabled, type }: { label: string; value: string; onChange?: (v: string) => void; disabled?: boolean; type?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', width: 80, flexShrink: 0 }}>{label}</span>
      <input
        type={type || 'text'}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="input"
        style={{ flex: 1, background: disabled ? 'var(--surface-variant)' : undefined, color: disabled ? 'var(--text-secondary)' : undefined }}
      />
    </div>
  );
}