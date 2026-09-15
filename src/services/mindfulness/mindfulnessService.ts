// Mindfulness & Breathing Persistence Service
// Manages completed sessions, real streak calculations, ambient sound preferences, and daily stats
// 100% real persistent storage via expo-secure-store — ZERO dummy/seed data

import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, SOUNDSCAPES } from '../../constants';
import { getTodayDateKey, formatDateKey } from '../../utils';

import {
  MindfulSessionLog,
  MindfulnessWeeklyStats,
  SoundscapeItem,
} from '../../types';

export {
  MindfulSessionLog,
  MindfulnessWeeklyStats,
  SoundscapeItem,
  SOUNDSCAPES,
};

type MindfulnessListener = (stats: MindfulnessWeeklyStats) => void;

class MindfulnessService {
  private static instance: MindfulnessService;
  private logsCache: MindfulSessionLog[] = [];
  private isLoaded = false;
  private listeners: MindfulnessListener[] = [];

  public static getInstance(): MindfulnessService {
    if (!MindfulnessService.instance) {
      MindfulnessService.instance = new MindfulnessService();
    }
    return MindfulnessService.instance;
  }

  constructor() {
    // Zero dummy data — start empty and load from SecureStore
    this.logsCache = [];
  }

  public subscribe(listener: MindfulnessListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const stats = this.getWeeklyStats();
    for (const l of this.listeners) {
      try {
        l(stats);
      } catch {}
    }
  }

  public async loadLogs(): Promise<MindfulSessionLog[]> {
    if (this.isLoaded) return this.logsCache;
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEYS.MINDFULNESS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.logsCache = parsed;
        }
      }
    } catch {
      this.logsCache = [];
    }
    this.isLoaded = true;
    this.notify();
    return this.logsCache;
  }

  public getTodayKey(): string {
    return getTodayDateKey();
  }

  public async logCompletedSession(
    techniqueId: string,
    techniqueName: string,
    durationSeconds: number,
    mood?: string
  ): Promise<MindfulSessionLog> {
    const todayKey = this.getTodayKey();
    const newLog: MindfulSessionLog = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dateKey: todayKey,
      techniqueId,
      techniqueName,
      durationSeconds,
      completedAt: new Date().toISOString(),
      mood,
    };

    this.logsCache = [...this.logsCache, newLog];
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.MINDFULNESS, JSON.stringify(this.logsCache));
    } catch {}
    this.notify();
    return newLog;
  }

  public getWeeklyStats(): MindfulnessWeeklyStats {
    const completedDatesSet = new Set<string>();
    let totalSecs = 0;

    // Filter to current calendar week (Monday to Sunday)
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    for (const log of this.logsCache) {
      completedDatesSet.add(log.dateKey);

      // Only add to weekly minutes if session occurred this week
      try {
        const logDate = new Date(log.completedAt || log.dateKey);
        if (logDate >= monday) {
          totalSecs += log.durationSeconds || 0;
        }
      } catch {
        totalSecs += log.durationSeconds || 0;
      }
    }

    const completedDates = Array.from(completedDatesSet);

    if (completedDates.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        totalMinutesThisWeek: 0,
        completedDates: [],
      };
    }

    // Calculate real active streak:
    // If completed today, count backward from today.
    // If NOT completed today, check if yesterday was completed (streak still alive until today ends).
    // If neither today nor yesterday, current streak is 0.
    const todayKey = formatDateKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = formatDateKey(yesterday);

    let streak = 0;
    let startDay: Date | null = null;

    if (completedDatesSet.has(todayKey)) {
      startDay = today;
    } else if (completedDatesSet.has(yesterdayKey)) {
      startDay = yesterday;
    }

    if (startDay) {
      for (let i = 0; i < 365; i++) {
        const check = new Date(startDay);
        check.setDate(startDay.getDate() - i);
        if (completedDatesSet.has(formatDateKey(check))) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Calculate all-time best streak
    let bestStreak = streak;
    let tempStreak = 0;
    const sortedDates = Array.from(completedDatesSet).sort();
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const [y, m, d] = dStr.split('-').map(Number);
      const curr = new Date(y, m - 1, d);
      if (prevDate) {
        const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      prevDate = curr;
    }

    return {
      currentStreak: streak,
      bestStreak: Math.max(streak, bestStreak),
      totalMinutesThisWeek: Math.round(totalSecs / 60),
      completedDates,
    };
  }

  public isDateCompleted(dateKey: string): boolean {
    return this.logsCache.some((log) => log.dateKey === dateKey);
  }

  public getSessionsForDate(dateKey: string): MindfulSessionLog[] {
    return this.logsCache.filter((log) => log.dateKey === dateKey);
  }

  public async clearLogs(): Promise<void> {
    this.logsCache = [];
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.MINDFULNESS);
    } catch {}
    this.notify();
  }
}

export const mindfulnessService = MindfulnessService.getInstance();
