import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Vibration,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MobilityTimerModalProps } from '../../types';
import { ambientAudioService } from '../../services/audio/ambientAudioService';

export const MobilityTimerModal: React.FC<MobilityTimerModalProps> = ({
  visible,
  onClose,
  routine,
  onComplete,
}) => {
  const insets = useSafeAreaInsets();
  const exercises = routine?.exercises || [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentSide, setCurrentSide] = useState<'left' | 'right' | 'both'>('left');
  const [phase, setPhase] = useState<'prepare' | 'stretch' | 'switch' | 'complete'>('prepare');
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  const currentExercise = exercises[currentIdx];
  const isBilateral = currentExercise?.bilateral ?? false;

  // Initialize or reset when modal opens
  useEffect(() => {
    if (visible && exercises.length > 0) {
      setCurrentIdx(0);
      setCurrentSide(exercises[0].bilateral ? 'left' : 'both');
      setPhase('prepare');
      setSecondsRemaining(5);
      setIsPlaying(true);
      setTotalElapsedSeconds(0);

      if (isAudioEnabled) {
        ambientAudioService.play('delta2', 0.25).catch(() => {});
      }
    } else {
      setIsPlaying(false);
      ambientAudioService.stop().catch(() => {});
    }
  }, [visible, routine]);

  // Audio mute/unmute toggle
  const toggleAudio = () => {
    if (isAudioEnabled) {
      ambientAudioService.stop().catch(() => {});
      setIsAudioEnabled(false);
    } else {
      ambientAudioService.play('delta2', 0.25).catch(() => {});
      setIsAudioEnabled(true);
    }
  };

  // Timer Tick Engine
  useEffect(() => {
    if (!visible || !isPlaying || phase === 'complete' || !currentExercise) return;

    const timer = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);

      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handlePhaseTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, isPlaying, phase, secondsRemaining, currentIdx, currentSide, currentExercise]);

  // Advance phases: Prepare (5s) -> Stretch (duration) -> Switch side (if bilateral) -> Next exercise -> Complete
  const handlePhaseTransition = () => {
    Vibration.vibrate(80);

    if (phase === 'prepare') {
      setPhase('stretch');
      setSecondsRemaining(currentExercise.durationSeconds);
      return;
    }

    if (phase === 'stretch') {
      if (isBilateral && currentSide === 'left') {
        // Switch to Right side
        setPhase('switch');
        setSecondsRemaining(5); // 5s transition
        setCurrentSide('right');
        return;
      }

      // Finished exercise (both sides done or single side)
      advanceToNextExercise();
      return;
    }

    if (phase === 'switch') {
      // Begin right side stretch
      setPhase('stretch');
      setSecondsRemaining(currentExercise.durationSeconds);
      return;
    }
  };

  const advanceToNextExercise = () => {
    if (currentIdx + 1 < exercises.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      const nextEx = exercises[nextIdx];
      setCurrentSide(nextEx.bilateral ? 'left' : 'both');
      setPhase('prepare');
      setSecondsRemaining(5);
    } else {
      // Completed entire routine
      setPhase('complete');
      setIsPlaying(false);
      Vibration.vibrate([0, 100, 60, 100]);
      ambientAudioService.stop().catch(() => {});

      if (onComplete) {
        onComplete({
          routineId: routine.id,
          routineTitle: routine.title,
          totalSeconds: totalElapsedSeconds,
          completedExercises: exercises.length,
          musclesTargeted: routine.targetMuscles,
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const handlePreviousExercise = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      const prevEx = exercises[prevIdx];
      setCurrentSide(prevEx.bilateral ? 'left' : 'both');
      setPhase('prepare');
      setSecondsRemaining(5);
    }
  };

  const handleSkipExercise = () => {
    advanceToNextExercise();
  };

  const handleClose = () => {
    ambientAudioService.stop().catch(() => {});
    setIsPlaying(false);
    onClose();
  };

  // Circular progress calculations
  const totalPhaseDuration = phase === 'prepare' || phase === 'switch' ? 5 : (currentExercise?.durationSeconds || 40);
  const progressRatio = Math.max(0, Math.min(1, secondsRemaining / totalPhaseDuration));
  const radius = 68;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  if (!visible || !routine || exercises.length === 0) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 14), paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M18 6L6 18M6 6l12 12" stroke="#1F382E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.routineTitle} numberOfLines={1}>
              {routine.title}
            </Text>
            <Text style={styles.exerciseCounter}>
              {phase === 'complete' ? 'Completed' : `Movement ${currentIdx + 1} of ${exercises.length}`}
            </Text>
          </View>

          <TouchableOpacity onPress={toggleAudio} style={[styles.audioBtn, !isAudioEnabled && styles.audioBtnMuted]} activeOpacity={0.7}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {isAudioEnabled ? (
                <Path
                  d="M11 5L6 9H2v6h4l5 4V5zm4.5 3c.8 1 1.3 2.4 1.3 4s-.5 3-1.3 4m3-11c1.8 1.8 2.7 4.2 2.7 7s-.9 5.2-2.7 7"
                  stroke="#1F382E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <Path
                  d="M11 5L6 9H2v6h4l5 4V5zm12 4l-6 6m0-6l6 6"
                  stroke="#94A39D"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </TouchableOpacity>
        </View>

        {phase === 'complete' ? (
          /* Completion Screen */
          <View style={styles.completionContainer}>
            <View style={styles.celebrationOrb}>
              <Svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <Path d="M20 6L9 17l-5-5" stroke="#1F382E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>

            <Text style={styles.completeHead}>Restorative Session Complete!</Text>
            <Text style={styles.completeSub}>
              You dedicated {Math.max(1, Math.round(totalElapsedSeconds / 60))} minutes to flushing metabolic fatigue and decompressing your tissues.
            </Text>

            <View style={styles.summaryBento}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{Math.max(1, Math.round(totalElapsedSeconds / 60))} min</Text>
                <Text style={styles.summaryLabel}>Total Duration</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{exercises.length}</Text>
                <Text style={styles.summaryLabel}>Movements</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryVal}>{routine.targetMuscles.length}</Text>
                <Text style={styles.summaryLabel}>Muscles Restored</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.finishBtn} onPress={handleClose} activeOpacity={0.85}>
              <Text style={styles.finishBtnText}>Done & Return</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Active Workout / Stretching View */
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Circular Progress Countdown */}
            <View style={styles.timerRingSection}>
              <Svg width={164} height={164} viewBox="0 0 164 164">
                {/* Background Ring Track */}
                <Circle
                  cx="82"
                  cy="82"
                  r={radius}
                  stroke="#E2ECE6"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Active Animated Progress Arc */}
                <Circle
                  cx="82"
                  cy="82"
                  r={radius}
                  stroke={phase === 'prepare' || phase === 'switch' ? '#E07A5F' : '#237A5D'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  transform="rotate(-90 82 82)"
                />
              </Svg>

              <View style={styles.timerInside}>
                <View
                  style={[
                    styles.phaseBadge,
                    phase === 'prepare' || phase === 'switch' ? styles.phaseBadgeWarm : styles.phaseBadgeMint,
                  ]}
                >
                  <Text
                    style={[
                      styles.phaseBadgeText,
                      phase === 'prepare' || phase === 'switch' ? styles.phaseBadgeTextWarm : styles.phaseBadgeTextMint,
                    ]}
                  >
                    {phase === 'prepare' ? 'GET READY' : phase === 'switch' ? 'SWITCH SIDES' : 'STRETCHING'}
                  </Text>
                </View>

                <Text style={styles.countdownNumber}>{secondsRemaining}s</Text>

                {isBilateral && phase === 'stretch' && (
                  <View style={styles.sideBadge}>
                    <Text style={styles.sideBadgeText}>
                      {currentSide === 'left' ? 'LEFT SIDE' : 'RIGHT SIDE'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Exercise Dossier Card */}
            <View style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.targetMuscleBadge}>
                  {currentExercise.targetMuscle.toUpperCase()}
                </Text>
                <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              </View>

              {/* Instructions */}
              <View style={styles.instructionBox}>
                <Text style={styles.instructionHead}>How to perform:</Text>
                <Text style={styles.instructionText}>{currentExercise.instructions}</Text>
              </View>

              {/* Pose Cue */}
              <View style={styles.cueRow}>
                <Text style={styles.cueIcon}>💡</Text>
                <Text style={styles.cueText}>{currentExercise.poseCue}</Text>
              </View>

              {/* Breathing Cue */}
              <View style={styles.breathingRow}>
                <Text style={styles.cueIcon}>🫁</Text>
                <Text style={styles.breathingText}>{currentExercise.breathingCue}</Text>
              </View>

              {/* Scientific Benefit */}
              <View style={styles.benefitBox}>
                <Text style={styles.benefitText}>{currentExercise.benefit}</Text>
              </View>
            </View>

            {/* Up Next Preview */}
            {currentIdx + 1 < exercises.length && (
              <View style={styles.upNextCard}>
                <Text style={styles.upNextLabel}>UP NEXT</Text>
                <Text style={styles.upNextTitle}>
                  {exercises[currentIdx + 1].name} ({exercises[currentIdx + 1].targetMuscle})
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Bottom Control Bar */}
        {phase !== 'complete' && (
          <View style={styles.controlsBar}>
            <TouchableOpacity
              onPress={handlePreviousExercise}
              style={[styles.secondaryControlBtn, currentIdx === 0 && styles.controlDisabled]}
              disabled={currentIdx === 0}
              activeOpacity={0.7}
            >
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M19 20L9 12l10-8v16zM5 19V5" stroke="#1F382E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.mainPlayBtn}
              activeOpacity={0.85}
            >
              <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                {isPlaying ? (
                  <Path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" fill="#FFFFFF" />
                ) : (
                  <Path d="M5 3l14 9-14 9V3z" fill="#FFFFFF" />
                )}
              </Svg>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkipExercise}
              style={styles.secondaryControlBtn}
              activeOpacity={0.7}
            >
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M5 4l10 8-10 8V4zm14 1V19" stroke="#1F382E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2ECE6',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF2EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenter: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  routineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F382E',
    letterSpacing: -0.2,
  },
  exerciseCounter: {
    fontSize: 11,
    fontWeight: '600',
    color: '#63706B',
    marginTop: 2,
  },
  audioBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF2EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioBtnMuted: {
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    alignItems: 'center',
  },
  timerRingSection: {
    width: 164,
    height: 164,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerInside: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 4,
  },
  phaseBadgeMint: {
    backgroundColor: '#CCE6DE',
  },
  phaseBadgeWarm: {
    backgroundColor: '#FCE7DC',
  },
  phaseBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  phaseBadgeTextMint: {
    color: '#1F382E',
  },
  phaseBadgeTextWarm: {
    color: '#8C481A',
  },
  countdownNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1F382E',
    letterSpacing: -0.5,
  },
  sideBadge: {
    backgroundColor: '#E2ECE6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  sideBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1F382E',
    letterSpacing: 0.5,
  },
  exerciseCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E1ECE6',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 14,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  targetMuscleBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#237A5D',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141816',
    lineHeight: 24,
  },
  instructionBox: {
    backgroundColor: '#F8FAFA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  instructionHead: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F382E',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#42534C',
    lineHeight: 18,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  breathingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EAF2EE',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  cueIcon: {
    fontSize: 13,
  },
  cueText: {
    fontSize: 12,
    color: '#6B5A10',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  breathingText: {
    fontSize: 12,
    color: '#1F382E',
    flex: 1,
    lineHeight: 16,
    fontWeight: '600',
  },
  benefitBox: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    paddingTop: 10,
  },
  benefitText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#63706B',
    lineHeight: 16,
  },
  upNextCard: {
    width: '100%',
    backgroundColor: '#EAF2EE',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  upNextLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#237A5D',
    letterSpacing: 0.8,
  },
  upNextTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F382E',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2ECE6',
    backgroundColor: '#FFFFFF',
  },
  secondaryControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EAF2EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlDisabled: {
    opacity: 0.35,
  },
  mainPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1F382E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  completionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  celebrationOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#CCE6DE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#237A5D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  completeHead: {
    fontSize: 22,
    fontWeight: '800',
    color: '#141816',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeSub: {
    fontSize: 14,
    color: '#63706B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  summaryBento: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1ECE6',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 32,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F382E',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#63706B',
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E1ECE6',
  },
  finishBtn: {
    width: '100%',
    backgroundColor: '#1F382E',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
