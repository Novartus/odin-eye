// Android Health Connect Types & Interfaces
// Canonical source: src/types/healthConnect.ts

import { SleepStageRecord, HeartRateSample } from './health';

export interface HealthConnectPermissionState {
  isAvailable: boolean;
  hasPermissions: boolean;
  permissions: {
    sleep: boolean;
    heartRate: boolean;
    restingHeartRate: boolean;
    heartRateVariability: boolean;
    steps: boolean;
    distance: boolean;
    activeCalories: boolean;
    totalCalories: boolean;
    exercise: boolean;
    skinTemperature: boolean;
    oxygenSaturation: boolean;
    respiratoryRate: boolean;
  };
}

export interface HealthConnectDailyTelemetry {
  steps: number;
  activeCalories: number;
  totalCalories?: number;
  restingHeartRate?: number;
  latestHeartRate?: number;
  hrvRmssd?: number;
  skinTempDelta?: number;
  distanceKm?: number;
  activeZoneMinutes?: number;
  sleepMinutes?: number;
  sleepIndex?: number;
  sleepEfficiencyPct?: number;
  sleepStages?: SleepStageRecord[];
  deepSleepPct?: number;
  remSleepPct?: number;
  lightSleepPct?: number;
  awakePct?: number;
  sleepHeartRateAvg?: number;
  sleepHeartRateMin?: number;
  sleepHeartRateMax?: number;
  sleepHeartRateDipPct?: number;
  recoveryScore?: number;
  heartRateTimeline?: HeartRateSample[];
  lastSyncTime: string;
  connectedSources: string[];
  originWearable?: 'ultrahuman' | 'fitbit' | 'smart_ring' | 'wear_os' | 'other';
  sourceDeviceName?: string;
}

export interface HealthConnectValidationResult {
  hasPermissions: boolean;
  isConfigured: boolean;
  grantedCount: number;
  totalCount: number;
  environment: 'expo_go' | 'standalone_android' | 'web';
  statusMessage: string;
}

export interface NormalizedHrSample {
  timeMs: number;
  bpm: number;
  origin: string;
  timeStr: string;
}
