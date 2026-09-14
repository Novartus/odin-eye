// Sports Science, Nutrition & Human Performance Knowledge Engine
// Provides authoritative on-device physiological reasoning for fitness, supplements, and recovery inquiries

import { TriPillarHealthSummary } from '../../types/health';
import { SportsScienceTopicResponse } from '../../types/aiCoach';

export { SportsScienceTopicResponse };

export class SportsScienceKnowledgeEngine {
  private static instance: SportsScienceKnowledgeEngine;

  public static getInstance(): SportsScienceKnowledgeEngine {
    if (!SportsScienceKnowledgeEngine.instance) {
      SportsScienceKnowledgeEngine.instance = new SportsScienceKnowledgeEngine();
    }
    return SportsScienceKnowledgeEngine.instance;
  }

  // Helper to normalize queries and handle common typos (e.g. "protien" -> "protein")
  private normalizeQuery(raw: string): string {
    return raw
      .toLowerCase()
      .trim()
      .replace(/protien/g, 'protein')
      .replace(/protiens/g, 'proteins')
      .replace(/caffiene/g, 'caffeine')
      .replace(/creatine/g, 'creatine')
      .replace(/creatin/g, 'creatine')
      .replace(/electrolite/g, 'electrolyte')
      .replace(/recovry/g, 'recovery')
      .replace(/recovary/g, 'recovery')
      .replace(/restistance/g, 'resistance');
  }

