import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TriPillarHealthSummary } from '../../types/health';
import { Colors } from '../../theme/colors';

interface HealthOverviewViewProps {
  data: TriPillarHealthSummary;
}

export const HealthOverviewView: React.FC<HealthOverviewViewProps> = ({ data }) => {
  const { cardio, recovery, strength } = data;

  const activityPct = recovery.movementIndex || Math.min(Math.round((cardio.todayActiveZoneMinutes / 45) * 100), 100);
  const sleepPct = recovery.sleepIndex || 0;
  const strengthPct = strength.muscleStatuses.length > 0
    ? Math.min(
        100,
        Math.round(
          strength.muscleStatuses.reduce((acc, m) => acc + m.recoveryPct, 0) /
            strength.muscleStatuses.length
        )
      )
    : 100;

  const hasWorkout = Boolean(cardio.recentWorkout);
  const distanceKm = (cardio.recentWorkout?.distanceKm !== undefined && cardio.recentWorkout.distanceKm > 0)
    ? cardio.recentWorkout.distanceKm
    : (data.dailyActivity?.distanceKm || 0);
  const distanceVal = distanceKm > 0 ? distanceKm.toFixed(1) : '0.0';

  const stepsCount = data.dailyActivity?.steps || (cardio.recentWorkout?.distanceKm ? Math.round(cardio.recentWorkout.distanceKm * 1350) : 0);
  const stepsVal = stepsCount > 0 ? stepsCount.toLocaleString() : '0';

  let paceVal = '—';
  if (cardio.recentWorkout && cardio.recentWorkout.distanceKm && cardio.recentWorkout.distanceKm > 0) {
    const paceDecimal = cardio.recentWorkout.durationMinutes / cardio.recentWorkout.distanceKm;
    const mins = Math.floor(paceDecimal);
    const secs = Math.round((paceDecimal - mins) * 60);
    paceVal = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const caloriesVal = cardio.cardioCaloriesBurned > 0
    ? cardio.cardioCaloriesBurned
    : (data.dailyActivity?.activeCalories || 0);

  return (
    <View style={styles.container}>
      {/* 1. Weekly Health Score Card */}
      <View style={[styles.card, styles.lilacScoreCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Weekly Health Score</Text>
            <Text style={styles.cardSubtitle}>
              {recovery.recoveryScore > 0 || sleepPct > 0
                ? 'Your overall wellness performance this week.'
                : 'Awaiting data from your connected devices.'}
            </Text>
          </View>
          <View style={styles.moreIcon}>
            <Text style={styles.moreIconText}>•••</Text>
          </View>
        </View>

        {/* Segmented Metric Bars */}
        <View style={styles.barSection}>
          <View style={styles.barItem}>
            <View style={styles.barLabels}>
              <Text style={styles.barName}>Activity</Text>
              <Text style={styles.barPercent}>{activityPct}%</Text>
            </View>
            <View style={styles.dottedTrack}>
              <View style={[styles.dottedFill, { width: `${activityPct}%`, backgroundColor: '#2C4A3E' }]} />
            </View>
          </View>

          <View style={styles.barItem}>
            <View style={styles.barLabels}>
              <Text style={styles.barName}>Sleep</Text>
              <Text style={styles.barPercent}>{sleepPct > 0 ? `${sleepPct}%` : '—'}</Text>
            </View>
            <View style={styles.dottedTrack}>
              <View style={[styles.dottedFill, { width: `${sleepPct}%`, backgroundColor: '#5E4E8A' }]} />
            </View>
          </View>

          <View style={styles.barItem}>
            <View style={styles.barLabels}>
              <Text style={styles.barName}>Strength</Text>
              <Text style={styles.barPercent}>{strengthPct}%</Text>
            </View>
            <View style={styles.dottedTrack}>
              <View style={[styles.dottedFill, { width: `${strengthPct}%`, backgroundColor: '#A05934' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* 2. Running & Cardio Overview Card */}
      <View style={[styles.card, styles.mintCard]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Running & Activity</Text>
            <Text style={styles.cardSubtitle}>
              {hasWorkout
                ? 'Fitbit workout & cardiovascular tracking.'
                : distanceKm > 0
                ? 'Cardio & activity via Android Health Connect.'
                : 'No running or cardio activities logged today.'}
            </Text>
          </View>
          <View style={styles.moreIcon}>
            <Text style={styles.moreIconText}>•••</Text>
          </View>
        </View>

        {/* Stylized GPS Map View Box */}
        <View style={styles.mapBox}>
          <View style={styles.mapGridPattern}>
            <View style={styles.mapRouteLine} />
            <View style={styles.mapGpsPin}>
              <View style={styles.pinDot} />
            </View>
          </View>
          <Text style={styles.mapBadge}>
            {hasWorkout ? 'GPS ROUTE SYNCED' : distanceKm > 0 ? 'PEDOMETER DISTANCE' : 'NO ROUTE RECORDED'}
          </Text>
        </View>

        {/* Large Distance Stat */}
        <View style={styles.distanceRow}>
          <Text style={styles.distanceNum}>{distanceVal}</Text>
          <Text style={styles.distanceUnit}>km</Text>
        </View>

        {/* 4 Performance Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <Text style={styles.cellLabel}>Steps</Text>
            <Text style={styles.cellVal}>{stepsVal} <Text style={styles.cellSub}>steps</Text></Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.cellLabel}>Avg Pace</Text>
            <Text style={styles.cellVal}>{paceVal} <Text style={styles.cellSub}>min/km</Text></Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.cellLabel}>Active</Text>
            <Text style={styles.cellVal}>{cardio.todayActiveZoneMinutes} <Text style={styles.cellSub}>mins</Text></Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.cellLabel}>Calories</Text>
            <Text style={styles.cellVal}>{caloriesVal} <Text style={styles.cellSub}>kcal</Text></Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lilacScoreCard: {
    backgroundColor: '#EDE8F5',
    borderColor: 'rgba(94, 78, 138, 0.08)',
  },
  mintCard: {
    backgroundColor: '#D5E5DF',
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  moreIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIconText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '800',
  },
  barSection: {
    gap: 12,
  },
  barItem: {
    gap: 6,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  barPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dottedTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dottedFill: {
    height: '100%',
    borderRadius: 4,
  },
  mapBox: {
    height: 120,
    backgroundColor: '#E4EFEA',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.1)',
  },
  mapGridPattern: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mapRouteLine: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 40,
    height: 4,
    backgroundColor: '#2C4A3E',
    borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
  },
  mapGpsPin: {
    position: 'absolute',
    top: 30,
    right: 50,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(44, 74, 62, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2C4A3E',
  },
  mapBadge: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 9,
    fontWeight: '700',
    color: '#2C4A3E',
    letterSpacing: 0.5,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
    gap: 4,
  },
  distanceNum: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  distanceUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  statCell: {
    width: '47%',
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  cellVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cellSub: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
