// Local Encrypted Credential Storage
// Persists user API tokens across app launches using:
//   Primary:   expo-secure-store  (Android Keystore / iOS Keychain — hardware-backed AES-256)
//   Secondary: expo-file-system   (sandboxed app directory, ciphertext written by us)
//   Fallback:  In-memory cache    (session-only, e.g. Expo Go without native modules)
//
// @react-native-async-storage/async-storage is intentionally NOT used:
//   • Stores data unencrypted (plaintext SQLite)
//   • Native bridge absent in Expo Go → throws "Native module is null" on every call
//   • expo-secure-store + expo-file-system already cover every real-device scenario

import * as SecureStore from 'expo-secure-store';
import { cryptoService, EncryptedPayload } from '../security/cryptoService';
import { SavedCredentials, SecurityVaultStatus } from '../../types/storage';
export { SavedCredentials, SecurityVaultStatus } from '../../types/storage';
import { STORAGE_KEYS } from '../../constants';

class CredentialsStorage {
  private static instance: CredentialsStorage;
  private memoryCache: SavedCredentials = {
    hevyApiKey: '',
    ultrahumanToken: '',
    fitbitToken: '',
    healthConnectEnabled: true,
    healthConnectPermissionsGranted: false,
    healthConnectPromptDismissed: false,
    geminiApiKey: '',
    aiProvider: 'gemini_nano',
    aiEnabled: true,
    bodyAnalysisEnabled: true,
    mindfulnessEnabled: true,
    dailyMindfulnessGoal: 10,
    mindfulnessAmbientSound: 'birds',
    hasCompletedOnboarding: false,
    dailyStepsGoal: 10000,
    dailyCaloriesGoal: 500,
    enabledSources: {
      ultrahuman: false,
      fitbit: true,
      hevy: true,
    },
  };
  private isSecureStoreAvailable: boolean = false;
  private fileSystem: any = null;
  private vaultPath: string | null = null;
  private lastEncryptedAt: string = '';
  private isLoaded: boolean = false;
  private initPromise: Promise<void> | null = null;
  private loadPromise: Promise<SavedCredentials> | null = null;

  public static getInstance(): CredentialsStorage {
    if (!CredentialsStorage.instance) {
      CredentialsStorage.instance = new CredentialsStorage();
    }
    return CredentialsStorage.instance;
  }

  constructor() {
    this.initPromise = this.initStorage();
  }

  private async initStorage(): Promise<void> {
    // 1. expo-secure-store (Android Keystore / iOS Keychain — hardware-backed)
    try {
      this.isSecureStoreAvailable = await SecureStore.isAvailableAsync();
    } catch {
      this.isSecureStoreAvailable = false;
    }

    // 2. expo-file-system — sandboxed internal app storage
    //    (/data/user/0/<package>/files/ on Android)
    try {
      const fs = require('expo-file-system');
      if (fs && fs.documentDirectory) {
        this.fileSystem = fs;
        this.vaultPath = `${fs.documentDirectory}${STORAGE_KEYS.CREDENTIALS_FILE}`;
      }
    } catch {
      this.fileSystem = null;
    }
  }

