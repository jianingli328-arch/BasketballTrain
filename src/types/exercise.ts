export type ExerciseUnitType =
  | 'reps'
  | 'seconds'
  | 'made_attempts'
  | 'weight_reps';

export type Exercise = {
  id: string;
  name: string;
  category: string;
  unitType: ExerciseUnitType;
  defaultSets: number;
  defaultTarget: number;
  note: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
};
