import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TriPillarHealthSummary } from '../../types/health';
import { Colors } from '../../theme/colors';

interface HeroEquilibriumProps {
  data: TriPillarHealthSummary;
}

export const HeroEquilibrium: React.FC<HeroEquilibriumProps> = ({ data }) => {
  const { recovery, cardio, strength } = data;
  const isAwaiting = recovery.recoveryScore === 0;
  const sleepHours = Math.floor(recovery.sleepDurationMinutes / 60);
  const sleepMins = recovery.sleepDurationMinutes % 60;
  const volumeTons = strength.todayWorkout ? (strength.todayWorkout.totalVolumeKg / 1000).toFixed(1) : '0';

  const statusText = isAwaiting
    ? 'AWAITING DATA'
    : recovery.recoveryScore >= 80
    ? 'OPTIMAL'
    : recovery.recoveryScore >= 60
    ? 'BALANCED'
    : 'REST NEEDED';

  const summaryText = isAwaiting
    ? 'No live biometrics synced yet. Connect your devices in Settings.'
    : recovery.recoveryScore >= 80
    ? 'High recovery tolerance • Prime state for physical exertion'
    : recovery.recoveryScore >= 60
    ? 'Balanced recovery • Maintain moderate training pace'
    : 'Elevated stress or low rest • Prioritize recovery today';

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <Text style={styles.categoryLabel}>DAILY EQUILIBRIUM</Text>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{statusText}</Text>
        </View>
      </View>

      {/* Main Focal Score */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreNumberRow}>
          <Text style={styles.scoreValue}>{isAwaiting ? '—' : recovery.recoveryScore}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <Text style={styles.scoreSummary}>{summaryText}</Text>
      </View>

      {/* Elegant 3-Pillar Balanced Metrics */}
      <View style={styles.vitalsRow}>
        <View style={styles.vitalItem}>
          <Text style={styles.vitalName}>SLEEP</Text>
          <Text style={styles.vitalNumber}>
            {recovery.sleepDurationMinutes > 0 ? `${sleepHours}h ${sleepMins}m` : '—'}
          </Text>
          <Text style={styles.vitalDetail}>
            {recovery.sleepIndex > 0 ? `${recovery.sleepIndex} Index • Ring AIR` : 'No Sleep Data'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.vitalItem}>
          <Text style={styles.vitalName}>CARDIO</Text>
          <Text style={styles.vitalNumber}>
            {cardio.todayActiveZoneMinutes > 0 ? `${cardio.todayActiveZoneMinutes} AZM` : '0 AZM'}
          </Text>
          <Text style={styles.vitalDetail}>
            {cardio.cardioCaloriesBurned > 0
              ? `${cardio.cardioCaloriesBurned} kcal`
              : '0 kcal • No Cardio Log'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.vitalItem}>
          <Text style={styles.vitalName}>VOLUME</Text>
          <Text style={styles.vitalNumber}>{parseFloat(volumeTons) > 0 ? `${volumeTons}t` : '0.0t'}</Text>
          <Text style={styles.vitalDetail}>
            {strength.todayWorkout ? `${strength.todayWorkout.totalSets} Sets • Hevy` : 'No Workout Logged'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 20,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.2,
  },
  statusPill: {
    backgroundColor: Colors.recovery.soft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.recovery.border,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.recovery.text,
    letterSpacing: 0.5,
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  scoreMax: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textMuted,
    marginLeft: 4,
  },
  scoreSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  vitalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorderSubtle,
  },
  vitalItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.divider,
  },
  vitalName: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  vitalNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  vitalDetail: {
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
