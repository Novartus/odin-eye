// Medication Detail Modal
// Exact replica of the 3rd screen in the design mockup

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { medicationService } from '../../services/medication/medicationService';
import { getTodayDateKey } from '../../utils';
import type { MedicationDetailModalProps } from '../../types';
import {
  TabletIcon,
  CapsuleIcon,
  DropletIcon,
  InjectionIcon,
  DocumentIcon,
  CircularAdherenceGauge,
} from './MedicationIcons';

export const MedicationDetailModal: React.FC<MedicationDetailModalProps> = ({
  visible,
  medication,
  onClose,
  onUpdated,
}) => {
  const [showSideEffects, setShowSideEffects] = useState(false);

  if (!medication) return null;

  const todayKey = getTodayDateKey();
  const takenTimes = medication.takenDates?.[todayKey] || [];
  const allTakenToday = medication.times.every((t) => takenTimes.includes(t));

  const handleToggleTodayDose = async (time: string) => {
    await medicationService.toggleDoseTaken(medication.id, time, todayKey);
    onUpdated();
  };

  const handleArchiveToggle = async () => {
    const willArchive = !medication.isArchived;
    Alert.alert(
      willArchive ? 'Archive Medication' : 'Restore Medication',
      willArchive
        ? `Archive ${medication.name}? It will be hidden from your daily routine schedule and reminder alerts. You can restore it at any time.`
        : `Restore ${medication.name} back into your active daily schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: willArchive ? 'Archive' : 'Restore',
          onPress: async () => {
            await medicationService.archiveMedication(medication.id, willArchive);
            onUpdated();
            onClose();
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Medication',
      `Are you sure you want to remove ${medication.name} from your reminders?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await medicationService.deleteMedication(medication.id);
            onUpdated();
            onClose();
          },
        },
      ]
    );
  };

  const renderFormIcon = () => {
    switch (medication.form) {
      case 'capsule':
        return <CapsuleIcon size={26} color="#16A34A" />;
      case 'drops':
        return <DropletIcon size={26} color="#EA580C" />;
      case 'injection':
        return <InjectionIcon size={26} color="#8B5CF6" />;
      case 'tablet':
      default:
        return <TabletIcon size={26} color="#2563EB" />;
    }
  };

  const formLabel =
    medication.form.charAt(0).toUpperCase() + medication.form.slice(1) + 's';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose} activeOpacity={0.7}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 19l-7-7 7-7"
                stroke={Colors.textPrimary}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <Text style={styles.navTitle}>Medication</Text>

          <TouchableOpacity style={styles.circleBtn} onPress={handleDelete} activeOpacity={0.7}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Circle cx="5" cy="12" r="2" fill={Colors.textPrimary} />
              <Circle cx="12" cy="12" r="2" fill={Colors.textPrimary} />
              <Circle cx="19" cy="12" r="2" fill={Colors.textPrimary} />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Active course badge */}
          <Text style={styles.courseSubtitle}>Active course</Text>

          {/* Large Title */}
          <Text style={styles.medTitle}>
            {medication.name} {medication.dosage}
          </Text>

          {/* Description */}
          <Text style={styles.medDescription}>{medication.description}</Text>

          {/* Schedule Section */}
          <Text style={styles.sectionHeader}>Schedule</Text>
          <View style={styles.scheduleRow}>
            {medication.times.map((time) => {
              const isTaken = takenTimes.includes(time);
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeChip, isTaken && styles.timeChipTaken]}
                  onPress={() => handleToggleTodayDose(time)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.timeChipText, isTaken && styles.timeChipTextTaken]}>
                    {time} {isTaken ? '✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Specs Card (Form, Duration, Dose, Frequency) */}
          <View style={styles.specsCard}>
            <View style={styles.specsTopRow}>
              <View style={[styles.formIconContainer, { backgroundColor: medication.accentColor }]}>
                {renderFormIcon()}
              </View>
              <Text style={styles.formTitle}>{formLabel}</Text>
            </View>

            <View style={styles.specsDivider} />

            <View style={styles.specsColsRow}>
              <View style={styles.specCol}>
                <Text style={styles.specLabel}>Duration</Text>
                <Text style={styles.specValue}>{medication.duration}</Text>
              </View>
              <View style={styles.colSeparator} />
              <View style={styles.specCol}>
                <Text style={styles.specLabel}>Dose</Text>
                <Text style={styles.specValue}>{medication.unit}</Text>
              </View>
              <View style={styles.colSeparator} />
              <View style={styles.specCol}>
                <Text style={styles.specLabel}>Frequency</Text>
                <Text style={styles.specValue}>{medication.frequency}</Text>
              </View>
            </View>
          </View>

          {/* 2-Column Progress & Side Effects Cards */}
          <View style={styles.twoColRow}>
            {/* Progress Card */}
            <View style={styles.progressCard}>
              <Text style={styles.cardHeaderSmall}>Progress</Text>
              <Text style={styles.courseStartDate}>
                Course started {medication.startDate ? new Date(medication.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently'}
              </Text>

              <View style={styles.gaugeContainer}>
                <CircularAdherenceGauge
                  percentage={medication.progressPct || 40}
                  size={84}
                  strokeWidth={7}
                  color="#10B981"
                  bgColor="#F1F5F9"
                />
                <View style={styles.gaugeCenterText}>
                  <Text style={styles.gaugePctText}>{medication.progressPct || 40}%</Text>
                  <Text style={styles.gaugeSubText}>complete</Text>
                </View>
              </View>
            </View>

            {/* Possible Side Effects Blue Card */}
            <TouchableOpacity
              style={styles.sideEffectsCard}
              activeOpacity={0.85}
              onPress={() => setShowSideEffects(!showSideEffects)}
            >
              <View style={styles.sideEffectsIconBubble}>
                <DocumentIcon size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Text style={styles.sideEffectsTitle}>Possible side effects</Text>
                <Text style={styles.sideEffectsSub}>
                  {showSideEffects
                    ? (medication.sideEffects?.join(' • ') || 'No known severe adverse reactions reported.')
                    : 'Learn more about this medication, its side effects...'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Log Dose Button */}
          <TouchableOpacity
            style={[styles.primaryActionBtn, allTakenToday && styles.primaryActionBtnSuccess]}
            onPress={async () => {
              for (const t of medication.times) {
                if (!takenTimes.includes(t)) {
                  await medicationService.toggleDoseTaken(medication.id, t, todayKey);
                }
              }
              onUpdated();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionBtnText}>
              {allTakenToday ? 'All Doses Completed Today ✓' : 'Mark All Today Doses Taken'}
            </Text>
          </TouchableOpacity>

          {/* Manage Routine: Archive & Delete Actions */}
          <View style={styles.detailActionRow}>
            <TouchableOpacity
              style={styles.archiveBtn}
              onPress={handleArchiveToggle}
              activeOpacity={0.75}
            >
              <Text style={styles.archiveBtnText}>
                {medication.isArchived ? '↺ Restore to Schedule' : '📦 Archive Medication'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.75}
            >
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFCFB',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5ECE8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  courseSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 12,
    marginBottom: 4,
  },
  medTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.4,
  },
  medDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeChipTaken: {
    backgroundColor: '#E8F9F1',
    borderColor: '#A7F3D0',
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  timeChipTextTaken: {
    color: '#10B981',
  },
  specsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EDEA',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  specsTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  specsDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  specsColsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specCol: {
    flex: 1,
    alignItems: 'center',
  },
  colSeparator: {
    width: 1,
    height: 28,
    backgroundColor: '#F1F5F9',
  },
  specLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  progressCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EDEA',
  },
  cardHeaderSmall: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  courseStartDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 10,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },
  gaugeCenterText: {
    position: 'absolute',
    alignItems: 'center',
  },
  gaugePctText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  gaugeSubText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  sideEffectsCard: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
  },
  sideEffectsIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideEffectsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 4,
  },
  sideEffectsSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 14,
  },
  primaryActionBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryActionBtnSuccess: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  primaryActionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  archiveBtn: {
    flex: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  archiveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
