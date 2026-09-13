import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';

export type TabKey = 'home' | 'meds' | 'overview' | 'body' | 'coach' | 'settings';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  showAiTab?: boolean;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  activeTab,
  onSelectTab,
  showAiTab = true,
}) => {
  const allTabs: { key: TabKey; icon: string; label: string }[] = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'meds', icon: '💊', label: 'Meds' },
    { key: 'overview', icon: '🏃', label: 'Overview' },
    { key: 'body', icon: '👤', label: 'Body' },
    { key: 'coach', icon: '🧠', label: 'AI' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const tabs = showAiTab ? allTabs : allTabs.filter((t) => t.key !== 'coach');

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.capsule}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activePill]}
              activeOpacity={0.7}
              onPress={() => onSelectTab(tab.key)}
            >
              <Text style={[styles.iconText, isActive && styles.activeIconText]}>
                {tab.icon}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 22,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  capsule: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 36,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#1A1D1C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E8EDEA',
    gap: 6,
    alignItems: 'center',
  },
  tabButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    backgroundColor: '#1A1D1C',
    shadowColor: '#1A1D1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontSize: 18,
    opacity: 0.5,
  },
  activeIconText: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
});

