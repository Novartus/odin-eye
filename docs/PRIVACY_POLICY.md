# OdinEye — Privacy Policy

**Effective Date:** September 13, 2026  
**Last Updated:** September 13, 2026  
**Application Name:** OdinEye  
**Package Identifier:** `com.odineye.health`  
**Publisher:** OdinEye Health  
**Contact:** `N/A`  

---

## 1. Introduction & Core Philosophy

Welcome to **OdinEye** ("we", "our", or "the Application"). Your personal health, biometric telemetry, medication schedules, and mindfulness data are among the most sensitive personal records you own. 

OdinEye is engineered from the ground up on a **Local-First, Zero-Knowledge Privacy Architecture**. This means:
- **No Developer Servers:** We do not operate, host, or maintain centralized cloud servers, user databases, tracking pixels, or data collection backends.
- **Hardware-Isolated Storage:** All telemetry, credentials, medication logs, and mindfulness records are encrypted and stored solely on your Android device inside hardware-backed secure storage.
- **Zero Monetization of Personal Data:** We do not sell, rent, broker, trade, or monetize your health information under any circumstances.

This Privacy Policy explains what data we access, how it is processed, how it is protected, and how you retain total control over your health information in compliance with the **Google Play Developer Program Policies (including the Health Connect Policy)**, the **General Data Protection Regulation (GDPR)**, and the **California Consumer Privacy Act (CCPA/CPRA)**.

---

## 2. Information We Access and How It Is Handled

### 2.1 Android Health Connect Permissions (Read-Only)
With your explicit, granular permission via Android Health Connect, OdinEye reads the following biometric and activity data types to synthesize your daily recovery score, activity pillars, and sleep telemetry:

| Data Type | Android Permission | Purpose in OdinEye |
|:----------|:-------------------|:-------------------|
| **Sleep Telemetry** | `android.permission.health.READ_SLEEP` | Visualizing sleep duration, sleep stages, and computing restorative sleep scores. |
| **Heart Rate** | `android.permission.health.READ_HEART_RATE` | Real-time cardiovascular tracking, resting heart rate analysis, and cardio zones. |
| **Resting Heart Rate** | `android.permission.health.READ_RESTING_HEART_RATE` | Establishing physiological recovery baselines and autonomic nervous system readiness. |
| **Heart Rate Variability (HRV)** | `android.permission.health.READ_HEART_RATE_VARIABILITY` | Calculating hypertrophy readiness, recovery equilibrium, and pacing guidance. |
| **Exercise & Workouts** | `android.permission.health.READ_EXERCISE` | Correlating training exertion with muscle group fatigue and rest timers. |
| **Active Energy Burned** | `android.permission.health.READ_ACTIVE_CALORIES_BURNED` | Tracking active movement calories toward your daily target. |
| **Total Energy Burned** | `android.permission.health.READ_TOTAL_CALORIES_BURNED` | Metabolic rate calculations and daily energy expenditure equilibrium. |
| **Steps** | `android.permission.health.READ_STEPS` | Daily step progress tracking, cadence evaluation, and movement goals. |
| **Distance** | `android.permission.health.READ_DISTANCE` | Daily and weekly movement volume analysis. |
| **Skin Temperature** | `android.permission.health.READ_SKIN_TEMPERATURE` | Detecting temperature deviations associated with illness, fatigue, or recovery strain. |
| **Oxygen Saturation (SpO2)** | `android.permission.health.READ_OXYGEN_SATURATION` | Monitoring nocturnal respiratory and hypoxic recovery indices. |
| **Respiratory Rate** | `android.permission.health.READ_RESPIRATORY_RATE` | Baseline respiration tracking and breathing rhythm alignment. |

> **IMPORTANT:** OdinEye accesses Android Health Connect **strictly in read-only mode**. The Application never writes, alters, modifies, or deletes records in your Health Connect store.

---

### 2.2 Wearable & Fitness Third-Party API Integrations
If you choose to synchronize third-party fitness devices, OdinEye connects directly from your device via HTTPS to the respective third-party service using API credentials that you provide:
- **Ultrahuman Ring AIR API** (`api.ultrahuman.com`): Retrieves ring recovery, sleep index, skin temperature, and motion telemetry using your personal API token.
- **Fitbit Web API** (`api.fitbit.com`): Retrieves cardiovascular, sleep, and active zone minutes using an OAuth access token.
- **Hevy Strength App API** (`api.hevyapp.com`): Retrieves strength training sessions, set volumes, and targeted muscle workloads using your personal API key.

All third-party tokens are stored exclusively inside OdinEye’s AES-256 encrypted on-device vault. No tokens or telemetry are ever routed through or logged by any intermediary server operated by OdinEye.

---

### 2.3 User-Inputted Health Information
You may voluntarily log information directly within the Application:
- **Medication Routines:** Medication names, dosage amounts, scheduled reminder times, administration forms (tablet, capsule, drops), and dose confirmation logs.
- **Mindfulness & Breathing Sessions:** Completed breathing exercise timestamps, duration in seconds, technique IDs, and self-reported mood check-ins (Unhappy, Sad, Normal, Good, Happy).
- **Personal Targets:** Custom daily steps goal, active calories goal, and daily mindful minutes goal.

