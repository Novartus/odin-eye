// Device Sources & Telemetry Sync Types

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

export interface EnabledSources {
  ultrahuman: boolean;
  fitbit: boolean;
  hevy: boolean;
}

export interface SyncReport {
  success: boolean;
  timestamp: string;
  sourcesSynced: string[];
  hevyWorkoutCount?: number;
  recoveryScore?: number;
  activeZoneMinutes?: number;
  errors: string[];
}

export type TelemetryListener = (data: any, report: SyncReport) => void;
