import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { TodayInsightCardProps } from '../../types';

export const TodayInsightCard: React.FC<TodayInsightCardProps> = ({ headline, body, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>Today's Insight</Text>
        <View style={styles.localBadge}>
          <Text style={styles.localBadgeText}>ON-DEVICE AI</Text>
        </View>
      </View>

      <Text style={styles.headlineText}>{headline}</Text>
      <Text style={styles.bodyText} numberOfLines={3}>
        {body}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={styles.actionPrompt}>Tap to consult AI Coach →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    backgroundColor: '#EDE8F5',
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#5E4E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(94, 78, 138, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#372B59',
    letterSpacing: 0.2,
  },
  localBadge: {
    backgroundColor: 'rgba(94, 78, 138, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  localBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5E4E8A',
    letterSpacing: 0.5,
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1A29',
    marginBottom: 4,
    lineHeight: 20,
  },
  bodyText: {
    fontSize: 12,
    color: '#524B6F',
    lineHeight: 18,
  },
  bottomRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(94, 78, 138, 0.12)',
  },
  actionPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#372B59',
  },
});

