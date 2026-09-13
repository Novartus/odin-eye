import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { TabKey } from '../../types/navigation';
export { TabKey } from '../../types/navigation';

interface FloatingTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  showAiTab?: boolean;
  showBodyAnalysisTab?: boolean;
}

interface TabItemConfig {
  key: TabKey;
  label: string;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  activeTab,
  onSelectTab,
  showAiTab = true,
  showBodyAnalysisTab = true,
}) => {
  const allTabs: TabItemConfig[] = [
    { key: 'home', label: 'Home' },
    { key: 'meds', label: 'Meds' },
    { key: 'overview', label: 'Vitals' },
    { key: 'body', label: 'Body' },
    { key: 'coach', label: 'AI' },
    { key: 'settings', label: 'Config' },
  ];

  const tabs = allTabs.filter(
    (t) => (showAiTab || t.key !== 'coach') && (showBodyAnalysisTab || t.key !== 'body')
  );

  const renderIcon = (key: TabKey, color: string, isActive: boolean) => {
    const size = 18;
    switch (key) {
      case 'home':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 10.5V20a1 1 0 001 1h5v-5a1 1 0 011-1h4a1 1 0 011 1v5h5a1 1 0 001-1v-9.5a1 1 0 00-.38-.78l-7-5.5a1 1 0 00-1.24 0l-7 5.5A1 1 0 003 10.5z"
              stroke={color}
              strokeWidth={isActive ? 2.4 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive ? 'rgba(255,255,255,0.15)' : 'none'}
            />
          </Svg>
        );
      case 'meds':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M10.5 13.5L4.5 7.5a4.24 4.24 0 016-6l6 6-6 6z"
              stroke={color}
              strokeWidth={isActive ? 2.4 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10.5 13.5l3-3M13.5 10.5l6 6a4.24 4.24 0 01-6 6l-6-6"
              stroke={color}
              strokeWidth={isActive ? 2.4 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'overview':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M22 12h-4l-3 9L9 3l-3 9H2"
              stroke={color}
              strokeWidth={isActive ? 2.5 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'body':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 5.5C7.2 4 9.5 3.5 12 3.5s4.8.5 6 2c1 1.2.9 2.8.2 4.2L17 12c-.5.9-.6 1.8-.5 2.7l.5 4.3c0 .8-.6 1.5-1.5 1.5H8.5c-.9 0-1.5-.7-1.5-1.5l.5-4.3c.1-.9 0-1.8-.5-2.7L5.8 9.7C5.1 8.3 5 6.7 6 5.5z"
              stroke={color}
              strokeWidth={isActive ? 2.3 : 1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M8.5 9.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8"
              stroke={color}
              strokeWidth={isActive ? 2 : 1.6}
              strokeLinecap="round"
            />
            <Path
              d="M12 11.3V16.5"
              stroke={color}
              strokeWidth={isActive ? 2 : 1.6}
              strokeLinecap="round"
            />
          </Svg>
        );
      case 'coach':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z"
              stroke={color}
              strokeWidth={isActive ? 2.4 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive ? 'rgba(255,255,255,0.2)' : 'none'}
            />
          </Svg>
        );
      case 'settings':
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"
              stroke={color}
              strokeWidth={isActive ? 2.4 : 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
    }
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View style={styles.capsule}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activePill]}
              activeOpacity={0.78}
              onPress={() => onSelectTab(tab.key)}
            >
              {renderIcon(tab.key, isActive ? '#FFFFFF' : '#6F7F78', isActive)}
              {isActive && (
                <Text style={styles.activeLabel}>{tab.label}</Text>
              )}
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
    zIndex: 99,
  },
  capsule: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 36,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 9,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.08)',
    alignItems: 'center',
    gap: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    paddingHorizontal: 11,
    borderRadius: 21,
    gap: 6,
  },
  activePill: {
    backgroundColor: '#181C1B',
    paddingHorizontal: 14,
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  activeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

