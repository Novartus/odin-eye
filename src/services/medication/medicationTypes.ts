// Shared Medication Types & Interfaces
// Decoupled to eliminate require cycles between services

export type MedicationForm = 'capsule' | 'tablet' | 'drops' | 'liquid' | 'injection';

export interface Medication {
  id: string;
  name: string;
  dosage: string;        // e.g. "30mg", "35mg", "20ml"
  unit: string;          // e.g. "1 capsule", "2 tablets", "20 drops"
  form: MedicationForm;
  times: string[];       // e.g. ["07:00 AM", "06:00 PM"]
  frequency: string;     // e.g. "Daily", "Twice daily", "Weekly"
  duration: string;      // e.g. "6 months", "30 days", "Ongoing"
  startDate: string;     // ISO date string
  progressPct: number;   // 0 - 100
  description: string;   // Clinical use / purpose
  sideEffects?: string[];
  color: string;         // Card pastel background
  accentColor: string;   // Accent icon background
  iconColor: string;     // Icon stroke color
  takenDates: Record<string, string[]>; // { "2026-09-12": ["07:00 AM"] }
  isArchived?: boolean;                 // If true, medication is archived from active routine
}

export interface ScheduledDoseItem {
  medication: Medication;
  time: string;
  isTaken: boolean;
  dateKey: string;
}

export interface ReminderAlertEvent {
  medication: Medication;
  time: string;
  dateKey: string;
  triggeredAt: string;
}
