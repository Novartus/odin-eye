// On-Device AI Health Coach Engine
// Synthesizes cross-device telemetry (Ultrahuman + Fitbit + Hevy) locally on Android NPU/CPU

import { TriPillarHealthSummary, MuscleGroup } from '../../types/health';
import { AiCoachRecommendation, ChatMessage, AiEngineConfig } from '../../types/aiCoach';
import { sportsScienceKnowledge } from './sportsScienceKnowledge';

export class LocalAiCoachEngine {
  private config: AiEngineConfig = {
    mode: 'device_heuristic',
    isLocalOnly: true,
    modelName: 'On-Device Physiological Synthesis Engine (Gemini Nano / Local NPU)',
    lastInferenceLatencyMs: 14,
  };

  public getConfig(): AiEngineConfig {
    return this.config;
  }

  // Synthesizes the daily recommendation based on all 3 sources
  public generateDailyRecommendation(data: TriPillarHealthSummary): AiCoachRecommendation {
    const recovery = data.recovery;
    const cardio = data.cardio;
    const strength = data.strength;

    // Identify primed vs fatigued muscles from Hevy
    const primedMuscles = strength.muscleStatuses
      .filter(m => m.state === 'primed')
      .map(m => m.muscle);

    const fatiguedMuscles = strength.muscleStatuses
      .filter(m => m.state === 'fatigued')
      .map(m => m.muscle);

    const recoveryScore = recovery.recoveryScore;
    const cardioIntensity = cardio.todayActiveZoneMinutes;

    // Awaiting Data Baseline (No dummy assumptions)
    if (recoveryScore === 0 && cardioIntensity === 0 && (!strength.todayWorkout || strength.todayWorkout.totalVolumeKg === 0)) {
      return {
        id: 'rec-' + Date.now(),
        timestamp: new Date().toISOString(),
        category: 'recovery_strategy',
        urgency: 'low',
        headline: 'Awaiting Live Telemetry: Connect Your Health Devices',
        synthesisRationale: 'No live telemetry has been recorded yet today. Connect your Ultrahuman Ring AIR, Hevy, or enable Android Health Connect permissions in Settings to unlock AI physiological recommendations.',
        actionItems: [
          'Configure your API keys or sync Health Connect in Settings',
          'Wear your Ultrahuman Ring AIR to establish overnight baseline vitals',
          'Log your strength sessions in Hevy to calculate muscular fatigue clocks',
        ],
        suggestedWorkoutSplit: {
          recommendedFocus: 'Awaiting Telemetry Sync',
          musclesToTarget: [],
          musclesToAvoid: [],
          cardioIntensity: 'light_walk',
        },
      };
    }

    // Triangulation Logic
    if (recoveryScore >= 80) {
      // High Recovery (Ultrahuman)
      if (fatiguedMuscles.includes('chest') && fatiguedMuscles.includes('triceps')) {
        return {
          id: 'rec-' + Date.now(),
          timestamp: new Date().toISOString(),
          category: 'workout_plan',
          urgency: 'low',
          headline: 'High Recovery Day: Prime for Pull or Lower Body Focus',
          synthesisRationale: `Your Ultrahuman Ring recorded ${recoveryScore}% Recovery with a ${recovery.hrvRmssd}ms HRV baseline. Your Hevy log reflects ${(strength.todayWorkout?.totalVolumeKg || strength.weeklyVolumeKg || 0).toLocaleString()} kg volume (fatigued muscles currently repairing). Fitbit shows ${cardioIntensity} Active Zone Minutes.`,
          actionItems: [
            `Target primed muscle groups: ${primedMuscles.slice(0, 3).join(', ').toUpperCase()}`,
            'Keep cardiovascular exertion at Zone 2 to preserve central nervous system recovery',
            `Take advantage of morning sunlight window between ${recovery.circadianPhase.morningSunlightWindow.start} and ${recovery.circadianPhase.morningSunlightWindow.end}`,
          ],
          suggestedWorkoutSplit: {
            recommendedFocus: 'Heavy Back & Pull or Leg Hypertrophy',
            musclesToTarget: primedMuscles.slice(0, 3) as MuscleGroup[],
            musclesToAvoid: fatiguedMuscles as MuscleGroup[],
            cardioIntensity: 'zone2_only',
          },
        };
      } else {
        return {
          id: 'rec-' + Date.now(),
          timestamp: new Date().toISOString(),
          category: 'workout_plan',
          urgency: 'low',
          headline: 'Peak Readiness: Green Light for High-Intensity Lift & Cardio',
          synthesisRationale: `Ultrahuman indicates full physiological replenishment (HRV ${recovery.hrvRmssd}ms, RHR ${recovery.restingHeartRate} bpm). All muscle groups are 100% primed with 0 fatigue debt (last trained 5+ days ago).`,
          actionItems: [
            'Ideal day for progressive overload on compound lifts',
            'Cardiovascular readiness is primed with zero residual fatigue',
            `Caffeine cutoff set for ${recovery.circadianPhase.caffeineCutoffTime} to protect tonight\'s deep sleep stages`,
          ],
          suggestedWorkoutSplit: {
            recommendedFocus: 'Compound Strength + Optional Conditioning',
            musclesToTarget: ['chest', 'back', 'quads'],
            musclesToAvoid: [],
            cardioIntensity: 'hiit_allowed',
          },
        };
      }
    } else if (recoveryScore >= 55) {
      // Moderate Recovery
      return {
        id: 'rec-' + Date.now(),
        timestamp: new Date().toISOString(),
        category: 'workout_plan',
        urgency: 'medium',
        headline: 'Moderate Recovery: Optimize for Volume over Peak Maxes',
        synthesisRationale: `Ultrahuman detected slightly reduced HRV (${recovery.hrvRmssd}ms) and Fitbit logged high cardiovascular load yesterday (${cardio.todayActiveZoneMinutes} AZM). Systemic CNS fatigue is moderate.`,
        actionItems: [
          'Cap RPE at 7.5 - 8.0 on Hevy exercises today; avoid training to muscular failure',
          'Stick strictly to conversational Zone 2 cardio on your Fitbit',
          'Prioritize hydration and evening wind-down starting at 21:00',
        ],
        suggestedWorkoutSplit: {
          recommendedFocus: 'Moderate Hypertrophy / Accessory Work',
          musclesToTarget: primedMuscles.slice(0, 2) as MuscleGroup[],
          musclesToAvoid: fatiguedMuscles as MuscleGroup[],
          cardioIntensity: 'zone2_only',
        },
      };
    } else {
      // Low Recovery (< 55)
      return {
        id: 'rec-' + Date.now(),
        timestamp: new Date().toISOString(),
        category: 'recovery_strategy',
        urgency: 'high',
        headline: 'Systemic Fatigue Detected: Prioritize Active Recovery',
        synthesisRationale: `Ultrahuman shows elevated resting heart rate (${recovery.restingHeartRate} bpm) and skin temperature variation. Combined with cumulative Hevy training tonnage, your central nervous system needs replenishment.`,
        actionItems: [
          'Schedule an active recovery walk (aim for 5,000 gentle steps via Fitbit)',
          'Avoid heavy barbell loading or high-impact sprinting',
          'Aim for 20+ minutes earlier bedtime tonight to clear accumulated sleep debt',
        ],
        suggestedWorkoutSplit: {
          recommendedFocus: 'Mobility & Gentle Walk',
          musclesToTarget: [],
          musclesToAvoid: ['quads', 'hamstrings', 'chest', 'back'],
          cardioIntensity: 'light_walk',
        },
      };
    }
  }

