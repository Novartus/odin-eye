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
| **Home** | Live metric cards (steps, calories, heart rate, recovery score), wellness snapshot, today's medication preview, AI daily insight |
| **Meds** | Medication routine tracker with week/month calendar view, dose logging, and OS-level push notifications |
| **Vitals** | Health overview — Activity / Sleep / Recover pillar breakdown, cardio stats, sleep quality, strength telemetry |
| **Body** | Per-muscle-group recovery analysis, hypertrophy readiness, body composition _(can be toggled off in Config)_ |
| **AI** | On-device AI health coach via Android AICore (Gemini Nano) with Gemini Cloud API fallback |
| **Config** | Module toggles, wearable credentials, daily targets, AES-256 encrypted security vault |

---

## Tech stack

| Layer | Technology |
|:------|:-----------|
| Framework | React Native 0.86.3 + Expo 57 |
| Language | TypeScript 6 (strict mode) |
| Navigation | Custom `FloatingTabBar` (no React Navigation dependency) |
| Icons | Bespoke vector SVGs via `react-native-svg` 15 |
| Health data | `react-native-health-connect` 4.1.3 (Android Health Connect, read-only) |
| Secure storage | `expo-secure-store` — AES-256-CBC encrypted credential vault |
| AI (on-device) | Android AICore / Gemini Nano via `androidAiCoreService` |
| AI (cloud fallback) | Google Gemini API via `aiService` |
| Notifications | OS-level exact alarm scheduling via `expo-notifications` |
| Design system | Scandinavian Pastel Bento (porcelain, sage mint, forest green, peach) |

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
├── app.json                         # Expo + Android manifest config
├── eas.json                         # EAS build profiles
├── LICENSE
├── docs/
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── API_INTEGRATIONS.md
│   ├── BUILD.md
│   └── CONTRIBUTING.md
└── src/
    ├── components/
    │   ├── ai/              # AI coach view + message renderer
    │   ├── body/            # Body & muscle recovery analysis
    │   ├── common/          # Shared UI (splash, modals, loaders)
    │   ├── home/            # Home tab cards and top bar
    │   ├── medication/      # Medication tracker, modals, icons
    │   ├── navigation/      # FloatingTabBar
    │   ├── overview/        # Vitals tab (HealthOverviewView)
    │   ├── settings/        # Config tab (SettingsView)
    │   └── sleep/           # Sleep bar chart
    ├── screens/
    │   ├── DashboardScreen.tsx   # Root shell — all tabs and global state
    │   └── OnboardingScreen.tsx  # 2-step onboarding + recalibration mode
    ├── services/
    │   ├── ai/              # AI engine, local coach, sports science KB
    │   ├── api/             # Ultrahuman, Fitbit, Hevy API clients
    │   ├── healthConnect/   # Android Health Connect integration
    │   ├── live/            # Live telemetry aggregator
    │   ├── medication/      # Medication service + OS notifications
    │   ├── security/        # AES-256 crypto utilities
    │   ├── sleep/           # Sleep history service
    │   └── storage/         # Encrypted credentials vault
    ├── theme/
    │   └── colors.ts        # Scandinavian Pastel Bento palette
    └── types/               # Canonical TypeScript interfaces
        ├── index.ts         # Barrel export
        ├── health.ts
        ├── medication.ts
        ├── storage.ts
        ├── navigation.ts
        ├── devices.ts
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
