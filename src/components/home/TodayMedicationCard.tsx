// Today's Medication Overview Card for Home Dashboard
// Seamless integration into the main home feed

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { medicationService, ScheduledDoseItem } from '../../services/medication/medicationService';
import { CheckCircleIcon, TabletIcon, CapsuleIcon, DropletIcon } from '../medication/MedicationIcons';

interface TodayMedicationCardProps {
  onOpenMedications: () => void;
}

export const TodayMedicationCard: React.FC<TodayMedicationCardProps> = ({ onOpenMedications }) => {
  const [doses, setDoses] = useState<ScheduledDoseItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, taken: 0, percentage: 0 });

  const refreshData = () => {
    const list = medicationService.getScheduledDosesForDate();
    setDoses(list);
    setSummary(medicationService.getCompletionSummary());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggle = async (medId: string, time: string) => {
    await medicationService.toggleDoseTaken(medId, time);
    refreshData();
  };

  const renderIcon = (form: string, color: string) => {
    switch (form) {
      case 'capsule':
        return <CapsuleIcon size={18} color={color} />;
      case 'drops':
        return <DropletIcon size={18} color={color} />;
      case 'tablet':
      default:
        return <TabletIcon size={18} color={color} />;
    }
  };

  // Preview up to 3 upcoming or recent items
  const previewItems = doses.slice(0, 3);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 16 }}>💊</Text>
          </View>
          <View>
            <Text style={styles.title}>Medication Routine</Text>
            <Text style={styles.subtitle}>
              {summary.total > 0
                ? `${summary.taken}/${summary.total} doses taken today (${summary.percentage}%)`
                : 'No active medications scheduled'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.viewAllBtn} onPress={onOpenMedications} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke="#2C4A3E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Progress track */}
      {summary.total > 0 && (
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${summary.percentage}%` }]} />
        </View>
      )}

      {/* Mini Quick Doses List */}
      <View style={styles.dosesList}>
        {previewItems.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyDosesWrap}
            onPress={onOpenMedications}
            activeOpacity={0.75}
          >
            <Text style={styles.emptyDosesText}>No doses scheduled for today.</Text>
            <Text style={styles.emptyDosesAction}>+ Add Routine</Text>
          </TouchableOpacity>
        ) : (
          previewItems.map((item) => {
            const med = item.medication;
            return (
              <View
                key={`${med.id}-${item.time}`}
                style={[
                  styles.doseItem,
                  { backgroundColor: med.color || '#F8FAFC' },
                  item.isTaken && styles.doseItemTaken,
                ]}
              >
                <TouchableOpacity
                  style={styles.checkHitArea}
                  onPress={() => handleToggle(med.id, item.time)}
                  activeOpacity={0.7}
                >
                  <CheckCircleIcon size={20} checked={item.isTaken} color="#2C4A3E" />
                </TouchableOpacity>

                <View style={styles.doseInfo}>
                  <Text
                    style={[styles.medName, item.isTaken && styles.medNameTaken]}
                    numberOfLines={1}
                  >
                    {med.name} {med.dosage}
                  </Text>
                  <Text style={styles.doseTime}>
                    {item.time} • {med.unit}
                  </Text>
                </View>

                <View style={[styles.iconBadge, { backgroundColor: med.accentColor || '#E2E8F0' }]}>
                  {renderIcon(med.form, med.iconColor || '#2C4A3E')}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.05)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCE6DE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#141816',
  },
  subtitle: {
    fontSize: 11,
    color: '#63706B',
    fontWeight: '600',
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#152920',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#EEF4F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1F382E',
    borderRadius: 3,
  },
  dosesList: {
    gap: 8,
  },
  doseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.05)',
  },
  doseItemTaken: {
    opacity: 0.75,
  },
  checkHitArea: {
    padding: 2,
    marginRight: 8,
  },
  doseInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141816',
  },
  medNameTaken: {
    textDecorationLine: 'line-through',
    color: '#94A39D',
  },
  doseTime: {
    fontSize: 10,
    color: '#63706B',
    fontWeight: '600',
    marginTop: 2,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  emptyDosesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F4F8F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.06)',
  },
  emptyDosesText: {
    fontSize: 12,
    color: '#63706B',
    fontWeight: '500',
  },
  emptyDosesAction: {
    fontSize: 12,
    color: '#1F382E',
    fontWeight: '700',
  },
});
