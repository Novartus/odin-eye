import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { healthConnect, isNativeHealthConnectLinked } from '../../services/healthConnect/healthConnectService';

interface HealthConnectPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onConnected?: () => void;
  onNavigateToSettings?: () => void;
}

export const HealthConnectPromptModal: React.FC<HealthConnectPromptModalProps> = ({
  visible,
  onClose,
  onConnected,
  onNavigateToSettings,
}) => {
  const isNativeLinked = isNativeHealthConnectLinked();
  const [isRequesting, setIsRequesting] = useState(false);
  const [success, setSuccess] = useState(false);

  const permissionsList = [
    {
      id: 'sleep',
      title: 'Sleep Sessions & Hypnogram',
      desc: 'Sleep duration, Deep, REM, Light, and Awake stage records',
      icon: '🌙',
      tag: 'READ-ONLY',
    },
    {
      id: 'heartRate',
      title: 'Heart Rate & Resting Pulse',
      desc: 'Continuous pulse telemetry & overnight resting baseline',
      icon: '🫀',
      tag: 'READ-ONLY',
    },
    {
      id: 'hrv',
      title: 'Heart Rate Variability (HRV)',
      desc: 'RMSSD autonomic nervous system recovery status',
      icon: '⚡',
      tag: 'READ-ONLY',
    },
    {
      id: 'steps',
      title: 'Steps & Daily Motion',
      desc: 'Daily steps, walking cadence, and pedometer records',
      icon: '👟',
      tag: 'READ-ONLY',
    },
    {
      id: 'calories',
      title: 'Energy Expenditure & Calories',
      desc: 'Active burn and basal metabolic rate calories',
      icon: '🔥',
      tag: 'READ-ONLY',
    },
    {
      id: 'distance',
      title: 'Distance & Workouts',
      desc: 'GPS distance and exercise session logs',
      icon: '📍',
      tag: 'READ-ONLY',
    },
    {
      id: 'vitals',
      title: 'Skin Temperature & Vitals',
      desc: 'Nocturnal body temperature deviations from baseline',
      icon: '🌡️',
      tag: 'READ-ONLY',
    },
  ];

  const handleAllowAll = async () => {
    setIsRequesting(true);
    try {
      await healthConnect.requestAllReadPermissions();
      setSuccess(true);
      setTimeout(() => {
        setIsRequesting(false);
        setSuccess(false);
        if (onConnected) {
          onConnected();
        }
        onClose();
      }, 1000);
    } catch {
      setIsRequesting(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Handle Bar */}
          <View style={styles.topHandleBar} />

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              {/* Multi-Color Health Connect Hub Icon */}
              <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <Circle
                  cx="22"
                  cy="22"
                  r="21"
                  fill={isNativeLinked ? '#F0FDF4' : '#FEF3C7'}
                  stroke={isNativeLinked ? '#86EFAC' : '#FCD34D'}
                  strokeWidth="1.5"
                />
                <Path
                  d="M22 30.5c-6.5-4.2-10-8.5-10-12.5a5.5 5.5 0 0 1 9.5-3.6l.5.6.5-.6a5.5 5.5 0 0 1 9.5 3.6c0 4-3.5 8.3-10 12.5z"
                  fill={isNativeLinked ? '#007AFF' : '#D97706'}
                  fillOpacity="0.15"
                />
                <Path
                  d="M22 30.5c-6.5-4.2-10-8.5-10-12.5a5.5 5.5 0 0 1 9.5-3.6l.5.6.5-.6a5.5 5.5 0 0 1 9.5 3.6c0 4-3.5 8.3-10 12.5z"
                  stroke={isNativeLinked ? '#007AFF' : '#D97706'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M17 21h2.5l1.5-3.5 2 7 1.5-3.5h2.5"
                  stroke={isNativeLinked ? '#10B981' : '#B45309'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <View style={styles.headerText}>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.systemBadge,
                    !isNativeLinked && { backgroundColor: '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.systemBadgeText,
                      !isNativeLinked && { color: '#B45309' },
                    ]}
                  >
                    {isNativeLinked ? 'ANDROID HEALTH CONNECT' : 'EXPO GO RUNTIME'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.readOnlyBadge,
                    !isNativeLinked && { backgroundColor: '#F1F5F9' },
                  ]}
                >
                  <Text
                    style={[
                      styles.readOnlyBadgeText,
                      !isNativeLinked && { color: '#475569' },
                    ]}
                  >
                    {isNativeLinked ? '🔒 100% READ-ONLY' : 'NATIVE BUILD REQUIRED'}
                  </Text>
                </View>
              </View>
              <Text style={styles.title}>
                {isNativeLinked ? 'Connect Health Connect' : 'Health Connect & Live Telemetry'}
              </Text>
              <Text style={styles.subtitle}>
                {isNativeLinked
                  ? 'Auto-sync sleep & biometrics directly without an Ultrahuman API key'
                  : 'Why Odin isn\'t in Health Connect settings & how to pull real data'}
              </Text>
            </View>
          </View>

          {!isNativeLinked ? (
            /* EXPO GO ENVIRONMENT GUIDANCE */
            <>
              <ScrollView
                style={styles.permissionsScroll}
                contentContainerStyle={styles.permissionsContent}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Technical Explanation: OS Sandbox */}
                <View style={styles.guideCard}>
                  <View style={styles.guideCardHeader}>
                    <Text style={{ fontSize: 16 }}>🔒</Text>
                    <Text style={styles.guideCardTitle}>
                      Why Odin doesn't appear in "App permissions"
                    </Text>
                  </View>
                  <Text style={styles.guideCardBody}>
                    Android Health Connect is an OS-level permission system. Android strictly inspects installed standalone APK packages (<Text style={styles.codeHighlight}>com.odineye.health</Text>). In Expo Go, the running package is the Expo client (<Text style={styles.codeHighlight}>host.exp.exponent</Text>), so Android will not list Odin in the Health Connect OS permissions list.
                  </Text>
                </View>

                {/* 2. Instant Live Sync Option */}
                <View style={[styles.guideCard, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <View style={styles.guideCardHeader}>
                    <Text style={{ fontSize: 16 }}>⚡</Text>
                    <Text style={[styles.guideCardTitle, { color: '#166534' }]}>
                      Option 1: Instant Live Sync (In Expo Go)
                    </Text>
                  </View>
                  <Text style={[styles.guideCardBody, { color: '#14532D' }]}>
                    No native build required! Enter your <Text style={{ fontWeight: '700' }}>Ultrahuman Personal Token</Text> in Settings below. Odin immediately pulls your live sleep hypnograms, resting pulse, HRV, and recovery index via direct secure HTTPS.
                  </Text>
                </View>

                {/* 3. Standalone APK Option */}
                <View style={styles.guideCard}>
                  <View style={styles.guideCardHeader}>
                    <Text style={{ fontSize: 16 }}>📱</Text>
                    <Text style={styles.guideCardTitle}>
                      Option 2: Standalone Native Android Build
                    </Text>
                  </View>
                  <Text style={styles.guideCardBody}>
                    To use pure Android Health Connect without any cloud token, compile the native APK by running <Text style={styles.codeHighlight}>npx expo run:android</Text>. This builds Odin as a native package (<Text style={styles.codeHighlight}>com.odineye.health</Text>) and registers it directly with Android Health Connect.
                  </Text>
                </View>
              </ScrollView>

              {/* Action Buttons for Expo Go */}
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    onClose();
                    if (onNavigateToSettings) onNavigateToSettings();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    Enter Ultrahuman Token in Settings ⚙️
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.openSettingsLink}
                  onPress={() => healthConnect.openHealthConnectSettings()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.openSettingsLinkText}>
                    Open Android Health Connect Settings ↗
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* NATIVE BUILD: LIVE HEALTH CONNECT PERMISSIONS LIST */
            <>
              {/* Value Proposition Box */}
              <View style={styles.valuePropCard}>
                <Text style={styles.valuePropTitle}>💡 Direct On-Device Reading</Text>
                <Text style={styles.valuePropBody}>
                  Ultrahuman Ring AIR continuously syncs your sleep sessions, stages, and pulse into
                  Android Health Connect. By granting Read-Only access, OdinEye automatically picks up
                  your telemetry without needing any manual cloud tokens.
                </Text>
              </View>

              {/* Permissions Scroll List */}
              <Text style={styles.sectionHeader}>DATA TO READ (NO WRITE ACCESS):</Text>
              <ScrollView
                style={styles.permissionsScroll}
                contentContainerStyle={styles.permissionsContent}
                showsVerticalScrollIndicator={false}
              >
                {permissionsList.map((perm) => (
                  <View key={perm.id} style={styles.permRow}>
                    <View style={styles.permIconCircle}>
                      <Text style={styles.permEmoji}>{perm.icon}</Text>
                    </View>
                    <View style={styles.permTextGroup}>
                      <View style={styles.permTitleRow}>
                        <Text style={styles.permTitle}>{perm.title}</Text>
                        <View style={styles.readOnlyPill}>
                          <Text style={styles.readOnlyPillText}>{perm.tag}</Text>
                        </View>
                      </View>
                      <Text style={styles.permDesc}>{perm.desc}</Text>
                    </View>
                    <View style={styles.checkCircle}>
                      <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17l-5-5"
                          stroke="#10B981"
                          strokeWidth="2.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Privacy Guarantee Note */}
              <View style={styles.privacyNoteRow}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={styles.privacyNoteText}>
                  Your health telemetry stays private and is processed on-device. OdinEye cannot alter your records.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    isRequesting && styles.primaryBtnDisabled,
                    success && styles.primaryBtnSuccess,
                  ]}
                  onPress={handleAllowAll}
                  disabled={isRequesting}
                  activeOpacity={0.85}
                >
                  {isRequesting ? (
                    <View style={styles.btnContentRow}>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.primaryBtnText}>
                        {success ? 'Validated & Connected ✓' : 'Connecting to Health Connect...'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      Allow Read-Only Access to All
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.openSettingsLink}
                  onPress={() => healthConnect.openHealthConnectSettings()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.openSettingsLinkText}>
                    Open Android Health Connect Settings ↗
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isRequesting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Later</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  topHandleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  systemBadge: {
    backgroundColor: '#EBF6FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  systemBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.4,
  },
  readOnlyBadge: {
    backgroundColor: '#E8F9F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readOnlyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  valuePropCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  valuePropTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  valuePropBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  permissionsScroll: {
    maxHeight: 220,
  },
  permissionsContent: {
    paddingBottom: 8,
    gap: 8,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  permIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  permEmoji: {
    fontSize: 18,
  },
  permTextGroup: {
    flex: 1,
  },
  permTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  permTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  readOnlyPill: {
    backgroundColor: '#E8F9F1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  readOnlyPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  permDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 14,
  },
  privacyNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#15803D',
    lineHeight: 15,
    fontWeight: '500',
  },
  guideCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  guideCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  guideCardBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  codeHighlight: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#0F172A',
  },
  openSettingsLink: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  openSettingsLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  buttonGroup: {
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  primaryBtnSuccess: {
    backgroundColor: '#10B981',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cancelBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
