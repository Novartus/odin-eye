// OdinEye Ambient Audio & Procedural Soundscape Service
// Supports:
// - Real-time procedural sound synthesis (Solfeggio frequencies, Binaural Beats, Colored Noise)
// - Native Android AudioTrack background synthesis via OdinAudioModule
// - Web Audio API fallback for web preview
// - Continuous playback while screen is dimmed or backgrounded

import { NativeModules, Platform } from 'react-native';

const { OdinAudioModule } = NativeModules;

export type SoundCategory = 'binaural' | 'solfeggio' | 'noise' | 'nature';

export interface AmbientTrack {
  id: string;
  name: string;
  category: SoundCategory;
  carrierFreq?: string;
  beatFreq?: string;
  description: string;
  benefit: string;
  requiresHeadphones?: boolean;
}

export const AMBIENT_CATALOG: AmbientTrack[] = [
  // ─── Binaural Beats ──────────────────────────────────────────────────────────
  {
    id: 'gamma40',
    name: '40 Hz Focus Gamma',
    category: 'binaural',
    carrierFreq: '200 Hz / 240 Hz',
    beatFreq: '40 Hz Gamma',
    description: 'High-frequency synchronization for sharp cognitive alertness and peak working memory.',
    benefit: 'Hyper-focus, attention & cognitive clarity',
    requiresHeadphones: true,
  },
  {
    id: 'alpha10',
    name: '10 Hz Flow Alpha',
    category: 'binaural',
    carrierFreq: '200 Hz / 210 Hz',
    beatFreq: '10 Hz Alpha',
    description: 'Bridge between conscious thinking and subconscious calm. Induces serene flow state.',
    benefit: 'Stress reduction, creative flow & calm focus',
    requiresHeadphones: true,
  },
  {
    id: 'theta6',
    name: '6 Hz Theta Sanctuary',
    category: 'binaural',
    carrierFreq: '150 Hz / 156 Hz',
    beatFreq: '6 Hz Theta',
    description: 'Associated with deep introspective meditation, subconscious healing, and intuition.',
    benefit: 'Deep zen, emotional reset & breathwork',
    requiresHeadphones: true,
  },
  {
    id: 'delta2',
    name: '2 Hz Delta Restore',
    category: 'binaural',
    carrierFreq: '100 Hz / 102 Hz',
    beatFreq: '2 Hz Delta',
    description: 'Slow, grounded restorative oscillations promoting parasympathetic nervous tone.',
    benefit: 'Somatic grounding & deep tension release',
    requiresHeadphones: true,
  },

  // ─── Solfeggio Frequencies ───────────────────────────────────────────────────
  {
    id: 'hz432',
    name: '432 Hz Harmonic Peace',
    category: 'solfeggio',
    carrierFreq: '432 Hz Pure Tone',
    description: 'Natural tuning resonance aligned with the Schumann harmonic wave.',
    benefit: 'Heart coherence, anxiety release & grounding',
    requiresHeadphones: false,
  },
  {
    id: 'hz528',
    name: '528 Hz Cellular Balance',
    category: 'solfeggio',
    carrierFreq: '528 Hz Miracle Tone',
    description: 'Ancient Solfeggio frequency of transformation, vitality, and inner equilibrium.',
    benefit: 'Cellular vitality, peace & restorative balance',
    requiresHeadphones: false,
  },
  {
    id: 'hz639',
    name: '639 Hz Compassion Tone',
    category: 'solfeggio',
    carrierFreq: '639 Hz Pure Tone',
    description: 'Harmonizes interpersonal connection, heart space empathy, and emotional serenity.',
    benefit: 'Emotional harmony & loving-kindness',
    requiresHeadphones: false,
  },

  // ─── Colored Noise ───────────────────────────────────────────────────────────
  {
    id: 'brown_noise',
    name: 'Velvet Brown Noise',
    category: 'noise',
    description: '1/f² Brownian noise with heavy low-frequency warm rumble, mimicking a distant waterfall.',
    benefit: 'Quiets racing thoughts & masks tinnitus',
    requiresHeadphones: false,
  },
  {
    id: 'pink_noise',
    name: 'Organic Pink Noise',
    category: 'noise',
    description: 'Balanced 1/f spectral density providing consistent, gentle soothing acoustic shielding.',
    benefit: 'Enhanced alpha brainwaves & stable sleep',
    requiresHeadphones: false,
  },
  {
    id: 'white_noise',
    name: 'Tranquil White Noise',
    category: 'noise',
    description: 'Uniform energy distribution across all audible frequencies for complete external acoustic blocking.',
    benefit: 'External sound masking & steady focus',
    requiresHeadphones: false,
  },

  // ─── Nature Soundscapes ─────────────────────────────────────────────────────
  {
    id: 'waves',
    name: 'Ocean Waves',
    category: 'nature',
    description: 'Rhythmic, gentle tidal swells that naturally sync with 5·5 coherent breathing.',
    benefit: 'Resonant HRV pacing & tidal calm',
    requiresHeadphones: false,
  },
  {
    id: 'breeze',
    name: 'Forest Breeze',
    category: 'nature',
    description: 'Soft whisper of wind through pine trees in an ancient Scandinavian birch forest.',
    benefit: 'Stress release & parasympathetic activation',
    requiresHeadphones: false,
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    category: 'nature',
    description: 'Soft rhythmic raindrops falling on mossy woodland flora.',
    benefit: 'Sensory cooling & peaceful presence',
    requiresHeadphones: false,
  },
  {
    id: 'birds',
    name: 'Chirping Birds',
    category: 'nature',
    description: 'Gentle morning dawn birdsong resonating at natural frequencies.',
    benefit: 'Uplifting morning clarity & alert presence',
    requiresHeadphones: false,
  },
  {
    id: 'silent',
    name: 'Silent Clarity',
    category: 'nature',
    description: 'Pure quiet mindfulness without audio stimuli.',
    benefit: 'Pure unassisted breath awareness',
    requiresHeadphones: false,
  },
];

