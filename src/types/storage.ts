// Canonical Storage & User Preferences Types

export interface SavedCredentials {
  hevyApiKey: string;
  ultrahumanToken: string;
  fitbitToken: string;
  healthConnectEnabled: boolean;
  enabledSources?: {
    ultrahuman: boolean;
    fitbit: boolean;
    hevy: boolean;
  };
  healthConnectPermissionsGranted?: boolean;
  healthConnectPromptDismissed?: boolean;
  geminiApiKey?: string;
  aiProvider?: 'gemini_nano' | 'ondevice' | 'gemini';
  aiEnabled?: boolean;
  bodyAnalysisEnabled?: boolean;
  mindfulnessEnabled?: boolean;
  dailyMindfulnessGoal?: number;
  mindfulnessAmbientSound?: string;
  mindfulnessVolume?: number;
  todayMood?: string;
  lastSyncTime?: string;
  hasCompletedOnboarding?: boolean;
  dailyStepsGoal?: number;
  dailyCaloriesGoal?: number;
  targetSleepDurationHours?: number;
  hapticBreathPacingEnabled?: boolean;
}

export interface SecurityVaultStatus {
  isEncrypted: boolean;
  storageEngine: string;
  cipher: string;
  mac: string;
  keyDerivation: string;
  sandboxLevel: string;
  lastEncryptedAt: string;
  isSelfTestPassing: boolean;
  isHardwareKeystore: boolean;
}

export interface EncryptedPayload {
  v: number;              // Vault format version
  algo: string;           // Encryption algorithm
  kdf: string;            // Key derivation function
  iterations: number;     // PBKDF2 iteration count
  salt: string;           // Hex salt for PBKDF2 key derivation
  iv: string;             // Hex initialization vector (unique per encryption)
  ciphertext: string;     // Base64 encrypted data
  mac: string;            // Hex HMAC-SHA256 authentication tag (Encrypt-then-MAC)
  timestamp: string;      // ISO timestamp of encryption
}

