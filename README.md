<div align="center">

# OdinEye

**Personal Health Intelligence — On-Device. Private. Precise.**

[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white)](https://developer.android.com)
[![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

OdinEye is a **centralized personal health hub** for Android. It aggregates live biometrics from multiple wearables and Android Health Connect, tracks your medication routine with real-time reminders, analyzes muscle recovery and body composition, and delivers on-device AI coaching — all without sending your health data to the cloud.

---

## What it does

| Tab | What you get |
|:----|:------------|
| **Home** | Live metric cards (steps, calories, heart rate, recovery score), **Sleep Architecture & 7-Day Debt Balance card**, wellness snapshot, today's medication preview, today's zen preview, AI daily insight |
| **Meds** | Medication routine tracker with week/month calendar view, dose logging, and OS-level push notifications |
| **Vitals** | Health overview — Activity / Sleep / Recovery pillar breakdown, cardio stats, 7-day sleep duration chart, strength telemetry |
| **Body** | Per-muscle-group recovery analysis, hypertrophy readiness, **Interactive Guided Mobility & Stretching Timer for Fatigued Muscles**, body composition _(can be toggled off in Config)_ |
| **Zen** | Mindfulness & breathwork sanctuary with **Tactile Haptic Pacing** (eyes-closed meditation), **Ambient Binaural Audio Engine** (432Hz, 40Hz Gamma, Brown noise), **Dynamic Reactive Mood Face**, and 7-day streak calendar |
| **AI** | On-device AI health coach via Android AICore (Gemini Nano) with **Voice-Activated Hands-Free Coach**, live streaming transcription, and Gemini Cloud API fallback |
| **Config** | Module toggles, wearable credentials, daily targets, Android Home Screen AppWidgets hub, AES-256 encrypted security vault |

---

## Key highlights & new capabilities

### 🎙️ Voice-Activated Local AI Coach & Interactive Transcribe
- **On-Device Voice Pipeline (`OdinEyeVoiceModule`)**: Hands-free speech interaction utilizing Android's native `SpeechRecognizer` and `TextToSpeech` (TTS) — 100% offline, zero cloud transmission.
- **Interactive Transcribe Card**: Real-time streaming voice transcription into an editable `TextInput`, allowing hands-free speaking, tap-to-correct editing, manual typing, or 1-tap suggested query selection.
- **Audio Equalizer & Native Animations**: 5-bar live equalizer animating dynamically with 100% Native Driver (`useNativeDriver: true`) without JS bridge overhead.
- **Audio Read-Aloud**: Optional toggle to speak AI responses out loud automatically using on-device neural TTS.
- **Dual-Mode Compatibility**: Runs full offline native speech in compiled Android builds (`npm run android`), and seamlessly supports mobile keyboard dictation (Google / Samsung Voice Typing) in Expo Go.

### 🧘 Interactive Guided Mobility & Stretching Timer
- **De-Fatigue Composite Routine**: Analyzes real-time fatigue scores across 10 muscle groups (Quads, Hamstrings, Chest, Lats/Back, Shoulders, Calves, Glutes, Forearms, Abs, Lower Back) and dynamically sequences targeted restorative stretches.
- **Full-Screen Circular Timer**: Visual phase countdown ring with intelligent intervals (`Prepare 5s` → `Stretch 30–45s` → `Switch Side 5s` → `Next Exercise`).
- **Tactile Transitions & Ambient Delta Waves**: Gentle haptic pulses on phase changes and integrated 2Hz Delta restorative frequency soundscapes.
- **Omnipresent Access**: Launch from the top banner in **Body Analysis**, individual muscle group dossier cards, or directly via one-tap action pills in **AI Coach** recommendations.

### 🌙 Sleep Debt & Sleep Architecture Balance
- **7-Day Cumulative Sleep Debt**: Computes personal sleep debt against your biological baseline (default 8.0h/night) with a strict **zero-dummy data** guarantee (calculated solely against recorded nights).
- **Physical vs. Cognitive Restoration**:
  - **Physical Restoration (Deep Sleep)**: Tracks slow-wave delta sleep against the clinical 15%–25% target for cellular turnover and human growth hormone release.
  - **Cognitive Resilience (REM Sleep)**: Tracks paradoxical REM sleep against the clinical 20%–25% target for emotional memory consolidation and synaptic pruning.
- **Scandinavian Bento Card**: Full-width spacious bento layout with target range indicator brackets, status badges (`Optimal`, `Sub-optimal`, `Abundant`), and somatic bedtime coaching advice.

### 📳 Tactile Haptic Pacing & Navigation Feedback
- **Somatic Eyes-Closed Meditation**: Inhale (rising double micro-pulse), Hold (subtle anchor tap), and Exhale (smooth soothing release) vibration cues so you can meditate with closed eyes.
- **In-Chamber Toggle**: Instant `📳 Haptics: ON / OFF` toggle pill in the full-screen breathing chamber header with persistent storage.
- **Crisp Navigation Haptics**: Responsive micro-vibrations (`28ms`) on bottom tab bar presses (`FloatingTabBar`) and programmatic in-app card jump links.

### 📱 Android Home Screen AppWidgets (RemoteViews)
- **Pill Reminder 4×2 Widget**: Displays the next scheduled dose with a direct **"Take"** action button right on the Android home screen without opening the app, updating live adherence.
- **Zen Streak & Vitals 4×2 Widget**: Displays daily steps with progress bar, real-time/resting heart rate, current mindfulness streak, and a one-tap **"Breathe"** launcher.
- **Widget Hub in Settings**: Live visual preview, step-by-step setup guide, and manual instant sync.

### 🎧 Procedural Ambient Audio & Binaural Beats Engine
- **Background Sound Engine (`OdinAudioEngine`)**: Real-time mathematical sound synthesis running on a dedicated thread via native Android `AudioTrack` (44.1 kHz 16-bit stereo PCM) that plays continuously with the screen dimmed.
- **14 Bespoke Soundscapes**:
  - **Binaural Beats**: 40Hz Gamma (focus), 10Hz Alpha (flow), 6Hz Theta (meditation), 2Hz Delta (restoration).
  - **Solfeggio Frequencies**: 432Hz Harmonic Peace, 528Hz Cellular Transformation, 639Hz Compassion.
  - **Colored Noise**: Velvet Brown Noise (1/f² Brownian walk), Organic Pink Noise, Tranquil White Noise.
  - **Procedural Nature**: Resonant ocean waves with LFO modulation, gentle rain, forest breeze, chirping birds.

### 😊 Reactive Dynamic Mood Face
- Morphing vector SVG face (`MoodFaceIcon`) across 5 emotional states (Unhappy, Sad, Normal, Good, Happy) paired with reactive pastel concentric ripple auras, spring bounce physics, and persistent daily state.

---

## Tech stack

| Layer | Technology |
|:------|:-----------|
| Framework | React Native 0.86.3 + Expo 57 |
| Language | TypeScript 6 (strict mode — zero unused locals/parameters) |
| Bundler & Tooling | Metro Bundler + `babel-preset-expo` (AST caching & root-anchored blockList) |
| Navigation | Custom `FloatingTabBar` with tactile haptic feedback |
| Voice & Speech | Native Kotlin `OdinEyeVoiceModule` (`SpeechRecognizer` + `TextToSpeech`) + Web Speech fallback |
| Mobility & Recovery | Dynamic De-Fatigue Routine Engine (`mobilityCatalog.ts`) + `MobilityTimerModal` |
| Audio | Native Kotlin `OdinAudioEngine` (44.1 kHz stereo PCM) + Web Audio API fallback |
| AppWidgets | Native Android `RemoteViews` + Kotlin Widget Providers + `OdinEyeWidgetModule` |
| Haptics | Somatic tactile breath pacing & UI micro-vibrations via React Native `Vibration` |
| Icons | Bespoke vector SVGs via `react-native-svg` 15 (no emojis in code) |
| Health data | `react-native-health-connect` 4.1.3 (Android Health Connect, read-only) |
| Secure storage | `expo-secure-store` — AES-256-CBC encrypted credential vault |
| AI (on-device) | Android AICore / Gemini Nano via `androidAiCoreService` |
| AI (cloud fallback) | Google Gemini API via `aiService` |
| Notifications | OS-level exact alarm scheduling via `expo-notifications` |
| Design system | Scandinavian Pastel Bento (porcelain, sage mint, forest green, peach, lilac) |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start Metro bundler
npm start

# 3. Run on Android (USB + ADB)
npx expo run:android
```

> No API keys are required to start. The app runs with local data immediately. Connect your wearables via the **Config** tab when ready.

---

## Data integrations

| Source | Auth method | Data provided |
|:-------|:-----------|:-------------|
| **Android Health Connect** | OS permission grant (read-only) | Steps, HR, HRV, sleep, calories, SpO2, distance, skin temp |
| **Ultrahuman Ring AIR** | Personal API token | Recovery score, sleep stages, HRV, skin temperature |
| **Google Fitbit** | OAuth access token | Sleep stages, active zone minutes, calories, pace |
| **Hevy Strength Log** | User API key | Workouts, sets, volume, per-muscle-group load |
| **Android AICore** | On-device — no key needed | Gemini Nano inference |
| **Gemini Cloud** | Google AI Studio API key | Cloud AI coaching fallback |

---

## Security

All wearable tokens and API keys are stored in an **on-device AES-256-CBC encrypted vault** — never in plaintext, never sent to the cloud.

| Property | Specification |
|:---------|:-------------|
| Cipher | AES-256-CBC |
| Integrity check | HMAC-SHA256 |
| Key derivation | PBKDF2 (10,000 rounds) |
| Storage sandbox | Linux Mode 0700 via `expo-secure-store` |
| Plaintext exposure | **Zero** |

---

## Documentation

| Document | What it covers |
|:---------|:--------------|
| [docs/ON_DEVICE_AI.md](docs/ON_DEVICE_AI.md) | **Deep architectural guide on 3-tier local AI stack, Android AICore / Gemini Nano, and zero-telemetry containment** |
| [docs/PRIVACY_POLICY.md](docs/PRIVACY_POLICY.md) | **Google Play & Health Connect Privacy Policy, Limited Use disclosures & legal governance** |
| [docs/privacy-policy.html](docs/privacy-policy.html) | Standalone responsive HTML privacy policy for web/store hosting |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data flow, module map, security & AI architecture |
| [docs/FEATURES.md](docs/FEATURES.md) | Complete feature reference for all 6 tabs |
| [docs/API_INTEGRATIONS.md](docs/API_INTEGRATIONS.md) | Step-by-step setup for every wearable and API |
| [docs/BUILD.md](docs/BUILD.md) | Build, install, and release instructions |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Developer conventions, patterns, and how to extend |

---

## Project structure

```
centralized-health-app/
├── App.tsx                          # Entry point — onboarding gate
├── index.ts                         # Expo bootstrap
├── babel.config.js                  # Babel AST transform cache config
├── metro.config.js                  # Metro bundler config with crawler exclusions
├── app.json                         # Expo + Android manifest config
├── eas.json                         # EAS build profiles
├── LICENSE
├── docs/
│   ├── ON_DEVICE_AI.md              # Dedicated on-device AI technical guide
│   ├── PRIVACY_POLICY.md            # Google Play Privacy Policy (Markdown)
│   ├── privacy-policy.html          # Web-hosted Privacy Policy (HTML)
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── API_INTEGRATIONS.md
│   ├── BUILD.md
│   └── CONTRIBUTING.md
├── android/
│   └── app/src/main/java/com/odineye/health/
│       ├── audio/                   # Native AudioTrack procedural sound engine
│       │   └── OdinAudioEngine.kt
│       ├── voice/                   # Native on-device speech recognizer & TTS
│       │   └── OdinEyeVoiceModule.kt
│       └── widget/                  # Native Android RemoteViews AppWidgets
│           ├── PillReminderWidgetProvider.kt
│           ├── ZenVitalsWidgetProvider.kt
│           └── OdinEyeWidgetModule.kt
└── src/
    ├── components/
    │   ├── ai/              # AI coach view + VoiceCoachOverlay
    │   ├── body/            # Body & muscle recovery + MobilityTimerModal
    │   ├── common/          # Shared UI (splash, modals, loaders)
    │   ├── home/            # Home tab cards, SleepArchitectureBentoCard, top bar
    │   ├── medication/      # Medication tracker, modals, icons
    │   ├── mindfulness/     # Full-screen Zen chamber, breath orb, mood check-in
    │   ├── navigation/      # FloatingTabBar with haptics
    │   ├── overview/        # Vitals tab (HealthOverviewView)
    │   ├── settings/        # Config tab (SettingsView & Widget Hub)
    │   └── sleep/           # Sleep bar chart
    ├── screens/
    │   ├── DashboardScreen.tsx   # Root shell — all tabs and global state
    │   └── OnboardingScreen.tsx  # 2-step onboarding + recalibration mode
    ├── services/
    │   ├── ai/              # AI engine, voiceCoachService, local coach, sports science KB
    │   ├── api/             # Ultrahuman, Fitbit, Hevy API clients
    │   ├── audio/           # Ambient sound service (native audio track bridge)
    │   ├── healthConnect/   # Android Health Connect integration
    │   ├── live/            # Live telemetry aggregator
    │   ├── medication/      # Medication service + OS notifications
    │   ├── mindfulness/     # Mindfulness streak & session logging service
    │   ├── mobility/        # Guided mobility routines & de-fatigue engine
    │   ├── security/        # AES-256 crypto utilities
    │   ├── sleep/           # Sleep history, debt & architecture analytics
    │   ├── storage/         # Encrypted credentials vault
    │   └── widgets/         # AppWidgets synchronization service
    ├── theme/
    │   └── colors.ts        # Scandinavian Pastel Bento palette
    └── types/               # Canonical TypeScript interfaces
        ├── index.ts         # Barrel export
        ├── health.ts
        ├── medication.ts
        ├── storage.ts
        ├── navigation.ts
        ├── devices.ts
        ├── mobility.ts
        ├── components.ts
        └── aiCoach.ts
```

---

## Build

See **[docs/BUILD.md](docs/BUILD.md)** for full instructions.

```bash
# Fastest — local USB build (requires Android Studio)
npx expo run:android

# Cloud build — preview APK (no Android Studio needed)
eas build --platform android --profile preview

# Production release build
eas build --platform android --profile production
```

**Android package:** `com.odineye.health`  
**EAS Project ID:** `df3fdf1c-a9bf-40e5-9c2e-ba21b8183b55`

---

## Android Health Connect permissions

Declared in `app.json` — all read-only:

```
READ_SLEEP · READ_HEART_RATE · READ_RESTING_HEART_RATE · READ_HEART_RATE_VARIABILITY
READ_EXERCISE · READ_TOTAL_CALORIES_BURNED · READ_ACTIVE_CALORIES_BURNED
READ_STEPS · READ_DISTANCE · READ_SKIN_TEMPERATURE · READ_OXYGEN_SATURATION
READ_RESPIRATORY_RATE · POST_NOTIFICATIONS · SCHEDULE_EXACT_ALARM · VIBRATE
```

> Health Connect permissions only activate on a **natively installed APK** (`com.odineye.health`). They do not function inside Expo Go.

---

<div align="center">
  <sub>Built with React Native · Secured by AES-256 · Powered by Android Health Connect</sub>
</div>
