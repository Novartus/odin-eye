# Features

A complete reference for every feature in OdinEye.

---

## Feature summary

| Feature | Tab | Status |
|:--------|:----|:------:|
| Live biometric metric cards | Home | ✅ |
| Today's wellness snapshot | Home | ✅ |
| Sleep Architecture & 7-Day Cumulative Debt Card | Home | ✅ |
| Today's medication preview card | Home | ✅ |
| AI daily insight card | Home | ✅ |
| Manual sync with animated indicator | Home | ✅ |
| Notifications centre (bell icon) | Home | ✅ |
| Android Home Screen AppWidgets (Pill & Zen) | Config / System | ✅ |
| Medication routine tracker | Meds | ✅ |
| Week strip calendar | Meds | ✅ |
| Full month interactive calendar | Meds | ✅ |
| One-tap dose logging | Meds | ✅ |
| OS-level push notification reminders | Meds | ✅ |
| On-screen real-time dose alert modal | Meds | ✅ |
| Add / edit / archive medications | Meds | ✅ |
| Medication detail view | Meds | ✅ |
| 3-pillar health overview (Activity / Sleep / Recover) | Vitals | ✅ |
| Cardio & distance breakdown card | Vitals | ✅ |
| Sleep quality & duration card | Vitals | ✅ |
| Strength & muscle recovery card | Vitals | ✅ |
| Per-muscle-group recovery analysis | Body | ✅ |
| Hypertrophy readiness scoring | Body | ✅ |
| Body composition analysis | Body | ✅ |
| Interactive Guided Mobility & Stretching Timer | Body / AI | ✅ |
| Body Analysis tab toggle (hide/show) | Config | ✅ |
| Mindfulness & Breathing exercises | Zen | ✅ |
| Tactile Haptic Pacing (Eyes-Closed Meditation) | Zen | ✅ |
| Procedural Ambient Audio & Binaural Beats Engine | Zen / Body | ✅ |
| Interactive 7-day streak calendar | Zen | ✅ |
| Animated breathing orb with phase timer | Zen | ✅ |
| Dynamic Reactive Mood Face | Zen | ✅ |
| Daily mindful minutes goal stepper | Config | ✅ |
| On-device AI coach (Android AICore / Gemini Nano) | AI | ✅ |
| Voice-Activated Local AI Coach (STT / TTS) | AI | ✅ |
| Cloud Gemini AI fallback | AI | ✅ |
| Offline rule-based coaching | AI | ✅ |
| AI toggle (disable AI modules entirely) | Config | ✅ |
| Module toggles (AI, Body, Mindfulness, Medication) | Config | ✅ |
| Unified wearable credential cards | Config | ✅ |
| Daily steps, calorie & mindful target steppers | Config | ✅ |
| Goal recalibration flow | Config | ✅ |
| AES-256 encrypted credential vault | Config | ✅ |
| Vault wipe / key deletion | Config | ✅ |
| Onboarding (2-step personal + goals) | — | ✅ |
| Theme: Scandinavian Pastel Bento | — | ✅ |

---

## Home

The default landing tab. Shows a live snapshot of your health status at a glance.

### Live Metric Cards Grid

Four bento cards displaying real-time data:
- **Steps** — daily step count with progress toward your goal
- **Active Calories** — burned calories from movement
- **Heart Rate** — current resting HR with zone indicator
- **Recovery Score** — composite recovery index from wearable data

Tap any card to expand a detailed modal with trend charts and source attribution.

### Today's Wellness Snapshot

A summary card showing your overall wellness status — muscle readiness, sleep quality, and activity level synthesised into a brief human-readable verdict.

### Sleep Architecture & 7-Day Cumulative Debt Card

A spacious Scandinavian Bento card providing clinical-grade restorative sleep analysis:
- **7-Day Cumulative Sleep Debt**: Calculates cumulative sleep surplus or deficit against your personal baseline (default 8.0h/night) with a strict zero-dummy data policy (solely computed against logged nights).
- **Physical Restoration (Deep Sleep)**: Tracks slow-wave sleep against the clinical 15%–25% target window for cellular turnover, human growth hormone (HGH) release, and physical tissue repair.
- **Cognitive Resilience (REM Sleep)**: Tracks paradoxical sleep against the clinical 20%–25% target window for synaptic pruning, memory consolidation, and emotional regulation.
- **Dynamic Guidance**: Displays visual bracket target zones, status badges (`Optimal`, `Sub-optimal`, `Abundant`), and somatic bedtime coaching tips.

### Today's Medication Preview Card

