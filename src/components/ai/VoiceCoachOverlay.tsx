import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  TextInput,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VoiceCoachOverlayProps } from '../../types';
import { voiceCoachService } from '../../services/ai/voiceCoachService';

const QUICK_VOICE_QUERIES = [
  'Can I train heavy today?',
  'Check my recovery and sleep',
  'Start mobility flow for sore muscles',
  'What is my caffeine cutoff time?',
];

export const VoiceCoachOverlay: React.FC<VoiceCoachOverlayProps> = ({
  visible,
  onClose,
  onSpeechSubmit,
  isProcessing = false,
}) => {
  const insets = useSafeAreaInsets();
  const textInputRef = useRef<TextInput>(null);
  const isNativeAvailable = voiceCoachService.isAvailable();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoReadAloud, setAutoReadAloud] = useState(voiceCoachService.getAutoReadAloud());

  // Wave ripple and sound level animations (100% native driver for 60fps & zero JS bridge overhead)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const barAnim1 = useRef(new Animated.Value(0.3)).current;
  const barAnim2 = useRef(new Animated.Value(0.5)).current;
  const barAnim3 = useRef(new Animated.Value(0.8)).current;
  const barAnim4 = useRef(new Animated.Value(0.4)).current;
  const barAnim5 = useRef(new Animated.Value(0.2)).current;

  const orbAnimLoop = useRef<Animated.CompositeAnimation | null>(null);
  const eqAnimLoop1 = useRef<Animated.CompositeAnimation | null>(null);
  const eqAnimLoop2 = useRef<Animated.CompositeAnimation | null>(null);
  const eqAnimLoop3 = useRef<Animated.CompositeAnimation | null>(null);
  const eqAnimLoop4 = useRef<Animated.CompositeAnimation | null>(null);
  const eqAnimLoop5 = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      setTranscript('');
      setErrorMessage(null);
      checkAndInitSession();

      // Continuous pulsating orb loop (Native Driver)
      orbAnimLoop.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.12,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1.0,
              duration: 900,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(rippleAnim, {
              toValue: 1,
              duration: 1300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rippleAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      orbAnimLoop.current.start();
    } else {
      orbAnimLoop.current?.stop();
      stopEqualizerLoop();
      stopListeningSession();
    }

    return () => {
      orbAnimLoop.current?.stop();
      stopEqualizerLoop();
    };
  }, [visible]);

  // Synchronize equalizer animation strictly to listening state
  useEffect(() => {
    if (isListening && visible) {
      startEqualizerLoop();
    } else {
      stopEqualizerLoop();
    }
  }, [isListening, visible]);

  const startEqualizerLoop = () => {
    const animateBar = (anim: Animated.Value, min: number, max: number, duration: number) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: max,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: min,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return loop;
    };

    stopEqualizerLoop();
    eqAnimLoop1.current = animateBar(barAnim1, 0.25, 0.9, 280);
    eqAnimLoop2.current = animateBar(barAnim2, 0.35, 1.0, 340);
    eqAnimLoop3.current = animateBar(barAnim3, 0.45, 1.15, 260);
    eqAnimLoop4.current = animateBar(barAnim4, 0.3, 0.95, 310);
    eqAnimLoop5.current = animateBar(barAnim5, 0.25, 0.75, 290);
  };

  const stopEqualizerLoop = () => {
    eqAnimLoop1.current?.stop();
    eqAnimLoop2.current?.stop();
    eqAnimLoop3.current?.stop();
    eqAnimLoop4.current?.stop();
    eqAnimLoop5.current?.stop();
  };

  const checkAndInitSession = async () => {
    if (!isNativeAvailable) {
      setIsListening(false);
      return;
    }

    const granted = await voiceCoachService.hasMicPermission();
    setHasPermission(granted);

    if (granted) {
      startListeningSession();
    }
  };

  const handleGrantPermission = async () => {
    if (!isNativeAvailable) {
      textInputRef.current?.focus();
      return;
    }

    const granted = await voiceCoachService.requestMicPermission();
    setHasPermission(granted);
    if (granted) {
      setErrorMessage(null);
      startListeningSession();
    } else {
      setErrorMessage('Microphone access was denied. Please allow microphone permissions in Android Settings.');
    }
  };

  const startListeningSession = async () => {
    if (!isNativeAvailable) {
      textInputRef.current?.focus();
      return;
    }

    setIsListening(true);
    setErrorMessage(null);

    const started = await voiceCoachService.startListening({
      onPartial: (text) => {
        if (text && text.trim()) {
          setTranscript(text);
        }
      },
      onFinal: (text) => {
        if (text && text.trim()) {
          setTranscript(text);
        }
        setIsListening(false);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onRms: (_rms) => {
        // Audio volume fluctuation
      },
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const stopListeningSession = async () => {
    setIsListening(false);
    await voiceCoachService.stopListening();
  };

  const handleMicPress = () => {
    if (!isNativeAvailable) {
      // In Expo Go, tapping mic directly focuses input for keyboard dictation
      textInputRef.current?.focus();
      return;
    }

    if (!hasPermission) {
      handleGrantPermission();
      return;
    }

    if (isListening) {
      stopListeningSession();
    } else {
      startListeningSession();
    }
  };

  const handleToggleAutoRead = () => {
    const next = !autoReadAloud;
    setAutoReadAloud(next);
    voiceCoachService.setAutoReadAloud(next);
  };

  const handleSelectPrompt = (q: string) => {
    setTranscript(q);
    setErrorMessage(null);
    if (isListening) {
      stopListeningSession();
    }
  };

  const handleSubmit = (queryToSubmit?: string) => {
    const textToSend = queryToSubmit || transcript;
    if (!textToSend.trim()) return;

    stopListeningSession();
    onClose();
    onSpeechSubmit(textToSend.trim());
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.privacyBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.privacyBadgeText}>100% ON-DEVICE SPEECH · ZERO CLOUD</Text>
              </View>
              <Text style={styles.title}>Voice AI Coach</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#63706B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Expo Go Runtime Notice */}
          {!isNativeAvailable && (
            <View style={styles.expoGoBanner}>
              <View style={styles.expoGoBadgeRow}>
                <View style={styles.expoGoBadge}>
                  <Text style={styles.expoGoBadgeText}>EXPO GO RUNTIME</Text>
                </View>
                <Text style={styles.expoGoSubBadge}>Custom Kotlin Engine Not Linked</Text>
              </View>
              <Text style={styles.expoGoText}>
                Expo Go cannot run custom native Kotlin modules. To speak in Expo Go, tap below to dictate using your mobile keyboard's microphone, or compile the standalone app via <Text style={styles.codeText}>npm run android</Text>.
              </Text>
              <TouchableOpacity
                style={styles.dictateActionBtn}
                onPress={() => textInputRef.current?.focus()}
                activeOpacity={0.8}
              >
                <Text style={styles.dictateActionText}>🎙️ Tap Here to Dictate via Keyboard Mic</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Missing Permission Warning Banner */}
          {hasPermission === false && (
            <View style={styles.permissionCard}>
              <View style={styles.permissionIconCircle}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"
                    stroke="#8C481A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M19 10v2a7 7 0 01-14 0v-2M12 19v3m-4 0h8"
                    stroke="#8C481A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.permissionContent}>
                <Text style={styles.permissionHead}>Microphone Permission Needed</Text>
                <Text style={styles.permissionSub}>
                  OdinEye transcribes voice 100% offline on your phone without sending any audio to the cloud.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.grantBtn}
                onPress={handleGrantPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.grantBtnText}>Allow</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              <TouchableOpacity onPress={startListeningSession} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Animated Microphone & Soundwave Equalizer */}
          <View style={styles.radarContainer}>
            {/* Outer Ripple */}
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  opacity: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 0],
                  }),
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.6],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Pulsating Orb */}
            <TouchableOpacity onPress={handleMicPress} activeOpacity={0.85}>
              <Animated.View
                style={[
                  styles.micOrb,
                  isListening ? styles.micOrbActive : styles.micOrbIdle,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"
                    fill={isListening ? '#1F382E' : '#63706B'}
                  />
                  <Path
                    d="M19 10v2a7 7 0 01-14 0v-2M12 19v3m-4 0h8"
                    stroke={isListening ? '#1F382E' : '#63706B'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Animated.View>
            </TouchableOpacity>

            {/* Live Audio Equalizer Bars */}
            {isListening && (
              <View style={styles.equalizerContainer}>
                <Animated.View style={[styles.eqBar, { transform: [{ scaleY: barAnim1 }] }]} />
                <Animated.View style={[styles.eqBar, { transform: [{ scaleY: barAnim2 }] }]} />
                <Animated.View style={[styles.eqBar, { transform: [{ scaleY: barAnim3 }] }]} />
                <Animated.View style={[styles.eqBar, { transform: [{ scaleY: barAnim4 }] }]} />
                <Animated.View style={[styles.eqBar, { transform: [{ scaleY: barAnim5 }] }]} />
              </View>
            )}

            <Text style={styles.statusLabel}>
              {isProcessing
                ? 'Synthesizing with on-device sports science...'
                : isListening
                ? 'Listening... speak clearly'
                : !isNativeAvailable
                ? 'Tap mic or input box below to speak / type'
                : transcript
                ? 'Speech captured! Tap "Ask Coach" to submit'
                : 'Tap microphone to speak'}
            </Text>
          </View>

          {/* DEDICATED LIVE TRANSCRIBE BOX */}
          <View style={styles.transcribeCard}>
            <View style={styles.transcribeHeader}>
              <View style={styles.transcribeStatusPill}>
                <View
                  style={[
                    styles.transcribeDot,
                    isListening ? styles.transcribeDotLive : styles.transcribeDotIdle,
                  ]}
                />
                <Text style={styles.transcribeStatusText}>
                  {isListening
                    ? 'LIVE TRANSCRIBING...'
                    : transcript
                    ? 'TRANSCRIPTION READY'
                    : 'READY TO LISTEN'}
                </Text>
              </View>

              <View style={styles.headerRightActions}>
                {isListening && (
                  <TouchableOpacity
                    onPress={stopListeningSession}
                    activeOpacity={0.7}
                    style={styles.doneSpeakingBtn}
                  >
                    <Text style={styles.doneSpeakingText}>Done Speaking ✓</Text>
                  </TouchableOpacity>
                )}

                {transcript ? (
                  <TouchableOpacity
                    onPress={() => setTranscript('')}
                    activeOpacity={0.7}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearText}>Clear</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Editable or Streamed Transcribe Input */}
            <View style={styles.transcriptInputWrapper}>
              <TextInput
                ref={textInputRef}
                style={styles.transcriptInput}
                value={transcript}
                onChangeText={(text) => {
                  setTranscript(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  isListening
                    ? 'Listening... say something like "How is my recovery?"'
                    : !isNativeAvailable
                    ? 'Tap to dictate with keyboard mic or type...'
                    : 'Tap microphone to speak, or tap here to type / edit...'
                }
                placeholderTextColor="#94A39D"
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />
            </View>

            {transcript.trim() ? (
              <TouchableOpacity
                style={styles.submitImmediateBtn}
                onPress={() => handleSubmit()}
                activeOpacity={0.85}
              >
                <Text style={styles.submitImmediateBtnText}>Ask Coach Now →</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyPromptHint}>
                <Text style={styles.emptyPromptHintText}>
                  {isListening
                    ? '🎙️ Speaking clearly into mic...'
                    : '💡 Tap mic above, type query, or select a prompt below:'}
                </Text>
              </View>
            )}
          </View>

          {/* Suggested Hands-Free Prompts */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsHeader}>OR TAP TO POPULATE TRANSCRIBE</Text>
            <View style={styles.chipsRow}>
              {QUICK_VOICE_QUERIES.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.chip}
                  onPress={() => handleSelectPrompt(q)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Settings Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.readAloudToggle}
              onPress={handleToggleAutoRead}
              activeOpacity={0.7}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M11 5L6 9H2v6h4l5 4V5zm4.5 3c.8 1 1.3 2.4 1.3 4s-.5 3-1.3 4"
                  stroke={autoReadAloud ? '#237A5D' : '#94A39D'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={[styles.readAloudText, autoReadAloud && styles.readAloudTextActive]}>
                Read Answers Aloud: {autoReadAloud ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.secureOfflineText}>🔒 Offline Processing</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 22, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  privacyBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1F382E',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#141816',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expoGoBanner: {
    backgroundColor: '#F3F6F4',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8E2DC',
  },
  expoGoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  expoGoBadge: {
    backgroundColor: '#2D3748',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expoGoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  expoGoSubBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#718096',
  },
  expoGoText: {
    fontSize: 11,
    color: '#4A5568',
    lineHeight: 16,
    marginBottom: 8,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#1F382E',
  },
  dictateActionBtn: {
    backgroundColor: '#1F382E',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  dictateActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EE',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(224, 122, 95, 0.3)',
    marginBottom: 12,
    gap: 10,
  },
  permissionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FCE7DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContent: {
    flex: 1,
  },
  permissionHead: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8C481A',
  },
  permissionSub: {
    fontSize: 10,
    color: '#63706B',
    lineHeight: 14,
    marginTop: 2,
  },
  grantBtn: {
    backgroundColor: '#1F382E',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  rippleRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#CCE6DE',
  },
  micOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
  },
  micOrbActive: {
    backgroundColor: '#CCE6DE',
    borderWidth: 3,
    borderColor: '#237A5D',
  },
  micOrbIdle: {
    backgroundColor: '#EAF2EE',
    borderWidth: 2,
    borderColor: '#CAD7D2',
  },
  equalizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 44,
    marginTop: 8,
  },
  eqBar: {
    width: 4,
    height: 28,
    backgroundColor: '#237A5D',
    borderRadius: 2,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#63706B',
    marginTop: 8,
  },
  transcribeCard: {
    backgroundColor: '#F8FAFA',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E1ECE6',
    marginBottom: 14,
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  transcribeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcribeStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1ECE6',
    gap: 5,
  },
  transcribeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  transcribeDotLive: {
    backgroundColor: '#EF4444',
  },
  transcribeDotIdle: {
    backgroundColor: '#10B981',
  },
  transcribeStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1F382E',
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doneSpeakingBtn: {
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  doneSpeakingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#237A5D',
  },
  clearBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#63706B',
  },
  transcriptInputWrapper: {
    minHeight: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1ECE6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  transcriptInput: {
    fontSize: 15,
    fontWeight: '600',
    color: '#141816',
    lineHeight: 21,
    padding: 0,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  emptyPromptHint: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  emptyPromptHintText: {
    fontSize: 11,
    color: '#718079',
    fontWeight: '500',
  },
  submitImmediateBtn: {
    backgroundColor: '#1F382E',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitImmediateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionsContainer: {
    marginBottom: 14,
  },
  suggestionsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A39D',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: '#EAF2EE',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F382E',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  },
  readAloudToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  readAloudText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#63706B',
  },
  readAloudTextActive: {
    color: '#237A5D',
    fontWeight: '700',
  },
  secureOfflineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#63706B',
  },
});
