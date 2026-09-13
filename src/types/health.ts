// Unified Health Data Models for Ultrahuman, Fitbit, and Hevy

export type DeviceSource = 'ultrahuman' | 'fitbit' | 'hevy' | 'health_connect';

export interface DeviceMetadata {
  id: DeviceSource;
  name: string;
  model: string;
  batteryLevel?: number;
  lastSyncTime: string;
  isConnected: boolean;
  accentColor: string;
}

// 1. Ultrahuman Ring AIR: Passive Biological Recovery & Circadian
export interface SleepStageRecord {
  stage: 'deep' | 'rem' | 'light' | 'awake';
  startTime: string; // ISO
  endTime: string;   // ISO
  durationMinutes: number;
}

export interface UltrahumanRecoveryData {
  recoveryScore: number; // 0 - 100
  sleepIndex: number;    // 0 - 100
  movementIndex: number; // 0 - 100
  sleepDurationMinutes: number;
  sleepEfficiencyPct: number;
  sleepStages: SleepStageRecord[];
  deepSleepPct: number;
  remSleepPct: number;
  lightSleepPct: number;
  awakePct: number;
  restingHeartRate: number; // bpm (overnight baseline)
  currentHeartRate?: number; // bpm (live / current daytime HR)
  hrvRmssd: number;         // ms
  skinTempDelta: number;    // °C difference from baseline
  circadianPhase: {
    currentPhase: 'peak_alertness' | 'post_lunch_dip' | 'evening_winddown' | 'melatonin_window' | 'deep_rest';
    morningSunlightWindow: { start: string; end: string };
    caffeineCutoffTime: string;
    optimalSleepWindow: { start: string; end: string };
  };
  source?: 'ultrahuman' | 'health_connect';
  sourceDeviceName?: string;
}

// 2. Google Fitbit: Workout Cardiovascular Strain & Zone Minutes
export interface HeartRateZoneSummary {
  peakMinutes: number;     // > 85% HR max
  cardioMinutes: number;   // 70% - 84% HR max
  fatBurnMinutes: number;  // 50% - 69% HR max
  outOfZoneMinutes: number;
}

export interface HeartRateSample {
  timestamp: string;
  bpm: number;
  source: 'fitbit' | 'ultrahuman';
}

export interface FitbitCardioData {
  todayActiveZoneMinutes: number;
  cardioCaloriesBurned: number;
  peakHeartRate: number;
  averageWorkoutHeartRate?: number;
  cardioFitnessScore: string; // e.g. "48-52 (Very Good)"
  zoneSummary: HeartRateZoneSummary;
  recentWorkout?: {
    id: string;
    title: string;
    activityType: 'running' | 'cycling' | 'hiit' | 'weight_training' | 'walking';
    startTime: string;
    endTime: string;
    durationMinutes: number;
    calories: number;
    avgBpm: number;
    maxBpm: number;
    activeZoneMinutes: number;
    distanceKm?: number;
    elevationMeters?: number;
  };
}

// 3. Hevy: Musculoskeletal Resistance Training & Volume Load
export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'calves';

export interface ExerciseSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
}

export interface HevyExercise {
  id: string;
  title: string;
  targetMuscles: MuscleGroup[];
  sets: ExerciseSet[];
  totalVolumeKg: number;
}

export interface HevyWorkoutSession {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  exercises: HevyExercise[];
  muscleDistribution: Record<MuscleGroup, number>; // percentage 0-100
}

export type RecoveryState = 'fatigued' | 'recovering' | 'primed';

export interface MuscleRecoveryStatus {
  muscle: MuscleGroup;
  displayName: string;
  recoveryPct: number; // 0 - 100
  state: RecoveryState;
  lastTrainedDate: string;
  hoursElapsed: number;
  recommendedHoursRemaining: number;
}

// 4. Android Health Connect: Native Pedometer, Motion & Aggregated Activity
export interface DailyActivitySummary {
  steps: number;
  stepGoal: number;
  distanceKm: number;
  activeCalories: number;
  totalCalories: number;
  activeMinutes: number;
  floorsClimbed?: number;
  source: string; // 'Android Health Connect' | 'Phone Pedometer' | 'Fitbit'
  lastSyncTime: string;
}

// Unified Tri-Pillar Daily Health State
export interface TriPillarHealthSummary {
  date: string;
  recovery: UltrahumanRecoveryData;
  cardio: FitbitCardioData;
  strength: {
    todayWorkout?: HevyWorkoutSession;
    weeklyVolumeKg: number;
    weeklyWorkoutsCount: number;
    muscleStatuses: MuscleRecoveryStatus[];
  };
  dailyActivity?: DailyActivitySummary;
  heartRateTimeline: HeartRateSample[];
  readinessToLoadRatio: {
    status: 'optimal_for_heavy_load' | 'moderate_load' | 'active_recovery_only' | 'deload_recommended';
    readinessScore: number; // 0-100
    title: string;
    summary: string;
  };
}