class AmbientAudioService {
  private static instance: AmbientAudioService;
  private currentTrack: AmbientTrack = AMBIENT_CATALOG[0];
  private isPlayingState = false;
  private volume = 0.65;
  private webAudioCtx: any = null;
  private webGainNode: any = null;
  private webOsc1: any = null;
  private webOsc2: any = null;

  public static getInstance(): AmbientAudioService {
    if (!AmbientAudioService.instance) {
      AmbientAudioService.instance = new AmbientAudioService();
    }
    return AmbientAudioService.instance;
  }

  public getCatalog(): AmbientTrack[] {
    return AMBIENT_CATALOG;
  }

  public getCurrentTrack(): AmbientTrack {
    return this.currentTrack;
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public getVolume(): number {
    return this.volume;
  }

  public async setVolume(vol: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, vol));

    if (OdinAudioModule?.setVolume) {
      try {
        await OdinAudioModule.setVolume(this.volume);
      } catch {}
    }

    if (this.webGainNode) {
      try {
        this.webGainNode.gain.setValueAtTime(this.volume * 0.4, this.webAudioCtx.currentTime);
      } catch {}
    }
  }

  public async play(soundId: string, volume?: number): Promise<void> {
    const found = AMBIENT_CATALOG.find((t) => t.id === soundId) || AMBIENT_CATALOG[0];
    this.currentTrack = found;

    if (volume !== undefined) {
      this.volume = Math.max(0, Math.min(1, volume));
    }

    if (soundId === 'silent') {
      await this.stop();
      return;
    }

    this.isPlayingState = true;

    // 1. Try Native Android AudioTrack synthesis
    if (OdinAudioModule?.play) {
      try {
        await OdinAudioModule.play(soundId, this.volume);
        return;
      } catch (e) {
        console.log('[AmbientAudio] Native audio fallback:', e);
      }
    }

    // 2. Web / Fallback Synth using Web Audio API if available
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.startWebAudioSynth(found);
    }
  }

  public async stop(): Promise<void> {
    this.isPlayingState = false;

    if (OdinAudioModule?.stop) {
      try {
        await OdinAudioModule.stop();
      } catch {}
    }

    this.stopWebAudioSynth();
  }

  private startWebAudioSynth(track: AmbientTrack) {
    try {
      this.stopWebAudioSynth();
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.webAudioCtx = new AudioContextClass();
      this.webGainNode = this.webAudioCtx.createGain();
      this.webGainNode.gain.setValueAtTime(this.volume * 0.35, this.webAudioCtx.currentTime);
      this.webGainNode.connect(this.webAudioCtx.destination);

      let freq1 = 432;
      let freq2 = 432;

      if (track.id === 'gamma40') { freq1 = 200; freq2 = 240; }
      else if (track.id === 'alpha10') { freq1 = 200; freq2 = 210; }
      else if (track.id === 'theta6') { freq1 = 150; freq2 = 156; }
      else if (track.id === 'delta2') { freq1 = 100; freq2 = 102; }
      else if (track.id === 'hz432') { freq1 = 432; freq2 = 432; }
      else if (track.id === 'hz528') { freq1 = 528; freq2 = 528; }
      else if (track.id === 'hz639') { freq1 = 639; freq2 = 639; }

      this.webOsc1 = this.webAudioCtx.createOscillator();
      this.webOsc1.type = 'sine';
      this.webOsc1.frequency.setValueAtTime(freq1, this.webAudioCtx.currentTime);
      this.webOsc1.connect(this.webGainNode);
      this.webOsc1.start();

      if (track.requiresHeadphones) {
        this.webOsc2 = this.webAudioCtx.createOscillator();
        this.webOsc2.type = 'sine';
        this.webOsc2.frequency.setValueAtTime(freq2, this.webAudioCtx.currentTime);
        this.webOsc2.connect(this.webGainNode);
        this.webOsc2.start();
      }
    } catch (e) {
      console.log('[AmbientAudio] WebAudio error:', e);
    }
  }

  private stopWebAudioSynth() {
    try {
      if (this.webOsc1) {
        this.webOsc1.stop();
        this.webOsc1.disconnect();
        this.webOsc1 = null;
      }
      if (this.webOsc2) {
        this.webOsc2.stop();
        this.webOsc2.disconnect();
        this.webOsc2 = null;
      }
      if (this.webAudioCtx) {
        this.webAudioCtx.close();
        this.webAudioCtx = null;
      }
    } catch {}
  }
}

export const ambientAudioService = AmbientAudioService.getInstance();
