// Official Hevy Developer API Client
// Connects to https://api.hevyapp.com/v1 to ingest actual strength workouts, exercises, tonnage, and muscle recovery clocks

import { HevyWorkoutSession, HevyExercise, ExerciseSet, MuscleGroup, MuscleRecoveryStatus } from '../../types/health';

import {
  RawHevySet,
  RawHevyExercise,
  RawHevyWorkout,
  HevyWorkoutsResponse,
} from '../../types';

export {
  RawHevySet,
  RawHevyExercise,
  RawHevyWorkout,
  HevyWorkoutsResponse,
};

// Map common exercise names to primary muscle groups
const EXERCISE_MUSCLE_MAP: Record<string, MuscleGroup[]> = {
  bench: ['chest', 'triceps', 'shoulders'],
  chest: ['chest'],
  press: ['chest', 'shoulders'],
  fly: ['chest'],
  incline: ['chest', 'shoulders'],
  pushup: ['chest', 'triceps'],
  dips: ['chest', 'triceps'],
  
  pullup: ['back', 'biceps'],
  row: ['back', 'biceps'],
  lat: ['back'],
  pulldown: ['back', 'biceps'],
  deadlift: ['back', 'hamstrings', 'glutes'],
  shrug: ['back', 'shoulders'],

  squat: ['quads', 'glutes'],
  leg: ['quads', 'hamstrings'],
  extension: ['quads'],
  press_leg: ['quads', 'glutes'],
  lunge: ['quads', 'glutes'],
  curl_leg: ['hamstrings'],
  rdl: ['hamstrings', 'glutes'],

  shoulder: ['shoulders'],
  overhead: ['shoulders', 'triceps'],
  lateral: ['shoulders'],
  military: ['shoulders', 'triceps'],
  delt: ['shoulders'],

  bicep: ['biceps'],
  curl: ['biceps'],
  hammer: ['biceps'],

  tricep: ['triceps'],
  skull: ['triceps'],
  pushdown: ['triceps'],

  crunch: ['core'],
  plank: ['core'],
  ab: ['core'],
  hanging: ['core'],
  calf: ['calves'],
  raise_calf: ['calves'],
};

export class HevyApiClient {
  private static instance: HevyApiClient;
  private readonly baseUrl = 'https://api.hevyapp.com/v1';

  public static getInstance(): HevyApiClient {
    if (!HevyApiClient.instance) {
      HevyApiClient.instance = new HevyApiClient();
    }
    return HevyApiClient.instance;
  }

  // Validate API key with Hevy server
  public async testConnection(apiKey: string): Promise<{ success: boolean; message: string; workoutCount?: number }> {
    try {
      const trimmedKey = apiKey.trim();
      if (!trimmedKey) {
        return { success: false, message: 'API key cannot be empty' };
      }

      const response = await fetch(`${this.baseUrl}/workouts?page=1&pageSize=1`, {
        method: 'GET',
        headers: {
          'api-key': trimmedKey,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Invalid Hevy API Key. Check your Hevy app > Settings > Developer API' };
      }

      if (!response.ok) {
        return { success: false, message: `Hevy server returned status ${response.status}` };
      }

      const data: HevyWorkoutsResponse = await response.json();
      const count = data.workouts ? data.workouts.length : 0;
      return {
        success: true,
        message: `Connected successfully! Found ${count} workout(s).`,
        workoutCount: count,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err?.message || 'Network request error'}`,
      };
    }
  }

  // Fetch actual recent workout logs
  public async fetchWorkouts(apiKey: string, pageSize = 5): Promise<RawHevyWorkout[]> {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) return [];

    const response = await fetch(`${this.baseUrl}/workouts?page=1&pageSize=${pageSize}`, {
      method: 'GET',
      headers: {
        'api-key': trimmedKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Hevy workouts: HTTP ${response.status}`);
    }

    const data: HevyWorkoutsResponse = await response.json();
    return data.workouts || [];
  }

  // Detect target muscles from exercise title
  public detectMuscles(exerciseTitle: string): MuscleGroup[] {
    const titleLower = exerciseTitle.toLowerCase();
    for (const [keyword, muscles] of Object.entries(EXERCISE_MUSCLE_MAP)) {
      if (titleLower.includes(keyword)) {
        return muscles;
      }
    }
    return ['chest']; // default fallback
  }

  // Transform raw Hevy workout into parsed HevyWorkoutSession
  public transformWorkout(raw: RawHevyWorkout): HevyWorkoutSession {
    let totalVolumeKg = 0;
    let totalSets = 0;
    let totalReps = 0;
    const muscleHits: Record<MuscleGroup, number> = {
      chest: 0,
      back: 0,
      quads: 0,
      hamstrings: 0,
      glutes: 0,
      shoulders: 0,
      biceps: 0,
      triceps: 0,
      core: 0,
      calves: 0,
    };

    const exercises: HevyExercise[] = (raw.exercises || []).map((ex, index) => {
      const targetMuscles = this.detectMuscles(ex.title || 'Workout');
      const sets: ExerciseSet[] = (ex.sets || []).map((s, sIdx) => {
        const weight = s.weight_kg || 0;
        const reps = s.reps || 0;
        const vol = weight * reps;
        totalVolumeKg += vol;
        totalSets += 1;
        totalReps += reps;

        targetMuscles.forEach((m) => {
          muscleHits[m] = (muscleHits[m] || 0) + vol;
        });

        return {
          setNumber: sIdx + 1,
          weightKg: weight,
          reps: reps,
          rpe: s.rpe || undefined,
          isWarmup: s.set_type === 'warmup',
        };
      });

      const exVolume = sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);

      return {
        id: ex.exercise_template_id || `ex-${index}`,
        title: ex.title || 'Exercise',
        targetMuscles,
        sets,
        totalVolumeKg: exVolume,
      };
    });

    const startMs = new Date(raw.start_time).getTime();
    const endMs = new Date(raw.end_time).getTime();
    const durationMinutes = Math.max(15, Math.round((endMs - startMs) / (1000 * 60)));

    // Calculate percentage muscle distribution
    const totalHitVolume = Object.values(muscleHits).reduce((a, b) => a + b, 0) || 1;
    const muscleDistribution = (Object.keys(muscleHits) as MuscleGroup[]).reduce((acc, m) => {
      acc[m] = Math.round(((muscleHits[m] || 0) / totalHitVolume) * 100);
      return acc;
    }, {} as Record<MuscleGroup, number>);

    return {
      id: raw.id,
      title: raw.title || 'Strength Session',
      startTime: raw.start_time,
      endTime: raw.end_time,
      durationMinutes,
      totalVolumeKg,
      totalSets,
      totalReps,
      exercises,
      muscleDistribution,
    };
  }

