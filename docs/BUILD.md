# Build & Installation Guide

How to go from source code to a **native Android APK** installed on your phone — with full Android Health Connect support.

---

## Why a native build?

When running via `npx expo start` (Expo Go), the installed package on your phone is `host.exp.exponent` — not OdinEye. Android Health Connect is an OS-level permission system that only recognises **installed standalone APKs**. Until you build and install OdinEye natively, it will not appear in:

> **Android Settings → Health Connect → App permissions**

Once installed as `com.odineye.health`, Health Connect lists OdinEye and grants it biometric read access.

> **Instant alternative (no build needed):** Enter your **Ultrahuman personal token** in Config → Connected Wearables to pull live sleep, HR, HRV, and recovery data immediately over HTTPS — no Health Connect required.

---

## Option A — USB build via `expo run:android` _(fastest)_

**Requirements:** Android Studio installed · USB debugging enabled on your phone.

```bash
# 1. Verify your phone is visible to ADB
adb devices
# Expected:  RF8M123XXXX  device

# 2. Build and install in one command
npx expo run:android
```

Android Studio compiles the APK, installs it via ADB, and launches the app automatically.

### Enable USB debugging on your phone

1. **Settings → About phone** → tap **Build number** 7 times
2. "You are now a developer!" appears
3. **Settings → Developer options → USB debugging → ON**
4. Plug in USB cable → tap **Allow USB debugging** on the phone

---

## Option B — EAS cloud build _(no Android Studio needed)_

EAS (Expo Application Services) builds the APK in Expo's cloud. Free tier is available.

### Prerequisites

```bash
# Install EAS CLI once
npm install -g eas-cli

# Log in (free account at expo.dev)
eas login
```

### Build profiles (`eas.json`)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### Preview APK (internal testing)

```bash
# Cloud build — no local Android SDK needed
eas build --platform android --profile preview

# Local build — requires Android Studio
eas build --platform android --profile preview --local
```

EAS prints a download link when the build completes. Download the `.apk` and install it.

### Production build

```bash
eas build --platform android --profile production
```

---

## Installing the APK

### Via USB (ADB)

```bash
adb install /path/to/odineye.apk
```

### Via file transfer (no USB cable)

1. Copy the `.apk` to your phone (Google Drive, email, USB storage)
2. Open it on your phone → tap **Install**
3. If blocked: **Settings → Apps → Special app access → Install unknown apps** → allow your file manager

---

## After installation — Grant Health Connect permissions

1. Open the installed **OdinEye** app
2. Go to **Config** tab → **Connected Wearables → Android Health Connect**
3. Tap **Connect Health Connect (Read-Only)** — the Android OS permission dialog appears
4. Grant all requested permissions

Alternatively: **Android Settings → Health Connect → App permissions → OdinEye → Allow All**

---

## Verify it worked

Tap the sync icon on the Home screen. You should see:

```
Live: Android Health Connect (X steps · Y km) ✓
```

Sleep stages, resting HR, HRV, steps, and recovery data will populate from your connected sources.

---

## Build identifiers

| Property | Value |
|:---------|:------|
| Android package | `com.odineye.health` |
| EAS Project ID | `df3fdf1c-a9bf-40e5-9c2e-ba21b8183b55` |
| Min SDK | 26 (Android 8.0) |
| Target SDK | 36 |
| Compile SDK | 36 |

---

## TypeScript & bundle checks

Run these before submitting a pull request or build:

```bash
# TypeScript type check (must exit 0)
npx tsc --noEmit

# Android bundle integrity check
EXPO_NO_TELEMETRY=1 npx expo export --platform android --no-bytecode && rm -rf dist
```

---

## Troubleshooting

| Problem | Fix |
|:--------|:----|
| `adb devices` shows nothing | Enable USB Debugging; use a data cable (not charge-only) |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Uninstall the existing Expo Go / old OdinEye build first |
| `duplicate class HealthConnectPackage` | `npm uninstall expo-health-connect` (deprecated package conflict) |
| OdinEye not listed in Health Connect | Force-stop and reopen Health Connect; wait a few seconds for indexing |
| `minSdkVersion` error | Ensure `minSdkVersion 26` is set in `android/build.gradle` |
| Notification alarms not firing | Grant `SCHEDULE_EXACT_ALARM` permission manually in App settings |
