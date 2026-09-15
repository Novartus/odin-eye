// OdinEye Widget Synchronization Service
// Synchronizes Medication schedule, Zen streak, Daily Steps, and Heart Rate
// directly with Android Home Screen AppWidgets (2x2 & 4x2 Bento Glance Widgets).

import { NativeModules } from 'react-native';
import { medicationService, ScheduledDoseItem } from '../medication/medicationService';
import { mindfulnessService } from '../mindfulness/mindfulnessService';
import { liveHealthService } from '../live/liveHealthService';
import { credentialsStorage } from '../storage/credentialsStorage';
import { getTodayDateKey } from '../../utils';

const { OdinEyeWidgetModule } = NativeModules;

class WidgetSyncService {
  private static instance: WidgetSyncService;
  private isSubscribed = false;

  public static getInstance(): WidgetSyncService {
    if (!WidgetSyncService.instance) {
      WidgetSyncService.instance = new WidgetSyncService();
    }
    return WidgetSyncService.instance;
  }

  public init() {
    if (this.isSubscribed) return;
    this.isSubscribed = true;

    // 1. Check if user tapped "Take" on the home screen widget while app was suspended
    this.processPendingWidgetActions();

    // 2. Initial push to widgets
    this.syncAllWidgets();

    // 3. Subscribe to service changes
    medicationService.subscribe(() => {
      this.syncPillWidget();
    });

    mindfulnessService.subscribe(() => {
      this.syncZenWidget();
    });

    liveHealthService.subscribe(() => {
      this.syncZenWidget();
    });
  }

  public async syncAllWidgets(): Promise<void> {
    await Promise.all([this.syncPillWidget(), this.syncZenWidget()]);
  }

  /**
   * Synchronizes next scheduled dose with Android Home Screen Pill Widget
   */
  public async syncPillWidget(): Promise<void> {
    try {
      const todayKey = getTodayDateKey();
      const dailySchedule: ScheduledDoseItem[] = medicationService.getScheduledDosesForDate(todayKey);

      // Find first untaken dose, or the latest taken dose
      const nextUntaken = dailySchedule.find((item: ScheduledDoseItem) => !item.isTaken);
      const currentItem = nextUntaken || dailySchedule[dailySchedule.length - 1];

      let medName = 'All clear';
      let dosage = 'No doses pending';
      let time = 'Today completed';
      let status = 'Completed';
      let isTaken = true;
      let doseId = 'none';

      if (currentItem) {
        medName = currentItem.medication.name;
        dosage = `${currentItem.medication.dosage} · ${currentItem.medication.form}`;
        time = `Due at ${currentItem.time}`;
        status = currentItem.isTaken ? 'Taken' : 'Upcoming';
        isTaken = currentItem.isTaken;
        doseId = `${currentItem.medication.id}___${currentItem.time}`;
      } else if (dailySchedule.length === 0) {
        medName = 'No medications';
        dosage = 'Tap to add your schedule';
        time = 'Schedule empty';
        status = 'Empty';
        isTaken = false;
        doseId = 'empty';
      }

      if (OdinEyeWidgetModule?.updatePillWidget) {
        await OdinEyeWidgetModule.updatePillWidget(
          medName,
          dosage,
          time,
          status,
          isTaken,
          doseId
        );
      }
    } catch (e) {
      console.log('[WidgetSync] Pill sync error:', e);
    }
  }

  /**
   * Synchronizes steps, step goal, heart rate, and Zen streak with Android Home Screen Widget
   */
  public async syncZenWidget(): Promise<void> {
    try {
      const healthData = liveHealthService.getData();
      const mindfulStats = mindfulnessService.getWeeklyStats();
      const creds = await credentialsStorage.loadCredentials();

      const steps = healthData.dailyActivity?.steps || 0;
      const stepGoal = healthData.dailyActivity?.stepGoal || creds.dailyStepsGoal || 10000;
      const heartRate = healthData.recovery?.currentHeartRate || healthData.recovery?.restingHeartRate || 0;
      const streakDays = mindfulStats.currentStreak;

      if (OdinEyeWidgetModule?.updateZenWidget) {
        await OdinEyeWidgetModule.updateZenWidget(
          Math.round(steps),
          Math.round(stepGoal),
          Math.round(heartRate),
          Math.round(streakDays)
        );
      }
    } catch (e) {
      console.log('[WidgetSync] Zen sync error:', e);
    }
  }

  /**
   * Checks if user pressed "Take" button on the home screen widget and updates medicationService
   */
  public async processPendingWidgetActions(): Promise<void> {
    if (!OdinEyeWidgetModule?.getPendingWidgetActions) return;

    try {
      const actionResult = await OdinEyeWidgetModule.getPendingWidgetActions();
      if (actionResult && actionResult.action === 'TAKE_PILL' && actionResult.doseId) {
        const [medId, time] = actionResult.doseId.split('___');
        if (medId && time) {
          const todayKey = getTodayDateKey();
          await medicationService.toggleDoseTaken(medId, time, todayKey);
          await this.syncPillWidget();
        }
      }
    } catch (e) {
      console.log('[WidgetSync] Process pending error:', e);
    }
  }

  /**
   * Checks if user launched the app by tapping a specific widget card
   */
  public async getRequestedTab(): Promise<string | null> {
    if (!OdinEyeWidgetModule?.getRequestedTab) return null;
    try {
      return await OdinEyeWidgetModule.getRequestedTab();
    } catch {
      return null;
    }
  }

  /**
   * Prompts native Android OS dialog to pin widget to home screen (Android 8.0+)
   */
  public async requestPinWidget(widgetType: 'pill' | 'zen'): Promise<boolean> {
    try {
      if (OdinEyeWidgetModule?.requestPinWidget) {
        return await OdinEyeWidgetModule.requestPinWidget(widgetType);
      }
      return false;
    } catch (e) {
      console.log('[WidgetSync] Request pin widget error:', e);
      return false;
    }
  }
}

export const widgetSyncService = WidgetSyncService.getInstance();
