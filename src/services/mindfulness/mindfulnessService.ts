// Mindfulness & Breathing Persistence Service
// Manages completed sessions, real streak calculations, ambient sound preferences, and daily stats
// 100% real persistent storage via expo-secure-store — ZERO dummy/seed data

import * as SecureStore from 'expo-secure-store';

const MINDFULNESS_LOG_KEY = 'odineye_mindfulness_logs_v1';

export interface MindfulSessionLog {
  id: string;
  dateKey: string; // 'YYYY-MM-DD'
  techniqueId: string;
  techniqueName: string;
  durationSeconds: number;
  completedAt: string; // ISO string
  mood?: string;
}

export interface MindfulnessWeeklyStats {
  currentStreak: number;
  bestStreak: number;
  totalMinutesThisWeek: number;
  completedDates: string[]; // ['YYYY-MM-DD', ...]
}

export interface SoundscapeItem {
  id: string;
  label: string;
  description: string;
  category?: 'binaural' | 'solfeggio' | 'noise' | 'nature';
  benefit?: string;
  carrierFreq?: string;
  requiresHeadphones?: boolean;
}

export const SOUNDSCAPES: SoundscapeItem[] = [
  // Binaural Beats
  { id: 'gamma40', label: '40 Hz Focus Gamma', description: 'Peak cognitive focus & working memory', category: 'binaural', carrierFreq: '200 / 240 Hz', benefit: 'Sharp alertness & focus', requiresHeadphones: true },
  { id: 'alpha10', label: '10 Hz Flow Alpha', description: 'Serene bridge between calm & alertness', category: 'binaural', carrierFreq: '200 / 210 Hz', benefit: 'Creative flow & calm focus', requiresHeadphones: true },
  { id: 'theta6', label: '6 Hz Theta Sanctuary', description: 'Deep introspective meditation & intuition', category: 'binaural', carrierFreq: '150 / 156 Hz', benefit: 'Deep meditation & tension release', requiresHeadphones: true },
  { id: 'delta2', label: '2 Hz Delta Restore', description: 'Slow restorative oscillations for deep somatic peace', category: 'binaural', carrierFreq: '100 / 102 Hz', benefit: 'Restorative somatic grounding', requiresHeadphones: true },

  // Solfeggio Frequencies
  { id: 'hz432', label: '432 Hz Harmonic Peace', description: 'Schumann resonance for heart coherence & peace', category: 'solfeggio', carrierFreq: '432 Hz Pure', benefit: 'Heart coherence & grounding', requiresHeadphones: false },
  { id: 'hz528', label: '528 Hz Cellular Balance', description: 'Ancient transformation tone of inner equilibrium', category: 'solfeggio', carrierFreq: '528 Hz Pure', benefit: 'Vitality & deep restorative balance', requiresHeadphones: false },
  { id: 'hz639', label: '639 Hz Compassion Tone', description: 'Harmonizes empathy and emotional serenity', category: 'solfeggio', carrierFreq: '639 Hz Pure', benefit: 'Emotional calm & harmony', requiresHeadphones: false },

  // Colored Noise
  { id: 'brown_noise', label: 'Velvet Brown Noise', description: 'Deep low-frequency rumble like distant waterfall', category: 'noise', benefit: 'Calms racing thoughts & tinnitus', requiresHeadphones: false },
  { id: 'pink_noise', label: 'Organic Pink Noise', description: 'Balanced 1/f soothing acoustic shielding', category: 'noise', benefit: 'Alpha wave support & quiet', requiresHeadphones: false },
  { id: 'white_noise', label: 'Tranquil White Noise', description: 'Broadband sound masking for deep focus', category: 'noise', benefit: 'External sound blocking', requiresHeadphones: false },

  // Nature Soundscapes
  { id: 'waves', label: 'Ocean Waves', description: 'Slow, rhythmic tidal swell pacing breathing', category: 'nature', benefit: 'HRV pacing & tidal calm', requiresHeadphones: false },
  { id: 'breeze', label: 'Forest Breeze', description: 'Whispering pine trees in mountain wind', category: 'nature', benefit: 'Stress release & parasympathetic tone', requiresHeadphones: false },
  { id: 'rain', label: 'Gentle Rain', description: 'Soft raindrops on forest leaves', category: 'nature', benefit: 'Cool presence & tranquil thoughts', requiresHeadphones: false },
  { id: 'birds', label: 'Chirping Birds', description: 'Gentle morning dawn birdsong', category: 'nature', benefit: 'Morning alertness & presence', requiresHeadphones: false },
  { id: 'silent', label: 'Silent Clarity', description: 'Pure quiet mindfulness', category: 'nature', benefit: 'Unassisted breath awareness', requiresHeadphones: false },
];

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
      const stored = await SecureStore.getItemAsync(MINDFULNESS_LOG_KEY);
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
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
      await SecureStore.setItemAsync(MINDFULNESS_LOG_KEY, JSON.stringify(this.logsCache));
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

    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
    const todayKey = fmt(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = fmt(yesterday);

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
        if (completedDatesSet.has(fmt(check))) {
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
      await SecureStore.deleteItemAsync(MINDFULNESS_LOG_KEY);
    } catch {}
    this.notify();
  }
}

export const mindfulnessService = MindfulnessService.getInstance();
