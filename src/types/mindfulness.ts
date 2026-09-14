// Mindfulness & Ambient Audio Types & Interfaces
// Canonical source: src/types/mindfulness.ts

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

export type SoundCategory = 'binaural' | 'solfeggio' | 'noise' | 'nature';

export interface AmbientTrack {
  id: string;
  name: string;
  category: SoundCategory;
  carrierFreq?: string;
  beatFreq?: string;
  description: string;
  benefit: string;
  requiresHeadphones?: boolean;
}

export interface BreathPhase {
  label: string;
  duration: number; // seconds
}

export interface BreathTechnique {
  id: string;
  name: string;
  tagline: string;
  phases: BreathPhase[];
  totalCycles: number;
  durationMinutes: number;
  accentColor: string;
  bgColor: string;
  outerRingColor: string;
  benefit: string;
  glowColor?: string;
  scienceNote?: string;
  recommendedFor?: string;
  iconName?: string;
  defaultSoundId?: string;
  targetBpm?: number;
}

export interface DayInfo {
  dayName: string;
  dayNum: number;
  dateKey: string;
  isToday: boolean;
  isCompleted: boolean;
}
