// On-Screen Interactive Medication Reminder Alert Modal
// Shows a high-priority prompt when a medication dose is due
// Supports one-tap dose completion, snooze, and dismiss

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ReminderAlertEvent, medicationService } from '../../services/medication/medicationService';
import { TabletIcon, CapsuleIcon, DropletIcon, InjectionIcon } from './MedicationIcons';

interface MedicationReminderAlertModalProps {
  alert: ReminderAlertEvent | null;
  onClose: () => void;
  onDoseTaken: () => void;
}

export const MedicationReminderAlertModal: React.FC<MedicationReminderAlertModalProps> = ({
  alert,
  onClose,
  onDoseTaken,
}) => {
  if (!alert) return null;

  const med = alert.medication;

  const handleTakeNow = async () => {
    await medicationService.toggleDoseTaken(med.id, alert.time, alert.dateKey);
    onDoseTaken();
    onClose();
  };

  const handleSnooze = () => {
    medicationService.snoozeReminder(med.id, alert.time, 10);
    onClose();
  };

  const handleDismiss = () => {
    medicationService.dismissAlert(med.id, alert.time);
    onClose();
  };

  const renderIcon = () => {
    switch (med.form) {
      case 'capsule':
        return <CapsuleIcon size={28} color="#16A34A" />;
      case 'drops':
        return <DropletIcon size={28} color="#EA580C" />;
      case 'injection':
        return <InjectionIcon size={28} color="#8B5CF6" />;
      case 'tablet':
      default:
        return <TabletIcon size={28} color="#2563EB" />;
    }
  };

  return (
    <Modal visible={alert !== null} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Banner with Bell and Close */}
          <View style={styles.headerRow}>
            <View style={styles.headerTag}>
              <Text style={styles.bellIcon}>⏰</Text>
              <Text style={styles.headerTagText}>MEDICATION DUE NOW</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss} activeOpacity={0.7}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Central Medication Info */}
          <View style={styles.contentCenter}>
            <View style={[styles.iconContainer, { backgroundColor: med.accentColor || '#EEF2FF' }]}>
              {renderIcon()}
            </View>

            <Text style={styles.medName}>
              {med.name} {med.dosage}
            </Text>
            <Text style={styles.doseTime}>Scheduled for {alert.time}</Text>

            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>Take {med.unit} • {med.frequency}</Text>
            </View>

            {med.description ? (
              <Text style={styles.noteText} numberOfLines={2}>
                💡 {med.description}
              </Text>
            ) : null}
          </View>

          {/* Interactive Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.takeNowBtn} onPress={handleTakeNow} activeOpacity={0.85}>
              <Text style={styles.takeNowText}>✓ Mark as Taken Now</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity style={styles.snoozeBtn} onPress={handleSnooze} activeOpacity={0.7}>
                <Text style={styles.snoozeText}>⏰ Snooze 10m</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss} activeOpacity={0.7}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  bellIcon: {
    fontSize: 14,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  doseTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 10,
  },
  infoPill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  infoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  noteText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  actionsContainer: {
    gap: 8,
  },
  takeNowBtn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  takeNowText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  snoozeBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  snoozeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  dismissBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
