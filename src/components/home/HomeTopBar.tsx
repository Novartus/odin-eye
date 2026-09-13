import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface HomeTopBarProps {
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncText: string;
}

export const HomeTopBar: React.FC<HomeTopBarProps> = ({
  onOpenSettings,
  onOpenNotifications,
  onManualSync,
  isSyncing,
  lastSyncText,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [isSyncing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            {/* Clean Vector User Silhouette */}
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                stroke={Colors.accentBlue}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                stroke={Colors.accentBlue}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <View style={styles.onlineBadge} />
        </View>
        <View>
          <Text style={styles.greeting}>Hello There!</Text>
          <Text style={styles.deviceStatus}>{lastSyncText}</Text>
        </View>
      </View>

      {/* Header Actions (Sleek Circular Glass Buttons) */}
      <View style={styles.actionsRow}>
        {/* Vector Sync Button */}
        <TouchableOpacity
          style={[styles.circleButton, isSyncing && styles.syncActiveButton]}
          activeOpacity={0.7}
          onPress={onManualSync}
          disabled={isSyncing}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                stroke={isSyncing ? '#007AFF' : '#0F172A'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M21 3v5h-5"
                stroke={isSyncing ? '#007AFF' : '#0F172A'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                stroke={isSyncing ? '#007AFF' : '#0F172A'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M8 16H3v5"
                stroke={isSyncing ? '#007AFF' : '#0F172A'}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </TouchableOpacity>

        {/* Notifications Center Bell Button */}
        <TouchableOpacity
          style={styles.circleButton}
          activeOpacity={0.7}
          onPress={onOpenNotifications || onOpenSettings}
        >
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <View style={styles.notificationDot} />
        </TouchableOpacity>

        {/* Settings & Devices Gear Button */}
        <TouchableOpacity
          style={styles.circleButton}
          activeOpacity={0.7}
          onPress={onOpenSettings}
        >
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#CCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1F382E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.3,
  },
  deviceStatus: {
    fontSize: 11,
    color: '#63706B',
    fontWeight: '600',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    position: 'relative',
  },
  syncActiveButton: {
    backgroundColor: '#E3F1EC',
    borderColor: '#CCE6DE',
  },
  notificationDot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E11D48',
  },
});
