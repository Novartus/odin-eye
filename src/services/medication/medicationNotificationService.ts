// OS-Level Background & Lock-Screen Medication Notification Service
// Direct native Android AlarmManager integration guaranteed to fire
// high-priority Heads-Up notifications even when the app is completely CLOSED.

import { Platform, PermissionsAndroid, NativeModules } from 'react-native';
import { Medication } from '../../types/medication';

const OdinEyeNotification = NativeModules.OdinEyeNotificationModule;

export const NOTIFICATION_CATEGORY_MEDICATION = 'MEDICATION_REMINDER_V1';
export const NOTIFICATION_ACTION_TAKE = 'ACTION_TAKE_MED';
export const NOTIFICATION_ACTION_SNOOZE = 'ACTION_SNOOZE_MED';
export const NOTIFICATION_ACTION_DISMISS = 'ACTION_DISMISS_MED';

class MedicationNotificationService {
  private static instance: MedicationNotificationService;
  private isInitialized: boolean = false;
  private onOpenAlertCallback?: (medId: string, time: string) => void;

  public static getInstance(): MedicationNotificationService {
    if (!MedicationNotificationService.instance) {
      MedicationNotificationService.instance = new MedicationNotificationService();
    }
    return MedicationNotificationService.instance;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  public triggerAlertCallback(medId: string, time: string): void {
    if (this.onOpenAlertCallback) {
      this.onOpenAlertCallback(medId, time);
    }
  }

  constructor() {
    this.setupNotificationHandler();
  }

  private setupNotificationHandler() {
    // Handler setup if Expo notifications are ever linked in hybrid builds
    try {
      const Notifications = require('expo-notifications');
      if (Notifications && Notifications.setNotificationHandler) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      }
    } catch {}
  }

  /**
   * Check if notifications are enabled for OdinEye at the OS level
   */
  public async checkNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        if (OdinEyeNotification && OdinEyeNotification.areNotificationsEnabled) {
          return await OdinEyeNotification.areNotificationsEnabled();
        }
        if (Platform.Version >= 33) {
          return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Request OS permission to post notifications (Android 13+ runtime POST_NOTIFICATIONS)
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Medication & Health Reminders',
              message: 'OdinEye needs notification permissions to alert you when it is time to take your scheduled medications.',
              buttonPositive: 'Allow',
              buttonNegative: 'Not Now',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else if (OdinEyeNotification && OdinEyeNotification.areNotificationsEnabled) {
          return await OdinEyeNotification.areNotificationsEnabled();
        }
        return true;
      } catch (e) {
        console.warn('[MedNotificationService] Permission request error:', e);
        return false;
      }
    }
    return false;
  }

  /**
   * Open system App Notification Settings so the user can easily toggle permissions
   */
  public async openNotificationSettings(): Promise<void> {
    if (Platform.OS === 'android' && OdinEyeNotification?.openNotificationSettings) {
      try {
        await OdinEyeNotification.openNotificationSettings();
      } catch {}
    }
  }

  /**
   * Request OS permission and register interactive notification handling
   */
  public async initialize(onOpenAlert?: (medId: string, time: string) => void): Promise<boolean> {
    if (onOpenAlert) {
      this.onOpenAlertCallback = onOpenAlert;
    }

    if (Platform.OS === 'android') {
      // Check permission state; if not granted, request it
      const hasPermission = await this.checkNotificationPermission();
      if (!hasPermission) {
        await this.requestNotificationPermission();
      }
      this.isInitialized = true;
      return true;
    }

    return false;
  }

  /**
   * Schedules native Android exact alarms for all medications so they fire even when app is closed
   */
  public async scheduleAllMedicationAlarms(medications: Medication[]): Promise<void> {
    if (Platform.OS === 'android' && OdinEyeNotification) {
      try {
        await OdinEyeNotification.cancelAllAlarms();

        for (const med of medications) {
          if (!med.times || med.times.length === 0) continue;
          for (const timeStr of med.times) {
            const parsed = this.parseTime(timeStr);
            if (!parsed) continue;

            const title = `⏰ Time for ${med.name} ${med.dosage || ''}`.trim();
            const body = `Take ${med.unit || 'scheduled dose'} (${med.frequency || 'Daily'}). Tap to log or snooze.`;
            const alarmId = `alarm_${med.id}_${parsed.hours}_${parsed.minutes}`;

            await OdinEyeNotification.scheduleMedicationAlarm(
              alarmId,
              title,
              body,
              timeStr,
              parsed.hours,
              parsed.minutes
            );
          }
        }
        return;
      } catch (e: any) {
        console.warn('[MedNotificationService] Native alarm schedule error:', e?.message);
      }
    }
  }

  /**
   * Schedule a quick test notification to demonstrate the Heads-Up lock-screen alert
   */
  public async sendTestPopNotification(
    medName: string = 'Vitamin D3 (1000 IU)',
    unit: string = '1 tablet'
  ): Promise<boolean> {
    // 1. First ensure permission is active
    const hasPermission = await this.checkNotificationPermission();
    if (!hasPermission) {
      const granted = await this.requestNotificationPermission();
      if (!granted) return false;
    }

    // 2. Native Android module dispatch
    if (Platform.OS === 'android' && OdinEyeNotification) {
      try {
        await OdinEyeNotification.sendTestNotification(
          `⏰ Time for ${medName}`,
          `Take ${unit}. Tap to mark as taken or snooze.`,
          2 // Fires after 2 seconds so user can see heads-up banner
        );
        return true;
      } catch (e: any) {
        console.warn('[MedNotificationService] Native test notification failed:', e?.message);
      }
    }

    return false;
  }

  public parseTime(timeStr: string): { hours: number; minutes: number } | null {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  }
}

export const medicationNotificationService = MedicationNotificationService.getInstance();
