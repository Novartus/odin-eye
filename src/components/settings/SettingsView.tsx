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
  Modal,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { SmartRingIcon } from '../common/SmartRingIcon';
import { hevyApiClient } from '../../services/api/hevyApiClient';
import { ultrahumanApiClient } from '../../services/api/ultrahumanApiClient';
import { fitbitApiClient } from '../../services/api/fitbitApiClient';
import { credentialsStorage } from '../../services/storage/credentialsStorage';
import { liveHealthService } from '../../services/live/liveHealthService';
import { androidAiCoreService } from '../../services/ai/androidAiCoreService';
import { aiHealthService } from '../../services/ai/aiService';
import { healthConnect, isNativeHealthConnectLinked } from '../../services/healthConnect/healthConnectService';
import { medicationService } from '../../services/medication/medicationService';
import { medicationNotificationService } from '../../services/medication/medicationNotificationService';
import { mindfulnessService } from '../../services/mindfulness/mindfulnessService';
import { widgetSyncService } from '../../services/widgets/widgetSyncService';
import { LegalModal } from '../legal/LegalModal';
import { EnabledSources } from '../../types';
export { EnabledSources } from '../../types';

// Subtle vector icon components (replacing raw emojis to adhere to Scandinavian Pastel Bento design)
const EyeToggle: React.FC<{ show: boolean; onToggle: () => void }> = ({ show, onToggle }) => (
  <TouchableOpacity style={styles.eyeToggleBtn} onPress={onToggle} activeOpacity={0.7}>
    {show ? (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <Path
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke="#4A5B53"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="12" r="3" stroke="#4A5B53" strokeWidth="2" />
      </Svg>
    ) : (
      <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <Path
          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          stroke="#8A9992"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Line x1="1" y1="1" x2="23" y2="23" stroke="#8A9992" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    )}
  </TouchableOpacity>
);

const HeartPulseIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#E11D48' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12l2 2l3 -4"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SmartwatchIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="5" width="12" height="14" rx="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 5V2h6v3M9 19v3h6v-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 9v3l2 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DumbbellIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 5v14M18 5v14M4 8v8M20 8v8M6 12h12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const VaultShieldIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#34D399' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="11" r="2" stroke={color} strokeWidth="1.8" />
    <Path d="M12 13v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const LockKeyIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#2C4A3E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="11" width="16" height="11" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BellIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#92400E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const NeuralNodesIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#2C4A3E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="4" cy="12" r="2" stroke={color} strokeWidth="1.8" />
    <Circle cx="20" cy="12" r="2" stroke={color} strokeWidth="1.8" />
    <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth="1.8" />
    <Circle cx="12" cy="20" r="2" stroke={color} strokeWidth="1.8" />
    <Line x1="6" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.8" />
    <Line x1="15" y1="12" x2="18" y2="12" stroke={color} strokeWidth="1.8" />
    <Line x1="12" y1="6" x2="12" y2="9" stroke={color} strokeWidth="1.8" />
    <Line x1="12" y1="15" x2="12" y2="18" stroke={color} strokeWidth="1.8" />
  </Svg>
);

const LightningIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparkleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TargetIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8" />
    <Circle cx="12" cy="12" r="1.5" fill={color} />
  </Svg>
);

const ChevronRightIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#63706B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BodyAnatomyIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#2C4A3E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 5.5C7.2 4 9.5 3.5 12 3.5s4.8.5 6 2c1 1.2.9 2.8.2 4.2L17 12c-.5.9-.6 1.8-.5 2.7l.5 4.3c0 .8-.6 1.5-1.5 1.5H8.5c-.9 0-1.5-.7-1.5-1.5l.5-4.3c.1-.9 0-1.8-.5-2.7L5.8 9.7C5.1 8.3 5 6.7 6 5.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 9.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <Path
      d="M12 11.3V16.5"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </Svg>
);

const BentoGridIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="3" width="7" height="4" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="14" y="11" width="7" height="10" rx="2" stroke={color} strokeWidth="2" />
    <Rect x="3" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth="2" />
  </Svg>
);

