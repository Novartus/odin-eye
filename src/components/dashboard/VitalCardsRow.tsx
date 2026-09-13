import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriPillarHealthSummary } from '../../types/health';
import { Colors } from '../../theme/colors';
import { DeviceBadge } from '../common/DeviceBadge';

interface VitalCardsRowProps {
  data: TriPillarHealthSummary;
  onSelectTab: (tab: 'recovery' | 'training') => void;
}

export const VitalCardsRow: React.FC<VitalCardsRowProps> = ({ data, onSelectTab }) => {
  const { recovery, cardio, strength } = data;

  return (
    <View style={styles.container}>
      {/* 1. Recovery & Sleep Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSelectTab('recovery')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>BIOLOGICAL RECOVERY</Text>
          <DeviceBadge source="ultrahuman" label="Ring AIR" />
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.metricBig}>{recovery.recoveryScore}%</Text>
          <View style={styles.subStats}>
            <Text style={styles.subStatText}>HRV {recovery.hrvRmssd}ms</Text>
            <Text style={styles.subStatText}>RHR {recovery.restingHeartRate} bpm</Text>
            <Text style={styles.subStatText}>Temp {recovery.skinTempDelta > 0 ? `+${recovery.skinTempDelta}` : recovery.skinTempDelta}°C</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerNote}>
            Sleep: {Math.floor(recovery.sleepDurationMinutes / 60)}h {recovery.sleepDurationMinutes % 60}m ({recovery.deepSleepPct}% Deep, {recovery.remSleepPct}% REM)
          </Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 2. Cardio & Exertion Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSelectTab('training')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>WORKOUT CARDIO</Text>
          <DeviceBadge source={cardio.recentWorkout ? 'fitbit' : 'health_connect'} label={cardio.recentWorkout ? 'Fitbit' : 'Health Connect'} />
        </View>

        <View style={styles.metricRow}>
          <Text style={[styles.metricBig, { color: Colors.cardio.text }]}>
            {cardio.todayActiveZoneMinutes} <Text style={styles.unitText}>AZM</Text>
          </Text>
          <View style={styles.subStats}>
            <Text style={styles.subStatText}>{cardio.cardioCaloriesBurned} kcal burned</Text>
            <Text style={styles.subStatText}>
              {cardio.recentWorkout ? `Peak ${cardio.peakHeartRate} bpm` : 'Fitbit inactive (5+ days)'}
            </Text>
            <Text style={styles.subStatText}>{cardio.recentWorkout?.title || 'Rest Day / Baseline'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerNote}>
            {cardio.recentWorkout
              ? `Zones: ${cardio.zoneSummary.peakMinutes}m Peak • ${cardio.zoneSummary.cardioMinutes}m Cardio • ${cardio.zoneSummary.fatBurnMinutes}m Fat Burn`
              : 'Zero residual cardiac fatigue • Synced via Health Connect'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>

      {/* 3. Strength & Muscle Recovery Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => onSelectTab('training')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>MUSCULOSKELETAL LOAD</Text>
          <DeviceBadge source="hevy" label="Hevy" />
        </View>

        <View style={styles.metricRow}>
          <Text style={[styles.metricBig, { color: Colors.strength.text }]}>
            {strength.todayWorkout ? (strength.todayWorkout.totalVolumeKg / 1000).toFixed(1) : '0.0'} <Text style={styles.unitText}>tons</Text>
          </Text>
          <View style={styles.subStats}>
            {strength.todayWorkout ? (
              <>
                <Text style={styles.subStatText}>{strength.todayWorkout.totalSets} sets logged</Text>
                <Text style={styles.subStatText}>Repair active on targeted groups</Text>
              </>
            ) : (
              <>
                <Text style={styles.subStatText}>0 sets today</Text>
                <Text style={[styles.subStatText, { color: Colors.recovery.text }]}>All Muscles 100% Primed</Text>
                <Text style={styles.subStatText}>0 fatigue debt</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerNote}>
            {strength.todayWorkout ? strength.todayWorkout.title : 'All 8 muscle groups fully recovered'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.0,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricBig: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.recovery.text,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  subStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  subStatText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: 10,
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  chevron: {
    fontSize: 16,
    color: Colors.textMuted,
    marginLeft: 6,
  },
});
