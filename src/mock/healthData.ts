// Initial Real Health Data Models (Zero Dummy Data Baseline)
// All metrics start at empty / unconfigured state until live records are fetched from APIs or Health Connect.

import { TriPillarHealthSummary, DeviceMetadata } from '../types/health';

export const initialConnectedDevices: DeviceMetadata[] = [
  {
    id: 'health_connect',
    name: 'Android Health Connect',
    model: 'Android System Hub (Priority #1)',
    lastSyncTime: 'Awaiting sync',
    isConnected: false,
    accentColor: '#3B82F6',
  },
  {
    id: 'ultrahuman',
    name: 'Ultrahuman Ring AIR',
    model: 'AIR Raw Titanium',
    lastSyncTime: 'Not configured (Enter token in Settings)',
    isConnected: false,
    accentColor: '#10B981',
  },
  {
    id: 'hevy',
    name: 'Hevy Training Log',
    model: 'Strength Tracker v4.2',
    lastSyncTime: 'Not configured (Enter API key in Settings)',
    isConnected: false,
    accentColor: '#6366F1',
  },
  {
    id: 'fitbit',
    name: 'Google Fitbit Tracker',
    model: 'Fitbit Tracker',
    lastSyncTime: 'Not configured (Enter token in Settings)',
    isConnected: false,
    accentColor: '#94A3B8',
  },
];

export const mockConnectedDevices = initialConnectedDevices;

export const initialEmptyHealthSummary: TriPillarHealthSummary = {
  date: 'Today',
  
  // 1. Ultrahuman Ring AIR (Zero fallback: only populates when real token returns metrics)
  recovery: {
    recoveryScore: 0,
    sleepIndex: 0,
    movementIndex: 0,
    sleepDurationMinutes: 0,
    sleepEfficiencyPct: 0,
    deepSleepPct: 0,
    remSleepPct: 0,
    lightSleepPct: 0,
    awakePct: 0,
    restingHeartRate: 0,
    currentHeartRate: undefined,
    sleepHeartRateAvg: undefined,
    sleepHeartRateMin: undefined,
    sleepHeartRateMax: undefined,
    sleepHeartRateDipPct: undefined,
    hrvRmssd: 0,
    skinTempDelta: 0,
    circadianPhase: {
      currentPhase: 'peak_alertness',
      morningSunlightWindow: { start: '—', end: '—' },
      caffeineCutoffTime: '—',
      optimalSleepWindow: { start: '—', end: '—' },
    },
    sleepStages: [],
  },

  // 2. Google Fitbit Data (Zero fallback: only populates when real token returns workouts)
  cardio: {
    todayActiveZoneMinutes: 0,
    cardioCaloriesBurned: 0,
    peakHeartRate: 0,
    averageWorkoutHeartRate: undefined,
    cardioFitnessScore: '—',
    zoneSummary: {
      peakMinutes: 0,
      cardioMinutes: 0,
      fatBurnMinutes: 0,
      outOfZoneMinutes: 0,
    },
    recentWorkout: undefined,
  },

  // 3. Hevy Data (Zero fallback: only populates when real Hevy API key returns workouts)
  strength: {
    weeklyVolumeKg: 0,
    weeklyWorkoutsCount: 0,
    todayWorkout: undefined,
    muscleStatuses: [],
  },

  // 4. Android Health Connect (Zero fallback: only populates when real sensor records exist)
  dailyActivity: {
    steps: 0,
    stepGoal: 10000,
    distanceKm: 0,
    activeCalories: 0,
    totalCalories: 0,
    activeMinutes: 0,
    floorsClimbed: 0,
    source: 'None',
    lastSyncTime: 'Not Synced',
  },

  // 24-hour Combined Timeline (Only populated when real pulse samples exist)
  heartRateTimeline: [],

  readinessToLoadRatio: {
    status: 'active_recovery_only',
    readinessScore: 0,
    title: 'Awaiting Live Telemetry',
    summary: 'No biometric data synced yet. Configure your API keys in Settings to pull live data from your devices.',
  },
};

export const mockTriPillarData: TriPillarHealthSummary = initialEmptyHealthSummary;
