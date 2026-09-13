import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UltrahumanRecoveryData } from '../../types/health';
import { Colors } from '../../theme/colors';
import { DeviceBadge } from '../common/DeviceBadge';
import { SleepBarChart } from '../sleep/SleepBarChart';
import { sleepHistoryService } from '../../services/sleep/sleepHistoryService';

interface SleepHypnogramProps {
  recovery: UltrahumanRecoveryData;
}

export const SleepHypnogram: React.FC<SleepHypnogramProps> = ({ recovery }) => {
  const hasSleep = recovery.sleepDurationMinutes > 0;
  const hours = Math.floor(recovery.sleepDurationMinutes / 60);
  const minutes = recovery.sleepDurationMinutes % 60;

  const weeklySleepRecords = sleepHistoryService.getWeeklySleepHistory(
    recovery.sleepDurationMinutes,
    recovery.sleepIndex,
    recovery.sleepEfficiencyPct
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 13 }}>🌙</Text>
            </View>
            <Text style={styles.title}>SLEEP ARCHITECTURE & CONSISTENCY</Text>
          </View>
          <Text style={styles.subtitle}>Nocturnal biometric restoration</Text>
        </View>
        <DeviceBadge
          source={recovery.source === 'health_connect' ? 'health_connect' : 'ultrahuman'}
          label={recovery.source === 'health_connect' ? 'Health Connect' : 'Ring AIR'}
        />
      </View>

      {/* Main Score Row */}
      <View style={styles.metricsRow}>
        <View>
          <Text style={styles.bigValue}>{hasSleep ? `${hours}h ${minutes}m` : '—'}</Text>
          <Text style={styles.metaValue}>
            {hasSleep ? `${recovery.sleepEfficiencyPct || 92}% Sleep Efficiency` : 'Awaiting sleep log'}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>INDEX</Text>
          <Text style={styles.statNum}>{recovery.sleepIndex > 0 ? recovery.sleepIndex : '—'}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>HRV (RMSSD)</Text>
          <Text style={[styles.statNum, { color: '#10B981' }]}>
            {recovery.hrvRmssd > 0 ? `${recovery.hrvRmssd}ms` : '—'}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TEMP</Text>
          <Text style={styles.statNum}>
            {recovery.skinTempDelta !== 0
              ? `${recovery.skinTempDelta > 0 ? '+' : ''}${recovery.skinTempDelta}°C`
              : '—'}
          </Text>
        </View>
      </View>

      {/* 7-Day Sleep Duration & Consistency Pill Chart */}
      <View style={styles.chartWrapper}>
        <Text style={styles.chartMiniHeader}>7-DAY SLEEP CONSISTENCY</Text>
        <SleepBarChart records={weeklySleepRecords} compact={true} accentVariant="purple" />
      </View>

      {/* Hypnogram Bar */}
      {hasSleep ? (
        <>
          <View style={styles.bar}>
            <View style={[styles.seg, { flex: Math.max(1, recovery.deepSleepPct), backgroundColor: '#7C3AED' }]} />
            <View style={[styles.seg, { flex: Math.max(1, recovery.remSleepPct), backgroundColor: '#38BDF8' }]} />
            <View style={[styles.seg, { flex: Math.max(1, recovery.lightSleepPct), backgroundColor: '#94A3B8' }]} />
            <View style={[styles.seg, { flex: Math.max(1, recovery.awakePct), backgroundColor: '#F59E0B' }]} />
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <Text style={styles.legendItem}>• Deep {recovery.deepSleepPct}%</Text>
            <Text style={styles.legendItem}>• REM {recovery.remSleepPct}%</Text>
            <Text style={styles.legendItem}>• Light {recovery.lightSleepPct}%</Text>
            <Text style={styles.legendItem}>• Awake {recovery.awakePct}%</Text>
          </View>
        </>
      ) : (
        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: Colors.textMuted, fontSize: 12 }}>No sleep stages logged yet today</Text>
        </View>
      )}

      {/* Circadian Schedule */}
      <View style={styles.circadianRow}>
        <View style={styles.circadianBox}>
          <Text style={styles.circadianLabel}>SUNLIGHT WINDOW</Text>
          <Text style={styles.circadianTime}>
            {recovery.circadianPhase.morningSunlightWindow.start && recovery.circadianPhase.morningSunlightWindow.end
              ? `${recovery.circadianPhase.morningSunlightWindow.start} - ${recovery.circadianPhase.morningSunlightWindow.end}`
              : '07:30 - 08:30'}
          </Text>
        </View>
        <View style={styles.circadianBox}>
          <Text style={styles.circadianLabel}>CAFFEINE CUTOFF</Text>
          <Text style={styles.circadianTime}>{recovery.circadianPhase.caffeineCutoffTime || '14:00'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  bigValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  metaValue: {
    fontSize: 11,
    color: '#7C3AED',
    fontWeight: '700',
    marginTop: 2,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  statNum: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  chartWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chartMiniHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  bar: {
    height: 10,
    flexDirection: 'row',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
    gap: 2,
  },
  seg: {
    height: '100%',
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  legendItem: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  circadianRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  circadianBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  circadianLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  circadianTime: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
