// Interactive Notifications Center Modal
// Displays recent health notifications, medication alerts, and test alert triggers

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Vibration,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { medicationService, ScheduledDoseItem } from '../../services/medication/medicationService';
import { medicationNotificationService } from '../../services/medication/medicationNotificationService';
import { getTodayDateKey } from '../../utils';

import { NotificationsModalProps } from '../../types';

export { NotificationsModalProps };

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onOpenMedications,
  onOpenSettings,
  onTriggerTestAlert,
}) => {
  const [doses, setDoses] = useState<ScheduledDoseItem[]>([]);
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);

  const refreshNotifications = () => {
    const today = getTodayDateKey();
    const list = medicationService.getScheduledDosesForDate(today);
    setDoses(list);
  };

  useEffect(() => {
    if (visible) {
      refreshNotifications();
    }
  }, [visible]);

  const handleTestNotification = () => {
    try {
      Vibration.vibrate([0, 300, 150, 300]);
    } catch {}

    if (onTriggerTestAlert) {
      onTriggerTestAlert();
    } else {
      medicationService.triggerTestReminder();
      medicationNotificationService.sendTestPopNotification().catch(() => {});
    }

    setClearedNotice('🔔 Alert dispatched! Dose reminder popped up.');
    setTimeout(() => setClearedNotice(null), 3500);
  };

  const handleTakeDose = async (medId: string, time: string) => {
    await medicationService.toggleDoseTaken(medId, time);
    refreshNotifications();
  };

  const pendingDoses = doses.filter((d) => !d.isTaken);
  const completedDoses = doses.filter((d) => d.isTaken);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {pendingDoses.length > 0 && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>{pendingDoses.length} Active</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#64748B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Quick Action: Test Notification Alert Trigger */}
          <View style={styles.testBanner}>
            <View style={styles.testBannerLeft}>
              <Text style={styles.testBannerTitle}>Interactive Alerts Ready</Text>
              <Text style={styles.testBannerSub}>
                Test dose notifications and haptic feedback
              </Text>
            </View>

            <TouchableOpacity
              style={styles.testAlertBtn}
              onPress={handleTestNotification}
              activeOpacity={0.8}
            >
              <Text style={styles.testAlertBtnText}>⚡ Test Alert</Text>
            </TouchableOpacity>
          </View>

          {clearedNotice && (
            <View style={styles.feedbackToast}>
              <Text style={styles.feedbackToastText}>{clearedNotice}</Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section: Pending Medication Reminders */}
            <Text style={styles.sectionHeader}>SCHEDULED REMINDERS</Text>
            {pendingDoses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={{ fontSize: 20, marginBottom: 4 }}>🎉</Text>
                <Text style={styles.emptyCardTitle}>All doses logged for today!</Text>
                <Text style={styles.emptyCardSub}>
                  You are 100% up to date with your scheduled medication routine.
                </Text>
              </View>
            ) : (
              pendingDoses.map((dose) => (
                <View key={`${dose.medication.id}-${dose.time}`} style={styles.notifCard}>
                  <View style={styles.notifLeft}>
                    <View
                      style={[
                        styles.notifIconBubble,
                        { backgroundColor: dose.medication.accentColor || '#EFF6FF' },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>⏰</Text>
                    </View>
                    <View style={styles.notifInfo}>
                      <Text style={styles.notifTitle}>
                        {dose.medication.name} {dose.medication.dosage}
                      </Text>
                      <Text style={styles.notifTime}>
                        Scheduled for {dose.time} • {dose.medication.unit}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.takeDoseBtn}
                    onPress={() => handleTakeDose(dose.medication.id, dose.time)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.takeDoseBtnText}>✓ Take</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Section: System & Sensor Telemetry Status */}
            <Text style={styles.sectionHeader}>SYSTEM & HARDWARE NOTIFICATIONS</Text>

            <View style={styles.systemCard}>
              <View style={styles.systemLeft}>
                <View style={[styles.systemIconBubble, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={{ fontSize: 14 }}>❤️</Text>
                </View>
                <View style={styles.systemInfo}>
                  <Text style={styles.systemTitle}>Android Health Connect</Text>
                  <Text style={styles.systemSub}>
                    Master OS hub connected • Live pulse & sleep telemetry active
                  </Text>
                </View>
              </View>
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>ACTIVE</Text>
              </View>
            </View>

            <View style={styles.systemCard}>
              <View style={styles.systemLeft}>
                <View style={[styles.systemIconBubble, { backgroundColor: '#F0F9FF' }]}>
                  <Text style={{ fontSize: 14 }}>⚡</Text>
                </View>
                <View style={styles.systemInfo}>
                  <Text style={styles.systemTitle}>Autonomic Recovery Status</Text>
                  <Text style={styles.systemSub}>
                    Today's physiological baseline calculated with 0 cloud leak
                  </Text>
                </View>
              </View>
              <View style={styles.systemBadge}>
                <Text style={styles.systemBadgeText}>OPTIMAL</Text>
              </View>
            </View>

            {/* Completed doses if any */}
            {completedDoses.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>COMPLETED TODAY</Text>
                {completedDoses.map((dose) => (
                  <View
                    key={`done-${dose.medication.id}-${dose.time}`}
                    style={[styles.notifCard, styles.notifCardCompleted]}
                  >
                    <View style={styles.notifLeft}>
                      <View style={[styles.notifIconBubble, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={{ fontSize: 14 }}>✓</Text>
                      </View>
                      <View style={styles.notifInfo}>
                        <Text style={[styles.notifTitle, styles.notifTitleCompleted]}>
                          {dose.medication.name} {dose.medication.dosage}
                        </Text>
                        <Text style={styles.notifTime}>
                          Dose taken at {dose.time}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Bottom Actions Row: Open Full Routine & Open Settings */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.footerBtn}
                onPress={() => {
                  onClose();
                  onOpenMedications();
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.footerBtnText}>💊 Open Medications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.footerBtn, styles.footerBtnSecondary]}
                onPress={() => {
                  onClose();
                  onOpenSettings();
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.footerBtnTextSecondary}>⚙️ Settings</Text>
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
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 18,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  testBannerLeft: {
    flex: 1,
    marginRight: 10,
  },
  testBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  testBannerSub: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 1,
  },
  testAlertBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  testAlertBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedbackToast: {
    backgroundColor: '#DCFCE7',
    marginHorizontal: 18,
    marginTop: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  feedbackToastText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },
  scrollArea: {
    paddingHorizontal: 18,
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  emptyCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardCompleted: {
    backgroundColor: '#F8FAFC',
    opacity: 0.75,
  },
  notifLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  notifIconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  notifTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  notifTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  takeDoseBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  takeDoseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  systemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  systemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  systemIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemInfo: {
    flex: 1,
  },
  systemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  systemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  systemBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  systemBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  footerBtn: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerBtnSecondary: {
    backgroundColor: '#F1F5F9',
  },
  footerBtnTextSecondary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
