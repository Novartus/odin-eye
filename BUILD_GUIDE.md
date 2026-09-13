# 📱 Odin — Build & Install Guide

How to go from **Expo Go** (dev preview) to a **native Android APK** installed on your phone, with full Android Health Connect support.

---

## Why do I need a native build?

When you run the app via `npx expo start` (Expo Go), the running package on your phone is **Expo Go** (`host.exp.exponent`). Android Health Connect is an OS-level permission system that only indexes **installed standalone APKs**. Until you build and install Odin as its own `.apk`, it will not appear in:

> **Android Settings → Health Connect → App permissions**

Once installed as a native APK, Odin registers as `com.odineye.health` and Android Health Connect will list it under App permissions — no API token required.

> **Instant alternative (no build needed):** Enter your **Ultrahuman Personal Token** in the app Settings to pull live sleep, HR, HRV, and recovery data immediately via HTTPS.

---

## Option A — `npx expo run:android` (fastest, USB cable)

> Requires: Android Studio installed + USB debugging enabled on your phone.

```bash
# 1. Verify your phone is visible
adb devices
# Expected:  RF8M123XXXX  device

# 2. Build & install in one command (from project root)
npx expo run:android
```

Android Studio compiles the APK, installs it via ADB, and launches the app automatically.

### Enable USB Debugging on your phone
1. **Settings → About phone** → tap **Build number** 7 times
2. "You are now a developer!" appears
3. **Settings → Developer options → USB debugging → ON**
4. Plug in USB cable → accept "Allow USB debugging?" on phone

---

## Option B — EAS Build (no Android Studio needed)

EAS (Expo Application Services) builds the APK in the Expo cloud. Free tier available at https://expo.dev.

### Prerequisites

```bash
# Install EAS CLI (once)
npm install -g eas-cli

# Log in (free account at expo.dev)
eas login
```

### Step 1 — Configure EAS (one-time)

```bash
eas build:configure
```

Ensure your `eas.json` has a `preview` profile that outputs a plain `.apk` (not `.aab`):

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

### Step 2 — Build

```bash
# Cloud build — no local SDK needed (free tier)
eas build --platform android --profile preview

# OR local build — needs Android Studio
eas build --platform android --profile preview --local
```

Download the `.apk` from the link EAS prints when the build finishes.

### Step 3 — Install the APK

**Via USB (ADB):**

```bash
adb install /path/to/odin-build.apk
```

**Via file transfer (no cable):**
1. Copy the `.apk` to your phone (Google Drive / USB storage)
2. Open it on your phone → tap **Install**
3. If blocked: **Settings → Apps → Special app access → Install unknown apps** → allow your file manager

---

## After installation — Grant Health Connect permissions

1. Open the installed **Odin** app
2. Go to **Settings tab → Android Health Connect → Connect Health Connect (Read-Only)**
3. Tap **Allow Read-Only Access to All** — the real Android OS permission dialog appears
4. Grant all requested permissions

**Or** go manually: **Android Settings → Health Connect → App permissions → Odin → Allow**

---

## Verify it worked

Tap **Sync Now** in the Settings tab. You should see:

```
Live: Android Health Connect (X steps • Y km) ✓
```

Sleep hypnogram, resting HR, HRV, steps, and recovery score will populate from your Ultrahuman Ring AIR — no API key needed.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `adb devices` shows nothing | Enable USB Debugging; use a data cable (not charge-only) |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Uninstall the existing Expo Go / old Odin build first |
| `duplicate class HealthConnectPackage` build error | `npm uninstall expo-health-connect` (deprecated package conflict) |
| Odin not listed in Health Connect after install | Force-stop and reopen Health Connect; give it a few seconds to index |
| `minSdkVersion` error | Ensure `minSdkVersion 26` is set in `android/build.gradle` |

---

## App bundle ID

```
com.odineye.health
```

This is the package name Android Health Connect registers under App permissions.
