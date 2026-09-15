// Sleep History & Architecture Types & Interfaces
// Canonical source: src/types/sleep.ts

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

export interface SleepDebtAnalysis {
  targetHoursPerNight: number;
  totalTargetHours: number;
  totalActualHours: number;
  sleepDebtHours: number; // positive = debt, negative = surplus
  debtStatus: 'rested' | 'mild_debt' | 'moderate_debt' | 'severe_debt' | 'surplus';
  debtStatusLabel: string;
  advice: string;
  daysRecorded: number;
  dailyAverageHours: number;
}

export interface SleepArchitectureBalance {
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  deepSleepPct: number;
  remSleepMinutes: number;
  remSleepPct: number;
  lightSleepMinutes: number;
  lightSleepPct: number;
  awakeMinutes: number;
  awakePct: number;
  deepEvaluation: 'optimal' | 'low' | 'high';
  deepEvaluationLabel: string;
  remEvaluation: 'optimal' | 'low' | 'high';
  remEvaluationLabel: string;
  lightEvaluation?: 'optimal' | 'balanced' | 'elevated';
  lightEvaluationLabel?: string;
  awakeEvaluation?: 'optimal' | 'elevated' | 'fragmented';
  awakeEvaluationLabel?: string;
  balanceRating: 'harmonious' | 'physical_bias' | 'cognitive_bias' | 'insufficient_rest';
  balanceLabel: string;
  physicalRestorationAdvice: string;
  cognitiveResilienceAdvice: string;
  sleepHeartRateAvg?: number;
  sleepHeartRateMin?: number;
  sleepHeartRateMax?: number;
  sleepHeartRateDipPct?: number;
  cardiovascularDipEvaluation?: 'optimal' | 'shallow' | 'inverted' | 'awaiting';
  cardiovascularDipLabel?: string;
  cardiovascularAdvice?: string;
}

export interface DailyStepRecord {
  date: string;
  dayLabel: string;
  steps: number;
  isToday: boolean;
}
