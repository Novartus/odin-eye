import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { SmartRingIcon } from '../common/SmartRingIcon';

export interface EnabledSources {
  ultrahuman: boolean;
  fitbit: boolean;
  hevy: boolean;
}

interface DeviceSourcesModalProps {
  visible: boolean;
  onClose: () => void;
  enabledSources: EnabledSources;
  onToggleSource: (sourceKey: keyof EnabledSources, value: boolean) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncText: string;
}

export const DeviceSourcesModal: React.FC<DeviceSourcesModalProps> = ({
  visible,
  onClose,
  enabledSources,
  onToggleSource,
  onManualSync,
  isSyncing,
  lastSyncText,
}) => {
  const [hevyApiKey, setHevyApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveApiKey = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Device Settings & Sync</Text>
              <Text style={styles.modalSubtitle}>Manage data visibility and connected hardware</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke={Colors.textSecondary}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Primary Manual Sync Button */}
            <View style={styles.syncCard}>
              <View style={styles.syncInfo}>
                <Text style={styles.syncStatusTitle}>Android Health Connect Hub</Text>
                <Text style={styles.syncStatusSub}>{lastSyncText}</Text>
              </View>
              <TouchableOpacity
                style={[styles.syncNowBtn, isSyncing && styles.syncNowBtnActive]}
                onPress={onManualSync}
                disabled={isSyncing}
                activeOpacity={0.75}
              >
                {isSyncing ? (
                  <View style={styles.syncBtnInner}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.syncNowBtnText}>Syncing...</Text>
                  </View>
                ) : (
                  <View style={styles.syncBtnInner}>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M21 3v5h-5"
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <Path
                        d="M8 16H3v5"
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={styles.syncNowBtnText}>Sync Now</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Toggle Which Devices Show Data */}
            <Text style={styles.sectionHeader}>DATA SOURCE VISIBILITY</Text>
            <Text style={styles.sectionSub}>Choose which wearables feed into your central dashboard</Text>

            {/* 1. Ultrahuman Ring AIR Toggle */}
            <View style={styles.sourceToggleCard}>
              <View style={styles.sourceLeft}>
                <View style={[styles.deviceIconBubble, { backgroundColor: '#E0F7FA' }]}>
                  <SmartRingIcon size={20} color="#10B981" accentColor="#059669" />
                </View>
                <View style={styles.deviceDetails}>
                  <View style={styles.deviceTitleRow}>
                    <Text style={styles.deviceName}>Ultrahuman Ring AIR</Text>
                    <View style={[styles.statusDot, { backgroundColor: enabledSources.ultrahuman ? '#10B981' : '#94A3B8' }]} />
                  </View>
                  <Text style={styles.deviceFeeds}>Feeds: Sleep Architecture, Nightly HRV, Skin Temp</Text>
                  <Text style={styles.deviceBattery}>Battery: 82% • Raw Titanium (Size 10)</Text>
                </View>
              </View>
              <Switch
                value={enabledSources.ultrahuman}
                onValueChange={(val) => onToggleSource('ultrahuman', val)}
                trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
                thumbColor={enabledSources.ultrahuman ? '#007AFF' : '#CBD5E1'}
              />
            </View>

            {/* 2. Google Fitbit Toggle */}
            <View style={styles.sourceToggleCard}>
              <View style={styles.sourceLeft}>
                <View style={[styles.deviceIconBubble, { backgroundColor: '#FFF3EB' }]}>
                  <Text style={styles.deviceEmoji}>⌚</Text>
                </View>
                <View style={styles.deviceDetails}>
                  <View style={styles.deviceTitleRow}>
                    <Text style={styles.deviceName}>Google Fitbit Tracker</Text>
                    <View style={[styles.statusDot, { backgroundColor: enabledSources.fitbit ? '#10B981' : '#94A3B8' }]} />
                  </View>
                  <Text style={styles.deviceFeeds}>Feeds: Workout Sessions, HR Zones, Active Calories</Text>
                  <Text style={styles.deviceBattery}>Battery: 68% • Workout Edition</Text>
                </View>
              </View>
              <Switch
                value={enabledSources.fitbit}
                onValueChange={(val) => onToggleSource('fitbit', val)}
                trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
                thumbColor={enabledSources.fitbit ? '#007AFF' : '#CBD5E1'}
              />
            </View>

            {/* 3. Hevy App Toggle */}
            <View style={styles.sourceToggleCard}>
              <View style={styles.sourceLeft}>
                <View style={[styles.deviceIconBubble, { backgroundColor: '#F5F3FF' }]}>
                  <Text style={styles.deviceEmoji}>🏋️</Text>
                </View>
                <View style={styles.deviceDetails}>
                  <View style={styles.deviceTitleRow}>
                    <Text style={styles.deviceName}>Hevy Strength Log</Text>
                    <View style={[styles.statusDot, { backgroundColor: enabledSources.hevy ? '#10B981' : '#94A3B8' }]} />
                  </View>
                  <Text style={styles.deviceFeeds}>Feeds: Volume Tonnage, Sets/Reps, Muscle Clocks</Text>
                  <Text style={styles.deviceBattery}>Synced via Android Health Connect</Text>
                </View>
              </View>
              <Switch
                value={enabledSources.hevy}
                onValueChange={(val) => onToggleSource('hevy', val)}
                trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
                thumbColor={enabledSources.hevy ? '#007AFF' : '#CBD5E1'}
              />
            </View>

            {/* On-Device AI Engine Status */}
            <Text style={styles.sectionHeader}>LOCAL AI CONFIGURATION</Text>
            <View style={styles.aiEngineCard}>
              <View style={styles.aiTopRow}>
                <Text style={styles.aiTitle}>On-Device NPU Core</Text>
                <View style={styles.localBadge}>
                  <Text style={styles.localBadgeText}>100% PRIVATE & OFFLINE</Text>
                </View>
              </View>
              <Text style={styles.aiDesc}>
                Biometrics from your enabled devices are synthesized entirely on your phone's processor. No health telemetry is ever sent to external cloud servers.
              </Text>
            </View>

            {/* Optional Hevy API Enrichment */}
            <Text style={styles.sectionHeader}>OPTIONAL: HEVY API ENRICHMENT</Text>
            <View style={styles.apiKeyBox}>
              <Text style={styles.apiKeyTitle}>Hevy Personal API Token</Text>
              <Text style={styles.apiKeySub}>
                To enable deep set-by-set weight and RPE breakdowns beyond Health Connect summaries, enter your personal key from Hevy Settings &gt; Developer API.
              </Text>
              <TextInput
                style={styles.apiInput}
                placeholder="Paste Hevy API Key..."
                placeholderTextColor={Colors.textMuted}
                value={hevyApiKey}
                onChangeText={setHevyApiKey}
                secureTextEntry={true}
              />
              <TouchableOpacity style={styles.saveKeyBtn} onPress={handleSaveApiKey}>
                <Text style={styles.saveKeyBtnText}>{isSaved ? '✓ Key Saved' : 'Save Key'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  bodyScroll: {
    marginBottom: 20,
  },
  syncCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  syncInfo: {
    flex: 1,
  },
  syncStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  syncStatusSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  syncNowBtn: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  syncNowBtnActive: {
    opacity: 0.7,
  },
  syncNowBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  syncBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  sourceToggleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  deviceIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceEmoji: {
    fontSize: 18,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deviceFeeds: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deviceBattery: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  aiEngineCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 8,
    marginBottom: 18,
  },
  aiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  localBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  localBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
  },
  aiDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  apiKeyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  apiKeyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  apiKeySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginTop: 4,
    marginBottom: 10,
  },
  apiInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: Colors.textPrimary,
    fontSize: 12,
    marginBottom: 10,
  },
  saveKeyBtn: {
    backgroundColor: Colors.accentBlue,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  saveKeyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
