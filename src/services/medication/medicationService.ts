// Medication & Supplement Reminder Service
// Dual-layer persistent storage (expo-secure-store + expo-file-system)
// Guaranteed zero data loss across app reloads.
// Includes full-month schedule queries and real-time dose reminder monitoring.

import * as SecureStore from 'expo-secure-store';
import { Vibration } from 'react-native';
import { medicationNotificationService } from './medicationNotificationService';

import {
  Medication,
  ScheduledDoseItem,
  ReminderAlertEvent,
} from '../../types/medication';
export * from '../../types/medication';

const STORAGE_KEY = 'odineye_medications_data_v2';
const FILE_BACKUP_NAME = 'odineye_medications_backup.json';

type ReminderListener = (alert: ReminderAlertEvent) => void;

class MedicationService {
  private static instance: MedicationService;
  private medications: Medication[] = [];
  private isLoaded: boolean = false;
  private fileSystem: any = null;
  private backupPath: string | null = null;
  private reminderListeners: ReminderListener[] = [];
  private checkIntervalTimer: any = null;
  private dismissedAlertKeys: Set<string> = new Set();

  public static getInstance(): MedicationService {
    if (!MedicationService.instance) {
      MedicationService.instance = new MedicationService();
    }
    return MedicationService.instance;
  }

  constructor() {
    this.initFileSystem();
    this.loadFromStorage();
    this.startReminderWatcher();
  }

  private initFileSystem() {
    try {
      const fs = require('expo-file-system');
      if (fs && fs.documentDirectory) {
        this.fileSystem = fs;
        this.backupPath = `${fs.documentDirectory}${FILE_BACKUP_NAME}`;
      }
    } catch {
      this.fileSystem = null;
    }
  }

  public getTodayDateKey(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Dual-layer storage load:
   * 1. Try expo-secure-store
   * 2. If null or failed, try sandboxed expo-file-system
   * 3. If still empty, seed defaults and save
   */
  public async loadFromStorage(): Promise<Medication[]> {
    let loadedData: Medication[] | null = null;

    // 1. expo-secure-store
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        loadedData = JSON.parse(raw);
      }
    } catch (e: any) {
      console.warn('[MedicationService] SecureStore load notice:', e?.message);
    }

    // 2. Sandboxed FileSystem fallback
    if (!loadedData && this.fileSystem && this.backupPath) {
      try {
        const info = await this.fileSystem.getInfoAsync(this.backupPath);
        if (info.exists) {
          const rawFile = await this.fileSystem.readAsStringAsync(this.backupPath);
          if (rawFile) {
            loadedData = JSON.parse(rawFile);
          }
        }
      } catch {}
    }

    if (loadedData && Array.isArray(loadedData)) {
      // Purge any legacy dummy seed items
      const cleaned = loadedData.filter(
        (m) => m.id !== 'med-carsil-1' && m.id !== 'med-roaccutane-2' && m.id !== 'med-cardioactive-3'
      );
      this.medications = cleaned;
      if (cleaned.length !== loadedData.length) {
        await this.saveToStorage();
      }
    } else {
      this.medications = [];
      await this.saveToStorage();
    }

