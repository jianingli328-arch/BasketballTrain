import type { ExerciseUnitType } from './exercise';

export type WorkoutSession = {
  id: string;
  date: string;
  startTime: number;
  endTime: number | null;
  durationMinutes: number;
  location: string;
  focus: string[];
  overallRpe: number | null;
  note: string;
  createdAt: number;
  updatedAt: number;
};

export type WorkoutItem = {
  id: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  category: string;
  unitType: ExerciseUnitType;
  order: number;
  note: string;
};

export type SetRecord = {
  id: string;
  sessionId: string;
  workoutItemId: string;
  setIndex: number;
  target: number;
  actual: number | null;
  seconds: number | null;
  made: number | null;
  attempts: number | null;
  weight: number | null;
  rpe: number | null;
  note: string;
};