Shows the next scheduled dose and today's adherence progress. Tap to navigate directly to the **Meds** tab.

### AI Daily Insight Card

A one-sentence AI-generated recommendation for the day (e.g. *"Your HRV is elevated — ideal day for high-intensity training"*). Tap to open the full AI coach conversation in the **AI** tab.

### Manual Sync

The refresh icon in the top bar triggers `liveHealthService.syncAll()`, re-fetching data from all connected wearables and Health Connect simultaneously. The icon animates at 60 fps while syncing.

### Notifications Centre

Bell icon in the top bar opens the **Notifications Modal** — showing pending medication doses, system status, and a test alert trigger (also available in Config).

---

## Meds

A complete medication routine management system with real-time reminders.

### Calendar View

- **Week strip** — 7-day scrollable strip with today highlighted; tap any day to view that day's schedule
- **Full month** — interactive calendar toggle showing monthly adherence with colour-coded days

### Dose Logging

Each medication shows all scheduled times for the selected day. Tap the checkmark to log a dose as taken. Doses toggle between taken / pending.

### Medication Cards

Each medication card shows:
- Drug name, dosage, and form (tablet, capsule, drops, injection)
- Next scheduled time and today's remaining doses
- Colour-coded adherence percentage

### Add / Edit / Archive

- **Add** via the `+` button in the top-right header
- **Edit** via the medication detail modal (name, dosage, times, frequency, duration)
- **Archive** to remove from the active routine without deleting history

### On-Screen Reminder Alert

A real-time alert modal appears when a dose is due (within 15 minutes of scheduled time). Actions:
- **Take Now** — logs the dose immediately
- **Snooze 10 mins** — re-triggers the alert after 10 minutes
- **Dismiss** — silences for this session

### OS-Level Notifications

Scheduled exact alarms fire even when the app is in the background or closed. Tapping a notification opens the alert modal directly.

---

## Vitals

A consolidated health data overview aggregated from all connected sources.

### 3-Pillar Strip

Three compact pills showing scores for:
- **Activity** — steps + active zone minutes + calorie burn
- **Sleep** — sleep index or efficiency percentage
- **Recover** — muscle recovery composite score

### Cardio & Distance Card (Sage Mint)

- Total distance (km) for the day
- Daily step count, pace (min/km), active minutes, calories burned
- Source: Fitbit workout data or Health Connect steps

### Sleep Quality Card (Obsidian)

- Total sleep duration (hours + minutes)
- Sleep quality verdict (Deep Sleep Optimal / Restorative / Awaiting Log)
- Sleep efficiency score from Ultrahuman or Health Connect

### Strength & Recovery Card (Peach)

- Workout volume and top muscle groups from Hevy
- Composite muscle recovery score
- Muscle strain indicators

---

## Body

An advanced module for biomechanical analysis. Can be **disabled entirely** in Config, which hides the tab from navigation.

### Per-Muscle-Group Recovery

Visual breakdown of recovery status for each muscle group — showing fatigue level, readiness percentage, and time-to-prime estimate.

### Hypertrophy Readiness

A score indicating whether conditions are optimal for muscle growth stimulus — based on HRV, sleep quality, and training recency.

### Body Composition Analysis

Estimates of muscle-to-fat ratio trends from wearable telemetry over time.

### Interactive Guided Mobility & Stretching Timer

A dedicated restorative protocol for active recovery and de-fatiguing sore muscles:
- **Dynamic De-Fatigue Routine Engine**: Analyzes your current muscle readiness and fatigue telemetry across 10 muscle groups (Quads, Hamstrings, Chest, Lats/Back, Shoulders, Calves, Glutes, Forearms, Abs, Lower Back). If fatigue is detected, it automatically sequences a prioritized multi-exercise mobility routine.
- **Full-Screen Circular Countdown Timer (`MobilityTimerModal`)**:
  - Visual circular progress ring with remaining time and phase indicators.
  - Phase structure: `Prepare (5s)` → `Active Stretch (30–45s)` → `Switch Side (5s transition if bilateral)` → `Next Exercise` → `Session Complete`.
  - Haptic feedback pulse on phase transitions for eyes-free pacing.
  - Procedural 2Hz Delta restorative frequency sound playback with mute/unmute control.
  - Comprehensive player controls: Rewind, Skip, Pause/Play, Mute.
  - Post-session completion summary with total minutes and muscles relieved.
- **Multiple Entry Points**:
  - **Top Banner**: "Recommended Today: De-Fatigue Routine" at the top of the **Body** tab.
  - **Dossier Cards**: "Start Restorative Stretch" button on each muscle group's individual card.
  - **AI Coach Recommendations**: Inline action pill in coach chat (`▶ Start Guided Mobility Flow`).

