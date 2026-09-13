import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface DeviceBadgeProps {
  source: 'ultrahuman' | 'fitbit' | 'hevy' | 'ai' | 'health_connect';
  label?: string;
}

export const DeviceBadge: React.FC<DeviceBadgeProps> = ({ source, label }) => {
  let dotColor = Colors.recovery.main;
  let defaultLabel = 'Ring AIR';

  switch (source) {
    case 'fitbit':
      dotColor = Colors.cardio.main;
      defaultLabel = 'Fitbit';
      break;
    case 'hevy':
      dotColor = Colors.strength.main;
      defaultLabel = 'Hevy';
      break;
    case 'ai':
      dotColor = Colors.ai.main;
      defaultLabel = 'Local AI';
      break;
    case 'health_connect':
      dotColor = '#3B82F6';
      defaultLabel = 'Health Connect';
      break;
  }

  const text = label || defaultLabel;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
