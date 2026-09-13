import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartRateSample } from '../../types/health';
import { Colors } from '../../theme/colors';

interface CleanHeartRateGraphProps {
  samples: HeartRateSample[];
}

export const CleanHeartRateGraph: React.FC<CleanHeartRateGraphProps> = ({ samples = [] }) => {
  const hasSamples = samples && samples.length > 0;
  const bpms = hasSamples ? samples.map(s => s.bpm) : [];
  const minVal = hasSamples ? Math.min(...bpms) : null;
  const maxVal = hasSamples ? Math.max(...bpms) : null;
  const avgVal = hasSamples ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : null;

  const minBpm = minVal ? Math.max(30, minVal - 10) : 40;
  const maxBpm = maxVal ? Math.max(minBpm + 20, maxVal + 10) : 180;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>24-HOUR HEART RATE</Text>
          <Text style={styles.subtitle}>
            {hasSamples ? 'Telemetry timeline across connected sources' : 'No biometric pulse data recorded today'}
          </Text>
        </View>
        {hasSamples && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.recovery.main }]} />
              <Text style={styles.legendText}>Resting</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.hr.peak }]} />
              <Text style={styles.legendText}>Exertion</Text>
            </View>
          </View>
        )}
      </View>

      {/* Clean Timeline Bars or Empty State */}
      {hasSamples ? (
        <View style={styles.chartArea}>
          {samples.map((s, i) => {
            const heightPct = Math.max(15, Math.min(100, ((s.bpm - minBpm) / (maxBpm - minBpm)) * 100));
            const isWorkout = s.source === 'fitbit' || s.bpm > 100;
            const barColor = isWorkout ? Colors.hr.peak : Colors.recovery.main;

            return (
              <View key={i} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.timeLabel, isWorkout && styles.workoutTimeLabel]}>
                  {s.timestamp}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textMuted, fontSize: 12 }}>Awaiting heart rate telemetry</Text>
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.footerStat}>
          Min: <Text style={styles.whiteText}>{minVal !== null ? `${minVal} bpm` : '—'}</Text>
        </Text>
        <Text style={styles.footerStat}>
          Resting Avg: <Text style={styles.whiteText}>{avgVal !== null ? `${avgVal} bpm` : '—'}</Text>
        </Text>
        <Text style={styles.footerStat}>
          Workout Peak: <Text style={[styles.whiteText, { color: Colors.hr.peak }]}>{maxVal !== null ? `${maxVal} bpm` : '—'}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1.0,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  chartArea: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 5,
    height: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 2.5,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 2.5,
  },
  timeLabel: {
    fontSize: 8,
    color: Colors.textMuted,
    marginTop: 6,
  },
  workoutTimeLabel: {
    color: Colors.hr.peak,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerStat: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  whiteText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