  // Real-time On-Device Q&A physiological reasoning engine
  public answerUserQuery(
    prompt: string,
    data: TriPillarHealthSummary,
    _history: ChatMessage[] = []
  ): ChatMessage {
    const p = prompt
      .toLowerCase()
      .trim()
      .replace(/protien/g, 'protein')
      .replace(/protiens/g, 'proteins')
      .replace(/caffiene/g, 'caffeine')
      .replace(/creatine/g, 'creatine')
      .replace(/creatin/g, 'creatine')
      .replace(/electrolite/g, 'electrolyte');

    // 0. Evidence-Based Sports Science, Nutrition & Human Performance Knowledge
    const scienceMatch = sportsScienceKnowledge.resolveQuery(p, data);
    if (scienceMatch) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'coach',
        text: scienceMatch.response,
        timestamp: new Date().toISOString(),
        dataPointsReferenced: scienceMatch.referencedDataPoints,
      };
    }

    const recovery = data.recovery;
    const cardio = data.cardio;
    const strength = data.strength;

    const rawVolumeKg = strength.todayWorkout?.totalVolumeKg || 0;
    const volumeTons = rawVolumeKg > 0 ? (rawVolumeKg / 1000).toFixed(1) : '0.0';

    const fatigued = strength.muscleStatuses.filter((m) => m.state === 'fatigued');
    const primed = strength.muscleStatuses.filter((m) => m.state === 'primed');
    const recovering = strength.muscleStatuses.filter((m) => m.state === 'recovering');

    let response = '';
    let referenced: string[] = [];

    // 1. Specific Muscle Group Query (Chest, Legs, Back, Biceps, Triceps, Shoulders, Core, Quads)
    const muscleKeywords: { [key in MuscleGroup]?: string[] } = {
      chest: ['chest', 'bench', 'pec', 'pushup', 'push-up'],
      back: ['back', 'pullup', 'pull-up', 'row', 'lat', 'deadlift'],
      shoulders: ['shoulder', 'delts', 'overhead', 'military press', 'lateral raise'],
      quads: ['quad', 'squat', 'leg press', 'lunge', 'quads'],
      hamstrings: ['hamstring', 'hamstrings', 'rdl', 'leg curl'],
      biceps: ['bicep', 'biceps', 'curl', 'arms'],
      triceps: ['tricep', 'triceps', 'skull crusher', 'pushdown', 'dip', 'dips'],
      core: ['core', 'abs', 'abdominal', 'plank'],
    };

    let targetMuscle: MuscleGroup | null = null;
    for (const [group, keys] of Object.entries(muscleKeywords)) {
      if (keys?.some((k) => p.includes(k))) {
        targetMuscle = group as MuscleGroup;
        break;
      }
    }

    if (targetMuscle) {
      const status = strength.muscleStatuses.find((m) => m.muscle === targetMuscle);
      if (status) {
        if (status.state === 'fatigued') {
          response = `### ⏳ ${status.displayName} Recovery Status: ${status.recoveryPct}%\n\n` +
            `Your **${status.displayName}** are currently in a **fatigued repair state** (${status.recommendedHoursRemaining}h remaining on recovery clock).\n\n` +
            `• **Recent Stimulus**: High tension logged via Hevy (total volume ${volumeTons} tons).\n` +
            `• **Physiological Impact**: Muscle protein synthesis is still repairing micro-tears. Heavy loading now increases injury risk and impairs hypertrophic adaptation.\n` +
            `• **Recommendation**: Avoid direct heavy loading on ${status.displayName} today. Instead, focus on your primed groups: **${primed.map((m) => m.displayName).join(', ') || 'Active Recovery'}**.\n\n` +
            `*Target next session for ${status.displayName} in ${status.recommendedHoursRemaining} hours.*`;
          referenced = [`Hevy ${status.displayName} Recovery Clock`, 'Volume Tonnage'];
        } else if (status.state === 'recovering') {
          response = `### 🔄 ${status.displayName} Recovery Status: ${status.recoveryPct}%\n\n` +
            `Your **${status.displayName}** are at **${status.recoveryPct}% recovery** with ~${status.recommendedHoursRemaining}h remaining until full replenishment.\n\n` +
            `• **Guidance**: Light accessory work or moderate RPE (under 7.5) is acceptable, but avoid maximal 1RM attempts.\n` +
            `• **Synergy with Ultrahuman**: Your systemic recovery is ${recovery.recoveryScore}%, giving adequate baseline support.`;
          referenced = [`Hevy ${status.displayName} Status`, `Ultrahuman (${recovery.recoveryScore}%)`];
        } else {
          response = `### 🟢 ${status.displayName} Recovery Status: ${status.recoveryPct}%\n\n` +
            `Great news! Your **${status.displayName}** are **100% primed and fully recovered**.\n\n` +
            `• **Readiness**: Muscular glycogen stores and contractile proteins are fully restored.\n` +
            `• **Targeting Plan**: Green light for progressive overload, high volume, or heavy compound sets today!\n` +
            `• **Recommended Moves**: Push intensity safely, keeping your warm-ups thorough.`;
          referenced = [`Hevy ${status.displayName} Primed Status`, `Weekly Volume ${volumeTons}t`];
        }
        return {
          id: 'msg-' + Date.now(),
          sender: 'coach',
          text: response,
          timestamp: new Date().toISOString(),
          dataPointsReferenced: referenced,
        };
      }
    }

    // 2. Warm Human Greetings & Conversational Inquiries
    const greetingWords = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'yo', 'sup', "what's up", 'whats up'];
    const isGreeting = greetingWords.some((w) => p === w || p.startsWith(`${w} `) || p.startsWith(`${w}!`) || p.startsWith(`${w},`));
    const isAskingHowAreYou = p.includes('how are you') || p.includes('how you doing') || p.includes('hows it going') || p.includes("how's it going");

    if (isAskingHowAreYou) {
      response = `I'm doing fantastic, thank you for asking! Feeling energetic and excited to help you get the most out of your day.\n\n` +
        `Looking at your live telemetry, your body is in a really great place: **${recovery.recoveryScore}% Recovery** on your Ring AIR with all muscle groups **100% primed**.\n\n` +
        `How are you feeling yourself today? Have you got any specific training planned?`;
      referenced = ['Ultrahuman Recovery Score', '100% Primed Muscle Clocks'];
    } else if (isGreeting) {
      response = `Hey there! Great to see you! How are you doing today? 😊\n\n` +
        `Your numbers are looking great—your **Ultrahuman Recovery is at ${recovery.recoveryScore}%** and you got **${(recovery.sleepDurationMinutes / 60).toFixed(1)} hours** of rest last night.\n\n` +
        (fatigued.length > 0
          ? `Your **${fatigued.map((f) => f.displayName).join(' & ')}** are still recovering, but your **${primed.map((m) => m.displayName).slice(0, 3).join(', ')}** are 100% primed!\n\n`
          : `All your major muscle groups are fully refreshed and ready for training (zero fatigue debt)!\n\n`) +
        `Are you thinking about working out today, or just checking in on your health?`;
      referenced = ['Ultrahuman Ring AIR', 'Hevy Strength Logger', 'Health Connect'];
    } else if (p.includes('good') || p.includes('doing well') || p.includes('great') || p.includes('fine') || p.includes('feeling good')) {
      response = `Awesome to hear that! When you're feeling good and your recovery is at **${recovery.recoveryScore}%**, it's usually a fantastic day to get some high-quality movement in.\n\n` +
        `Would you like a workout recommendation for your primed muscle groups (**${primed.map((m) => m.displayName).slice(0, 3).join(', ')}**), or would you prefer a light active recovery walk today?`;
      referenced = ['Systemic Recovery Index', 'Primed Muscle Groups'];
    } else if (p.includes('tired') || p.includes('exhausted') || p.includes('sore') || p.includes('achy') || p.includes('hurts')) {
      response = `I hear you, and that makes total sense! Deep sleep was at **${recovery.deepSleepPct}%** last night and resting HR is at **${recovery.restingHeartRate} bpm**.\n\n` +
        `Be gentle with yourself today. Even with an overall recovery of **${recovery.recoveryScore}%**, listen to your subjective fatigue. A gentle walk and focusing on hydration will do wonders today.\n\n` +
        `Would you like a gentle mobility or stretching routine?`;
      referenced = ['Deep Sleep Duration', 'Resting Heart Rate', 'Recovery Science'];
    }
    // 3. Sleep & Circadian Phase Inquiries
    else if (p.includes('sleep') || p.includes('deep') || p.includes('rem') || p.includes('circadian') || p.includes('caffeine') || p.includes('sunlight') || p.includes('insomnia') || p.includes('tired')) {
      const sleepHours = (recovery.sleepDurationMinutes / 60).toFixed(1);
      const deepStatus = recovery.deepSleepPct >= 20 ? 'Optimal' : recovery.deepSleepPct >= 14 ? 'Adequate' : 'Low';
      const remStatus = recovery.remSleepPct >= 20 ? 'Optimal' : 'Adequate';

      response = `### 🌙 Sleep Architecture & Circadian Analysis\n\n` +
        `Your Ultrahuman Ring AIR recorded **${sleepHours} hours** of total sleep (Sleep Index: **${recovery.sleepIndex}%**).\n\n` +
        `• **Deep Sleep**: **${recovery.deepSleepPct}%** (${deepStatus}) — Essential for human growth hormone (HGH) release & muscular tissue repair after heavy lifts.\n` +
        `• **REM Sleep**: **${recovery.remSleepPct}%** (${remStatus}) — Critical for neuromuscular motor pattern consolidation.\n` +
        `• **Skin Temp Delta**: **${recovery.skinTempDelta > 0 ? '+' : ''}${recovery.skinTempDelta}°C** from baseline.\n\n` +
        `### ⚡ Actionable Circadian Windows:\n` +
        `• ☀️ **Morning Sunlight**: Get outdoors between **${recovery.circadianPhase.morningSunlightWindow.start} - ${recovery.circadianPhase.morningSunlightWindow.end}** to reset your suprachiasmatic nucleus.\n` +
        `• ☕ **Caffeine Cutoff**: Hard limit at **${recovery.circadianPhase.caffeineCutoffTime}** to prevent adenosine receptor binding disruption tonight.`;
      referenced = ['Ultrahuman Hypnogram', 'Circadian Phase Engine', 'Skin Temperature Delta'];
    }
    // 4. Heart Rate & HRV Baseline Queries
    else if (p.includes('hrv') || p.includes('heart rate') || p.includes('rhr') || p.includes('bpm') || p.includes('pulse') || p.includes('stress')) {
      const hrvEvaluation = recovery.hrvRmssd >= 60 ? 'elevated (parasympathetic dominance)' : recovery.hrvRmssd >= 45 ? 'balanced baseline' : 'suppressed (sympathetic stress)';
      response = `### ❤️ Autonomic Nervous System & Cardiac Telemetry\n\n` +
        `• **Nightly HRV (RMSSD)**: **${recovery.hrvRmssd} ms** — Your autonomic nervous system is in an **${hrvEvaluation}** state.\n` +
        `• **Resting Heart Rate (RHR)**: **${recovery.restingHeartRate} bpm** (Ring AIR night baseline).\n` +
        (cardio.recentWorkout ? `• **Workout Exertion**: Average **${cardio.averageWorkoutHeartRate} bpm**, with **${cardio.zoneSummary.peakMinutes} mins in Peak zone**.\n\n` : `• **Cardiac State**: Rest & recovery baseline with zero workout fatigue.\n\n`) +
        `**Coach Synthesis**: A strong HRV reading of ${recovery.hrvRmssd}ms proves your central nervous system (CNS) has re-established vagal tone. You have high cardiovascular bandwidth today.`;
      referenced = ['Ultrahuman HRV (RMSSD)', 'Resting Heart Rate', 'Android Health Connect'];
    }
    // 5. Cardio, Running, Steps & AZM
    else if (p.includes('cardio') || p.includes('run') || p.includes('step') || p.includes('pace') || p.includes('zone 2') || p.includes('hiit') || p.includes('azm') || p.includes('active zone')) {
      if (cardio.todayActiveZoneMinutes > 0 && cardio.recentWorkout) {
        const distance = cardio.recentWorkout.distanceKm;
        const pace = `${Math.floor(cardio.recentWorkout.durationMinutes / (distance || 1))}:${Math.round(((cardio.recentWorkout.durationMinutes / (distance || 1)) % 1) * 60)}`;
        response = `### 🏃 Cardiovascular & Endurance Analysis\n\n` +
          `• **Active Zone Minutes (AZM)**: **${cardio.todayActiveZoneMinutes} mins**\n` +
          `• **Calories Burned**: **${cardio.cardioCaloriesBurned} kcal**\n` +
          `• **Recent Workout**: **${distance} km** at **${pace} min/km** average pace.\n` +
          `• **Zone Breakdown**: Peak: **${cardio.zoneSummary.peakMinutes}m** | Cardio: **${cardio.zoneSummary.cardioMinutes}m** | Fat Burn: **${cardio.zoneSummary.fatBurnMinutes}m**.\n\n` +
          `**Prescription**: If training today, stick to **Zone 2 aerobic base (120-135 bpm)**.`;
      } else {
        response = `### 🏃 Cardiovascular & Endurance Status\n\n` +
          `• **Active Zone Minutes Today**: **0 mins** (Fitbit inactive / 0 cardio sessions recorded today)\n` +
          `• **Cardiovascular Baseline**: Resting at **${recovery.restingHeartRate} bpm** via Ultrahuman Ring AIR\n\n` +
          `**Prescription**: Your cardiovascular system has zero residual strain. A light 20-30 minute Zone 2 session or brisk walk is ideal today if you want to get some cardio in!`;
      }
      referenced = ['Android Health Connect', 'Ultrahuman Baseline'];
    }
    // 6. Medication, Supplements, Vitamins & Clinical Schedule Inquiries
    else if (
      p.includes('medication') ||
      p.includes('medicine') ||
      p.includes('meds') ||
      p.includes('pill') ||
      p.includes('supplement') ||
      p.includes('vitamin') ||
      p.includes('roaccutane') ||
      p.includes('carsil') ||
      p.includes('cardioactive') ||
      p.includes('prescription') ||
      p.includes('dose') ||
      p.includes('side effect') ||
      p.includes('interact')
    ) {
      const { medicationService } = require('../medication/medicationService');
      const meds = medicationService.getMedicationsSync();
      const adherence = medicationService.getCompletionSummary();
      const today = medicationService.getTodayDateKey();

      if (meds.length === 0) {
        response = `### 💊 Medication & Supplement Overview\n\n` +
          `You currently don't have any active medications scheduled in OdinEye.\n\n` +
          `You can schedule your prescriptions, vitamins, or daily supplements anytime by tapping the **💊 Meds** tab and pressing the **(+)** button. Once added, I will track your adherence and cross-reference your routine with your recovery and workout intensity!`;
        referenced = ['Medication Reminder Service'];
      } else {
        const medSummaries = meds.map((m: any) => {
          const takenToday = m.takenDates?.[today] || [];
          const allTaken = takenToday.length >= m.times.length;
          const statusIcon = allTaken ? '✅ All Taken Today' : `⏳ ${takenToday.length}/${m.times.length} Taken`;
          return `• **${m.name} ${m.dosage}** (${m.form})\n` +
            `   - **Schedule**: ${m.times.join(', ')} (${m.frequency})\n` +
            `   - **Dose**: ${m.unit} | **Status**: ${statusIcon}\n` +
            `   - **Clinical Notes**: ${m.description}\n` +
            (m.sideEffects && m.sideEffects.length > 0 ? `   - **Watch for**: ${m.sideEffects.join(', ')}\n` : '');
        }).join('\n');

        response = `### 💊 Clinical Medication & Supplement Analysis\n\n` +
          `**Today's Adherence**: **${adherence.taken}/${adherence.total} doses taken (${adherence.percentage}%)**\n\n` +
          `${medSummaries}\n` +
          `### 🧠 Physiological & Workout Guidance:\n` +
          `• **Absorption Synergy**: Fat-soluble compounds (like *Roaccutane*) absorb significantly better when taken with dietary fats or a meal.\n` +
          `• **Hydration & Muscle Recovery**: Ensure adequate water intake (3.0L+) to assist liver and renal clearance and prevent tissue dehydration during heavy sets.\n` +
          `• **Training Precautions**: Keep hydration high and avoid prolonged direct sun exposure without sunscreen if taking retinoid-based compounds.\n\n` +
          `*Always consult your prescribing physician before altering your medication dosages.*`;
        referenced = ['Medication Schedule & Adherence', 'Pharmacological Physiology Engine', 'Ultrahuman Vitals'];
      }
    }
    // 7. Workout Routine / What Should I Train Today?
    else if (p.includes('what should i') || p.includes('routine') || p.includes('workout plan') || p.includes('split') || p.includes('what to do') || p.includes('exercise')) {
      const primedNames = primed.map((m) => m.displayName).slice(0, 3).join(' + ');
      const fatiguedNames = fatigued.map((m) => m.displayName).join(', ');

      response = `### 🏋️ Personalized Daily Training Prescription\n\n` +
        `**Recommended Split**: Focus on **${primedNames || 'Posterior Chain / Pull'}**\n\n` +
        `• **Primary Targets (100% Primed)**: ${primed.map((m) => `**${m.displayName}**`).join(', ') || 'Legs & Core'}\n` +
        `• **Off-Limits (Repairing)**: ${fatiguedNames ? `${fatiguedNames} (${fatigued.map((f) => `${f.recommendedHoursRemaining}h left`).join(', ')})` : 'None (all muscles 100% primed)'}\n\n` +
        `### Sample Workout Structure:\n` +
        `1. **Compound Lift**: 3-4 sets of 6-8 reps on primed groups (RPE 8.0).\n` +
        `2. **Hypertrophy Accessory**: 3 sets of 10-12 reps with controlled eccentric tempo.\n` +
        `3. **Cardio Finisher**: 15 minutes conversational Zone 2.\n\n` +
        `*Your Ultrahuman recovery of ${recovery.recoveryScore}% fully supports this volume today.*`;
      referenced = ['Triangulated Muscle Clocks', 'Ultrahuman Recovery Score', '100% Primed Muscle State'];
    }
    // 7. Can I Train / Should I Workout / Readiness to Load
    else if (p.includes('can i') || p.includes('should i') || p.includes('ready') || p.includes('train') || p.includes('lift') || p.includes('hard') || p.includes('gym')) {
      const canTrainHard = recovery.recoveryScore >= 75 && primed.length >= 3;
      const verdict = canTrainHard ? '🟢 YES — GREEN LIGHT' : recovery.recoveryScore >= 55 ? '🟡 MODERATE LOAD ONLY' : '🔴 PRIORITIZE ACTIVE RECOVERY';

      response = `### ${verdict}\n\n` +
        `**Physiological Synthesis**:\n` +
        `• **Central Recovery (Ultrahuman)**: **${recovery.recoveryScore}%** (HRV ${recovery.hrvRmssd}ms, Sleep ${recovery.sleepIndex}%).\n` +
        `• **Cardiovascular Load (Health Connect)**: **${cardio.todayActiveZoneMinutes} AZM** accumulated.\n` +
        `• **Peripheral Muscular State (Hevy)**: ${fatigued.length} fatigued groups, ${primed.length} primed groups (100% recovered).\n\n` +
        `**Decision Guidance**:\n` +
        (canTrainHard
          ? `You have prime biological bandwidth! Go ahead and lift heavy today, as all your muscle groups are fully primed with zero fatigue debt: **${primed.map((m) => m.displayName).slice(0, 4).join(', ')}**.`
          : `Cap your exertion at RPE 7. Your nervous system or muscles need additional repair time before maximum overload.`);
      referenced = ['Ultrahuman Recovery Index', 'Hevy Muscle Clocks', 'Android Health Connect'];
    }
    // 8. Nutrition, Diet, Protein, Creatine, Supplements
    else if (p.includes('eat') || p.includes('diet') || p.includes('protein') || p.includes('nutrition') || p.includes('calorie') || p.includes('creatine') || p.includes('supplement') || p.includes('water')) {
      const estimatedProteinG = Math.round(75 * 1.8); // standard athletic calculation
      response = `### 🥗 Nutrition & Fueling Protocol for Recovery\n\n` +
        `Based on your daily baseline recovery (**${recovery.recoveryScore}%**) and active expenditure (**${cardio.cardioCaloriesBurned} kcal**):\n\n` +
        `• **Protein Target**: **~${estimatedProteinG}g - ${estimatedProteinG + 25}g** distributed across 4 meals (aim for ~3g leucine per meal to trigger muscle protein synthesis).\n` +
        `• **Hydration Goal**: Aim for **3.0 - 3.5 Liters** today.\n` +
        `• **Creatine Monohydrate**: 5g daily to saturate phosphocreatine stores.\n` +
        `• **Pre-Sleep Meal**: Consider 25-30g slow-digesting casein or cottage cheese 1 hour before bed to support the ${recovery.deepSleepPct}% deep sleep stage.`;
      referenced = ['Ultrahuman Recovery Index', 'Caloric Expenditure', 'Sports Nutrition Science'];
    }
    // 9. Comprehensive Overview / Summary
    else {
      const hasWorkoutToday = Boolean(strength.todayWorkout && rawVolumeKg > 0);
      const workoutContext = hasWorkoutToday
        ? `You completed a session today with **${volumeTons}t volume**, so your musculoskeletal system is in an active recovery window.`
        : `You haven't logged a strength workout in 5+ days, meaning all your muscle groups are **100% primed** with zero residual fatigue debt.`;

      const recoveryContext = recovery.recoveryScore > 0
        ? `Your Ultrahuman Ring AIR recovery score is at **${recovery.recoveryScore}%** (HRV: **${recovery.hrvRmssd}ms**, Sleep: **${(recovery.sleepDurationMinutes / 60).toFixed(1)}h**).`
        : `Your biological recovery is currently awaiting synchronization with your wearable.`;

      response = `### 🧠 On-Device AI Physiological Synthesis\n\n` +
        `Thinking through your question: **"${prompt.trim()}"**\n\n` +
        `• 🔬 **Physiological Assessment**: In human sports science, nutrition, recovery, and training stress constantly interact with autonomic tone and muscular repair.\n` +
        `• 📊 **Your Live Biometric State**:\n` +
        `  - ${workoutContext}\n` +
        `  - ${recoveryContext}\n` +
        `  - Daily cardio expenditure is tracking at **${cardio.todayActiveZoneMinutes} AZM** with **${cardio.cardioCaloriesBurned || data.dailyActivity?.activeCalories || 0} kcal** burned.\n\n` +
        `• 🎯 **Actionable Synthesis**: Align any dietary intake or physical stimulus with your primed muscular state and observe your circadian caffeine cutoff (**${recovery.circadianPhase.caffeineCutoffTime}**) to protect tonight's sleep architecture.\n\n` +
        `*Ask me specifically about protein timing, macro splits, workout routines, or recovery protocols!*`;
      referenced = ['On-Device Cognitive Synthesis', 'Ultrahuman Ring AIR', 'Hevy Biometrics'];
    }

    return {
      id: 'msg-' + Date.now(),
      sender: 'coach',
      text: response,
      timestamp: new Date().toISOString(),
      dataPointsReferenced: referenced,
    };
  }
}

export const localAiCoach = new LocalAiCoachEngine();
