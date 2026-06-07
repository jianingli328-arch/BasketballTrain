import type { WorkoutSession, WorkoutItem, SetRecord } from '../types/workout';
import type { Exercise } from '../types/exercise';
import { getWeekRange, getMonthRange, getYearRange, isDateInRange } from './date';

export type CategoryStats = {
  category: string;
  totalSets: number;
  totalReps: number;
  totalSeconds: number;
  made: number;
  attempts: number;
};

export type ShootingStats = {
  totalMade: number;
  totalAttempts: number;
  hitRate: number;
};

export function getTotalWorkoutCount(sessions: WorkoutSession[]): number {
  return sessions.length;
}

export function getTotalDuration(sessions: WorkoutSession[]): number {
  return sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
}

export function getWorkoutCountInRange(
  sessions: WorkoutSession[],
  start: Date,
  end: Date
): number {
  return sessions.filter((s) => {
    const d = new Date(s.date);
    return isDateInRange(d, start, end);
  }).length;
}

export function getWeeklyCount(sessions: WorkoutSession[]): number {
  const { start, end } = getWeekRange();
  return getWorkoutCountInRange(sessions, start, end);
}

export function getMonthlyCount(sessions: WorkoutSession[]): number {
  const { start, end } = getMonthRange();
  return getWorkoutCountInRange(sessions, start, end);
}

export function getYearlyCount(sessions: WorkoutSession[]): number {
  const { start, end } = getYearRange();
  return getWorkoutCountInRange(sessions, start, end);
}

export function getCategoryStats(
  sessions: WorkoutSession[],
  allItems: WorkoutItem[],
  allSets: SetRecord[],
  exercises: Exercise[]
): CategoryStats[] {
  const statsMap = new Map<string, CategoryStats>();

  for (const cat of [...new Set(exercises.map((e) => e.category))]) {
    statsMap.set(cat, {
      category: cat,
      totalSets: 0,
      totalReps: 0,
      totalSeconds: 0,
      made: 0,
      attempts: 0,
    });
  }

  for (const item of allItems) {
    const cat = item.category;
    if (!statsMap.has(cat)) {
      statsMap.set(cat, {
        category: cat,
        totalSets: 0,
        totalReps: 0,
        totalSeconds: 0,
        made: 0,
        attempts: 0,
      });
    }
    const itemSets = allSets.filter((s) => s.workoutItemId === item.id);
    const stat = statsMap.get(cat)!;
    stat.totalSets += itemSets.length;

    for (const set of itemSets) {
      if (set.actual !== null) stat.totalReps += set.actual;
      if (set.seconds !== null) stat.totalSeconds += set.seconds;
      if (set.made !== null) stat.made += set.made;
      if (set.attempts !== null) stat.attempts += set.attempts;
    }
  }

  return Array.from(statsMap.values());
}

export function getShootingStats(
  allSets: SetRecord[],
  allItems: WorkoutItem[]
): ShootingStats {
  const shootingItems = allItems.filter(
    (i) => i.unitType === 'made_attempts'
  );
  let totalMade = 0;
  let totalAttempts = 0;

  for (const item of shootingItems) {
    const itemSets = allSets.filter((s) => s.workoutItemId === item.id);
    for (const set of itemSets) {
      if (set.made !== null) totalMade += set.made;
      if (set.attempts !== null) totalAttempts += set.attempts;
    }
  }

  return {
    totalMade,
    totalAttempts,
    hitRate: totalAttempts > 0 ? Math.round((totalMade / totalAttempts) * 100) : 0,
  };
}

export function getTotalSetsInRange(
  sessions: WorkoutSession[],
  allItems: WorkoutItem[],
  allSets: SetRecord[],
  start: Date,
  end: Date
): number {
  const sessionIds = sessions
    .filter((s) => isDateInRange(new Date(s.date), start, end))
    .map((s) => s.id);
  const itemIds = allItems
    .filter((i) => sessionIds.includes(i.sessionId))
    .map((i) => i.id);
  return allSets.filter((s) => itemIds.includes(s.workoutItemId)).length;
}

export function getRecentSessions(
  sessions: WorkoutSession[],
  limit: number = 10
): WorkoutSession[] {
  return [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime - a.startTime)
    .slice(0, limit);
}
