// OS-Level Background & Lock-Screen Medication Notification Service
// Handles scheduling local system notifications with interactive action buttons
// (Take Dose, Snooze, Dismiss) so alerts fire even when the app is completely CLOSED.

import { Platform } from 'react-native';
import { Medication } from './medicationTypes';

// Dynamic import of expo-notifications to avoid build crashes if package isn't installed yet
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch {
  Notifications = null;
}

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

  constructor() {
    this.setupNotificationHandler();
  }

  /**
   * Configure how notifications are handled when the app is foregrounded
   */
  private setupNotificationHandler() {
    if (!Notifications) return;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    } catch {}
  }

  /**
   * Request OS permission and register interactive action categories (Take, Snooze, Dismiss)
   */
  public async initialize(onOpenAlert?: (medId: string, time: string) => void): Promise<boolean> {
    if (onOpenAlert) {
      this.onOpenAlertCallback = onOpenAlert;
    }

    if (!Notifications) {
      console.log('[MedNotificationService] In-app medication reminders & alerts active. (Background lock-screen alerts will activate when expo-notifications is installed in native build).');
      return false;
    }

    try {
      // 1. Request notification permissions (Android 13+ runtime POST_NOTIFICATIONS & iOS)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[MedNotificationService] Notification permissions not granted.');
        return false;
      }

      // 2. Android Notification Channel configuration (high importance heads-up pop alert)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
          name: 'Medication Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 400, 200, 400],
          lightColor: '#007AFF',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });
      }

      // 3. Register interactive action buttons on the notification
      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY_MEDICATION, [
        {
          identifier: NOTIFICATION_ACTION_TAKE,
          buttonTitle: '✓ Take Dose',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTION_SNOOZE,
          buttonTitle: '⏰ Snooze 10m',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTION_DISMISS,
          buttonTitle: 'Dismiss',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);

      // 4. Handle when user touches notification or an action button (even when app was closed)
      Notifications.addNotificationResponseReceivedListener(async (response: any) => {
        const actionId = response.actionIdentifier;
        const data = response.notification.request.content.data;
        const medId = data?.medId;
        const scheduledTime = data?.time;

        if (!medId) return;

        // Lazy load medicationService on user notification response to avoid circular require cycle
        const { medicationService } = require('./medicationService');

        if (actionId === NOTIFICATION_ACTION_TAKE) {
          // One-tap taken directly from notification
          const today = medicationService.getTodayDateKey();
          await medicationService.toggleDoseTaken(medId, scheduledTime || '08:00 AM', today);
        } else if (actionId === NOTIFICATION_ACTION_SNOOZE) {
          // Snooze dose
          medicationService.snoozeReminder(medId, scheduledTime || '08:00 AM', 10);
        } else {
          // User touched the notification banner -> open app and show interactive alert modal
          if (this.onOpenAlertCallback && scheduledTime) {
            this.onOpenAlertCallback(medId, scheduledTime);
          }
        }
      });

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('[MedNotificationService] Failed to initialize notifications:', err);
      return false;
    }
  }

  /**
   * Schedules OS-level alarms for all medications so they trigger when app is closed
   */
  public async scheduleAllMedicationAlarms(medications: Medication[]): Promise<void> {
    if (!Notifications || !this.isInitialized) return;

    try {
      // Clear previously scheduled alarms to avoid duplicates
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const med of medications) {
        for (const timeStr of med.times) {
          const parsed = this.parseTime(timeStr);
          if (!parsed) continue;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ Time for ${med.name} ${med.dosage}`,
              body: `Take ${med.unit} (${med.frequency}). Tap to log or snooze.`,
              data: {
                medId: med.id,
                time: timeStr,
              },
              sound: 'default',
              categoryIdentifier: NOTIFICATION_CATEGORY_MEDICATION,
              color: '#007AFF',
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: parsed.hours,
              minute: parsed.minutes,
              channelId: 'medication-reminders',
            },
          });
        }
      }
    } catch (e: any) {
      console.warn('[MedNotificationService] Failed to schedule alarms:', e?.message);
    }
  }

  /**
   * Schedule a one-off test notification 5 seconds from now so user can lock their phone and see it!
   */
  public async sendTestPopNotification(medName: string = 'Roaccutane 30mg', unit: string = '1 capsule'): Promise<boolean> {
    if (!Notifications) return false;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ Time for ${medName}`,
          body: `Take ${unit}. Tap to mark as taken or snooze.`,
          data: {
            medId: 'test-med',
            time: '08:00 AM',
          },
          sound: 'default',
          categoryIdentifier: NOTIFICATION_CATEGORY_MEDICATION,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
          channelId: 'medication-reminders',
        },
      });
      return true;
    } catch (e: any) {
      console.warn('[MedNotificationService] Test notification failed:', e?.message);
      return false;
    }
  }

  private parseTime(timeStr: string): { hours: number; minutes: number } | null {
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
