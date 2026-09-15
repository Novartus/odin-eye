import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { HealthOverviewViewProps } from '../../types';
import { Colors } from '../../theme/colors';
import { SleepArchitectureBentoCard } from '../sleep/SleepArchitectureBentoCard';

export const HealthOverviewView: React.FC<HealthOverviewViewProps> = ({
  data,
  targetSleepGoal = 8.0,
}) => {
  const { cardio, recovery, strength } = data;

  const hasActivityData = Boolean(
    (recovery.movementIndex && recovery.movementIndex > 0) ||
    (cardio.todayActiveZoneMinutes && cardio.todayActiveZoneMinutes > 0) ||
    (data.dailyActivity?.steps && data.dailyActivity.steps > 0)
  );
  const activityPct = hasActivityData
    ? Math.min(
        100,
        recovery.movementIndex ||
          Math.round((cardio.todayActiveZoneMinutes / 45) * 100) ||
          Math.round(((data.dailyActivity?.steps || 0) / 10000) * 100)
      )
    : 0;

  const hasSleepData = Boolean(
    (recovery.sleepIndex && recovery.sleepIndex > 0) ||
    (recovery.sleepDurationMinutes && recovery.sleepDurationMinutes > 0)
  );
  const sleepPct = hasSleepData ? (recovery.sleepIndex || recovery.sleepEfficiencyPct || 0) : 0;

  const hasStrengthData = strength.muscleStatuses.length > 0;
  const strengthPct = hasStrengthData
    ? Math.min(
        100,
        Math.round(
          strength.muscleStatuses.reduce((acc, m) => acc + m.recoveryPct, 0) /
            strength.muscleStatuses.length
        )
      )
    : (strength.weeklyVolumeKg > 0 ? 100 : 0);

  const activePillars = [
    ...(hasActivityData ? [activityPct] : []),
    ...(hasSleepData ? [sleepPct] : []),
    ...(hasStrengthData || strength.weeklyVolumeKg > 0 ? [strengthPct] : []),
  ];
  const overallScore = activePillars.length > 0
    ? Math.round(activePillars.reduce((acc, p) => acc + p, 0) / activePillars.length)
    : 0;

  const hasWorkout = Boolean(cardio.recentWorkout);
  const distanceKm =
    cardio.recentWorkout?.distanceKm !== undefined && cardio.recentWorkout.distanceKm > 0
      ? cardio.recentWorkout.distanceKm
      : data.dailyActivity?.distanceKm || 0;
  const distanceVal = distanceKm > 0 ? distanceKm.toFixed(1) : '0.0';

  const stepsCount =
    data.dailyActivity?.steps ||
    (cardio.recentWorkout?.distanceKm ? Math.round(cardio.recentWorkout.distanceKm * 1350) : 0);
  const stepsVal = stepsCount > 0 ? stepsCount.toLocaleString() : '0';

  let paceVal = '—';
  if (cardio.recentWorkout && cardio.recentWorkout.distanceKm && cardio.recentWorkout.distanceKm > 0) {
    const paceDecimal = cardio.recentWorkout.durationMinutes / cardio.recentWorkout.distanceKm;
    const mins = Math.floor(paceDecimal);
    const secs = Math.round((paceDecimal - mins) * 60);
    paceVal = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const caloriesVal =
    cardio.cardioCaloriesBurned > 0
      ? cardio.cardioCaloriesBurned
      : data.dailyActivity?.activeCalories || 0;

  // Tri-Pillar 3-Ring SVG Calculations
  const r1 = 44; // Activity (outer)
  const c1 = 2 * Math.PI * r1;
  const off1 = c1 - (c1 * activityPct) / 100;

  const r2 = 34; // Sleep (mid)
  const c2 = 2 * Math.PI * r2;
  const off2 = c2 - (c2 * sleepPct) / 100;

  const r3 = 24; // Strength (inner)
  const c3 = 2 * Math.PI * r3;
  const off3 = c3 - (c3 * strengthPct) / 100;

  return (
    <View style={styles.container}>
      {/* 1. Hero Tri-Pillar Health Score Card (Periwinkle Lilac Bento) */}
      <View style={styles.heroLilacCard}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroTextCol}>
            <View style={styles.whitePillBadge}>
              <Text style={styles.whitePillBadgeText}>🌿 BIOMETRIC HARMONY</Text>
            </View>
            <Text style={styles.heroBigScore}>{overallScore}%</Text>
            <Text style={styles.heroScoreSub}>Weekly Equilibrium Index</Text>
          </View>

          {/* Tri-Pillar Concentric SVG Rings */}
          <View style={styles.ringDialBox}>
            <Svg width="112" height="112" viewBox="0 0 112 112">
              {/* Outer Ring: Activity */}
              <Circle cx="56" cy="56" r={r1} stroke="rgba(255, 255, 255, 0.35)" strokeWidth="6" fill="none" />
              <Circle
                cx="56"
                cy="56"
                r={r1}
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeDasharray={c1}
                strokeDashoffset={off1}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 56 56)"
              />

              {/* Mid Ring: Sleep */}
              <Circle cx="56" cy="56" r={r2} stroke="rgba(255, 255, 255, 0.35)" strokeWidth="6" fill="none" />
              <Circle
                cx="56"
                cy="56"
                r={r2}
                stroke="#181C1B"
                strokeWidth="6"
                strokeDasharray={c2}
                strokeDashoffset={off2}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 56 56)"
              />

              {/* Inner Ring: Strength */}
              <Circle cx="56" cy="56" r={r3} stroke="rgba(255, 255, 255, 0.35)" strokeWidth="6" fill="none" />
              <Circle
                cx="56"
                cy="56"
                r={r3}
                stroke="#FCE7DC"
                strokeWidth="6"
                strokeDasharray={c3}
                strokeDashoffset={off3}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 56 56)"
              />
            </Svg>
            <View style={styles.innerDisk}>
              <Text style={styles.innerDiskIcon}>⚡</Text>
            </View>
          </View>
        </View>

        {/* 3 Pillars Status Breakdown Strip */}
        <View style={styles.pillarsRow}>
          <View style={styles.pillarPill}>
            <View style={[styles.pillarDot, { backgroundColor: '#FFFFFF' }]} />
            <Text style={styles.pillarTitle} numberOfLines={1}>Activity</Text>
            <Text style={styles.pillarVal} numberOfLines={1}>{activityPct}%</Text>
          </View>

          <View style={styles.pillarPill}>
            <View style={[styles.pillarDot, { backgroundColor: '#181C1B' }]} />
            <Text style={styles.pillarTitle} numberOfLines={1}>Sleep</Text>
            <Text style={styles.pillarVal} numberOfLines={1}>{sleepPct}%</Text>
          </View>

          <View style={styles.pillarPill}>
            <View style={[styles.pillarDot, { backgroundColor: '#E07A5F' }]} />
            <Text style={styles.pillarTitle} numberOfLines={1}>Recover</Text>
            <Text style={styles.pillarVal} numberOfLines={1}>{strengthPct}%</Text>
          </View>
        </View>
      </View>

      {/* 2. Running & Cardio Overview Bento Card (Matcha Sage Mint) */}
      <View style={styles.mintCard}>
        <View style={styles.mintTopRow}>
          <View style={styles.whiteBadge}>
            <Text style={styles.whiteBadgeText}>🏃 Cardio & Distance</Text>
          </View>
          <Text style={styles.mintSourceTag}>
            {hasWorkout ? 'Fitbit Workout' : distanceKm > 0 ? 'Health Connect' : 'Live Tracking'}
          </Text>
        </View>

        <View style={styles.distanceHeroRow}>
          <Text style={styles.distanceHeroNum}>{distanceVal}</Text>
          <Text style={styles.distanceHeroUnit}>km</Text>
          <View style={styles.distanceBadgeRight}>
            <Text style={styles.distanceBadgeText}>
              {distanceKm >= 5 ? 'Target Reached 🎯' : 'Active Movement'}
            </Text>
          </View>
        </View>

        {/* 4 Performance Metric Bento Disks */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCell}>
            <Text style={styles.metricCellLabel}>👟 Daily Steps</Text>
            <Text style={styles.metricCellVal}>{stepsVal}</Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricCellLabel}>⚡ Active Pace</Text>
            <Text style={styles.metricCellVal}>{paceVal} <Text style={styles.metricCellUnit}>m/km</Text></Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricCellLabel}>⏱️ Active Mins</Text>
            <Text style={styles.metricCellVal}>{cardio.todayActiveZoneMinutes} <Text style={styles.metricCellUnit}>mins</Text></Text>
          </View>
          <View style={styles.metricCell}>
            <Text style={styles.metricCellLabel}>🔥 Calories</Text>
            <Text style={styles.metricCellVal}>{caloriesVal} <Text style={styles.metricCellUnit}>kcal</Text></Text>
          </View>
        </View>
      </View>

      {/* 3. Asymmetric 2-Column Bento Strip */}
      <View style={styles.miniBentoRow}>
        {/* Left Column: Rest & Sleep Obsidian Hero Card */}
        <View style={styles.obsidianSleepCard}>
          <View style={styles.obsidianTop}>
            <Text style={styles.obsidianLabel}>Rest & Sleep</Text>
            <Text style={{ fontSize: 18 }}>🌙</Text>
          </View>
          <Text style={styles.obsidianBigNum}>{recovery.sleepDurationMinutes > 0 ? `${Math.floor(recovery.sleepDurationMinutes / 60)}h ${recovery.sleepDurationMinutes % 60}m` : '0h 0m'}</Text>
          <Text style={styles.obsidianSub}>{recovery.sleepDurationMinutes > 0 ? (recovery.sleepIndex >= 80 ? 'Deep Sleep Optimal' : 'Restorative Sleep') : 'Awaiting Sleep Log'}</Text>
          <View style={styles.obsidianPillRow}>
            <View style={styles.obsidianPill}>
              <Text style={styles.obsidianPillText}>Score: {recovery.sleepIndex || 0}%</Text>
            </View>
            {Boolean(recovery.sleepHeartRateAvg || recovery.restingHeartRate > 0) && (
              <View style={[styles.obsidianPill, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}>
                <Text style={[styles.obsidianPillText, { color: '#FFFFFF' }]}>
                  ❤️ {recovery.sleepHeartRateAvg || recovery.restingHeartRate} bpm
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right Column: Warm Apricot Peach Recovery Card */}
        <View style={styles.peachCard}>
          <View style={styles.peachTop}>
            <Text style={styles.peachLabel}>Muscular Load</Text>
            <View style={styles.peachCircleIcon}>
              <Text style={{ fontSize: 14 }}>🏋️</Text>
            </View>
          </View>
          <Text style={styles.peachBigNum}>
            {strength.todayWorkout?.totalVolumeKg
              ? `${(strength.todayWorkout.totalVolumeKg / 1000).toFixed(1)}t`
              : `${(strength.weeklyVolumeKg / 1000).toFixed(1)}t`}
          </Text>
          <Text style={styles.peachSub}>Tonnage Lifted</Text>
          <View style={styles.peachPill}>
            <Text style={styles.peachPillText}>{strength.muscleStatuses.length > 0 ? `${strength.muscleStatuses.filter(m => m.state === 'primed').length} Groups Primed` : 'All Primed'}</Text>
          </View>
        </View>
      </View>

      {/* 4. Comprehensive Sleep Architecture & 7-Day Debt Clinical Telemetry */}
      <SleepArchitectureBentoCard
        recovery={recovery}
        targetSleepHours={targetSleepGoal}
        style={styles.sleepArchitectureCard}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 30,
  },
  sleepArchitectureCard: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  heroLilacCard: {
    backgroundColor: '#DDD9F5',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(73, 61, 120, 0.08)',
    shadowColor: '#493D78',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    gap: 16,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  whitePillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  whitePillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#493D78',
    letterSpacing: 0.5,
  },
  heroBigScore: {
    fontSize: 42,
    fontWeight: '900',
    color: '#181C1B',
    letterSpacing: -1.2,
  },
  heroScoreSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#493D78',
    marginTop: 2,
  },
  ringDialBox: {
    width: 112,
    height: 112,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDisk: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  innerDiskIcon: {
    fontSize: 16,
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pillarPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
    overflow: 'hidden',
  },
  pillarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  pillarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#493D78',
    flex: 1,
    flexShrink: 1,
  },
  pillarVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#181C1B',
    flexShrink: 0,
  },
  mintCard: {
    backgroundColor: '#CCE6DE',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    gap: 14,
  },
  mintTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whiteBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  whiteBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F382E',
  },
  mintSourceTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C4A3E',
  },
  distanceHeroRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  distanceHeroNum: {
    fontSize: 44,
    fontWeight: '900',
    color: '#141816',
    letterSpacing: -1.5,
  },
  distanceHeroUnit: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C4A3E',
  },
  distanceBadgeRight: {
    marginLeft: 'auto',
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#237A5D',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCell: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 4,
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  metricCellLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  metricCellVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricCellUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  miniBentoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  obsidianSleepCard: {
    flex: 1,
    backgroundColor: '#1E2327',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2C3339',
    gap: 6,
  },
  obsidianTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  obsidianLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  obsidianBigNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  obsidianSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  obsidianPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  obsidianPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  obsidianPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFC42B',
  },
  peachCard: {
    flex: 1,
    backgroundColor: '#FCE7DC',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(140, 71, 36, 0.08)',
    gap: 6,
  },
  peachTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peachLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C4724',
  },
  peachCircleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peachBigNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#54260E',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  peachSub: {
    fontSize: 11,
    color: '#8C4724',
  },
  peachPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  peachPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8C4724',
  },
});
