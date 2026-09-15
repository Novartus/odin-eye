# OdinEye — Google Play Console Submission & Data Safety Guide

This document provides exact responses and declarations required for publishing **OdinEye** (`com.odineye.health`) to the **Google Play Developer Console**.

---

## 1. App Access & Store Listing Details

- **App Name:** OdinEye
- **Short Description:** Scandinavian bento health hub for recovery, rings, sleep & mindfulness.
- **Full Description:** OdinEye brings your health ecosystem into harmony with a local-first, zero-knowledge architecture. Track recovery, sleep stages, heart rate variability, workouts, and medication routines with hardware-level privacy.
- **Privacy Policy URL:** `https://github.com/Novartus/odin-eye/tree/main/docs`
- **App Category:** Health & Fitness
- **Tags:** Health, Fitness, Sleep Tracker, Heart Rate, Meditation

---

## 2. Google Play Data Safety Questionnaire Answers

### Section A: Data Collection and Security
| Question | Answer | Rationale |
|:---|:---|:---|
| **Does your app collect or share any user data?** | **Yes** | The app accesses Health & Fitness data on the device. |
| **Is all user data collected by your app encrypted in transit?** | **Yes** | All network traffic uses HTTPS / TLS 1.3 (e.g., direct wearable API synchronization). |
| **Do you provide a way for users to request that their data be deleted?** | **Yes** | The app includes an in-app "Wipe Vault & Delete Keys" function under Settings that immediately purges all data. |

---

### Section B: Data Types (Health and Fitness)
| Data Type | Collected? | Shared? | Processed Ephemerally? | Required or Optional? | Purpose |
|:---|:---|:---|:---|:---|:---|
| **Health info** (e.g. sleep records, heart rate, vitals) | **Yes** | **No** (Never shared with 3rd parties) | Stored locally on device in encrypted sandbox | **Optional** (User grants Health Connect or enters API tokens) | **App Functionality / Personalization** |
| **Fitness info** (e.g. exercise, steps, active calories) | **Yes** | **No** | Stored locally on device in encrypted sandbox | **Optional** | **App Functionality / Analytics (On-device)** |

> **IMPORTANT DECLARATION NOTE:**  
> Under Google Play policies, because OdinEye does not transmit biometric records to any cloud server, all health data is retained **only on the user's local device**. Data is never shared with third parties, brokers, or advertisers.

---

## 3. Health Connect Policy Declaration (Declaration Form)

When declaring Health Connect permissions in Google Play Console:

### Permitted Use Case
- **Category:** Health and fitness management
- **Description:** OdinEye reads health telemetry (sleep sessions, heart rate, steps, calories, distance) to aggregate user vitals into a consolidated Scandinavian bento recovery dashboard and provide personalized wellness insights.
- **Limited Use Policy Adherence:**
  - Affirm that Health Connect data is accessed **strictly read-only**.
  - Affirm that Health Connect data is **NEVER sold or shared** with advertisers or third parties.
  - Affirm that Health Connect data is **NEVER used for creditworthiness evaluation**.
  - Affirm that health data is **NEVER viewed by humans**.

---

## 4. `SCHEDULE_EXACT_ALARM` Permission Declaration

Google Play requires a justification for apps declaring `SCHEDULE_EXACT_ALARM`:

- **Use Case:** **Medication Reminders (Calendar / Time-Critical Alarms)**
- **Justification Statement for Reviewers:**
  > *"OdinEye includes a critical Medication & Supplement Reminder module. Users schedule exact dose times (e.g., 8:00 AM, 1:00 PM, 8:00 PM) for prescription medications that must be administered on a strict, timely schedule. The `SCHEDULE_EXACT_ALARM` permission is required to ensure that high-priority notification alarms fire at the precise minute scheduled by the user, even when the Android device has entered battery-saving Doze mode or when the application is completely closed."*

---

## 5. Medical Apps Policy & Content Rating

- **Is your app a medical device?** **No**
- **Does your app diagnose, cure, mitigate, or treat diseases?** **No**
- **Disclaimers Included:** Yes, in onboarding, settings, and public documentation, OdinEye clearly disclaims clinical utility and advises users to consult medical professionals.
- **Target Audience:** General Public (Ages 18+)
- **Ads:** No ads (`android.permission.INTERNET` is used solely for direct client-to-API requests).
