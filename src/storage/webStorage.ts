import type { WorkoutSession, WorkoutItem, SetRecord } from '../types/workout';
import type { Exercise } from '../types/exercise';
import type { Settings } from '../types/settings';
import { generateId } from '../utils/id';
import { today } from '../utils/date';

const KEYS = {
  EXERCISES: 'bt_exercises',
  SESSIONS: 'bt_sessions',
  ITEMS: 'bt_items',
  SETS: 'bt_sets',
  SETTINGS: 'bt_settings',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== Sessions =====
export async function getAllSessions(): Promise<WorkoutSession[]> {
  return load<WorkoutSession[]>(KEYS.SESSIONS, []);
}
export async function saveSession(session: WorkoutSession): Promise<void> {
  const all = await getAllSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  const now = Date.now();
  if (idx >= 0) {
    all[idx] = { ...session, updatedAt: now };
  } else {
    all.push({ ...session, createdAt: now, updatedAt: now });
  }
  save(KEYS.SESSIONS, all);
}
export async function createSession(durationMinutes = 60): Promise<WorkoutSession> {
  const now = Date.now();
  const session: WorkoutSession = {
    id: generateId(), date: today(), startTime: now, endTime: null,
    durationMinutes, location: '', focus: [], overallRpe: null, note: '',
    createdAt: now, updatedAt: now,
  };
  const all = await getAllSessions();
  all.push(session);
  save(KEYS.SESSIONS, all);
  return session;
}
export async function deleteSession(id: string): Promise<void> {
  const all = await getAllSessions();
  save(KEYS.SESSIONS, all.filter((s) => s.id !== id));
  const items = await getAllItems();
  const keepItems = items.filter((i) => i.sessionId !== id);
  save(KEYS.ITEMS, keepItems);
  const sets = await getAllSets();
  save(KEYS.SETS, sets.filter((s) => s.sessionId !== id));
}

// ===== Items =====
export async function getAllItems(): Promise<WorkoutItem[]> {
  return load<WorkoutItem[]>(KEYS.ITEMS, []);
}
export async function getItemsForSession(sessionId: string): Promise<WorkoutItem[]> {
  const all = await getAllItems();
  return all.filter((i) => i.sessionId === sessionId).sort((a, b) => a.order - b.order);
}
export async function addItemToSession(item: Omit<WorkoutItem, 'id'>): Promise<WorkoutItem> {
  const newItem: WorkoutItem = { ...item, id: generateId() };
  const all = await getAllItems();
  all.push(newItem);
  save(KEYS.ITEMS, all);
  return newItem;
}
export async function removeItemFromSession(itemId: string): Promise<void> {
  const all = await getAllItems();
  save(KEYS.ITEMS, all.filter((i) => i.id !== itemId));
  const sets = await getAllSets();
  save(KEYS.SETS, sets.filter((s) => s.workoutItemId !== itemId));
}

// ===== Sets =====
export async function getAllSets(): Promise<SetRecord[]> {
  return load<SetRecord[]>(KEYS.SETS, []);
}
export async function getSetsForWorkoutItem(workoutItemId: string): Promise<SetRecord[]> {
  const all = await getAllSets();
  return all.filter((s) => s.workoutItemId === workoutItemId).sort((a, b) => a.setIndex - b.setIndex);
}
export async function saveSetRecord(setRecord: SetRecord): Promise<void> {
  const all = await getAllSets();
  const idx = all.findIndex((s) => s.id === setRecord.id);
  if (idx >= 0) all[idx] = setRecord;
  else all.push(setRecord);
  save(KEYS.SETS, all);
}
export async function deleteSetRecord(id: string): Promise<void> {
  const all = await getAllSets();
  save(KEYS.SETS, all.filter((s) => s.id !== id));
}

// ===== Exercises =====
export async function getAllExercises(): Promise<Exercise[]> {
  return load<Exercise[]>(KEYS.EXERCISES, []);
}
export async function getActiveExercises(): Promise<Exercise[]> {
  const all = await getAllExercises();
  return all.filter((e) => !e.archived);
}
export async function saveExercise(exercise: Exercise): Promise<void> {
  const all = await getAllExercises();
  const idx = all.findIndex((e) => e.id === exercise.id);
  const now = Date.now();
  if (idx >= 0) all[idx] = { ...exercise, updatedAt: now };
  else all.push({ ...exercise, createdAt: now, updatedAt: now });
  save(KEYS.EXERCISES, all);
}
export async function addExercise(exercise: Omit<Exercise, 'createdAt' | 'updatedAt'>): Promise<Exercise> {
  const now = Date.now();
  const newExercise: Exercise = { ...exercise, createdAt: now, updatedAt: now };
  const all = await getAllExercises();
  all.push(newExercise);
  save(KEYS.EXERCISES, all);
  return newExercise;
}
export async function archiveExercise(id: string): Promise<void> {
  const all = await getAllExercises();
  const idx = all.findIndex((e) => e.id === id);
  if (idx >= 0) { all[idx] = { ...all[idx], archived: true, updatedAt: Date.now() }; save(KEYS.EXERCISES, all); }
}

// ===== Settings =====
const DEFAULT_SETTINGS: Settings = { weeklyTarget: 3, defaultDurationMinutes: 60, trainingGoal: '突破型锋线 + 投手' };
export async function getSettings(): Promise<Settings> {
  const s = load<Settings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...s };
}
export async function saveSettings(settings: Settings): Promise<void> {
  save(KEYS.SETTINGS, settings);
}

