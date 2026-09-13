// 7-Day Rolling Sleep & Step History Service
// Persists and calculates nightly sleep records for the weekly vertical pill bar charts

import * as SecureStore from 'expo-secure-store';

export interface DailySleepRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string; // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
  fullDayLabel: string; // 'Mon', 'Tue', etc.
  durationMinutes: number;
  sleepIndex: number; // 0-100
  efficiencyPct: number; // 0-100
  deepPct: number;
  remPct: number;
  isToday: boolean;
}

export interface DailyStepRecord {
  date: string;
  dayLabel: string;
  steps: number;
  isToday: boolean;
}

const SLEEP_HISTORY_KEY = 'odineye_sleep_history_v1';
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export class SleepHistoryService {
  private static instance: SleepHistoryService;
  private storedSleepRecords: Record<string, DailySleepRecord> = {};

  public static getInstance(): SleepHistoryService {
    if (!SleepHistoryService.instance) {
      SleepHistoryService.instance = new SleepHistoryService();
    }
    return SleepHistoryService.instance;
  }

  constructor() {
    this.loadHistory();
  }

  private async loadHistory(): Promise<void> {
    try {
      const raw = await SecureStore.getItemAsync(SLEEP_HISTORY_KEY);
      if (raw) {
        this.storedSleepRecords = JSON.parse(raw);
      }
    } catch {
      // Secure store fallback
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        SLEEP_HISTORY_KEY,
        JSON.stringify(this.storedSleepRecords)
      );
    } catch {
      // Ignore fallback
    }
  }

  private formatDateKey(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Records or updates today's sleep session
   */
  public recordDailySleep(
    durationMinutes: number,
    sleepIndex: number,
    efficiencyPct: number = 88,
    deepPct: number = 22,
    remPct: number = 24
  ): void {
    if (durationMinutes <= 0) return;
    const today = new Date();
    const key = this.formatDateKey(today);

    this.storedSleepRecords[key] = {
      date: key,
      dayLabel: DAY_LETTERS[today.getDay()],
      fullDayLabel: DAY_NAMES[today.getDay()],
      durationMinutes,
      sleepIndex,
      efficiencyPct,
      deepPct,
      remPct,
      isToday: true,
    };

    this.saveHistory();
  }

  /**
   * Generates a 7-day rolling window of sleep records ending today.
   * If historical records are stored, they are utilized.
   * If today's live telemetry is passed, today's entry reflects it.
   */
  public getWeeklySleepHistory(
    todayMinutes: number = 0,
    todayIndex: number = 0,
    todayEfficiency: number = 0
  ): DailySleepRecord[] {
    const result: DailySleepRecord[] = [];
    const now = new Date();

    // Loop 6 days ago up to today (7 days total)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = this.formatDateKey(d);
      const isToday = i === 0;

      const dayIndex = d.getDay();
      const dayLetter = DAY_LETTERS[dayIndex];
      const dayName = DAY_NAMES[dayIndex];

      if (isToday) {
        // If live telemetry is provided, use it
        const finalMinutes = todayMinutes > 0
          ? todayMinutes
          : (this.storedSleepRecords[key]?.durationMinutes || 0);

        const finalIndex = todayIndex > 0
          ? todayIndex
          : (this.storedSleepRecords[key]?.sleepIndex || 0);

        result.push({
          date: key,
          dayLabel: dayLetter,
          fullDayLabel: dayName,
          durationMinutes: finalMinutes,
          sleepIndex: finalIndex,
          efficiencyPct: todayEfficiency > 0 ? todayEfficiency : 88,
          deepPct: 22,
          remPct: 24,
          isToday: true,
        });

        // Automatically sync to storage if valid
        if (todayMinutes > 0) {
          this.recordDailySleep(todayMinutes, todayIndex, todayEfficiency);
        }
      } else {
        const stored = this.storedSleepRecords[key];
        if (stored) {
          result.push({ ...stored, isToday: false });
        } else {
          result.push({
            date: key,
            dayLabel: dayLetter,
            fullDayLabel: dayName,
            durationMinutes: 0,
            sleepIndex: 0,
            efficiencyPct: 0,
            deepPct: 0,
            remPct: 0,
            isToday: false,
          });
        }
      }
    }

    return result;
  }

  /**
   * Generates a 7-day rolling window of steps for the companion Steps card
   */
  public getWeeklyStepsHistory(todaySteps: number = 0): DailyStepRecord[] {
    const result: DailyStepRecord[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = this.formatDateKey(d);
      const isToday = i === 0;

      const dayIndex = d.getDay();
      const dayLetter = DAY_LETTERS[dayIndex];

      if (isToday) {
        result.push({
          date: key,
          dayLabel: dayLetter,
          steps: todaySteps,
          isToday: true,
        });
      } else {
        result.push({
          date: key,
          dayLabel: dayLetter,
          steps: 0,
          isToday: false,
        });
      }
    }

    return result;
  }
}

export const sleepHistoryService = SleepHistoryService.getInstance();
