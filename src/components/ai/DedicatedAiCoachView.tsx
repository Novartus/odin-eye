import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Platform,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { TriPillarHealthSummary } from '../../types/health';
import { ChatMessage, AiCoachRecommendation } from '../../types/aiCoach';
import { localAiCoach } from '../../services/ai/localCoachEngine';
import { aiHealthService } from '../../services/ai/aiService';
import { credentialsStorage } from '../../services/storage/credentialsStorage';
import { FormattedMessage } from './FormattedMessage';
import { Colors } from '../../theme/colors';

interface DedicatedAiCoachViewProps {
  data: TriPillarHealthSummary;
  recommendation: AiCoachRecommendation;
}

export const DedicatedAiCoachView: React.FC<DedicatedAiCoachViewProps> = ({ data, recommendation }) => {
  const rawVolumeKg = data.strength.todayWorkout?.totalVolumeKg || data.strength.weeklyVolumeKg || 0;
  const volumeTons = rawVolumeKg > 0 ? (rawVolumeKg / 1000).toFixed(1) : '0.0';
  const fatiguedNames = data.strength.muscleStatuses
    .filter((m) => m.state === 'fatigued')
    .map((m) => m.displayName)
    .join(' & ');

  const [aiProvider, setAiProvider] = useState<'gemini_nano' | 'ondevice' | 'gemini' | 'openai'>('gemini_nano');

  useEffect(() => {
    credentialsStorage.loadCredentials().then((creds) => {
      if (creds.aiProvider) {
        setAiProvider(creds.aiProvider);
      }
    });
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'coach',
      text: `Hey there! Great to see you today 😊\n\nI've got your live Ring AIR, Health Connect, and Hevy telemetry synced. You're sitting at a **${data.recovery.recoveryScore}% Recovery score** today with all your muscle groups **100% primed** and ready for action (zero fatigue debt).\n\nHow are you feeling today? Are you thinking about hitting a workout, or would you like to review your recovery trends?`,
      timestamp: new Date().toISOString(),
      dataPointsReferenced: ['Android AICore (Gemini Nano)', 'On-Device NPU', 'Ultrahuman', 'Health Connect', 'Hevy'],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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
    } catch {
      const fallback = localAiCoach.answerUserQuery(query, data, newHistory);
      setMessages((prev) => [...prev, fallback]);
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
        <Text style={styles.sectionHeader}>QUICK TELEMETRY, SCIENCE & MEDS</Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('Can I lift heavy today?')}>
            <Text style={styles.chipText}>Can I lift heavy?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('Benefits of coffee')}>
            <Text style={styles.chipText}>Benefits of coffee ☕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('What is my caffeine cutoff?')}>
            <Text style={styles.chipText}>Caffeine cutoff?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('Check my active medication schedule and today’s adherence.')}>
            <Text style={styles.chipText}>💊 Med Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chip} onPress={() => handleAsk('Are there any timing or workout interactions with my current medications?')}>
            <Text style={styles.chipText}>💊 Meds & Workouts</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        <View style={styles.messagesList}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <View
                key={m.id}
                style={[styles.msgBox, isUser ? styles.userMsg : styles.coachMsg]}
              >
                {!isUser && (
                  <View style={styles.coachHeader}>
                    <Text style={styles.coachAvatar}>🧠</Text>
                    <Text style={styles.coachLabel}>OdinEye AI Coach</Text>
                  </View>
                )}
                <FormattedMessage text={m.text} isUser={isUser} />

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
            <View style={styles.thinkingBox}>
              <ActivityIndicator size="small" color={Colors.accentBlue} />
              <Text style={styles.thinkingText}>
                {aiProvider === 'gemini_nano'
                  ? 'Synthesizing via Android AICore (Gemini Nano)...'
                  : aiProvider === 'gemini'
                  ? 'Generating response with Gemini 1.5 Flash...'
                  : aiProvider === 'openai'
                  ? 'Generating response with GPT-4o-mini...'
                  : 'Synthesizing biometrics on-device...'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Input Capsule (Floats seamlessly above bottom navigation dock) */}
      <View style={[styles.inputCapsuleWrapper, { marginBottom: isKeyboardOpen ? 8 : 88 }]}>
        <View style={styles.inputCapsule}>
          <TextInput
            style={styles.input}
            placeholder="Ask Gemini Nano (On-Device AI)..."
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
    gap: 6,
    marginBottom: 6,
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
