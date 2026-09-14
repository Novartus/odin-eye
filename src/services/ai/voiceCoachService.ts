// OdinEye Voice Coach Service
// On-device speech recognition & speech synthesis coordinator
// 100% private on-device execution with zero cloud transmission

import { NativeModules, NativeEventEmitter, Platform, PermissionsAndroid } from 'react-native';

const { OdinEyeVoiceModule } = NativeModules;

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface VoiceRecognitionHandlers {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: string) => void;
  onRms?: (rms: number) => void;
}

export class VoiceCoachService {
  private static instance: VoiceCoachService;
  private eventEmitter: NativeEventEmitter | null = null;
  private currentVoiceState: VoiceState = 'idle';
  private autoReadAloud = false;
  private isNativeModuleAvailable = false;
  private activeSubscriptions: { remove: () => void }[] = [];

  public static getInstance(): VoiceCoachService {
    if (!VoiceCoachService.instance) {
      VoiceCoachService.instance = new VoiceCoachService();
    }
    return VoiceCoachService.instance;
  }

  private constructor() {
    this.isNativeModuleAvailable = Platform.OS === 'android' && !!OdinEyeVoiceModule;
    if (this.isNativeModuleAvailable) {
      try {
        this.eventEmitter = new NativeEventEmitter(OdinEyeVoiceModule);
      } catch (e) {
        console.warn('Could not initialize NativeEventEmitter for OdinEyeVoiceModule:', e);
      }
    }
  }

  public isAvailable(): boolean {
    return this.isNativeModuleAvailable;
  }

  public getVoiceState(): VoiceState {
    return this.currentVoiceState;
  }

  public getAutoReadAloud(): boolean {
    return this.autoReadAloud;
  }

  public setAutoReadAloud(enabled: boolean): void {
    this.autoReadAloud = enabled;
  }

