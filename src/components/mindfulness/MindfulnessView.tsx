// Mindfulness & Zen Sanctuary View
// Full-screen edge-to-edge breathing experience matching reference visuals
// 7-day streak calendar, mood check-in, and ambient soundscapes

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Vibration,
  Modal,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import {
  mindfulnessService,
  SOUNDSCAPES,
  SoundscapeItem,
} from '../../services/mindfulness/mindfulnessService';
import { credentialsStorage } from '../../services/storage/credentialsStorage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ambientAudioService } from '../../services/audio/ambientAudioService';
import { BreathPhase, BreathTechnique, DayInfo } from '../../types';
import {
  BREATHING_TECHNIQUES as TECHNIQUES,
  MOOD_PRESETS as MOODS,
  MOOD_DESCRIPTIONS,
} from '../../constants';
import { formatDuration, formatDateKey, getTodayDateKey } from '../../utils';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const MusicNoteIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="2" />
    <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const ChevronDownIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CloseXIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlaySvgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 3l14 9-14 9V3z" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PauseSvgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#fff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 4h4v16H6zM14 4h4v16h-4z" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const ResetSvgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M1 4v6h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const VibrationHapticIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="7" y="3" width="10" height="18" rx="2" stroke={color} strokeWidth="1.8" />
    <Circle cx="12" cy="18" r="0.8" fill={color} />
    <Path d="M3 8C2 10 2 14 3 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M21 8C22 10 22 14 21 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const FlameStreakIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#D97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.5 14.5A2.5 2.5 0 0011 17c1.38 0 2.5-1.12 2.5-2.5 0-1.5-1.5-2.5-1.5-3.5 0 1-1 1.5-1.5 2a1.5 1.5 0 00-.5 1.5z"
      fill={color}
    />
    <Path
      d="M12 2c1.5 3 4.5 5 4.5 9a6.5 6.5 0 01-13 0c0-4 3-7 5-9 0 2 1.5 3 3.5 3 0-2 0-3 0-3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckCircleBadgeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 4L12 14.01l-3-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HeadphonesSvgIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 18v-6a9 9 0 0118 0v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" fill={color + '20'} stroke={color} strokeWidth="1.8" />
  </Svg>
);

const VolumeSpeakerIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = '#1F382E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 5L6 9H2v6h4l5 4V5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Dynamic mood face icon matching selected mood state
const MoodFaceIcon: React.FC<{ moodId: string; color?: string; size?: number }> = ({
  moodId,
  color = '#1F382E',
  size = 46,
}) => {
  switch (moodId) {
    case 'unhappy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Furrowed annoyed eyebrows */}
          <Path d="M5.5 8.5l3.5 1.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M18.5 8.5l-3.5 1.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          {/* Annoyed eyes */}
          <Path d="M6.5 12h3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M14.5 12h3" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          {/* Frown mouth */}
          <Path d="M7.5 17c2 -2.8 7 -2.8 9 0" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        </Svg>
      );
    case 'sad':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Sorrowful eyebrows tilting upward in center */}
          <Path d="M6.5 9.5l3 -1.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M17.5 9.5l-3 -1.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
          {/* Gentle downturned sad eyes */}
          <Path d="M6.5 12.5c1 -1 2.5 -0.5 3 0.8" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M17.5 12.5c-1 -1 -2.5 -0.5 -3 0.8" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          {/* Soft sad mouth */}
          <Path d="M8.5 17c2 -1.8 5 -1.8 7 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );
    case 'normal':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Neutral calm eyebrows */}
          <Path d="M6.5 8.5h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M14.5 8.5h3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          {/* Calm eyes */}
          <Circle cx="8" cy="11.5" r="1.5" fill={color} />
          <Circle cx="16" cy="11.5" r="1.5" fill={color} />
          {/* Straight neutral mouth */}
          <Path d="M9 15.5h6" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );
    case 'good':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Serene closed smiling eyes */}
          <Path d="M6 10c1 -1.5 2.5 -1.5 3.5 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M14.5 10c1 -1.5 2.5 -1.5 3.5 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          {/* Warm peaceful smile */}
          <Path d="M8.5 14.8c2 2.4 5 2.4 7 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );
    case 'happy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Joyful upward laughing eyes */}
          <Path d="M6 10c1 -2.2 2.8 -2.2 3.8 0" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <Path d="M14.2 10c1 -2.2 2.8 -2.2 3.8 0" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          {/* Big beaming happy smile */}
          <Path d="M7 14c2.5 4.2 7.5 4.2 10 0" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <Path d="M7.5 14h9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 10c1 -1.5 2.5 -1.5 3.5 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M14.5 10c1 -1.5 2.5 -1.5 3.5 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M8.5 15c2 2.5 5 2.5 7 0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );
  }
};

// ─── Main Mindfulness View Component ──────────────────────────────────────────

