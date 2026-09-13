import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { TriPillarHealthSummary } from '../../types/health';
import { EnabledSources } from '../settings/DeviceSourcesModal';
import { Colors } from '../../theme/colors';
import { SmartRingIcon } from '../common/SmartRingIcon';
import { MetricDetailExpandModal, MetricType } from './MetricDetailExpandModal';

interface MetricCardsGridProps {
  data: TriPillarHealthSummary;
  enabledSources: EnabledSources;
  onOpenSleepMetric?: () => void;
  stepsGoal?: number;
  caloriesGoal?: number;
}

export const MetricCardsGrid: React.FC<MetricCardsGridProps> = ({
  data,
  enabledSources,
  stepsGoal = 10000,
  caloriesGoal = 500,
}) => {
  const { recovery, cardio, strength } = data;
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const hasLiveFitbitWorkout = Boolean(enabledSources.fitbit && cardio.recentWorkout);

  // Active Calories: Real live workout or real Health Connect activity
  const activeCalories = (hasLiveFitbitWorkout && cardio.cardioCaloriesBurned > 0)
    ? cardio.cardioCaloriesBurned
    : (data.dailyActivity?.activeCalories || cardio.cardioCaloriesBurned || 0);

  const caloriesVal = activeCalories > 0
    ? (activeCalories >= 1000 ? `${(activeCalories / 1000).toFixed(1)}k` : `${activeCalories}`)
    : '0';

  const caloriesSource = hasLiveFitbitWorkout
    ? 'Fitbit'
    : (activeCalories > 0 ? 'Health Connect' : 'No Data');

  // Steps & Motion: Real live pedometer from Health Connect or workout
  const totalSteps = data.dailyActivity?.steps || (cardio.recentWorkout?.distanceKm ? Math.round(cardio.recentWorkout.distanceKm * 1350) : 0);
  const stepsVal = totalSteps > 0
    ? (totalSteps >= 10000 ? `${(totalSteps / 1000).toFixed(1)}k` : totalSteps.toLocaleString())
    : '0';

  const activeDistance = (hasLiveFitbitWorkout && cardio.recentWorkout?.distanceKm)
    ? cardio.recentWorkout.distanceKm
    : (data.dailyActivity?.distanceKm || (totalSteps > 0 ? parseFloat(((totalSteps * 0.76) / 1000).toFixed(1)) : 0));

  const targetSteps = stepsGoal > 0 ? stepsGoal : 10000;
  const stepsGoalPct = Math.min(100, Math.max(0, Math.round((totalSteps / targetSteps) * 100)));

  const isHealthConnectRecovery = recovery.source === 'health_connect';

  // Live heart rate from active wearable stream
  const liveHr = recovery.currentHeartRate || recovery.restingHeartRate || (hasLiveFitbitWorkout ? cardio.averageWorkoutHeartRate : undefined);
  const heartRateVal = liveHr ? `${liveHr}` : '—';
  let heartRateSource = 'No Pulse Data';

  if (hasLiveFitbitWorkout && cardio.averageWorkoutHeartRate) {
    heartRateSource = 'Fitbit';
  } else if (recovery.currentHeartRate) {
    heartRateSource = isHealthConnectRecovery ? 'Health Connect' : 'Ring AIR';
  } else if (recovery.restingHeartRate) {
    heartRateSource = isHealthConnectRecovery ? 'Health Connect (RHR)' : 'Ring AIR (RHR)';
  }

  // Recovery Index: Real score
  const recoveryVal = recovery.recoveryScore > 0 ? `${recovery.recoveryScore}` : '—';
  const recoverySource = recovery.recoveryScore > 0
    ? (isHealthConnectRecovery ? 'Health Connect' : 'Ring AIR')
    : 'Awaiting sync';

  // Strength Volume: Real Hevy tonnage
  const todayVolumeKg = strength.todayWorkout?.totalVolumeKg || 0;
  const volumeTons = todayVolumeKg > 0
    ? (todayVolumeKg / 1000).toFixed(1)
    : (strength.weeklyVolumeKg > 0 ? (strength.weeklyVolumeKg / 1000).toFixed(1) : (strength.muscleStatuses.length > 0 ? '0.0' : '—'));

  let strengthSource = 'No Hevy Data';
  if (todayVolumeKg > 0) {
    strengthSource = 'Hevy';
  } else if (strength.weeklyVolumeKg > 0) {
    strengthSource = 'Hevy (Weekly)';
  } else if (strength.muscleStatuses.length > 0) {
    strengthSource = 'Muscles Primed';
  }

  // Svg circular progress calculations for Walking Hero card
  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const outerStrokeOffset = ringCircumference - (ringCircumference * (stepsGoalPct || 15)) / 100;

  const innerRadius = 28;
  const innerCircumference = 2 * Math.PI * innerRadius;
  const innerProgressPct = Math.min(100, Math.max(10, Math.round((activeDistance / 8) * 100)));
  const innerStrokeOffset = innerCircumference - (innerCircumference * innerProgressPct) / 100;

  return (
    <View style={styles.container}>
      {/* Signature Headline matching user's style */}
      <View style={styles.headlineContainer}>
        <Text style={styles.headlineText}>
          All Your <Text style={styles.headlineHighlight}>Health.</Text>
        </Text>
        <Text style={styles.subHeadlineText}>Mindful Daily Equilibrium</Text>
      </View>

        {/* 1. HERO BENTO CARD: SAGE MINT WALKING CARD (Screen 2 Signature) */}
      <TouchableOpacity
        style={styles.walkingCard}
        onPress={() => setSelectedMetric('distance')}
        activeOpacity={0.88}
      >
        <View style={styles.walkingLeftCol}>
          {/* Floating Pure White Pill Badge */}
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>👟 Walking</Text>
          </View>

          {/* Big Bold Goal % */}
          <View style={styles.walkingValueRow}>
            <Text style={styles.walkingPercentText}>
              {stepsGoalPct > 0 ? `${stepsGoalPct}%` : '0%'}
            </Text>
            <Text style={styles.walkingTargetLabel}>Total in this day</Text>
          </View>

          {/* Subtext info */}
          <View style={styles.walkingFootnote}>
            <Text style={styles.walkingFootnoteText}>
              {totalSteps > 0 ? `${totalSteps.toLocaleString()} steps` : '0 steps logged'} • {activeDistance > 0 ? `${activeDistance} km` : 'Awaiting motion'}
            </Text>
          </View>
        </View>

        {/* Right Concentric Circular Ring Gauge with Floating Pure White Center Disk */}
        <View style={styles.walkingRingWrapper}>
          <Svg width="102" height="102" viewBox="0 0 102 102">
            {/* Outer Ring Track */}
            <Circle
              cx="51"
              cy="51"
              r="43"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="6"
              fill="none"
            />
            {/* Outer Ring Progress */}
            <Circle
              cx="51"
              cy="51"
              r="43"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 43}`}
              strokeDashoffset={`${2 * Math.PI * 43 - (2 * Math.PI * 43 * (stepsGoalPct || 15)) / 100}`}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 51 51)"
            />
          </Svg>

          {/* Floating Pure White Center Disk (Screen 2 Exact Signature) */}
          <View style={styles.walkingInnerWhiteDisk}>
            <Text style={styles.walkingDiskValue}>
              {activeDistance > 0 ? `${activeDistance}` : stepsVal}
            </Text>
            <Text style={styles.walkingDiskUnit}>
              {activeDistance > 0 ? 'km' : 'steps'}
            </Text>
            <Text style={styles.walkingDiskLabel}>Walking</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 2. MILESTONE BANNER (Screen 2 Signature) */}
      <View style={styles.milestoneBanner}>
        <View style={styles.milestoneIconWrap}>
          <Text style={styles.milestoneCrown}>👑</Text>
        </View>
        <View style={styles.milestoneTextCol}>
          <Text style={styles.milestoneTitle}>
            {stepsGoalPct >= 80 ? 'Wow! You made it!' : 'Daily Wellness Momentum'}
          </Text>
          <Text style={styles.milestoneSub}>
            {stepsGoalPct >= 80
              ? 'You have completed your daily steps goal.'
              : `${stepsGoalPct}% achieved toward ${targetSteps.toLocaleString()} steps.`}
          </Text>
        </View>
      </View>

      {/* 3. ASYMMETRIC 2-COLUMN BENTO GRID */}
      <View style={styles.bentoRow}>
        {/* LEFT COLUMN: Lilac Recovery Card + Strength Volume */}
        <View style={styles.bentoColLeft}>
          {/* Lavender Lilac Recovery Card (Screen 2 Tall Tile) */}
          <TouchableOpacity
            style={styles.lilacCard}
            onPress={() => setSelectedMetric('recovery')}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeaderRow}>
              <View style={styles.lilacPill}>
                <Text style={styles.lilacPillText}>Recovery</Text>
              </View>
              <SmartRingIcon size={16} color="#4A4560" accentColor="#7C73A8" />
            </View>

            <View style={styles.lilacContentCenter}>
              {/* Circular disk with pulse indicator */}
              <View style={styles.lilacCircleWrapper}>
                <Svg width="64" height="64" viewBox="0 0 64 64">
                  <Circle cx="32" cy="32" r="27" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="4" fill="none" />
                  <Circle
                    cx="32"
                    cy="32"
                    r="27"
                    stroke="#5F5782"
                    strokeWidth="4"
                    strokeDasharray="170"
                    strokeDashoffset={recovery.recoveryScore > 0 ? `${170 - (170 * recovery.recoveryScore) / 100}` : '65'}
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-90 32 32)"
                  />
                </Svg>
                {/* Pure White Floating Disk with footsteps icon */}
                <View style={styles.lilacInnerWhiteDisk}>
                  <Text style={styles.lilacDiskIcon}>🐾</Text>
                </View>
              </View>

              <View style={styles.lilacValWrap}>
                <Text style={styles.lilacScoreText}>{recoveryVal}</Text>
                {recovery.recoveryScore > 0 && <Text style={styles.lilacScoreUnit}>%</Text>}
              </View>
              <Text style={styles.lilacSubtext}>
                {recovery.recoveryScore >= 80 ? 'Optimal state' : recovery.recoveryScore > 0 ? 'Steady balance' : 'Awaiting sync'}
              </Text>
            </View>

            <View style={styles.sourceBottomRow}>
              <Text style={styles.cardSourceText}>{recoverySource}</Text>
              <Text style={styles.arrowSmall}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Strength Volume Card */}
          <TouchableOpacity
            style={styles.strengthCard}
            onPress={() => setSelectedMetric('strength')}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.compactCardTitle}>Strength</Text>
              <View style={styles.miniIconCircle}>
                <Text style={{ fontSize: 13 }}>🏋️</Text>
              </View>
            </View>
            <View style={styles.compactValueRow}>
              <Text style={styles.compactValueText}>{volumeTons}</Text>
              <Text style={styles.compactUnitText}>tons</Text>
            </View>
            <Text style={styles.cardSourceText}>{strengthSource}</Text>
          </TouchableOpacity>
        </View>

        {/* RIGHT COLUMN: Calories Peach Card + Heart Rate Yellow Card */}
        <View style={styles.bentoColRight}>
          {/* Peach Calories Card (Screen 2 Right Top) */}
          <TouchableOpacity
            style={styles.peachCard}
            onPress={() => setSelectedMetric('calories')}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.peachCardTitle}>Calories</Text>
              <View style={styles.peachIconCircle}>
                <Text style={{ fontSize: 14 }}>🔥</Text>
              </View>
            </View>

            <View style={styles.peachValueRow}>
              <Text style={styles.peachValueText}>{caloriesVal}</Text>
              <Text style={styles.peachUnitText}>kcal</Text>
            </View>
            <Text style={styles.peachLabel}>Burned today</Text>

            <View style={styles.sourceBottomRow}>
              <Text style={styles.cardSourceText}>{caloriesSource}</Text>
              <Text style={styles.arrowSmall}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Buttercream Pulse Card (Screen 2 Right Bottom) */}
          <TouchableOpacity
            style={styles.buttercreamCard}
            onPress={() => setSelectedMetric('heart')}
            activeOpacity={0.88}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.buttercreamCardTitle}>Heart Rate</Text>
              <View style={styles.yellowIconCircle}>
                <Text style={{ fontSize: 14 }}>❤️</Text>
              </View>
            </View>

            <View style={styles.buttercreamValueRow}>
              <Text style={styles.buttercreamValueText}>{heartRateVal}</Text>
              <Text style={styles.buttercreamUnitText}>bpm</Text>
            </View>
            <Text style={styles.buttercreamLabel}>Resting pulse</Text>

            <View style={styles.sourceBottomRow}>
              <Text style={styles.cardSourceText}>{heartRateSource}</Text>
              <Text style={styles.arrowSmall}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Detail Modal */}
      <MetricDetailExpandModal
        visible={selectedMetric !== null}
        metricType={selectedMetric}
        onClose={() => setSelectedMetric(null)}
        data={data}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headlineContainer: {
    marginBottom: 16,
    marginTop: 2,
  },
  headlineText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.6,
  },
  headlineHighlight: {
    color: '#2C4A3E',
  },
  subHeadlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#63706B',
    marginTop: 2,
    letterSpacing: 0.1,
  },

  // 1. HERO SAGE MINT WALKING CARD
  walkingCard: {
    backgroundColor: '#CCE6DE',
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.06)',
  },
  walkingLeftCol: {
    flex: 1,
    paddingRight: 8,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#152920',
  },
  walkingValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  walkingPercentText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#152920',
    letterSpacing: -1,
  },
  walkingTargetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2B4A3D',
  },
  walkingFootnote: {
    marginTop: 4,
  },
  walkingFootnoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#345747',
  },
  walkingRingWrapper: {
    width: 102,
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  walkingInnerWhiteDisk: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  walkingDiskValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.3,
  },
  walkingDiskUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: '#63706B',
    marginTop: -2,
  },
  walkingDiskLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8E9E98',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
  },

  // 2. MILESTONE BANNER
  milestoneBanner: {
    backgroundColor: '#E3F1EC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.06)',
  },
  milestoneIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  milestoneCrown: {
    fontSize: 20,
  },
  milestoneTextCol: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#152920',
  },
  milestoneSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#345747',
    marginTop: 2,
  },

  // 3. ASYMMETRIC BENTO GRID
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoColLeft: {
    flex: 1,
    gap: 12,
  },
  bentoColRight: {
    flex: 1,
    gap: 12,
  },

  // LILAC CARD
  lilacCard: {
    backgroundColor: '#DDD9F5',
    borderRadius: 24,
    padding: 16,
    minHeight: 196,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(73, 61, 120, 0.08)',
    shadowColor: '#493D78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  lilacPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#493D78',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  lilacPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2B234B',
  },
  lilacContentCenter: {
    alignItems: 'center',
    marginVertical: 4,
  },
  lilacCircleWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  lilacInnerWhiteDisk: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#493D78',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lilacDiskIcon: {
    fontSize: 18,
  },
  lilacValWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  lilacScoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F1836',
    letterSpacing: -0.5,
  },
  lilacScoreUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#493D78',
  },
  lilacSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#524580',
    marginTop: 2,
  },

  // STRENGTH CARD
  strengthCard: {
    backgroundColor: '#E4EFF5',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(30, 60, 80, 0.06)',
    shadowColor: '#1E3C50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  compactCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#152936',
  },
  miniIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3C50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  compactValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 6,
    marginBottom: 2,
  },
  compactValueText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#152936',
  },
  compactUnitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#496A7E',
  },

  // PEACH CARD
  peachCard: {
    backgroundColor: '#FCE7DC',
    borderRadius: 24,
    padding: 16,
    minHeight: 128,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(140, 71, 36, 0.08)',
    shadowColor: '#8C4724',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  peachCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#54260E',
  },
  peachIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C4724',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  peachValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  peachValueText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3A1806',
    letterSpacing: -0.4,
  },
  peachUnitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8C4724',
  },
  peachLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#703A1E',
    marginTop: 1,
  },

  // BUTTERCREAM CARD
  buttercreamCard: {
    backgroundColor: '#FDF5D9',
    borderRadius: 24,
    padding: 16,
    minHeight: 128,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(135, 104, 20, 0.08)',
    shadowColor: '#876814',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  buttercreamCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#523E08',
  },
  yellowIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#876814',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttercreamValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  buttercreamValueText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#332602',
    letterSpacing: -0.4,
  },
  buttercreamUnitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#876814',
  },
  buttercreamLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#705612',
    marginTop: 1,
  },

  // COMMON CARD ELEMENTS
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cardSourceText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.45)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  arrowSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.35)',
    lineHeight: 14,
  },
});

