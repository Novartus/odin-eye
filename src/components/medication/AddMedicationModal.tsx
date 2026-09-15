// Add Medication Modal Form
// Allows scheduling new medications with full custom time selection,
// removable schedule pills, and custom dosage parameters.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { medicationService } from '../../services/medication/medicationService';
import { medicationNotificationService } from '../../services/medication/medicationNotificationService';
import type { MedicationForm, AddMedicationModalProps } from '../../types';
import { TabletIcon, CapsuleIcon, DropletIcon, InjectionIcon } from './MedicationIcons';

const COLOR_THEMES = [
  { id: 'blue', color: '#EFF6FF', accent: '#DBEAFE', icon: '#2563EB', label: 'Sky' },
  { id: 'green', color: '#F0FDF4', accent: '#DCFCE7', icon: '#16A34A', label: 'Mint' },
  { id: 'peach', color: '#FFF7ED', accent: '#FFEDD5', icon: '#EA580C', label: 'Peach' },
  { id: 'purple', color: '#FAF5FF', accent: '#F3E8FF', icon: '#9333EA', label: 'Iris' },
];

const PRESET_TIMES = ['07:00 AM', '08:00 AM', '12:00 PM', '02:00 PM', '06:00 PM', '09:00 PM'];

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  visible,
  onClose,
  onAdded,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('1 capsule');
  const [form, setForm] = useState<MedicationForm>('capsule');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['08:00 AM']);
  const [frequency, setFrequency] = useState('Daily');
  const [duration, setDuration] = useState('3 months');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState(COLOR_THEMES[0]);

  // Custom time builder state
  const [customHour, setCustomHour] = useState('09');
  const [customMin, setCustomMin] = useState('30');
  const [customPeriod, setCustomPeriod] = useState<'AM' | 'PM'>('AM');
  const [showCustomTimeBuilder, setShowCustomTimeBuilder] = useState(false);

  const togglePresetTime = (time: string) => {
    if (selectedTimes.includes(time)) {
      if (selectedTimes.length > 1) {
        setSelectedTimes(selectedTimes.filter((t) => t !== time));
      }
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const removeTime = (timeToRemove: string) => {
    if (selectedTimes.length > 1) {
      setSelectedTimes(selectedTimes.filter((t) => t !== timeToRemove));
    }
  };

  const addCustomTime = () => {
    const formattedHour = String(Math.max(1, Math.min(12, parseInt(customHour, 10) || 12))).padStart(2, '0');
    const formattedMin = String(Math.max(0, Math.min(59, parseInt(customMin, 10) || 0))).padStart(2, '0');
    const newTime = `${formattedHour}:${formattedMin} ${customPeriod}`;

    if (!selectedTimes.includes(newTime)) {
      setSelectedTimes([...selectedTimes, newTime]);
    }
    setShowCustomTimeBuilder(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    // Prompt for notification permissions if not yet granted so OS alarms can alert on lockscreen
    try {
      const hasPerm = await medicationNotificationService.checkNotificationPermission();
      if (!hasPerm) {
        await medicationNotificationService.requestNotificationPermission();
      }
    } catch {}

    await medicationService.addMedication({
      name: name.trim(),
      dosage: dosage.trim() || '1 dose',
      unit: unit.trim() || '1 unit',
      form,
      times: selectedTimes,
      frequency,
      duration,
      startDate: new Date().toISOString(),
      progressPct: 0,
      description: description.trim() || `${name.trim()} prescribed routine support.`,
      color: colorTheme.color,
      accentColor: colorTheme.accent,
      iconColor: colorTheme.icon,
    });

    // Reset form
    setName('');
    setDosage('');
    setDescription('');
    setSelectedTimes(['08:00 AM']);
    onAdded();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke={Colors.textPrimary} strokeWidth="2.2" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Reminder</Text>
            <TouchableOpacity
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Medication Name */}
            <Text style={styles.inputLabel}>MEDICATION / SUPPLEMENT NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Roaccutane, Vitamin D3, Omega 3"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            {/* Dosage & Unit */}
            <View style={styles.rowTwoInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>DOSAGE</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 30mg, 1000 IU"
                  placeholderTextColor="#94A3B8"
                  value={dosage}
                  onChangeText={setDosage}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>DOSE AMOUNT</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 1 capsule, 20 drops"
                  placeholderTextColor="#94A3B8"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Form Selector */}
            <Text style={styles.inputLabel}>MEDICATION FORM</Text>
            <View style={styles.formSelectorRow}>
              {(['capsule', 'tablet', 'drops', 'injection'] as MedicationForm[]).map((f) => {
                const isSelected = form === f;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.formOption, isSelected && styles.formOptionSelected]}
                    onPress={() => setForm(f)}
                    activeOpacity={0.7}
                  >
                    {f === 'capsule' && <CapsuleIcon size={22} color={isSelected ? '#007AFF' : '#64748B'} />}
                    {f === 'tablet' && <TabletIcon size={22} color={isSelected ? '#007AFF' : '#64748B'} />}
                    {f === 'drops' && <DropletIcon size={22} color={isSelected ? '#007AFF' : '#64748B'} />}
                    {f === 'injection' && <InjectionIcon size={22} color={isSelected ? '#007AFF' : '#64748B'} />}
                    <Text style={[styles.formOptionText, isSelected && styles.formOptionTextSelected]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected Active Times List with Delete Chips */}
            <Text style={styles.inputLabel}>ACTIVE REMINDER TIMES ({selectedTimes.length})</Text>
            <View style={styles.timesWrap}>
              {selectedTimes.map((time) => (
                <View key={time} style={styles.activeTimeChip}>
                  <Text style={styles.activeTimeChipText}>⏰ {time}</Text>
                  <TouchableOpacity
                    style={styles.timeRemoveBtn}
                    onPress={() => removeTime(time)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Preset Quick-Picks */}
            <Text style={styles.subInputLabel}>Quick presets:</Text>
            <View style={styles.timesWrap}>
              {PRESET_TIMES.map((time) => {
                const isSelected = selectedTimes.includes(time);
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.presetTimePill, isSelected && styles.presetTimePillSelected]}
                    onPress={() => togglePresetTime(time)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.presetTimeText, isSelected && styles.presetTimeTextSelected]}>
                      {time} {isSelected ? '✓' : '+'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Time Selector Toggle & Builder */}
            <TouchableOpacity
              style={styles.addCustomTimeBtn}
              onPress={() => setShowCustomTimeBuilder(!showCustomTimeBuilder)}
              activeOpacity={0.7}
            >
              <Text style={styles.addCustomTimeBtnText}>
                {showCustomTimeBuilder ? '▲ Hide Custom Time' : '⏱ + Set Custom Time'}
              </Text>
            </TouchableOpacity>

            {showCustomTimeBuilder && (
              <View style={styles.customTimeBox}>
                <Text style={styles.customTimeHeader}>Pick Exact Hour & Minute</Text>
                <View style={styles.customTimeRow}>
                  <View style={styles.timeInputCol}>
                    <Text style={styles.timeSubLabel}>Hour (1-12)</Text>
                    <TextInput
                      style={styles.timeNumericInput}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={customHour}
                      onChangeText={setCustomHour}
                    />
                  </View>

                  <Text style={styles.timeColon}>:</Text>

                  <View style={styles.timeInputCol}>
                    <Text style={styles.timeSubLabel}>Minute (00-59)</Text>
                    <TextInput
                      style={styles.timeNumericInput}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={customMin}
                      onChangeText={setCustomMin}
                    />
                  </View>

                  {/* AM/PM Toggle */}
                  <View style={styles.periodCol}>
                    <TouchableOpacity
                      style={[styles.periodBtn, customPeriod === 'AM' && styles.periodBtnActive]}
                      onPress={() => setCustomPeriod('AM')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.periodText, customPeriod === 'AM' && styles.periodTextActive]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.periodBtn, customPeriod === 'PM' && styles.periodBtnActive]}
                      onPress={() => setCustomPeriod('PM')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.periodText, customPeriod === 'PM' && styles.periodTextActive]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Add Button */}
                  <TouchableOpacity style={styles.confirmTimeBtn} onPress={addCustomTime} activeOpacity={0.8}>
                    <Text style={styles.confirmTimeBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Frequency & Duration */}
            <View style={styles.rowTwoInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>FREQUENCY</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Daily, Weekly"
                  placeholderTextColor="#94A3B8"
                  value={frequency}
                  onChangeText={setFrequency}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>COURSE DURATION</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 6 months, Ongoing"
                  placeholderTextColor="#94A3B8"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </View>

            {/* Purpose / Instructions */}
            <Text style={styles.inputLabel}>CLINICAL INSTRUCTIONS / NOTES</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Take with 250ml water after breakfast."
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Color Accent Picker */}
            <Text style={styles.inputLabel}>CARD COLOR ACCENT</Text>
            <View style={styles.colorRow}>
              {COLOR_THEMES.map((theme) => {
                const isSelected = colorTheme.id === theme.id;
                return (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: theme.accent },
                      isSelected && styles.colorCircleSelected,
                    ]}
                    onPress={() => setColorTheme(theme)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.colorInnerDot, { backgroundColor: theme.icon }]} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFCFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#007AFF',
  },
  saveBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.5,
  },
  subInputLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  formSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  formOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  formOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  formOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
  timesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeTimeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 6,
  },
  activeTimeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3730A3',
  },
  timeRemoveBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRemoveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3730A3',
  },
  presetTimePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetTimePillSelected: {
    backgroundColor: '#E8F9F1',
    borderColor: '#10B981',
  },
  presetTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  presetTimeTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  addCustomTimeBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addCustomTimeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  customTimeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 8,
  },
  customTimeHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInputCol: {
    alignItems: 'center',
  },
  timeSubLabel: {
    fontSize: 9,
    color: '#94A3B8',
    marginBottom: 2,
  },
  timeNumericInput: {
    width: 50,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeColon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 12,
  },
  periodCol: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    padding: 2,
    marginTop: 12,
  },
  periodBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodBtnActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  confirmTimeBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    marginLeft: 4,
  },
  confirmTimeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#0F172A',
  },
  colorInnerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