All user-inputted records reside strictly in your device's isolated local storage sandbox.

---

### 2.4 Device & System Permissions
OdinEye requests the following standard Android OS permissions to deliver core functionality:
- `POST_NOTIFICATIONS`: To deliver scheduled medication reminders and optional wellness alerts.
- `SCHEDULE_EXACT_ALARM`: To ensure medication reminders fire at precise, scheduled intervals even when the device is in low-power Doze mode.
- `VIBRATE`: To provide gentle haptic cadence during breathing phases (inhale/hold/exhale) and alert cues for medication reminders.

---

## 3. Google Play Health Connect Policy & Limited Use Disclosure

OdinEye strictly complies with the **Google Play Health Connect Developer Policy**, including the **Limited Use Requirements**:

1. **Specific Permitted Use Only:** The use of information received from Health Connect adheres to the Health Connect Permissions Policy. Health Connect data is accessed solely to provide user-facing wellness, fitness, and recovery features visible directly inside the OdinEye user interface.
2. **No Commercial Sale or Transfer:** We **NEVER** sell, rent, lease, trade, or transfer Health Connect data to any third party, data broker, advertising exchange, or data aggregator.
3. **No Advertising or Marketing:** Health Connect data is **NEVER** used or disclosed for advertising, retargeting, promotional communications, profiling, or interest-based marketing.
4. **No Creditworthiness or Lending Evaluation:** Health Connect data is **NEVER** used to assess, determine, or evaluate creditworthiness, consumer credit eligibility, or lending terms.
5. **Prohibition of Human Access:** No human is permitted to view or read your Health Connect data, except:
   - With your explicit, affirmative consent for troubleshooting specific technical issues you report;
   - Where required by applicable law or enforceable governmental request; or
   - Where the data is aggregated and completely de-identified.
6. **No Secondary Processing:** Your health data is processed solely for the real-time presentation and synthesis of your wellness metrics within the Application on your device.

---

## 4. Artificial Intelligence & Telemetry Processing Disclosures

OdinEye features an intelligent health coach designed to summarize health telemetry into actionable recovery advice:

### 4.1 On-Device AI (Android AICore / Gemini Nano) — Primary Engine
Whenever supported by your Android hardware (e.g., Google Pixel and compatible Android 14+ devices), OdinEye uses **Google Android AICore (`com.google.android.aicore`)** to run **Gemini Nano** directly on your device’s Neural Processing Unit (NPU) or GPU:
- **100% On-Device:** Biometrics and prompts never leave your device.
- **Zero Cloud Leak:** AI inference is performed locally without internet connectivity.

### 4.2 Offline Sports Science Engine — Secondary Local Engine
If on-device Gemini Nano is not available, OdinEye executes an integrated, deterministic sports science rule engine (`sportsScienceKnowledge.ts`) stored directly inside the app package. This runs completely offline with zero network requests.

### 4.3 Cloud Gemini API Fallback — Optional & User-Controlled
If you choose to enable Cloud AI coaching on devices that lack Gemini Nano hardware, you must explicitly input your personal Google Gemini API key in **Config → Category 01**. In this scenario:
- Telemetry summaries are transmitted securely via encrypted HTTPS directly from your phone to Google AI Studio APIs (`generativelanguage.googleapis.com`).
- Transmissions are governed by Google's API Terms of Service.
- You can disable all AI capabilities at any time via the master toggle in **Config**, instantly halting all AI processing.

---

## 5. Data Storage, Cryptography & Security Architecture

We apply defense-in-depth cryptographic security to safeguard your data at rest:
- **Cipher Suite:** Advanced Encryption Standard with 256-bit keys in Cipher Block Chaining mode (**AES-256-CBC**) with PKCS#7 padding.
- **Key Derivation:** Password-Based Key Derivation Function 2 (**PBKDF2**) with **10,000 iterations**, HMAC-SHA256, and cryptographically random salts.
- **Message Integrity:** **HMAC-SHA256** authentication tags to detect any unauthorized tampering.
- **Hardware Keystore Integration:** Master cryptographic secrets are secured within the Android Hardware-Backed Keystore via `expo-secure-store`.
- **Zero Plaintext Storage:** API tokens, credentials, and health records are never stored in unencrypted plaintext on your device.

---

## 6. Data Retention & Unilateral User Data Deletion

In full compliance with **Google Play’s Account & Data Deletion Policy**:

### 6.1 Retention Period
Because OdinEye does not transmit your data to any remote servers, data persists **only on your device** for as long as the application remains installed, or until you explicitly delete it.

### 6.2 How to Delete All Data (In-App Data Deletion)
You have total, permanent control to delete all data at any moment without needing to contact support:
1. Open OdinEye.
2. Tap the **Config** (Settings) tab in the bottom navigation bar.
3. Scroll down to **Category 04: Hardware Security & Vault Audit**.
4. Tap **Wipe Vault & Delete Keys**.