---

## Zen (Mindfulness & Breathing)

A dedicated sanctuary for nervous system regulation, breathing exercises, and daily streak tracking.

### Interactive 7-Day Streak Calendar

- Visual week strip (Mon–Sun) showing completion status for each day
- Glowing indicator dots on completed mindfulness days
- Day selection to review past sessions or view scheduled targets
- Weekly progress banner (e.g. "3 of 7 days completed this week")

### Today's Plan & Progress Ring

- Circular weekly completion ring (e.g. 75% weekly target reached)
- Daily target countdown and session summary
- One-tap quick jump to daily mood check-in

### Animated Breathing Orb (Interactive Sessions)

- Smooth expanding and contracting concentric ripple rings
- Clear visual phase coaching: **Breathe In...**, **Hold...**, **Breathe Out...**
- 4 curated breathing techniques:
  - **Breathing Exercise (4·4·4·4 Box)** — resets nervous system & lowers cortisol
  - **Deep Calm & Sleep (4·7·8)** — parasympathetic activation for sleep & anxiety
  - **Coherent Harmony (5·5)** — rhythm tuned to maximize Heart Rate Variability (HRV)
  - **Morning Energy Flow (5·2·5)** — elevates oxygenation and mental clarity
- Live countdown timer, cycle counters, and play / pause / stop controls

### Procedural Ambient Audio & Binaural Beats Engine

A real-time procedural sound synthesizer running on a dedicated background thread via native Android `AudioTrack` (44.1 kHz 16-bit stereo PCM) that plays continuously when the screen is dimmed or phone is locked:
- **14 Bespoke Soundscapes**:
  - **Binaural Beats (Stereo Differential)**: 40Hz Gamma (cognitive focus), 10Hz Alpha (creative flow), 6Hz Theta (deep meditation), 2Hz Delta (deep cellular repair).
  - **Solfeggio Pure Tones**: 432Hz Harmonic Peace, 528Hz Cellular Transformation, 639Hz Compassion & Connection.
  - **Colored Noise Generators**: Velvet Brown Noise (1/f² Brownian walk with low-pass filter), Organic Pink Noise (Paul Kellet 3-pole 1/f filter), Tranquil White Noise (uniform sound masking).
  - **Procedural Nature**: Resonant ocean waves with 0.12Hz LFO swell modulation, gentle rain, forest breeze, chirping birds, and silent clarity.
- **Category Filter Chips & Audition Controls**: Quick filtering (`All Sounds`, `Binaural Beats`, `Solfeggio`, `Colored Noise`, `Nature`), master volume stepper, and live audition toggle directly in the Zen chamber.

### Tactile Haptic Pacing (Eyes-Closed Meditation)

Allows meditating with closed eyes through distinct somatic vibration patterns:
- **Inhale**: Rising double micro-pulse.
- **Hold**: Subtle grounding anchor tap.
- **Exhale**: Smooth soothing release vibration.
- **Toggle**: Quick `📳 Haptics: ON / OFF` pill in the breathing chamber header with persistent storage.

### Dynamic Reactive Mood Face

- **Morphing Vector SVG Face (`MoodFaceIcon`)**: Changes facial expression across 5 emotional states (Unhappy, Sad, Normal, Good, Happy) with responsive eyebrows, eyes, and mouth.
- **Concentric Pastel Aura Rings**: Ripple rings adopt the signature pastel hue of the selected mood with spring bounce physics.
- **Tailored Guidance**: Displays mood-specific reflections and updates the Home tab's Today's Plan progress card.

---

## AI

An intelligent health coaching interface powered by on-device and cloud AI.

### On-Device (Android AICore / Gemini Nano)

Runs locally on your phone using Android AICore — no internet required, no data leaves the device. Requires a compatible Pixel / Android 14+ device with Gemini Nano.

### Cloud Gemini Fallback