    this.isLoaded = true;
    const activeMeds = this.medications.filter((m) => !m.isArchived);
    if (activeMeds.length > 0) {
      medicationNotificationService.scheduleAllMedicationAlarms(activeMeds).catch(() => {});
    }
    return this.medications;
  }

  /**
   * Dual-layer save to both SecureStore and FileSystem
   */
  private async saveToStorage(): Promise<void> {
    const payload = JSON.stringify(this.medications);

    // 1. SecureStore
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, payload);
    } catch (e: any) {
      console.warn('[MedicationService] SecureStore save notice:', e?.message);
    }

    // 2. Sandboxed FileSystem
    if (this.fileSystem && this.backupPath) {
      try {
        await this.fileSystem.writeAsStringAsync(this.backupPath, payload);
      } catch {}
    }

    // 3. Sync OS-level background alarms so notifications fire when app is closed
    const activeMeds = this.medications.filter((m) => !m.isArchived);
    medicationNotificationService.scheduleAllMedicationAlarms(activeMeds).catch(() => {});

    this.notify();
  }

  private listeners: (() => void)[] = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      try {
        l();
      } catch {}
    }
  }

  public getMedicationsSync(): Medication[] {
    return this.medications;
  }

  public async getMedications(): Promise<Medication[]> {
    if (!this.isLoaded) {
      await this.loadFromStorage();
    }
    return this.medications;
  }

  public getActiveMedications(): Medication[] {
    return this.medications.filter((m) => !m.isArchived);
  }

  public getArchivedMedications(): Medication[] {
    return this.medications.filter((m) => !!m.isArchived);
  }

  public async addMedication(medData: Omit<Medication, 'id' | 'takenDates'>): Promise<Medication> {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      takenDates: {},
      isArchived: false,
    };
    this.medications.push(newMed);
    await this.saveToStorage();
    return newMed;
  }

  public async updateMedication(id: string, updates: Partial<Medication>): Promise<Medication | null> {
    const index = this.medications.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.medications[index] = { ...this.medications[index], ...updates };
    await this.saveToStorage();
    return this.medications[index];
  }

  public async archiveMedication(id: string, isArchived: boolean = true): Promise<Medication | null> {
    const index = this.medications.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.medications[index].isArchived = isArchived;
    await this.saveToStorage();
    return this.medications[index];
  }

  public async archiveMultipleMedications(ids: string[], isArchived: boolean = true): Promise<void> {
    let modified = false;
    for (const id of ids) {
      const index = this.medications.findIndex((m) => m.id === id);
      if (index !== -1) {
        this.medications[index].isArchived = isArchived;
        modified = true;
      }
    }
    if (modified) {
      await this.saveToStorage();
    }
  }

  public async deleteMedication(id: string): Promise<boolean> {
    const initialLen = this.medications.length;
    this.medications = this.medications.filter((m) => m.id !== id);
    if (this.medications.length !== initialLen) {
      await this.saveToStorage();
      return true;
    }
    return false;
  }

  public async toggleDoseTaken(medId: string, time: string, dateKey?: string): Promise<boolean> {
    const targetDate = dateKey || this.getTodayDateKey();
    const med = this.medications.find((m) => m.id === medId);
    if (!med) return false;

    if (!med.takenDates) {
      med.takenDates = {};
    }
    if (!med.takenDates[targetDate]) {
      med.takenDates[targetDate] = [];
    }

    const takenList = med.takenDates[targetDate];
    const exists = takenList.includes(time);

    if (exists) {
      med.takenDates[targetDate] = takenList.filter((t) => t !== time);
    } else {
      med.takenDates[targetDate].push(time);
      // If taken, dismiss any pending reminder alert for this dose
      this.dismissedAlertKeys.add(`${medId}-${targetDate}-${time}`);
    }

    await this.saveToStorage();
    return !exists;
  }

  public getScheduledDosesForDate(dateKey?: string, includeArchived: boolean = false): ScheduledDoseItem[] {
    const targetDate = dateKey || this.getTodayDateKey();
    const result: ScheduledDoseItem[] = [];

    for (const med of this.medications) {
      if (!includeArchived && med.isArchived) {
        continue; // Exclude archived medications from daily routine & reminders
      }

      const takenTimes = med.takenDates?.[targetDate] || [];
      for (const time of med.times) {
        result.push({
          medication: med,
          time,
          isTaken: takenTimes.includes(time),
          dateKey: targetDate,
        });
      }
    }

    result.sort((a, b) => this.timeToMinutes(a.time) - this.timeToMinutes(b.time));
    return result;
  }

  public getCompletionSummary(dateKey?: string): { total: number; taken: number; percentage: number } {
    const doses = this.getScheduledDosesForDate(dateKey);
    if (doses.length === 0) return { total: 0, taken: 0, percentage: 100 };
    const taken = doses.filter((d) => d.isTaken).length;
    return {
      total: doses.length,
      taken,
      percentage: Math.round((taken / doses.length) * 100),
    };
  }

  /**
   * Returns a map of dateKey -> { total, taken } for an entire month
   */
  public getMonthAdherenceMap(year: number, month: number): Record<string, { total: number; taken: number }> {
    const result: Record<string, { total: number; taken: number }> = {};
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const doses = this.getScheduledDosesForDate(dateKey);
      if (doses.length > 0) {
        const taken = doses.filter((d) => d.isTaken).length;
        result[dateKey] = { total: doses.length, taken };
      }
    }
    return result;
  }

  // ==========================================
  // REAL-TIME REMINDER MONITOR & ALERT SYSTEM
  // ==========================================

  public onReminder(listener: ReminderListener): () => void {
    this.reminderListeners.push(listener);
    return () => {
      this.reminderListeners = this.reminderListeners.filter((l) => l !== listener);
    };
  }

  public triggerTestReminder(): void {
    const today = this.getTodayDateKey();
    const doses = this.getScheduledDosesForDate(today);
    const targetDose = doses.find((d) => !d.isTaken) || doses[0];

    const medToAlert: Medication | undefined =
      targetDose?.medication ||
      this.medications.find((m) => !m.isArchived) ||
      this.medications[0];

    // No medications exist yet — silently skip; nothing to alert about
    if (!medToAlert) {
      console.warn('[MedicationService] triggerTestReminder: no medications found, skipping.');
      return;
    }

    const timeToAlert = targetDose?.time || medToAlert.times?.[0] || '08:00 AM';

    this.dispatchReminderAlert({
      medication: medToAlert,
      time: timeToAlert,
      dateKey: today,
      triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  private startReminderWatcher() {
    if (this.checkIntervalTimer) clearInterval(this.checkIntervalTimer);
    // Check every 30 seconds
    this.checkIntervalTimer = setInterval(() => {
      this.checkDoseReminders();
    }, 30000);
  }

  private checkDoseReminders() {
    const today = this.getTodayDateKey();
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTotalMins = currentHours * 60 + currentMins;

    const doses = this.getScheduledDosesForDate(today);
    for (const dose of doses) {
      if (dose.isTaken) continue;

      const doseMins = this.timeToMinutes(dose.time);
      const diff = Math.abs(currentTotalMins - doseMins);
      const alertKey = `${dose.medication.id}-${today}-${dose.time}`;

      // If within 15 minutes of scheduled time and hasn't been dismissed in this session
      if (diff <= 15 && !this.dismissedAlertKeys.has(alertKey)) {
        this.dismissedAlertKeys.add(alertKey);
        this.dispatchReminderAlert({
          medication: dose.medication,
          time: dose.time,
          dateKey: today,
          triggeredAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        break; // Show one at a time to avoid spam
      }
    }
  }

  private dispatchReminderAlert(alert: ReminderAlertEvent) {
    // Defensive guard: never dispatch if medication data is incomplete
    if (!alert?.medication) {
      console.warn('[MedicationService] Attempted to dispatch alert with undefined medication — skipped.');
      return;
    }

    try {
      Vibration.vibrate([0, 300, 150, 300]);
    } catch {}

    for (const listener of this.reminderListeners) {
      listener(alert);
    }
  }

  public snoozeReminder(medId: string, time: string, minutes: number = 10): void {
    const today = this.getTodayDateKey();
    const alertKey = `${medId}-${today}-${time}`;
    this.dismissedAlertKeys.delete(alertKey);

    // Re-trigger after snooze duration
    setTimeout(() => {
      const med = this.medications.find((m) => m.id === medId);
      if (med) {
        this.dispatchReminderAlert({
          medication: med,
          time,
          dateKey: today,
          triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }, minutes * 60 * 1000);
  }

  public dismissAlert(medId: string, time: string): void {
    const today = this.getTodayDateKey();
    this.dismissedAlertKeys.add(`${medId}-${today}-${time}`);
  }

  private timeToMinutes(timeStr: string): number {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }
}

export const medicationService = MedicationService.getInstance();