// ===== Seed =====
export async function initDefaultExercisesIfNeeded(): Promise<void> {
  const existing = await getAllExercises();
  if (existing.length > 0) return;
  const DEFAULT_EXERCISES = [
    { id: 'dribble_v', name: 'V字运球', category: '原地运球', unitType: 'seconds' as const, defaultSets: 3, defaultTarget: 30, note: '原地V字运球，保持低重心' },
    { id: 'dribble_crossover', name: '变向运球', category: '原地运球', unitType: 'seconds' as const, defaultSets: 3, defaultTarget: 30, note: '原地体前变向' },
    { id: 'dribble_between_legs', name: '胯下运球', category: '原地运球', unitType: 'seconds' as const, defaultSets: 3, defaultTarget: 30, note: '原地胯下运球' },
    { id: 'dribble_behind_back', name: '背后运球', category: '原地运球', unitType: 'seconds' as const, defaultSets: 3, defaultTarget: 30, note: '原地背后运球' },
    { id: 'move_crossover_between', name: '变向胯下', category: '行进间组合', unitType: 'reps' as const, defaultSets: 3, defaultTarget: 10, note: '体前变向接胯下' },
    { id: 'move_between_behind', name: '胯下背后', category: '行进间组合', unitType: 'reps' as const, defaultSets: 3, defaultTarget: 10, note: '胯下接背后' },
    { id: 'move_crossover_between_behind', name: '变向胯下背后', category: '行进间组合', unitType: 'reps' as const, defaultSets: 3, defaultTarget: 10 },
    { id: 'finish_crossover_underhand', name: '变向低手上篮', category: '运球终结', unitType: 'made_attempts' as const, defaultSets: 3, defaultTarget: 10 },
    { id: 'finish_between_gather', name: '胯下低合球上篮', category: '运球终结', unitType: 'made_attempts' as const, defaultSets: 3, defaultTarget: 10 },
    { id: 'finish_behind_back_reverse', name: '背后反篮', category: '运球终结', unitType: 'made_attempts' as const, defaultSets: 3, defaultTarget: 10 },
    { id: 'finish_spin_eurostep', name: '转身欧洲步上篮', category: '运球终结', unitType: 'made_attempts' as const, defaultSets: 3, defaultTarget: 10 },
    { id: 'shoot_midrange', name: '中距离自投自捡', category: '投篮', unitType: 'made_attempts' as const, defaultSets: 5, defaultTarget: 10 },
    { id: 'shoot_45_bank', name: '45°打板中距离', category: '投篮', unitType: 'made_attempts' as const, defaultSets: 5, defaultTarget: 10 },
    { id: 'shoot_floater', name: '运球行进间抛投', category: '投篮', unitType: 'made_attempts' as const, defaultSets: 5, defaultTarget: 10 },
    { id: 'shoot_three', name: '三分球', category: '投篮', unitType: 'made_attempts' as const, defaultSets: 5, defaultTarget: 10 },
    { id: 'shoot_pullup', name: '急停跳投', category: '投篮', unitType: 'made_attempts' as const, defaultSets: 5, defaultTarget: 10 },
  ];
  const now = Date.now();
  const exercises = DEFAULT_EXERCISES.map((e) => ({ ...e, archived: false, createdAt: now, updatedAt: now }));
  save(KEYS.EXERCISES, exercises);
}