If on-device AI is unavailable, the app falls back to the **Gemini Cloud API**. Enter your key from [Google AI Studio](https://aistudio.google.com) in Config → Application Modules.

### Offline Rule-Based Coaching

A curated sports science knowledge base (`sportsScienceKnowledge.ts`) provides instant offline recommendations when neither on-device nor cloud AI is available — covering recovery, training load, caffeine timing, and sleep hygiene.

### Interactive Chat

Ask anything about your health data:
- *"Can I lift heavy today?"*
- *"What's my caffeine cutoff for good sleep?"*
- *"Should I do cardio or rest?"*
- *"Explain my HRV trend this week"*

The AI has full context of your current biometrics from `liveHealthService`.

### Voice-Activated Local AI Coach (`VoiceCoachOverlay`)

A hands-free, private voice interface for interacting with the AI coach:
- **On-Device Speech Pipeline**: Connects to native Android `SpeechRecognizer` and `TextToSpeech` (`OdinEyeVoiceModule.kt`) to capture voice and speak answers without cloud transmission.
- **Dedicated Live Transcribe Card**: Streams spoken words into an interactive, editable `TextInput` with dynamic status pills (`READY TO LISTEN`, `LIVE TRANSCRIBING...`, `TRANSCRIPTION READY`).
- **Hands-Free or Tap-To-Edit**: Users can speak hands-free, tap to edit/correct words, or type directly into the box.
- **Done Speaking Action**: A dedicated "Done Speaking ✓" header button allows instantly closing speech capture and finalizing words.
- **Suggested Hands-Free Prompts**: Tapping any suggested query (*"Can I train heavy today?"*, *"Check my recovery and sleep"*, etc.) populates the transcribe box for review before submission.
- **Neural TTS Read-Aloud**: Toggleable automatic speech synthesis that reads coach responses out loud.
- **Dual-Mode Compatibility**: Uses native on-device speech in compiled Android builds (`npm run android`), and seamlessly supports mobile keyboard dictation (Google / Samsung Voice Typing) in Expo Go.

> 💡 **Dedicated Documentation:** For technical architecture, privacy containment, NPU benchmarks, and zero-cloud guarantees, see [ON_DEVICE_AI.md](./ON_DEVICE_AI.md).

---

## Config

Four logically grouped settings categories.

### Category 01 — Application Modules & Feature Suite

| Setting | Description |
|:--------|:------------|
| AI Health Engine | Master toggle — disables AI tab and all AI coaching modules |
| Cloud Gemini Fallback | Enter Gemini API key; test connection with live ping |
| Body & Muscle Recovery Analysis | Toggle Body tab on/off; persists across app reloads |
| Medication & Health Reminders | Toggle OS notification reminders; view active alert count; send test reminder |

### Android Home Screen AppWidgets Hub

Interactive management for Android 4×2 home screen widgets:
- **Pill Reminder Widget**: Live preview and sync for the home screen pill dose tracker with direct "Take" button.
- **Zen Streak & Vitals Widget**: Live preview and sync for daily steps, heart rate, streak, and "Breathe" launcher.
- **Instant Sync**: "Sync Widgets Now" button for manual home screen synchronization.

### Category 02 — Connected Wearables & Hardware Streams

Each device has its data stream toggle, credential input, and test button in a **single unified card** — no hunting across the page.

| Device | Auth | Data |
|:-------|:-----|:-----|
| Android Health Connect | OS permission button | Steps, HR, HRV, sleep, SpO2, calories |
| Ultrahuman Ring AIR | Personal token | Recovery, HRV, sleep stages, skin temp |
| Google Fitbit | OAuth access token | Sleep, active zone mins, pace, calories |
| Hevy Strength Log | User API key | Workouts, sets, volume, muscle groups |

### Category 03 — Daily Targets & Recalibration

- **Steps target** — interactive `−500 / +500` stepper
- **Active calories target** — interactive `−50 / +50 kcal` stepper
- **Recalibrate Daily Targets & Goals** — launches the onboarding goal-setting screen in recalibration mode

### Category 04 — Hardware Security & Vault Audit

- **Cryptographic spec grid** — cipher, integrity, key derivation, sandbox mode
- **Zero-Plaintext Guarantee** — confirms no credential has ever been stored unencrypted
- **Wipe Vault & Delete Keys** — emergency reset; deletes all stored credentials from the encrypted vault

---

## Onboarding

A 2-step flow that runs once on first launch:

1. **Step 1 — Personal info** — name, age range, fitness level
2. **Step 2 — Daily targets** — step goal, active calorie goal, and daily mindfulness goal via interactive steppers and preset chips

Can be re-entered in **recalibration mode** from Config → Category 03. In recalibration mode the header shows "RECALIBRATE TARGETS" and the confirm button reads "Save Targets & Return to App".

---

## Security

See [ARCHITECTURE.md — Security architecture](ARCHITECTURE.md#security-architecture) for the full cryptographic breakdown.

| Action | Location |
|:-------|:---------|
| View stored key (masked) | Config → each wearable card → eye toggle |
| Change / update a key | Config → wearable card → token field → Save & Test |
| Wipe all credentials | Config → Category 04 → Wipe Vault & Delete Keys |
