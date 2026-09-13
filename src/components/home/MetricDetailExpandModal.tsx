import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { TriPillarHealthSummary } from '../../types/health';
import { Colors } from '../../theme/colors';
import { SmartRingIcon } from '../common/SmartRingIcon';
import { SleepBarChart } from '../sleep/SleepBarChart';
import { sleepHistoryService } from '../../services/sleep/sleepHistoryService';
import { MetricType } from '../../types/navigation';
export { MetricType } from '../../types/navigation';

interface MetricDetailExpandModalProps {
  visible: boolean;
  onClose: () => void;
  metricType: MetricType | null;
  data: TriPillarHealthSummary;
}

interface ThemeConfig {
  heroBg: string;
  heroBorder: string;
  heroTextColor: string;
  heroSubColor: string;
  heroBadgeText: string;
  isDark: boolean;
  accentRing: string;
  trackRing: string;
}

export const MetricDetailExpandModal: React.FC<MetricDetailExpandModalProps> = ({
  visible,
  onClose,
  metricType,
  data,
}) => {
  if (!metricType) return null;

  const { recovery, cardio, strength } = data;

  let title = 'Metric Summary';
  let deviceTag = 'Health Metrics';
  let mainScore = '—';
  let scoreUnit = 'Out of 100';
  let scoreStatus = 'No Data';
  let outerPct = 0;
  let innerPct = 0;
  let diskVal = '—';
  let diskSub = 'pct';
  let rangePos: DimensionValue = '10%';

  let theme: ThemeConfig = {
    heroBg: '#CCE6DE',
    heroBorder: 'rgba(31, 56, 46, 0.08)',
    heroTextColor: '#141816',
    heroSubColor: '#2C4A3E',
    heroBadgeText: '👟 Walking & Movement',
    isDark: false,
    accentRing: '#FFFFFF',
    trackRing: 'rgba(255, 255, 255, 0.45)',
  };

  let detailCards: Array<{ label: string; value: string; sub: string; icon: string; bg: string }> = [];
  let tiers: Array<{ range: string; label: string; tagColor: string; tagBg: string; desc: string }> = [];
  let actionableTip = '';

  switch (metricType) {
    case 'recovery':
      title = 'Recovery & Balance';
      deviceTag = recovery.source === 'health_connect' ? 'Health Connect' : 'Ultrahuman Ring AIR';
      const hasRecovery = recovery.recoveryScore > 0;
      mainScore = hasRecovery ? `${recovery.recoveryScore}%` : '—';
      scoreUnit = 'Physiological Readiness';
      scoreStatus = hasRecovery
        ? recovery.recoveryScore >= 80 ? 'Optimal Recovery' : recovery.recoveryScore >= 60 ? 'Moderate Recovery' : 'Rest Advised'
        : 'Awaiting Telemetry';
      outerPct = recovery.recoveryScore || 0;
      innerPct = recovery.sleepIndex || 0;
      diskVal = hasRecovery ? `${outerPct}%` : '0%';
      diskSub = 'readiness';
      rangePos = hasRecovery ? `${Math.min(94, Math.max(10, outerPct))}%` : '0%';

      theme = {
        heroBg: '#DDD9F5', // Periwinkle Lilac
        heroBorder: 'rgba(73, 61, 120, 0.08)',
        heroTextColor: '#181C1B',
        heroSubColor: '#493D78',
        heroBadgeText: '🐾 Recovery Readiness',
        isDark: false,
        accentRing: '#FFFFFF',
        trackRing: 'rgba(255, 255, 255, 0.45)',
      };

      detailCards = [
        { label: 'Sleep Index', value: recovery.sleepIndex > 0 ? `${recovery.sleepIndex}%` : '—', sub: 'Restorative foundation', icon: '🌙', bg: '#EDE8FA' },
        { label: 'Nightly HRV', value: recovery.hrvRmssd > 0 ? `${recovery.hrvRmssd} ms` : '—', sub: 'Parasympathetic vagal tone', icon: '🫀', bg: '#E3F1EC' },
        { label: 'Resting HR', value: recovery.restingHeartRate > 0 ? `${recovery.restingHeartRate} bpm` : '—', sub: 'Nocturnal basal pulse', icon: '❤️', bg: '#FFF2EB' },
        { label: 'Skin Temp', value: recovery.skinTempDelta !== 0 ? `${recovery.skinTempDelta > 0 ? '+' : ''}${recovery.skinTempDelta}°C` : '—', sub: 'Optimal circadian curve', icon: '🌡️', bg: '#FDF5D9' },
      ];

      tiers = [
        { range: '70 - 100%', label: 'Optimal', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Cellular and autonomic recovery complete. Prime state for physical exertion.' },
        { range: '40 - 69%', label: 'Moderate', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Balanced baseline. Maintain steady aerobic volume or moderate resistance.' },
        { range: '0 - 39%', label: 'Rest Needed', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Elevated strain detected. Prioritize sleep, light mobility, and hydration.' },
      ];

      actionableTip = hasRecovery
        ? `Circadian window: ${recovery.circadianPhase.morningSunlightWindow.start || '07:30'} - ${recovery.circadianPhase.morningSunlightWindow.end || '08:30'}. Caffeine cutoff: ${recovery.circadianPhase.caffeineCutoffTime || '14:00'}.`
        : 'Connect your wearable in Settings or sync Health Connect to compute live autonomic recovery.';
      break;

    case 'sleep':
      title = 'Rest & Sleep Architecture';
      deviceTag = 'Ultrahuman Ring AIR';
      const hasSleep = recovery.sleepDurationMinutes > 0;
      const sleepH = hasSleep ? Math.floor(recovery.sleepDurationMinutes / 60) : 0;
      const sleepM = hasSleep ? recovery.sleepDurationMinutes % 60 : 0;
      mainScore = hasSleep ? `${sleepH}h ${sleepM}m` : '0h 0m';
      scoreUnit = hasSleep
        ? `Score: ${recovery.sleepIndex || 0}% • ${recovery.sleepEfficiencyPct || 0}% Efficiency`
        : 'Awaiting Sleep Stream';
      scoreStatus = hasSleep
        ? (recovery.sleepIndex >= 80 ? 'Deep Sleep Optimal' : 'Restorative Sleep')
        : 'No Sleep Records Today';
      outerPct = hasSleep ? Math.min(100, Math.round(((sleepH * 60 + sleepM) / 480) * 100)) : 0;
      innerPct = (recovery.deepSleepPct || 0) * 2;
      diskVal = `${sleepH}h`;
      diskSub = 'sleep';
      rangePos = hasSleep ? `${Math.min(94, Math.max(15, outerPct))}%` : '0%';

      theme = {
        heroBg: '#1E2327', // Deep Obsidian Charcoal
        heroBorder: '#2C3339',
        heroTextColor: '#FFFFFF',
        heroSubColor: '#94A3B8',
        heroBadgeText: '🌙 Rest & Sleep',
        isDark: true,
        accentRing: '#FFC42B',
        trackRing: 'rgba(255, 255, 255, 0.15)',
      };

      const deepH = Math.floor((recovery.sleepDurationMinutes * ((recovery.deepSleepPct || 0) / 100)) / 60);
      const deepM = Math.round((recovery.sleepDurationMinutes * ((recovery.deepSleepPct || 0) / 100)) % 60);
      const remH = Math.floor((recovery.sleepDurationMinutes * ((recovery.remSleepPct || 0) / 100)) / 60);
      const remM = Math.round((recovery.sleepDurationMinutes * ((recovery.remSleepPct || 0) / 100)) % 60);

      detailCards = [
        { label: 'Deep Sleep', value: hasSleep ? `${deepH}h ${deepM}m` : '—', sub: hasSleep ? `${recovery.deepSleepPct || 0}% (Cellular repair)` : 'Awaiting sync', icon: '🧬', bg: '#EDE8FA' },
        { label: 'REM Sleep', value: hasSleep ? `${remH}h ${remM}m` : '—', sub: hasSleep ? `${recovery.remSleepPct || 0}% (Motor learning)` : 'Awaiting sync', icon: '🧠', bg: '#E4EFF5' },
        { label: 'Light Sleep', value: hasSleep ? `${recovery.lightSleepPct || 0}%` : '—', sub: 'Physiological bridge', icon: '🍃', bg: '#E3F1EC' },
        { label: 'Awake Time', value: hasSleep ? `${recovery.awakePct || 0}%` : '—', sub: 'Micro-arousals', icon: '⏱️', bg: '#FFF2EB' },
      ];

      tiers = [
        { range: '7h - 9h', label: 'Optimal', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Full completion of restorative sleep cycles, tissue reconstruction and glymphatic clearance.' },
        { range: '5h - 7h', label: 'Suboptimal', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Accumulated mild sleep debt. Keep daytime workouts to moderate exertion.' },
        { range: '< 5h', label: 'Rest Deficit', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Suppresses GH secretion. Prioritize earlier wind-down tonight.' },
      ];

      actionableTip = hasSleep
        ? 'Maintain ambient bedroom temperature around 18-19°C (65-67°F) to support natural core temperature drop.'
        : 'Sleep metrics will automatically display once your smart ring or Android Health Connect syncs.';
      break;

    case 'heart':
      title = 'Cardiovascular Rhythm';
      deviceTag = 'Wearable Telemetry';
      const liveHr = recovery.currentHeartRate || recovery.restingHeartRate;
      const hasHr = Boolean(liveHr && liveHr > 0);
      mainScore = hasHr ? `${liveHr}` : '—';
      scoreUnit = 'Beats Per Minute';
      scoreStatus = hasHr
        ? (liveHr! <= 75 ? 'Optimal Basal Rhythm' : 'Elevated Exertion')
        : 'Awaiting Pulse Stream';
      outerPct = hasHr ? Math.min(100, Math.round((liveHr! / 160) * 100)) : 0;
      innerPct = hasHr ? 70 : 0;
      diskVal = hasHr ? `${liveHr}` : '—';
      diskSub = 'bpm';
      rangePos = hasHr ? `${Math.min(90, Math.max(10, Math.round((liveHr! / 160) * 100)))}%` : '0%';

      theme = {
        heroBg: '#FDF5D9', // Buttercream
        heroBorder: 'rgba(135, 104, 20, 0.08)',
        heroTextColor: '#523E08',
        heroSubColor: '#876814',
        heroBadgeText: '❤️ Cardiac Rhythm',
        isDark: false,
        accentRing: '#FFFFFF',
        trackRing: 'rgba(255, 255, 255, 0.5)',
      };

      detailCards = [
        { label: 'Current BPM', value: hasHr ? `${liveHr} bpm` : '—', sub: 'Live reading', icon: '❤️', bg: '#FDF5D9' },
        { label: 'Resting HR', value: recovery.restingHeartRate > 0 ? `${recovery.restingHeartRate} bpm` : '—', sub: 'Overnight baseline', icon: '🌙', bg: '#E3F1EC' },
        { label: 'Autonomic HRV', value: recovery.hrvRmssd > 0 ? `${recovery.hrvRmssd} ms` : '—', sub: 'Sympathetic balance', icon: '⚡', bg: '#EDE8FA' },
        { label: 'Peak Zone', value: cardio.peakHeartRate > 0 ? `${cardio.peakHeartRate} bpm` : '—', sub: 'Max today recorded', icon: '🔥', bg: '#FFF2EB' },
      ];

      tiers = [
        { range: '45 - 60 bpm', label: 'Athletic Baseline', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'High stroke volume and efficient cardiac output.' },
        { range: '60 - 85 bpm', label: 'Normal Equilibrium', tagColor: '#1D4ED8', tagBg: '#DBEAFE', desc: 'Healthy daytime resting baseline.' },
        { range: '> 85 bpm', label: 'Elevated Strain', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Reflects acute physical exertion, caffeine stimulus, or stress.' },
      ];

      actionableTip = hasHr
        ? (recovery.restingHeartRate > 0
          ? `Resting heart rate baseline rested at ${recovery.restingHeartRate} bpm with steady parasympathetic recovery.`
          : `Live pulse reading is currently ${liveHr} bpm.`)
        : 'Connect your wearable or Health Connect to stream live cardiac rhythms.';
      break;

    case 'strength':
      title = 'Musculoskeletal Load';
      deviceTag = 'Hevy Training Log';
      const todayVol = strength.todayWorkout?.totalVolumeKg || 0;
      const weeklyVol = strength.weeklyVolumeKg || 0;
      const hasStrengthLogs = todayVol > 0 || weeklyVol > 0;
      const volTons = todayVol > 0
        ? (todayVol / 1000).toFixed(1)
        : (weeklyVol > 0 ? (weeklyVol / 1000).toFixed(1) : '0.0');
      mainScore = `${volTons}t`;
      scoreUnit = todayVol > 0 ? 'Tonnage Lifted Today' : (weeklyVol > 0 ? 'Weekly Volume Tonnage' : 'No Workouts Logged');
      scoreStatus = todayVol > 0
        ? `${strength.todayWorkout?.totalSets || 0} Sets Completed`
        : (strength.weeklyWorkoutsCount > 0 ? `${strength.weeklyWorkoutsCount} Sessions This Week` : 'All Muscle Groups Primed');
      outerPct = todayVol > 0 ? 85 : (weeklyVol > 0 ? 60 : 0);
      innerPct = hasStrengthLogs ? 100 : 0;
      diskVal = `${volTons}t`;
      diskSub = 'load';
      rangePos = hasStrengthLogs ? '85%' : '0%';

      theme = {
        heroBg: '#E4EFF5', // Ice Strength Pastel
        heroBorder: 'rgba(40, 80, 110, 0.08)',
        heroTextColor: '#152E3C',
        heroSubColor: '#2C4A3E',
        heroBadgeText: '🏋️ Tonnage & Strength',
        isDark: false,
        accentRing: '#FFFFFF',
        trackRing: 'rgba(255, 255, 255, 0.45)',
      };

      detailCards = [
        { label: 'Volume Lifted', value: `${volTons} tons`, sub: todayVol > 0 ? 'Heavy tension sets' : (weeklyVol > 0 ? 'Weekly total' : 'Awaiting workouts'), icon: '🏋️', bg: '#E4EFF5' },
        { label: 'Muscles Primed', value: `${strength.muscleStatuses.filter(m => m.state === 'primed').length} of ${strength.muscleStatuses.length || 10}`, sub: 'Tissue readiness', icon: '🟢', bg: '#E3F1EC' },
        { label: 'Fatigue Clocks', value: '0h remaining', sub: 'Tissue repaired', icon: '⏱️', bg: '#EDE8FA' },
        { label: 'Weekly Sessions', value: `${strength.weeklyWorkoutsCount || 0} logged`, sub: 'Resistance consistency', icon: '📈', bg: '#FDF5D9' },
      ];

      tiers = [
        { range: '100% Primed', label: 'Optimal Exertion', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Myofibrillar micro-tears repaired. Prime state for progressive overload.' },
        { range: '60 - 95%', label: 'Active Repair', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Protein synthesis ongoing. Keep resistance to moderate RPE.' },
        { range: '< 60%', label: 'Fatigued', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Acute glycogen depletion and soreness. Allow direct rest.' },
      ];

      actionableTip = hasStrengthLogs
        ? 'All primary muscular kinetic chains are tracking tissue repair and volume progression.'
        : 'Connect your Hevy API key in Settings to analyze muscular tonnage and recovery clocks.';
      break;

    case 'calories':
      title = 'Active Caloric Burn';
      deviceTag = 'Android Health Connect';
      const activeCals = cardio.cardioCaloriesBurned > 0
        ? cardio.cardioCaloriesBurned
        : (data.dailyActivity?.activeCalories || 0);
      const totalCals = data.dailyActivity?.totalCalories || (activeCals > 0 ? activeCals + 1600 : 0);
      const hasCalories = activeCals > 0;
      mainScore = `${activeCals}`;
      scoreUnit = 'kCal Active Expenditure';
      scoreStatus = hasCalories ? `${Math.round((activeCals / 500) * 100)}% of 500 kcal Goal` : '0% of 500 kcal Goal';
      outerPct = Math.min(100, Math.round((activeCals / 500) * 100));
      innerPct = totalCals > 0 ? Math.min(100, Math.round((totalCals / 2400) * 100)) : 0;
      diskVal = `${activeCals}`;
      diskSub = 'kcal';
      rangePos = hasCalories ? `${Math.min(94, Math.max(10, outerPct))}%` : '0%';

      theme = {
        heroBg: '#FCE7DC', // Warm Apricot Peach
        heroBorder: 'rgba(140, 71, 36, 0.08)',
        heroTextColor: '#54260E',
        heroSubColor: '#8C4724',
        heroBadgeText: '🔥 Active Energy',
        isDark: false,
        accentRing: '#FFFFFF',
        trackRing: 'rgba(255, 255, 255, 0.45)',
      };

      detailCards = [
        { label: 'Active Burn', value: `${activeCals} kcal`, sub: 'Cardio & locomotion', icon: '🔥', bg: '#FFF2EB' },
        { label: 'Basal Metabolic', value: hasCalories ? '1,600 kcal' : '0 kcal', sub: 'Vital organ maintenance', icon: '⚡', bg: '#E4EFF5' },
        { label: 'Total Output', value: `${totalCals.toLocaleString()} kcal`, sub: 'Daily expenditure', icon: '📊', bg: '#E3F1EC' },
        { label: 'Target Goal', value: '500 kcal', sub: 'Baseline objective', icon: '🎯', bg: '#FDF5D9' },
      ];

      tiers = [
        { range: '> 500 kcal', label: 'High Output', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Superior metabolic turnover and insulin sensitivity.' },
        { range: '250 - 500', label: 'Balanced', tagColor: '#1D4ED8', tagBg: '#DBEAFE', desc: 'Optimal daily physical equilibrium.' },
        { range: '< 250 kcal', label: 'Rest Day', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Low expenditure preserving glycogen reserves.' },
      ];

      actionableTip = hasCalories
        ? `Active expenditure of ${activeCals} kcal is aggregated securely on-device.`
        : 'Track your workouts or daily movement to compute active caloric burn.';
      break;

    case 'distance':
    default:
      title = 'Walking & Daily Steps';
      deviceTag = 'Android Health Connect';
      const steps = data.dailyActivity?.steps || (cardio.recentWorkout?.distanceKm ? Math.round(cardio.recentWorkout.distanceKm * 1350) : 0);
      const hasSteps = steps > 0;
      const dist = (data.dailyActivity?.distanceKm && data.dailyActivity.distanceKm > 0)
        ? data.dailyActivity.distanceKm
        : (cardio.recentWorkout?.distanceKm ? cardio.recentWorkout.distanceKm : (hasSteps ? parseFloat(((steps * 0.76) / 1000).toFixed(1)) : 0));
      mainScore = `${steps.toLocaleString()}`;
      scoreUnit = hasSteps ? `${Math.round((steps / 10000) * 100)}% of 10,000 Step Goal (${dist.toFixed(1)} km)` : '0% of 10,000 Step Goal (0.0 km)';
      scoreStatus = hasSteps ? 'Total in this day' : 'Awaiting Movement';
      outerPct = Math.min(100, Math.round((steps / 10000) * 100));
      innerPct = Math.min(100, Math.round((dist / 8) * 100));
      diskVal = steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : `${steps}`;
      diskSub = 'steps';
      rangePos = hasSteps ? `${Math.min(94, Math.max(10, outerPct))}%` : '0%';

      theme = {
        heroBg: '#CCE6DE', // Matcha Sage Mint
        heroBorder: 'rgba(31, 56, 46, 0.08)',
        heroTextColor: '#141816',
        heroSubColor: '#152920',
        heroBadgeText: '👟 Walking & Movement',
        isDark: false,
        accentRing: '#FFFFFF',
        trackRing: 'rgba(255, 255, 255, 0.45)',
      };

      detailCards = [
        { label: 'Total Steps', value: `${steps.toLocaleString()}`, sub: 'Pedometer telemetry', icon: '👟', bg: '#E3F1EC' },
        { label: 'Ground Distance', value: `${dist.toFixed(1)} km`, sub: 'Ground displacement', icon: '🗺️', bg: '#E4EFF5' },
        { label: 'Cadence', value: hasSteps ? '112 spm' : '—', sub: 'Walking tempo', icon: '⚡', bg: '#FDF5D9' },
        { label: 'Floors Climbed', value: hasSteps ? `${Math.round(steps / 600)} floors` : '0 floors', sub: 'Vertical elevation', icon: '🪜', bg: '#FFF2EB' },
      ];

      tiers = [
        { range: '> 10,000 steps', label: 'Optimal', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Cardiovascular longevity standard and daily equilibrium.' },
        { range: '6,000 - 10,000', label: 'Healthy Baseline', tagColor: '#1D4ED8', tagBg: '#DBEAFE', desc: 'Sufficient daily movement reducing arterial stiffness.' },
        { range: '< 6,000 steps', label: 'Rest Day', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Lower locomotion conserving joint recovery.' },
      ];

      actionableTip = hasSteps
        ? `You've covered ${dist.toFixed(1)} km with steady walking efficiency.`
        : 'Keep your phone or tracker with you to record daily step count.';
      break;
  }

  const isSleep = metricType === 'sleep';
  const weeklySleepRecords = sleepHistoryService.getWeeklySleepHistory(
    recovery.sleepDurationMinutes || 0,
    recovery.sleepIndex || 0,
    recovery.sleepEfficiencyPct || 0
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header with Symmetrical Pure White Buttons */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleButton} onPress={onClose} activeOpacity={0.75}>
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

          <Text style={styles.topTitle}>{title}</Text>

          <TouchableOpacity style={styles.circleButton} onPress={onClose} activeOpacity={0.75}>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="#141816"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hardware Source Pill */}
          <View style={styles.sourcePillRow}>
            <View style={styles.sourcePill}>
              <SmartRingIcon size={13} color="#237A5D" />
              <Text style={styles.sourcePillText}>{deviceTag} • On-Device Encrypted</Text>
            </View>
          </View>

          {/* Hero Bento Card (Matching Theme Pastel) */}
          <View
            style={[
              styles.heroBentoCard,
              {
                backgroundColor: theme.heroBg,
                borderColor: theme.heroBorder,
              },
            ]}
          >
            <View style={styles.heroLeftCol}>
              <View style={[styles.heroWhiteBadge, theme.isDark && styles.heroDarkBadge]}>
                <Text style={[styles.heroWhiteBadgeText, theme.isDark && styles.heroDarkBadgeText]}>
                  {theme.heroBadgeText}
                </Text>
              </View>

              <Text style={[styles.heroBigVal, { color: theme.heroTextColor }]}>{mainScore}</Text>
              <Text style={[styles.heroSubText, { color: theme.heroSubColor }]}>{scoreUnit}</Text>

              <View style={styles.heroStatusChip}>
                <Text style={styles.heroStatusChipText}>{scoreStatus}</Text>
              </View>
            </View>

            {/* Circular Concentric Progress Ring with Center Disk */}
            <View style={styles.heroRingWrapper}>
              <Svg width="88" height="88" viewBox="0 0 88 88">
                <Circle
                  cx="44"
                  cy="44"
                  r="36"
                  stroke={theme.trackRing}
                  strokeWidth="6"
                  fill="none"
                />
                <Circle
                  cx="44"
                  cy="44"
                  r="36"
                  stroke={theme.accentRing}
                  strokeWidth="6"
                  strokeDasharray="226"
                  strokeDashoffset={226 - (226 * Math.max(10, outerPct)) / 100}
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 44 44)"
                />
              </Svg>

              <View style={styles.centerDisk}>
                <Text style={styles.centerDiskVal}>{diskVal}</Text>
                <Text style={styles.centerDiskSub}>{diskSub}</Text>
              </View>
            </View>
          </View>

          {/* If Sleep: Show 7-Day Sleep Duration Chart & Architecture */}
          {isSleep && (
            <View style={styles.chartCard}>
              <View style={styles.chartCardHeader}>
                <View>
                  <Text style={styles.chartTitle}>7-Day Sleep Consistency</Text>
                  <Text style={styles.chartSubtitle}>Nightly restorative durations</Text>
                </View>
                <View style={styles.chartPill}>
                  <Text style={styles.chartPillText}>92% Efficiency</Text>
                </View>
              </View>
              <SleepBarChart records={weeklySleepRecords} compact={false} accentVariant="purple" />
            </View>
          )}

          {/* 4 Detail Bento Metric Disks */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Telemetry Breakdown</Text>
            <Text style={styles.sectionSub}>Biometric sensor readings</Text>
          </View>

          <View style={styles.detailGrid}>
            {detailCards.map((c, i) => (
              <View key={i} style={styles.detailTile}>
                <View style={styles.detailTileTop}>
                  <View style={[styles.detailIconCircle, { backgroundColor: c.bg }]}>
                    <Text style={{ fontSize: 14 }}>{c.icon}</Text>
                  </View>
                  <Text style={styles.detailTileLabel}>{c.label}</Text>
                </View>
                <Text style={styles.detailTileVal}>{c.value}</Text>
                <Text style={styles.detailTileSub}>{c.sub}</Text>
              </View>
            ))}
          </View>

          {/* Horizon Benchmark Scale */}
          <View style={styles.benchmarkCard}>
            <Text style={styles.benchmarkTitle}>Benchmark Distribution</Text>
            <View style={styles.benchmarkScaleRow}>
              <Text style={styles.scaleLabel}>REST</Text>
              <Text style={styles.scaleLabel}>BALANCED</Text>
              <Text style={styles.scaleLabel}>OPTIMAL</Text>
            </View>
            <View style={styles.scaleTrack}>
              <View style={[styles.scaleFill, { width: rangePos }]} />
              <View style={[styles.scaleNeedle, { left: rangePos }]} />
            </View>

            <View style={styles.tiersList}>
              {tiers.map((t, idx) => (
                <View key={idx} style={styles.tierRow}>
                  <View style={styles.tierTop}>
                    <Text style={styles.tierRange}>{t.range}</Text>
                    <View style={[styles.tierBadge, { backgroundColor: t.tagBg }]}>
                      <Text style={[styles.tierBadgeText, { color: t.tagColor }]}>{t.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.tierDesc}>{t.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Science Directive Banner */}
          <View style={styles.directiveBanner}>
            <View style={styles.directiveIconCircle}>
              <Text style={{ fontSize: 14 }}>🌿</Text>
            </View>
            <View style={styles.directiveTextGroup}>
              <Text style={styles.directiveTitle}>Personalized Science Directive</Text>
              <Text style={styles.directiveBody}>{actionableTip}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(24, 28, 27, 0.05)',
    backgroundColor: '#F8FAFA',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  sourcePillRow: {
    alignItems: 'center',
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  sourcePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#237A5D',
  },
  heroBentoCard: {
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
  },
  heroLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroWhiteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  heroWhiteBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#141816',
  },
  heroDarkBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroDarkBadgeText: {
    color: '#FFFFFF',
  },
  heroBigVal: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  heroSubText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStatusChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 8,
  },
  heroStatusChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#141816',
  },
  heroRingWrapper: {
    width: 88,
    height: 88,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDisk: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  centerDiskVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#141816',
  },
  centerDiskSub: {
    fontSize: 8,
    fontWeight: '700',
    color: '#63706B',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    gap: 12,
  },
  chartCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141816',
  },
  chartSubtitle: {
    fontSize: 11,
    color: '#63706B',
  },
  chartPill: {
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chartPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#237A5D',
  },
  sectionHeaderRow: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141816',
  },
  sectionSub: {
    fontSize: 11,
    color: '#63706B',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailTile: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    gap: 6,
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  detailTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#63706B',
    flex: 1,
  },
  detailTileVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#141816',
  },
  detailTileSub: {
    fontSize: 10,
    color: '#94A39D',
    fontWeight: '600',
  },
  benchmarkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    gap: 12,
  },
  benchmarkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#141816',
  },
  benchmarkScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A39D',
  },
  scaleTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EAEFEA',
    position: 'relative',
  },
  scaleFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#237A5D',
  },
  scaleNeedle: {
    position: 'absolute',
    top: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#181C1B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tiersList: {
    gap: 8,
    marginTop: 4,
  },
  tierRow: {
    backgroundColor: '#F7FAF8',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  tierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierRange: {
    fontSize: 12,
    fontWeight: '800',
    color: '#141816',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tierDesc: {
    fontSize: 11,
    color: '#63706B',
    lineHeight: 15,
  },
  directiveBanner: {
    flexDirection: 'row',
    backgroundColor: '#E3F1EC',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  directiveIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directiveTextGroup: {
    flex: 1,
  },
  directiveTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#152920',
  },
  directiveBody: {
    fontSize: 11,
    color: '#2C4A3E',
    marginTop: 2,
    lineHeight: 15,
  },
});
