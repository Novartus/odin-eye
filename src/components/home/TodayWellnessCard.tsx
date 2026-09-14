import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { TodayWellnessCardProps } from '../../types';

export const TodayWellnessCard: React.FC<TodayWellnessCardProps> = React.memo(({
  score = 0,
  sleepQualityPct = 0,
  activeZoneMinutes = 0,
  tonnageKg = 0,
  onPress,
}) => {
  const isZero = score === 0 && sleepQualityPct === 0 && activeZoneMinutes === 0 && tonnageKg === 0;
  const scoreLabel = isZero
    ? 'Awaiting Telemetry'
    : score >= 80
    ? 'Optimal Recovery'
    : score >= 60
    ? 'Moderate Recovery'
    : score > 0
    ? 'Prioritize Rest'
    : 'No Data';
  const tonnageText = tonnageKg > 0 ? `${(tonnageKg / 1000).toFixed(1)}t` : '0.0t';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
    >
      {/* Top Content Row with Starry Sky & Luminous Golden Moon */}
      <View style={styles.topRow}>
        <View style={styles.textCol}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>REST & RECOVERY</Text>
          </View>
          <Text style={styles.headline}>Meditation & Good Sleep</Text>
          <Text style={styles.subtext}>
            {isZero
              ? 'Connect wearable to track nocturnal restorative sleep stages.'
              : `${scoreLabel} • ${score > 0 ? `${score}% daily equilibrium` : 'Ready for rest'}`}
          </Text>
        </View>

        {/* Luminous Golden Crescent Moon & Starry Night Illustration */}
        <View style={styles.illustrationWrap}>
          <Svg width="88" height="88" viewBox="0 0 100 100" fill="none">
            {/* Twinkling Stars */}
            <Path d="M22 24L24 19L29 21L24 23L22 28L20 23L15 21L20 19Z" fill="#FFFFFF" opacity="0.95" />
            <Path d="M78 16L79.5 12L83.5 13.5L79.5 15L78 19L76.5 15L72.5 13.5L76.5 12Z" fill="#FFFFFF" opacity="0.8" />
            <Path d="M85 52L86 49L89 50L86 51L85 54L84 51L81 50L84 49Z" fill="#FFFFFF" opacity="0.65" />
            {/* Radiant Golden Crescent Moon */}
            <Path
              d="M58 18 C41 18 28 32 28 50 C28 68 41 82 58 82 C68 82 77 77 82 69 C67 69 55 58 55 43 C55 32 62 23 72 19 C68 18 63 18 58 18 Z"
              fill="#FFC42B"
            />
            {/* Stylized Midnight Clouds */}
            <Path
              d="M14 74 C14 69 18 65 23 65 C24 65 25 65 26 65 C28 60 33 57 38 57 C44 57 49 61 50 67 C52 67 53 67 54 68 C57 68 60 71 60 74 C60 78 57 81 53 81 L21 81 C17 81 14 78 14 74 Z"
              fill="#2E373E"
              opacity="0.9"
            />
          </Svg>
        </View>
      </View>

      {/* Bottom Stats Strip & Circular Action Arrow Button */}
      <View style={styles.statsStrip}>
        <View style={[styles.statChip, { backgroundColor: 'rgba(221, 217, 245, 0.12)' }]}>
          <Text style={styles.statLabel}>Sleep Index</Text>
          <Text style={styles.statVal}>{sleepQualityPct > 0 ? `${sleepQualityPct}%` : '—'}</Text>
        </View>

        <View style={[styles.statChip, { backgroundColor: 'rgba(252, 231, 220, 0.12)' }]}>
          <Text style={styles.statLabel}>Cardio Strain</Text>
          <Text style={styles.statVal}>{activeZoneMinutes > 0 ? `${activeZoneMinutes}m` : '0m'}</Text>
        </View>

        <View style={[styles.statChip, { backgroundColor: 'rgba(204, 230, 222, 0.12)' }]}>
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statVal}>{tonnageText}</Text>
        </View>

        {/* Diagonal Arrow Action Button (Screen 3 Signature) */}
        <View style={styles.arrowCircle}>
          <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <Path
              d="M7 17L17 7M17 7H8M17 7V16"
              stroke="#181C1B"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    backgroundColor: '#1E2327',
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#2C3339',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  textCol: {
    flex: 1,
    paddingRight: 10,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 196, 43, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
    marginBottom: 8,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFC42B',
    letterSpacing: 0.6,
  },
  headline: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtext: {
    fontSize: 12,
    color: '#9EADA7',
    marginTop: 4,
    lineHeight: 17,
  },
  illustrationWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 3,
  },
});
