# API Integrations

Setup guide for every data source OdinEye connects to.

---

## Overview

| Integration | Auth method | Data provided | Service file |
|:------------|:-----------|:-------------|:------------|
| Android Health Connect | OS permission grant (read-only) | Steps, HR, HRV, sleep, calories, SpO2, distance, skin temp, respiratory rate | `src/services/healthConnect/healthConnectService.ts` |
| Ultrahuman Ring AIR | Personal API token | Recovery score, sleep stages, HRV, skin temperature | `src/services/api/ultrahumanApiClient.ts` |
| Google Fitbit | OAuth access token | Sleep stages, active zone minutes, calories, pace | `src/services/api/fitbitApiClient.ts` |
| Hevy Strength Log | User API key | Workouts, sets, reps, volume, muscle groups | `src/services/api/hevyApiClient.ts` |
| Android AICore | On-device — no key needed | Gemini Nano inference (on-device AI) | `src/services/ai/androidAiCoreService.ts` |
| Gemini Cloud API | Google AI Studio API key | Cloud AI coaching fallback | `src/services/ai/aiService.ts` |

---

## Android Health Connect

Health Connect is the Android OS health data hub. OdinEye requests **read-only** access — it never writes to Health Connect.

### What it provides

| Data type | Used for |
|:----------|:---------|
| Steps | Home metric card, Vitals cardio card |
| Heart Rate | Home HR card, recovery analysis |
| Resting Heart Rate | Recovery composite score |
| Heart Rate Variability | HRV trend, AI coaching context |
| Exercise sessions | Workout detection, active zone minutes |
| Total & Active Calories | Home calorie card, Vitals cardio card |
| Distance | Vitals cardio card (km) |
| Sleep stages | Vitals sleep card, recovery scoring |
| Skin Temperature | Ultrahuman cross-reference |
| Oxygen Saturation (SpO2) | Body composition context |
| Respiratory Rate | Recovery analysis |

### Required permissions (declared in `app.json`)

```
android.permission.health.READ_SLEEP
android.permission.health.READ_HEART_RATE
android.permission.health.READ_RESTING_HEART_RATE
android.permission.health.READ_HEART_RATE_VARIABILITY
android.permission.health.READ_EXERCISE
android.permission.health.READ_TOTAL_CALORIES_BURNED
android.permission.health.READ_ACTIVE_CALORIES_BURNED
android.permission.health.READ_STEPS
android.permission.health.READ_DISTANCE
android.permission.health.READ_SKIN_TEMPERATURE
android.permission.health.READ_OXYGEN_SATURATION
android.permission.health.READ_RESPIRATORY_RATE
```

### Setup

1. Install OdinEye as a **native APK** (see [BUILD.md](BUILD.md)) — Health Connect does not work under Expo Go
2. Open OdinEye → **Config** tab → **Connected Wearables → Android Health Connect**
3. Tap **Connect Health Connect (Read-Only)**
4. The Android OS permission dialog appears — grant all permissions
5. OdinEye will now read biometric data directly from Health Connect on each sync

### Troubleshooting

| Problem | Fix |
|:--------|:----|
| OdinEye not listed in Health Connect | Install the native APK; force-stop and reopen Health Connect |
| Permission dialog never appears | Check `app.json` permissions list; rebuild the APK |
| Data shows as 0 after granting | Your wearable app (Samsung Health, Google Fit, etc.) must be writing to Health Connect |
| `minSdkVersion` error at build | Ensure `android/build.gradle` has `minSdkVersion 26` |

---

## Ultrahuman Ring AIR

The recommended primary data source for sleep, HRV, recovery scoring, and skin temperature.

### What it provides

- Composite recovery score (0–100)
- Sleep stages (REM, deep, light, awake)
- HRV (heart rate variability)
- Resting heart rate
- Skin temperature delta
- Movement index

### Getting your personal token