  // Resolve user query against dynamic evidence-based sports science and nutritional domains
  public resolveQuery(rawQuery: string, data: TriPillarHealthSummary): SportsScienceTopicResponse | null {
    const p = this.normalizeQuery(rawQuery);
    const recovery = data.recovery;
    const cardio = data.cardio;
    const strength = data.strength;

    const rawVolumeKg = strength.todayWorkout?.totalVolumeKg || 0;
    const volumeTons = rawVolumeKg > 0 ? (rawVolumeKg / 1000).toFixed(1) : '0.0';
    const hasWorkoutToday = Boolean(strength.todayWorkout && rawVolumeKg > 0);

    // 1. Protein, Amino Acids & Muscle Protein Synthesis (MPS)
    // Matches "protein", "protien", "whey", "casein", "leucine", "amino acids", "bcaa", "eaa", "protein powder", "plant protein", etc.
    if (
      p.includes('protein') ||
      p.includes('leucine') ||
      p.includes('whey') ||
      p.includes('casein') ||
      p.includes('amino acid') ||
      p.includes('amino') ||
      p.includes('bcaa') ||
      p.includes('eaa') ||
      (p.includes('macro') && p.includes('muscle'))
    ) {
      const liveWorkoutContext = hasWorkoutToday
        ? `• 🏋️ **Active Post-Workout Repair**: You completed a session today with **${volumeTons} tons** volume. Muscle Protein Synthesis (MPS) is elevated for the next **24 to 48 hours**. Consuming **30–40g of protein containing ~3g leucine** within 1–2 hours post-workout will maximally stimulate myofibrillar reconstruction in your active muscle groups.`
        : `• 🛌 **Daily Protein Baseline**: When not recovering from an immediate high-volume workout, a steady intake of **1.6–2.0 g/kg of body weight** is optimal to maintain positive nitrogen balance, support immune function, and preserve lean tissue.`;

      const sleepSynergy = recovery.sleepDurationMinutes > 0
        ? `• 🌙 **Nocturnal Synthesis (Ring AIR)**: Ingesting a slow-digesting protein (such as micellar casein, cottage cheese, or Greek yogurt) 30–60 minutes before bed provides a prolonged amino acid bloodstream release throughout your **${(recovery.sleepDurationMinutes / 60).toFixed(1)}h sleep window**, optimizing human growth hormone (HGH) action during slow-wave deep sleep (**${recovery.deepSleepPct}%**).`
        : `• 🌙 **Nocturnal Synthesis**: Consider a slow-digesting protein (like micellar casein) before sleep to maintain an anti-catabolic state overnight.`;

      return {
        matched: true,
        headline: 'Protein Science & Muscle Protein Synthesis (MPS)',
        response:
          `### 🥩 Physiological Science of Protein & Muscle Repair\n\n` +
          `Protein is the fundamental macronutrient responsible for cellular repair, enzyme production, and muscular hypertrophy. Here is how your body utilizes it at a biological level:\n\n` +
          `• 🧬 **Muscle Protein Synthesis (MPS) vs Breakdown (MPB)**: Muscle growth and maintenance occur when MPS exceeds MPB. Exercise induces mechanical damage to sarcomeres, and dietary amino acids provide the essential substrates to rebuild larger, denser contractile myofibrils.\n` +
          `• 🔑 **The Leucine Trigger (mTORC1 Cascade)**: Leucine is the rate-limiting essential branched-chain amino acid. When intracellular leucine concentrations reach **~2.7 to 3.5 grams** in a meal, it binds to Sestrin2, activating the **mTORC1 anabolic signaling pathway** to initiate protein synthesis.\n` +
          `• 🎯 **Optimal Athletic Intake**: Research consistently shows that **1.6 to 2.2 grams of protein per kilogram of body weight** (approx. 0.73–1.0 g/lb) maximizes muscle growth and repair. In a caloric deficit, increasing to **2.2–2.4 g/kg** preserves lean mass.\n` +
          `• ⏱️ **Protein Pacing & Distribution**: Spreading protein across **3 to 5 meals per day** (25–45g per meal) yields superior 24-hour fractional synthetic rates compared to consuming all protein in a single bolus.\n\n` +
          `### 📊 Grounded in Your Live Telemetry:\n` +
          `${liveWorkoutContext}\n` +
          `${sleepSynergy}\n` +
          `• 🫀 **Metabolic Demand**: Your daily active expenditure is tracking at **${cardio.cardioCaloriesBurned || data.dailyActivity?.activeCalories || 0} kcal**, meaning your energy balance is baseline-controlled.\n\n` +
          `### 🍳 High-Quality Sources:\n` +
          `• **Complete Animal Proteins**: Eggs (highest biological value), chicken breast, wild salmon, lean beef, whey protein isolate.\n` +
          `• **Complete Plant Combinations**: Soy isolate, pea + brown rice protein blends, quinoa, edamame, and lentils.\n` +
          `• 💡 **Safety**: Clinical trials demonstrate that intakes up to 2.8 g/kg produce zero adverse renal or hepatic effects in healthy individuals with adequate hydration.`,
        referencedDataPoints: [
          'Muscle Protein Synthesis Biology',
          'Leucine / mTORC1 Anabolic Signaling',
          hasWorkoutToday ? `Hevy Workout Today (${volumeTons}t)` : 'Hevy (100% Primed Muscles)',
          recovery.sleepDurationMinutes > 0 ? `Ring AIR Sleep (${(recovery.sleepDurationMinutes / 60).toFixed(1)}h)` : 'Circadian Recovery Baseline',
        ],
      };
    }

    // 2. Carbohydrates & Glycogen Synthesis
    if (
      p.includes('carb') ||
      p.includes('carbohydrate') ||
      p.includes('glycogen') ||
      p.includes('sugar') ||
      p.includes('glucose')
    ) {
      return {
        matched: true,
        headline: 'Carbohydrate Metabolism & Glycogen Storage',
        response:
          `### 🍞 Carbohydrates, Glycogen & High-Intensity Performance\n\n` +
          `Carbohydrates are your central nervous system and muscular system's primary fuel source for anaerobic and high-intensity aerobic exercise:\n\n` +
          `• 🔋 **Muscle Glycogen Storage**: The human body stores approximately **400–600g of glycogen in skeletal muscle** and **80–100g in the liver**. Fast-twitch Type II muscle fibers rely exclusively on anaerobic glycolysis for high-tension lifting in Hevy.\n` +
          `• ⚡ **Peri-Workout Timing**: Consuming complex, low-glycemic carbohydrates 2–3 hours pre-workout ensures full glycogen stores, while simple, fast-absorbing carbs post-workout trigger an insulin spike that drives amino acids and glucose into depleted myocytes.\n` +
          `• 📊 **Your Live Metabolic Demand**: With **${cardio.todayActiveZoneMinutes} Active Zone Minutes** and **${volumeTons}t volume**, your glycogen depletion today is minimal. Focus on nutrient-dense sources (oats, sweet potatoes, berries, rice) to keep your cellular energy topped off.`,
        referencedDataPoints: [
          'Glycogen Resynthesis Dynamics',
          `Cardio AZM (${cardio.todayActiveZoneMinutes}m)`,
        ],
      };
    }

    // 3. Dietary Fats, Omega-3 & Hormonal Balance
    if (
      p.includes('fat') ||
      p.includes('fats') ||
      p.includes('omega') ||
      p.includes('lipid') ||
      p.includes('testosterone') ||
      p.includes('cholesterol')
    ) {
      return {
        matched: true,
        headline: 'Dietary Fats, Steroid Hormones & Cellular Membranes',
        response:
          `### 🥑 Healthy Fats, Endocrine Health & Recovery\n\n` +
          `Dietary fats are critical regulators of your endocrine system and cellular membrane fluidity:\n\n` +
          `• 🧬 **Hormonal Precursors**: Cholesterol and saturated/monounsaturated fatty acids serve as the biological substrate for steroid hormone synthesis, including testosterone and cortisol.\n` +
          `• 🐟 **Omega-3 (EPA & DHA)**: Essential fatty acids exert potent anti-inflammatory effects by competing with arachidonic acid in the cyclooxygenase (COX) pathway, promoting joint lubrication and accelerating muscular recovery.\n` +
          `• 🎯 **Target Intake**: Aim for **20% to 30% of total daily calories** from healthy fats (extra virgin olive oil, avocados, nuts, fatty fish). Restricting fat below 15% blunts testosterone production.\n` +
          `• 💍 **HRV Connection**: Regular EPA/DHA consumption directly enhances parasympathetic vagal tone, supporting healthy heart rate variability (**${recovery.hrvRmssd}ms HRV baseline** on your Ring AIR).`,
        referencedDataPoints: [
          'Lipid Biochemistry & Steroidogenesis',
          `Ring AIR HRV (${recovery.hrvRmssd}ms)`,
        ],
      };
    }

    // 4. Coffee & Caffeine
    if (
      p.includes('coffee') ||
      p.includes('caffeine') ||
      p.includes('espresso') ||
      p.includes('pre-workout') ||
      p.includes('preworkout') ||
      (p.includes('energy') && p.includes('drink'))
    ) {
      return {
        matched: true,
        headline: 'Ergogenic Profile of Coffee & Caffeine',
        response:
          `### ☕ Evidence-Based Benefits of Coffee & Caffeine\n\n` +
          `Coffee is one of the most validated ergogenic aids in sports science:\n\n` +
          `• 🚀 **Adenosine Receptor Antagonism**: Caffeine structurally mimics adenosine and binds to A1 and A2A receptors in the brain, blocking sleep pressure, sharpening focus, and dramatically lowering your Rate of Perceived Exertion (RPE).\n` +
          `• 🏋️ **Power & Endurance Gains**: By enhancing motor unit recruitment and sarcoplasmic calcium release, caffeine increases maximal strength by **3–5%** and aerobic time-to-exhaustion by **10–15%**.\n` +
          `• 🔥 **Lipolysis & Fat Oxidation**: Stimulates epinephrine release, liberating free fatty acids into circulation to spare muscular glycogen during exercise.\n` +
          `• ⏱️ **Optimal Dosage**: **3–6 mg/kg of body weight** taken **45–60 minutes pre-workout**.\n\n` +
          `### 💍 Personalized Biometric Synergy (Ring AIR):\n` +
          `• **Circadian Caffeine Cutoff**: Strictly cutoff all caffeine by **${recovery.circadianPhase.caffeineCutoffTime}** today.\n` +
          `• **Deep Sleep Protection**: Consuming caffeine within 8 hours of bedtime suppresses slow-wave deep sleep (currently **${recovery.deepSleepPct}%**) and elevates resting pulse above your baseline (**${recovery.restingHeartRate} bpm**).`,
        referencedDataPoints: [
          'Ergogenic Sports Science',
          `Ring AIR Caffeine Cutoff (${recovery.circadianPhase.caffeineCutoffTime})`,
          `Deep Sleep Baseline (${recovery.deepSleepPct}%)`,
        ],
      };
    }

    // 5. Creatine Monohydrate & Ergogenic Supplements
    if (
      p.includes('creatine') ||
      p.includes('monohydrate') ||
      (p.includes('supplement') && (p.includes('best') || p.includes('take') || p.includes('muscle') || p.includes('recommend')))
    ) {
      return {
        matched: true,
        headline: 'Creatine Monohydrate & Phosphagen Energetics',
        response:
          `### ⚡ Creatine Monohydrate: The Gold Standard Ergogenic Aid\n\n` +
          `Creatine is the single most researched and validated supplement in sports science:\n\n` +
          `• 🔋 **Phosphocreatine (PCr) Energy Resynthesis**: High-intensity contractions deplete intramuscular ATP in 2–3 seconds. Phosphocreatine donates its phosphate group to ADP, instantly regenerating ATP for explosive reps in Hevy.\n` +
          `• 💧 **Cellular Osmolality & Hypertrophy**: Draws water into the sarcoplasm. This cell swelling triggers anabolic gene expression, upregulates protein synthesis, and stimulates satellite cell activation.\n` +
          `• 📈 **Performance Boost**: Increases 1RM strength and high-intensity power output by **5–15%**.\n` +
          `• 💊 **Dosing Protocol**: Take **5 grams daily** of Creatine Monohydrate consistently. A loading phase is unnecessary; muscle saturation is achieved in 3–4 weeks.`,
        referencedDataPoints: ['Phosphagen System Biology', 'Cell Volumization Science'],
      };
    }

    // 6. Cold Exposure & Cold Plunge
    if (
      p.includes('cold plunge') ||
      p.includes('ice bath') ||
      p.includes('cold shower') ||
      p.includes('cryotherapy')
    ) {
      return {
        matched: true,
        headline: 'Cold Exposure & Muscle Adaptation Protocols',
        response:
          `### 🧊 Cold Plunge & Cold Exposure Science\n\n` +
          `Cold water immersion (10–14°C / 50–57°F for 2–5 minutes) delivers potent acute neuroendocrine benefits:\n\n` +
          `• ❄️ **Dopamine & Norepinephrine Surge**: Triggers a **250% increase in dopamine** and **up to 500% in norepinephrine**, sustaining elevated mood and focus for hours.\n` +
          `• 🩸 **Vasoconstriction**: Constricts peripheral capillaries, flushing metabolic waste and reducing perceived soreness.\n\n` +
          `### ⚠️ Hypertrophy Timing Warning:\n` +
          `• **DO NOT Cold Plunge Within 4–6 Hours After Resistance Training**: Post-workout cold immersion blunts the mTORC1 signaling pathway, suppressing muscle protein synthesis and hypertrophic adaptation!\n` +
          `• **Best Practice**: Use cold plunge on rest days, before training for mental readiness, or after pure aerobic running sessions.`,
        referencedDataPoints: ['mTOR Pathway Dynamics', 'Neuroendocrine Cold Shock Science'],
      };
    }

    // 7. Sauna & Heat Therapy
    if (
      p.includes('sauna') ||
      p.includes('steam room') ||
      p.includes('heat shock') ||
      p.includes('infrared')
    ) {
      return {
        matched: true,
        headline: 'Sauna Hyperthermic Conditioning',
        response:
          `### 🔥 Sauna & Heat Therapy for Recovery & Longevity\n\n` +
          `Exposing the body to 80–90°C (175–195°F) for 15–25 minutes induces profound cardiovascular and cellular adaptations:\n\n` +
          `• 🧬 **Heat Shock Proteins (HSP70/90)**: Repair misfolded cellular proteins and protect against muscle catabolism.\n` +
          `• 🫀 **Plasma Volume Expansion**: Increases heart rate to 120–150 bpm, training cardiac stroke volume and vascular elasticity.\n` +
          `• 📈 **Growth Hormone Upregulation**: Multiple sauna cycles can stimulate up to a **2- to 5-fold surge in growth hormone**.\n` +
          `• 🌙 **Deep Sleep Priming**: Rapid post-sauna core body cooling accelerates transition into slow-wave deep sleep.`,
        referencedDataPoints: ['Heat Shock Protein Biology', 'Growth Hormone Upregulation'],
      };
    }

    // 8. Hydration, Water & Electrolytes
    if (
      p.includes('water') ||
      p.includes('hydration') ||
      p.includes('electrolyte') ||
      p.includes('cramp') ||
      p.includes('sodium') ||
      p.includes('potassium')
    ) {
      return {
        matched: true,
        headline: 'Hydration & Electrolyte Action Potentials',
        response:
          `### 💧 Hydration, Osmolality & Electrolyte Dynamics\n\n` +
          `Even a **2% drop in body water** degrades muscular endurance, power output, and cognitive acuity:\n\n` +
          `• ⚡ **Essential Ions**: Sodium (Na+) maintains blood plasma volume and nerve conduction; Potassium (K+) regulates intracellular fluid; Magnesium (Mg2+) enables ATP hydrolysis and prevents muscular cramping.\n` +
          `• 🥛 **Baseline Target**: Aim for **3.2 to 3.8 Liters of fluid daily**, adding 500–750 ml for each hour of vigorous training.\n` +
          `• 🧂 **Electrolyte Tip**: Add a pinch of sea salt or an unflavored electrolyte packet to morning water to support aldosterone balance.`,
        referencedDataPoints: ['Cellular Osmolality Science', 'Electrolyte Action Potentials'],
      };
    }

    // 9. Zone 2 Cardio & Aerobic Base
    if (
      p.includes('zone 2') ||
      p.includes('aerobic base') ||
      p.includes('fat burning') ||
      p.includes('mitochondria')
    ) {
      return {
        matched: true,
        headline: 'Zone 2 Training & Mitochondrial Biogenesis',
        response:
          `### 🏃 Zone 2 Aerobic Base & Mitochondrial Function\n\n` +
          `Zone 2 training (65–75% max HR, 120–135 bpm) maximizes fat oxidation and builds your cellular engine:\n\n` +
          `• 🔬 **Mitochondrial Density**: Zone 2 stimulates mitochondrial biogenesis in Type I slow-twitch fibers and dramatically increases your body's ability to clear lactic acid.\n` +
          `• 🛡️ **Zero CNS Drain**: Does not produce central nervous system fatigue, allowing you to build massive aerobic capacity without hindering Hevy strength progress.\n` +
          `• 🗣️ **The Talk Test**: You should be able to carry on a conversation in full sentences without gasping.`,
        referencedDataPoints: ['Mitochondrial Biogenesis', 'Lactate Clearance Kinetics'],
      };
    }

    // 10. VO2 Max
    if (p.includes('vo2') || p.includes('vo2max') || p.includes('vo2 max')) {
      return {
        matched: true,
        headline: 'VO2 Max Physiology & Cardiorespiratory Fitness',
        response:
          `### 🫁 VO2 Max: The Ultimate Longevity Biomarker\n\n` +
          `VO2 Max measures the maximum milliliters of oxygen your body can utilize per kilogram of body weight per minute:\n\n` +
          `• 🧬 **Longevity Impact**: Moving from low to elite VO2 max is associated with a **5x reduction in all-cause mortality**.\n` +
          `• 🚀 **The Gold Standard Protocol**: Norwegian 4x4 intervals (4 rounds of 4 minutes at 90–95% max HR, with 3 minutes active recovery) performed 1–2x per week.\n` +
          `• 📊 **Your Baseline**: Tracking in the **${cardio.cardioFitnessScore}** range via connected telemetry.`,
        referencedDataPoints: ['Cardiorespiratory Fitness Science', `Cardio Profile (${cardio.cardioFitnessScore})`],
      };
    }

    // 11. Fasting & Intermittent Fasting
    if (p.includes('fasting') || p.includes('fasted') || p.includes('autophagy')) {
      return {
        matched: true,
        headline: 'Intermittent Fasting & Cellular Autophagy',
        response:
          `### ⏳ Intermittent Fasting, Insulin Sensitivity & Autophagy\n\n` +
          `Time-restricted feeding (typically 16:8) influences multiple metabolic pathways:\n\n` +
          `• 🧹 **Cellular Autophagy**: Extended fasting downregulates mTOR and stimulates autophagy—the lysosomal breakdown and recycling of damaged cellular organelles and aggregated proteins.\n` +
          `• 📉 **Insulin Sensitivity**: Fasting keeps baseline insulin low, facilitating greater lipolysis and metabolic flexibility.\n` +
          `• 🏋️ **Training Implications**: While light Zone 2 cardio is great fasted, heavy resistance training in Hevy is best performed in a fed or recently fed state to maximize glycogen utilization and prevent unnecessary muscle protein breakdown.`,
        referencedDataPoints: ['Autophagy Pathway Dynamics', 'Metabolic Flexibility'],
      };
    }

    // 12. DOMS & Muscle Soreness
    if (p.includes('sore') || p.includes('soreness') || p.includes('doms') || p.includes('stiff') || p.includes('aching')) {
      return {
        matched: true,
        headline: 'DOMS Physiology & Sarcomere Repair',
        response:
          `### 🩹 Delayed Onset Muscle Soreness (DOMS) Management\n\n` +
          `DOMS is caused by microscopic z-line structural disruption in muscle sarcomeres, predominantly from eccentric loading:\n\n` +
          `• 🔬 **Mechanism**: Micro-damage triggers an inflammatory repair cascade, peaking 24–48 hours post-workout.\n` +
          `• 💡 **Soreness ≠ Growth**: Hypertrophy occurs reliably without soreness. Excessive DOMS impairs training frequency and progressive overload.\n` +
          `• 🛡️ **Actionable Recovery**: Low-intensity active recovery (brisk walking), gentle mobility, and hydration accelerate blood flow without causing further micro-trauma.`,
        referencedDataPoints: ['Micro-trauma Sarcomere Biology', 'Active Perfusion Recovery'],
      };
    }

    // 13. Deep Sleep & Sleep Architecture
    if (p.includes('deep sleep') || p.includes('rem sleep') || (p.includes('sleep') && (p.includes('improve') || p.includes('better')))) {
      return {
        matched: true,
        headline: 'Sleep Architecture & Deep Slow-Wave Sleep',
        response:
          `### 🌙 Sleep Architecture & Deep Sleep Optimization\n\n` +
          `Your Ultrahuman Ring AIR recorded **${Math.floor(recovery.sleepDurationMinutes / 60)}h ${recovery.sleepDurationMinutes % 60}m** of sleep (Deep: **${recovery.deepSleepPct}%**, REM: **${recovery.remSleepPct}%**):\n\n` +
          `• 🧬 **Deep Sleep (Stage N3)**: Triggers ~70% of daily Human Growth Hormone (HGH) secretion and activates the glymphatic brain-cleansing system. Target: 18–25%.\n` +
          `• ☀️ **Morning Sunlight**: Get outdoors between **${recovery.circadianPhase.morningSunlightWindow.start} - ${recovery.circadianPhase.morningSunlightWindow.end}** to set your circadian timer.\n` +
          `• ☕ **Caffeine Cutoff**: Stop caffeine by **${recovery.circadianPhase.caffeineCutoffTime}** to protect adenosine buildup.`,
        referencedDataPoints: [`Ultrahuman Sleep Index (${recovery.sleepIndex}%)`, `Deep Sleep (${recovery.deepSleepPct}%)`],
      };
    }

    return null;
  }
}

export const sportsScienceKnowledge = SportsScienceKnowledgeEngine.getInstance();
