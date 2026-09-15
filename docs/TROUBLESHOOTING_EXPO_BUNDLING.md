# Troubleshooting: Expo Not Loading or Stuck on Bundling

Complete diagnostic guide for resolving instances where Expo Go or the OdinEye Development Build fails to connect, hangs on **"Bundling..."**, freezes at 99%, or displays a persistent blank screen on your Android phone.

---

## ⚡ 30-Second Quick Triage (Try First)

90% of bundling freezes are resolved by running this exact 3-step sequence:

```bash
# 1. Kill any zombie Node/Metro bundler processes
killall -9 node 2>/dev/null || true

# 2. Reset Watchman file watchers and wipe Metro / Expo temporary caches
watchman watch-del-all 2>/dev/null || true
rm -rf .expo node_modules/.cache

# 3. Start Expo with a clean, pristine cache
npx expo start -c
```

Then on your phone:
1. **Force Stop** Expo Go (or the OdinEye app).
2. Re-open the app and scan the QR code (or tap the project under Recent).

---

## 🩺 Diagnostic Table of Common Symptoms

| Symptom | Primary Cause | Immediate Fix |
|:---|:---|:---|
| **Stuck at "Connecting..." or Network Timeout** | Phone and PC on different Wi-Fi networks, router client isolation, or active VPN | Use **Tunnel mode** (`--tunnel`) or **USB cable** (`adb reverse`) |
| **Hangs at "Bundling 99%" or 100% then blank screen** | Silent runtime crash during mount, or missing native module in Expo Go | Check terminal logs, inspect LogBox, or build a **Development Client** |
| **`EADDRINUSE: port 8081 already in use`** | A lingering Metro or background process occupies port 8081 | Free port via `lsof -i :8081 \| awk 'NR>1 {print $2}' \| xargs kill -9` |
| **"Could not load exp://... Request timed out"** | Windows/macOS firewall blocking incoming connections on port 8081 | Add node/terminal to firewall whitelist or switch to USB ADB |
| **Infinite spinner inside Expo Go on phone** | Corrupted local cache inside the Android Expo Go app storage | Clear Expo Go cache & storage in Android Settings |

---

## 🛠️ Detailed Solutions by Scenario

### 1. Connection Fails Over Wi-Fi ("Could Not Connect to Development Server")

#### Why it happens:
- Modern Wi-Fi routers (especially mesh, university, public, or corporate office Wi-Fi) enable **AP Client Isolation**, which forbids devices on the same Wi-Fi from talking directly to each other.
- An active VPN or firewall on either your laptop or phone blocks direct local IP traffic (`192.168.x.x`).

#### Solution A: Tunnel Mode (Zero Wi-Fi Configuration Required)
Tunnel mode routes traffic securely through a cloud tunnel (ngrok/Cloudflare), bypassing local router restrictions completely:
```bash
npx expo start --tunnel -c
```
*(If prompted to install `@expo/ngrok`, type `y` to proceed).*

#### Solution B: USB Cable / ADB Reverse (100% Reliable, Fastest Performance)
If you have a USB cable connected to your Android phone with **USB Debugging** enabled:
```bash
# 1. Forward port 8081 from phone to your computer
adb reverse tcp:8081 tcp:8081

# 2. Start Expo bound to localhost
npx expo start --localhost -c
```
On your phone in Expo Go:
- Tap **Enter URL manually**.
- Enter: `exp://localhost:8081`

---

### 2. Stuck at "Bundling 99%" or Freezes on App Launch Screen

#### Why it happens:
- **Expo Go vs Native Modules**: OdinEye contains custom native Kotlin code (`OdinEyeVoiceModule`, `OdinEyeNotificationModule`, `OdinEyeWidgetModule`, and `react-native-health-connect`). Standard Expo Go **does not include these native libraries**. If Expo Go tries to initialize an unavailable native binary, it can hang or throw an unhandled fatal error before the root view paints.
- **Corrupted Babel/Metro Cache**: Stale AST cache files can stall the packager during code serialization.

#### Solution:
1. **Check for Unhandled JavaScript Errors**:
   Look at your Metro terminal window where `npx expo start` is running. Scroll up to inspect if an error redbox was logged (e.g. `TypeError: Cannot read property ... of null`).
2. **Access the In-App Developer Menu**:
   Shake your physical phone, or run:
   ```bash
   adb shell input keyevent 82
   ```
   Select **Reload** or tap **Show LogBox** to read the exact stack trace.
3. **Run the Standalone Native Development Build**:
   For complete native module support, compile and run the native build directly onto your phone:
   ```bash
   npx expo run:android
   ```

---

### 3. Port 8081 Conflict (`EADDRINUSE`)

#### Why it happens:
A previously terminated Metro bundler session, Docker container, or Node process did not release port 8081.

#### Solution:
Find and terminate the process holding the port:
```bash
# Find the process ID (PID)
lsof -i :8081

# Kill the process (replace <PID> with the actual number)
kill -9 <PID>
```

Or launch Metro on an alternate port:
```bash
npx expo start --port 8082 -c
```

---

### 4. Phone App Storage Is Corrupted (Clearing Android App Cache)

If your computer says `Android Bundled 100% (853 modules)` successfully, but your phone screen remains permanently white or displays a spinning loading wheel:

1. On your Android phone, go to **Settings → Apps → All Apps**.
2. Select **Expo Go** (or **OdinEye** if using a custom build).
3. Tap **Storage & cache**.
4. Tap **Clear Cache**, then tap **Clear Storage** (or **Clear Data**).
5. Tap **Force Stop**.
6. Re-open the app on your phone and re-scan the QR code.

---

### 5. Nuclear Reset: Clean Environment Rebuild

If issues persist across multiple attempts, perform a clean dependency and cache purge:

```bash
# 1. Stop all Node processes
killall -9 node 2>/dev/null || true

# 2. Remove all Metro, Watchman, and Expo cache directories
rm -rf .expo
rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-*
watchman watch-del-all 2>/dev/null || true

# 3. Clean and verify JavaScript compilation
npx tsc --noEmit

# 4. Verify Metro can bundle standalone without hanging
EXPO_NO_TELEMETRY=1 npx expo export --platform android --no-bytecode

# 5. Start Expo with cleared cache
npx expo start --clear
```

---

## 📱 Quick Reference: Developer Menu Shortcuts

When your phone is connected via USB:

| Action | Terminal Command |
|:---|:---|
| **Open In-App Dev Menu** | `adb shell input keyevent 82` |
| **Force Reload App** | `adb shell input text "rr"` (or press `r` in Metro terminal) |
| **Forward Metro Port** | `adb reverse tcp:8081 tcp:8081` |
| **Inspect Device Logcat** | `adb logcat *:E \| grep -E "ReactNative\|OdinEye\|Expo"` |