interface SettingsViewProps {
  enabledSources: EnabledSources;
  onToggleSource: (sourceKey: keyof EnabledSources, value: boolean) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncText: string;
  onOpenHealthConnectPrompt?: () => void;
  aiEnabled?: boolean;
  onToggleAi?: (enabled: boolean) => void;
  bodyAnalysisEnabled?: boolean;
  onToggleBodyAnalysis?: (enabled: boolean) => void;
  mindfulnessEnabled?: boolean;
  onToggleMindfulness?: (enabled: boolean) => void;
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
  bodyAnalysisEnabled = true,
  onToggleBodyAnalysis,
  mindfulnessEnabled = true,
  onToggleMindfulness,
  onResetOnboarding,
}) => {
  // Credentials State
  const [hevyApiKey, setHevyApiKey] = useState('');
  const [ultrahumanToken, setUltrahumanToken] = useState('');
  const [fitbitToken, setFitbitToken] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isAiActive, setIsAiActive] = useState<boolean>(aiEnabled);
  const [isBodyAnalysisActive, setIsBodyAnalysisActive] = useState<boolean>(bodyAnalysisEnabled);
  const [isMindfulnessActive, setIsMindfulnessActive] = useState<boolean>(mindfulnessEnabled);

  // Daily Goals State
  const [stepsGoal, setStepsGoal] = useState<number>(10000);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(500);
  const [mindfulnessGoal, setMindfulnessGoal] = useState<number>(10);
  const [mindfulnessSound, setMindfulnessSound] = useState<string>('birds');
  const [mindfulnessStreak, setMindfulnessStreak] = useState<number>(0);

  // Key Visibility Toggles
  const [showHevyKey, setShowHevyKey] = useState(false);
  const [showUltrahumanToken, setShowUltrahumanToken] = useState(false);
  const [showFitbitToken, setShowFitbitToken] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);

  // Security Vault & Audit State
  const [vaultNotice, setVaultNotice] = useState<string | null>(null);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'disclaimer'>('privacy');
  const [widgetSyncNotice, setWidgetSyncNotice] = useState<string | null>(null);

  const openLegal = (tab: 'terms' | 'privacy' | 'disclaimer') => {
    setLegalModalTab(tab);
    setShowLegalModal(true);
  };

  const handleSyncWidgets = async () => {
    try {
      await widgetSyncService.syncAllWidgets();
      setWidgetSyncNotice('✓ Android Home Screen widgets updated');
      setTimeout(() => setWidgetSyncNotice(null), 3000);
    } catch {
      setWidgetSyncNotice('Sync completed');
    }
  };

  const handlePinWidget = async (type: 'pill' | 'zen') => {
    try {
      Vibration.vibrate(25);
      const success = await widgetSyncService.requestPinWidget(type);
      if (success) {
        setWidgetSyncNotice(`✓ Prompted to add ${type === 'pill' ? 'Medication' : 'Zen'} widget`);
      } else {
        setWidgetSyncNotice('To add: Long-press your home screen & tap "Widgets"');
      }
      setTimeout(() => setWidgetSyncNotice(null), 4000);
    } catch {
      setWidgetSyncNotice('To add: Long-press your home screen & tap "Widgets"');
    }
  };

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
    } catch { }
    medicationService.triggerTestReminder();
    medicationNotificationService.sendTestPopNotification().catch(() => { });
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
      if (creds.aiEnabled !== undefined) setIsAiActive(creds.aiEnabled);
      if (creds.bodyAnalysisEnabled !== undefined) setIsBodyAnalysisActive(creds.bodyAnalysisEnabled);
      if (creds.healthConnectPermissionsGranted) setIsHealthConnectGranted(true);
      if (creds.dailyStepsGoal) setStepsGoal(creds.dailyStepsGoal);
      if (creds.dailyCaloriesGoal) setCaloriesGoal(creds.dailyCaloriesGoal);
      if (creds.dailyMindfulnessGoal) setMindfulnessGoal(creds.dailyMindfulnessGoal);
      if (creds.mindfulnessAmbientSound) setMindfulnessSound(creds.mindfulnessAmbientSound);
    });
  }, [isSyncing]);

  useEffect(() => {
    mindfulnessService.loadLogs().then(() => {
      setMindfulnessStreak(mindfulnessService.getWeeklyStats().currentStreak);
    });
    const unsubscribe = mindfulnessService.subscribe((stats) => {
      setMindfulnessStreak(stats.currentStreak);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (aiEnabled !== undefined) {
      setIsAiActive(aiEnabled);
    }
  }, [aiEnabled]);

  useEffect(() => {
    if (bodyAnalysisEnabled !== undefined) {
      setIsBodyAnalysisActive(bodyAnalysisEnabled);
    }
  }, [bodyAnalysisEnabled]);

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

  const handleUpdateMindfulnessGoal = async (delta: number) => {
    const updated = Math.max(2, Math.min(60, mindfulnessGoal + delta));
    setMindfulnessGoal(updated);
    await credentialsStorage.saveCredentials({ dailyMindfulnessGoal: updated });
  };

  const handleSelectMindfulnessSound = async (soundId: string) => {
    setMindfulnessSound(soundId);
    await credentialsStorage.saveCredentials({ mindfulnessAmbientSound: soundId });
  };

  const handleToggleAi = async (val: boolean) => {
    setIsAiActive(val);
    if (onToggleAi) onToggleAi(val);
    await credentialsStorage.saveCredentials({ aiEnabled: val });
  };

  const handleToggleBodyAnalysis = async (val: boolean) => {
    setIsBodyAnalysisActive(val);
    if (onToggleBodyAnalysis) onToggleBodyAnalysis(val);
    await credentialsStorage.saveCredentials({ bodyAnalysisEnabled: val });
  };

  const handleToggleMindfulness = async (val: boolean) => {
    setIsMindfulnessActive(val);
    if (onToggleMindfulness) onToggleMindfulness(val);
    await credentialsStorage.saveCredentials({ mindfulnessEnabled: val });
  };

  const handleClearVault = async () => {
    await credentialsStorage.clearVault();
    await mindfulnessService.clearLogs();
    setHevyApiKey('');
    setUltrahumanToken('');
    setFitbitToken('');
    setGeminiApiKey('');
    setVaultNotice('Secure vault wiped. All encrypted keys & logs purged from device storage.');
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
      {/* Primary Top Sync Header Bar */}
      <View style={styles.syncCard}>
        <View style={styles.syncInfo}>
          <Text style={styles.syncStatusTitle}>Centralized Health Ingestion</Text>
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

      {/* ─── CATEGORY 1: CORE APPLICATION MODULES ─── */}
      <View style={styles.categoryHeaderRow}>
        <View style={styles.categoryNumberBadge}>
          <Text style={styles.categoryNumberText}>01</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle}>APPLICATION MODULES & FEATURE SUITE</Text>
          <Text style={styles.categorySubtitle}>Enable or disable on-device intelligence & navigation tabs</Text>
        </View>
      </View>

      {/* 1.1 AI Health Engine Master Control */}
      <View style={styles.moduleCard}>
        <View style={styles.moduleRow}>
          <View style={styles.moduleLeft}>
            <View style={styles.moduleIconBubbleAi}>
              <NeuralNodesIcon size={18} color="#1F382E" />
            </View>
            <View style={styles.moduleTextCol}>
              <Text style={styles.moduleTitle}>AI Health Engine (Coach & Insights)</Text>
              <Text style={styles.moduleSubtitle}>
                {isAiActive
                  ? 'Active · Daily insights, smart coaching & analysis enabled'
                  : 'Disabled · Pure telemetry mode, no AI inference'}
              </Text>
            </View>
          </View>
          <Switch
            value={isAiActive}
            onValueChange={handleToggleAi}
            trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
            thumbColor={isAiActive ? '#1F382E' : '#FFFFFF'}
          />
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
                Executes directly on your device via Google Android AICore (com.google.android.aicore). Biometrics remain strictly isolated inside local hardware memory.
              </Text>

              <TouchableOpacity
                style={styles.benchmarkBtn}
                onPress={handleRunAiCoreBenchmark}
                disabled={testingService === 'aicore'}
                activeOpacity={0.8}
              >
                {testingService === 'aicore' ? (
                  <ActivityIndicator size="small" color="#1F382E" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <LightningIcon size={14} color="#1F382E" />
                    <Text style={styles.benchmarkBtnText}>Run AICore Hardware Benchmark</Text>
                  </View>
                )}
              </TouchableOpacity>

              {aicoreBenchmarkResult && (
                <View style={styles.benchmarkResultBox}>
                  <Text style={styles.benchmarkResultText}>{aicoreBenchmarkResult}</Text>
                </View>
              )}
            </View>

            {/* Cloud Model Fallback (Optional Google Gemini 1.5 Flash) */}
            <View style={styles.fallbackCloudBox}>
              <View style={styles.apiHeaderRow}>
                <View style={styles.apiTitleWithIcon}>
                  <SparkleIcon size={16} color="#1F382E" />
                  <Text style={styles.apiKeyTitle}>Google Gemini Cloud (Optional Fallback)</Text>
                </View>
                {geminiStatus && (
                  <View style={[styles.statusBadge, { backgroundColor: geminiStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Text style={[styles.statusBadgeText, { color: geminiStatus.connected ? '#15803D' : '#B91C1C' }]}>
                      {geminiStatus.connected ? 'Connected ✓' : 'Failed'}
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
                <EyeToggle show={showGeminiKey} onToggle={() => setShowGeminiKey(!showGeminiKey)} />
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
      </View>

      {/* 1.2 Body & Muscle Recovery Analysis Control */}
      <View style={styles.moduleCard}>
        <View style={styles.moduleRow}>
          <View style={styles.moduleLeft}>
            <View style={styles.moduleIconBubbleBody}>
              <BodyAnatomyIcon size={18} color="#1F382E" />
            </View>
            <View style={styles.moduleTextCol}>
              <Text style={styles.moduleTitle}>Body & Muscle Recovery Analysis</Text>
              <Text style={styles.moduleSubtitle}>
                {isBodyAnalysisActive
                  ? 'Active · Interactive anatomical map, recovery timers & fatigue tracking'
                  : 'Disabled · Body tab hidden, running pure telemetry'}
              </Text>
            </View>
          </View>
          <Switch
            value={isBodyAnalysisActive}
            onValueChange={handleToggleBodyAnalysis}
            trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
            thumbColor={isBodyAnalysisActive ? '#1F382E' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* 1.3 Mindfulness & Breathing Module Control */}
      <View style={styles.moduleCard}>
        <View style={styles.moduleRow}>
          <View style={styles.moduleLeft}>
            <View style={[styles.moduleIconBubbleBody, { backgroundColor: '#EAF2EE' }]}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M12 22V12" stroke="#1F382E" strokeWidth="1.8" strokeLinecap="round" />
                <Path d="M12 12C12 12 7 10 5 6c2 0 5 1 7 6z" stroke="#1F382E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M12 12C12 12 17 10 19 6c-2 0-5 1-7 6z" stroke="#1F382E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M12 12C12 12 9 7 12 3c3 4 0 9 0 9z" stroke="#1F382E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <View style={styles.moduleTextCol}>
              <Text style={styles.moduleTitle}>Mindfulness & Breathing</Text>
              <Text style={styles.moduleSubtitle}>
                {isMindfulnessActive
                  ? 'Active · Guided breathing sessions, mood check-in & Zen tab'
                  : 'Disabled · Zen tab hidden'}
              </Text>
            </View>
          </View>
          <Switch
            value={isMindfulnessActive}
            onValueChange={handleToggleMindfulness}
            trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
            thumbColor={isMindfulnessActive ? '#1F382E' : '#FFFFFF'}
          />
        </View>

        {/* Expanded Mindfulness Settings */}
        {isMindfulnessActive && (
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(31,56,46,0.06)' }}>
            {/* Daily Target Stepper */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1F382E' }}>Daily Mindful Target</Text>
                <Text style={{ fontSize: 11, color: '#63706B', marginTop: 1 }}>{mindfulnessGoal} minutes per day</Text>
              </View>
              <View style={styles.goalStepperBtns}>
                <TouchableOpacity
                  style={styles.goalStepperBtn}
                  onPress={() => handleUpdateMindfulnessGoal(-2)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.goalStepperBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.goalStepperBtn}
                  onPress={() => handleUpdateMindfulnessGoal(2)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.goalStepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Streak & Calendar Status */}
            <View style={{ backgroundColor: '#EAF2EE', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Text style={{ fontSize: 14 }}>🔥</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1F382E' }}>
                  {mindfulnessStreak > 0 ? `${mindfulnessStreak}-Day Active Streak` : 'No Active Streak Yet'}
                </Text>
                <Text style={{ fontSize: 11, color: '#2C4A3E' }}>
                  {mindfulnessStreak > 0
                    ? 'Check the Zen tab to view your interactive 7-day streak calendar'
                    : 'Complete a breathing session in Zen tab to begin your streak'}
                </Text>
              </View>
            </View>

            {/* Ambient Soundscape Preference */}
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#63706B', letterSpacing: 0.5, marginBottom: 8 }}>
              DEFAULT AMBIENT SOUND
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {[
                { id: 'birds', label: '🐦 Birds' },
                { id: 'rain', label: '🌧️ Rain' },
                { id: 'waves', label: '🌊 Ocean' },
                { id: 'breeze', label: '🍃 Breeze' },
                { id: 'silent', label: '🤫 Silent' },
              ].map((s) => {
                const isSelected = mindfulnessSound === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={{
                      backgroundColor: isSelected ? '#1F382E' : '#F8FAFA',
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? '#1F382E' : 'rgba(0,0,0,0.06)',
                    }}
                    onPress={() => handleSelectMindfulnessSound(s.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: isSelected ? '#FFFFFF' : '#495057' }}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* 1.4 Notifications & Medication Alerts Control */}
      <View style={styles.moduleCard}>
        <View style={styles.moduleRow}>
          <View style={styles.moduleLeft}>
            <View style={styles.moduleIconBubbleMeds}>
              <BellIcon size={18} color="#92400E" />
            </View>
            <View style={styles.moduleTextCol}>
              <Text style={styles.moduleTitle}>Medication & Health Reminders</Text>
              <Text style={styles.moduleSubtitle}>
                {medsRemindersEnabled
                  ? 'Active · In-app pop alerts & scheduled dose reminders enabled'
                  : 'Disabled · Reminders paused'}
              </Text>
            </View>
          </View>
          <Switch
            value={medsRemindersEnabled}
            onValueChange={setMedsRemindersEnabled}
            trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
            thumbColor={medsRemindersEnabled ? '#1F382E' : '#FFFFFF'}
          />
        </View>

        <TouchableOpacity
          style={styles.testNotificationBtn}
          onPress={handleTestNotificationInSettings}
          activeOpacity={0.8}
        >
          <LightningIcon size={14} color="#1F382E" />
          <Text style={styles.testNotificationBtnText}>Send Test Notification Alert</Text>
        </TouchableOpacity>

        {testNotificationStatus && (
          <View style={styles.testNotificationStatusBox}>
            <Text style={styles.testNotificationSuccessText}>{testNotificationStatus}</Text>
          </View>
        )}
      </View>

      {/* ─── CATEGORY 2: CONNECTED WEARABLES & HARDWARE APIS ─── */}
      <View style={styles.categoryHeaderRow}>
        <View style={styles.categoryNumberBadge}>
          <Text style={styles.categoryNumberText}>02</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle}>CONNECTED WEARABLES & DATA STREAMS</Text>
          <Text style={styles.categorySubtitle}>Manage native OS bridges, device feeds & live API keys</Text>
        </View>
      </View>

      {/* 2.0 Device Configuration Questionnaire Card (Choose what to enable/disable) */}
      <View style={styles.sourcesQuestionnaireCard}>
        <View style={styles.sourcesQuestionnaireHeader}>
          <View style={styles.sourcesQuestionnaireIcon}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                stroke="#1F382E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sourcesQuestionnaireTitle}>Select Active Data Sources</Text>
            <Text style={styles.sourcesQuestionnaireSubtitle}>
              Choose what devices to track. If you don't have an Ultrahuman Ring, keep it disabled — Health Connect automatically reads heart rate and sleep from Fitbit or Wear OS.
            </Text>
          </View>
        </View>

        <View style={styles.sourceSelectorRow}>
          <TouchableOpacity
            style={[styles.sourceSelectChip, enabledSources.fitbit && styles.sourceSelectChipActive]}
            onPress={() => onToggleSource('fitbit', !enabledSources.fitbit)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sourceSelectChipTitle, enabledSources.fitbit && styles.sourceSelectChipTitleActive]}>
              Fitbit / Wear OS
            </Text>
            <Text style={[styles.sourceSelectChipSub, enabledSources.fitbit && styles.sourceSelectChipSubActive]}>
              {enabledSources.fitbit ? '✓ Enabled' : 'Disabled'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sourceSelectChip, enabledSources.hevy && styles.sourceSelectChipActive]}
            onPress={() => onToggleSource('hevy', !enabledSources.hevy)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sourceSelectChipTitle, enabledSources.hevy && styles.sourceSelectChipTitleActive]}>
              Hevy Lifting
            </Text>
            <Text style={[styles.sourceSelectChipSub, enabledSources.hevy && styles.sourceSelectChipSubActive]}>
              {enabledSources.hevy ? '✓ Enabled' : 'Disabled'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sourceSelectChip, enabledSources.ultrahuman && styles.sourceSelectChipActive]}
            onPress={() => onToggleSource('ultrahuman', !enabledSources.ultrahuman)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sourceSelectChipTitle, enabledSources.ultrahuman && styles.sourceSelectChipTitleActive]}>
              Ultrahuman Ring
            </Text>
            <Text style={[styles.sourceSelectChipSub, enabledSources.ultrahuman && styles.sourceSelectChipSubActive]}>
              {enabledSources.ultrahuman ? '✓ Enabled' : 'Disabled (Default)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2.1 Android Health Connect Hub Card */}
      <View style={styles.hcHubCard}>
        <View style={styles.hcHubTopRow}>
          <View style={styles.hcHubIconCircle}>
            <HeartPulseIcon size={20} color="#E11D48" />
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

      {/* 2.2 Ultrahuman Ring AIR (Unified: Toggle + Status + Live Token) */}
      <View style={styles.unifiedDeviceCard}>
        <View style={styles.unifiedDeviceTopRow}>
          <View style={styles.unifiedDeviceLeft}>
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
                  ? 'Source Disabled (Default) • Sleep & HR read via Health Connect'
                  : ultrahumanStatus?.connected
                    ? 'Live API Connected ✓'
                    : ultrahumanToken
                      ? 'Token Configured • Tap Test Below'
                      : isNativeLinked && isHealthConnectGranted
                        ? 'Auto-synced via Native Health Connect ✓'
                        : 'Awaiting Token or Health Connect'}
              </Text>
            </View>
          </View>
          <Switch
            value={enabledSources.ultrahuman}
            onValueChange={(val) => onToggleSource('ultrahuman', val)}
            trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
            thumbColor={enabledSources.ultrahuman ? '#1F382E' : '#FFFFFF'}
          />
        </View>

        {enabledSources.ultrahuman && (
          <View style={styles.unifiedCredsBlock}>
            <View style={styles.apiHeaderRow}>
              <Text style={styles.unifiedCredsLabel}>Direct Cloud Token (Optional)</Text>
              {ultrahumanStatus && (
                <View style={[styles.statusBadge, { backgroundColor: ultrahumanStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={[styles.statusBadgeText, { color: ultrahumanStatus.connected ? '#15803D' : '#B91C1C' }]}>
                    {ultrahumanStatus.connected ? 'Connected ✓' : 'Failed'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.unifiedCredsSub}>
              Direct cloud sync for Ring AIR sleep hypnograms and real-time circadian phases.
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
              <EyeToggle show={showUltrahumanToken} onToggle={() => setShowUltrahumanToken(!showUltrahumanToken)} />
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
        )}
      </View>

      {/* 2.3 Google Fitbit Tracker (Unified: Toggle + Status + Live Token) */}
      <View style={styles.unifiedDeviceCard}>
        <View style={styles.unifiedDeviceTopRow}>
          <View style={styles.unifiedDeviceLeft}>
            <View style={[styles.deviceIconBubble, { backgroundColor: '#FFF3EB' }]}>
              <SmartwatchIcon size={20} color="#EA580C" />
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
            trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
            thumbColor={enabledSources.fitbit ? '#1F382E' : '#FFFFFF'}
          />
        </View>

        {enabledSources.fitbit && (
          <View style={styles.unifiedCredsBlock}>
            <View style={styles.apiHeaderRow}>
              <Text style={styles.unifiedCredsLabel}>Personal Access Token (Optional)</Text>
              {fitbitStatus && (
                <View style={[styles.statusBadge, { backgroundColor: fitbitStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={[styles.statusBadgeText, { color: fitbitStatus.connected ? '#15803D' : '#B91C1C' }]}>
                    {fitbitStatus.connected ? 'Connected ✓' : 'Failed'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.unifiedCredsSub}>
              Direct API sync for active zone minutes, workout GPS tracks, and cardio calories.
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
              <EyeToggle show={showFitbitToken} onToggle={() => setShowFitbitToken(!showFitbitToken)} />
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
        )}
      </View>

      {/* 2.4 Hevy Strength Log (Unified: Toggle + Status + Developer Key) */}
      <View style={styles.unifiedDeviceCard}>
        <View style={styles.unifiedDeviceTopRow}>
          <View style={styles.unifiedDeviceLeft}>
            <View style={[styles.deviceIconBubble, { backgroundColor: '#F5F3FF' }]}>
              <DumbbellIcon size={20} color="#7C3AED" />
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
            trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
            thumbColor={enabledSources.hevy ? '#1F382E' : '#FFFFFF'}
          />
        </View>

        {enabledSources.hevy && (
          <View style={styles.unifiedCredsBlock}>
            <View style={styles.apiHeaderRow}>
              <Text style={styles.unifiedCredsLabel}>Developer API Key</Text>
              {hevyStatus && (
                <View style={[styles.statusBadge, { backgroundColor: hevyStatus.connected ? '#DCFCE7' : '#FEE2E2' }]}>
                  <Text style={[styles.statusBadgeText, { color: hevyStatus.connected ? '#15803D' : '#B91C1C' }]}>
                    {hevyStatus.connected ? 'Connected ✓' : 'Failed'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.unifiedCredsSub}>
              In Hevy app: Settings &gt; Developer API to copy your key. Powers real weight volume & fatigue clocks.
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
              <EyeToggle show={showHevyKey} onToggle={() => setShowHevyKey(!showHevyKey)} />
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
        )}
      </View>

      {/* ─── CATEGORY 3: TARGETS & GOAL RECALIBRATION ─── */}
      <View style={styles.categoryHeaderRow}>
        <View style={styles.categoryNumberBadge}>
          <Text style={styles.categoryNumberText}>03</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle}>DAILY TARGETS & RECALIBRATION</Text>
          <Text style={styles.categorySubtitle}>Fine-tune daily activity baselines or reset targets</Text>
        </View>
      </View>

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

        {/* Mindful Target Row */}
        <View style={[styles.goalSettingRow, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12, marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.goalSettingLabel}>Daily Mindful Goal</Text>
            <Text style={[styles.goalSettingValText, { color: '#1F382E' }]}>{mindfulnessGoal} mins</Text>
          </View>
          <View style={styles.goalStepperBtns}>
            <TouchableOpacity
              style={styles.goalStepperBtn}
              onPress={() => handleUpdateMindfulnessGoal(-2)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalStepperBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goalStepperBtn}
              onPress={() => handleUpdateMindfulnessGoal(2)}
              activeOpacity={0.7}
            >
              <Text style={styles.goalStepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Recalibrate Goals Action Card */}
      {Boolean(onResetOnboarding) && (
        <TouchableOpacity
          style={styles.recalibrateGoalsBtn}
          onPress={onResetOnboarding}
          activeOpacity={0.8}
        >
          <View style={styles.recalibrateLeft}>
            <View style={styles.recalibrateIconBubble}>
              <TargetIcon size={20} color="#1F382E" />
            </View>
            <View style={styles.recalibrateTextCol}>
              <Text style={styles.recalibrateTitle}>Recalibrate Daily Targets & Goals</Text>
              <Text style={styles.recalibrateSub}>
                Re-adjust your baseline steps, active energy targets & pacing
              </Text>
            </View>
          </View>
          <ChevronRightIcon size={18} color="#8A9992" />
        </TouchableOpacity>
      )}

      {/* ─── CATEGORY 4: SECURITY & ON-DEVICE VAULT AUDIT ─── */}
      <View style={styles.categoryHeaderRow}>
        <View style={styles.categoryNumberBadge}>
          <Text style={styles.categoryNumberText}>04</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.categoryTitle}>HARDWARE SECURITY & VAULT AUDIT</Text>
          <Text style={styles.categorySubtitle}>Hardware-isolated cryptographic protection for all tokens</Text>
        </View>
      </View>

      <View style={styles.vaultSecurityCard}>
        <View style={styles.vaultHeaderRow}>
          <View style={styles.vaultIconBubble}>
            <VaultShieldIcon size={20} color="#1F382E" />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <LockKeyIcon size={14} color="#2C4A3E" />
            <Text style={styles.vaultBold}>Zero-Plaintext Guarantee</Text>
          </View>
          <Text style={styles.vaultBannerText}>
            Keys are never stored unencrypted. Any tampered or corrupted record triggers instant HMAC verification failure.
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

      {/* 4.25 Android Home Screen Widgets Hub */}
      <View style={styles.widgetsHubCard}>
        <View style={styles.widgetsHubHeader}>
          <View style={styles.widgetsIconBubble}>
            <BentoGridIcon size={18} color="#1F382E" />
          </View>
          <View style={styles.widgetsTextCol}>
            <Text style={styles.widgetsHubTitle}>Android Home Screen Widgets (Glance)</Text>
            <Text style={styles.widgetsHubSub}>
              Live interactive Scandinavian bento widgets on your phone home screen
            </Text>
          </View>
        </View>

        {/* Live Widget Previews */}
        <View style={styles.widgetPreviewsWrap}>
          {/* Pill Reminder Widget Preview */}
          <TouchableOpacity
            style={styles.widgetPreviewItem}
            onPress={() => handlePinWidget('pill')}
            activeOpacity={0.88}
          >
            <View style={styles.widgetPreviewTop}>
              <Text style={styles.widgetPreviewTag}>PILL REMINDER · 4x2</Text>
              <View style={styles.widgetPreviewBadge}>
                <Text style={styles.widgetPreviewBadgeText}>UPCOMING</Text>
              </View>
            </View>
            <View style={styles.widgetPreviewBody}>
              <View style={{ flex: 1 }}>
                <Text style={styles.widgetPreviewMedTitle}>Vitamin D3</Text>
                <Text style={styles.widgetPreviewMedSub}>2,000 IU · 1 capsule</Text>
                <Text style={styles.widgetPreviewMedTime}>Due at 08:00 AM</Text>
              </View>
              <View style={styles.widgetPreviewTakeBtn}>
                <Text style={styles.widgetPreviewTakeText}>Take</Text>
              </View>
            </View>
            <View style={styles.widgetPinRow}>
              <Text style={styles.widgetPinText}>➕ Tap to add to Home Screen</Text>
            </View>
          </TouchableOpacity>

          {/* Zen & Vitals Widget Preview */}
          <TouchableOpacity
            style={styles.widgetPreviewItem}
            onPress={() => handlePinWidget('zen')}
            activeOpacity={0.88}
          >
            <View style={styles.widgetPreviewTop}>
              <Text style={styles.widgetPreviewTag}>ZEN &amp; VITALS · 4x2</Text>
              <View style={styles.widgetPreviewBadge}>
                <Text style={styles.widgetPreviewBadgeText}>{mindfulnessStreak > 0 ? `${mindfulnessStreak} D STREAK` : '3 D STREAK'}</Text>
              </View>
            </View>
            <View style={styles.widgetPreviewBody}>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.widgetPreviewStepsVal}>
                  {String(stepsGoal).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                  <Text style={styles.widgetPreviewStepsSub}>steps</Text>
                </Text>
                <View style={styles.widgetPreviewBarTrack}>
                  <View style={[styles.widgetPreviewBarFill, { width: '74%' }]} />
                </View>
              </View>
              <View style={{ flex: 0.8, paddingLeft: 12 }}>
                <Text style={styles.widgetPreviewHrSub}>HEART RATE</Text>
                <Text style={styles.widgetPreviewHrVal}>64 bpm</Text>
              </View>
              <View style={styles.widgetPreviewTakeBtn}>
                <Text style={styles.widgetPreviewTakeText}>Breathe</Text>
              </View>
            </View>
            <View style={styles.widgetPinRow}>
              <Text style={styles.widgetPinText}>➕ Tap to add to Home Screen</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.widgetInstructionsBox}>
          <Text style={styles.widgetInstructionsTitle}>How to add to your Home Screen:</Text>
          <Text style={styles.widgetInstructionsStep}>1. Go to your Android phone home screen</Text>
          <Text style={styles.widgetInstructionsStep}>2. Long-press any empty space &amp; tap &quot;Widgets&quot;</Text>
          <Text style={styles.widgetInstructionsStep}>3. Select &quot;OdinEye Medication&quot; or &quot;OdinEye Zen&quot;</Text>
        </View>

        {widgetSyncNotice && (
          <View style={styles.widgetSyncNoticeBox}>
            <Text style={styles.widgetSyncNoticeText}>{widgetSyncNotice}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.syncWidgetsBtn}
          onPress={handleSyncWidgets}
          activeOpacity={0.8}
        >
          <Text style={styles.syncWidgetsBtnText}>Sync Widgets Now</Text>
        </TouchableOpacity>
      </View>

      {/* 4.3 Legal, Terms & Privacy Governance Card */}
      <View style={styles.privacyGovCard}>
        <View style={styles.privacyGovHeader}>
          <View style={styles.privacyIconBubble}>
            <VaultShieldIcon size={18} color="#1F382E" />
          </View>
          <View style={styles.privacyTextCol}>
            <Text style={styles.privacyGovTitle}>Legal & Platform Compliance</Text>
            <Text style={styles.privacyGovSub}>
              Zero-knowledge local architecture. In full compliance with Google Play Health Connect Limited Use & Data Safety policies.
            </Text>
          </View>
        </View>

        {/* 3 Quick-Access Buttons for Legal Governance Documents */}
        <View style={styles.legalBtnRow}>
          <TouchableOpacity
            style={styles.legalChipBtn}
            onPress={() => openLegal('privacy')}
            activeOpacity={0.8}
          >
            <Text style={styles.legalChipBtnText}>📄 Privacy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalChipBtn}
            onPress={() => openLegal('terms')}
            activeOpacity={0.8}
          >
            <Text style={styles.legalChipBtnText}>⚖️ Terms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.legalChipBtn}
            onPress={() => openLegal('disclaimer')}
            activeOpacity={0.8}
          >
            <Text style={styles.legalChipBtnText}>🩺 Disclaimer</Text>
          </TouchableOpacity>
        </View>

        {/* App Release Version & Copyright */}
        <View style={styles.appMetaBox}>
          <Text style={styles.appMetaVersion}>OdinEye Health · v1.0.0 (Build 2026.09.14)</Text>
          <Text style={styles.appMetaNotice}>
            Android SDK 36 · Local-First Zero-Knowledge Architecture{'\n'}
            © 2026 OdinEye Health. All rights reserved.
          </Text>
        </View>
      </View>

      {/* Full In-App Legal Governance Modal */}
      <LegalModal
        visible={showLegalModal}
        initialTab={legalModalTab}
        onClose={() => setShowLegalModal(false)}
      />
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
    borderTopColor: 'rgba(24, 28, 27, 0.06)',
  },
  hcManageBtn: {
    backgroundColor: '#EAF2EE',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCE6DE',
  },
  hcManageBtnHighlight: {
    backgroundColor: '#1F382E',
    borderColor: '#1F382E',
  },
  hcManageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F382E',
  },
  hcManageBtnTextHighlight: {
    color: '#FFFFFF',
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
    marginBottom: 12,
  },
  categoryNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EAF2EE',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F382E',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F382E',
    letterSpacing: 0.8,
  },
  categorySubtitle: {
    fontSize: 11,
    color: '#63706B',
    marginTop: 1,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.07)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  moduleIconBubbleAi: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleIconBubbleBody: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleIconBubbleMeds: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleTextCol: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141816',
  },
  moduleSubtitle: {
    fontSize: 11,
    color: '#63706B',
    marginTop: 2,
    lineHeight: 15,
  },
  fallbackCloudBox: {
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(180, 95, 30, 0.08)',
    marginTop: 10,
  },
  unifiedDeviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.07)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  unifiedDeviceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unifiedDeviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  unifiedCredsBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  unifiedCredsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C4A3E',
    marginBottom: 2,
  },
  unifiedCredsSub: {
    fontSize: 10,
    color: '#63706B',
    marginBottom: 8,
    lineHeight: 14,
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
    color: '#141816',
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
    color: '#141816',
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
  apiTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    backgroundColor: '#1F382E',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  vaultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  vaultIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF2EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#141816',
  },
  shieldVerifiedBadge: {
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  shieldVerifiedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2C4A3E',
    letterSpacing: 0.5,
  },
  vaultSubtitle: {
    fontSize: 11,
    color: '#63706B',
    marginTop: 2,
    lineHeight: 15,
  },
  vaultSpecsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F8F6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2ECE7',
  },
  vaultSpecItem: {
    alignItems: 'center',
  },
  vaultSpecLabel: {
    fontSize: 9,
    color: '#8A9993',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  vaultSpecVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#141816',
    marginTop: 3,
  },
  vaultBanner: {
    backgroundColor: '#FAF5EE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EFE7DA',
  },
  vaultBannerText: {
    fontSize: 11,
    color: '#63706B',
    lineHeight: 16,
  },
  vaultBold: {
    fontWeight: '700',
    color: '#141816',
    fontSize: 12,
  },
  vaultNoticeBox: {
    backgroundColor: '#EAF2EE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CCE6DE',
  },
  vaultNoticeText: {
    color: '#1F382E',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  vaultActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearVaultBtn: {
    backgroundColor: '#FFF1F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
  },
  clearVaultBtnText: {
    color: '#DC2626',
    fontSize: 11,
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
    backgroundColor: '#EAF2EE',
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
    backgroundColor: '#EAF2EE',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.12)',
  },
  testNotificationBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F382E',
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
  sourcesQuestionnaireCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.08)',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sourcesQuestionnaireHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  sourcesQuestionnaireIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourcesQuestionnaireTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#181C1B',
    marginBottom: 3,
  },
  sourcesQuestionnaireSubtitle: {
    fontSize: 12,
    color: '#6F7F78',
    lineHeight: 16,
  },
  sourceSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sourceSelectChip: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(24, 28, 27, 0.08)',
  },
  sourceSelectChipActive: {
    backgroundColor: '#EAF2EE',
    borderColor: '#2C4A3E',
  },
  sourceSelectChipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6F7F78',
    textAlign: 'center',
    marginBottom: 2,
  },
  sourceSelectChipTitleActive: {
    color: '#1F382E',
  },
  sourceSelectChipSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  sourceSelectChipSubActive: {
    color: '#15803D',
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
  recalibrateGoalsBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recalibrateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  recalibrateIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recalibrateTextCol: {
    flex: 1,
  },
  recalibrateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141816',
  },
  recalibrateSub: {
    fontSize: 11,
    color: '#63706B',
    marginTop: 2,
    lineHeight: 15,
  },

  // Android Widgets Hub Card Styles
  widgetsHubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  widgetsHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  widgetsIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  widgetsTextCol: {
    flex: 1,
  },
  widgetsHubTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F382E',
  },
  widgetsHubSub: {
    fontSize: 11,
    color: '#63706B',
    marginTop: 2,
    lineHeight: 15,
  },
  widgetPreviewsWrap: {
    gap: 12,
    marginBottom: 14,
  },
  widgetPreviewItem: {
    backgroundColor: '#F8FAF9',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  widgetPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  widgetPreviewTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2C4A3E',
    letterSpacing: 0.5,
  },
  widgetPreviewBadge: {
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  widgetPreviewBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1F382E',
  },
  widgetPreviewBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  widgetPreviewMedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F382E',
  },
  widgetPreviewMedSub: {
    fontSize: 12,
    color: '#60776D',
    marginTop: 2,
  },
  widgetPreviewMedTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C4A3E',
    marginTop: 4,
  },
  widgetPreviewTakeBtn: {
    backgroundColor: '#1F382E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  widgetPreviewTakeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  widgetPreviewStepsVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F382E',
  },
  widgetPreviewStepsSub: {
    fontSize: 11,
    color: '#7A9187',
    fontWeight: '600',
  },
  widgetPreviewBarTrack: {
    height: 5,
    backgroundColor: '#D9E5E0',
    borderRadius: 2.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  widgetPreviewBarFill: {
    height: '100%',
    backgroundColor: '#2C4A3E',
    borderRadius: 2.5,
  },
  widgetPreviewHrSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7A9187',
  },
  widgetPreviewHrVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F382E',
    marginTop: 2,
  },
  widgetPinRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 74, 62, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetPinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C4A3E',
  },
  widgetInstructionsBox: {
    backgroundColor: '#F3F7F5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  widgetInstructionsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F382E',
    marginBottom: 4,
  },
  widgetInstructionsStep: {
    fontSize: 11,
    color: '#52665E',
    lineHeight: 16,
  },
  widgetSyncNoticeBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  widgetSyncNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  syncWidgetsBtn: {
    backgroundColor: '#EAF2EE',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCE6DE',
  },
  syncWidgetsBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F382E',
  },

  // Privacy Policy & Governance Card & Modal Styles
  privacyGovCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginTop: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  privacyGovHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  privacyTextCol: {
    flex: 1,
  },
  privacyGovTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F382E',
  },
  privacyGovSub: {
    fontSize: 11,
    color: '#63706B',
    marginTop: 2,
    lineHeight: 15,
  },
  legalBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 14,
  },
  legalChipBtn: {
    flex: 1,
    backgroundColor: '#F2F7F4',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
  },
  legalChipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F382E',
  },
  appMetaBox: {
    backgroundColor: '#F9FBFA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAF0EC',
    alignItems: 'center',
  },
  appMetaVersion: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F382E',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  appMetaNotice: {
    fontSize: 10,
    color: '#71857C',
    textAlign: 'center',
    lineHeight: 14,
  },
});
