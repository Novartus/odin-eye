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
  openaiApiKey?: string;
  aiProvider?: 'gemini_nano' | 'ondevice' | 'gemini' | 'openai';
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
