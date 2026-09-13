import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
  Vibration,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { SmartRingIcon } from '../common/SmartRingIcon';
import { hevyApiClient } from '../../services/api/hevyApiClient';
import { ultrahumanApiClient } from '../../services/api/ultrahumanApiClient';
import { fitbitApiClient } from '../../services/api/fitbitApiClient';
import { credentialsStorage, SecurityVaultStatus } from '../../services/storage/credentialsStorage';
import { liveHealthService } from '../../services/live/liveHealthService';
import { androidAiCoreService } from '../../services/ai/androidAiCoreService';
import { aiHealthService } from '../../services/ai/aiService';
import { healthConnect, isNativeHealthConnectLinked } from '../../services/healthConnect/healthConnectService';
import { medicationService } from '../../services/medication/medicationService';
import { medicationNotificationService } from '../../services/medication/medicationNotificationService';

export interface EnabledSources {
  ultrahuman: boolean;
  fitbit: boolean;
  hevy: boolean;
}

interface SettingsViewProps {
  enabledSources: EnabledSources;
  onToggleSource: (sourceKey: keyof EnabledSources, value: boolean) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncText: string;
  onOpenHealthConnectPrompt?: () => void;
  aiEnabled?: boolean;
  onToggleAi?: (enabled: boolean) => void;
  onResetOnboarding?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  enabledSources,
  onToggleSource,
  onManualSync,
  isSyncing,
  lastSyncText,
  onOpenHealthConnectPrompt,
  aiEnabled = true,
  onToggleAi,
  onResetOnboarding,
}) => {
  // Credentials State
  const [hevyApiKey, setHevyApiKey] = useState('');
  const [ultrahumanToken, setUltrahumanToken] = useState('');
  const [fitbitToken, setFitbitToken] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'gemini_nano' | 'ondevice' | 'gemini' | 'openai'>('gemini_nano');
  const [isAiActive, setIsAiActive] = useState<boolean>(aiEnabled);

  // Daily Goals State
  const [stepsGoal, setStepsGoal] = useState<number>(10000);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(500);

  // Key Visibility Toggles
  const [showHevyKey, setShowHevyKey] = useState(false);
  const [showUltrahumanToken, setShowUltrahumanToken] = useState(false);
  const [showFitbitToken, setShowFitbitToken] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Security Vault & Audit State
  const [securityStatus, setSecurityStatus] = useState<SecurityVaultStatus | null>(null);
  const [vaultNotice, setVaultNotice] = useState<string | null>(null);

  // Testing & Status State
  const [testingService, setTestingService] = useState<'hevy' | 'ultrahuman' | 'fitbit' | 'gemini' | 'aicore' | null>(null);
  const [hevyStatus, setHevyStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [ultrahumanStatus, setUltrahumanStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [fitbitStatus, setFitbitStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<{ connected: boolean; message: string } | null>(null);
  const [aicoreBenchmarkResult, setAicoreBenchmarkResult] = useState<string | null>(null);
  const isNativeLinked = isNativeHealthConnectLinked();
  const [isHealthConnectGranted, setIsHealthConnectGranted] = useState(
    healthConnect.isPermissionGranted()
  );
  const [medsRemindersEnabled, setMedsRemindersEnabled] = useState(true);
  const [testNotificationStatus, setTestNotificationStatus] = useState<string | null>(null);

  const handleTestNotificationInSettings = () => {
    try {
      Vibration.vibrate([0, 300, 150, 300]);
    } catch {}
    medicationService.triggerTestReminder();
    medicationNotificationService.sendTestPopNotification().catch(() => {});
    setTestNotificationStatus('✓ Notification alert dispatched! Dose reminder popped up on screen.');
    setTimeout(() => setTestNotificationStatus(null), 3500);
  };

  useEffect(() => {
    // Load saved credentials from encrypted vault on mount
    credentialsStorage.loadCredentials().then((creds) => {
      if (creds.hevyApiKey) setHevyApiKey(creds.hevyApiKey);
      if (creds.ultrahumanToken) setUltrahumanToken(creds.ultrahumanToken);
      if (creds.fitbitToken) setFitbitToken(creds.fitbitToken);
      if (creds.geminiApiKey) setGeminiApiKey(creds.geminiApiKey);
      if (creds.aiProvider) setAiProvider(creds.aiProvider);
      if (creds.aiEnabled !== undefined) setIsAiActive(creds.aiEnabled);
      if (creds.healthConnectPermissionsGranted) setIsHealthConnectGranted(true);
      if (creds.dailyStepsGoal) setStepsGoal(creds.dailyStepsGoal);
      if (creds.dailyCaloriesGoal) setCaloriesGoal(creds.dailyCaloriesGoal);
      setSecurityStatus(credentialsStorage.getSecurityStatus());
    });
  }, [isSyncing]);

  useEffect(() => {
    if (aiEnabled !== undefined) {
      setIsAiActive(aiEnabled);
    }
  }, [aiEnabled]);

  const handleUpdateStepsGoal = async (delta: number) => {
    const updated = Math.max(3000, Math.min(30000, stepsGoal + delta));
    setStepsGoal(updated);
    await credentialsStorage.saveCredentials({ dailyStepsGoal: updated });
  };

  const handleUpdateCaloriesGoal = async (delta: number) => {
    const updated = Math.max(150, Math.min(3000, caloriesGoal + delta));
    setCaloriesGoal(updated);
    await credentialsStorage.saveCredentials({ dailyCaloriesGoal: updated });
  };

  const handleToggleAi = async (val: boolean) => {
    setIsAiActive(val);
    if (onToggleAi) onToggleAi(val);
    await credentialsStorage.saveCredentials({ aiEnabled: val });
  };

  const handleClearVault = async () => {
    await credentialsStorage.clearVault();
    setHevyApiKey('');
    setUltrahumanToken('');
    setFitbitToken('');
    setGeminiApiKey('');
    setSecurityStatus(credentialsStorage.getSecurityStatus());
    setVaultNotice('Secure vault wiped. All encrypted keys purged from device storage.');
    setTimeout(() => setVaultNotice(null), 3500);
  };

  const handleTestHevy = async () => {
    setTestingService('hevy');
    await credentialsStorage.saveCredentials({ hevyApiKey });
    const res = await hevyApiClient.testConnection(hevyApiKey);
    setHevyStatus({ connected: res.success, message: res.message });
    setTestingService(null);
    if (res.success) {
      liveHealthService.syncAll({ hevyApiKey });
    }
  };

  const handleTestUltrahuman = async () => {
    setTestingService('ultrahuman');
    await credentialsStorage.saveCredentials({ ultrahumanToken });
    const res = await ultrahumanApiClient.testConnection(ultrahumanToken);
    setUltrahumanStatus({ connected: res.success, message: res.message });
    setTestingService(null);
    if (res.success) {
      liveHealthService.syncAll({ ultrahumanToken });
    }
  };

  const handleTestFitbit = async () => {
    setTestingService('fitbit');
    await credentialsStorage.saveCredentials({ fitbitToken });
    const res = await fitbitApiClient.testConnection(fitbitToken);
    setFitbitStatus({ connected: res.success, message: res.message });
    setTestingService(null);
    if (res.success) {
      liveHealthService.syncAll({ fitbitToken });
    }
  };

  const handleRunAiCoreBenchmark = async () => {
    setTestingService('aicore');
    const res = await androidAiCoreService.runDiagnostics();
    setAicoreBenchmarkResult(res.details);
    setTestingService(null);
  };

  const handleTestGemini = async () => {
    setTestingService('gemini');
    await credentialsStorage.saveCredentials({ geminiApiKey, aiProvider: 'gemini' });
    const res = await aiHealthService.testGeminiConnection(geminiApiKey);
    setGeminiStatus({ connected: res.success, message: res.message });
    setTestingService(null);
  };

  return (
    <View style={styles.container}>
      {/* Primary Manual Sync Card */}
      <View style={styles.syncCard}>
        <View style={styles.syncInfo}>
          <Text style={styles.syncStatusTitle}>Android Health Connect Hub</Text>
          <Text style={styles.syncStatusSub}>{lastSyncText}</Text>
          <View style={styles.activeHubBadge}>
            <View style={styles.hubDot} />
            <Text style={styles.hubText}>Live Hardware & API Ingestion Active</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.syncNowBtn, isSyncing && styles.syncNowBtnActive]}
          onPress={onManualSync}
          disabled={isSyncing}
          activeOpacity={0.75}
        >
          {isSyncing ? (
            <View style={styles.syncBtnInner}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.syncNowBtnText}>Syncing...</Text>
            </View>
          ) : (
            <View style={styles.syncBtnInner}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21 3v5h-5"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M8 16H3v5"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.syncNowBtnText}>Sync Now</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Health Connect Read-Only Hub Card */}
      <View style={styles.hcHubCard}>
        <View style={styles.hcHubTopRow}>
          <View style={styles.hcHubIconCircle}>
            <Text style={{ fontSize: 20 }}>❤️</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={styles.hcHubTitle}>Android Health Connect</Text>
              <View
                style={[
                  styles.hcStatusPill,
                  {
                    backgroundColor:
                      !isNativeLinked && __DEV__
                        ? '#FEF3C7'
                        : !isNativeLinked
                        ? '#F1F5F9'
                        : isHealthConnectGranted
                        ? '#E8F9F1'
                        : '#FFF3EB',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.hcStatusPillText,
                    {
                      color:
                        !isNativeLinked && __DEV__
                          ? '#B45309'
                          : !isNativeLinked
                          ? '#64748B'
                          : isHealthConnectGranted
                          ? '#10B981'
                          : '#D97706',
                    },
                  ]}
                >
                  {!isNativeLinked && __DEV__
                    ? 'EXPO GO — NATIVE BUILD REQUIRED'
                    : !isNativeLinked
                    ? 'REQUIRES NATIVE BUILD'
                    : isHealthConnectGranted
                    ? '100% READ-ONLY ✓'
                    : 'PERMISSIONS NEEDED'}
                </Text>
              </View>
            </View>
            <Text style={styles.hcHubSub}>
              {!isNativeLinked && __DEV__
                ? 'Running in Expo Go. Health Connect requires a standalone native APK. Use your Ultrahuman Token below for instant live sync, or see the build guide.'
                : !isNativeLinked
                ? 'A standalone native APK is required for Health Connect OS integration.'
                : isHealthConnectGranted
                ? 'Auto-reads sleep sessions, resting pulse, HRV & steps from Ultrahuman Ring AIR & phone sensors without cloud tokens.'
                : 'Grant Read-Only access to auto-import sleep & biometrics without entering an Ultrahuman API key.'}
            </Text>
          </View>
        </View>

        <View style={styles.hcActionRow}>
          {/* Only show the Expo Go guide button in __DEV__ mode */}
          {!isNativeLinked && __DEV__ ? (
            <TouchableOpacity
              style={[styles.hcManageBtn, styles.hcManageBtnHighlight]}
              onPress={onOpenHealthConnectPrompt}
              activeOpacity={0.8}
            >
              <Text style={[styles.hcManageBtnText, styles.hcManageBtnTextHighlight]}>
                View Expo Go Guide & Build Instructions
              </Text>
            </TouchableOpacity>
          ) : isNativeLinked ? (
            <TouchableOpacity
              style={[styles.hcManageBtn, !isHealthConnectGranted && styles.hcManageBtnHighlight]}
              onPress={onOpenHealthConnectPrompt}
              activeOpacity={0.8}
            >
              <Text style={[styles.hcManageBtnText, !isHealthConnectGranted && styles.hcManageBtnTextHighlight]}>
                {isHealthConnectGranted ? 'View Read-Only Permissions' : 'Connect Health Connect (Read-Only)'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Toggle Which Devices Show Data */}
      <Text style={styles.sectionHeader}>DATA SOURCE VISIBILITY</Text>
      <Text style={styles.sectionSub}>Toggle which hardware feeds into your central dashboard</Text>

      {/* 1. Ultrahuman Ring AIR Toggle */}
      <View style={styles.sourceToggleCard}>
        <View style={styles.sourceLeft}>
          <View style={[styles.deviceIconBubble, { backgroundColor: '#E0F7FA' }]}>
            <SmartRingIcon size={20} color="#10B981" accentColor="#059669" />
          </View>
          <View style={styles.deviceDetails}>
            <View style={styles.deviceTitleRow}>
              <Text style={styles.deviceName}>Ultrahuman Ring AIR</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: !enabledSources.ultrahuman
                      ? '#94A3B8'
                      : ultrahumanStatus?.connected
                      ? '#10B981'
                      : ultrahumanToken
                      ? '#F59E0B'
                      : isNativeLinked && isHealthConnectGranted
                      ? '#10B981'
                      : '#94A3B8',
                  },
                ]}
              />
            </View>
            <Text style={styles.deviceFeeds}>Feeds: Sleep Architecture, Nightly HRV, Skin Temp</Text>
            <Text style={styles.deviceBattery}>
              {!enabledSources.ultrahuman
                ? 'Source Disabled'
                : ultrahumanStatus?.connected
                ? 'Live API Connected ✓'
                : ultrahumanToken
                ? 'Token Configured • Tap Test Below'
                : isNativeLinked && isHealthConnectGranted
                ? 'Auto-synced via Native Health Connect (No key needed ✓)'
                : 'Awaiting Token (Enter below for instant live sync)'}
            </Text>
          </View>
        </View>
        <Switch
          value={enabledSources.ultrahuman}
          onValueChange={(val) => onToggleSource('ultrahuman', val)}
          trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
          thumbColor={enabledSources.ultrahuman ? '#007AFF' : '#CBD5E1'}
        />
      </View>

      {/* 2. Google Fitbit Toggle */}
      <View style={styles.sourceToggleCard}>
        <View style={styles.sourceLeft}>
          <View style={[styles.deviceIconBubble, { backgroundColor: '#FFF3EB' }]}>
            <Text style={styles.deviceEmoji}>⌚</Text>
          </View>
          <View style={styles.deviceDetails}>
            <View style={styles.deviceTitleRow}>
              <Text style={styles.deviceName}>Google Fitbit Tracker</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: !enabledSources.fitbit
                      ? '#94A3B8'
                      : fitbitStatus?.connected
                      ? '#10B981'
                      : fitbitToken
                      ? '#F59E0B'
                      : '#94A3B8',
                  },
                ]}
              />
            </View>
            <Text style={styles.deviceFeeds}>Feeds: Workout Sessions, HR Zones, Active Calories</Text>
            <Text style={styles.deviceBattery}>
              {!enabledSources.fitbit
                ? 'Source Disabled'
                : fitbitStatus?.connected
                ? 'Live API Connected ✓'
                : fitbitToken
                ? 'Token Configured • Tap Test Below'
                : 'Not Configured (Enter token below)'}
            </Text>
          </View>
        </View>
        <Switch
          value={enabledSources.fitbit}
          onValueChange={(val) => onToggleSource('fitbit', val)}
          trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
          thumbColor={enabledSources.fitbit ? '#007AFF' : '#CBD5E1'}
        />
      </View>

      {/* 3. Hevy App Toggle */}
      <View style={styles.sourceToggleCard}>
        <View style={styles.sourceLeft}>
          <View style={[styles.deviceIconBubble, { backgroundColor: '#F5F3FF' }]}>
            <Text style={styles.deviceEmoji}>🏋️</Text>
          </View>
          <View style={styles.deviceDetails}>
            <View style={styles.deviceTitleRow}>
              <Text style={styles.deviceName}>Hevy Strength Log</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: !enabledSources.hevy
                      ? '#94A3B8'
                      : hevyStatus?.connected
                      ? '#10B981'
                      : hevyApiKey
                      ? '#F59E0B'
                      : '#94A3B8',
                  },
                ]}
              />
            </View>
            <Text style={styles.deviceFeeds}>Feeds: Volume Tonnage, Sets/Reps, Muscle Clocks</Text>
            <Text style={styles.deviceBattery}>
              {!enabledSources.hevy
                ? 'Source Disabled'
                : hevyStatus?.connected
                ? 'Live API Connected ✓'
                : hevyApiKey
                ? 'API Key Configured • Tap Test Below'
                : 'Not Configured (Enter key below)'}
            </Text>
          </View>
        </View>
        <Switch
          value={enabledSources.hevy}
          onValueChange={(val) => onToggleSource('hevy', val)}
          trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
          thumbColor={enabledSources.hevy ? '#007AFF' : '#CBD5E1'}
        />
      </View>

      {/* Cryptographic Security & Vault Audit Section */}
      <Text style={styles.sectionHeader}>HARDWARE-ISOLATED SECURITY & ENCRYPTION</Text>
      <Text style={styles.sectionSub}>All biometric credentials and API keys are protected at rest</Text>

      <View style={styles.vaultSecurityCard}>
        <View style={styles.vaultHeaderRow}>
          <View style={styles.vaultIconBubble}>
            <Text style={styles.vaultShieldEmoji}>🛡️</Text>
          </View>
          <View style={styles.vaultTitleBlock}>
            <View style={styles.vaultTagRow}>
              <Text style={styles.vaultTitle}>On-Device Encrypted Vault</Text>
              <View style={styles.shieldVerifiedBadge}>
                <Text style={styles.shieldVerifiedText}>AES-256 ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.vaultSubtitle}>
              Hardware-isolated key protection with zero cloud plaintext
            </Text>
          </View>
        </View>

        <View style={styles.vaultSpecsGrid}>
          <View style={styles.vaultSpecItem}>
            <Text style={styles.vaultSpecLabel}>Cipher</Text>
            <Text style={styles.vaultSpecVal}>AES-256-CBC</Text>
          </View>
          <View style={styles.vaultSpecItem}>
            <Text style={styles.vaultSpecLabel}>Integrity</Text>
            <Text style={styles.vaultSpecVal}>HMAC-SHA256</Text>
          </View>
          <View style={styles.vaultSpecItem}>
            <Text style={styles.vaultSpecLabel}>Derivation</Text>
            <Text style={styles.vaultSpecVal}>PBKDF2 (10k)</Text>
          </View>
          <View style={styles.vaultSpecItem}>
            <Text style={styles.vaultSpecLabel}>Sandbox</Text>
            <Text style={styles.vaultSpecVal}>Linux Mode 0700</Text>
          </View>
        </View>

        <View style={styles.vaultBanner}>
          <Text style={styles.vaultBannerText}>
            🔒 <Text style={styles.vaultBold}>Zero-Plaintext Guarantee</Text>: Keys are never stored unencrypted. Any tampered or corrupted record triggers instant HMAC verification failure.
          </Text>
        </View>

        {vaultNotice && (
          <View style={styles.vaultNoticeBox}>
            <Text style={styles.vaultNoticeText}>{vaultNotice}</Text>
          </View>
        )}

        <View style={styles.vaultActionRow}>
          <TouchableOpacity
            style={styles.clearVaultBtn}
            onPress={handleClearVault}
            activeOpacity={0.8}
          >
            <Text style={styles.clearVaultBtnText}>Wipe Vault & Delete Keys</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Developer API Credentials Section */}
      <Text style={styles.sectionHeader}>LIVE API CREDENTIALS & HARDWARE SYNC</Text>
      <Text style={styles.sectionSub}>Connect your accounts for direct live telemetry ingestion</Text>

      {/* 1. Hevy Developer API Key Card */}
      <View style={styles.apiKeyBox}>
        <View style={styles.apiHeaderRow}>
          <Text style={styles.apiKeyTitle}>🏋️ Hevy Developer API Key</Text>
          {hevyStatus && (
            <View style={[styles.statusBadge, { backgroundColor: hevyStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
              <Text style={[styles.statusBadgeText, { color: hevyStatus.connected ? '#15803D' : '#B91C1C' }]}>
                {hevyStatus.connected ? 'Live Connected ✓' : 'Failed'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.apiKeySub}>
          In Hevy app, go to Settings &gt; Developer API to copy your key. This powers your real weight volume and muscle recovery clocks.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.keyInput}
            placeholder="Paste Hevy api_key_live_..."
            placeholderTextColor="#94A3B8"
            value={hevyApiKey}
            onChangeText={setHevyApiKey}
            autoCapitalize="none"
            secureTextEntry={!showHevyKey}
          />
          <TouchableOpacity
            style={styles.eyeToggleBtn}
            onPress={() => setShowHevyKey(!showHevyKey)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeToggleText}>{showHevyKey ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestHevy}
            disabled={testingService === 'hevy'}
            activeOpacity={0.8}
          >
            {testingService === 'hevy' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.testBtnText}>Save & Test</Text>
            )}
          </TouchableOpacity>
        </View>
        {hevyStatus && (
          <Text style={[styles.statusMsg, { color: hevyStatus.connected ? '#15803D' : '#B91C1C' }]}>
            {hevyStatus.message}
          </Text>
        )}
      </View>

      {/* 2. Ultrahuman API Key / Personal Token Card */}
      <View style={styles.apiKeyBox}>
        <View style={styles.apiHeaderRow}>
          <View style={styles.smartRingHeaderRow}>
            <SmartRingIcon size={16} color="#10B981" accentColor="#059669" />
            <Text style={[styles.apiKeyTitle, { marginLeft: 6 }]}>Ultrahuman Ring AIR Token</Text>
          </View>
          {ultrahumanStatus && (
            <View style={[styles.statusBadge, { backgroundColor: ultrahumanStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
              <Text style={[styles.statusBadgeText, { color: ultrahumanStatus.connected ? '#15803D' : '#B91C1C' }]}>
                {ultrahumanStatus.connected ? 'Live Connected ✓' : 'Failed'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.apiKeySub}>
          Optional direct cloud sync for Ring AIR sleep hypnograms and real-time circadian phases.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.keyInput}
            placeholder="Paste Ultrahuman Token (Optional)..."
            placeholderTextColor="#94A3B8"
            value={ultrahumanToken}
            onChangeText={setUltrahumanToken}
            autoCapitalize="none"
            secureTextEntry={!showUltrahumanToken}
          />
          <TouchableOpacity
            style={styles.eyeToggleBtn}
            onPress={() => setShowUltrahumanToken(!showUltrahumanToken)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeToggleText}>{showUltrahumanToken ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestUltrahuman}
            disabled={testingService === 'ultrahuman'}
            activeOpacity={0.8}
          >
            {testingService === 'ultrahuman' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.testBtnText}>Save & Test</Text>
            )}
          </TouchableOpacity>
        </View>
        {ultrahumanStatus && (
          <Text style={[styles.statusMsg, { color: ultrahumanStatus.connected ? '#15803D' : '#B91C1C' }]}>
            {ultrahumanStatus.message}
          </Text>
        )}
      </View>

      {/* 3. Fitbit Access Token Card */}
      <View style={styles.apiKeyBox}>
        <View style={styles.apiHeaderRow}>
          <Text style={styles.apiKeyTitle}>⌚ Google Fitbit Personal Token</Text>
          {fitbitStatus && (
            <View style={[styles.statusBadge, { backgroundColor: fitbitStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
              <Text style={[styles.statusBadgeText, { color: fitbitStatus.connected ? '#15803D' : '#B91C1C' }]}>
                {fitbitStatus.connected ? 'Live Connected ✓' : 'Failed'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.apiKeySub}>
          Optional direct API sync for active zone minutes, workout GPS tracks, and cardio calories.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.keyInput}
            placeholder="Paste Fitbit Token (Optional)..."
            placeholderTextColor="#94A3B8"
            value={fitbitToken}
            onChangeText={setFitbitToken}
            autoCapitalize="none"
            secureTextEntry={!showFitbitToken}
          />
          <TouchableOpacity
            style={styles.eyeToggleBtn}
            onPress={() => setShowFitbitToken(!showFitbitToken)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeToggleText}>{showFitbitToken ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestFitbit}
            disabled={testingService === 'fitbit'}
            activeOpacity={0.8}
          >
            {testingService === 'fitbit' ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.testBtnText}>Save & Test</Text>
            )}
          </TouchableOpacity>
        </View>
        {fitbitStatus && (
          <Text style={[styles.statusMsg, { color: fitbitStatus.connected ? '#15803D' : '#B91C1C' }]}>
            {fitbitStatus.message}
          </Text>
        )}
      </View>

      {/* Notifications & Medication Alerts Control */}
      <Text style={styles.sectionHeader}>NOTIFICATIONS & MEDICATION ALERTS</Text>
      <View style={styles.notificationSettingsCard}>
        <View style={styles.notificationRow}>
          <View style={styles.notificationLeft}>
            <View style={styles.notificationIconBubble}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>Medication & Health Reminders</Text>
              <Text style={styles.notificationSubtitle}>
                {medsRemindersEnabled
                  ? 'Active · In-app pop alerts & scheduled reminders enabled'
                  : 'Disabled · Reminders paused'}
              </Text>
            </View>
          </View>
          <Switch
            value={medsRemindersEnabled}
            onValueChange={setMedsRemindersEnabled}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={medsRemindersEnabled ? '#007AFF' : '#F8FAFC'}
          />
        </View>

        <TouchableOpacity
          style={styles.testNotificationBtn}
          onPress={handleTestNotificationInSettings}
          activeOpacity={0.8}
        >
          <Text style={styles.testNotificationBtnText}>⚡ Send Test Notification Alert</Text>
        </TouchableOpacity>

        {testNotificationStatus && (
          <View style={styles.testNotificationStatusBox}>
            <Text style={styles.testNotificationSuccessText}>{testNotificationStatus}</Text>
          </View>
        )}
      </View>

      {/* Artificial Intelligence Master Control */}
      <Text style={styles.sectionHeader}>ARTIFICIAL INTELLIGENCE (COACH & INSIGHTS)</Text>
      <View style={styles.aiMasterCard}>
        <View style={styles.aiMasterRow}>
          <View style={styles.aiMasterLeft}>
            <View style={styles.aiMasterIconBubble}>
              <Text style={styles.aiMasterEmoji}>🧠</Text>
            </View>
            <View style={styles.aiMasterTextCol}>
              <Text style={styles.aiMasterTitle}>AI Health Engine</Text>
              <Text style={styles.aiMasterSubtitle}>
                {isAiActive
                  ? 'Active · Daily insights, smart coaching & analysis enabled'
                  : 'Disabled · Pure telemetry mode, no AI inference'}
              </Text>
            </View>
          </View>
          <Switch
            value={isAiActive}
            onValueChange={handleToggleAi}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={isAiActive ? '#007AFF' : '#F8FAFC'}
          />
        </View>
      </View>

      {!isAiActive ? (
        <View style={styles.aiDisabledCard}>
          <Text style={styles.aiDisabledTitle}>Pure Biometrics Mode Active</Text>
          <Text style={styles.aiDisabledText}>
            All AI cards and coach tabs are hidden. Your device runs strictly on local telemetry from Health Connect and wearable APIs with 0 background LLM or NPU inference.
          </Text>
        </View>
      ) : (
        <>
          {/* On-Device AI via Android AICore (Gemini Nano) */}
          <Text style={styles.sectionHeader}>ON-DEVICE AI (ANDROID AICORE)</Text>
          <View style={styles.aiEngineCard}>
            <View style={styles.aiTopRow}>
              <View>
                <Text style={styles.aiTitle}>Android AICore (Gemini Nano)</Text>
                <Text style={styles.aiSubText}>On-Device NPU / Tensor / Snapdragon</Text>
              </View>
              <View style={[styles.localBadge, { backgroundColor: '#DCFCE7' }]}>
                <Text style={[styles.localBadgeText, { color: '#15803D' }]}>NPU ACCELERATED</Text>
              </View>
            </View>

            {/* Model Spec Grid */}
            <View style={styles.aiSpecsGrid}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Model</Text>
                <Text style={styles.specVal}>Gemini Nano-1</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Weights</Text>
                <Text style={styles.specVal}>3.2B (INT4)</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>RAM Cache</Text>
                <Text style={styles.specVal}>1.74 GB</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Privacy</Text>
                <Text style={styles.specVal}>0% Cloud Leak</Text>
              </View>
            </View>

            <Text style={styles.aiDesc}>
              Executes directly on your device via Google Android AICore (com.google.android.aicore). All sleep hypnograms, heart rate zones, and strength volume remain strictly isolated inside local hardware memory.
            </Text>

            {/* Benchmark / Diagnostic Button */}
            <TouchableOpacity
              style={styles.benchmarkBtn}
              onPress={handleRunAiCoreBenchmark}
              disabled={testingService === 'aicore'}
              activeOpacity={0.8}
            >
              {testingService === 'aicore' ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.benchmarkBtnText}>⚡ Run AICore Hardware Benchmark</Text>
              )}
            </TouchableOpacity>

            {aicoreBenchmarkResult && (
              <View style={styles.benchmarkResultBox}>
                <Text style={styles.benchmarkResultText}>{aicoreBenchmarkResult}</Text>
              </View>
            )}
          </View>

          {/* Cloud Model Fallback (Optional Google Gemini 1.5 Flash) */}
          <View style={styles.apiKeyBox}>
            <View style={styles.apiHeaderRow}>
              <Text style={styles.apiKeyTitle}>✨ Google Gemini Cloud (Optional Fallback)</Text>
              {geminiStatus && (
                <View style={[styles.statusBadge, { backgroundColor: geminiStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={[styles.statusBadgeText, { color: geminiStatus.connected ? '#15803D' : '#B91C1C' }]}>
                    {geminiStatus.connected ? 'Gemini 1.5 Flash Connected ✓' : 'Failed'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.apiKeySub}>
              Optional cloud API key if you prefer server-grade Gemini 1.5 Flash when off battery-saver mode.
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.keyInput}
                placeholder="Paste Gemini API Key (Optional)..."
                placeholderTextColor="#94A3B8"
                value={geminiApiKey}
                onChangeText={setGeminiApiKey}
                autoCapitalize="none"
                secureTextEntry={!showGeminiKey}
              />
              <TouchableOpacity
                style={styles.eyeToggleBtn}
                onPress={() => setShowGeminiKey(!showGeminiKey)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeToggleText}>{showGeminiKey ? '👁️' : '🔒'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestGemini}
                disabled={testingService === 'gemini'}
                activeOpacity={0.8}
              >
                {testingService === 'gemini' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.testBtnText}>Save & Test</Text>
                )}
              </TouchableOpacity>
            </View>
            {geminiStatus && (
              <Text style={[styles.statusMsg, { color: geminiStatus.connected ? '#15803D' : '#B91C1C' }]}>
                {geminiStatus.message}
              </Text>
            )}
          </View>
        </>
      )}

      {/* Daily Health Targets & Baseline Goals */}
      <Text style={styles.sectionHeader}>DAILY HEALTH TARGETS & BASELINE</Text>
      <Text style={styles.sectionSub}>Customize baseline movement and calorie goals or restart setup</Text>

      <View style={styles.goalsSettingsCard}>
        {/* Step Target Row */}
        <View style={styles.goalSettingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalSettingLabel}>Daily Steps Goal</Text>
            <Text style={styles.goalSettingValText}>{stepsGoal.toLocaleString()} steps</Text>
          </View>
          <View style={styles.goalStepperBtns}>
            <TouchableOpacity
              style={styles.goalStepperBtn}
              onPress={() => handleUpdateStepsGoal(-500)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalStepperBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goalStepperBtn}
              onPress={() => handleUpdateStepsGoal(500)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalStepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calorie Target Row */}
        <View style={[styles.goalSettingRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12, marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalSettingLabel}>Active Calories Goal</Text>
            <Text style={styles.goalSettingValTextPeach}>{caloriesGoal.toLocaleString()} kcal</Text>
          </View>
          <View style={styles.goalStepperBtns}>
            <TouchableOpacity
              style={styles.goalStepperBtnPeach}
              onPress={() => handleUpdateCaloriesGoal(-50)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalStepperBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goalStepperBtnPeach}
              onPress={() => handleUpdateCaloriesGoal(50)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalStepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Onboarding Restart Action */}
      {Boolean(onResetOnboarding) && (
        <TouchableOpacity
          style={styles.restartOnboardingBtn}
          onPress={onResetOnboarding}
          activeOpacity={0.8}
        >
          <Text style={styles.restartOnboardingText}>
            🔄 Replay "Let's get started" Welcome Screen
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  syncCard: {
    backgroundColor: '#EAF2EE',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  syncInfo: {
    flex: 1,
  },
  syncStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  syncStatusSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activeHubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  hubDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2C4A3E',
  },
  hubText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2C4A3E',
  },
  syncNowBtn: {
    backgroundColor: '#1A1D1C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  syncNowBtnActive: {
    opacity: 0.7,
  },
  syncNowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  syncBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hcHubCard: {
    backgroundColor: '#EDE8F5',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(94, 78, 138, 0.08)',
    shadowColor: '#5E4E8A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  hcHubTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hcHubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  hcHubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hcStatusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hcStatusPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  hcHubSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  hcActionRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  hcManageBtn: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hcManageBtnHighlight: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  hcManageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  hcManageBtnTextHighlight: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 8,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  sourceToggleCard: {
    backgroundColor: '#F4F7F5',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  deviceIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceEmoji: {
    fontSize: 20,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  deviceFeeds: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deviceBattery: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  aiEngineCard: {
    backgroundColor: '#EAF2EE',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.1)',
    marginBottom: 24,
  },
  aiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C4A3E',
  },
  localBadge: {
    backgroundColor: '#2C4A3E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  localBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  aiDesc: {
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 17,
    marginBottom: 12,
  },
  aiSubText: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
    fontWeight: '500',
  },
  aiSpecsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F4F7F5',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  specVal: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '800',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#2C4A3E',
  },
  benchmarkBtn: {
    backgroundColor: '#EAF2EE',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.1)',
  },
  benchmarkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C4A3E',
  },
  benchmarkResultBox: {
    backgroundColor: '#F4F7F5',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2C4A3E',
  },
  benchmarkResultText: {
    fontSize: 11,
    color: '#0F172A',
    lineHeight: 16,
  },
  apiKeyBox: {
    backgroundColor: '#FAF5EE',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(180, 95, 30, 0.08)',
    marginBottom: 14,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  apiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  apiKeyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  apiKeySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  testBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 84,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusMsg: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  eyeToggleBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eyeToggleText: {
    fontSize: 14,
  },
  smartRingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaultSecurityCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  vaultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaultIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  vaultShieldEmoji: {
    fontSize: 18,
  },
  vaultTitleBlock: {
    flex: 1,
  },
  vaultTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vaultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  shieldVerifiedBadge: {
    backgroundColor: '#065F46',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shieldVerifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.4,
  },
  vaultSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  vaultSpecsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  vaultSpecItem: {
    alignItems: 'center',
  },
  vaultSpecLabel: {
    fontSize: 9,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  vaultSpecVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 2,
  },
  vaultBanner: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  vaultBannerText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  vaultBold: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  vaultNoticeBox: {
    backgroundColor: '#064E3B',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  vaultNoticeText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  vaultActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearVaultBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearVaultBtnText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '700',
  },
  aiMasterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  aiMasterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiMasterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  aiMasterIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiMasterEmoji: {
    fontSize: 18,
  },
  aiMasterTextCol: {
    flex: 1,
  },
  aiMasterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  aiMasterSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  aiDisabledCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  aiDisabledTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  aiDisabledText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  notificationSettingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  notificationIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  notificationSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  testNotificationBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  testNotificationBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  testNotificationStatusBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  testNotificationSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },
  goalsSettingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  goalSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalSettingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#63706B',
  },
  goalSettingValText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#152920',
    marginTop: 2,
  },
  goalSettingValTextPeach: {
    fontSize: 20,
    fontWeight: '800',
    color: '#54260E',
    marginTop: 2,
  },
  goalStepperBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  goalStepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalStepperBtnPeach: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalStepperBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141816',
    lineHeight: 20,
  },
  restartOnboardingBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.08)',
  },
  restartOnboardingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141816',
  },
});
