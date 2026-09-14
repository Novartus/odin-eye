import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  Switch,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { credentialsStorage } from '../services/storage/credentialsStorage';
import { LegalModal } from '../components/legal/LegalModal';
import { medicationNotificationService } from '../services/medication/medicationNotificationService';

interface OnboardingScreenProps {
  onFinish: (config: {
    stepsGoal: number;
    caloriesGoal: number;
    mindfulnessGoal?: number;
    enabledSources?: { ultrahuman: boolean; fitbit: boolean; hevy: boolean };
    aiEnabled?: boolean;
    bodyAnalysisEnabled?: boolean;
    mindfulnessEnabled?: boolean;
  }) => void;
  initialStep?: 1 | 2 | 3;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish, initialStep = 1 }) => {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);

  // Goal selections with recommended defaults
  const [stepsGoal, setStepsGoal] = useState<number>(10000);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(500);
  const [mindfulnessGoal, setMindfulnessGoal] = useState<number>(10);

  // Feature and source selections (Screen 3: What to enable)
  const [enabledSources, setEnabledSources] = useState<{ ultrahuman: boolean; fitbit: boolean; hevy: boolean }>({
    ultrahuman: false, // Disabled by default
    fitbit: true,
    hevy: true,
  });
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [bodyAnalysisEnabled, setBodyAnalysisEnabled] = useState<boolean>(true);
  const [mindfulnessEnabled, setMindfulnessEnabled] = useState<boolean>(true);

  useEffect(() => {
    credentialsStorage.loadCredentials().then((creds) => {
      if (creds.dailyStepsGoal) setStepsGoal(creds.dailyStepsGoal);
      if (creds.dailyCaloriesGoal) setCaloriesGoal(creds.dailyCaloriesGoal);
      if (creds.dailyMindfulnessGoal) setMindfulnessGoal(creds.dailyMindfulnessGoal);
      if (creds.enabledSources) {
        setEnabledSources(creds.enabledSources);
      }
      if (creds.aiEnabled !== undefined) setAiEnabled(creds.aiEnabled);
      if (creds.bodyAnalysisEnabled !== undefined) setBodyAnalysisEnabled(creds.bodyAnalysisEnabled);
      if (creds.mindfulnessEnabled !== undefined) setMindfulnessEnabled(creds.mindfulnessEnabled);
    });
  }, []);

  // Step transition animations (60 FPS native driver)
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToStep = (targetStep: 1 | 2 | 3) => {
    const isForward = targetStep > step;
    const exitOffset = isForward ? -28 : 28;
    const enterOffset = isForward ? 28 : -28;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: exitOffset,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(targetStep);
      slideAnim.setValue(enterOffset);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleToggleSource = (sourceKey: 'ultrahuman' | 'fitbit' | 'hevy', val: boolean) => {
    try {
      Vibration.vibrate(22);
    } catch {}
    setEnabledSources((prev) => ({ ...prev, [sourceKey]: val }));
  };

  const handleToggleFeature = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    try {
      Vibration.vibrate(22);
    } catch {}
    setter(val);
  };

  const stepPresets = [
    { val: 6000, label: 'Gentle', sub: 'Easy Pacing' },
    { val: 8000, label: 'Baseline', sub: 'Healthy Habit' },
    { val: 10000, label: 'Recommended', sub: 'Optimal Health' },
    { val: 12000, label: 'Active', sub: 'High Energy' },
  ];

  const caloriePresets = [
    { val: 350, label: 'Light', sub: 'Moderate Day' },
    { val: 500, label: 'Balanced', sub: 'Recommended' },
    { val: 700, label: 'High', sub: 'Active Training' },
    { val: 900, label: 'Intense', sub: 'Athlete Volume' },
  ];

  const mindfulnessPresets = [
    { val: 5, label: 'Gentle', sub: '5m Reset' },
    { val: 10, label: 'Balanced', sub: 'Daily Habit' },
    { val: 15, label: 'Deep', sub: 'Restorative' },
    { val: 20, label: 'Immersion', sub: 'Zen Master' },
  ];

  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy' | 'disclaimer'>('privacy');

  const openLegal = (tab: 'terms' | 'privacy' | 'disclaimer') => {
    setLegalModalTab(tab);
    setShowLegalModal(true);
  };

  const handleComplete = async () => {
    // Proactively request notification permissions for medication reminders & alerts
    try {
      await medicationNotificationService.requestNotificationPermission();
    } catch {}

    await credentialsStorage.saveCredentials({
      hasCompletedOnboarding: true,
      dailyStepsGoal: stepsGoal,
      dailyCaloriesGoal: caloriesGoal,
      dailyMindfulnessGoal: mindfulnessGoal,
      enabledSources,
      aiEnabled,
      bodyAnalysisEnabled,
      mindfulnessEnabled,
    });
    onFinish({
      stepsGoal,
      caloriesGoal,
      mindfulnessGoal,
      enabledSources,
      aiEnabled,
      bodyAnalysisEnabled,
      mindfulnessEnabled,
    });
  };

  const handleStepIncrement = (delta: number) => {
    setStepsGoal((prev) => Math.max(3000, Math.min(30000, prev + delta)));
  };

  const handleCaloriesIncrement = (delta: number) => {
    setCaloriesGoal((prev) => Math.max(150, Math.min(3000, prev + delta)));
  };

  const handleMindfulnessIncrement = (delta: number) => {
    setMindfulnessGoal((prev) => Math.max(2, Math.min(60, prev + delta)));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Persistent Top Progress Header (1/3, 2/3, 3/3) */}
      <View style={styles.topProgressContainer}>
        {step > 1 ? (
          <TouchableOpacity
            style={styles.topProgressBackBtn}
            onPress={() => goToStep((step - 1) as 1 | 2)}
            activeOpacity={0.7}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 19l-7-7 7-7"
                stroke="#141816"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        ) : (
          <View style={styles.topBrandPill}>
            <Text style={styles.topBrandEmoji}>🌿</Text>
          </View>
        )}

        {/* Center: 3 Segmented Progress Bars */}
        <View style={styles.progressBarWrapper}>
          <View style={styles.segmentTrackRow}>
            <View style={[styles.segmentBar, step >= 1 && styles.segmentBarActive]} />
            <View style={[styles.segmentBar, step >= 2 && styles.segmentBarActive]} />
            <View style={[styles.segmentBar, step >= 3 && styles.segmentBarActive]} />
          </View>
        </View>

        {/* Right: Explicit Step Fraction Badge (1/3, 2/3, 3/3) */}
        <View style={styles.stepFractionBadge}>
          <Text style={styles.stepFractionText}>{step}/3</Text>
        </View>
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {step === 1 ? (
        /* STEP 1: "LET'S GET STARTED" WELCOME SCREEN */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.welcomeScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Emblem Logo */}
          <View style={styles.welcomeLogoWrap}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.welcomeLogoImage}
              resizeMode="contain"
            />
          </View>

          {/* Top Brand Pill */}
          <View style={styles.welcomePill}>
            <Text style={styles.welcomePillText}>🌿 STEP 1 OF 3 · GETTING STARTED</Text>
          </View>

          {/* Headline & Subtitle */}
          <Text style={styles.heroHeadline}>
            Find Your Balance,{'\n'}
            <Text style={styles.heroHeadlineHighlight}>Cultivate Your Health.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Centralized telemetry from Ultrahuman Ring, Fitbit, Hevy & Health Connect — processed securely and privately on your device.
          </Text>

          {/* Artistic Bento Preview Stack (Matching Reference Design Mockup) */}
          <View style={styles.bentoPreviewStack}>
            {/* Mint Walking Preview Card */}
            <View style={styles.previewMintCard}>
              <View style={styles.previewCardLeft}>
                <View style={styles.previewWhiteBadge}>
                  <Text style={styles.previewWhiteBadgeText}>👟 Walking</Text>
                </View>
                <Text style={styles.previewBigPercent}>88%</Text>
                <Text style={styles.previewGoalSub}>Total in this day</Text>
              </View>
              <View style={styles.previewRingGauge}>
                <Svg width="72" height="72" viewBox="0 0 72 72">
                  <Circle cx="36" cy="36" r="30" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="5" fill="none" />
                  <Circle
                    cx="36"
                    cy="36"
                    r="30"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeDasharray="188"
                    strokeDashoffset="35"
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-90 36 36)"
                  />
                </Svg>
                <View style={styles.previewInnerDisk}>
                  <Text style={styles.previewDiskVal}>8.8k</Text>
                  <Text style={styles.previewDiskUnit}>steps</Text>
                </View>
              </View>
            </View>

            {/* 2-Column Mini Bento Strip */}
            <View style={styles.previewMiniRow}>
              {/* Obsidian Sleep Card */}
              <View style={styles.previewObsidianCard}>
                <View style={styles.obsidianTopRow}>
                  <Text style={styles.obsidianLabel}>Rest & Sleep</Text>
                  <Text style={{ fontSize: 16 }}>🌙</Text>
                </View>
                <Text style={styles.obsidianScore}>92%</Text>
                <Text style={styles.obsidianSub}>Deep Sleep Optimal</Text>
              </View>

              {/* Lilac Recovery Card */}
              <View style={styles.previewLilacCard}>
                <View style={styles.lilacTopRow}>
                  <Text style={styles.lilacLabel}>Recovery</Text>
                  <View style={styles.lilacMiniCircle}>
                    <Text style={{ fontSize: 12 }}>🐾</Text>
                  </View>
                </View>
                <Text style={styles.lilacScore}>85%</Text>
                <Text style={styles.lilacSub}>Steady Balance</Text>
              </View>
            </View>
          </View>

          {/* Privacy & Hardware Trust Badges */}
          <View style={styles.trustBanner}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
              <Rect x="3" y="11" width="18" height="11" rx="2" stroke="#1F382E" strokeWidth="2" fill="#E8F4F0" />
              <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1F382E" strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <Text style={styles.trustBannerText}>
              100% On-Device AI & Encrypted Storage. Zero Telemetry Sharing.
            </Text>
          </View>

          {/* Bottom CTA Action Button */}
          <TouchableOpacity
            style={styles.primaryPillBtn}
            onPress={() => goToStep(2)}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryPillBtnText}>Let's get started</Text>
            <View style={styles.whiteArrowCircle}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="#181C1B"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* Legal Consent & Disclaimers */}
          <View style={styles.legalConsentRow}>
            <Text style={styles.legalConsentText}>
              By continuing, you agree to OdinEye's{' '}
              <Text style={styles.legalLink} onPress={() => openLegal('terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.legalLink} onPress={() => openLegal('privacy')}>
                Privacy Policy
              </Text>
              , and acknowledge our{' '}
              <Text style={styles.legalLink} onPress={() => openLegal('disclaimer')}>
                Medical Disclaimer
              </Text>
              .
            </Text>
          </View>
        </ScrollView>
      ) : step === 2 ? (
        /* STEP 2: DAILY STEPS & CALORIES GOAL SELECTION */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.goalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step Pill Badge */}
          <View style={styles.stepPillRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                {initialStep === 2 ? 'RECALIBRATE TARGETS · 2/3' : '🎯 STEP 2 OF 3 · TARGETS'}
              </Text>
            </View>
          </View>

          {/* Goal Setting Title */}
          <Text style={styles.goalTitle}>Set Your Daily Targets</Text>
          <Text style={styles.goalSubtitle}>
            Customize your baseline movement, active calorie, and mindfulness goals. You can fine-tune these anytime in Settings.
          </Text>

          {/* 1. STEPS GOAL SECTION */}
          <View style={styles.goalSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daily Steps Goal</Text>
              <Text style={styles.sectionHighlight}>👟 Walking</Text>
            </View>

            {/* Live Visual Card in Sage Mint */}
            <View style={styles.goalLiveCardMint}>
              <View style={styles.goalLiveCardLeft}>
                <Text style={styles.goalLiveNumber}>{stepsGoal.toLocaleString()}</Text>
                <Text style={styles.goalLiveUnit}>steps target / day</Text>
              </View>

              {/* Stepper Buttons */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleStepIncrement(-500)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleStepIncrement(500)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preset Option Chips */}
            <View style={styles.presetGrid}>
              {stepPresets.map((p) => {
                const isSelected = stepsGoal === p.val;
                return (
                  <TouchableOpacity
                    key={p.val}
                    style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                    onPress={() => setStepsGoal(p.val)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.presetChipVal, isSelected && styles.presetChipValSelected]}>
                      {p.val >= 1000 ? `${p.val / 1000}k` : p.val}
                    </Text>
                    <Text style={[styles.presetChipSub, isSelected && styles.presetChipSubSelected]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 2. CALORIES GOAL SECTION */}
          <View style={styles.goalSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Active Calories Goal</Text>
              <Text style={styles.sectionHighlightPeach}>🔥 Burn</Text>
            </View>

            {/* Live Visual Card in Apricot Peach */}
            <View style={styles.goalLiveCardPeach}>
              <View style={styles.goalLiveCardLeft}>
                <Text style={styles.goalLiveNumber}>{caloriesGoal.toLocaleString()}</Text>
                <Text style={styles.goalLiveUnitPeach}>kcal active burn / day</Text>
              </View>

              {/* Stepper Buttons */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtnPeach}
                  onPress={() => handleCaloriesIncrement(-50)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtnPeach}
                  onPress={() => handleCaloriesIncrement(50)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preset Option Chips */}
            <View style={styles.presetGrid}>
              {caloriePresets.map((p) => {
                const isSelected = caloriesGoal === p.val;
                return (
                  <TouchableOpacity
                    key={p.val}
                    style={[styles.presetChipPeach, isSelected && styles.presetChipPeachSelected]}
                    onPress={() => setCaloriesGoal(p.val)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.presetChipVal, isSelected && styles.presetChipValPeachSelected]}>
                      {p.val}
                    </Text>
                    <Text style={[styles.presetChipSub, isSelected && styles.presetChipSubPeachSelected]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 3. MINDFULNESS GOAL SECTION */}
          <View style={styles.goalSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Daily Mindfulness Goal</Text>
              <Text style={styles.sectionHighlightLavender}>🌿 Zen & Breath</Text>
            </View>

            {/* Live Visual Card in Twilight Lavender */}
            <View style={styles.goalLiveCardLavender}>
              <View style={styles.goalLiveCardLeft}>
                <Text style={styles.goalLiveNumber}>{mindfulnessGoal}</Text>
                <Text style={styles.goalLiveUnitLavender}>mins mindful focus / day</Text>
              </View>

              {/* Stepper Buttons */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtnLavender}
                  onPress={() => handleMindfulnessIncrement(-2)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtnLavender}
                  onPress={() => handleMindfulnessIncrement(2)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Preset Option Chips */}
            <View style={styles.presetGrid}>
              {mindfulnessPresets.map((p) => {
                const isSelected = mindfulnessGoal === p.val;
                return (
                  <TouchableOpacity
                    key={p.val}
                    style={[styles.presetChipLavender, isSelected && styles.presetChipLavenderSelected]}
                    onPress={() => setMindfulnessGoal(p.val)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.presetChipVal, isSelected && styles.presetChipValLavenderSelected]}>
                      {p.val}m
                    </Text>
                    <Text style={[styles.presetChipSub, isSelected && styles.presetChipSubLavenderSelected]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bottom Action: Continue to Screen 3 (Features & Trackers) */}
          <TouchableOpacity
            style={styles.primaryPillBtn}
            onPress={() => goToStep(3)}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryPillBtnText}>
              Continue to Features & Trackers
            </Text>
            <View style={styles.whiteArrowCircle}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="#181C1B"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>

          {initialStep === 2 && (
            <TouchableOpacity
              style={styles.secondarySaveBtn}
              onPress={handleComplete}
              activeOpacity={0.75}
            >
              <Text style={styles.secondarySaveBtnText}>Save Targets & Return to App</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        /* STEP 3: CHOOSE WHAT TO ENABLE (AI, HEVY, ULTRAHUMAN, ETC.) */
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.goalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step Pill Badge */}
          <View style={styles.stepPillRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                {initialStep === 2 ? 'FEATURES · 3/3' : '⚡ STEP 3 OF 3 · WHAT TO ENABLE'}
              </Text>
            </View>
          </View>

          {/* Screen Title & Subtitle */}
          <Text style={styles.goalTitle}>Choose What to Enable</Text>
          <Text style={styles.goalSubtitle}>
            Personalize your experience. Enable the wearables you own and the smart intelligence features you want active.
          </Text>

          {/* 1. WEARABLES & DATA SOURCES */}
          <View style={styles.featureSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Wearables & Data Streams</Text>
              <Text style={styles.sectionHighlight}>⚡ Telemetry</Text>
            </View>

            {/* Fitbit / Wear OS Card */}
            <View style={styles.featureItemCard}>
              <View style={styles.featureItemRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#FEE2E2' }]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
                <View style={styles.featureTextCol}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureItemTitle}>Fitbit / Wear OS</Text>
                    <View style={[styles.featureTagPill, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.featureTagText, { color: '#15803D' }]}>RECOMMENDED</Text>
                    </View>
                  </View>
                  <Text style={styles.featureItemDesc}>
                    Auto-read heart rate, sleep architecture & steps via Health Connect.
                  </Text>
                </View>
                <Switch
                  value={enabledSources.fitbit}
                  onValueChange={(val) => handleToggleSource('fitbit', val)}
                  trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
                  thumbColor={enabledSources.fitbit ? '#1F382E' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Hevy Strength Training Card */}
            <View style={styles.featureItemCard}>
              <View style={styles.featureItemRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#DBEAFE' }]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 4v16M18 4v16M2 8v8M22 8v8M6 12h12"
                      stroke="#2563EB"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.featureTextCol}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureItemTitle}>Hevy Strength Logging</Text>
                    <View style={[styles.featureTagPill, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={[styles.featureTagText, { color: '#1E40AF' }]}>LIFTING</Text>
                    </View>
                  </View>
                  <Text style={styles.featureItemDesc}>
                    Sync workout routines, weight volume, tonnage & muscle fatigue.
                  </Text>
                </View>
                <Switch
                  value={enabledSources.hevy}
                  onValueChange={(val) => handleToggleSource('hevy', val)}
                  trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
                  thumbColor={enabledSources.hevy ? '#1F382E' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Ultrahuman Ring AIR Card */}
            <View style={styles.featureItemCard}>
              <View style={styles.featureItemRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#CCFBF1' }]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="8" stroke="#0D9488" strokeWidth="2.2" />
                    <Circle cx="12" cy="12" r="5" stroke="#0D9488" strokeWidth="1.2" strokeDasharray="3 3" />
                  </Svg>
                </View>
                <View style={styles.featureTextCol}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureItemTitle}>Ultrahuman Ring AIR</Text>
                    <View style={[styles.featureTagPill, { backgroundColor: '#F1F5F9' }]}>
                      <Text style={[styles.featureTagText, { color: '#64748B' }]}>DISABLED BY DEFAULT</Text>
                    </View>
                  </View>
                  <Text style={styles.featureItemDesc}>
                    Smart ring telemetry, finger temperature & circadian rhythm.
                  </Text>
                </View>
                <Switch
                  value={enabledSources.ultrahuman}
                  onValueChange={(val) => handleToggleSource('ultrahuman', val)}
                  trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
                  thumbColor={enabledSources.ultrahuman ? '#1F382E' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>

          {/* 2. SMART INTELLIGENCE & CAPABILITIES */}
          <View style={styles.featureSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Smart Capabilities</Text>
              <Text style={styles.sectionHighlightLavender}>🧠 On-Device</Text>
            </View>

            {/* On-Device AI Health Coach */}
            <View style={styles.featureItemCard}>
              <View style={styles.featureItemRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#FEF3C7' }]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2l2.4 7.2L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"
                      stroke="#D97706"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View style={styles.featureTextCol}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureItemTitle}>On-Device AI Coach</Text>
                    <View style={[styles.featureTagPill, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.featureTagText, { color: '#B45309' }]}>100% PRIVATE</Text>
                    </View>
                  </View>
                  <Text style={styles.featureItemDesc}>
                    Synthesizes strain, sleep debt & recovery guidance locally without cloud leaks.
                  </Text>
                </View>
                <Switch
                  value={aiEnabled}
                  onValueChange={(val) => handleToggleFeature(setAiEnabled, val)}
                  trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
                  thumbColor={aiEnabled ? '#1F382E' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Zen Mindfulness & Breathwork */}
            <View style={styles.featureItemCard}>
              <View style={styles.featureItemRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#EAF2EE' }]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 22V12" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" />
                    <Path d="M12 12C12 12 7 10 5 6c2 0 5 1 7 6z" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12 12C12 12 17 10 19 6c-2 0-5 1-7 6z" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12 12C12 12 9 7 12 3c3 4 0 9 0 9z" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <View style={styles.featureTextCol}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureItemTitle}>Zen Breath & Soundscapes</Text>
                    <View style={[styles.featureTagPill, { backgroundColor: '#D1FAE5' }]}>
                      <Text style={[styles.featureTagText, { color: '#065F46' }]}>HAPTIC PACING</Text>
                    </View>
                  </View>
                  <Text style={styles.featureItemDesc}>
                    Guided breathwork with somatic vibration pulses & background binaural beats.
                  </Text>
                </View>
                <Switch
                  value={mindfulnessEnabled}
                  onValueChange={(val) => handleToggleFeature(setMindfulnessEnabled, val)}
                  trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
                  thumbColor={mindfulnessEnabled ? '#1F382E' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Anatomical Body Analysis */}
            <View style={styles.featureItemCard}>
              <View style={styles.featureItemRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: '#EDE9FE' }]}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 5.5C7.2 4 9.5 3.5 12 3.5s4.8.5 6 2c1 1.2.9 2.8.2 4.2L17 12c-.5.9-.6 1.8-.5 2.7l.5 4.3c0 .8-.6 1.5-1.5 1.5H8.5c-.9 0-1.5-.7-1.5-1.5l.5-4.3c.1-.9 0-1.8-.5-2.7L5.8 9.7C5.1 8.3 5 6.7 6 5.5z"
                      stroke="#7C3AED"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path d="M8.5 9.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" />
                  </Svg>
                </View>
                <View style={styles.featureTextCol}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureItemTitle}>Body Recovery Heatmap</Text>
                    <View style={[styles.featureTagPill, { backgroundColor: '#EDE9FE' }]}>
                      <Text style={[styles.featureTagText, { color: '#6D28D9' }]}>3D MAP</Text>
                    </View>
                  </View>
                  <Text style={styles.featureItemDesc}>
                    Interactive muscle recovery visualization & fatigue timers from workouts.
                  </Text>
                </View>
                <Switch
                  value={bodyAnalysisEnabled}
                  onValueChange={(val) => handleToggleFeature(setBodyAnalysisEnabled, val)}
                  trackColor={{ false: '#E2E8F0', true: '#CCE6DE' }}
                  thumbColor={bodyAnalysisEnabled ? '#1F382E' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>

          {/* Privacy & Hardware Trust Badge */}
          <View style={styles.trustBanner}>
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
              <Rect x="3" y="11" width="18" height="11" rx="2" stroke="#1F382E" strokeWidth="2" fill="#E8F4F0" />
              <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#1F382E" strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <Text style={styles.trustBannerText}>
              Preferences stored in local encrypted vault. You can toggle any feature in Settings anytime.
            </Text>
          </View>

          {/* Bottom Confirmation Action Button */}
          <TouchableOpacity
            style={styles.primaryPillBtn}
            onPress={handleComplete}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryPillBtnText}>Complete Setup & Launch</Text>
            <View style={styles.whiteArrowCircle}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M5 13l4 4L19 7"
                  stroke="#181C1B"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </TouchableOpacity>

          {/* Legal Consent & Disclaimers */}
          <View style={styles.legalConsentRow}>
            <Text style={styles.legalConsentText}>
              By completing setup, you agree to OdinEye's{' '}
              <Text style={styles.legalLink} onPress={() => openLegal('terms')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.legalLink} onPress={() => openLegal('privacy')}>
                Privacy Policy
              </Text>
              , and acknowledge our{' '}
              <Text style={styles.legalLink} onPress={() => openLegal('disclaimer')}>
                Medical Disclaimer
              </Text>
              .
            </Text>
          </View>
        </ScrollView>
      )}
      </Animated.View>

      {/* In-App Legal Governance Modal */}
      <LegalModal
        visible={showLegalModal}
        initialTab={legalModalTab}
        onClose={() => setShowLegalModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFA',
  },
  scroll: {
    flex: 1,
  },
  welcomeScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  welcomeLogoWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(227, 241, 236, 0.8)',
    overflow: 'hidden',
  },
  welcomeLogoImage: {
    width: 60,
    height: 60,
    borderRadius: 18,
  },
  welcomePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 16,
  },
  welcomePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#152920',
    letterSpacing: 0.6,
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  heroHeadlineHighlight: {
    color: '#2C4A3E',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#63706B',
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 24,
  },

  // Bento Preview Stack
  bentoPreviewStack: {
    gap: 12,
    marginBottom: 24,
  },
  previewMintCard: {
    backgroundColor: '#CCE6DE',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  previewCardLeft: {
    flex: 1,
  },
  previewWhiteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  previewWhiteBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#152920',
  },
  previewBigPercent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#152920',
  },
  previewGoalSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#345747',
    marginTop: 1,
  },
  previewRingGauge: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewInnerDisk: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  previewDiskVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#141816',
  },
  previewDiskUnit: {
    fontSize: 8,
    fontWeight: '700',
    color: '#63706B',
    marginTop: -1,
  },
  previewMiniRow: {
    flexDirection: 'row',
    gap: 12,
  },
  previewObsidianCard: {
    flex: 1,
    backgroundColor: '#1E2327',
    borderRadius: 22,
    padding: 16,
  },
  obsidianTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  obsidianLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A6B4AF',
  },
  obsidianScore: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  obsidianSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A6B4AF',
    marginTop: 2,
  },
  previewLilacCard: {
    flex: 1,
    backgroundColor: '#DDD9F5',
    borderRadius: 22,
    padding: 16,
  },
  lilacTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lilacLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B234B',
  },
  lilacMiniCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lilacScore: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1836',
  },
  lilacSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#554B78',
    marginTop: 2,
  },

  // Trust Banner
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.05)',
  },
  trustBannerIcon: {
    fontSize: 18,
  },
  trustBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#475450',
    lineHeight: 16,
  },

  // Primary Action Pill Button
  primaryPillBtn: {
    backgroundColor: '#181C1B',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
    marginTop: 8,
  },
  primaryPillBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  whiteArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // STEP 2: GOALS
  goalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stepBadge: {
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#152920',
    letterSpacing: 0.5,
  },
  goalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.6,
  },
  goalSubtitle: {
    fontSize: 13,
    color: '#63706B',
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 20,
  },
  goalSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141816',
  },
  sectionHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C4A3E',
  },
  sectionHighlightPeach: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C4724',
  },

  // Live Cards
  goalLiveCardMint: {
    backgroundColor: '#CCE6DE',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  goalLiveCardPeach: {
    backgroundColor: '#FCE7DC',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#8C4724',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  goalLiveCardLeft: {
    flex: 1,
  },
  goalLiveNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.8,
  },
  goalLiveUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C4A3E',
    marginTop: 2,
  },
  goalLiveUnitPeach: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C4724',
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperBtnPeach: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C4724',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#141816',
    lineHeight: 22,
  },

  // Preset Chips
  presetGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(24, 28, 27, 0.06)',
  },
  presetChipSelected: {
    backgroundColor: '#E3F1EC',
    borderColor: '#2C4A3E',
  },
  presetChipPeach: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(24, 28, 27, 0.06)',
  },
  presetChipPeachSelected: {
    backgroundColor: '#FFF1E8',
    borderColor: '#8C4724',
  },
  presetChipVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141816',
  },
  presetChipValSelected: {
    color: '#152920',
  },
  presetChipValPeachSelected: {
    color: '#54260E',
  },
  presetChipSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#63706B',
    marginTop: 2,
  },
  presetChipSubSelected: {
    color: '#2C4A3E',
    fontWeight: '700',
  },
  presetChipSubPeachSelected: {
    color: '#8C4724',
    fontWeight: '700',
  },

  // Lavender Mindfulness Goal Card & Chips
  sectionHighlightLavender: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B2D54',
  },
  goalLiveCardLavender: {
    backgroundColor: '#EDE7F6',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#3B2D54',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  goalLiveUnitLavender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5C4E75',
    marginTop: 2,
  },
  stepperBtnLavender: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B2D54',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  presetChipLavender: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 45, 84, 0.08)',
  },
  presetChipLavenderSelected: {
    backgroundColor: '#EDE7F6',
    borderColor: '#3B2D54',
  },
  presetChipValLavenderSelected: {
    color: '#3B2D54',
  },
  presetChipSubLavenderSelected: {
    color: '#3B2D54',
    fontWeight: '700',
  },
  secondarySaveBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  secondarySaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#63706B',
  },
  featureSection: {
    marginBottom: 20,
  },
  featureItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  featureItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141816',
  },
  featureTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featureTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  featureItemDesc: {
    fontSize: 11.5,
    color: '#63706B',
    lineHeight: 16,
    marginTop: 2,
  },
  topProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F8FAFA',
    gap: 12,
  },
  topBrandPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
  },
  topBrandEmoji: {
    fontSize: 16,
  },
  topProgressBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.08)',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  progressBarWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  segmentTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segmentBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  segmentBarActive: {
    backgroundColor: '#1F382E',
  },
  stepFractionBadge: {
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.12)',
  },
  stepFractionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#152920',
    letterSpacing: 0.5,
  },
  stepPillRow: {
    marginBottom: 12,
  },
  legalConsentRow: {
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  legalConsentText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6E857B',
    textAlign: 'center',
  },
  legalLink: {
    fontWeight: '700',
    color: '#1F382E',
    textDecorationLine: 'underline',
  },
});
