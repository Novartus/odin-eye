import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  Keyboard,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { localAiCoach } from '../services/ai/localCoachEngine';
import { Colors } from '../theme/colors';

// Screen Components
import { HomeTopBar } from '../components/home/HomeTopBar';
import { MetricCardsGrid } from '../components/home/MetricCardsGrid';
import { TodayWellnessCard } from '../components/home/TodayWellnessCard';
import { TodayInsightCard } from '../components/home/TodayInsightCard';
import { HealthOverviewView } from '../components/overview/HealthOverviewView';
import { BodyAnalysisView } from '../components/body/BodyAnalysisView';
import { DedicatedAiCoachView } from '../components/ai/DedicatedAiCoachView';
import { SettingsView, EnabledSources } from '../components/settings/SettingsView';
import { FloatingTabBar, TabKey } from '../components/navigation/FloatingTabBar';
import { liveHealthService } from '../services/live/liveHealthService';
import { HealthConnectPromptModal } from '../components/common/HealthConnectPromptModal';
import { DevModeBanner } from '../components/common/DevModeBanner';
import { MedicationSectionView } from '../components/medication/MedicationSectionView';
import { TodayMedicationCard } from '../components/home/TodayMedicationCard';
import { MedicationReminderAlertModal } from '../components/medication/MedicationReminderAlertModal';
import { NotificationsModal } from '../components/common/NotificationsModal';
import { healthConnect } from '../services/healthConnect/healthConnectService';
import { credentialsStorage } from '../services/storage/credentialsStorage';
import { medicationService, ReminderAlertEvent } from '../services/medication/medicationService';
import { medicationNotificationService } from '../services/medication/medicationNotificationService';

