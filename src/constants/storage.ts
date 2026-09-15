/**
 * Storage Keys Registry
 * Centralized key registry for all persistent local storage (SecureStore, FileSystem, SharedPreferences).
 * Values must remain invariant to guarantee backward compatibility with persisted device data.
 */

export const STORAGE_KEYS = {
  // Medication tracking & scheduling
  MEDICATIONS: 'odineye_medications_data_v2',
  MEDICATIONS_FILE_BACKUP: 'odineye_medications_backup.json',

  // Sleep architecture & rolling history
  SLEEP_HISTORY: 'odineye_sleep_history_v1',

  // Mindfulness sessions & streak logs
  MINDFULNESS: 'odineye_mindfulness_logs_v1',

  // Hardware-encrypted credential vault
  CREDENTIALS_VAULT: 'odineye_secure_vault',
  CREDENTIALS_FILE: 'odineye_secure_vault.enc',

  // Developer mode & onboarding flags
  DEV_BANNER_DISMISSED: 'dev_banner_dismissed_v1',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