**What Happens Immediately Upon Wiping:**
- All encrypted wearable API tokens (Ultrahuman, Fitbit, Hevy, Gemini) are permanently deleted from the secure vault.
- All medication schedules, logs, and reminder alarms are purged.
- All mindfulness session logs, mood records, and streak histories are deleted from `expo-secure-store`.
- Local telemetry caches and Health Connect memory buffers are cleared.
- No residual data remains on your device.

*(Alternatively, clearing the Application Storage via Android Settings → Apps → OdinEye → Storage → Clear Data, or uninstalling the app, immediately deletes all sandboxed databases and encrypted keys.)*

---

## 7. Legal Bases for Processing (GDPR / UK GDPR Compliance)

For individuals located in the European Economic Area (EEA) or the United Kingdom, we process personal data under the following legal bases pursuant to Article 6 and Article 9 of the EU General Data Protection Regulation (GDPR):
- **Explicit Consent (Article 6(1)(a) and Article 9(2)(a)):** You provide explicit consent when granting Health Connect permissions in the Android OS dialog, when entering medication schedules, and when inputting third-party wearable API credentials. You may revoke consent at any time by revoking permissions in Android Health Connect settings or wiping the vault in Config.
- **Contractual Necessity (Article 6(1)(b)):** Processing is necessary to deliver the core functional features of the Application requested by you (e.g., displaying fitness telemetry, computing streaks, and firing dose alarms).

### Your GDPR Rights
Under the GDPR, you have the right to:
- **Access** all personal data held about you (visible directly in the app’s dashboards).
- **Rectify** inaccurate information (editable anytime in Config and Meds).
- **Erase** all data (**Right to be Forgotten**) via the in-app "Wipe Vault & Delete Keys" button.
- **Restrict or Object** to processing by disabling specific modules in Config.
- **Data Portability:** Your data is stored locally on your device and can be audited via Android's local file management.
- **Lodge a Complaint:** You have the right to lodge a complaint with your local Data Protection Supervisory Authority.

---

## 8. California Consumer Privacy Act (CCPA / CPRA) Compliance

If you are a California resident, the California Consumer Privacy Act (as amended by the California Privacy Rights Act) provides you with specific rights:
- **We Do Not Sell or Share Your Personal Information:** OdinEye does not sell, share, or disclose personal or sensitive health information for monetary or other valuable consideration, nor for cross-context behavioral advertising.
- **Right to Know:** You can inspect all data collected via the in-app interfaces.
- **Right to Delete:** You can delete all personal data at any time via **Config → Wipe Vault & Delete Keys**.
- **Right to Non-Discrimination:** We will never discriminate against you for exercising your privacy rights.

---

## 9. Children’s Privacy (COPPA Compliance)

OdinEye is not intended for, marketed to, or directed at children under the age of 13 (or under 16 in the EEA/UK). We do not knowingly collect, request, or maintain personal information from children. If we become aware that a child has provided personal information, we will take immediate steps to delete such data from our local application sandboxes.

---

## 10. Medical & Health Advice Disclaimer

**ODINEYE DOES NOT PROVIDE MEDICAL ADVICE.**  
The Application, its telemetry synthesis, recovery scores, mindfulness guidance, and AI coaching insights are provided strictly for **general fitness, educational, and wellness purposes only**. 

- OdinEye is **NOT** a certified medical device and is **NOT** evaluated, cleared, or approved by the U.S. Food and Drug Administration (FDA), European Medicines Agency (EMA), or any other regulatory health authority.
- The Application is **NOT** intended to diagnose, treat, mitigate, monitor, cure, or prevent any disease, illness, condition, or physiological disorder.
- Never disregard, delay, or substitute professional medical advice, diagnosis, or treatment because of information displayed in OdinEye.
- Always consult a qualified physician or healthcare professional regarding any medication schedule or health regimen.

---

## 11. Third-Party Services & Links

The Application may interact with third-party APIs as described in Section 2. We encourage you to review the privacy policies of any third-party services you connect:
- [Google Privacy Policy](https://policies.google.com/privacy) (Health Connect & Gemini APIs)
- [Ultrahuman Privacy Policy](https://www.ultrahuman.com/privacy-policy/)
- [Fitbit Privacy Policy](https://www.fitbit.com/global/us/legal/privacy-policy)
- [Hevy App Privacy Policy](https://www.hevyapp.com/privacy-policy/)

We are not responsible for the privacy practices, terms, or content of third-party platforms.

---

## 12. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect modifications in legal requirements, operating system changes, or application capabilities. When updates are published, the **Last Updated** date at the top of this policy will be revised. Any updated policy will be made available directly within the Application repository and in-app settings. Continued use of the Application after an update constitutes acceptance of the revised terms.

---

## 13. Contact & Inquiries

If you have questions, concerns, or requests regarding this Privacy Policy or our data handling practices, please contact us:

- **Entity:** OdinEye Health
- **Email:** `N/A`
- **Application Package:** `com.odineye.health`
- **Official Documentation:** [https://github.com/Novartus/odin-eye](https://github.com/Novartus/odin-eye)
