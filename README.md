# OdinEye — The All-Seeing Health & Fitness Hub
### Ultrahuman Ring AIR + Google Fitbit + Hevy + Device-Level AI

In Norse mythology, the Allfather Odin sacrificed an eye to the Well of Mimir in exchange for total cosmic insight and wisdom. **OdinEye** embodies that vigilance: an all-seeing central hub on Samsung Android uniting your three specialized tracking domains:

1. 💍 **Ultrahuman Ring AIR** (Passive biological recovery, sleep architecture, baseline HRV, circadian rhythm)
2. ⌚ **Google Fitbit** (Workout cardiovascular dynamics, Active Zone Minutes, high-bpm heart rate zones, active calories)
3. 🏋️‍♂️ **Hevy** (Resistance training volume load, set-by-set weight & reps, 48h-72h muscle recovery clocks)
4. 🧠 **OdinEye On-Device AI** (100% private, on-device physiological inference engine running on Samsung NPU/CPU)

---

## Architecture & Data Flow

```
                                SAMSUNG GALAXY DEVICE
               ┌───────────────────────────┼───────────────────────────┐
               ▼                           ▼                           ▼
      Ultrahuman Ring AIR            Google Fitbit                 Hevy App
    • 7h 48m Sleep (Hypnogram)    • 38 Active Zone Mins       • 8,450 kg Volume
    • 88% Recovery Score          • 495 kcal Workout Burn     • 18 Sets, 142 Reps
    • 64ms HRV, 51 RHR            • 172 Peak BPM              • Chest/Delts 48h repair
               │                           │                           │
               ▼                           ▼                           ▼
    ┌──────────────────────────────────────────────────────────────────────────┐
    │                 Android Health Connect (On-Device Local)                 │
    │   Aggregates raw records from all 3 apps without external cloud servers  │
    └──────────────────────────────────────┬───────────────────────────────────┘
                                           │
                                           ▼
    ┌──────────────────────────────────────────────────────────────────────────┐
    │                      OmniPulse React Native App                          │
    │   • Tri-Pillar Readiness Scoreboard                                      │
    │   • Muscle Group Recovery Clocks                                         │
    │   • Unified 24h Heart Rate (Sleep RHR + Workout Spike)                   │
    │   • Sleep Architecture & Circadian Daylight / Caffeine Windows           │
    └──────────────────────────────────────┬───────────────────────────────────┘
                                           │
                                           ▼
    ┌──────────────────────────────────────────────────────────────────────────┐
    │                    On-Device AI Health Coach (Local)                     │
    │   Cross-synthesizes recovery readiness + cardio strain + muscle soreness │
    │   Answers questions 100% privately offline on Samsung NPU (~14ms)        │
    └──────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Tri-Pillar Synthesis
- **Recovery Pillar (Ultrahuman)**: Deep/REM sleep %, nightly rMSSD HRV baseline, resting HR, and temperature delta.
- **Cardio Pillar (Fitbit)**: Heart rate zone breakdown (Peak, Cardio, Fat Burn), Active Zone Minutes, and cardio burn.
- **Strength Pillar (Hevy)**: Total tonnage in kg, total sets, reps, and target muscle distribution.

### 2. Muscle Recovery Clocks
- Computes physiological 48h to 72h recovery timers for every major muscle group (Chest, Back, Quads, Hamstrings, Deltoids, Arms, Core) based on Hevy workout timestamps.
- Tells you at a glance which muscle groups are **Primed**, **Recovering**, or **Fatigued**.

### 3. Unified 24-Hour Heart Rate Graph
- Combines continuous resting heart rate from Ultrahuman during the night with high-frequency exercise spikes captured by Fitbit during workouts.
- Explicit device attribution badges distinguish between the two sensors.

### 4. On-Device AI Coach
- **Zero Cloud Latency & Total Privacy**: Your biometrics never leave your Samsung phone.
- **Cross-Domain Intelligence**: Automatically detects conflicts (e.g. high recovery but fatigued chest muscles from yesterday's push workout) and prescribes the optimal session (e.g. pull or lower-body hypertrophy).
- **Interactive Local Dialogue**: Ask questions like *"Can I lift heavy today?"*, *"Should I do cardio?"*, or *"What is my caffeine cutoff?"*.

---

## Running the App

```bash
# 1. Install dependencies
npm install

# 2. Start Expo Development Server
npm start

# 3. Launch on Samsung Android Phone (Expo Go or Development Build)
npx expo run:android
```

---

## Health Connect Permissions (Android)
The app is configured in `app.json` with standard Android Health Connect permissions:
- `android.permission.health.READ_SLEEP`
- `android.permission.health.READ_HEART_RATE`
- `android.permission.health.READ_EXERCISE`
- `android.permission.health.READ_TOTAL_CALORIES_BURNED`
- `android.permission.health.READ_STEPS`
- `android.permission.health.READ_DISTANCE`
