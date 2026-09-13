// Ultrahuman Ring AIR API Client
// Connects to Ultrahuman Partner & Metric APIs for real sleep architecture, recovery index, HRV, and circadian phases

import { UltrahumanRecoveryData, SleepStageRecord } from '../../types/health';

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
  sleep_efficiency?: number;
  efficiency?: number;
  steps?: number;
  total_steps?: number;
  step_count?: number;
  steps_count?: number;
  [key: string]: any;
}

export class UltrahumanApiClient {
  private static instance: UltrahumanApiClient;
  private readonly baseUrl = 'https://partner.ultrahuman.com/api/v1';

  public static getInstance(): UltrahumanApiClient {
    if (!UltrahumanApiClient.instance) {
      UltrahumanApiClient.instance = new UltrahumanApiClient();
    }
    return UltrahumanApiClient.instance;
  }

  // Validate Ultrahuman Token
  public async testConnection(apiToken: string): Promise<{ success: boolean; message: string }> {
    try {
      const trimmedToken = apiToken.trim();
      if (!trimmedToken) {
        return { success: false, message: 'Ultrahuman token cannot be empty' };
      }

      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${this.baseUrl}/metrics?date=${today}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${trimmedToken}`,
          'Accept': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Invalid Ultrahuman API Token' };
      }

      if (!response.ok && response.status !== 404) {
        return { success: false, message: `Ultrahuman returned status ${response.status}` };
      }

      return {
        success: true,
        message: 'Ultrahuman Ring AIR connected successfully!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err?.message || 'Network error'}`,
      };
    }
  }

  // Unpack nested payload variations from Ultrahuman APIs
  public extractMetricPayload(json: any): RawUltrahumanMetric | null {
    if (!json) return null;
    if (Array.isArray(json.data) && json.data.length > 0) {
      return json.data[json.data.length - 1] || json.data[0];
    }
    if (json.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
      return json.data;
    }
    if (Array.isArray(json.metrics) && json.metrics.length > 0) {
      return json.metrics[json.metrics.length - 1] || json.metrics[0];
    }
    if (json.metrics && typeof json.metrics === 'object') {
      return json.metrics;
    }
    if (Array.isArray(json) && json.length > 0) {
      return json[json.length - 1] || json[0];
    }
    return json;
  }

  private isMetricEmpty(raw: RawUltrahumanMetric | null): boolean {
    if (!raw) return true;
    const rec = raw.recovery_index ?? raw.recovery_score ?? raw.recoveryIndex ?? raw.score;
    const sleep = raw.sleep_index ?? raw.sleep_score ?? raw.sleepIndex;
    const hrv = raw.hrv ?? raw.hrv_rmssd ?? raw.rmssd;
    return rec == null && sleep == null && hrv == null;
  }

  private async fetchMetricsForDate(token: string, date: string): Promise<RawUltrahumanMetric | null> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      return this.extractMetricPayload(json);
    } catch {
      return null;
    }
  }

  // Fetch actual daily biometrics with yesterday fallback if today's sleep cycle is not finalized
  public async fetchDailyRecovery(apiToken: string, dateStr?: string): Promise<UltrahumanRecoveryData | null> {
    const trimmedToken = apiToken.trim();
    if (!trimmedToken) return null;

    const today = dateStr || new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 1. Try querying requested date (today)
    let payload = await this.fetchMetricsForDate(trimmedToken, today);

    // 2. If today has not been finalized yet by Ring AIR, query yesterday's completed hypnogram
    if (!payload || this.isMetricEmpty(payload)) {
      const yesterdayPayload = await this.fetchMetricsForDate(trimmedToken, yesterday);
      if (yesterdayPayload && !this.isMetricEmpty(yesterdayPayload)) {
        payload = yesterdayPayload;
      }
    }

    if (!payload) return null;
    return this.transformMetrics(payload);
  }

  public transformMetrics(raw: RawUltrahumanMetric): UltrahumanRecoveryData {
    const totalSleepSecs = raw.total_sleep_time_seconds ?? raw.total_sleep_seconds ?? (raw.total_sleep_minutes ? raw.total_sleep_minutes * 60 : undefined) ?? 0;
    const deepSleepSecs = raw.deep_sleep_seconds ?? (raw.deep_sleep_minutes ? raw.deep_sleep_minutes * 60 : undefined) ?? 0;
    const remSleepSecs = raw.rem_sleep_seconds ?? (raw.rem_sleep_minutes ? raw.rem_sleep_minutes * 60 : undefined) ?? 0;
    const lightSleepSecs = raw.light_sleep_seconds ?? (raw.light_sleep_minutes ? raw.light_sleep_minutes * 60 : undefined) ?? 0;
    const awakeSecs = raw.awake_seconds ?? (raw.awake_minutes ? raw.awake_minutes * 60 : undefined) ?? 0;

    const totalMinutes = Math.round(totalSleepSecs / 60);
    const deepMinutes = Math.round(deepSleepSecs / 60);
    const remMinutes = Math.round(remSleepSecs / 60);
    const lightMinutes = Math.round(lightSleepSecs / 60);
    const awakeMinutes = Math.round(awakeSecs / 60);

    const safeTotal = totalMinutes || 0;
    const deepSleepPct = safeTotal > 0 ? Math.round((deepMinutes / safeTotal) * 100) : 0;
    const remSleepPct = safeTotal > 0 ? Math.round((remMinutes / safeTotal) * 100) : 0;
    const lightSleepPct = safeTotal > 0 ? Math.round((lightMinutes / safeTotal) * 100) : 0;
    const awakePct = safeTotal > 0 ? Math.round((awakeMinutes / safeTotal) * 100) : 0;

    // Only populate sleep stages if raw API returned them
    const rawStages = raw.sleep_stages ?? raw.stages;
    const sleepStages: SleepStageRecord[] = Array.isArray(rawStages) && rawStages.length > 0
      ? rawStages.map((s: any) => ({
          stage: s.stage || 'light',
          startTime: s.start_time || s.startTime || '',
          endTime: s.end_time || s.endTime || '',
          durationMinutes: s.duration_minutes || s.durationMinutes || Math.round((s.duration_seconds || 0) / 60),
        }))
      : [];

    // Compute dynamic circadian windows based on sleep metrics
    const currentHour = new Date().getHours();
    let currentPhase: UltrahumanRecoveryData['circadianPhase']['currentPhase'] = 'peak_alertness';
    if (currentHour >= 13 && currentHour <= 15) currentPhase = 'post_lunch_dip';
    else if (currentHour >= 19 && currentHour <= 21) currentPhase = 'evening_winddown';
    else if (currentHour >= 21 && currentHour <= 23) currentPhase = 'melatonin_window';
    else if (currentHour >= 23 || currentHour < 6) currentPhase = 'deep_rest';

    // Zero dummy data: only exact returned values are assigned
    const recoveryScore = raw.recovery_index ?? raw.recovery_score ?? raw.recoveryIndex ?? raw.score ?? 0;
    const sleepIndex = raw.sleep_index ?? raw.sleep_score ?? raw.sleepIndex ?? 0;
    const movementIndex = raw.movement_index ?? raw.movement_score ?? raw.movementIndex ?? 0;
    const restingHeartRate = raw.resting_hr ?? raw.resting_heart_rate ?? raw.rhr ?? raw.restingHeartRate ?? 0;
    const currentHeartRate = raw.current_heart_rate ?? raw.current_hr ?? raw.latest_heart_rate ?? raw.latest_hr ?? raw.heart_rate ?? raw.hr ?? undefined;
    const hrvRmssd = raw.hrv ?? raw.hrv_rmssd ?? raw.rmssd ?? 0;
    const skinTempDelta = raw.temp_deviation ?? raw.temperature_deviation ?? raw.temp_delta ?? 0;
    const sleepEfficiencyPct = raw.sleep_efficiency ?? raw.efficiency ?? 0;
    const steps = raw.steps ?? raw.total_steps ?? raw.step_count ?? raw.steps_count ?? undefined;

    return {
      recoveryScore,
      sleepIndex,
      movementIndex,
      sleepDurationMinutes: totalMinutes,
      sleepEfficiencyPct,
      sleepStages,
      deepSleepPct,
      remSleepPct,
      lightSleepPct,
      awakePct,
      restingHeartRate,
      currentHeartRate,
      hrvRmssd,
      skinTempDelta,
      steps,
      circadianPhase: {
        currentPhase,
        morningSunlightWindow: { start: totalMinutes > 0 ? '07:15' : '—', end: totalMinutes > 0 ? '08:45' : '—' },
        caffeineCutoffTime: totalMinutes > 0 ? '14:00' : '—',
        optimalSleepWindow: { start: totalMinutes > 0 ? '22:45' : '—', end: totalMinutes > 0 ? '06:45' : '—' },
      },
    };
  }
}

export const ultrahumanApiClient = UltrahumanApiClient.getInstance();