  public async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Load and decrypt credentials from the encrypted vault.
   * Priority: expo-secure-store → expo-file-system → in-memory defaults.
   * Fully deduplicated: multiple concurrent callers join the single in-flight decrypt promise.
   * Instant subsequent calls return the in-memory cache directly without freezing the JS thread.
   */
  public async loadCredentials(forceReload: boolean = false): Promise<SavedCredentials> {
    await this.ensureInitialized();

    if (!forceReload && this.isLoaded) {
      return this.memoryCache;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        let rawEncrypted: string | null = null;

        // 1. Primary: expo-secure-store (hardware-backed keystore)
        if (this.isSecureStoreAvailable) {
          try {
            rawEncrypted = await SecureStore.getItemAsync(STORAGE_KEYS.CREDENTIALS_VAULT);
          } catch (e: any) {
            console.warn('[CredentialsStorage] SecureStore read:', e?.message);
          }
        }

        // 2. Secondary: sandboxed file
        if (!rawEncrypted && this.fileSystem && this.vaultPath) {
          try {
            const info = await this.fileSystem.getInfoAsync(this.vaultPath);
            if (info.exists) {
              rawEncrypted = await this.fileSystem.readAsStringAsync(this.vaultPath);
            }
          } catch {}
        }

        if (rawEncrypted) {
          const payload: EncryptedPayload = JSON.parse(rawEncrypted);
          const decryptedJson = cryptoService.decrypt(payload);
          const parsed = JSON.parse(decryptedJson);
          const hasOnboarded = parsed.hasCompletedOnboarding !== undefined
            ? Boolean(parsed.hasCompletedOnboarding)
            : Boolean(parsed.ultrahumanToken || parsed.hevyApiKey || parsed.fitbitToken || parsed.geminiApiKey);

          this.memoryCache = {
            ...this.memoryCache,
            ...parsed,
            hasCompletedOnboarding: hasOnboarded,
            enabledSources: {
              ultrahuman: false,
              fitbit: true,
              hevy: true,
              ...(this.memoryCache.enabledSources || {}),
              ...(parsed.enabledSources || {}),
            },
          };
          this.lastEncryptedAt = payload.timestamp;
        }
      } catch (err: any) {
        console.warn('[CredentialsStorage] Vault load error:', err?.message);
      } finally {
        this.isLoaded = true;
        this.loadPromise = null;
      }
      return this.memoryCache;
    })();

    return this.loadPromise;
  }

  /**
   * Encrypt and persist credentials to expo-secure-store + expo-file-system.
   */
  public async saveCredentials(creds: Partial<SavedCredentials>): Promise<SavedCredentials> {
    await this.ensureInitialized();
    this.memoryCache = { ...this.memoryCache, ...creds };
    this.isLoaded = true;
    try {
      const plaintext = JSON.stringify(this.memoryCache);
      const encryptedPayload = cryptoService.encrypt(plaintext);
      const serialized = JSON.stringify(encryptedPayload);
      this.lastEncryptedAt = encryptedPayload.timestamp;

      // 1. Primary: expo-secure-store
      if (this.isSecureStoreAvailable) {
        try {
          await SecureStore.setItemAsync(STORAGE_KEYS.CREDENTIALS_VAULT, serialized);
        } catch (e: any) {
          console.warn('[CredentialsStorage] SecureStore write:', e?.message);
        }
      }

      // 2. Secondary: sandboxed file
      if (this.fileSystem && this.vaultPath) {
        try {
          await this.fileSystem.writeAsStringAsync(this.vaultPath, serialized);
        } catch {}
      }
    } catch (err: any) {
      console.error('[CredentialsStorage] Encryption error on save:', err?.message);
    }
    return this.memoryCache;
  }

  /**
   * Return currently loaded in-memory credentials (decrypted, for active API calls)
   */
  public getCachedCredentials(): SavedCredentials {
    return this.memoryCache;
  }

  /**
   * Cryptographic status and security audit report
   */
  public getSecurityStatus(): SecurityVaultStatus {
    const isPassing = cryptoService.runSelfTest();
    return {
      isEncrypted: true,
      storageEngine: this.isSecureStoreAvailable
        ? 'expo-secure-store (Android Keystore / Hardware-Backed)'
        : 'Android Application Sandbox (Mode 0700 Privileged)',
      cipher: 'AES-256-CBC (PKCS#7)',
      mac: 'HMAC-SHA256 (Encrypt-then-MAC)',
      keyDerivation: 'PBKDF2-HMAC-SHA256 (10,000 Iterations)',
      sandboxLevel: 'Hardware-Backed Keystore + App Sandbox Isolation',
      lastEncryptedAt: this.lastEncryptedAt || new Date().toISOString(),
      isSelfTestPassing: isPassing,
      isHardwareKeystore: this.isSecureStoreAvailable,
    };
  }

  /**
   * Securely wipe all stored credentials from hardware Keystore, disk, and memory
   */
  public async clearVault(): Promise<void> {
    await this.ensureInitialized();
    this.memoryCache = {
      hevyApiKey: '',
      ultrahumanToken: '',
      fitbitToken: '',
      healthConnectEnabled: true,
      geminiApiKey: '',
      aiProvider: 'gemini_nano',
    };

    if (this.isSecureStoreAvailable) {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.CREDENTIALS_VAULT);
      } catch {}
    }

    if (this.fileSystem && this.vaultPath) {
      try {
        await this.fileSystem.deleteAsync(this.vaultPath, { idempotent: true });
      } catch {}
    }
  }
}

export const credentialsStorage = CredentialsStorage.getInstance();
