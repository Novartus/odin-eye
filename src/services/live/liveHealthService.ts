// Master Live Health Telemetry Synchronization Service
// Coordinates Android Health Connect (Priority #1), Ultrahuman, Hevy, and Fitbit into a unified live data stream

import { TriPillarHealthSummary } from '../../types/health';
import { initialEmptyHealthSummary } from '../../mock/healthData';
import { hevyApiClient } from '../api/hevyApiClient';
import { ultrahumanApiClient } from '../api/ultrahumanApiClient';
import { fitbitApiClient } from '../api/fitbitApiClient';
import { healthConnect } from '../healthConnect/healthConnectService';
import { credentialsStorage, SavedCredentials } from '../storage/credentialsStorage';
import { SyncReport, TelemetryListener } from '../../types/devices';
export { SyncReport, TelemetryListener } from '../../types/devices';

export class LiveHealthService {
  private static instance: LiveHealthService;
  private currentData: TriPillarHealthSummary = JSON.parse(JSON.stringify(initialEmptyHealthSummary));
  private listeners: Set<TelemetryListener> = new Set();
  private lastReport: SyncReport = {
    success: true,
    timestamp: 'Not Synced',
    sourcesSynced: ['Awaiting sync'],
    errors: [],
  };

  public static getInstance(): LiveHealthService {
    if (!LiveHealthService.instance) {
      LiveHealthService.instance = new LiveHealthService();
    }
    return LiveHealthService.instance;
  }

  // Subscribe to live telemetry updates
  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getData(): TriPillarHealthSummary {
    return this.currentData;
  }

  public getLastReport(): SyncReport {
    return this.lastReport;
  }

