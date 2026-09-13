import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  DimensionValue,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { TriPillarHealthSummary } from '../../types/health';
import { Colors } from '../../theme/colors';
import { SmartRingIcon } from '../common/SmartRingIcon';
import { SleepBarChart } from '../sleep/SleepBarChart';
import { sleepHistoryService } from '../../services/sleep/sleepHistoryService';

export type MetricType = 'recovery' | 'sleep' | 'heart' | 'strength' | 'calories' | 'distance';

interface MetricDetailExpandModalProps {
  visible: boolean;
  onClose: () => void;
  metricType: MetricType | null;
  data: TriPillarHealthSummary;
}

const { width } = Dimensions.get('window');

export const MetricDetailExpandModal: React.FC<MetricDetailExpandModalProps> = ({
  visible,
  onClose,
  metricType,
  data,
}) => {
  if (!metricType) return null;

  const { recovery, cardio, strength } = data;

  // Build metric-specific configuration matching the user's design reference
  let title = 'Metric Summary';
  let deviceTag = 'Health Metrics';
  let mainScore = '—';
  let scoreUnit = 'Out of 100';
  let scoreStatus = 'No Data';
  let statusColor = '#94A3B8';
  let statusBg = '#F1F5F9';
  let outerPct = 0;
  let innerPct = 0;
  let rangeLabel = 'NO DATA';
  let rangePos: DimensionValue = '10%';

  let detailCards: Array<{ label: string; value: string; sub: string; dotColor: string }> = [];
  let tiers: Array<{ range: string; label: string; tagColor: string; tagBg: string; desc: string }> = [];
  let actionableTip = '';

  switch (metricType) {
    case 'recovery':
      title = 'Recovery Summary';
      deviceTag = 'Ultrahuman Ring AIR';
      const hasRecovery = recovery.recoveryScore > 0;
      mainScore = hasRecovery ? `${recovery.recoveryScore}` : '—';
      scoreUnit = 'Out of 100';
      scoreStatus = hasRecovery
        ? recovery.recoveryScore >= 80 ? 'Peak Readiness' : recovery.recoveryScore >= 60 ? 'Moderate Recovery' : 'Rest Advised'
        : 'Awaiting Telemetry';
      statusColor = !hasRecovery ? '#94A3B8' : recovery.recoveryScore >= 80 ? '#10B981' : '#F59E0B';
      statusBg = !hasRecovery ? '#F1F5F9' : recovery.recoveryScore >= 80 ? '#DCFCE7' : '#FEF3C7';
      outerPct = recovery.recoveryScore;
      innerPct = recovery.sleepIndex;
      rangeLabel = !hasRecovery ? 'NO DATA' : recovery.recoveryScore >= 80 ? 'OPTIMAL' : 'MODERATE';
      rangePos = `${Math.min(94, Math.max(10, recovery.recoveryScore || 10))}%`;

      detailCards = [
        { label: 'Sleep Index', value: recovery.sleepIndex > 0 ? `${recovery.sleepIndex}%` : '—', sub: 'Restorative baseline', dotColor: '#007AFF' },
        { label: 'Nightly HRV', value: recovery.hrvRmssd > 0 ? `${recovery.hrvRmssd} ms` : '—', sub: 'Autonomic vagal tone', dotColor: '#10B981' },
        { label: 'Resting HR', value: recovery.restingHeartRate > 0 ? `${recovery.restingHeartRate} bpm` : '—', sub: 'Sleep basal pulse', dotColor: '#EC4899' },
        { label: 'Skin Temp', value: recovery.skinTempDelta !== 0 ? `${recovery.skinTempDelta > 0 ? '+' : ''}${recovery.skinTempDelta}°C` : '—', sub: 'Baseline deviation', dotColor: '#8B5CF6' },
      ];

      tiers = [
        { range: '70 - 100', label: 'Optimal', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Cellular and autonomic recovery complete. Prime state for high physical exertion.' },
        { range: '40 - 69', label: 'Suboptimal', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Moderate recovery. Keep training at conversational aerobic pace or maintenance volume.' },
        { range: '0 - 39', label: 'Rest Needed', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Elevated physiological strain. Focus on hydration, mobility, and early sleep.' },
      ];

      actionableTip = hasRecovery
        ? `Circadian window: ${recovery.circadianPhase.morningSunlightWindow.start} - ${recovery.circadianPhase.morningSunlightWindow.end}. Caffeine cutoff: ${recovery.circadianPhase.caffeineCutoffTime}.`
        : 'No recovery data synced yet. Configure your Ultrahuman API key in Settings.';
      break;

    case 'sleep':
      title = 'Sleep Summary';
      deviceTag = 'Ultrahuman Ring AIR';
      const hasSleep = recovery.sleepDurationMinutes > 0;
      const sleepHours = Math.floor(recovery.sleepDurationMinutes / 60);
      const sleepMins = recovery.sleepDurationMinutes % 60;
      mainScore = hasSleep ? `${sleepHours}h ${sleepMins}m` : '—';
      scoreUnit = recovery.sleepIndex > 0 ? `${recovery.sleepIndex} Sleep Score` : 'No Sleep Logged';
      scoreStatus = hasSleep ? `${recovery.sleepEfficiencyPct}% Efficiency` : 'Awaiting Sleep Telemetry';
      statusColor = hasSleep ? '#007AFF' : '#94A3B8';
      statusBg = hasSleep ? '#DBEAFE' : '#F1F5F9';
      outerPct = Math.min(100, Math.round((recovery.sleepDurationMinutes / 480) * 100));
      innerPct = recovery.deepSleepPct * 2;
      rangeLabel = hasSleep ? 'OPTIMAL' : 'NO DATA';
      rangePos = `${Math.min(94, Math.max(15, outerPct || 15))}%`;

      const deepHours = Math.floor((recovery.sleepDurationMinutes * (recovery.deepSleepPct / 100)) / 60);
      const deepMins = Math.round((recovery.sleepDurationMinutes * (recovery.deepSleepPct / 100)) % 60);
      const remHours = Math.floor((recovery.sleepDurationMinutes * (recovery.remSleepPct / 100)) / 60);
      const remMins = Math.round((recovery.sleepDurationMinutes * (recovery.remSleepPct / 100)) % 60);

      detailCards = [
        { label: 'Deep Sleep', value: hasSleep ? `${deepHours}h ${deepMins}m` : '—', sub: hasSleep ? `${recovery.deepSleepPct}% (HGH release)` : 'Awaiting sync', dotColor: '#3B82F6' },
        { label: 'REM Sleep', value: hasSleep ? `${remHours}h ${remMins}m` : '—', sub: hasSleep ? `${recovery.remSleepPct}% (Motor memory)` : 'Awaiting sync', dotColor: '#8B5CF6' },
        { label: 'Light Sleep', value: hasSleep ? `${recovery.lightSleepPct}%` : '—', sub: 'Physiological transition', dotColor: '#94A3B8' },
        { label: 'Awake Time', value: hasSleep ? `${recovery.awakePct}%` : '—', sub: 'Night micro-arousals', dotColor: '#F59E0B' },
      ];

      tiers = [
        { range: '7h - 9h', label: 'Optimal', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Full completion of 4-5 sleep cycles, allowing tissue reconstruction and glymphatic clearance.' },
        { range: '5h - 7h', label: 'Suboptimal', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Accumulated sleep debt. May experience minor reductions in reaction speed and motivation.' },
        { range: '< 5h', label: 'Insomniac', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Suppresses anabolic hormone release and elevates resting sympathetic nervous tone.' },
      ];

      actionableTip = hasSleep
        ? 'Maintain bedroom temperature around 18-19°C (65-67°F) to support natural core body cooling into slow-wave deep sleep.'
        : 'No sleep session detected. Wear your Ultrahuman Ring AIR to sleep to monitor sleep stages.';
      break;

    case 'heart':
      title = 'Heart Rate Telemetry';
      deviceTag = 'Ultrahuman / Health Connect';
      const liveHr = recovery.currentHeartRate || recovery.restingHeartRate || 0;
      const hasHr = liveHr > 0;
      mainScore = hasHr ? `${liveHr}` : '—';
      scoreUnit = recovery.currentHeartRate ? 'Live BPM' : recovery.restingHeartRate > 0 ? 'Resting Baseline BPM' : 'No Pulse Data';
      scoreStatus = hasHr ? (liveHr <= 100 ? 'Normal Rhythm' : 'Elevated Exertion') : 'Awaiting Sensor Feed';
      statusColor = !hasHr ? '#94A3B8' : liveHr > 100 ? '#EF4444' : '#10B981';
      statusBg = !hasHr ? '#F1F5F9' : liveHr > 100 ? '#FEE2E2' : '#DCFCE7';
      outerPct = hasHr ? Math.min(100, Math.round((liveHr / 180) * 100)) : 0;
      innerPct = recovery.restingHeartRate > 0 ? Math.min(100, Math.round((recovery.restingHeartRate / 100) * 100)) : 0;
      rangeLabel = hasHr ? 'NORMAL' : 'NO DATA';
      rangePos = hasHr ? '45%' : '10%';

      detailCards = [
        { label: 'Current BPM', value: recovery.currentHeartRate ? `${recovery.currentHeartRate} bpm` : '—', sub: 'Live reading', dotColor: '#EF4444' },
        { label: 'Resting HR (RHR)', value: recovery.restingHeartRate > 0 ? `${recovery.restingHeartRate} bpm` : '—', sub: 'Nighttime sleep baseline', dotColor: '#10B981' },
        { label: 'Autonomic HRV', value: recovery.hrvRmssd > 0 ? `${recovery.hrvRmssd} ms` : '—', sub: 'Parasympathetic tone', dotColor: '#3B82F6' },
        { label: 'Peak Exertion', value: cardio.peakHeartRate > 0 ? `${cardio.peakHeartRate} bpm` : '—', sub: 'Today max recorded', dotColor: '#F59E0B' },
      ];

      tiers = [
        { range: '40 - 60', label: 'Athletic RHR', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'High stroke volume and efficient cardiac output typical of well-conditioned athletes.' },
        { range: '60 - 100', label: 'Normal Rhythm', tagColor: '#1D4ED8', tagBg: '#DBEAFE', desc: 'Standard healthy daytime resting heart rate zone with balanced autonomic regulation.' },
        { range: '> 100', label: 'Elevated', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Indicates acute physical exertion, caffeine stimulus, dehydration, or stress response.' },
      ];

      actionableTip = hasHr
        ? `Heart rate telemetry active. Nightly baseline rested at ${recovery.restingHeartRate > 0 ? `${recovery.restingHeartRate} bpm` : 'pending'}.`
        : 'No heart rate telemetry synced today. Connect a wearable or sync your Ring AIR.';
      break;

    case 'strength':
      title = 'Musculoskeletal Load';
      deviceTag = 'Hevy Training Log';
      const todayVol = strength.todayWorkout?.totalVolumeKg || 0;
      const volTons = todayVol > 0 ? (todayVol / 1000).toFixed(1) : '0.0';
      mainScore = `${volTons}t`;
      scoreUnit = 'Tonnage Today';
      scoreStatus = todayVol > 0 ? `${strength.todayWorkout?.totalSets} Sets Completed` : '0 Active Fatigue (Primed)';
      statusColor = '#6366F1';
      statusBg = '#EEF2FF';
      outerPct = todayVol > 0 ? 80 : 100;
      innerPct = 100;
      rangeLabel = todayVol > 0 ? 'ACTIVE' : 'PRIMED';
      rangePos = todayVol > 0 ? '70%' : '95%';

      detailCards = [
        { label: 'Volume Today', value: `${volTons} tons`, sub: todayVol > 0 ? 'High tension sets' : 'Rest day (0 fatigue)', dotColor: '#6366F1' },
        { label: 'Muscles Primed', value: `${strength.muscleStatuses.filter(m => m.state === 'primed').length || (strength.muscleStatuses.length === 0 ? 8 : 0)} of ${strength.muscleStatuses.length || 8}`, sub: '100% full recovery', dotColor: '#10B981' },
        { label: 'Fatigue Clocks', value: '0h remaining', sub: 'Recovery window satisfied', dotColor: '#3B82F6' },
        { label: 'Weekly Volume', value: `${(strength.weeklyVolumeKg / 1000).toFixed(1)}t`, sub: `${strength.weeklyWorkoutsCount} sessions logged`, dotColor: '#F59E0B' },
      ];

      tiers = [
        { range: '100% Primed', label: 'Green Light', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Myofibrillar micro-tears are completely repaired. Ready for progressive overload or maximal attempts.' },
        { range: '45% - 95%', label: 'Repairing', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Active muscle protein synthesis ongoing. Limit resistance to moderate RPE (<7.5).' },
        { range: '< 45%', label: 'Fatigued', tagColor: '#B91C1C', tagBg: '#FEE2E2', desc: 'Acute glycogen depletion and soreness. Avoid direct loading on targeted groups.' },
      ];

      actionableTip = todayVol > 0
        ? `Completed ${strength.todayWorkout?.totalSets} sets with ${volTons}t total volume. Recovery clocks are counting down.`
        : 'No strength workouts logged today. All major muscle groups are fully recovered and ready for exertion.';
      break;

    case 'calories':
      title = 'Caloric Expenditure';
      deviceTag = 'Android Health Connect';
      const activeCals = cardio.cardioCaloriesBurned > 0 ? cardio.cardioCaloriesBurned : (data.dailyActivity?.activeCalories || 0);
      const totalCals = data.dailyActivity?.totalCalories || (activeCals > 0 ? activeCals + 1600 : 0);
      mainScore = `${activeCals}`;
      scoreUnit = 'kCal Active Burn';
      scoreStatus = totalCals > 0 ? `${totalCals.toLocaleString()} Total kCal (Burn + BMR)` : '0 Total kCal';
      statusColor = activeCals > 0 ? '#F97316' : '#94A3B8';
      statusBg = activeCals > 0 ? '#FFEDD5' : '#F1F5F9';
      outerPct = Math.min(100, Math.round((activeCals / 550) * 100));
      innerPct = Math.min(100, Math.round((totalCals / 2400) * 100));
      rangeLabel = activeCals > 0 ? 'ACTIVE' : 'NO DATA';
      rangePos = activeCals > 0 ? '65%' : '10%';

      detailCards = [
        { label: 'Active Energy', value: `${activeCals} kcal`, sub: 'Physical motion & tasks', dotColor: '#F97316' },
        { label: 'Basal Metabolic', value: totalCals > 0 ? '1,600 kcal' : '—', sub: 'Vital organ baseline', dotColor: '#3B82F6' },
        { label: 'Total Expenditure', value: totalCals > 0 ? `${totalCals.toLocaleString()} kcal` : '0 kcal', sub: 'Combined daily burn', dotColor: '#10B981' },
        { label: 'Target Burn', value: '550 kcal', sub: 'Daily active goal', dotColor: '#8B5CF6' },
      ];

      tiers = [
        { range: '> 500 kcal', label: 'High Output', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Significant cardiovascular and metabolic activation.' },
        { range: '250 - 500', label: 'Moderate', tagColor: '#1D4ED8', tagBg: '#DBEAFE', desc: 'Healthy daily activity maintaining metabolic flexibility.' },
        { range: '< 250 kcal', label: 'Rest Day', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Low exertion conserving glycogen and central nervous recovery.' },
      ];

      actionableTip = activeCals > 0
        ? `Active expenditure of ${activeCals} kCal is aggregated through Health Connect.`
        : 'No caloric burn recorded today. Sync your phone sensors or wearable in Health Connect.';
      break;

    case 'distance':
      title = 'Daily Steps & Motion';
      deviceTag = 'Android Health Connect';
      const steps = data.dailyActivity?.steps || (cardio.recentWorkout?.distanceKm ? Math.round(cardio.recentWorkout.distanceKm * 1350) : 0);
      const dist = (cardio.recentWorkout?.distanceKm && cardio.recentWorkout.distanceKm > 0)
        ? cardio.recentWorkout.distanceKm
        : (data.dailyActivity?.distanceKm || (steps > 0 ? parseFloat(((steps * 0.76) / 1000).toFixed(1)) : 0));
      const floors = data.dailyActivity?.floorsClimbed || (steps > 0 ? Math.round(steps / 550) : 0);
      mainScore = steps > 0 ? `${steps.toLocaleString()}` : '0';
      scoreUnit = 'Steps Walked Today';
      scoreStatus = steps > 0 ? `${Math.round((steps / 10000) * 100)}% of 10,000 Step Goal (${dist.toFixed(1)} km)` : '0% of 10,000 Step Goal';
      statusColor = steps > 0 ? '#3B82F6' : '#94A3B8';
      statusBg = steps > 0 ? '#DBEAFE' : '#F1F5F9';
      outerPct = Math.min(100, Math.round((steps / 10000) * 100));
      innerPct = Math.min(100, Math.round((dist / 7.0) * 100));
      rangeLabel = steps >= 10000 ? 'OPTIMAL' : steps >= 5000 ? 'MODERATE' : steps > 0 ? 'LOW' : 'NO DATA';
      rangePos = `${Math.min(94, Math.max(10, Math.round((steps / 10000) * 100)))}%`;

      detailCards = [
        { label: 'Total Steps', value: `${steps.toLocaleString()}`, sub: 'Health Connect pedometer', dotColor: '#3B82F6' },
        { label: 'Total Distance', value: `${dist.toFixed(1)} km`, sub: 'Calculated ground covered', dotColor: '#10B981' },
        { label: 'Active Cadence', value: steps > 0 ? 'Active' : '—', sub: 'Walking tempo', dotColor: '#F59E0B' },
        { label: 'Floors Climbed', value: `${floors} floors`, sub: 'Elevation gain', dotColor: '#8B5CF6' },
      ];

      tiers = [
        { range: '> 10,000 steps', label: 'Gold Standard', tagColor: '#15803D', tagBg: '#DCFCE7', desc: 'Superior cardiovascular efficiency and insulin sensitivity.' },
        { range: '6,000 - 10,000', label: 'Optimal Health', tagColor: '#1D4ED8', tagBg: '#DBEAFE', desc: 'Sufficient daily physical activity reducing all-cause mortality risk.' },
        { range: '< 6,000 steps', label: 'Sedentary', tagColor: '#B45309', tagBg: '#FEF3C7', desc: 'Below recommended daily baseline. Take brief walking breaks.' },
      ];

      actionableTip = steps > 0
        ? `You've logged ${steps.toLocaleString()} steps (${dist.toFixed(1)} km) through Android Health Connect.`
        : 'No steps recorded today. Allow physical activity permission in Health Connect.';
      break;
  }

  const isSleepMetric = metricType === 'sleep';
  const hasSleep = recovery.sleepDurationMinutes > 0;
  const sleepHours = Math.floor(recovery.sleepDurationMinutes / 60);
  const sleepMins = recovery.sleepDurationMinutes % 60;
  const deepHours = Math.floor((recovery.sleepDurationMinutes * (recovery.deepSleepPct / 100)) / 60);
  const deepMins = Math.round((recovery.sleepDurationMinutes * (recovery.deepSleepPct / 100)) % 60);
  const remHours = Math.floor((recovery.sleepDurationMinutes * (recovery.remSleepPct / 100)) / 60);
  const remMins = Math.round((recovery.sleepDurationMinutes * (recovery.remSleepPct / 100)) % 60);
  const lightHours = Math.floor((recovery.sleepDurationMinutes * (recovery.lightSleepPct / 100)) / 60);
  const lightMins = Math.round((recovery.sleepDurationMinutes * (recovery.lightSleepPct / 100)) % 60);
  const awakeHours = Math.floor((recovery.sleepDurationMinutes * (recovery.awakePct / 100)) / 60);
  const awakeMins = Math.round((recovery.sleepDurationMinutes * (recovery.awakePct / 100)) % 60);

  const weeklySleepRecords = sleepHistoryService.getWeeklySleepHistory(
    recovery.sleepDurationMinutes,
    recovery.sleepIndex,
    recovery.sleepEfficiencyPct
  );

  const [timeHorizon, setTimeHorizon] = useState<'Today' | 'Week' | 'Month'>('Today');

  // SVG Concentric Ring dimensions
  const dialSize = 220;
  const strokeWidth = 14;
  const center = dialSize / 2;
  const outerRadius = center - strokeWidth;
  const innerRadius = outerRadius - strokeWidth - 6;

  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const outerOffset = outerCircumference - (outerCircumference * Math.max(8, Math.min(100, outerPct))) / 100;
  const innerOffset = innerCircumference - (innerCircumference * Math.max(8, Math.min(100, innerPct))) / 100;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top App Bar with sleek Back Button */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.7}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18l-6-6 6-6"
                stroke={Colors.textPrimary}
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <Text style={styles.topTitle}>{title}</Text>

          <TouchableOpacity style={styles.infoBtn} activeOpacity={0.7}>
            <Text style={styles.infoText}>•••</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hardware Source Badge */}
          <View style={styles.sourceBadgeRow}>
            <View style={styles.sourcePill}>
              <SmartRingIcon size={14} color="#10B981" />
              <Text style={styles.sourcePillText}>{deviceTag}</Text>
            </View>
          </View>

          {isSleepMetric ? (
            <>
              {/* Segmented Time Control (Screen 3 Inspiration) */}
              <View style={styles.segmentedRow}>
                {(['Today', 'Week', 'Month'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.segmentBtn, timeHorizon === tab && styles.segmentBtnActive]}
                    onPress={() => setTimeHorizon(tab)}
                  >
                    <Text style={[styles.segmentBtnText, timeHorizon === tab && styles.segmentBtnTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Hero Midnight Indigo Wellness Card (Screen 1 & 2 Reference) */}
              <View style={styles.midnightHeroCard}>
                <View style={styles.midnightHeroLeft}>
                  <Text style={styles.midnightHeroSubtitle}>WELLNESS & RECOVERY</Text>
                  <View style={styles.midnightScoreRow}>
                    <Text style={styles.midnightHeroScore}>
                      {recovery.sleepIndex > 0 ? recovery.sleepIndex : (hasSleep ? 82 : '—')}
                    </Text>
                    <View style={styles.midnightStatusBadge}>
                      <Text style={styles.midnightStatusText}>
                        {hasSleep ? (recovery.sleepIndex >= 80 ? 'Very Good' : 'Optimal') : 'Awaiting Sleep'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.midnightHeroHint}>
                    {hasSleep
                      ? "Keep it up! You're on the right track with balanced slow-wave recovery."
                      : 'Wear your wearable tonight to begin logging sleep stages.'}
                  </Text>
                </View>

                {/* Luminous Circular Moon Dial */}
                <View style={styles.midnightHeroRight}>
                  <View style={styles.heroDialWrapper}>
                    <Svg width={80} height={80} viewBox="0 0 80 80">
                      <Circle
                        cx={40}
                        cy={40}
                        r={34}
                        stroke="rgba(255, 255, 255, 0.15)"
                        strokeWidth={6.5}
                        fill="none"
                      />
                      <Circle
                        cx={40}
                        cy={40}
                        r={34}
                        stroke="#A78BFA"
                        strokeWidth={6.5}
                        strokeDasharray={213}
                        strokeDashoffset={hasSleep ? 213 - (213 * (recovery.sleepIndex || 82)) / 100 : 190}
                        strokeLinecap="round"
                        fill="none"
                        transform="rotate(-90 40 40)"
                      />
                    </Svg>
                    <View style={styles.heroDialCenterIcon}>
                      <Text style={{ fontSize: 20 }}>🌙</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 7-Day Sleep Duration & Consistency (Screen 1 Inspiration) */}
              <View style={styles.chartSectionCard}>
                <View style={styles.chartHeaderRow}>
                  <View>
                    <Text style={styles.chartSectionTitle}>SLEEP DURATION & CONSISTENCY</Text>
                    <Text style={styles.chartSectionSub}>
                      {hasSleep ? `${sleepHours}h ${sleepMins}m Nightly Baseline` : 'Awaiting sync'}
                    </Text>
                  </View>
                  <View style={styles.efficiencyPill}>
                    <Text style={styles.efficiencyText}>
                      {hasSleep ? `${recovery.sleepEfficiencyPct || 92}% Efficiency` : 'Awaiting Data'}
                    </Text>
                  </View>
                </View>

                <SleepBarChart records={weeklySleepRecords} compact={false} accentVariant="purple" />
              </View>

              {/* 2x2 Soft Pastel Sleep Architecture Tiles (Screen 3 Reference) */}
              <View style={styles.pastelSectionHeader}>
                <Text style={styles.pastelSectionTitle}>SLEEP ARCHITECTURE & STAGES</Text>
                <Text style={styles.pastelSectionSubtitle}>Restorative hypnogram phases</Text>
              </View>

              <View style={styles.pastelGrid}>
                {/* 1. Deep Sleep (Lavender) */}
                <View style={[styles.pastelCard, { backgroundColor: '#F5F3FF' }]}>
                  <View style={styles.pastelCardTop}>
                    <Text style={styles.pastelIcon}>🧬</Text>
                    <Text style={[styles.pastelTitle, { color: '#6D28D9' }]}>Deep Sleep</Text>
                  </View>
                  <Text style={[styles.pastelValue, { color: '#4C1D95' }]}>
                    {hasSleep ? `${deepHours}h ${deepMins}m` : '—'}
                  </Text>
                  <Text style={[styles.pastelPct, { color: '#7C3AED' }]}>
                    {hasSleep ? `${recovery.deepSleepPct}% of night` : 'Awaiting sync'}
                  </Text>
                  <Text style={styles.pastelDesc}>HGH release & muscle tissue cellular repair</Text>
                </View>

                {/* 2. REM Sleep (Soft Ice-Blue) */}
                <View style={[styles.pastelCard, { backgroundColor: '#F0F9FF' }]}>
                  <View style={styles.pastelCardTop}>
                    <Text style={styles.pastelIcon}>🧠</Text>
                    <Text style={[styles.pastelTitle, { color: '#0284C7' }]}>REM Sleep</Text>
                  </View>
                  <Text style={[styles.pastelValue, { color: '#0369A1' }]}>
                    {hasSleep ? `${remHours}h ${remMins}m` : '—'}
                  </Text>
                  <Text style={[styles.pastelPct, { color: '#0284C7' }]}>
                    {hasSleep ? `${recovery.remSleepPct}% of night` : 'Awaiting sync'}
                  </Text>
                  <Text style={styles.pastelDesc}>Cognitive recall & motor memory consolidation</Text>
                </View>

                {/* 3. Light Sleep (Soft Slate) */}
                <View style={[styles.pastelCard, { backgroundColor: '#F8FAFC' }]}>
                  <View style={styles.pastelCardTop}>
                    <Text style={styles.pastelIcon}>🌊</Text>
                    <Text style={[styles.pastelTitle, { color: '#475569' }]}>Light Sleep</Text>
                  </View>
                  <Text style={[styles.pastelValue, { color: '#1E293B' }]}>
                    {hasSleep ? `${lightHours}h ${lightMins}m` : '—'}
                  </Text>
                  <Text style={[styles.pastelPct, { color: '#64748B' }]}>
                    {hasSleep ? `${recovery.lightSleepPct}% of night` : 'Awaiting sync'}
                  </Text>
                  <Text style={styles.pastelDesc}>Core temp drop & basal autonomic stabilization</Text>
                </View>

                {/* 4. Awake Time (Soft Peach) */}
                <View style={[styles.pastelCard, { backgroundColor: '#FFFBEB' }]}>
                  <View style={styles.pastelCardTop}>
                    <Text style={styles.pastelIcon}>👁️</Text>
                    <Text style={[styles.pastelTitle, { color: '#D97706' }]}>Awake Time</Text>
                  </View>
                  <Text style={[styles.pastelValue, { color: '#92400E' }]}>
                    {hasSleep ? `${awakeHours}h ${awakeMins}m` : '—'}
                  </Text>
                  <Text style={[styles.pastelPct, { color: '#B45309' }]}>
                    {hasSleep ? `${recovery.awakePct}% of night` : 'Awaiting sync'}
                  </Text>
                  <Text style={styles.pastelDesc}>Nocturnal micro-arousals & awakenings</Text>
                </View>
              </View>

              {/* Circadian Schedule */}
              <View style={styles.circadianCard}>
                <View style={styles.circadianHeader}>
                  <Text style={styles.circadianTitle}>Circadian & Nocturnal Harmony</Text>
                  <Text style={styles.circadianSub}>Biological clock anchors to protect deep sleep</Text>
                </View>
                <View style={styles.circadianRow}>
                  <View style={styles.circadianBox}>
                    <Text style={styles.circadianIcon}>☀️</Text>
                    <Text style={styles.circadianLabel}>SUNLIGHT WINDOW</Text>
                    <Text style={styles.circadianVal}>
                      {recovery.circadianPhase.morningSunlightWindow.start
                        ? `${recovery.circadianPhase.morningSunlightWindow.start} - ${recovery.circadianPhase.morningSunlightWindow.end}`
                        : '07:30 - 08:30'}
                    </Text>
                    <Text style={styles.circadianHint}>Cortisol & melatonin reset</Text>
                  </View>

                  <View style={styles.circadianBox}>
                    <Text style={styles.circadianIcon}>☕</Text>
                    <Text style={styles.circadianLabel}>CAFFEINE CUTOFF</Text>
                    <Text style={styles.circadianVal}>
                      {recovery.circadianPhase.caffeineCutoffTime || '14:00'}
                    </Text>
                    <Text style={styles.circadianHint}>Safeguard adenosine receptors</Text>
                  </View>
                </View>
              </View>

              {/* Personalized Sleep Directive */}
              <View style={styles.insightBox}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>💡</Text>
                  <Text style={styles.insightTitle}>Personalized Science Directive</Text>
                </View>
                <Text style={styles.insightText}>{actionableTip}</Text>
              </View>
            </>
          ) : (
            <>
              {/* Concentric Circular Progress Dial (Matching uploaded design reference) */}
              <View style={styles.dialContainer}>
                <Svg width={dialSize} height={dialSize} viewBox={`0 0 ${dialSize} ${dialSize}`}>
                  <Defs>
                    <LinearGradient id="outerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#007AFF" />
                      <Stop offset="100%" stopColor="#38BDF8" />
                    </LinearGradient>
                    <LinearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#1D4ED8" />
                      <Stop offset="100%" stopColor="#2563EB" />
                    </LinearGradient>
                  </Defs>

                  {/* Background Track Rings */}
                  <Circle
                    cx={center}
                    cy={center}
                    r={outerRadius}
                    stroke="#E2E8F0"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={center}
                    cy={center}
                    r={innerRadius}
                    stroke="#F1F5F9"
                    strokeWidth={strokeWidth}
                    fill="none"
                  />

                  {/* Active Outer Progress Arc */}
                  <Circle
                    cx={center}
                    cy={center}
                    r={outerRadius}
                    stroke="url(#outerGrad)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={outerCircumference}
                    strokeDashoffset={outerOffset}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(-90 ${center} ${center})`}
                  />

                  {/* Active Inner Progress Arc */}
                  <Circle
                    cx={center}
                    cy={center}
                    r={innerRadius}
                    stroke="url(#innerGrad)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={innerCircumference}
                    strokeDashoffset={innerOffset}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(-90 ${center} ${center})`}
                  />
                </Svg>

                {/* Centered Dial Label */}
                <View style={styles.dialCenterContent}>
                  <Text style={styles.dialScore}>{mainScore}</Text>
                  <Text style={styles.dialScoreUnit}>{scoreUnit}</Text>
                  <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusTagText, { color: statusColor }]}>{scoreStatus}</Text>
                  </View>
                </View>
              </View>

              {/* Horizon Range Bar ("LOW", "MEDIUM", "HIGH" gradient scale) */}
              <View style={styles.rangeSection}>
                <View style={styles.rangeLabelsRow}>
                  <Text style={styles.rangeLabelText}>LOW</Text>
                  <Text style={styles.rangeLabelText}>MEDIUM</Text>
                  <Text style={styles.rangeLabelText}>HIGH</Text>
                </View>
                <View style={styles.rangeTrack}>
                  <View style={[styles.rangeFill, { width: rangePos }]} />
                  <View style={[styles.rangeIndicator, { left: rangePos }]} />
                </View>
              </View>

              {/* 2x2 Clean Metric Breakdown Cards */}
              <View style={styles.cardsGrid}>
                {detailCards.map((c, i) => (
                  <View key={i} style={styles.miniCard}>
                    <View style={styles.miniCardTop}>
                      <View style={[styles.miniCardDot, { backgroundColor: c.dotColor }]} />
                      <Text style={styles.miniCardLabel}>{c.label}</Text>
                    </View>
                    <Text style={styles.miniCardValue}>{c.value}</Text>
                    <Text style={styles.miniCardSub}>{c.sub}</Text>
                  </View>
                ))}
              </View>

              {/* "What your score means" Diagnostic Accordion / Cards */}
              <View style={styles.tierSection}>
                <Text style={styles.sectionTitle}>What your score means</Text>
                {tiers.map((t, idx) => (
                  <View key={idx} style={styles.tierCard}>
                    <View style={styles.tierHeader}>
                      <Text style={styles.tierRange}>{t.range}</Text>
                      <View style={[styles.tierTag, { backgroundColor: t.tagBg }]}>
                        <Text style={[styles.tierTagText, { color: t.tagColor }]}>{t.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.tierDesc}>{t.desc}</Text>
                  </View>
                ))}
              </View>

              {/* Actionable Coach Directives */}
              <View style={styles.insightBox}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>💡</Text>
                  <Text style={styles.insightTitle}>Personalized Science Directive</Text>
                </View>
                <Text style={styles.insightText}>{actionableTip}</Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 74, 62, 0.08)',
    backgroundColor: '#F7F9F8',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF2EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EAF2EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sourceBadgeRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sourcePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  dialCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialScore: {
    fontSize: 46,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  dialScoreUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: -2,
    marginBottom: 6,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rangeSection: {
    backgroundColor: '#F4F7F5',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rangeLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  rangeTrack: {
    height: 10,
    backgroundColor: '#E5EDE9',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  rangeFill: {
    height: '100%',
    backgroundColor: '#2C4A3E',
    borderRadius: 5,
  },
  rangeIndicator: {
    position: 'absolute',
    top: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1A1D1C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -7,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  miniCard: {
    width: '48%',
    backgroundColor: '#F4F7F5',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  miniCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  miniCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  miniCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  miniCardSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tierSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  tierCard: {
    backgroundColor: '#F4F7F5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierRange: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tierTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tierTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tierDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  insightBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  insightText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  // Modern Sleep Architecture UI Styles (Inspired by user reference screens)
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 24,
    padding: 3,
    marginBottom: 16,
    alignSelf: 'center',
    width: '100%',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  midnightHeroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  midnightHeroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  midnightHeroSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A78BFA',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  midnightScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  midnightHeroScore: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  midnightStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  midnightStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  midnightHeroHint: {
    fontSize: 12,
    color: '#C4B5FD',
    lineHeight: 17,
  },
  midnightHeroRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroDialWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroDialCenterIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartSectionCard: {
    backgroundColor: '#F4F7F5',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chartSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  chartSectionSub: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  efficiencyPill: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  efficiencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  pastelSectionHeader: {
    marginBottom: 12,
  },
  pastelSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.6,
  },
  pastelSectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  pastelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  pastelCard: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  pastelCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pastelIcon: {
    fontSize: 16,
  },
  pastelTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  pastelValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pastelPct: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 6,
  },
  pastelDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  circadianCard: {
    backgroundColor: '#F4F7F5',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  circadianHeader: {
    marginBottom: 14,
  },
  circadianTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  circadianSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  circadianRow: {
    flexDirection: 'row',
    gap: 12,
  },
  circadianBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  circadianIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  circadianLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  circadianVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
    marginBottom: 2,
  },
  circadianHint: {
    fontSize: 10,
    color: '#64748B',
  },
});
