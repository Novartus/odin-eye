// OdinEye Master AI Health Coach Service
// Bridges Live Cloud LLMs (Google Gemini, OpenAI) and On-Device Neural Engine
// Grounded in real-time Ultrahuman, Fitbit, and Hevy biometrics

import { TriPillarHealthSummary } from '../../types/health';
import { ChatMessage } from '../../types/aiCoach';
import { credentialsStorage } from '../storage/credentialsStorage';
import { localAiCoach } from './localCoachEngine';
import { androidAiCoreService } from './androidAiCoreService';

export interface AiModelStatus {
  provider: 'gemini_nano' | 'ondevice' | 'gemini' | 'openai';
  modelName: string;
  isCloudLlm: boolean;
  hasApiKey: boolean;
}

export class AiHealthService {
  private static instance: AiHealthService;

  public static getInstance(): AiHealthService {
    if (!AiHealthService.instance) {
      AiHealthService.instance = new AiHealthService();
    }
    return AiHealthService.instance;
  }

  // Format real-time biometrics into structured context for LLMs
  public formatBiometricContext(data: TriPillarHealthSummary): string {
    const { recovery, cardio, strength, readinessToLoadRatio } = data;
    const fatigued = strength.muscleStatuses
      .filter((m) => m.state === 'fatigued')
      .map((m) => `${m.displayName} (${m.recoveryPct}% recovered, ${m.recommendedHoursRemaining}h remaining)`);
    const primed = strength.muscleStatuses
      .filter((m) => m.state === 'primed')
      .map((m) => `${m.displayName} (${m.recoveryPct}%)`);

    const rawVolumeKg = strength.todayWorkout?.totalVolumeKg || strength.weeklyVolumeKg || 0;
    const volumeTons = rawVolumeKg > 0 ? (rawVolumeKg / 1000).toFixed(1) : '0.0';

    const { medicationService } = require('../medication/medicationService');
    const meds = medicationService.getMedicationsSync();
    const adherence = medicationService.getCompletionSummary();
    const todayKey = medicationService.getTodayDateKey();

    const medsListFormatted = meds.length > 0
      ? meds.map((m: any) => {
          const takenToday = m.takenDates?.[todayKey] || [];
          const status = takenToday.length >= m.times.length ? 'ALL DOSES TAKEN TODAY' : `${takenToday.length}/${m.times.length} doses taken today`;
          return `• ${m.name} ${m.dosage} (${m.form}): dose ${m.unit} | Times: [${m.times.join(', ')}] | Frequency: ${m.frequency} | Status: ${status} | Purpose: "${m.description}" | Side effects: ${m.sideEffects?.join(', ') || 'None reported'}`;
        }).join('\n')
      : 'No medications scheduled currently.';

    return `
[LIVE HARDWARE & TELEMETRY GROUNDING CONTEXT]
1. BIOLOGICAL RECOVERY & SLEEP (Ultrahuman Ring AIR):
- Recovery Score: ${recovery.recoveryScore}% (Movement: ${recovery.movementIndex}%, Sleep Index: ${recovery.sleepIndex}%)
- HRV Baseline (RMSSD): ${recovery.hrvRmssd} ms
- Resting Heart Rate: ${recovery.restingHeartRate} bpm
- Sleep Duration: ${Math.floor(recovery.sleepDurationMinutes / 60)}h ${recovery.sleepDurationMinutes % 60}m
- Sleep Stages: Deep ${recovery.deepSleepPct}%, REM ${recovery.remSleepPct}%, Light ${recovery.lightSleepPct}%, Awake ${recovery.awakePct}%
- Temperature Delta: ${recovery.skinTempDelta > 0 ? '+' : ''}${recovery.skinTempDelta}°C from baseline
- Circadian Windows: Morning Sunlight ${recovery.circadianPhase.morningSunlightWindow.start}-${recovery.circadianPhase.morningSunlightWindow.end}, Caffeine Cutoff ${recovery.circadianPhase.caffeineCutoffTime}

2. CARDIOVASCULAR STRAIN (Google Fitbit):
- Today Active Zone Minutes (AZM): ${cardio.todayActiveZoneMinutes} mins
- Cardio Calories Burned: ${cardio.cardioCaloriesBurned} kcal
- Recent Workout: ${cardio.recentWorkout ? `${cardio.recentWorkout.activityType}, ${cardio.recentWorkout.distanceKm || 0} km in ${cardio.recentWorkout.durationMinutes} mins (Avg HR: ${cardio.recentWorkout.avgBpm} bpm)` : 'None today'}
- HR Zones Today: Peak ${cardio.zoneSummary.peakMinutes}m, Cardio ${cardio.zoneSummary.cardioMinutes}m, Fat Burn ${cardio.zoneSummary.fatBurnMinutes}m

3. MUSCULOSKELETAL & RESISTANCE TRAINING (Hevy):
- Total Volume: ${volumeTons} tons (${rawVolumeKg.toLocaleString()} kg)
- Today Workout: ${strength.todayWorkout ? `${strength.todayWorkout.title} (${strength.todayWorkout.exercises.length} exercises, ${strength.todayWorkout.totalSets} sets)` : 'No workout logged yet today'}
- Fatigued Muscles (In 48-72h repair window): ${fatigued.length > 0 ? fatigued.join(', ') : 'None'}
- Primed Muscles (Ready for progressive overload): ${primed.length > 0 ? primed.join(', ') : 'All restored'}

4. ACTIVE MEDICATIONS & CLINICAL SUPPLEMENT SCHEDULE:
- Daily Adherence: ${adherence.taken}/${adherence.total} doses taken today (${adherence.percentage}% compliance)
${medsListFormatted}
- MEDICATION CONSULTATION DIRECTIVE:
You are an expert sports scientist and integrative health coach. When the user asks about their medications, supplements, timing, interactions, or training synergies:
• Reference their specific medications, dosages, and taken status directly from the data above.
• Advise on absorption optimization (e.g. taking fat-soluble compounds like Roaccutane with meals/lipids, hydration requirements, milk thistle timing with protein metabolism).
• Highlight how medications may influence muscle recovery, photosensitivity, or cardiovascular strain.
• If asked if they've taken their medicine today, verify against the logged status above.
• Offer practical lifestyle advice while reminding them to consult their prescribing physician for dosage modifications.

5. OVERALL READINESS-TO-LOAD RATIO:
- Status: ${readinessToLoadRatio.status} (${readinessToLoadRatio.readinessScore}/100) - "${readinessToLoadRatio.title}"
- Summary: ${readinessToLoadRatio.summary}
`.trim();
  }

