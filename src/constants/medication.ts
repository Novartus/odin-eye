/**
 * Medication & Supplement Constants
 * Shared themes, preset reminder times, and notification action intents.
 */

export interface MedicationColorTheme {
  id: string;
  color: string;
  accent: string;
  icon: string;
  label: string;
}

export const MEDICATION_COLOR_THEMES: MedicationColorTheme[] = [
  { id: 'blue', color: '#EFF6FF', accent: '#DBEAFE', icon: '#2563EB', label: 'Sky' },
  { id: 'green', color: '#F0FDF4', accent: '#DCFCE7', icon: '#16A34A', label: 'Mint' },
  { id: 'peach', color: '#FFF7ED', accent: '#FFEDD5', icon: '#EA580C', label: 'Peach' },
  { id: 'purple', color: '#FAF5FF', accent: '#F3E8FF', icon: '#9333EA', label: 'Iris' },
];

export const MEDICATION_PRESET_TIMES = [
  '07:00 AM',
  '08:00 AM',
  '12:00 PM',
  '02:00 PM',
  '06:00 PM',
  '09:00 PM',
] as const;

export const MEDICATION_NOTIFICATION_ACTIONS = {
  TAKE_MED: 'com.odineye.health.ACTION_TAKE_MED',
  SNOOZE_MED: 'com.odineye.health.ACTION_SNOOZE_MED',
} as const;