1. Open the [Ultrahuman web dashboard](https://app.ultrahuman.com)
2. Log in with your Ultrahuman account
3. Go to **Profile → Developer → Personal Access Token**
4. Copy the token (starts with `uh_...`)

### Entering the token in OdinEye

1. Open **Config** tab → **Connected Wearables → Ultrahuman Ring AIR**
2. Enable the **Live Telemetry Stream** toggle
3. Paste your token in the **Personal API Token** field
4. Tap **Save & Test Ring API** — a green confirmation appears on success

### Troubleshooting

| Problem | Fix |
|:--------|:----|
| "Connection failed" on test | Token may be expired; regenerate in the Ultrahuman web dashboard |
| Recovery score shows 0 | Ring must have synced with the Ultrahuman app within the last 24h |
| Skin temperature unavailable | Only available on Ring AIR hardware with firmware ≥2.x |

---

## Google Fitbit

Provides sleep stage data, active zone minutes, calorie tracking, and pace from the Fitbit ecosystem.

### What it provides

- Sleep stages (REM, deep, light, awake)
- Active Zone Minutes (AZM)
- Calories burned
- Resting heart rate
- Active pace (min/km)

### Getting an access token

Fitbit uses OAuth 2.0. The simplest way to get a personal access token for development:

1. Log in at [dev.fitbit.com](https://dev.fitbit.com)
2. Go to **Manage → Register an App** → create a personal app (type: **Personal**)
3. Go to [Fitbit OAuth 2.0 Tutorial](https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/) and use the **Implicit Grant Flow** to get a bearer token
4. The access token looks like: `eyJhbGciOiJIUzI1NiJ9...`

> **Token expiry:** Fitbit access tokens expire after 8 hours. For persistent access, implement the refresh token flow or use a long-lived token from the Fitbit OAuth playground.

### Entering the token in OdinEye

1. Open **Config** tab → **Connected Wearables → Google Fitbit**
2. Enable the **Sleep Stage & SpO2 Streaming** toggle
3. Paste your OAuth access token
4. Tap **Save & Test Fitbit API**

### Troubleshooting

| Problem | Fix |
|:--------|:----|
| 401 Unauthorized | Token has expired — generate a new one from the Fitbit dev console |
| Sleep data missing | Ensure your Fitbit device synced to the Fitbit app today |
| AZM always 0 | Active Zone Minutes require a Fitbit Charge 4+ or Sense/Versa 3+ |

---

## Hevy Strength Log

Provides detailed workout data including sets, reps, volume, and per-exercise muscle group load.

### What it provides

- Workout sessions (name, date, duration)
- Exercise sets (reps, weight, one-rep max)
- Total volume per session
- Muscle group breakdown (chest, back, legs, shoulders, arms)

### Getting your API key

1. Open the **Hevy** app on your phone
2. Go to **Profile → Settings → Developer → API Key**
3. Copy the key (a UUID like `a1b2c3d4-...`)

### Entering the key in OdinEye

1. Open **Config** tab → **Connected Wearables → Hevy Strength Log**
2. Enable the **Workout Telemetry & Set-Level Metrics** toggle
3. Paste your API key
4. Tap **Save & Test Hevy API**

### Troubleshooting

| Problem | Fix |
|:--------|:----|
| "API error" on test | Verify the key is copied fully — it's a UUID, no extra spaces |
| No workout data | You must have logged at least one workout in Hevy in the past 7 days |
| Muscle group data missing | Some exercises may not have muscle group metadata in Hevy — this is expected |

---

## Android AICore (Gemini Nano — on-device)

Runs Gemini Nano directly on your phone using Android's AICore framework. **No internet connection, no API key, no data leaves your device.**

### Requirements

- Android 14+ (API 34+)
- A device with Gemini Nano support (currently: Pixel 8 / 8 Pro and newer, select Samsung Galaxy S24+ models)
- Android AICore service installed (ships with supported devices)

### How it works

OdinEye calls `androidAiCoreService.generate(prompt)`. If AICore is available, the response is generated locally in milliseconds. If unavailable, the service automatically falls back to the Gemini Cloud API.

### No setup needed

No configuration is required. If your device supports AICore, it works automatically.

---

## Gemini Cloud API (fallback)

When Android AICore is unavailable, OdinEye uses the Gemini REST API for cloud-based AI coaching.

### Getting a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API key → Create API key**
4. Copy the key (starts with `AIza...`)

### Entering the key in OdinEye

1. Open **Config** tab → **Application Modules → AI Health Engine**
2. Enable the **Cloud Gemini Fallback** toggle
3. Paste your API key in the **Gemini API Key** field
4. Tap **Save & Test Cloud Connection** — a latency readout appears on success

### Free tier limits

Gemini API free tier as of 2026: 60 requests/minute, 1,500 requests/day. This is well above typical usage for a personal health coaching app.

### Troubleshooting

| Problem | Fix |
|:--------|:----|
| "Connection failed" on test | API key may be incorrect or the Gemini API may be temporarily unavailable |
| AI responses are slow | Cloud latency is expected (~1–3s). On-device AICore is near-instant if available |
| "Quota exceeded" error | You've hit the free tier limit — wait until the daily quota resets |