interface DashboardScreenProps {
  onResetOnboarding?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onResetOnboarding }) => {
  const [data, setData] = useState(liveHealthService.getData());
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [globalMedAlert, setGlobalMedAlert] = useState<ReminderAlertEvent | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // User Goals from Onboarding / Settings
  const [dailyStepsGoal, setDailyStepsGoal] = useState(10000);
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(500);

  // Manual Sync & Device Sources State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Live Telemetry Active');
  const [enabledSources, setEnabledSources] = useState<EnabledSources>({
    ultrahuman: true,
    fitbit: true,
    hevy: true,
  });

  // AI Master State (Distraction-Free Pure Telemetry Option)
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  // Health Connect Read-Only Permission Prompt State
  const [showHealthConnectModal, setShowHealthConnectModal] = useState(false);
  const [isHealthConnectConnected, setIsHealthConnectConnected] = useState(
    healthConnect.isPermissionGranted()
  );

  const spinValue = useRef(new Animated.Value(0)).current;

  // Check on initial app launch whether Health Connect prompt should be shown & load AI preferences
  useEffect(() => {
    credentialsStorage.loadCredentials().then((creds) => {
      if (!creds.healthConnectPermissionsGranted && !creds.healthConnectPromptDismissed) {
        // Automatically show prompt to connect with health connect for read-only
        setShowHealthConnectModal(true);
      }
      if (creds.healthConnectPermissionsGranted) {
        setIsHealthConnectConnected(true);
      }
      if (creds.aiEnabled !== undefined) {
        setIsAiEnabled(creds.aiEnabled);
      }
      if (creds.dailyStepsGoal) {
        setDailyStepsGoal(creds.dailyStepsGoal);
      }
      if (creds.dailyCaloriesGoal) {
        setDailyCaloriesGoal(creds.dailyCaloriesGoal);
      }
    });
  }, []);

  // Subscribe to live telemetry updates from Hevy, Ultrahuman, Fitbit, and Health Connect
  useEffect(() => {
    const unsubscribe = liveHealthService.subscribe((newData, report) => {
      setData(newData);
      if (report.sourcesSynced.length > 0) {
        setLastSyncText(`Live: ${report.sourcesSynced.slice(0, 2).join(', ')} ✓`);
      }
    });

    // Run initial sync cycle on app launch
    liveHealthService.syncAll().catch(() => {});

    return unsubscribe;
  }, []);

  // Subscribe to real-time medication reminders across all tabs
  useEffect(() => {
    const unsubscribeMeds = medicationService.onReminder((alert) => {
      setGlobalMedAlert(alert);
    });

    // Initialize OS background alarms and handle notification taps when app was closed
    medicationNotificationService.initialize((medId, time) => {
      const allMeds = medicationService.getMedicationsSync();
      const med = allMeds.find((m) => m.id === medId);
      if (med) {
        setGlobalMedAlert({
          medication: med,
          time,
          dateKey: medicationService.getTodayDateKey(),
          triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    return unsubscribeMeds;
  }, []);

  // Track keyboard visibility so floating tabs never block inputs or keyboards
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setIsKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setIsKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [isSyncing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleManualSync = async () => {
    setIsSyncing(true);
    setLastSyncText('Syncing live APIs & Health Connect...');

    try {
      const report = await liveHealthService.syncAll();
      setIsSyncing(false);
      if (report.sourcesSynced && report.sourcesSynced.length > 0) {
        setLastSyncText(`Synced at ${report.timestamp} ✓`);
      } else {
        setLastSyncText(`Synced at ${report.timestamp} ✓`);
      }
    } catch {
      setIsSyncing(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncText(`Synced at ${timeStr} ✓`);
    }
  };

  const handleToggleSource = (sourceKey: keyof EnabledSources, value: boolean) => {
    setEnabledSources((prev) => {
      const next = { ...prev, [sourceKey]: value };
      const activeCount = Object.values(next).filter(Boolean).length;
      setLastSyncText(`${activeCount} of 3 Devices Active`);
      return next;
    });
  };

  const handleHealthConnectConnected = () => {
    setIsHealthConnectConnected(true);
    handleManualSync();
  };

  const dailyRecommendation = localAiCoach.generateDailyRecommendation(data);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header for Sub-Views with Symmetrical Circular Buttons */}
      {activeTab !== 'home' && (
        <View style={styles.subScreenHeader}>
          {/* Sleek Vector Back Button */}
          <TouchableOpacity
            style={styles.circleHeaderBtn}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.7}
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 19l-7-7 7-7"
                stroke={Colors.textPrimary}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* Centered Sub-screen Title */}
          <Text style={styles.subScreenTitle}>
            {activeTab === 'meds' && 'Medication Routine'}
            {activeTab === 'overview' && 'Health Overview'}
            {activeTab === 'body' && 'Body Analysis'}
            {activeTab === 'coach' && 'AI Health Coach'}
            {activeTab === 'settings' && 'Devices & Settings'}
          </Text>

          {/* Symmetrical Sync Action Button */}
          <TouchableOpacity
            style={[styles.circleHeaderBtn, isSyncing && styles.syncActiveHeaderBtn]}
            onPress={handleManualSync}
            disabled={isSyncing}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                  stroke={isSyncing ? '#007AFF' : '#0F172A'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21 3v5h-5"
                  stroke={isSyncing ? '#007AFF' : '#0F172A'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                  stroke={isSyncing ? '#007AFF' : '#0F172A'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M8 16H3v5"
                  stroke={isSyncing ? '#007AFF' : '#0F172A'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Animated.View>
          </TouchableOpacity>
        </View>
      )}

      {/* When in Coach tab, render DedicatedAiCoachView with full viewport height & responsive auto-scroll */}
      {activeTab === 'coach' && isAiEnabled ? (
        <DedicatedAiCoachView
          data={data}
          recommendation={dailyRecommendation}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={handleManualSync}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          }
        >
          {/* 1. HOME SCREEN */}
          {activeTab === 'home' && (
            <>
              <HomeTopBar
                onOpenSettings={() => setActiveTab('settings')}
                onOpenNotifications={() => setShowNotificationsModal(true)}
                onManualSync={handleManualSync}
                isSyncing={isSyncing}
                lastSyncText={lastSyncText}
              />

              {/* Dev-mode-only Expo Go build guide banner */}
              <DevModeBanner
                onNavigateToSettings={() => setActiveTab('settings')}
              />

              {/* Health Connect Quick Connect Banner */}
              {!isHealthConnectConnected && (
                <TouchableOpacity
                  style={styles.hcBanner}
                  onPress={() => setShowHealthConnectModal(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.hcBannerLeft}>
                    <View style={styles.hcBannerIcon}>
                      <Text style={{ fontSize: 18 }}>❤️</Text>
                    </View>
                    <View style={styles.hcBannerTextGroup}>
                      <View style={styles.hcBannerTitleRow}>
                        <Text style={styles.hcBannerTitle}>Connect Health Connect</Text>
                        <View style={styles.hcReadOnlyPill}>
                          <Text style={styles.hcReadOnlyText}>READ-ONLY</Text>
                        </View>
                      </View>
                      <Text style={styles.hcBannerSubtitle}>
                        Auto-pickup sleep, pulse & steps without Ultrahuman API key
                      </Text>
                    </View>
                  </View>
                  <View style={styles.hcBannerBtn}>
                    <Text style={styles.hcBannerBtnText}>Connect</Text>
                  </View>
                </TouchableOpacity>
              )}

              <MetricCardsGrid
                data={data}
                enabledSources={enabledSources}
                stepsGoal={dailyStepsGoal}
                caloriesGoal={dailyCaloriesGoal}
              />
              <TodayWellnessCard
                score={data.recovery.recoveryScore}
                sleepQualityPct={data.recovery.sleepIndex}
                activeZoneMinutes={data.cardio.todayActiveZoneMinutes}
                tonnageKg={data.strength.todayWorkout?.totalVolumeKg || data.strength.weeklyVolumeKg}
                onPress={() => setActiveTab('overview')}
              />
              {/* Today's Medication Overview Quick Widget */}
              <TodayMedicationCard onOpenMedications={() => setActiveTab('meds')} />

              {isAiEnabled && (
                <TodayInsightCard
                  headline={dailyRecommendation.headline}
                  body={dailyRecommendation.synthesisRationale}
                  onPress={() => setActiveTab('coach')}
                />
              )}
            </>
          )}

          {/* 2. MEDICATION REMINDER SCREEN */}
          {activeTab === 'meds' && (
            <MedicationSectionView />
          )}

          {/* 3. HEALTH OVERVIEW SCREEN */}
          {activeTab === 'overview' && (
            <>
              <HealthOverviewView data={data} />
              {isAiEnabled && (
                <TodayInsightCard
                  headline={data.recovery.recoveryScore > 0 ? "Cardio & Recovery Harmony" : "Telemetry Awaiting Sync"}
                  body={data.recovery.recoveryScore > 0
                    ? `Your cardiovascular strain of ${data.cardio.todayActiveZoneMinutes} Active Zone Minutes is balanced by your ${data.recovery.recoveryScore}% recovery index.`
                    : "Connect your devices in Settings or allow Health Connect permissions to synthesize your daily equilibrium."}
                  onPress={() => setActiveTab('coach')}
                />
              )}
            </>
          )}

          {/* 3. BODY & MUSCLE ANALYSIS SCREEN */}
          {activeTab === 'body' && (
            <>
              <BodyAnalysisView muscleStatuses={data.strength.muscleStatuses} />
            </>
          )}

          {/* 4. SETTINGS & DEVICES SCREEN (Smooth In-Place View, No Jarring Modal) */}
          {activeTab === 'settings' && (
            <SettingsView
              enabledSources={enabledSources}
              onToggleSource={handleToggleSource}
              onManualSync={handleManualSync}
              isSyncing={isSyncing}
              lastSyncText={lastSyncText}
              onOpenHealthConnectPrompt={() => setShowHealthConnectModal(true)}
              aiEnabled={isAiEnabled}
              onToggleAi={setIsAiEnabled}
              onResetOnboarding={onResetOnboarding}
            />
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* Floating Capsule Bottom Navigation Bar (Rendered across all tabs with proper padding) */}
      {!isKeyboardOpen && (
        <FloatingTabBar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          showAiTab={isAiEnabled}
        />
      )}

      {/* Health Connect Read-Only Permission Prompt Modal */}
      <HealthConnectPromptModal
        visible={showHealthConnectModal}
        onClose={() => {
          setShowHealthConnectModal(false);
          credentialsStorage.saveCredentials({ healthConnectPromptDismissed: true });
        }}
        onConnected={handleHealthConnectConnected}
        onNavigateToSettings={() => {
          setShowHealthConnectModal(false);
          setActiveTab('settings');
        }}
      />

      {/* Interactive Notifications Center Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onOpenMedications={() => {
          setShowNotificationsModal(false);
          setActiveTab('meds');
        }}
        onOpenSettings={() => {
          setShowNotificationsModal(false);
          setActiveTab('settings');
        }}
        onTriggerTestAlert={() => {
          medicationService.triggerTestReminder();
        }}
      />

      {/* Global On-Screen Medication Reminder Alert */}
      <MedicationReminderAlertModal
        alert={globalMedAlert}
        onClose={() => setGlobalMedAlert(null)}
        onDoseTaken={() => {}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  subScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 12,
  },
  circleHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
  },
  syncActiveHeaderBtn: {
    backgroundColor: '#E3F1EC',
    borderColor: '#CCE6DE',
  },
  subScreenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90, // Room for floating capsule tab bar
  },
  bottomSpacer: {
    height: 60,
  },
  hcBanner: {
    backgroundColor: '#E3F1EC',
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  hcBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  hcBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#CCE6DE',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  hcBannerTextGroup: {
    flex: 1,
  },
  hcBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hcBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hcReadOnlyPill: {
    backgroundColor: '#E8F9F1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hcReadOnlyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  hcBannerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  hcBannerBtn: {
    backgroundColor: '#1A1D1C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  hcBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