  // Generate response by routing to chosen provider
  public async generateResponse(
    query: string,
    data: TriPillarHealthSummary,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatMessage> {
    const creds = await credentialsStorage.loadCredentials();

    // 1. Google Gemini Live Cloud Integration (If API key provided)
    if (creds.geminiApiKey && creds.geminiApiKey.trim()) {
      try {
        const geminiReply = await this.callGemini(query, data, creds.geminiApiKey.trim(), conversationHistory);
        if (geminiReply) return geminiReply;
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to on-device engine:', err);
      }
    }

    // 2. OpenAI GPT-4o Integration (If API key provided)
    if (creds.openaiApiKey && creds.openaiApiKey.trim()) {
      try {
        const openaiReply = await this.callOpenAi(query, data, creds.openaiApiKey.trim(), conversationHistory);
        if (openaiReply) return openaiReply;
      } catch (err: any) {
        console.warn('OpenAI API call failed, falling back to on-device engine:', err);
      }
    }

    // 3. Android AICore (Gemini Nano) / On-Device Physiological Synthesis Engine
    try {
      const biometricsContext = this.formatBiometricContext(data);
      return await androidAiCoreService.generateContent(query, data, biometricsContext, conversationHistory);
    } catch (err: any) {
      console.warn('Android AICore execution notice, falling back to local coach engine:', err);
      return localAiCoach.answerUserQuery(query, data, conversationHistory);
    }
  }

  // Call Google Gemini API (gemini-2.5-flash, gemini-2.0-flash, or gemini-1.5-flash)
  private async callGemini(
    query: string,
    data: TriPillarHealthSummary,
    apiKey: string,
    history: ChatMessage[]
  ): Promise<ChatMessage | null> {
    const context = this.formatBiometricContext(data);
    const systemPrompt = `You are OdinEye, an elite AI Sports Scientist, Human Performance Expert, and Clinical Health Coach embedded directly inside a cutting-edge mobile health application.
You analyze live biometrics from Ultrahuman Ring AIR (sleep/HRV/circadian), Android Health Connect / Fitbit (cardio/AZM/HR zones), Hevy (resistance tonnage/muscle clocks), and active medication schedules.
Always reference specific numbers from the user's live telemetry when answering. Be encouraging, deeply knowledgeable, scientifically grounded, empathetic, and concise.
Ground your guidance directly in the following live telemetry:
${context}`;

    const recentHistory = history.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [{ text: query }],
      },
    ];

    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Gemini model ${model} failed (${response.status}), trying next fallback...`);
          lastError = new Error(`Gemini API Error (${response.status}): ${errText}`);
          continue;
        }

        const resJson = await response.json();
        const candidateText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
          continue;
        }

        const modelLabel = model === 'gemini-2.5-flash'
          ? 'Gemini 2.5 Flash (Live)'
          : model === 'gemini-2.0-flash'
            ? 'Gemini 2.0 Flash (Live)'
            : 'Gemini 1.5 Flash (Live)';

        return {
          id: 'gemini-' + Date.now(),
          sender: 'coach',
          text: candidateText.trim(),
          timestamp: new Date().toISOString(),
          dataPointsReferenced: [
            modelLabel,
            `Ultrahuman (${data.recovery.recoveryScore}% Rec)`,
            `Fitbit (${data.cardio.todayActiveZoneMinutes} AZM)`,
            `Hevy (${((data.strength.todayWorkout?.totalVolumeKg || data.strength.weeklyVolumeKg || 0) / 1000).toFixed(1)}t)`,
          ],
        };
      } catch (e: any) {
        lastError = e;
      }
    }

    throw lastError || new Error('All Gemini model candidates failed');
  }

  // Call OpenAI API (gpt-4o-mini)
  private async callOpenAi(
    query: string,
    data: TriPillarHealthSummary,
    apiKey: string,
    history: ChatMessage[]
  ): Promise<ChatMessage | null> {
    const context = this.formatBiometricContext(data);
    const systemPrompt = `You are OdinEye, an elite AI Sports Scientist and Human Performance Coach built into an Android centralized health app.
You analyze live biometrics from Ultrahuman Ring AIR (sleep/HRV/circadian), Android Health Connect / Fitbit (cardio/AZM/HR zones), and Hevy (resistance tonnage/muscle clocks).
Always reference specific numbers from the user's live telemetry when answering. Be concise, actionable, and scientifically grounded.
Ground your guidance directly in the following live telemetry:
${context}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: query },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    const replyText = resJson?.choices?.[0]?.message?.content;

    if (!replyText) {
      throw new Error('Empty response from OpenAI');
    }

    return {
      id: 'openai-' + Date.now(),
      sender: 'coach',
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
      dataPointsReferenced: [
        'OpenAI GPT-4o-mini',
        `Ultrahuman (${data.recovery.recoveryScore}%)`,
        `Fitbit (${data.cardio.todayActiveZoneMinutes} AZM)`,
      ],
    };
  }

  // Test Gemini API key validity across model candidate tiers
  public async testGeminiConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Please enter a Gemini API Key' };
    }
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = '';

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with "Ready" in one word.' }] }],
          }),
        });

        if (response.ok) {
          const title = model === 'gemini-2.5-flash'
            ? 'Google Gemini 2.5 Flash'
            : model === 'gemini-2.0-flash'
              ? 'Google Gemini 2.0 Flash'
              : 'Google Gemini 1.5 Flash';
          return { success: true, message: `${title} Connected ✓` };
        } else {
          const errJson = await response.json().catch(() => ({}));
          lastError = errJson?.error?.message || `API returned status ${response.status}`;
        }
      } catch (err: any) {
        lastError = err?.message || 'Connection failed';
      }
    }

    return { success: false, message: lastError || 'Connection failed' };
  }

  // Test OpenAI API key validity
  public async testOpenAiConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Please enter an OpenAI API Key' };
    }
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
      });

      if (!response.ok) {
        return { success: false, message: `OpenAI returned status ${response.status}` };
      }

      return { success: true, message: 'OpenAI GPT Connected ✓' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Connection failed' };
    }
  }
}

export const aiHealthService = AiHealthService.getInstance();