  // Check if microphone permission is granted
  public async hasMicPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      if (this.isNativeModuleAvailable && typeof OdinEyeVoiceModule.hasPermission === 'function') {
        const has = await OdinEyeVoiceModule.hasPermission();
        if (has) return true;
      }
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    } catch {
      return false;
    }
  }

  // Prompt the user for microphone runtime permission
  public async requestMicPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission for Voice Coach',
          message:
            'OdinEye needs microphone access for hands-free on-device voice coaching. Your speech is processed 100% locally and never leaves your device.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Microphone permission request error:', err);
      return false;
    }
  }

  // Start on-device speech recognition
  public async startListening(handlers: VoiceRecognitionHandlers): Promise<boolean> {
    this.clearSubscriptions();

    // Verify or request runtime microphone permission
    const hasPerm = await this.hasMicPermission();
    if (!hasPerm) {
      const granted = await this.requestMicPermission();
      if (!granted) {
        handlers.onError?.('Microphone permission required for voice coach. Please tap Allow when prompted.');
        return false;
      }
    }

    this.currentVoiceState = 'listening';

    if (this.isNativeModuleAvailable && this.eventEmitter) {
      try {
        const subPartial = this.eventEmitter.addListener('onSpeechPartial', (e: { text?: string }) => {
          if (e?.text && handlers.onPartial) {
            handlers.onPartial(e.text);
          }
        });

        const subResult = this.eventEmitter.addListener('onSpeechResult', (e: { text?: string }) => {
          this.currentVoiceState = 'processing';
          if (e?.text && e.text.trim() && handlers.onFinal) {
            handlers.onFinal(e.text.trim());
          }
        });

        const subRms = this.eventEmitter.addListener('onSpeechRms', (e: { rms?: number }) => {
          if (typeof e?.rms === 'number' && handlers.onRms) {
            handlers.onRms(e.rms);
          }
        });

        const subError = this.eventEmitter.addListener('onSpeechError', (e: { message?: string }) => {
          this.currentVoiceState = 'idle';
          if (handlers.onError) {
            handlers.onError(e?.message || 'Speech recognition failed');
          }
        });

        this.activeSubscriptions.push(subPartial, subResult, subRms, subError);
        await OdinEyeVoiceModule.startListening();
        return true;
      } catch (err: any) {
        this.currentVoiceState = 'idle';
        if (handlers.onError) {
          handlers.onError(err?.message || 'Could not start speech recognition');
        }
        return false;
      }
    }

    // Web / Fallback simulation for dev previews
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      try {
        const SpeechRec = (window as any).webkitSpeechRecognition;
        const recognizer = new SpeechRec();
        recognizer.continuous = false;
        recognizer.interimResults = true;

        recognizer.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          const isFinal = event.results[0].isFinal;
          if (isFinal) {
            this.currentVoiceState = 'processing';
            handlers.onFinal?.(transcript);
          } else {
            handlers.onPartial?.(transcript);
          }
        };

        recognizer.onerror = (event: any) => {
          this.currentVoiceState = 'idle';
          handlers.onError?.(event.error);
        };

        recognizer.start();
        return true;
      } catch {
        this.currentVoiceState = 'idle';
        return false;
      }
    }

    // If native module is unavailable (e.g. running in Expo Go client without custom native build)
    this.currentVoiceState = 'idle';
    handlers.onError?.(
      'On-device speech recognition requires a native build (npm run android). In Expo Go, tap the input box and use your keyboard microphone to dictate.'
    );
    return false;
  }

  // Stop on-device speech recognition
  public async stopListening(): Promise<void> {
    if (this.currentVoiceState === 'listening') {
      this.currentVoiceState = 'processing';
    }
    if (this.isNativeModuleAvailable) {
      try {
        await OdinEyeVoiceModule.stopListening();
      } catch (e) {
        console.warn('Error stopping speech recognizer:', e);
      }
    }
    this.clearSubscriptions();
  }

  // Speak coach message out loud via on-device TTS
  public async speak(
    text: string,
    onStart?: () => void,
    onDone?: () => void,
    onError?: (err: string) => void
  ): Promise<boolean> {
    // Clean markdown asterisks and URLs from spoken text
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanText) return false;

    this.currentVoiceState = 'speaking';

    if (this.isNativeModuleAvailable && this.eventEmitter) {
      try {
        const subStart = this.eventEmitter.addListener('onTtsStart', () => {
          onStart?.();
        });
        const subDone = this.eventEmitter.addListener('onTtsDone', () => {
          this.currentVoiceState = 'idle';
          onDone?.();
        });
        const subErr = this.eventEmitter.addListener('onTtsError', () => {
          this.currentVoiceState = 'idle';
          onError?.('TTS speech synthesis error');
        });

        this.activeSubscriptions.push(subStart, subDone, subErr);
        await OdinEyeVoiceModule.speak(cleanText);
        return true;
      } catch (err: any) {
        this.currentVoiceState = 'idle';
        onError?.(err?.message || 'Could not speak text');
        return false;
      }
    }

    // Web SpeechSynthesis fallback
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => onStart?.();
        utterance.onend = () => {
          this.currentVoiceState = 'idle';
          onDone?.();
        };
        utterance.onerror = (e) => {
          this.currentVoiceState = 'idle';
          onError?.(e.error);
        };
        window.speechSynthesis.speak(utterance);
        return true;
      } catch {
        this.currentVoiceState = 'idle';
        return false;
      }
    }

    this.currentVoiceState = 'idle';
    return false;
  }

  // Stop active speech playback
  public async stopSpeaking(): Promise<void> {
    this.currentVoiceState = 'idle';
    if (this.isNativeModuleAvailable) {
      try {
        await OdinEyeVoiceModule.stopSpeaking();
      } catch (e) {
        console.warn('Error stopping TTS:', e);
      }
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public async isSpeaking(): Promise<boolean> {
    if (this.isNativeModuleAvailable) {
      try {
        return await OdinEyeVoiceModule.isSpeaking();
      } catch {
        return false;
      }
    }
    return this.currentVoiceState === 'speaking';
  }

  private clearSubscriptions(): void {
    this.activeSubscriptions.forEach((sub) => {
      try {
        sub.remove();
      } catch {}
    });
    this.activeSubscriptions = [];
  }
}

export const voiceCoachService = VoiceCoachService.getInstance();
