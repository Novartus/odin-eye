// Third-Party Wearable & Cloud API Types & Payload Interfaces
// Canonical source: src/types/api.ts

// ==========================================
// Hevy API Payloads
// ==========================================
export interface RawHevySet {
  set_type?: string; // 'normal' | 'warmup' | 'failure' | 'drop'
  weight_kg?: number | null;
  reps?: number | null;
  rpe?: number | null;
}

export interface RawHevyExercise {
  title?: string;
  notes?: string;
  exercise_template_id?: string;
  sets?: RawHevySet[];
}

export interface RawHevyWorkout {
  id: string;
  title: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  description?: string;
  exercises?: RawHevyExercise[];
}

export interface HevyWorkoutsResponse {
  page: number;
  page_count: number;
  workouts: RawHevyWorkout[];
}

// ==========================================
// Fitbit API Payloads
// ==========================================
export interface RawFitbitActivities {
  summary?: {
    activeScore?: number;
    activityCalories?: number;
    caloriesOut?: number;
    fairlyActiveMinutes?: number;
    lightlyActiveMinutes?: number;
    veryActiveMinutes?: number;
    sedentaryMinutes?: number;
    steps?: number;
    distances?: Array<{ activity: string; distance: number }>;
  };
  activities?: Array<{
    activityId?: number;
    activityName?: string;
    duration?: number; // ms
    calories?: number;
    averageHeartRate?: number;
    startTime?: string;
    distance?: number;
  }>;
}

// ==========================================
// Ultrahuman Ring AIR API Payloads
// ==========================================
export interface RawUltrahumanMetric {
  date?: string;
  recovery_index?: number;
  recovery_score?: number;
  recoveryIndex?: number;
  score?: number;
  sleep_index?: number;
  sleep_score?: number;
  sleepIndex?: number;
  movement_index?: number;
  movement_score?: number;
  movementIndex?: number;
  resting_hr?: number;
  resting_heart_rate?: number;
  rhr?: number;
  restingHeartRate?: number;
  hrv?: number;
  hrv_rmssd?: number;
  rmssd?: number;
  temp_deviation?: number;
  temperature_deviation?: number;
  temp_delta?: number;
  total_sleep_time_seconds?: number;
  total_sleep_seconds?: number;
  total_sleep_minutes?: number;
  deep_sleep_seconds?: number;
  deep_sleep_minutes?: number;
  rem_sleep_seconds?: number;
  rem_sleep_minutes?: number;
  light_sleep_seconds?: number;
  light_sleep_minutes?: number;
  awake_seconds?: number;
  awake_minutes?: number;
  temp?: number;
  temperature?: number;
  skin_temp?: number;
  active_hours?: number;
  active_minutes?: number;
  steps?: number;
  total_steps?: number;
  step_count?: number;
  calories?: number;
  active_calories?: number;
  total_calories?: number;
  avg_hr?: number;
  average_heart_rate?: number;
  max_hr?: number;
  min_hr?: number;
  sleep_efficiency?: number;
  efficiency?: number;
  steps_count?: number;
  [key: string]: any;
}
