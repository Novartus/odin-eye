/**
 * Soundscape & Restorative Frequency Presets
 * Binaural beats, Solfeggio tones, colored noises, and natural acoustics.
 */

import type { SoundscapeItem } from '../types';

export const SOUNDSCAPES: SoundscapeItem[] = [
  // Binaural Beats
  {
    id: 'gamma40',
    label: '40 Hz Focus Gamma',
    description: 'Peak cognitive focus & working memory',
    category: 'binaural',
    carrierFreq: '200 / 240 Hz',
    benefit: 'Sharp alertness & focus',
    requiresHeadphones: true,
  },
  {
    id: 'alpha10',
    label: '10 Hz Flow Alpha',
    description: 'Serene bridge between calm & alertness',
    category: 'binaural',
    carrierFreq: '200 / 210 Hz',
    benefit: 'Creative flow & calm focus',
    requiresHeadphones: true,
  },
  {
    id: 'theta6',
    label: '6 Hz Theta Sanctuary',
    description: 'Deep introspective meditation & intuition',
    category: 'binaural',
    carrierFreq: '150 / 156 Hz',
    benefit: 'Deep meditation & tension release',
    requiresHeadphones: true,
  },
  {
    id: 'delta2',
    label: '2 Hz Delta Restore',
    description: 'Slow restorative oscillations for deep somatic peace',
    category: 'binaural',
    carrierFreq: '100 / 102 Hz',
    benefit: 'Restorative somatic grounding',
    requiresHeadphones: true,
  },

  // Solfeggio Frequencies
  {
    id: 'hz432',
    label: '432 Hz Harmonic Peace',
    description: 'Schumann resonance for heart coherence & peace',
    category: 'solfeggio',
    carrierFreq: '432 Hz Pure',
    benefit: 'Heart coherence & grounding',
    requiresHeadphones: false,
  },
  {
    id: 'hz528',
    label: '528 Hz Cellular Balance',
    description: 'Ancient transformation tone of inner equilibrium',
    category: 'solfeggio',
    carrierFreq: '528 Hz Pure',
    benefit: 'Vitality & deep restorative balance',
    requiresHeadphones: false,
  },
  {
    id: 'hz639',
    label: '639 Hz Compassion Tone',
    description: 'Harmonizes empathy and emotional serenity',
    category: 'solfeggio',
    carrierFreq: '639 Hz Pure',
    benefit: 'Emotional calm & harmony',
    requiresHeadphones: false,
  },

  // Colored Noise
  {
    id: 'brown_noise',
    label: 'Velvet Brown Noise',
    description: 'Deep low-frequency rumble like distant waterfall',
    category: 'noise',
    benefit: 'Calms racing thoughts & tinnitus',
    requiresHeadphones: false,
  },
  {
    id: 'pink_noise',
    label: 'Organic Pink Noise',
    description: 'Balanced 1/f soothing acoustic shielding',
    category: 'noise',
    benefit: 'Alpha wave support & quiet',
    requiresHeadphones: false,
  },
  {
    id: 'white_noise',
    label: 'Tranquil White Noise',
    description: 'Broadband sound masking for deep focus',
    category: 'noise',
    benefit: 'External sound blocking',
    requiresHeadphones: false,
  },

  // Nature Soundscapes
  {
    id: 'waves',
    label: 'Ocean Waves',
    description: 'Slow, rhythmic tidal swell pacing breathing',
    category: 'nature',
    benefit: 'HRV pacing & tidal calm',
    requiresHeadphones: false,
  },
  {
    id: 'breeze',
    label: 'Forest Breeze',
    description: 'Whispering pine trees in mountain wind',
    category: 'nature',
    benefit: 'Stress release & parasympathetic tone',
    requiresHeadphones: false,
  },
  {
    id: 'rain',
    label: 'Gentle Rain',
    description: 'Soft raindrops on forest leaves',
    category: 'nature',
    benefit: 'Cool presence & tranquil thoughts',
    requiresHeadphones: false,
  },
  {
    id: 'birds',
    label: 'Chirping Birds',
    description: 'Gentle morning dawn birdsong',
    category: 'nature',
    benefit: 'Morning alertness & presence',
    requiresHeadphones: false,
  },
  {
    id: 'silent',
    label: 'Silent Clarity',
    description: 'Pure quiet mindfulness',
    category: 'nature',
    benefit: 'Unassisted breath awareness',
    requiresHeadphones: false,
  },
];
