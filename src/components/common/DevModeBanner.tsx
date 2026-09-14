/**
 * DevModeBanner
 *
 * Shown ONLY when:
 *   1. The app is running in __DEV__ (Expo Go / Metro bundler) mode, AND
 *   2. The native react-native-health-connect module is NOT linked
 *      (i.e. not a standalone native build).
 *
 * Hides permanently once the user dismisses it via AsyncStorage flag.
 * Displays a collapsible step-by-step guide for building a standalone
 * APK and sideloading it onto an Android device.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { isNativeHealthConnectLinked } from '../../services/healthConnect/healthConnectService';
import type { DevModeStep } from '../../types';

const DISMISSED_KEY = 'dev_banner_dismissed_v1';

const BUILD_STEPS: DevModeStep[] = [
  {
    num: '1',
    title: 'Install EAS CLI (once)',
    cmd: 'npm install -g eas-cli',
    note: 'The official Expo build tool.',
  },
  {
    num: '2',
    title: 'Log in to Expo account',
    cmd: 'eas login',
    note: 'Free account at expo.dev. Skip if already logged in.',
  },
  {
    num: '3',
    title: 'Configure your project for EAS',
    cmd: 'eas build:configure',
    note: 'Runs once. Generates eas.json with build profiles.',
  },
  {
    num: '4',
    title: 'Create a local development APK',
    cmd: 'eas build --platform android --profile development --local',
    note: 'Builds a .apk on your machine (needs Android SDK) — or remove --local to build on Expo cloud (free tier).',
  },
  {
    num: '4b',
    title: 'Alternative: pure React Native build',
    cmd: 'npx expo run:android',
    note: 'Faster for local iteration. Requires Android Studio + USB debugging on your phone.',
  },
  {
    num: '5',
    title: 'Install the APK on your phone',
    cmd: 'adb install path/to/build.apk',
    note: 'Enable "Install from unknown sources" on your phone first, or use USB file transfer to copy then tap the APK to install.',
  },
  {
    num: '6',
    title: 'Open Health Connect on your phone',
    note: 'Go to Android Settings → Apps → Health Connect → App permissions. You will now see "Odin" listed and can grant read permissions.',
  },
];

export const DevModeBanner: React.FC<{ onNavigateToSettings?: () => void }> = ({
  onNavigateToSettings,
}) => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Only show in dev mode when native module is not linked
    if (!__DEV__ || isNativeHealthConnectLinked()) return;

    SecureStore.getItemAsync(DISMISSED_KEY).then((val) => {
      if (val !== 'true') {
        setVisible(true);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    }).catch(() => {
      // SecureStore may not be available on iOS simulator in Expo Go; show anyway
      setVisible(true);
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    });
  }, []);

  const handleDismiss = async () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
    try {
      await SecureStore.setItemAsync(DISMISSED_KEY, 'true');
    } catch {}
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrapper, { opacity }]}>
      {/* ── Header row ── */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={styles.devBadge}>
            <Text style={styles.devBadgeText}>DEV MODE</Text>
          </View>
          <Text style={styles.headerTitle}>Running in Expo Go</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
          <TouchableOpacity
            style={styles.dismissBtn}
            onPress={handleDismiss}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ── Collapsed summary ── */}
      {!expanded && (
        <Text style={styles.collapsedSub}>
          Health Connect & native sensors require a standalone build.{' '}
          <Text style={styles.tapToExpand}>Tap to see how →</Text>
        </Text>
      )}

      {/* ── Expanded build guide ── */}
      {expanded && (
        <ScrollView
          style={styles.stepsScroll}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {/* Quick path callout */}
          <View style={styles.quickPathCard}>
            <Text style={styles.quickPathTitle}>⚡ Quickest path right now</Text>
            <Text style={styles.quickPathBody}>
              Enter your <Text style={styles.bold}>Ultrahuman Personal Token</Text> in Settings
              to get live sleep, HR, HRV & recovery data instantly — no build needed.
            </Text>
            {onNavigateToSettings && (
              <TouchableOpacity style={styles.settingsBtn} onPress={onNavigateToSettings}>
                <Text style={styles.settingsBtnText}>Open Settings ⚙️</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.orDivider}>── OR build a native APK ──</Text>

          {BUILD_STEPS.map((step) => (
            <View key={step.num} style={styles.stepCard}>
              <View style={styles.stepNumBubble}>
                <Text style={styles.stepNum}>{step.num}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                {step.cmd && (
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText}>{step.cmd}</Text>
                  </View>
                )}
                {step.note && (
                  <Text style={styles.stepNote}>{step.note}</Text>
                )}
              </View>
            </View>
          ))}

          {/* Final note */}
          <View style={styles.finalNote}>
            <Text style={styles.finalNoteText}>
              📱 After installing the native build, Health Connect will show{' '}
              <Text style={styles.bold}>Odin</Text> under Android Settings → Health Connect →
              App permissions. Tap &quot;Allow&quot; and all biometrics pull automatically,
              zero tokens required.
            </Text>
          </View>

          <TouchableOpacity style={styles.dismissFullBtn} onPress={handleDismiss}>
            <Text style={styles.dismissFullBtnText}>Got it — Don&apos;t show again</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  devBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  devBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevron: {
    fontSize: 10,
    color: '#94A3B8',
  },
  dismissBtn: {
    padding: 2,
  },
  dismissText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  collapsedSub: {
    fontSize: 12,
    color: '#94A3B8',
    paddingHorizontal: 14,
    paddingBottom: 12,
    lineHeight: 17,
  },
  tapToExpand: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  stepsScroll: {
    maxHeight: 480,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  quickPathCard: {
    backgroundColor: '#052E16',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#166534',
    marginTop: 4,
    marginBottom: 12,
  },
  quickPathTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4ADE80',
    marginBottom: 5,
  },
  quickPathBody: {
    fontSize: 12,
    color: '#86EFAC',
    lineHeight: 17,
  },
  bold: {
    fontWeight: '700',
  },
  settingsBtn: {
    marginTop: 10,
    backgroundColor: '#10B981',
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },
  settingsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  orDivider: {
    fontSize: 10,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  stepNumBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  codeBlock: {
    backgroundColor: '#1E293B',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 4,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    color: '#7DD3FC',
    lineHeight: 16,
  },
  stepNote: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  finalNote: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  finalNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  dismissFullBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dismissFullBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});
