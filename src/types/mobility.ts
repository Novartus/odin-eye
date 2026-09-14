// Mobility & Guided Stretching Types
// On-device scientific stretching routines for fatigued muscles

import { MuscleGroup } from './health';

export interface MobilityExercise {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  bilateral: boolean; // if true, perform once per side
  durationSeconds: number;
  restSeconds: number;
  instructions: string;
  benefit: string;
  breathingCue: string;
  poseCue: string;
}

export interface MobilityRoutine {
  id: string;
  title: string;
  description: string;
  targetMuscles: MuscleGroup[];
  estimatedMinutes: number;
  exercises: MobilityExercise[];
}

export interface MobilitySessionSummary {
  routineId: string;
  routineTitle: string;
  totalSeconds: number;
  completedExercises: number;
  musclesTargeted: MuscleGroup[];
  timestamp: string;
}