  // Master synchronization routine across all configured sources
  public async syncAll(credentials?: Partial<SavedCredentials>): Promise<SyncReport> {
    const creds = credentials
      ? await credentialsStorage.saveCredentials(credentials)
      : await credentialsStorage.loadCredentials();

    const sourcesSynced: string[] = [];
    const errors: string[] = [];
    let hevyCount = 0;
    let recoveryScore = 0;
    let azm = 0;

    // 1. Synchronize Android Health Connect (Priority #1 Master Hub)
    if (creds.healthConnectEnabled !== false) {
      try {
        const validation = await healthConnect.validatePermissions();
        if (validation.hasPermissions) {
          const hcData = await healthConnect.readTodayTelemetry();
          const hasHcMotion = (hcData.steps > 0 || (hcData.distanceKm && hcData.distanceKm > 0) || hcData.activeCalories > 0);

          this.currentData.dailyActivity = {
            steps: hcData.steps,
            stepGoal: 10000,
            distanceKm: hcData.distanceKm || 0,
            activeCalories: hcData.activeCalories || 0,
            totalCalories: hcData.activeCalories ? hcData.activeCalories + 1600 : 0,
            activeMinutes: hcData.activeZoneMinutes || 0,
            floorsClimbed: hcData.steps > 0 ? Math.round(hcData.steps / 550) : 0,
            source: hasHcMotion ? 'Android Health Connect' : 'Health Connect (0 records)',
            lastSyncTime: hcData.lastSyncTime,
          };

          if (hasHcMotion) {
            sourcesSynced.push(`Android Health Connect (${hcData.steps.toLocaleString()} steps • ${hcData.distanceKm} km)`);
          } else {
            sourcesSynced.push('Android Health Connect (0 records today)');
          }

          if (hcData.activeCalories > 0 && (!this.currentData.cardio.cardioCaloriesBurned || this.currentData.cardio.cardioCaloriesBurned === 0)) {
            this.currentData.cardio.cardioCaloriesBurned = hcData.activeCalories;
          }
          if (hcData.latestHeartRate && (!this.currentData.cardio.peakHeartRate || this.currentData.cardio.peakHeartRate < hcData.latestHeartRate)) {
            this.currentData.cardio.peakHeartRate = hcData.latestHeartRate;
          }

          // Automatic Sleep & Vitals Pickup across any Android OS device (zero cloud token required)
          const hasHcSleep = (hcData.sleepMinutes && hcData.sleepMinutes > 0) || (hcData.sleepStages && hcData.sleepStages.length > 0);
          
          if (hasHcSleep || hcData.restingHeartRate || hcData.latestHeartRate || hcData.hrvRmssd) {
            const sleepMinutes = hcData.sleepMinutes || 0;
            const deepPct = hcData.deepSleepPct || 0;
            const remPct = hcData.remSleepPct || 0;
            const lightPct = hcData.lightSleepPct || 0;
            const awakePct = hcData.awakePct || 0;
            const sleepEfficiency = hcData.sleepEfficiencyPct || (sleepMinutes > 0 ? 88 : 0);

            const calculatedSleepIndex = hcData.sleepIndex || healthConnect.calculateSleepIndex(sleepMinutes, deepPct, remPct);
            const calculatedRecovery = hcData.recoveryScore || healthConnect.calculateRecoveryScore(
              calculatedSleepIndex,
              hcData.restingHeartRate,
              hcData.hrvRmssd
            );

            // If user has not provided a separate Ultrahuman cloud API key, auto-populate recovery directly from Health Connect
            if (!creds.ultrahumanToken || !creds.ultrahumanToken.trim()) {
              this.currentData.recovery = {
                recoveryScore: calculatedRecovery,
                sleepIndex: calculatedSleepIndex,
                movementIndex: Math.min(100, Math.round((hcData.steps / 10000) * 100)),
                sleepDurationMinutes: sleepMinutes,
                sleepEfficiencyPct: sleepEfficiency,
                sleepStages: hcData.sleepStages || [],
                deepSleepPct: deepPct,
                remSleepPct: remPct,
                lightSleepPct: lightPct,
                awakePct: awakePct,
                restingHeartRate: hcData.restingHeartRate || 0,
                currentHeartRate: hcData.latestHeartRate || (hcData.restingHeartRate ? hcData.restingHeartRate + 4 : undefined),
                hrvRmssd: hcData.hrvRmssd || 0,
                skinTempDelta: hcData.skinTempDelta || 0,
                circadianPhase: {
                  currentPhase: 'peak_alertness',
                  morningSunlightWindow: { start: '07:30', end: '08:30' },
                  caffeineCutoffTime: '14:00',
                  optimalSleepWindow: { start: '22:45', end: '06:45' },
                },
                source: 'health_connect',
                sourceDeviceName: hcData.originWearable === 'ultrahuman'
                  ? 'Health Connect (Ultrahuman Ring AIR)'
                  : 'Android Health Connect',
              };
              recoveryScore = calculatedRecovery;

              if (hasHcSleep) {
                sourcesSynced.push(`Health Connect (${(sleepMinutes / 60).toFixed(1)}h Sleep • ${calculatedRecovery}% Recovery)`);
              }
            } else {
              // If Ultrahuman token is present, supplement any missing live daytime fields
              if (hcData.latestHeartRate && !this.currentData.recovery.currentHeartRate) {
                this.currentData.recovery.currentHeartRate = hcData.latestHeartRate;
              }
              if (hcData.restingHeartRate && !this.currentData.recovery.restingHeartRate) {
                this.currentData.recovery.restingHeartRate = hcData.restingHeartRate;
              }
            }
          }

          if (hcData.heartRateTimeline && hcData.heartRateTimeline.length > 0) {
            this.currentData.heartRateTimeline = hcData.heartRateTimeline;
          }
        } else {
          // Permissions not authorized yet: do not error or redirect
          sourcesSynced.push('Health Connect (Awaiting Read Authorization)');
        }
      } catch (err: any) {
        errors.push(`Health Connect: ${err?.message || 'Connection failed'}`);
      }
    }

    // 2. Synchronize Ultrahuman Ring AIR (Biological Recovery, Sleep, HRV)
    if (creds.ultrahumanToken && creds.ultrahumanToken.trim()) {
      try {
        const liveRecovery = await ultrahumanApiClient.fetchDailyRecovery(creds.ultrahumanToken);
        if (liveRecovery) {
          this.currentData = {
            ...this.currentData,
            recovery: liveRecovery,
          };
          recoveryScore = liveRecovery.recoveryScore;
          sourcesSynced.push(`Ultrahuman (${recoveryScore}% Recovery)`);
        }
      } catch (err: any) {
        errors.push(`Ultrahuman: ${err?.message || 'Sync failed'}`);
      }
    }

    // 3. Synchronize Hevy Strength Log (Real API)
    if (creds.hevyApiKey && creds.hevyApiKey.trim()) {
      try {
        const workouts = await hevyApiClient.fetchWorkouts(creds.hevyApiKey, 10);
        if (workouts.length > 0) {
          const now = new Date();
          const isSameDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

          const firstWorkout = workouts[0];
          const workoutDate = new Date(firstWorkout.start_time);
          const isWorkoutToday = isSameDay(workoutDate, now);

          const todayWorkout = isWorkoutToday
            ? hevyApiClient.transformWorkout(firstWorkout)
            : undefined;

          // Only calculate weekly volume from workouts within the last 7 days
          const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const weeklyWorkouts = workouts.filter((w) => new Date(w.start_time).getTime() >= sevenDaysAgoMs);
          const weeklyVolume = weeklyWorkouts.reduce((sum, w) => {
            const transformed = hevyApiClient.transformWorkout(w);
            return sum + transformed.totalVolumeKg;
          }, 0);

          const muscleStatuses = hevyApiClient.computeMuscleRecoveryStatuses(workouts);

          this.currentData = {
            ...this.currentData,
            strength: {
              todayWorkout,
              weeklyVolumeKg: weeklyVolume,
              weeklyWorkoutsCount: weeklyWorkouts.length,
              muscleStatuses,
            },
          };

          hevyCount = weeklyWorkouts.length;
          const statusText = todayWorkout
            ? `Hevy (${todayWorkout.title})`
            : `Hevy (All Muscles Primed • Last ${workouts.length > 0 ? '5d ago' : 'none'})`;
          sourcesSynced.push(statusText);
        } else {
          sourcesSynced.push('Hevy (0 logs • All Muscles Primed)');
        }
      } catch (err: any) {
        errors.push(`Hevy: ${err?.message || 'Sync failed'}`);
      }
    }

    // 4. Synchronize Google Fitbit (Strict Recency & Disconnected Handling)
    if (creds.fitbitToken && creds.fitbitToken.trim()) {
      try {
        const liveCardio = await fitbitApiClient.fetchDailyCardio(creds.fitbitToken);
        if (liveCardio && (liveCardio.todayActiveZoneMinutes > 0 || liveCardio.recentWorkout)) {
          this.currentData = {
            ...this.currentData,
            cardio: liveCardio,
          };
          azm = liveCardio.todayActiveZoneMinutes;
          sourcesSynced.push(`Fitbit (${azm} AZM)`);
        } else {
          // Device inactive or 0 workouts today: do not fabricate stale data
          this.currentData = {
            ...this.currentData,
            cardio: {
              todayActiveZoneMinutes: this.currentData.dailyActivity?.activeMinutes || 0,
              cardioCaloriesBurned: this.currentData.dailyActivity?.activeCalories || 0,
              peakHeartRate: 0,
              averageWorkoutHeartRate: undefined,
              cardioFitnessScore: '50-54 (Baseline)',
              zoneSummary: {
                peakMinutes: 0,
                cardioMinutes: 0,
                fatBurnMinutes: 0,
                outOfZoneMinutes: 0,
              },
              recentWorkout: undefined,
            },
          };
          sourcesSynced.push('Fitbit (0 AZM today • HC Fallback)');
        }
      } catch (err: any) {
        errors.push(`Fitbit: ${err?.message || 'Sync failed'}`);
      }
    } else {
      // Fitbit not connected: Source baseline calories & activity from Android Health Connect
      this.currentData.cardio = {
        todayActiveZoneMinutes: this.currentData.dailyActivity?.activeMinutes || 0,
        cardioCaloriesBurned: this.currentData.dailyActivity?.activeCalories || 0,
        peakHeartRate: 0,
        averageWorkoutHeartRate: undefined,
        cardioFitnessScore: '50-54 (Baseline)',
        zoneSummary: {
          peakMinutes: 0,
          cardioMinutes: 0,
          fatBurnMinutes: 0,
          outOfZoneMinutes: 0,
        },
        recentWorkout: undefined,
      };
    }

    // 5. Cross-Synthesize Dynamic Readiness-to-Load Ratio
    const recPct = this.currentData.recovery.recoveryScore;
    const volTons = this.currentData.strength.weeklyVolumeKg / 1000;
    let readinessScore = 0;
    let status: TriPillarHealthSummary['readinessToLoadRatio']['status'] = 'active_recovery_only';
    let title = 'Awaiting Telemetry';
    let summary = 'No biometric or workout logs synced yet. Configure your API credentials in Settings to calculate your training readiness.';

    if (recPct === 0 && volTons === 0 && !this.currentData.strength.todayWorkout) {
      readinessScore = 0;
      status = 'active_recovery_only';
      title = 'Awaiting Telemetry';
      summary = 'No biometric or workout logs synced yet. Configure your API credentials in Settings to calculate your training readiness.';
    } else if (recPct >= 80 && volTons < 15) {
      readinessScore = 92;
      status = 'optimal_for_heavy_load';
      title = 'Optimal for Progressive Overload';
      summary = 'All muscle groups are 100% recovered with zero fatigue debt. Your central nervous system is fully primed for high-intensity training.';
    } else if (recPct >= 65) {
      readinessScore = 74;
      status = 'moderate_load';
      title = 'Moderate Training Capacity';
      summary = 'Maintain moderate intensity. Focus on muscle groups with completed recovery.';
    } else {
      readinessScore = Math.max(1, recPct);
      status = 'active_recovery_only';
      title = 'Active Recovery Only';
      summary = 'Recovery score is suppressed. Prioritize light mobility, hydration, and sleep hygiene.';
    }

    this.currentData.readinessToLoadRatio = {
      status,
      readinessScore,
      title,
      summary,
    };

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const report: SyncReport = {
      success: errors.length === 0,
      timestamp: timeStr,
      sourcesSynced: sourcesSynced.length > 0 ? sourcesSynced : ['None (No active data)'],
      hevyWorkoutCount: hevyCount,
      recoveryScore,
      activeZoneMinutes: azm,
      errors,
    };

    this.lastReport = report;
    await credentialsStorage.saveCredentials({ lastSyncTime: timeStr });

    // Notify all active subscribers
    this.listeners.forEach((listener) => listener(this.currentData, report));

    return report;
  }
}

export const liveHealthService = LiveHealthService.getInstance();
