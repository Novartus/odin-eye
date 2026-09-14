import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type {
  ChatMessage,
  DedicatedAiCoachViewProps,
  MobilityRoutine,
} from '../../types';
import { localAiCoach } from '../../services/ai/localCoachEngine';
import { aiHealthService } from '../../services/ai/aiService';
import { credentialsStorage } from '../../services/storage/credentialsStorage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormattedMessage } from './FormattedMessage';
import { BouncingDotsLoader } from '../common/BouncingDotsLoader';
import { Colors } from '../../theme/colors';
import { VoiceCoachOverlay } from './VoiceCoachOverlay';
import { MobilityTimerModal } from '../body/MobilityTimerModal';
import { voiceCoachService } from '../../services/ai/voiceCoachService';
import { buildDynamicDeFatigueRoutine } from '../../services/mobility/mobilityCatalog';

export const DedicatedAiCoachView: React.FC<DedicatedAiCoachViewProps> = ({ data, recommendation }) => {
  const insets = useSafeAreaInsets();
  const tabBottomOffset = Math.max(insets.bottom + 10, 20);

  const [aiProvider, setAiProvider] = useState<'gemini_nano' | 'ondevice' | 'gemini' | 'openai'>('gemini_nano');
  const [isVoiceOverlayVisible, setIsVoiceOverlayVisible] = useState(false);
  const [isMobilityModalVisible, setIsMobilityModalVisible] = useState(false);
  const [activeMobilityRoutine, setActiveMobilityRoutine] = useState<MobilityRoutine | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  useEffect(() => {
    credentialsStorage.loadCredentials().then((creds) => {
      if (creds.aiProvider) {
        setAiProvider(creds.aiProvider);
      }
    });
  }, []);

  const welcomeText = data.recovery.recoveryScore > 0
    ? `Hey there! Great to see you today 😊\n\nI've got your live biometric telemetry synced. You're sitting at a **${data.recovery.recoveryScore}% Recovery score** today.\n\nHow are you feeling today? Are you thinking about hitting a workout, or would you like to review your recovery trends?`
    : `Hey there! Welcome to your on-device AI Wellness Coach 😊\n\nOnce you connect your wearable or Health Connect in Settings, I will analyze your recovery, sleep stages, and workout strain privately on your device.\n\nHow can I support your health and fitness goals today?`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'coach',
      text: welcomeText,
      timestamp: new Date().toISOString(),
      dataPointsReferenced: ['Android AICore (Gemini Nano)', 'On-Device NPU'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const inputBottomMargin = isKeyboardOpen ? 8 : tabBottomOffset + 64;

  // Auto-scroll to bottom whenever messages change or when thinking state changes
  const scrollToBottom = (animated = true) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated });
    }, 60);
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isThinking]);

  // Synchronous, responsive keyboard shift for Android and iOS
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setIsKeyboardOpen(true);
      const height = e.endCoordinates.height;
      Animated.timing(keyboardOffset, {
        toValue: height,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 100,
        useNativeDriver: false,
      }).start(() => {
        scrollToBottom(true);
      });
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      setIsKeyboardOpen(false);
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 100,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleToggleSpeak = async (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      await voiceCoachService.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      await voiceCoachService.speak(
        text,
        () => {},
        () => setSpeakingMsgId(null),
        () => setSpeakingMsgId(null)
      );
    }
  };

  const handleAsk = async (query: string) => {
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsThinking(true);
    scrollToBottom(true);

    try {
      const reply = await aiHealthService.generateResponse(query, data, newHistory);
      setMessages((prev) => [...prev, reply]);

      if (voiceCoachService.getAutoReadAloud()) {
        setSpeakingMsgId(reply.id);
        voiceCoachService.speak(
          reply.text,
          () => {},
          () => setSpeakingMsgId(null),
          () => setSpeakingMsgId(null)
        );
      }
    } catch {
      const fallback = localAiCoach.answerUserQuery(query, data, newHistory);
      setMessages((prev) => [...prev, fallback]);

      if (voiceCoachService.getAutoReadAloud()) {
        setSpeakingMsgId(fallback.id);
        voiceCoachService.speak(
          fallback.text,
          () => {},
          () => setSpeakingMsgId(null),
          () => setSpeakingMsgId(null)
        );
      }
    } finally {
      setIsThinking(false);
      scrollToBottom(true);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const q = inputText;
    setInputText('');
    handleAsk(q);
  };

  return (
    <Animated.View style={[styles.wrapper, { paddingBottom: keyboardOffset }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onContentSizeChange={() => scrollToBottom(true)}
      >
        {/* Top Intelligence Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <View
              style={[
                styles.dot,
                aiProvider === 'gemini_nano'
                  ? { backgroundColor: '#10B981' }
                  : aiProvider === 'gemini'
                    ? { backgroundColor: '#007AFF' }
                    : {},
              ]}
            />
            <Text style={styles.bannerTitle}>
              {aiProvider === 'gemini_nano'
                ? 'Android AICore (Gemini Nano)'
                : aiProvider === 'gemini'
                  ? 'Google Gemini 1.5 Flash'
                  : aiProvider === 'openai'
                    ? 'OpenAI GPT-4o-mini'
                    : 'On-Device NPU Local AI'}
            </Text>
          </View>
          <Text style={styles.bannerLatency}>
            {aiProvider === 'gemini_nano'
              ? 'On-Device NPU • 100% Private'
              : aiProvider === 'ondevice'
                ? '100% Private • ~14ms'
                : 'Grounded Live LLM'}
          </Text>
        </View>

        {/* Compact Daily Action Card */}
        <View style={styles.prescriptionCard}>
          <View style={styles.prescripTop}>
            <Text style={styles.prescripLabel}>TODAY'S PRESCRIPTION</Text>
            <Text style={styles.prescripScore}>{data.recovery.recoveryScore}% Recovery</Text>
          </View>
          <Text style={styles.prescripHead}>{recommendation.headline}</Text>

          <View style={styles.actionItems}>
            {recommendation.actionItems.slice(0, 2).map((item, idx) => (
              <View key={idx} style={styles.actionRow}>
                <Text style={styles.bullet}>⚡</Text>
                <Text style={styles.actionItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Prompts Chips */}
        <Text style={styles.sectionHeader}>EXPLORE BIOMETRICS, SCIENCE & MEDICATIONS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalChipsScroll}
          contentContainerStyle={styles.horizontalChipsContent}
        >
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('Can I lift heavy and push progressive overload today?')}>
            <Text style={styles.chipText}>🏋️ Lift Heavy?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('What is my optimal caffeine cutoff time for deep sleep tonight?')}>
            <Text style={styles.chipText}>☕ Caffeine Cutoff</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('Which muscles are currently in their 48-72h recovery window?')}>
            <Text style={styles.chipText}>⏱️ Muscle Recovery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('How did my sleep stages look last night?')}>
            <Text style={styles.chipText}>🌙 Sleep Hypnogram</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('Have I taken all my scheduled medications today?')}>
            <Text style={styles.chipText}>💊 Medication Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('What AI model and hardware acceleration is running on this device?')}>
            <Text style={styles.chipText}>🧠 On-Device Specs</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Chat Messages */}
        <View style={styles.messagesList}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const hasMobilityMention = !isUser && (
              m.text.toLowerCase().includes('mobility') ||
              m.text.toLowerCase().includes('stretching') ||
              m.text.toLowerCase().includes('stretch')
            );

            return (
              <View
                key={m.id}
                style={[styles.msgBox, isUser ? styles.userMsg : styles.coachMsg]}
              >
                {!isUser && (
                  <View style={styles.coachHeader}>
                    <View style={styles.coachHeaderLeft}>
                      <Text style={styles.coachAvatar}>🧠</Text>
                      <Text style={styles.coachLabel}>OdinEye AI Coach</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggleSpeak(m.id, m.text)}
                      style={[styles.speakIconBtn, speakingMsgId === m.id && styles.speakIconBtnActive]}
                      activeOpacity={0.7}
                    >
                      <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        {speakingMsgId === m.id ? (
                          <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="#1F382E" />
                        ) : (
                          <Path
                            d="M11 5L6 9H2v6h4l5 4V5zm4.5 3c.8 1 1.3 2.4 1.3 4s-.5 3-1.3 4"
                            stroke="#63706B"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </Svg>
                    </TouchableOpacity>
                  </View>
                )}
                <FormattedMessage text={m.text} isUser={isUser} />

                {hasMobilityMention && (
                  <TouchableOpacity
                    style={styles.mobilityActionPill}
                    onPress={() => {
                      const fatigued = data.strength.muscleStatuses
                        .filter((ms) => ms.state === 'fatigued')
                        .map((ms) => ms.muscle);
                      const routine = buildDynamicDeFatigueRoutine(fatigued);
                      setActiveMobilityRoutine(routine);
                      setIsMobilityModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path d="M5 3l14 9-14 9V3z" fill="#1F382E" />
                    </Svg>
                    <Text style={styles.mobilityActionPillText}>Start Guided Mobility Flow</Text>
                  </TouchableOpacity>
                )}

                {m.dataPointsReferenced && m.dataPointsReferenced.length > 0 && (
                  <View style={styles.refContainer}>
                    <Text style={styles.refTitle}>Sources verified:</Text>
                    <View style={styles.sourcesRow}>
                      {m.dataPointsReferenced.map((r, i) => (
                        <View key={i} style={styles.sourcePill}>
                          <Text style={styles.sourcePillText}>{r}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {isThinking && (
            <BouncingDotsLoader
              statusText={
                aiProvider === 'gemini_nano'
                  ? 'Thinking... (Android AICore)'
                  : aiProvider === 'gemini'
                    ? 'Thinking... (Gemini 1.5 Flash)'
                    : aiProvider === 'openai'
                      ? 'Thinking... (GPT-4o-mini)'
                      : 'Synthesizing biometrics on-device...'
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Input Capsule */}
      <View style={[styles.inputCapsuleWrapper, { marginBottom: inputBottomMargin }]}>
        <View style={styles.inputCapsule}>
          <TouchableOpacity
            style={styles.micInputBtn}
            onPress={() => setIsVoiceOverlayVisible(true)}
            activeOpacity={0.7}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"
                fill="#1F382E"
              />
              <Path
                d="M19 10v2a7 7 0 01-14 0v-2M12 19v3m-4 0h8"
                stroke="#1F382E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ask or tap mic to speak..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice Assistant Sheet */}
      <VoiceCoachOverlay
        visible={isVoiceOverlayVisible}
        onClose={() => setIsVoiceOverlayVisible(false)}
        onSpeechSubmit={(voiceQuery) => {
          handleAsk(voiceQuery);
        }}
        isProcessing={isThinking}
      />

      {/* Guided Mobility Timer Modal */}
      {activeMobilityRoutine && (
        <MobilityTimerModal
          visible={isMobilityModalVisible}
          onClose={() => setIsMobilityModalVisible(false)}
          routine={activeMobilityRoutine}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  bannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bannerLatency: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  prescriptionCard: {
    backgroundColor: '#EDE8F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(94, 78, 138, 0.08)',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#5E4E8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  prescripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  prescripLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5E4E8A',
    letterSpacing: 0.8,
  },
  prescripScore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C4A3E',
  },
  prescripHead: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1A29',
    marginBottom: 10,
    lineHeight: 18,
  },
  actionItems: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(94, 78, 138, 0.12)',
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 12,
  },
  actionItemText: {
    fontSize: 12,
    color: '#524B6F',
    flex: 1,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  horizontalChipsScroll: {
    marginBottom: 16,
    marginHorizontal: -4,
  },
  horizontalChipsContent: {
    paddingHorizontal: 4,
    gap: 8,
    flexDirection: 'row',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#EAF2EE',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C4A3E',
  },
  messagesList: {
    gap: 12,
  },
  msgBox: {
    borderRadius: 18,
    padding: 14,
  },
  userMsg: {
    backgroundColor: '#1A1D1C',
    alignSelf: 'flex-end',
    maxWidth: '85%',
    shadowColor: '#1A1D1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  coachMsg: {
    backgroundColor: '#F4F7F5',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    alignSelf: 'flex-start',
    width: '100%',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  coachHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakIconBtnActive: {
    backgroundColor: '#CCE6DE',
  },
  mobilityActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCE6DE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.1)',
  },
  mobilityActionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F382E',
  },
  micInputBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatar: {
    fontSize: 14,
  },
  coachLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentBlue,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  coachText: {
    color: Colors.textPrimary,
  },
  refContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  refTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sourcePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sourcePillText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  thinkingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignSelf: 'flex-start',
  },
  thinkingText: {
    fontSize: 12,
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  inputCapsuleWrapper: {
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  inputCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7F5',
    borderRadius: 26,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.1)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    color: Colors.textPrimary,
    fontSize: 13,
    backgroundColor: 'transparent',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1D1C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1D1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
});