export const MindfulnessView: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedTechnique, setSelectedTechnique] = useState<BreathTechnique>(TECHNIQUES[0]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(mindfulnessService.getTodayKey());
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeItem>(SOUNDSCAPES[0]);
  const [showSoundModal, setShowSoundModal] = useState<boolean>(false);
  const [soundCategory, setSoundCategory] = useState<'all' | 'binaural' | 'solfeggio' | 'noise' | 'nature'>('all');
  const [soundVolume, setSoundVolume] = useState<number>(0.65);
  const [previewingSoundId, setPreviewingSoundId] = useState<string | null>(null);
  const [showMoodModal, setShowMoodModal] = useState<boolean>(false);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(10);
  const [weeklyStats, setWeeklyStats] = useState(mindfulnessService.getWeeklyStats());
  const [selectedMoodId, setSelectedMoodId] = useState<string>('good');
  const [moodSubmitted, setMoodSubmitted] = useState<boolean>(false);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Breathing Session Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [phaseIdx, setPhaseIdx] = useState<number>(0);
  const [phaseSec, setPhaseSec] = useState<number>(0);
  const [cycleNum, setCycleNum] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [elapsedSecs, setElapsedSecs] = useState<number>(0);

  // Animations with Natural Organic Breath Curves
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbOpacity = useRef(new Animated.Value(0.75)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring3Scale = useRef(new Animated.Value(1)).current;
  const ring4Scale = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const moodBounceAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentMoodObj = useMemo(() => {
    return MOODS.find((m) => m.id === selectedMoodId) || MOODS[3]; // default 'good'
  }, [selectedMoodId]);

  const handleSelectMood = (moodId: string) => {
    setSelectedMoodId(moodId);
    Animated.sequence([
      Animated.timing(moodBounceAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.spring(moodBounceAnim, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
    ]).start();
  };

  // Load preferences from credentialsStorage
  useEffect(() => {
    credentialsStorage.loadCredentials().then((creds) => {
      if (creds.dailyMindfulnessGoal) {
        setDailyGoalMinutes(creds.dailyMindfulnessGoal);
      }
      if (creds.mindfulnessAmbientSound) {
        const found = SOUNDSCAPES.find((s) => s.id === creds.mindfulnessAmbientSound);
        if (found) setActiveSoundscape(found);
      }
      if (creds.mindfulnessVolume !== undefined) {
        setSoundVolume(creds.mindfulnessVolume);
        ambientAudioService.setVolume(creds.mindfulnessVolume);
      }
      if (creds.todayMood) {
        setSelectedMoodId(creds.todayMood);
      }
      if (creds.hapticBreathPacingEnabled !== undefined) {
        setHapticsEnabled(creds.hapticBreathPacingEnabled);
      }
    });
    mindfulnessService.loadLogs().then(() => {
      setWeeklyStats(mindfulnessService.getWeeklyStats());
    });
    const unsubscribe = mindfulnessService.subscribe((stats) => {
      setWeeklyStats(stats);
    });
    return unsubscribe;
  }, []);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabled((prev) => {
      const next = !prev;
      if (next) {
        try {
          Vibration.vibrate(40);
        } catch {}
      }
      credentialsStorage.loadCredentials().then((creds) => {
        credentialsStorage.saveCredentials({
          ...creds,
          hapticBreathPacingEnabled: next,
        });
      });
      return next;
    });
  }, []);

  // 7-day calendar strip (Monday to Sunday)
  const weekDays = useMemo<DayInfo[]>(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days: DayInfo[] = [];

    const todayKey = getTodayDateKey();

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const key = formatDateKey(d);
      days.push({
        dayName: dayNames[i],
        dayNum: d.getDate(),
        dateKey: key,
        isToday: key === todayKey,
        isCompleted: weeklyStats.completedDates.includes(key),
      });
    }
    return days;
  }, [weeklyStats.completedDates]);

  const selectedDateSessions = useMemo(() => {
    return mindfulnessService.getSessionsForDate(selectedDateKey);
  }, [selectedDateKey, weeklyStats]);

  const currentPhase = selectedTechnique.phases[phaseIdx];

  // ── Fluid Organic Breath Wave Animation ───────────────────────────────────
  const runPhaseAnimation = useCallback(
    (phase: BreathPhase) => {
      if (animRef.current) animRef.current.stop();

      const isIn = phase.label.includes('In');
      const isHold = phase.label.includes('Hold');
      const dur = phase.duration * 1000;

      // Natural physiological breath expansion & deflation
      const targetOrbScale = isIn ? 1.7 : isHold ? 1.6 : 0.88;
      const targetOrbOpacity = isIn ? 0.95 : isHold ? 0.88 : 0.65;
      const r1Target = isIn ? 1.9 : isHold ? 1.8 : 1.1;
      const r2Target = isIn ? 2.3 : isHold ? 2.15 : 1.25;
      const r3Target = isIn ? 2.75 : isHold ? 2.5 : 1.4;
      const r4Target = isIn ? 3.2 : isHold ? 2.9 : 1.55;

      const easeCurve = isIn
        ? Easing.bezier(0.42, 0, 0.58, 1) // Smooth natural inhale curve
        : isHold
        ? Easing.inOut(Easing.sin) // Micro calm float
        : Easing.bezier(0.25, 0.1, 0.25, 1); // Soft relaxing exhale release

      animRef.current = Animated.parallel([
        Animated.timing(orbScale, {
          toValue: targetOrbScale,
          duration: dur,
          easing: easeCurve,
          useNativeDriver: true,
        }),
        Animated.timing(orbOpacity, {
          toValue: targetOrbOpacity,
          duration: dur,
          easing: easeCurve,
          useNativeDriver: true,
        }),
        Animated.timing(ring1Scale, {
          toValue: r1Target,
          duration: dur,
          easing: easeCurve,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Scale, {
          toValue: r2Target,
          duration: dur * 1.05,
          easing: easeCurve,
          useNativeDriver: true,
        }),
        Animated.timing(ring3Scale, {
          toValue: r3Target,
          duration: dur * 1.1,
          easing: easeCurve,
          useNativeDriver: true,
        }),
        Animated.timing(ring4Scale, {
          toValue: r4Target,
          duration: dur * 1.15,
          easing: easeCurve,
          useNativeDriver: true,
        }),
      ]);
      animRef.current.start();

      // Tactile Haptic Breath Pacing for eyes-closed somatic awareness
      if (hapticsEnabled) {
        try {
          if (isIn) {
            // Rising double micro-pulse: expanding somatic sensation
            Vibration.vibrate([0, 50, 70, 80]);
          } else if (isHold) {
            // Soft single anchor pulse
            Vibration.vibrate(35);
          } else {
            // Smooth releasing soothing pulse
            Vibration.vibrate(90);
          }
        } catch {}
      }
    },
    [hapticsEnabled, orbScale, orbOpacity, ring1Scale, ring2Scale, ring3Scale, ring4Scale]
  );

  // ── Phase Timer Engine ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSessionModalOpen || isPaused) return;

    timerRef.current = setInterval(() => {
      setPhaseSec((prev) => {
        const next = prev + 1;
        setElapsedSecs((e) => e + 1);

        if (next >= currentPhase.duration) {
          // Label cross-fade
          Animated.sequence([
            Animated.timing(textFadeAnim, { toValue: 0.2, duration: 150, useNativeDriver: true }),
            Animated.timing(textFadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          ]).start();

          setPhaseIdx((pi) => {
            const nextIdx = (pi + 1) % selectedTechnique.phases.length;
            if (nextIdx === 0) {
              setCycleNum((c) => {
                const nextCycle = c + 1;
                if (nextCycle >= selectedTechnique.totalCycles) {
                  // Session complete!
                  clearInterval(timerRef.current!);
                  setSessionCompleted(true);
                  try {
                    Vibration.vibrate([0, 150, 80, 150]);
                  } catch {}
                  mindfulnessService
                    .logCompletedSession(
                      selectedTechnique.id,
                      selectedTechnique.name,
                      selectedTechnique.durationMinutes * 60,
                      selectedMoodId
                    )
                    .then(() => {
                      setWeeklyStats(mindfulnessService.getWeeklyStats());
                    });
                }
                return nextCycle;
              });
            }
            runPhaseAnimation(selectedTechnique.phases[nextIdx]);
            return nextIdx;
          });
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionModalOpen, isPaused, currentPhase, selectedTechnique, selectedMoodId, runPhaseAnimation, textFadeAnim]);

  const handleStartSession = (tech?: BreathTechnique) => {
    const target = tech || selectedTechnique;
    setSelectedTechnique(target);
    setPhaseIdx(0);
    setPhaseSec(0);
    setCycleNum(0);
    setElapsedSecs(0);
    setSessionCompleted(false);
    setIsPaused(false);
    setIsSessionModalOpen(true);

    orbScale.setValue(1);
    ring1Scale.setValue(1);
    ring2Scale.setValue(1);
    ring3Scale.setValue(1);
    ring4Scale.setValue(1);
    runPhaseAnimation(target.phases[0]);

    // Start ambient background synthesis
    ambientAudioService.play(activeSoundscape.id, soundVolume);

    try {
      Vibration.vibrate(60);
    } catch {}
  };

  const handleStopSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) animRef.current.stop();
    ambientAudioService.stop();
    setIsSessionModalOpen(false);
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      ambientAudioService.stop();
    } else {
      ambientAudioService.play(activeSoundscape.id, soundVolume);
    }
  };

  const formatCountdown = (secs: number) => formatDuration(secs);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.mainScroll,
          { paddingBottom: Math.max(insets.bottom + 70, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Top Header Banner with Streak Badge */}
        <View style={styles.topHeaderBar}>
          <View>
            <Text style={styles.topGreetingSub}>Enjoy your day</Text>
            <Text style={styles.topGreetingTitle}>Mindfulness & Zen</Text>
          </View>

          {/* Streak Pill */}
          <View style={styles.streakHeaderBadge}>
            <FlameStreakIcon size={16} color={weeklyStats.currentStreak > 0 ? "#D97706" : "#8A9992"} />
            <Text style={[styles.streakHeaderText, weeklyStats.currentStreak === 0 && { color: '#4A5B53' }]}>
              {weeklyStats.currentStreak > 0 ? `${weeklyStats.currentStreak} Day Streak` : 'Start Streak'}
            </Text>
          </View>
        </View>

        {/* 2. Today's Plan Progress Bento Card (Matches Image 2 Screen 1 Top Area) */}
        <View style={styles.planProgressCard}>
          <View style={styles.planProgressLeft}>
            <View style={styles.planCircularBadge}>
              <Text style={styles.planPercentText}>
                {Math.min(100, Math.round((weeklyStats.totalMinutesThisWeek / (dailyGoalMinutes * 5)) * 100))}%
              </Text>
              <Text style={styles.planPercentSub}>weekly</Text>
            </View>
            <View style={styles.planTextCol}>
              <Text style={styles.planTitle}>Today's Plan</Text>
              <Text style={styles.planSub}>
                {weeklyStats.completedDates.includes(mindfulnessService.getTodayKey())
                  ? 'Daily mindfulness target reached! 🌿'
                  : `Target: ${dailyGoalMinutes} mins · 1 session scheduled`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.moodCheckinTriggerBtn,
              { borderColor: currentMoodObj.color + '55', backgroundColor: currentMoodObj.color + '12' },
            ]}
            onPress={() => setShowMoodModal(true)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MoodFaceIcon moodId={selectedMoodId} color={currentMoodObj.color} size={15} />
              <Text style={[styles.moodTriggerText, { color: currentMoodObj.color, fontWeight: '700' }]}>
                {currentMoodObj.label}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Interactive 7-Day Calendar Strip */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeaderRow}>
            <Text style={styles.calendarSectionTitle}>STREAK CALENDAR</Text>
            <Text style={styles.calendarSectionSub}>
              {weeklyStats.completedDates.length} of 7 days completed this week
            </Text>
          </View>

          <View style={styles.calendarWeekRow}>
            {weekDays.map((day) => {
              const isSelected = selectedDateKey === day.dateKey;
              return (
                <TouchableOpacity
                  key={day.dateKey}
                  style={[
                    styles.calendarDayPill,
                    isSelected && styles.calendarDayPillSelected,
                    day.isToday && !isSelected && styles.calendarDayPillToday,
                  ]}
                  onPress={() => setSelectedDateKey(day.dateKey)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.calendarDayNum,
                      isSelected && styles.calendarDayNumSelected,
                      day.isToday && !isSelected && styles.calendarDayNumToday,
                    ]}
                  >
                    {day.dayNum}
                  </Text>
                  <Text
                    style={[
                      styles.calendarDayName,
                      isSelected && styles.calendarDayNameSelected,
                    ]}
                  >
                    {day.dayName}
                  </Text>

                  {/* Completion Indicator Dot */}
                  {day.isCompleted ? (
                    <View
                      style={[
                        styles.completedDotBadge,
                        isSelected && { backgroundColor: '#1F382E' },
                      ]}
                    />
                  ) : (
                    <View style={styles.emptyDotPlaceholder} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Date Status Banner */}
          <View style={styles.selectedDateBanner}>
            <CheckCircleBadgeIcon
              size={16}
              color={
                selectedDateSessions.length > 0
                  ? Colors.bentoMintDark
                  : Colors.textMuted
              }
            />
            <Text style={styles.selectedDateBannerText}>
              {selectedDateSessions.length > 0
                ? `Completed ${selectedDateSessions.length} session (${selectedDateSessions
                    .map((s) => s.techniqueName)
                    .join(', ')})`
                : selectedDateKey === mindfulnessService.getTodayKey()
                ? 'Today awaiting session · Choose an exercise below'
                : 'No sessions logged for this day'}
            </Text>
          </View>
        </View>

        {/* 4. Session Bento Cards (Matches Image 2 Screen 1 List) */}
        <Text style={styles.sectionHeading}>RECOMMENDED EXERCISES</Text>

        {TECHNIQUES.map((tech) => (
          <TouchableOpacity
            key={tech.id}
            style={styles.sessionBentoCard}
            onPress={() => handleStartSession(tech)}
            activeOpacity={0.82}
          >
            <View style={[styles.sessionCardAccentBar, { backgroundColor: tech.accentColor }]} />
            <View style={styles.sessionCardMainContent}>
              <View style={styles.sessionCardTopRow}>
                <View style={styles.sessionCardTitleCol}>
                  <Text style={styles.sessionCardTitle}>{tech.name}</Text>
                  <Text style={styles.sessionCardBenefit}>{tech.benefit}</Text>
                </View>
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>⏱️ {tech.durationMinutes} min</Text>
                </View>
              </View>

              <View style={styles.sessionCardBottomRow}>
                <View style={styles.phaseTagBubble}>
                  <Text style={styles.phaseTagText}>{tech.tagline}</Text>
                </View>

                <View style={[styles.startPillBtn, { backgroundColor: tech.accentColor }]}>
                  <Text style={styles.startPillBtnText}>Start Exercise</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* 5. Soundscape Quick-Select Strip */}
        <View style={styles.soundscapeQuickCard}>
          <View style={styles.soundscapeQuickLeft}>
            <MusicNoteIcon size={16} color={Colors.bentoMintDark} />
            <View>
              <Text style={styles.soundscapeQuickTitle}>Ambient Soundscape</Text>
              <Text style={styles.soundscapeQuickSubtitle}>
                Current: {activeSoundscape.label}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.changeSoundBtn}
            onPress={() => setShowSoundModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.changeSoundBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ═════════════════════════════════════════════════════════════════════════
          FULL-SCREEN IMMERSIVE BREATHING MODAL (Directly Matches Image 1)
          Full-viewport, distraction-free, fluid concentric ripples
         ═════════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={isSessionModalOpen}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleStopSession}
      >
        <StatusBar barStyle="dark-content" backgroundColor={selectedTechnique.bgColor} />
        <View
          style={[
            styles.immersiveModalContainer,
            {
              backgroundColor: selectedTechnique.bgColor,
              paddingBottom: Math.max(insets.bottom + 16, 44),
            },
          ]}
        >
          {/* Subtle Decorative Ambient Background Blobs (Reference Image 1) */}
          <View style={[styles.ambientSoftDisc1, { backgroundColor: selectedTechnique.outerRingColor }]} />
          <View style={[styles.ambientSoftDisc2, { backgroundColor: selectedTechnique.outerRingColor }]} />

          {/* Top Notch Header Bar */}
          <View style={styles.immersiveHeaderRow}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.immersiveCloseBtn}
              onPress={handleStopSession}
              activeOpacity={0.7}
            >
              <CloseXIcon size={20} color={selectedTechnique.accentColor} />
            </TouchableOpacity>

            {/* Ambient Sound Dropdown Pill (Matches Image 1: '🎵 Chirping Birds ▾') */}
            <TouchableOpacity
              style={styles.immersiveSoundPill}
              onPress={() => setShowSoundModal(true)}
              activeOpacity={0.8}
            >
              <MusicNoteIcon size={14} color={selectedTechnique.accentColor} />
              <Text style={[styles.immersiveSoundPillText, { color: selectedTechnique.accentColor }]}>
                {activeSoundscape.label}
              </Text>
              <ChevronDownIcon size={12} color={selectedTechnique.accentColor} />
            </TouchableOpacity>

            {/* Tactile Haptic Breath Pacing Toggle Pill */}
            <TouchableOpacity
              style={[
                styles.immersiveHapticPill,
                hapticsEnabled
                  ? { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: selectedTechnique.accentColor + '40' }
                  : { backgroundColor: 'rgba(255, 255, 255, 0.45)', borderColor: 'rgba(0, 0, 0, 0.08)' },
              ]}
              onPress={toggleHaptics}
              activeOpacity={0.75}
            >
              <VibrationHapticIcon
                size={14}
                color={hapticsEnabled ? selectedTechnique.accentColor : '#8E9993'}
              />
              <Text
                style={[
                  styles.immersiveHapticText,
                  { color: hapticsEnabled ? selectedTechnique.accentColor : '#8E9993' },
                ]}
              >
                {hapticsEnabled ? 'Haptics ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Central Breathing Orb with Concentric Expanding Rings (Image 1) */}
          <View style={styles.immersiveOrbCanvas}>
            {/* Ring 4 (Outermost Ambient Aura) */}
            <Animated.View
              style={[
                styles.immersiveRippleRing,
                {
                  width: 380,
                  height: 380,
                  borderColor: selectedTechnique.accentColor + '0E',
                  backgroundColor: selectedTechnique.accentColor + '04',
                  transform: [{ scale: ring4Scale }],
                },
              ]}
            />
            {/* Ring 3 (Outer Ripple) */}
            <Animated.View
              style={[
                styles.immersiveRippleRing,
                {
                  width: 300,
                  height: 300,
                  borderColor: selectedTechnique.accentColor + '18',
                  backgroundColor: selectedTechnique.accentColor + '08',
                  transform: [{ scale: ring3Scale }],
                },
              ]}
            />
            {/* Ring 2 (Mid Wave) */}
            <Animated.View
              style={[
                styles.immersiveRippleRing,
                {
                  width: 230,
                  height: 230,
                  borderColor: selectedTechnique.accentColor + '28',
                  backgroundColor: selectedTechnique.accentColor + '12',
                  transform: [{ scale: ring2Scale }],
                },
              ]}
            />
            {/* Ring 1 (Inner Glow) */}
            <Animated.View
              style={[
                styles.immersiveRippleRing,
                {
                  width: 170,
                  height: 170,
                  borderColor: selectedTechnique.accentColor + '3A',
                  backgroundColor: selectedTechnique.accentColor + '1A',
                  transform: [{ scale: ring1Scale }],
                },
              ]}
            />

            {/* Center Core Ethereal Orb */}
            <Animated.View
              style={[
                styles.immersiveCoreOrb,
                {
                  backgroundColor: selectedTechnique.accentColor,
                  opacity: orbOpacity,
                  transform: [{ scale: orbScale }],
                },
              ]}
            />

            {/* Typography Overlay in Center of Orb */}
            <Animated.View style={[styles.immersiveCenterTextWrap, { opacity: textFadeAnim }]}>
              <Text style={styles.immersivePhaseTitle}>
                {sessionCompleted ? 'Complete' : isPaused ? 'Paused' : currentPhase?.label}
              </Text>
              {!isPaused && !sessionCompleted && (
                <Text style={styles.immersiveCountdownSec}>
                  {currentPhase.duration - phaseSec}s
                </Text>
              )}
            </Animated.View>
          </View>

          {/* Bottom Controls Area (Clean, Distraction-Free, Floating) */}
          <View style={styles.immersiveBottomDock}>
            {/* Large Digital Countdown (e.g. 09:27 in Image 1) */}
            <Text style={[styles.immersiveClockText, { color: selectedTechnique.accentColor }]}>
              {formatCountdown(Math.max(0, selectedTechnique.durationMinutes * 60 - elapsedSecs))}
            </Text>

            <Text style={[styles.immersiveCycleText, { color: selectedTechnique.accentColor + 'AA' }]}>
              Cycle {cycleNum + 1} of {selectedTechnique.totalCycles} · {selectedTechnique.name}
            </Text>

            {/* Action Buttons Row */}
            {sessionCompleted ? (
              <TouchableOpacity
                style={[styles.immersiveFinishBtn, { backgroundColor: selectedTechnique.accentColor }]}
                onPress={handleStopSession}
                activeOpacity={0.85}
              >
                <Text style={styles.immersiveFinishBtnText}>✓ Finish & Save Streak</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.immersiveControlsRow}>
                {/* Reset button */}
                <TouchableOpacity
                  style={[styles.immersiveSideBtn, { borderColor: selectedTechnique.accentColor + '30' }]}
                  onPress={() => {
                    setPhaseIdx(0);
                    setPhaseSec(0);
                    setCycleNum(0);
                    setElapsedSecs(0);
                    runPhaseAnimation(selectedTechnique.phases[0]);
                  }}
                  activeOpacity={0.7}
                >
                  <ResetSvgIcon size={18} color={selectedTechnique.accentColor} />
                </TouchableOpacity>

                {/* Primary Play / Pause Floating Circle */}
                <TouchableOpacity
                  style={[
                    styles.immersivePlayPauseBtn,
                    { backgroundColor: selectedTechnique.accentColor },
                  ]}
                  onPress={handleTogglePause}
                  activeOpacity={0.85}
                >
                  {isPaused ? (
                    <PlaySvgIcon size={26} color="#FFFFFF" />
                  ) : (
                    <PauseSvgIcon size={26} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                {/* Stop & Exit */}
                <TouchableOpacity
                  style={[styles.immersiveSideBtn, { borderColor: selectedTechnique.accentColor + '30' }]}
                  onPress={handleStopSession}
                  activeOpacity={0.7}
                >
                  <CloseXIcon size={18} color={selectedTechnique.accentColor} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════════════════
          MOOD CHECK-IN MODAL (Matches Image 2 Screen 2)
         ═════════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showMoodModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoodModal(false)}
      >
        <View style={styles.moodModalOverlay}>
          <View style={styles.moodModalCard}>
            <TouchableOpacity
              style={styles.moodModalClose}
              onPress={() => setShowMoodModal(false)}
              activeOpacity={0.7}
            >
              <CloseXIcon size={18} color={Colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.moodHeaderTitle}>How Do You Feel{'\n'}Today ?</Text>

            {/* Concentric rings with face dynamically morphing based on selected mood */}
            <View style={styles.moodConcentricArea}>
              <View
                style={[
                  styles.moodConcentricRing,
                  { width: 195, height: 195, backgroundColor: currentMoodObj.color + '15' },
                ]}
              />
              <View
                style={[
                  styles.moodConcentricRing,
                  { width: 155, height: 155, backgroundColor: currentMoodObj.color + '2E' },
                ]}
              />
              <Animated.View
                style={[
                  styles.moodConcentricRing,
                  {
                    width: 115,
                    height: 115,
                    backgroundColor: currentMoodObj.color + '4D',
                    transform: [{ scale: moodBounceAnim }],
                  },
                ]}
              >
                {/* Dynamic Mood Face Icon */}
                <MoodFaceIcon moodId={selectedMoodId} color="#1F382E" size={50} />
              </Animated.View>
            </View>

            {/* Dynamic Mood Guidance / Description */}
            <Text style={styles.moodGuidanceText}>
              {MOOD_DESCRIPTIONS[selectedMoodId] || MOOD_DESCRIPTIONS.good}
            </Text>

            {/* Connected Mood Track */}
            <View style={styles.moodTrackContainer}>
              <View style={styles.moodConnectingLine} />
              <View style={styles.moodPointsRow}>
                {MOODS.map((m) => {
                  const isSelected = selectedMoodId === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.moodPointItem}
                      onPress={() => handleSelectMood(m.id)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.moodDotCircle,
                          { borderColor: m.color },
                          isSelected && { backgroundColor: m.color, transform: [{ scale: 1.25 }] },
                        ]}
                      >
                        <Circle cx="6" cy="6" r="3" fill={isSelected ? '#FFFFFF' : m.color} />
                      </View>
                      <Text
                        style={[
                          styles.moodPointLabel,
                          isSelected && { color: Colors.textPrimary, fontWeight: '800' },
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Note Mood Action Button */}
            <TouchableOpacity
              style={[styles.noteMoodBtn, { backgroundColor: currentMoodObj.color }]}
              onPress={() => {
                setMoodSubmitted(true);
                credentialsStorage.saveCredentials({ todayMood: selectedMoodId });
                try {
                  Vibration.vibrate(60);
                } catch {}
                setTimeout(() => {
                  setMoodSubmitted(false);
                  setShowMoodModal(false);
                }, 850);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.noteMoodBtnText}>
                {moodSubmitted ? `✓ Recorded as ${currentMoodObj.label}` : `Note ${currentMoodObj.label} Mood`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════════════════
          SOUNDSCAPE PICKER MODAL
         ═════════════════════════════════════════════════════════════════════════ */}
      {/* ═════════════════════════════════════════════════════════════════════════
          SOUNDSCAPE & BINAURAL FREQUENCY MODAL
         ═════════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={showSoundModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isSessionModalOpen) ambientAudioService.stop();
          setPreviewingSoundId(null);
          setShowSoundModal(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => {
            if (!isSessionModalOpen) ambientAudioService.stop();
            setPreviewingSoundId(null);
            setShowSoundModal(false);
          }}
        >
          <View style={styles.soundPickerSheet}>
            {/* Header */}
            <View style={styles.soundPickerHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.soundPickerTitle}>Sound &amp; Frequency Sanctuary</Text>
                <Text style={styles.soundPickerSub}>
                  Binaural beats, pure Solfeggio tones &amp; organic noise
                </Text>
              </View>
              <TouchableOpacity
                style={styles.soundPickerCloseBtn}
                onPress={() => {
                  if (!isSessionModalOpen) ambientAudioService.stop();
                  setPreviewingSoundId(null);
                  setShowSoundModal(false);
                }}
              >
                <CloseXIcon size={16} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Volume Control Bar */}
            <View style={styles.volumeControlCard}>
              <View style={styles.volumeControlLeft}>
                <VolumeSpeakerIcon size={16} color={Colors.bentoMintDark} />
                <Text style={styles.volumeControlLabel}>
                  Volume: {Math.round(soundVolume * 100)}%
                </Text>
              </View>
              <View style={styles.volumeStepperGroup}>
                <TouchableOpacity
                  style={styles.volumeStepBtn}
                  onPress={() => {
                    const newVol = Math.max(0.1, Math.round((soundVolume - 0.1) * 10) / 10);
                    setSoundVolume(newVol);
                    ambientAudioService.setVolume(newVol);
                    credentialsStorage.saveCredentials({ mindfulnessVolume: newVol });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.volumeStepBtnText}>-</Text>
                </TouchableOpacity>
                <View style={styles.volumeGaugeTrack}>
                  <View style={[styles.volumeGaugeFill, { width: `${Math.round(soundVolume * 100)}%` }]} />
                </View>
                <TouchableOpacity
                  style={styles.volumeStepBtn}
                  onPress={() => {
                    const newVol = Math.min(1.0, Math.round((soundVolume + 0.1) * 10) / 10);
                    setSoundVolume(newVol);
                    ambientAudioService.setVolume(newVol);
                    credentialsStorage.saveCredentials({ mindfulnessVolume: newVol });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.volumeStepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {[
                { id: 'all', label: 'All Sounds' },
                { id: 'binaural', label: 'Binaural Beats' },
                { id: 'solfeggio', label: 'Solfeggio' },
                { id: 'noise', label: 'Colored Noise' },
                { id: 'nature', label: 'Nature' },
              ].map((cat) => {
                const isCatActive = soundCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isCatActive && styles.categoryChipActive]}
                    onPress={() => setSoundCategory(cat.id as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.categoryChipText, isCatActive && styles.categoryChipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Scrollable Soundscape List */}
            <ScrollView
              style={styles.soundListScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {SOUNDSCAPES.filter((item) => soundCategory === 'all' || item.category === soundCategory).map((item) => {
                const isSelected = activeSoundscape.id === item.id;
                const isAuditioning = previewingSoundId === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.soundOptionRow, isSelected && styles.soundOptionRowActive]}
                    onPress={() => {
                      setActiveSoundscape(item);
                      credentialsStorage.saveCredentials({ mindfulnessAmbientSound: item.id });
                      if (isSessionModalOpen) {
                        ambientAudioService.play(item.id, soundVolume);
                      } else {
                        ambientAudioService.stop();
                        setPreviewingSoundId(null);
                      }
                      setShowSoundModal(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.soundOptionLeft}>
                      <View style={[styles.soundIconCircle, isSelected && styles.soundIconCircleActive]}>
                        <MusicNoteIcon
                          size={16}
                          color={isSelected ? Colors.bentoMintDark : Colors.textSecondary}
                        />
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={styles.soundTitleRow}>
                          <Text
                            style={[
                              styles.soundOptionLabel,
                              isSelected && { color: Colors.bentoMintDark, fontWeight: '800' },
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.carrierFreq && (
                            <View style={styles.carrierFreqBadge}>
                              <Text style={styles.carrierFreqText}>{item.carrierFreq}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.soundOptionDesc}>{item.description}</Text>
                        {item.requiresHeadphones && (
                          <View style={styles.headphonesAdvisory}>
                            <HeadphonesSvgIcon size={12} color="#5A3882" />
                            <Text style={styles.headphonesAdvisoryText}>
                              Stereo headphones recommended
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Audition / Preview Button & Selection Pill */}
                    <View style={styles.soundOptionRight}>
                      <TouchableOpacity
                        style={[styles.auditionBtn, isAuditioning && styles.auditionBtnActive]}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (isAuditioning) {
                            ambientAudioService.stop();
                            setPreviewingSoundId(null);
                          } else {
                            ambientAudioService.play(item.id, soundVolume);
                            setPreviewingSoundId(item.id);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.auditionBtnText, isAuditioning && styles.auditionBtnTextActive]}>
                          {isAuditioning ? '■ Stop' : '▶ Play'}
                        </Text>
                      </TouchableOpacity>

                      {isSelected && (
                        <View style={styles.selectedCheckWrap}>
                          <CheckCircleBadgeIcon size={18} color={Colors.bentoMintDark} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─── Stylesheet ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },

  // 1. Top Header
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topGreetingSub: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  topGreetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  streakHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.2)',
  },
  streakHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },

  // 2. Today's Plan Progress Card (Image 2 Screen 1)
  planProgressCard: {
    backgroundColor: '#FAF5EE',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  planProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  planCircularBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#CCE6DE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1F382E',
  },
  planPercentText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F382E',
  },
  planPercentSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1F382E',
    marginTop: -2,
  },
  planTextCol: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  planSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  moodCheckinTriggerBtn: {
    backgroundColor: Colors.bentoMintDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  moodTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 3. Calendar Strip Section
  calendarSection: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calendarSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.bentoMintDark,
  },
  calendarSectionSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  calendarDayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFA',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  calendarDayPillSelected: {
    backgroundColor: '#CCE6DE',
    borderColor: '#1F382E',
  },
  calendarDayPillToday: {
    borderColor: 'rgba(31, 56, 46, 0.3)',
  },
  calendarDayNum: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  calendarDayNumSelected: {
    color: '#1F382E',
    fontWeight: '900',
  },
  calendarDayNumToday: {
    color: Colors.bentoMintDark,
  },
  calendarDayName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
  },
  calendarDayNameSelected: {
    color: '#1F382E',
  },
  completedDotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  emptyDotPlaceholder: {
    width: 6,
    height: 6,
    marginTop: 6,
  },
  selectedDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.08)',
  },
  selectedDateBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F382E',
    flex: 1,
  },

  // 4. Recommended Exercises Bento Cards
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  sessionBentoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sessionCardAccentBar: {
    width: 5,
  },
  sessionCardMainContent: {
    flex: 1,
    padding: 16,
  },
  sessionCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sessionCardTitleCol: {
    flex: 1,
    paddingRight: 10,
  },
  sessionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sessionCardBenefit: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  durationPill: {
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F382E',
  },
  sessionCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  phaseTagBubble: {
    backgroundColor: '#F8FAFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  phaseTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  startPillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 14,
  },
  startPillBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 5. Soundscape Quick Strip
  soundscapeQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF2EE',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.1)',
  },
  soundscapeQuickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  soundscapeQuickTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F382E',
  },
  soundscapeQuickSubtitle: {
    fontSize: 11,
    color: '#2C4A3E',
    marginTop: 1,
  },
  changeSoundBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(31, 56, 46, 0.15)',
  },
  changeSoundBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F382E',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // IMMERSIVE FULL-SCREEN BREATHING MODAL (Image 1 Mockup Match)
  // ═════════════════════════════════════════════════════════════════════════
  immersiveModalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 44,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientSoftDisc1: {
    position: 'absolute',
    top: -60,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  ambientSoftDisc2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  immersiveHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    zIndex: 10,
  },
  immersiveCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  immersiveSoundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  immersiveSoundPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  immersiveHapticPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  immersiveHapticText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Central Orb Canvas
  immersiveOrbCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  immersiveRippleRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  immersiveCoreOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  immersiveCenterTextWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  immersivePhaseTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  immersiveCountdownSec: {
    fontSize: 40,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.95)',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Bottom Controls
  immersiveBottomDock: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  immersiveClockText: {
    fontSize: 34,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  immersiveCycleText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  immersiveControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  immersiveSideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  immersivePlayPauseBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
  },
  immersiveFinishBtn: {
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  immersiveFinishBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // MOOD CHECK-IN MODAL (Image 2 Screen 2)
  // ═════════════════════════════════════════════════════════════════════════
  moodModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  moodModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  moodModalClose: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moodHeaderTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 24,
  },
  moodConcentricArea: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  moodGuidanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: -4,
    marginBottom: 24,
    lineHeight: 17,
  },
  moodConcentricRing: {
    position: 'absolute',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodTrackContainer: {
    width: '100%',
    marginBottom: 30,
    position: 'relative',
    justifyContent: 'center',
  },
  moodConnectingLine: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  moodPointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  moodPointItem: {
    alignItems: 'center',
    gap: 8,
  },
  moodDotCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodPointLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  noteMoodBtn: {
    backgroundColor: '#1F382E',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  noteMoodBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Sound Picker Modal Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  soundPickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '88%',
  },
  soundPickerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  soundPickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  soundPickerSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  soundPickerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeControlCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F9F7',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
  },
  volumeControlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeControlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.bentoMintDark,
  },
  volumeStepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeStepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E4ECE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeStepBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.bentoMintDark,
    lineHeight: 18,
  },
  volumeGaugeTrack: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D9E5E0',
    overflow: 'hidden',
  },
  volumeGaugeFill: {
    height: '100%',
    backgroundColor: Colors.bentoMintDark,
    borderRadius: 3,
  },
  categoryScroll: {
    marginBottom: 12,
    maxHeight: 36,
  },
  categoryScrollContent: {
    gap: 8,
    paddingRight: 10,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F4F7F5',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  categoryChipActive: {
    backgroundColor: '#1F382E',
    borderColor: '#1F382E',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  soundListScroll: {
    maxHeight: 380,
  },
  soundOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F9FBFA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  soundOptionRowActive: {
    backgroundColor: '#EAF2EE',
    borderColor: 'rgba(31, 56, 46, 0.25)',
  },
  soundOptionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  soundIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  soundIconCircleActive: {
    backgroundColor: '#CCE6DE',
  },
  soundTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  soundOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  carrierFreqBadge: {
    backgroundColor: 'rgba(44, 74, 62, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  carrierFreqText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.bentoMintDark,
  },
  soundOptionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  headphonesAdvisory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: '#F5EFFB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  headphonesAdvisoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#5A3882',
  },
  soundOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
  },
  auditionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#EAF2EE',
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.15)',
  },
  auditionBtnActive: {
    backgroundColor: '#1F382E',
    borderColor: '#1F382E',
  },
  auditionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.bentoMintDark,
  },
  auditionBtnTextActive: {
    color: '#FFFFFF',
  },
  selectedCheckWrap: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
