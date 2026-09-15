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
  AppState,
  Vibration,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { runWhenIdle, getTodayDateKey } from '../utils';
import { localAiCoach } from '../services/ai/localCoachEngine';
import { Colors } from '../theme/colors';

// Screen Components
import { HomeTopBar } from '../components/home/HomeTopBar';
import { MetricCardsGrid } from '../components/home/MetricCardsGrid';
import { TodayWellnessCard } from '../components/home/TodayWellnessCard';
import { SleepArchitectureBentoCard } from '../components/home/SleepArchitectureBentoCard';
import { TodayInsightCard } from '../components/home/TodayInsightCard';
import { HealthOverviewView } from '../components/overview/HealthOverviewView';
import { BodyAnalysisView } from '../components/body/BodyAnalysisView';
import { DedicatedAiCoachView } from '../components/ai/DedicatedAiCoachView';
import { SettingsView } from '../components/settings/SettingsView';
import { FloatingTabBar } from '../components/navigation/FloatingTabBar';
import { EnabledSources, TabKey, ReminderAlertEvent, DashboardScreenProps } from '../types';
import { liveHealthService } from '../services/live/liveHealthService';
import { HealthConnectPromptModal } from '../components/common/HealthConnectPromptModal';
import { DevModeBanner } from '../components/common/DevModeBanner';
import { MedicationSectionView } from '../components/medication/MedicationSectionView';
import { MindfulnessView } from '../components/mindfulness/MindfulnessView';
import { TodayMedicationCard } from '../components/home/TodayMedicationCard';
import { TodayZenCard } from '../components/home/TodayZenCard';
import { MedicationReminderAlertModal } from '../components/medication/MedicationReminderAlertModal';
import { NotificationsModal } from '../components/common/NotificationsModal';
import { healthConnect } from '../services/healthConnect/healthConnectService';
import { credentialsStorage } from '../services/storage/credentialsStorage';
import { medicationService } from '../services/medication/medicationService';
import { medicationNotificationService } from '../services/medication/medicationNotificationService';
import { widgetSyncService } from '../services/widgets/widgetSyncService';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onResetOnboarding }) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState(liveHealthService.getData());
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [globalMedAlert, setGlobalMedAlert] = useState<ReminderAlertEvent | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // User Goals from Onboarding / Settings
  const [dailyStepsGoal, setDailyStepsGoal] = useState(10000);
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(500);
  const [targetSleepGoal, setTargetSleepGoal] = useState(8.0);

  // Manual Sync & Device Sources State
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Live Telemetry Active');
  const [enabledSources, setEnabledSources] = useState<EnabledSources>({
    ultrahuman: false,
    fitbit: true,
    hevy: true,
  });

  // AI Master State (Distraction-Free Pure Telemetry Option)
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  // Body Analysis State (Optional Biomechanical & Muscle Clock Modules)
  const [isBodyAnalysisEnabled, setIsBodyAnalysisEnabled] = useState(true);

  // Mindfulness & Breathing State (Optional Zen Module)
  const [isMindfulnessEnabled, setIsMindfulnessEnabled] = useState(true);

  // Health Connect Read-Only Permission Prompt State
  const [showHealthConnectModal, setShowHealthConnectModal] = useState(false);
  const [isHealthConnectConnected, setIsHealthConnectConnected] = useState(
    healthConnect.isPermissionGranted()
  );

  const spinValue = useRef(new Animated.Value(0)).current;
  const tabFadeAnim = useRef(new Animated.Value(1)).current;
  const syncPulseAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Fluid 60 FPS tab transition without layout jumping
  const switchTab = (nextTab: TabKey) => {
    if (nextTab === activeTab) return;
    try {
      Vibration.vibrate(28);
    } catch {}
    Animated.timing(tabFadeAnim, {
      toValue: 0,
      duration: 70,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(nextTab);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      Animated.timing(tabFadeAnim, {
        toValue: 1,
        duration: 130,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleToggleBodyAnalysis = (val: boolean) => {
    setIsBodyAnalysisEnabled(val);
    if (!val && activeTab === 'body') {
      switchTab('home');
    }
  };

  const handleToggleMindfulness = (val: boolean) => {
    setIsMindfulnessEnabled(val);
    credentialsStorage.saveCredentials({ mindfulnessEnabled: val });
    if (!val && activeTab === 'zen') {
      switchTab('home');
    }
  };

  useEffect(() => {
    if (isSyncing) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(syncPulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(syncPulseAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      syncPulseAnim.setValue(0);
    }
  }, [isSyncing]);

  // Check on initial app launch whether Health Connect prompt should be shown & load AI/Body preferences
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
      if (creds.bodyAnalysisEnabled !== undefined) {
        setIsBodyAnalysisEnabled(creds.bodyAnalysisEnabled);
      }
      if (creds.mindfulnessEnabled !== undefined) {
        setIsMindfulnessEnabled(creds.mindfulnessEnabled);
      }
      if (creds.dailyStepsGoal) {
        setDailyStepsGoal(creds.dailyStepsGoal);
      }
      if (creds.dailyCaloriesGoal) {
        setDailyCaloriesGoal(creds.dailyCaloriesGoal);
      }
      if (creds.targetSleepDurationHours) {
        setTargetSleepGoal(creds.targetSleepDurationHours);
      }
      if (creds.enabledSources) {
        setEnabledSources(creds.enabledSources);
        const activeCount = Object.values(creds.enabledSources).filter(Boolean).length;
        setLastSyncText(`${activeCount} of 3 Devices Active`);
      }
    });

    // Initialize Android Home Screen AppWidgets synchronization & deep-link check
    const cancelWidgetSync = runWhenIdle(() => {
      widgetSyncService.init();
      widgetSyncService.getRequestedTab().then((tab) => {
        if (tab === 'meds' || tab === 'zen') {
          switchTab(tab as TabKey);
        }
      });
    });

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        widgetSyncService.processPendingWidgetActions();
        widgetSyncService.getRequestedTab().then((tab) => {
          if (tab === 'meds' || tab === 'zen') {
            switchTab(tab as TabKey);
          }
        });
      }
    });

    return () => {
      cancelWidgetSync();
      appStateSub.remove();
    };
  }, []);

  // Subscribe to live telemetry updates from Hevy, Ultrahuman, Fitbit, and Health Connect
  useEffect(() => {
    const unsubscribe = liveHealthService.subscribe((newData, report) => {
      setData(newData);
      if (report.sourcesSynced.length > 0) {
        setLastSyncText(`Live: ${report.sourcesSynced.slice(0, 2).join(', ')} ✓`);
      }
    });

    // Run initial sync cycle in background after screen transition settles
    const cancelSync = runWhenIdle(() => {
      liveHealthService.syncAll().catch(() => {});
    });

    return () => {
      cancelSync();
      unsubscribe();
    };
  }, []);

  // Subscribe to real-time medication reminders across all tabs
  useEffect(() => {
    const unsubscribeMeds = medicationService.onReminder((alert) => {
      setGlobalMedAlert(alert);
    });

    // Initialize OS background alarms and handle notification taps when app was closed
    const cancelNotif = runWhenIdle(() => {
      medicationNotificationService.initialize((medId, time) => {
        const allMeds = medicationService.getMedicationsSync();
        const med = allMeds.find((m) => m.id === medId);
        if (med) {
          setGlobalMedAlert({
            medication: med,
            time,
            dateKey: getTodayDateKey(),
            triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }
      }).then(() => {
        medicationService.getMedications().then((meds) => {
          const active = meds.filter((m) => !m.isArchived);
          if (active.length > 0) {
            medicationNotificationService.scheduleAllMedicationAlarms(active).catch(() => {});
          }
        });
      });
    });

    return () => {
      cancelNotif();
      unsubscribeMeds();
    };
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
      credentialsStorage.saveCredentials({ enabledSources: next }).then(() => {
        liveHealthService.syncAll();
        widgetSyncService.syncAllWidgets();
      });
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

      {/* Fixed-Height Permanent Header Bar (Never mounts/unmounts, eliminating layout jumps) */}
      <View style={styles.fixedHeaderArea}>
        {activeTab === 'home' ? (
          <HomeTopBar
            onOpenSettings={() => switchTab('settings')}
            onOpenNotifications={() => setShowNotificationsModal(true)}
            onManualSync={handleManualSync}
            isSyncing={isSyncing}
            lastSyncText={lastSyncText}
          />
        ) : (
          <View style={styles.subScreenHeader}>
            {/* Sleek Vector Back Button */}
            <TouchableOpacity
              style={styles.circleHeaderBtn}
              onPress={() => switchTab('home')}
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
              {activeTab === 'meds' && 'Meds'}
              {activeTab === 'overview' && 'Vitals'}
              {activeTab === 'body' && 'Body'}
              {activeTab === 'zen' && 'Zen'}
              {activeTab === 'coach' && 'AI'}
              {activeTab === 'settings' && 'Config'}
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
      </View>

      {/* Dynamic Sync Banner Strip */}
      {isSyncing && (
        <Animated.View
          style={[
            styles.syncingBannerStrip,
            {
              opacity: syncPulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            },
          ]}
        >
          <View style={styles.syncingDot} />
          <Text style={styles.syncingBannerText}>Syncing fresh telemetry...</Text>
        </Animated.View>
      )}

      {/* Main Tab Screen Body with 60 FPS Native Opacity Transition */}
      <Animated.View style={{ flex: 1, opacity: tabFadeAnim }}>
        {activeTab === 'coach' && isAiEnabled ? (
          <DedicatedAiCoachView
            data={data}
            recommendation={dailyRecommendation}
          />
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 70, 90) },
            ]}
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
                {/* Dev-mode-only Expo Go build guide banner */}
                <DevModeBanner
                  onNavigateToSettings={() => switchTab('settings')}
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
                        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <Path
                            d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
                            stroke="#E11D48"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <Path
                            d="M9 12l2 2l3 -4"
                            stroke="#E11D48"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <View style={styles.hcBannerTextGroup}>
                        <View style={styles.hcBannerTitleRow}>
                          <Text style={styles.hcBannerTitle}>Connect Health Connect</Text>
                          <View style={styles.hcReadOnlyPill}>
                            <Text style={styles.hcReadOnlyText}>READ-ONLY</Text>
                          </View>
                        </View>
                        <Text style={styles.hcBannerSubtitle}>
                          Auto-pickup sleep, pulse & steps from Fitbit, Wear OS or phone
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
                  onPress={() => switchTab('overview')}
                />
                {/* 7-Day Sleep Debt & Physical vs. Cognitive Sleep Architecture */}
                <SleepArchitectureBentoCard
                  recovery={data.recovery}
                  targetSleepHours={targetSleepGoal}
                  onPress={() => switchTab('overview')}
                />
                {/* Today's Medication Overview Quick Widget */}
                <TodayMedicationCard onOpenMedications={() => switchTab('meds')} />

                {/* Today's Mindfulness & Zen Quick Widget */}
                {isMindfulnessEnabled && (
                  <TodayZenCard onOpenZen={() => switchTab('zen')} />
                )}

                {isAiEnabled && (
                  <TodayInsightCard
                    headline={dailyRecommendation.headline}
                    body={dailyRecommendation.synthesisRationale}
                    onPress={() => switchTab('coach')}
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
                    onPress={() => switchTab('coach')}
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

            {/* 5. ZEN — MINDFULNESS & BREATHING SCREEN */}
            {activeTab === 'zen' && (
              <MindfulnessView />
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
                bodyAnalysisEnabled={isBodyAnalysisEnabled}
                onToggleBodyAnalysis={handleToggleBodyAnalysis}
                mindfulnessEnabled={isMindfulnessEnabled}
                onToggleMindfulness={handleToggleMindfulness}
                onResetOnboarding={onResetOnboarding}
              />
            )}

            <View style={[styles.bottomSpacer, { height: Math.max(insets.bottom, 20) + 40 }]} />
          </ScrollView>
        )}
      </Animated.View>

      {/* Floating Capsule Bottom Navigation Bar (Rendered across all tabs with proper padding) */}
      {!isKeyboardOpen && (
        <FloatingTabBar
          activeTab={activeTab}
          onSelectTab={(tab) => switchTab(tab)}
          showAiTab={isAiEnabled}
          showBodyAnalysisTab={isBodyAnalysisEnabled}
          showMindfulnessTab={isMindfulnessEnabled}
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
          switchTab('settings');
        }}
      />

      {/* Interactive Notifications Center Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onOpenMedications={() => {
          setShowNotificationsModal(false);
          switchTab('meds');
        }}
        onOpenSettings={() => {
          setShowNotificationsModal(false);
          switchTab('settings');
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
  fixedHeaderArea: {
    height: 60,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  subScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 60,
  },
  circleHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    paddingTop: 8,
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
  syncingBannerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4FE',
    paddingVertical: 6,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D0E8FD',
  },
  syncingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  syncingBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    letterSpacing: 0.2,
  },
});
