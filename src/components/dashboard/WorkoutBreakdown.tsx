import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FitbitCardioData, HevyWorkoutSession } from '../../types/health';
import { Colors } from '../../theme/colors';
import { DeviceBadge } from '../common/DeviceBadge';

interface WorkoutBreakdownProps {
  cardio: FitbitCardioData;
  strengthWorkout?: HevyWorkoutSession;
}

export const WorkoutBreakdown: React.FC<WorkoutBreakdownProps> = ({ cardio, strengthWorkout }) => {
  const [activeTab, setActiveTab] = useState<'hevy' | 'fitbit'>('hevy');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TRAINING SESSIONS</Text>
          <Text style={styles.subtitle}>Musculoskeletal loading & cardio dynamics</Text>
        </View>

        {/* Minimal Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'hevy' && styles.tabActive]}
            onPress={() => setActiveTab('hevy')}
          >
            <Text style={[styles.tabText, activeTab === 'hevy' && styles.tabTextActive]}>Hevy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'fitbit' && styles.tabActive]}
            onPress={() => setActiveTab('fitbit')}
          >
            <Text style={[styles.tabText, activeTab === 'fitbit' && styles.tabTextActive]}>Fitbit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hevy Strength Content */}
      {activeTab === 'hevy' && (
        strengthWorkout ? (
          <View>
            <View style={styles.sessionMeta}>
              <View>
                <Text style={styles.sessionName}>{strengthWorkout.title}</Text>
                <Text style={styles.sessionTime}>
                  {strengthWorkout.durationMinutes} mins • {strengthWorkout.totalSets} sets • {strengthWorkout.totalReps} reps
                </Text>
              </View>
              <Text style={styles.volumeBig}>
                {(strengthWorkout.totalVolumeKg / 1000).toFixed(1)}t
              </Text>
            </View>

            {/* Exercise List */}
            <View style={styles.exerciseList}>
              {strengthWorkout.exercises.map((ex) => (
                <View key={ex.id} style={styles.exerciseRow}>
                  <View style={styles.exerciseLeft}>
                    <Text style={styles.exerciseName}>{ex.title}</Text>
                    <Text style={styles.setsSummary}>
                      {ex.sets.map((s) => `${s.weightKg}k×${s.reps}`).join('  •  ')}
                    </Text>
                  </View>
                  <Text style={styles.exVolume}>{ex.totalVolumeKg} kg</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptySessionBox}>
            <Text style={styles.emptyIcon}>🟢</Text>
            <Text style={styles.emptyTitle}>All Muscle Groups 100% Primed</Text>
            <Text style={styles.emptySub}>
              No workouts logged today (last session was 5+ days ago). Full 72-hour myofibrillar repair has completed.
            </Text>
          </View>
        )
      )}

      {/* Fitbit Cardio Content */}
      {activeTab === 'fitbit' && (
        cardio.recentWorkout ? (
          <View>
            <View style={styles.sessionMeta}>
              <View>
                <Text style={styles.sessionName}>{cardio.recentWorkout.title}</Text>
                <Text style={styles.sessionTime}>
                  {cardio.recentWorkout.durationMinutes} mins • {cardio.recentWorkout.distanceKm} km
                </Text>
              </View>
              <Text style={[styles.volumeBig, { color: Colors.cardio.text }]}>
                {cardio.recentWorkout.calories} kcal
              </Text>
            </View>

            {/* Heart Rate Zones */}
            <View style={styles.zonesBox}>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneName}>Peak (&gt;160 bpm)</Text>
                <Text style={styles.zoneVal}>{cardio.zoneSummary.peakMinutes}m</Text>
              </View>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneName}>Cardio (135-159 bpm)</Text>
                <Text style={styles.zoneVal}>{cardio.zoneSummary.cardioMinutes}m</Text>
              </View>
              <View style={styles.zoneItem}>
                <Text style={styles.zoneName}>Fat Burn (100-134 bpm)</Text>
                <Text style={styles.zoneVal}>{cardio.zoneSummary.fatBurnMinutes}m</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptySessionBox}>
            <Text style={styles.emptyIcon}>⌚</Text>
            <Text style={styles.emptyTitle}>Fitbit Inactive (5+ Days)</Text>
            <Text style={styles.emptySub}>
              No workouts logged today. Heart rate telemetry is actively fed by Ultrahuman Ring AIR and Android Health Connect.
            </Text>
          </View>
        )
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.textPrimary,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sessionTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  volumeBig: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.strength.text,
  },
  exerciseList: {
    gap: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 10,
    padding: 10,
  },
  exerciseLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  setsSummary: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  exVolume: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  zonesBox: {
    gap: 8,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardSecondary,
    borderRadius: 8,
    padding: 10,
  },
  zoneName: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  zoneVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySessionBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: Colors.cardSecondary,
    borderRadius: 14,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
