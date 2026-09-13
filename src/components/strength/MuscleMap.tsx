import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MuscleRecoveryStatus } from '../../types/health';
import { Colors } from '../../theme/colors';
import { DeviceBadge } from '../common/DeviceBadge';

interface MuscleMapProps {
  muscleStatuses: MuscleRecoveryStatus[];
}

export const MuscleMap: React.FC<MuscleMapProps> = ({ muscleStatuses }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MUSCLE RECOVERY STATUS</Text>
          <Text style={styles.subtitle}>48h–72h physiological repair cycles</Text>
        </View>
        <DeviceBadge source="hevy" label="Hevy Logs" />
      </View>

      <View style={styles.grid}>
        {muscleStatuses.map((item) => {
          let statusColor = Colors.recovery.text;
          let label = 'Primed';

          if (item.state === 'fatigued') {
            statusColor = '#EF4444';
            label = `${item.recommendedHoursRemaining}h rest`;
          } else if (item.state === 'recovering') {
            statusColor = Colors.cardio.text;
            label = `${item.recommendedHoursRemaining}h left`;
          }

          return (
            <View key={item.muscle} style={styles.muscleRow}>
              <View style={styles.leftInfo}>
                <Text style={styles.muscleName}>{item.displayName}</Text>
                <Text style={styles.trainedTime}>{item.lastTrainedDate}</Text>
              </View>

              <View style={styles.rightInfo}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${item.recoveryPct}%`, backgroundColor: statusColor },
                    ]}
                  />
                </View>
                <Text style={[styles.pct, { color: statusColor }]}>{label}</Text>
              </View>
            </View>
          );
        })}
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
    alignItems: 'center',
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
  grid: {
    gap: 8,
  },
  muscleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  leftInfo: {
    flex: 1,
  },
  muscleName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  trainedTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  pct: {
    fontSize: 10,
    fontWeight: '700',
    width: 48,
    textAlign: 'right',
  },
});