  // Compute live 48h-72h recovery clocks from recent workouts
  public computeMuscleRecoveryStatuses(workouts: RawHevyWorkout[]): MuscleRecoveryStatus[] {
    const now = Date.now();
    const allGroups: { key: MuscleGroup; name: string }[] = [
      { key: 'chest', name: 'Chest (Pectorals)' },
      { key: 'back', name: 'Back (Lats & Traps)' },
      { key: 'shoulders', name: 'Deltoids & Shoulders' },
      { key: 'quads', name: 'Quadriceps' },
      { key: 'hamstrings', name: 'Hamstrings & Glutes' },
      { key: 'triceps', name: 'Triceps Brachii' },
      { key: 'biceps', name: 'Biceps Brachii' },
      { key: 'core', name: 'Core & Abdominals' },
    ];

    // Find the latest workout that hit each muscle group
    const latestTrained: Partial<Record<MuscleGroup, { timeMs: number; volumeKg: number }>> = {};

    workouts.forEach((w) => {
      const workoutTime = new Date(w.end_time || w.start_time).getTime();
      (w.exercises || []).forEach((ex) => {
        const muscles = this.detectMuscles(ex.title || '');
        const vol = (ex.sets || []).reduce((sum, s) => sum + (s.weight_kg || 0) * (s.reps || 0), 0);
        muscles.forEach((m) => {
          if (!latestTrained[m] || workoutTime > latestTrained[m]!.timeMs) {
            latestTrained[m] = { timeMs: workoutTime, volumeKg: vol };
          }
        });
      });
    });

    return allGroups.map(({ key, name }) => {
      const hit = latestTrained[key];
      if (!hit) {
        // Not trained recently -> Primed
        return {
          muscle: key,
          displayName: name,
          recoveryPct: 100,
          state: 'primed',
          lastTrainedDate: 'Fully recovered (>72h)',
          hoursElapsed: 72,
          recommendedHoursRemaining: 0,
        };
      }

      const elapsedHours = Math.max(0, Math.round((now - hit.timeMs) / (1000 * 60 * 60)));
      const requiredHours = 54; // Standard hypertrophy recovery window

      if (elapsedHours >= requiredHours) {
        return {
          muscle: key,
          displayName: name,
          recoveryPct: 100,
          state: 'primed',
          lastTrainedDate: `${elapsedHours}h ago`,
          hoursElapsed: elapsedHours,
          recommendedHoursRemaining: 0,
        };
      }

      const recoveryPct = Math.min(95, Math.max(15, Math.round((elapsedHours / requiredHours) * 100)));
      const remainingHours = Math.max(0, requiredHours - elapsedHours);
      const state = recoveryPct < 45 ? 'fatigued' : 'recovering';

      return {
        muscle: key,
        displayName: name,
        recoveryPct,
        state,
        lastTrainedDate: `${elapsedHours}h ago`,
        hoursElapsed: elapsedHours,
        recommendedHoursRemaining: remainingHours,
      };
    });
  }
}

export const hevyApiClient = HevyApiClient.getInstance();
