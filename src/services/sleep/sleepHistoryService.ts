// 7-Day Rolling Sleep & Step History Service
// Persists and calculates nightly sleep records for the weekly vertical pill bar charts

import * as SecureStore from 'expo-secure-store';

import {
  DailySleepRecord,
  SleepDebtAnalysis,
  SleepArchitectureBalance,
  DailyStepRecord,
} from '../../types';

export {
  DailySleepRecord,
  SleepDebtAnalysis,
  SleepArchitectureBalance,
  DailyStepRecord,
};

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
    todayEfficiency: number = 0,
    todayDeepPct: number = 0,
    todayRemPct: number = 0
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

        const finalDeep = todayDeepPct > 0
          ? todayDeepPct
          : (this.storedSleepRecords[key]?.deepPct || 22);

        const finalRem = todayRemPct > 0
          ? todayRemPct
          : (this.storedSleepRecords[key]?.remPct || 24);

        result.push({
          date: key,
          dayLabel: dayLetter,
          fullDayLabel: dayName,
          durationMinutes: finalMinutes,
          sleepIndex: finalIndex,
          efficiencyPct: todayEfficiency > 0 ? todayEfficiency : 88,
          deepPct: finalDeep,
          remPct: finalRem,
          isToday: true,
        });

        // Automatically sync to storage if valid
        if (todayMinutes > 0) {
          this.recordDailySleep(todayMinutes, todayIndex, todayEfficiency > 0 ? todayEfficiency : 88, finalDeep, finalRem);
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

  /**
   * Calculates rolling 7-day sleep debt against optimal baseline (e.g. 8.0 hours/night).
   * Adheres strictly to Zero-Dummy data: computes against recorded days only.
   */
  public getSleepDebtAnalysis(
    targetHoursPerNight: number = 8.0,
    todayMinutes: number = 0,
    todayIndex: number = 0,
    todayEfficiency: number = 0,
    todayDeepPct: number = 0,
    todayRemPct: number = 0
  ): SleepDebtAnalysis {
    const weekly = this.getWeeklySleepHistory(todayMinutes, todayIndex, todayEfficiency, todayDeepPct, todayRemPct);
    const recordedDays = weekly.filter(d => d.durationMinutes > 0);
    const count = recordedDays.length;

    if (count === 0) {
      return {
        targetHoursPerNight,
        totalTargetHours: targetHoursPerNight,
        totalActualHours: 0,
        sleepDebtHours: 0,
        debtStatus: 'rested',
        debtStatusLabel: 'Baseline Synced',
        advice: 'Wear your ring or connect Health Connect tonight to begin tracking cumulative sleep debt.',
        daysRecorded: 0,
        dailyAverageHours: 0,
      };
    }

    const totalActualHours = Math.round(recordedDays.reduce((acc, d) => acc + (d.durationMinutes / 60), 0) * 10) / 10;
    const totalTargetHours = Math.round(count * targetHoursPerNight * 10) / 10;
    const sleepDebtHours = Math.round((totalTargetHours - totalActualHours) * 10) / 10;
    const dailyAverageHours = Math.round((totalActualHours / count) * 10) / 10;

    let debtStatus: SleepDebtAnalysis['debtStatus'] = 'rested';
    let debtStatusLabel = 'Fully Rested';
    let advice = 'Your sleep architecture is synchronized with your biological recovery baseline.';

    if (sleepDebtHours <= -0.5) {
      debtStatus = 'surplus';
      debtStatusLabel = `+${Math.abs(sleepDebtHours)}h Surplus`;
      advice = 'Sleep reserves are well-stocked. Nervous system recovery and physical readiness are primed.';
    } else if (sleepDebtHours <= 1.0) {
      debtStatus = 'rested';
      debtStatusLabel = `${sleepDebtHours > 0 ? `+${sleepDebtHours}h` : '0h'} Optimal`;
      advice = 'Minimal sleep deficit. Consistent sleep rhythms keep your circadian clock finely tuned.';
    } else if (sleepDebtHours <= 3.5) {
      debtStatus = 'mild_debt';
      debtStatusLabel = `-${sleepDebtHours}h Mild Debt`;
      advice = 'Slight deficit detected. An extra 30–45 min wind-down buffer tonight will fully restore balance.';
    } else if (sleepDebtHours <= 6.0) {
      debtStatus = 'moderate_debt';
      debtStatusLabel = `-${sleepDebtHours}h Moderate Debt`;
      advice = 'Cumulative fatigue accumulating. Prioritize an earlier bedtime (+60m) and avoid late caffeine.';
    } else {
      debtStatus = 'severe_debt';
      debtStatusLabel = `-${sleepDebtHours}h Severe Debt`;
      advice = 'High cumulative sleep debt. Extend your sleep opportunity window and utilize Zen breathing to reduce cortisol.';
    }

    return {
      targetHoursPerNight,
      totalTargetHours,
      totalActualHours,
      sleepDebtHours,
      debtStatus,
      debtStatusLabel,
      advice,
      daysRecorded: count,
      dailyAverageHours,
    };
  }

  /**
   * Computes Physical Restoration (Deep Sleep) vs. Cognitive & Emotional Resilience (REM Sleep).
   */
  public getSleepArchitectureBalance(
    totalSleepMinutes: number = 0,
    deepPct: number = 0,
    remPct: number = 0
  ): SleepArchitectureBalance {
    const safeMinutes = totalSleepMinutes > 0 ? totalSleepMinutes : 0;
    const safeDeepPct = deepPct > 0 ? deepPct : 0;
    const safeRemPct = remPct > 0 ? remPct : 0;

    const deepSleepMinutes = Math.round((safeMinutes * safeDeepPct) / 100);
    const remSleepMinutes = Math.round((safeMinutes * safeRemPct) / 100);

    const awakePct = safeMinutes > 0 ? 6 : 0;
    const awakeMinutes = Math.round((safeMinutes * awakePct) / 100);
    const lightPct = Math.max(0, 100 - (safeDeepPct + safeRemPct + awakePct));
    const lightSleepMinutes = Math.max(0, safeMinutes - deepSleepMinutes - remSleepMinutes - awakeMinutes);

    // Deep evaluation (Target: 15 - 25%)
    let deepEvaluation: SleepArchitectureBalance['deepEvaluation'] = 'optimal';
    let deepEvaluationLabel = 'Optimal (15–25%)';
    let physicalRestorationAdvice = 'Robust slow-wave delta sleep facilitates muscular repair, cellular turnover, and human growth hormone release.';

    if (safeDeepPct < 15) {
      deepEvaluation = 'low';
      deepEvaluationLabel = 'Sub-optimal (<15%)';
      physicalRestorationAdvice = 'Low slow-wave sleep. Limit alcohol and heavy meals within 3 hours of bed to enhance somatic muscle restoration.';
    } else if (safeDeepPct > 25) {
      deepEvaluation = 'high';
      deepEvaluationLabel = 'Abundant (>25%)';
      physicalRestorationAdvice = 'Slow-wave rebound active. Your body is prioritizing intensive musculoskeletal recovery and physical restitution.';
    }

    // REM evaluation (Target: 20 - 25%)
    let remEvaluation: SleepArchitectureBalance['remEvaluation'] = 'optimal';
    let remEvaluationLabel = 'Optimal (20–25%)';
    let cognitiveResilienceAdvice = 'Balanced REM sleep supports neural synaptic pruning, creative problem-solving, and emotional regulation.';

    if (safeRemPct < 20) {
      remEvaluation = 'low';
      remEvaluationLabel = 'Sub-optimal (<20%)';
      cognitiveResilienceAdvice = 'Restricted REM phase. Keep bedroom cool (18°C) and avoid late-night blue light to foster deeper dream cycles.';
    } else if (safeRemPct > 25) {
      remEvaluation = 'high';
      remEvaluationLabel = 'Abundant (>25%)';
      cognitiveResilienceAdvice = 'Extended rapid eye movement phase. Brain is actively synthesizing recent memories and emotional experiences.';
    }

    // Balance evaluation
    let balanceRating: SleepArchitectureBalance['balanceRating'] = 'harmonious';
    let balanceLabel = 'Harmonious Architecture';

    if (safeMinutes < 300 && safeMinutes > 0) {
      balanceRating = 'insufficient_rest';
      balanceLabel = 'Compressed Sleep Window';
    } else if (deepEvaluation === 'optimal' && remEvaluation === 'optimal') {
      balanceRating = 'harmonious';
      balanceLabel = 'Harmonious Architecture';
    } else if ((deepEvaluation === 'optimal' || deepEvaluation === 'high') && remEvaluation === 'low') {
      balanceRating = 'physical_bias';
      balanceLabel = 'Physical Restoration Leaning';
    } else if ((remEvaluation === 'optimal' || remEvaluation === 'high') && deepEvaluation === 'low') {
      balanceRating = 'cognitive_bias';
      balanceLabel = 'Cognitive Processing Leaning';
    } else {
      balanceRating = 'harmonious';
      balanceLabel = 'Balanced Restoration';
    }

    return {
      totalSleepMinutes: safeMinutes,
      deepSleepMinutes,
      deepSleepPct: safeDeepPct,
      remSleepMinutes,
      remSleepPct: safeRemPct,
      lightSleepMinutes,
      lightSleepPct: lightPct,
      awakeMinutes,
      awakePct,
      deepEvaluation,
      deepEvaluationLabel,
      remEvaluation,
      remEvaluationLabel,
      balanceRating,
      balanceLabel,
      physicalRestorationAdvice,
      cognitiveResilienceAdvice,
    };
  }
}

export const sleepHistoryService = SleepHistoryService.getInstance();
