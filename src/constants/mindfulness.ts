/**
 * Mindfulness & Breathwork Constants
 * Pre-configured scientifically proven breathing protocols, mood definitions, and emotional descriptors.
 */

import type { BreathTechnique } from '../types';

export const BREATHING_TECHNIQUES: BreathTechnique[] = [
  {
    id: 'box',
    name: 'Breathing Exercise',
    tagline: '4 · 4 · 4 · 4 Box',
    benefit: 'Reset nervous system & lower cortisol',
    durationMinutes: 2,
    accentColor: '#1F382E',
    bgColor: '#D9EAE4',
    outerRingColor: 'rgba(31, 56, 46, 0.10)',
    totalCycles: 4,
    phases: [
      { label: 'Breathe In...', duration: 4 },
      { label: 'Hold...', duration: 4 },
      { label: 'Breathe Out...', duration: 4 },
      { label: 'Hold...', duration: 4 },
    ],
  },
  {
    id: '478',
    name: 'Deep Calm & Sleep',
    tagline: '4 · 7 · 8 Relax',
    benefit: 'Parasympathetic nerve relaxation',
    durationMinutes: 5,
    accentColor: '#3B2D54',
    bgColor: '#EDE7F6',
    outerRingColor: 'rgba(59, 45, 84, 0.10)',
    totalCycles: 4,
    phases: [
      { label: 'Breathe In...', duration: 4 },
      { label: 'Hold...', duration: 7 },
      { label: 'Breathe Out...', duration: 8 },
    ],
  },
  {
    id: 'coherent',
    name: 'Coherent Harmony',
    tagline: '5 · 5 Rhythm',
    benefit: 'Maximize heart rate variability (HRV)',
    durationMinutes: 10,
    accentColor: '#184A3B',
    bgColor: '#D2ECE3',
    outerRingColor: 'rgba(24, 74, 59, 0.10)',
    totalCycles: 6,
    phases: [
      { label: 'Breathe In...', duration: 5 },
      { label: 'Breathe Out...', duration: 5 },
    ],
  },
  {
    id: 'energize',
    name: 'Sunset Wind-Down',
    tagline: '4 · 2 · 6 Restore',
    benefit: 'Gentle restoration & physical release',
    durationMinutes: 15,
    accentColor: '#8C481A',
    bgColor: '#FDEEE4',
    outerRingColor: 'rgba(140, 72, 26, 0.10)',
    totalCycles: 6,
    phases: [
      { label: 'Breathe In...', duration: 4 },
      { label: 'Hold...', duration: 2 },
      { label: 'Breathe Out...', duration: 6 },
    ],
  },
];

export interface MoodPreset {
  id: string;
  label: string;
  color: string;
}

export const MOOD_PRESETS: MoodPreset[] = [
  { id: 'unhappy', label: 'Unhappy', color: '#E07A5F' },
  { id: 'sad', label: 'Sad', color: '#6A8CAF' },
  { id: 'normal', label: 'Normal', color: '#8A9992' },
  { id: 'good', label: 'Good', color: '#5A9E7F' },
  { id: 'happy', label: 'Happy', color: '#D4A338' },
];

export const MOOD_DESCRIPTIONS: Record<string, string> = {
  unhappy: "It's okay to feel down or frustrated. A gentle breath can soften the moment.",
  sad: 'Holding space for your feelings with quiet, tender presence.',
  normal: 'Grounded, steady, and centered in your natural calm rhythm.',
  good: 'Peaceful clarity and serene balance in your mind and body.',
  happy: 'Vibrant joy, gratitude, and expansive positive energy.',
};
