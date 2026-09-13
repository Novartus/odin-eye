// Today's Mindfulness & Zen Quick Card for Home Dashboard
// Seamless integration into the main home feed

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { mindfulnessService, MindfulnessWeeklyStats } from '../../services/mindfulness/mindfulnessService';
import { credentialsStorage } from '../../services/storage/credentialsStorage';

interface TodayZenCardProps {
  onOpenZen: () => void;
  onQuickStartBreath?: () => void;
}

export const TodayZenCard: React.FC<TodayZenCardProps> = ({ onOpenZen, onQuickStartBreath }) => {
  const [stats, setStats] = useState<MindfulnessWeeklyStats>(mindfulnessService.getWeeklyStats());
  const [dailyGoal, setDailyGoal] = useState<number>(10);

  useEffect(() => {
    mindfulnessService.loadLogs().then(() => {
      setStats(mindfulnessService.getWeeklyStats());
    });
    credentialsStorage.loadCredentials().then((creds) => {
      if (creds.dailyMindfulnessGoal) {
        setDailyGoal(creds.dailyMindfulnessGoal);
      }
    });
    const unsubscribe = mindfulnessService.subscribe((newStats) => {
      setStats(newStats);
    });
    return unsubscribe;
  }, []);

  const todayKey = mindfulnessService.getTodayKey();
  const isTodayCompleted = stats.completedDates.includes(todayKey);

  // 7-day mini streak indicators (Mon - Sun)
  const weekDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const currentDay = today.getDay();
  const distanceToMonday = (currentDay + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  const miniDays = weekDayLabels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      label,
      dateKey: key,
      isToday: key === todayKey,
      isCompleted: stats.completedDates.includes(key),
    };
  });

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            {/* Bespoke Lotus Zen Icon */}
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 22V13" stroke="#1F382E" strokeWidth="2" strokeLinecap="round" />
              <Path
                d="M12 13C12 13 7 11 5 7c2 0 5 1 7 6z"
                stroke="#1F382E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(31, 56, 46, 0.15)"
              />
              <Path
                d="M12 13C12 13 17 11 19 7c-2 0-5 1-7 6z"
                stroke="#1F382E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(31, 56, 46, 0.15)"
              />
              <Path
                d="M12 13C12 13 9.5 8.5 12 4.5c2.5 4 0 8.5 0 8.5z"
                stroke="#1F382E"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(31, 56, 46, 0.25)"
              />
            </Svg>
          </View>
          <View style={styles.titleCol}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>Mindfulness</Text>
              {stats.currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeText}>🔥 {stats.currentStreak}d</Text>
                </View>
              )}
            </View>
            <Text style={styles.subtitle} numberOfLines={1}>
              {isTodayCompleted
                ? 'Daily target reached 🌿'
                : `Target: ${dailyGoal}m · Daily breath reset`}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.openBtn} onPress={onOpenZen} activeOpacity={0.7}>
          <Text style={styles.openBtnText}>Open</Text>
          <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="#1F382E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* 7-Day Mini Calendar Strip */}
      <View style={styles.miniCalendarRow}>
        {miniDays.map((d) => (
          <View
            key={d.dateKey}
            style={[
              styles.miniDayPill,
              d.isToday && styles.miniDayPillToday,
              d.isCompleted && styles.miniDayPillCompleted,
            ]}
          >
            <Text
              style={[
                styles.miniDayLabel,
                d.isToday && styles.miniDayLabelToday,
                d.isCompleted && styles.miniDayLabelCompleted,
              ]}
            >
              {d.label}
            </Text>
            {d.isCompleted ? (
              <View style={styles.miniCompletedDot} />
            ) : (
              <View style={styles.miniEmptyDot} />
            )}
          </View>
        ))}
      </View>

      {/* Quick Start Action Strip */}
      <TouchableOpacity
        style={styles.quickStartBtn}
        onPress={onQuickStartBreath || onOpenZen}
        activeOpacity={0.82}
      >
        <View style={styles.quickStartLeft}>
          <View style={styles.breathWaveBubble}>
            <Text style={{ fontSize: 13 }}>🌬️</Text>
          </View>
          <View>
            <Text style={styles.quickStartTitle}>2-Min Box Breathing Reset</Text>
            <Text style={styles.quickStartSubtitle}>4s Inhale · 4s Hold · 4s Exhale</Text>
          </View>
        </View>

        <View style={styles.startBadgePill}>
          <Text style={styles.startBadgeText}>Start Now</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.05)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  titleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.1)',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141816',
  },
  subtitle: {
    fontSize: 11,
    color: '#63706B',
    fontWeight: '600',
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexShrink: 0,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F382E',
  },
  miniCalendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFA',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  miniDayPill: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
    minWidth: 28,
  },
  miniDayPillToday: {
    backgroundColor: '#EAF2EE',
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.2)',
  },
  miniDayPillCompleted: {
    backgroundColor: '#CCE6DE',
  },
  miniDayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A9992',
  },
  miniDayLabelToday: {
    color: '#1F382E',
    fontWeight: '800',
  },
  miniDayLabelCompleted: {
    color: '#1F382E',
    fontWeight: '800',
  },
  miniCompletedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginTop: 3,
  },
  miniEmptyDot: {
    width: 4,
    height: 4,
    marginTop: 3,
  },
  quickStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF2EE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
  },
  quickStartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  breathWaveBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F382E',
  },
  quickStartSubtitle: {
    fontSize: 10,
    color: '#2C4A3E',
    fontWeight: '600',
    marginTop: 1,
  },
  startBadgePill: {
    backgroundColor: '#1F382E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  startBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
