// Medication Reminder Section View
// Supports:
// - Interactive Week Strip OR Full Month Interactive Calendar
// - Custom time schedule tracking
// - Real-time on-screen reminder alerts with vibration
// - Dual-layer storage persistence (zero data loss across app reloads)

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import {
  Medication,
  ScheduledDoseItem,
  ReminderAlertEvent,
  medicationService,
} from '../../services/medication/medicationService';
import { medicationNotificationService } from '../../services/medication/medicationNotificationService';
import {
  TabletIcon,
  CapsuleIcon,
  DropletIcon,
  InjectionIcon,
  CheckCircleIcon,
} from './MedicationIcons';
import { MedicationDetailModal } from './MedicationDetailModal';
import { AddMedicationModal } from './AddMedicationModal';
import { FullMonthCalendarView } from './FullMonthCalendarView';
import { MedicationReminderAlertModal } from './MedicationReminderAlertModal';

interface DayItem {
  dayName: string;   // 'Sun', 'Mon', 'Tue'
  dayNum: number;    // 1, 2, 3
  dateKey: string;   // 'YYYY-MM-DD'
  isToday: boolean;
}

export const MedicationSectionView: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    medicationService.getTodayDateKey()
  );
  const [calendarMode, setCalendarMode] = useState<'week' | 'month'>('week');
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken'>('all');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeAlert, setActiveAlert] = useState<ReminderAlertEvent | null>(null);

  // Edit / Archive Selection State
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedForArchive, setSelectedForArchive] = useState<Set<string>>(new Set());
  const [showArchivedSection, setShowArchivedSection] = useState(false);

  const loadData = async () => {
    const list = await medicationService.getMedications();
    setMedications([...list]);
  };

  useEffect(() => {
    loadData();

    // Subscribe to real-time reminder events
    const unsubscribe = medicationService.onReminder((alert) => {
      setActiveAlert(alert);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 7-day week strip (Sun - Sat) around selected date
  const weekDays = useMemo<DayItem[]>(() => {
    const todayStr = medicationService.getTodayDateKey();
    const curr = new Date();
    const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay()));
    const days: DayItem[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        dayName: dayNames[i],
        dayNum: d.getDate(),
        dateKey: key,
        isToday: key === todayStr,
      });
    }
    return days;
  }, []);

  // Header date label (e.g. "January 3" or "September 12")
  const headerDateString = useMemo(() => {
    const [year, month, day] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }, [selectedDateKey]);

  // All scheduled doses for selected date
  const allDosesForDate = useMemo(() => {
    return medicationService.getScheduledDosesForDate(selectedDateKey);
  }, [medications, selectedDateKey]);

  const pendingCount = useMemo(() => {
    return allDosesForDate.filter((d) => !d.isTaken).length;
  }, [allDosesForDate]);

  const takenCount = useMemo(() => {
    return allDosesForDate.filter((d) => d.isTaken).length;
  }, [allDosesForDate]);

  const allCount = allDosesForDate.length;

  // Filtered doses for selected date
  const doses = useMemo(() => {
    if (filter === 'pending') {
      return allDosesForDate.filter((d) => !d.isTaken);
    }
    if (filter === 'taken') {
      return allDosesForDate.filter((d) => d.isTaken);
    }
    return allDosesForDate;
  }, [allDosesForDate, filter]);

  // Group doses by time slot
  const groupedByTime = useMemo(() => {
    const map = new Map<string, ScheduledDoseItem[]>();
    for (const dose of doses) {
      if (!map.has(dose.time)) {
        map.set(dose.time, []);
      }
      map.get(dose.time)!.push(dose);
    }
    return Array.from(map.entries());
  }, [doses]);

  // Archived medications
  const archivedMeds = useMemo(() => {
    return medications.filter((m) => !!m.isArchived);
  }, [medications]);

  // Distinct active medications in current schedule
  const distinctScheduledMeds = useMemo(() => {
    const seen = new Set<string>();
    const result: Medication[] = [];
    for (const dose of doses) {
      if (!seen.has(dose.medication.id)) {
        seen.add(dose.medication.id);
        result.push(dose.medication);
      }
    }
    return result;
  }, [doses]);

  const handleToggleSelectForArchive = (medId: string) => {
    setSelectedForArchive((prev) => {
      const next = new Set(prev);
      if (next.has(medId)) {
        next.delete(medId);
      } else {
        next.add(medId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedForArchive.size === distinctScheduledMeds.length && distinctScheduledMeds.length > 0) {
      setSelectedForArchive(new Set());
    } else {
      setSelectedForArchive(new Set(distinctScheduledMeds.map((m) => m.id)));
    }
  };

  const handleArchiveSingleMed = (med: Medication) => {
    Alert.alert(
      'Archive Medication',
      `Archive ${med.name}? It will be removed from your active daily schedule. You can restore it anytime from the Archived section below.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await medicationService.archiveMedication(med.id, true);
            setSelectedForArchive((prev) => {
              const next = new Set(prev);
              next.delete(med.id);
              return next;
            });
            await loadData();
          },
        },
      ]
    );
  };

  const handleArchiveSelected = () => {
    const count = selectedForArchive.size;
    if (count === 0) return;

    Alert.alert(
      'Archive Selected Medications',
      `Archive ${count} medication${count > 1 ? 's' : ''}? They will be removed from your active schedule and reminders. You can restore them anytime from the Archived section below.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Archive (${count})`,
          style: 'destructive',
          onPress: async () => {
            await medicationService.archiveMultipleMedications(Array.from(selectedForArchive), true);
            setSelectedForArchive(new Set());
            setIsEditMode(false);
            await loadData();
          },
        },
      ]
    );
  };

  const handleRestoreMedication = async (medId: string) => {
    await medicationService.archiveMedication(medId, false);
    await loadData();
  };

  const handleToggleDose = async (medId: string, time: string) => {
    await medicationService.toggleDoseTaken(medId, time, selectedDateKey);
    await loadData();
    if (selectedMed && selectedMed.id === medId) {
      const updated = (await medicationService.getMedications()).find((m) => m.id === medId);
      if (updated) setSelectedMed(updated);
    }
  };


  const renderMedIcon = (form: string, color: string) => {
    switch (form) {
      case 'capsule':
        return <CapsuleIcon size={22} color={color} />;
      case 'drops':
        return <DropletIcon size={22} color={color} />;
      case 'injection':
        return <InjectionIcon size={22} color={color} />;
      case 'tablet':
      default:
        return <TabletIcon size={22} color={color} />;
    }
  };

  const adherence = medicationService.getCompletionSummary(selectedDateKey);

  return (
    <View style={styles.container}>
      {/* Top Header: Profile Avatar, Test Reminder Alert button, and Edit & (+) Add Buttons */}
      <View style={styles.topHeader}>
        <View style={styles.avatarCircle}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
              stroke={Colors.bentoMintDark}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <Circle cx="12" cy="7" r="4" stroke={Colors.bentoMintDark} strokeWidth="2.2" />
          </Svg>
        </View>

        <View style={styles.headerRightActions}>
          {/* Quick Edit Schedule Routine Button */}
          <TouchableOpacity
            style={[styles.editHeaderBtn, isEditMode && styles.editHeaderBtnActive]}
            onPress={() => {
              setIsEditMode(!isEditMode);
              if (isEditMode) {
                setSelectedForArchive(new Set());
              }
            }}
            activeOpacity={0.8}
            accessibilityLabel="Edit medication routine"
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke={isEditMode ? '#FFFFFF' : Colors.textPrimary}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke={isEditMode ? '#FFFFFF' : Colors.textPrimary}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* (+) Add Medication Button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
            accessibilityLabel="Add medication"
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke={Colors.textPrimary} strokeWidth="2.4" strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Subtitle & Main Title with Calendar Toggle */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.dateSubtitle}>{headerDateString}</Text>
            <Text style={styles.mainTitle}>Today reminders</Text>
          </View>

          {/* Calendar View Toggle: Week vs Full Month */}
          <TouchableOpacity
            style={styles.calendarToggleBtn}
            onPress={() => setCalendarMode(calendarMode === 'week' ? 'month' : 'week')}
            activeOpacity={0.7}
          >
            <Text style={styles.calendarToggleText}>
              {calendarMode === 'week' ? '📅 Full Month' : '▲ Week View'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Month Calendar View OR Week Calendar Strip */}
      {calendarMode === 'month' ? (
        <FullMonthCalendarView
          selectedDateKey={selectedDateKey}
          onSelectDate={(key) => {
            setSelectedDateKey(key);
          }}
          onClose={() => setCalendarMode('week')}
        />
      ) : (
        <View style={styles.weekStripContainer}>
          {weekDays.map((day) => {
            const isSelected = day.dateKey === selectedDateKey;
            return (
              <TouchableOpacity
                key={day.dateKey}
                style={[styles.dayColumn, isSelected && styles.dayColumnSelected]}
                onPress={() => setSelectedDateKey(day.dateKey)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayNameText, isSelected && styles.dayNameTextSelected]}>
                  {day.dayName}
                </Text>
                <View style={[styles.dayNumBubble, isSelected && styles.dayNumBubbleSelected]}>
                  <Text style={[styles.dayNumText, isSelected && styles.dayNumTextSelected]}>
                    {day.dayNum}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Daily Adherence Progress Bar */}
      <View style={styles.adherenceCard}>
        <View style={styles.adherenceTextRow}>
          <Text style={styles.adherenceTitle}>Daily Adherence</Text>
          <Text style={styles.adherencePct}>
            {adherence.taken}/{adherence.total} taken ({adherence.percentage}%)
          </Text>
        </View>
        <View style={styles.adherenceTrack}>
          <View style={[styles.adherenceFill, { width: `${adherence.percentage}%` }]} />
        </View>
      </View>

      {/* Mindful Scandinavian Filter Bar (All / Pending / Taken with live counts) */}
      <View style={styles.filterBarWrapper}>
        <View style={styles.filterSegmentContainer}>
          <TouchableOpacity
            style={[styles.filterSegmentBtn, filter === 'all' && styles.filterSegmentBtnActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterSegmentText, filter === 'all' && styles.filterSegmentTextActive]}>
              All
            </Text>
            <View style={[styles.filterCountBadge, filter === 'all' && styles.filterCountBadgeActive]}>
              <Text style={[styles.filterCountText, filter === 'all' && styles.filterCountTextActive]}>
                {allCount}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterSegmentBtn, filter === 'pending' && styles.filterSegmentBtnActive]}
            onPress={() => setFilter('pending')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterSegmentText, filter === 'pending' && styles.filterSegmentTextActive]}>
              Pending
            </Text>
            <View style={[styles.filterCountBadge, filter === 'pending' && styles.filterCountBadgePending]}>
              <Text style={[styles.filterCountText, filter === 'pending' && styles.filterCountTextPending]}>
                {pendingCount}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterSegmentBtn, filter === 'taken' && styles.filterSegmentBtnActive]}
            onPress={() => setFilter('taken')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterSegmentText, filter === 'taken' && styles.filterSegmentTextActive]}>
              Taken
            </Text>
            <View style={[styles.filterCountBadge, filter === 'taken' && styles.filterCountBadgeTaken]}>
              <Text style={[styles.filterCountText, filter === 'taken' && styles.filterCountTextTaken]}>
                {takenCount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedule Column Labels */}
      <View style={styles.scheduleColumnLabels}>
        <Text style={styles.colLabelTime}>TIME</Text>
        <Text style={styles.colLabelMed}>MEDICATION & DOSAGE</Text>
      </View>

      {/* Edit Mode Interactive Archive Action Banner */}
      {isEditMode && (
        <View style={styles.archiveBanner}>
          <View style={styles.archiveBannerTopRow}>
            <View style={styles.archiveBannerInfo}>
              <Text style={styles.archiveBannerTitle}>Archive Scheduled Medications</Text>
              <Text style={styles.archiveBannerSub}>
                {selectedForArchive.size === 0
                  ? 'Select any medication(s) below to remove from active routine'
                  : `${selectedForArchive.size} of ${distinctScheduledMeds.length} selected to archive`}
              </Text>
            </View>
          </View>

          <View style={styles.archiveBannerButtonsRow}>
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={handleToggleSelectAll}
              activeOpacity={0.7}
            >
              <Text style={styles.selectAllBtnText}>
                {selectedForArchive.size === distinctScheduledMeds.length && distinctScheduledMeds.length > 0
                  ? 'Deselect All'
                  : 'Select All'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.archiveActionBtn,
                selectedForArchive.size === 0 && styles.archiveActionBtnDisabled,
              ]}
              onPress={handleArchiveSelected}
              disabled={selectedForArchive.size === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.archiveActionBtnText}>
                📦 Archive ({selectedForArchive.size})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneEditBannerBtn}
              onPress={() => {
                setIsEditMode(false);
                setSelectedForArchive(new Set());
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.doneEditBannerBtnText}>Done ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Grouped Timeline Schedule List */}
      {groupedByTime.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 36, marginBottom: 8 }}>💊</Text>
          <Text style={styles.emptyTitle}>No medications scheduled for this date</Text>
          <Text style={styles.emptySub}>
            Tap (+) in the top right to schedule your first prescription or daily supplement reminder.
          </Text>
        </View>
      ) : (
        <View style={styles.timelineList}>
          {groupedByTime.map(([timeSlot, doseGroup]) => (
            <View key={timeSlot} style={styles.timeGroupRow}>
              {/* Left Column: Time */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeSlotMain}>{timeSlot.split(' ')[0]}</Text>
                <Text style={styles.timeSlotPeriod}>{timeSlot.split(' ')[1] || 'AM'}</Text>
              </View>

              {/* Connecting Vertical Timeline Indicator */}
              <View style={styles.timelineLineContainer}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
              </View>

              {/* Right Column: Stacked Medication Cards for this time */}
              <View style={styles.cardsStack}>
                {doseGroup.map((dose) => {
                  const med = dose.medication;
                  const isSelected = selectedForArchive.has(med.id);
                  return (
                    <TouchableOpacity
                      key={`${med.id}-${dose.time}`}
                      style={[
                        styles.medCard,
                        { backgroundColor: med.color || '#F1F5F9' },
                        dose.isTaken && !isEditMode && styles.medCardTaken,
                        isEditMode && isSelected && styles.medCardSelectedForArchive,
                      ]}
                      onPress={() => {
                        if (isEditMode) {
                          handleToggleSelectForArchive(med.id);
                        } else {
                          setSelectedMed(med);
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <View style={styles.medCardLeft}>
                        {isEditMode ? (
                          <TouchableOpacity
                            style={styles.checkCircleHitArea}
                            onPress={() => handleToggleSelectForArchive(med.id)}
                            activeOpacity={0.6}
                          >
                            <View
                              style={[
                                styles.archiveSelectCircle,
                                isSelected && styles.archiveSelectCircleSelected,
                              ]}
                            >
                              {isSelected && <Text style={styles.archiveSelectCheck}>✓</Text>}
                            </View>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.checkCircleHitArea}
                            onPress={() => handleToggleDose(med.id, dose.time)}
                            activeOpacity={0.6}
                          >
                            <CheckCircleIcon size={22} checked={dose.isTaken} color="#10B981" />
                          </TouchableOpacity>
                        )}

                        <View style={styles.medCardTextGroup}>
                          <Text
                            style={[
                              styles.medCardName,
                              dose.isTaken && !isEditMode && styles.medCardNameTaken,
                            ]}
                          >
                            {med.name} {med.dosage}
                          </Text>
                          <Text style={styles.medCardUnit}>{med.unit}</Text>
                        </View>
                      </View>

                      {/* Right Side: Form Icon Badge OR Direct Single Archive Button in edit mode */}
                      {isEditMode ? (
                        <TouchableOpacity
                          style={styles.singleArchiveBtn}
                          onPress={() => handleArchiveSingleMed(med)}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.singleArchiveBtnText}>📦 Archive</Text>
                        </TouchableOpacity>
                      ) : (
                        <View
                          style={[
                            styles.medCardIconBadge,
                            { backgroundColor: med.accentColor || '#E2E8F0' },
                          ]}
                        >
                          {renderMedIcon(med.form, med.iconColor || '#2C4A3E')}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Collapsible Archived Medications Section */}
      {archivedMeds.length > 0 && (
        <View style={styles.archivedSection}>
          <TouchableOpacity
            style={styles.archivedHeaderBtn}
            onPress={() => setShowArchivedSection(!showArchivedSection)}
            activeOpacity={0.75}
          >
            <View style={styles.archivedHeaderLeft}>
              <View style={styles.archivedIconBubble}>
                <Text style={{ fontSize: 14 }}>📦</Text>
              </View>
              <View>
                <Text style={styles.archivedHeaderText}>
                  Archived Medications ({archivedMeds.length})
                </Text>
                <Text style={styles.archivedHeaderSub}>
                  {showArchivedSection
                    ? 'Tap to collapse'
                    : 'Tap to view or restore to schedule'}
                </Text>
              </View>
            </View>
            <Text style={styles.archivedChevron}>
              {showArchivedSection ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showArchivedSection && (
            <View style={styles.archivedList}>
              {archivedMeds.map((med) => (
                <View key={med.id} style={styles.archivedItem}>
                  <View style={styles.archivedItemLeft}>
                    <View
                      style={[
                        styles.archivedMedIconBadge,
                        { backgroundColor: med.accentColor || '#E2E8F0' },
                      ]}
                    >
                      {renderMedIcon(med.form, med.iconColor || '#64748B')}
                    </View>
                    <View style={styles.archivedItemTextGroup}>
                      <Text style={styles.archivedItemName}>
                        {med.name} {med.dosage}
                      </Text>
                      <Text style={styles.archivedItemSub}>
                        {med.unit} • {med.frequency} • {med.times.join(', ')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.restoreBtn}
                    onPress={() => handleRestoreMedication(med.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.restoreBtnText}>↺ Restore</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Medication Detail Modal */}
      <MedicationDetailModal
        visible={selectedMed !== null}
        medication={selectedMed}
        onClose={() => setSelectedMed(null)}
        onUpdated={loadData}
      />

      {/* Add Medication Modal */}
      <AddMedicationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={loadData}
      />

      {/* Real-time Interactive Reminder Alert Modal */}
      <MedicationReminderAlertModal
        alert={activeAlert}
        onClose={() => setActiveAlert(null)}
        onDoseTaken={loadData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D5E5DF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.1)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.1)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  editHeaderBtnActive: {
    backgroundColor: '#2C4A3E',
    borderColor: '#2C4A3E',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.1)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dateSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#63706B',
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.5,
  },
  calendarToggleBtn: {
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    marginBottom: 4,
  },
  calendarToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2C4A3E',
  },
  weekStripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F7F5',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    marginBottom: 16,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  dayColumn: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  dayColumnSelected: {
    backgroundColor: '#F1F5F9',
  },
  dayNameText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A9992',
    marginBottom: 6,
  },
  dayNameTextSelected: {
    color: '#141816',
    fontWeight: '700',
  },
  dayNumBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumBubbleSelected: {
    backgroundColor: '#1A1D1C',
    shadowColor: '#1A1D1C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayNumText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  dayNumTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  adherenceCard: {
    backgroundColor: '#EDE8F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(94, 78, 138, 0.08)',
    marginBottom: 20,
  },
  adherenceTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adherenceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  adherencePct: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  adherenceTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  adherenceFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  filterBarWrapper: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  filterSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF3F0',
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  filterSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  filterSegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  filterSegmentText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#63706B',
    marginRight: 6,
  },
  filterSegmentTextActive: {
    color: '#141816',
    fontWeight: '800',
  },
  filterCountBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#DFE7E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountBadgeActive: {
    backgroundColor: '#141816',
  },
  filterCountBadgePending: {
    backgroundColor: '#FDE6D8',
  },
  filterCountBadgeTaken: {
    backgroundColor: '#D7ECE4',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4A5B53',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  filterCountTextPending: {
    color: '#9A3412',
  },
  filterCountTextTaken: {
    color: '#065F46',
  },
  scheduleColumnLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  colLabelTime: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A9992',
    letterSpacing: 0.8,
    width: 58,
  },
  colLabelMed: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8A9992',
    letterSpacing: 0.8,
  },
  timelineList: {
    gap: 16,
  },
  timeGroupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: 54,
    paddingTop: 8,
  },
  timeSlotMain: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  timeSlotPeriod: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 1,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 16,
    marginRight: 10,
    paddingTop: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2C4A3E',
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  cardsStack: {
    flex: 1,
    gap: 10,
  },
  medCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  medCardTaken: {
    opacity: 0.75,
  },
  medCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  checkCircleHitArea: {
    padding: 2,
  },
  medCardTextGroup: {
    flex: 1,
  },
  medCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  medCardNameTaken: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  medCardUnit: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  medCardIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: '#F4F7F5',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  archiveBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  archiveBannerTopRow: {
    marginBottom: 10,
  },
  archiveBannerInfo: {
    flex: 1,
  },
  archiveBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  archiveBannerSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  archiveBannerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  selectAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
  },
  selectAllBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  archiveActionBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  archiveActionBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  archiveActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  doneEditBannerBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneEditBannerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  medCardSelectedForArchive: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  archiveSelectCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archiveSelectCircleSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  archiveSelectCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  singleArchiveBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  singleArchiveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  archivedSection: {
    marginTop: 24,
    marginBottom: 30,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  archivedHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  archivedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  archivedIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  archivedHeaderSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  archivedChevron: {
    fontSize: 12,
    color: '#64748B',
    paddingHorizontal: 4,
  },
  archivedList: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  archivedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F7F5',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  archivedItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  archivedMedIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedItemTextGroup: {
    flex: 1,
  },
  archivedItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  archivedItemSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  restoreBtn: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  restoreBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
});
