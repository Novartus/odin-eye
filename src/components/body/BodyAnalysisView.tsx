import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Rect, G } from 'react-native-svg';
import { MuscleRecoveryStatus, MuscleGroup, BodyAnalysisViewProps } from '../../types';
import { Colors } from '../../theme/colors';

const DEFAULT_PRIMED_MUSCLES: MuscleRecoveryStatus[] = [
  { muscle: 'chest', displayName: 'Chest', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'back', displayName: 'Back', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'shoulders', displayName: 'Shoulders', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'quads', displayName: 'Quads', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'hamstrings', displayName: 'Hamstrings', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'glutes', displayName: 'Glutes', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'biceps', displayName: 'Biceps', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'triceps', displayName: 'Triceps', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'core', displayName: 'Core', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
  { muscle: 'calves', displayName: 'Calves', recoveryPct: 100, state: 'primed', lastTrainedDate: 'No recent logs', hoursElapsed: 0, recommendedHoursRemaining: 0 },
];

const MUSCLE_METADATA: Record<
  MuscleGroup,
  {
    name: string;
    category: string;
    angle: 'front' | 'back';
    exercises: string[];
    role: string;
  }
> = {
  chest: {
    name: 'Pectorals (Chest)',
    category: 'Upper Push',
    angle: 'front',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Flyes'],
    role: 'Primary motor for horizontal pushing and upper chest stability.',
  },
  back: {
    name: 'Latissimus & Traps',
    category: 'Upper Pull',
    angle: 'back',
    exercises: ['Weighted Pull-Ups', 'Barbell Rows', 'Lat Pulldowns'],
    role: 'Key posterior chain stabilizer and primary vertical/horizontal puller.',
  },
  shoulders: {
    name: 'Deltoids (Shoulders)',
    category: 'Upper Push & Press',
    angle: 'front',
    exercises: ['Overhead Shoulder Press', 'Lateral Raises', 'Face Pulls'],
    role: 'Multi-directional shoulder joint articulation and overhead drive.',
  },
  biceps: {
    name: 'Biceps Brachii',
    category: 'Arm Flexors',
    angle: 'front',
    exercises: ['Incline Dumbbell Curls', 'EZ-Bar Curls', 'Hammer Curls'],
    role: 'Elbow flexion and forearm supination power.',
  },
  triceps: {
    name: 'Triceps Brachii',
    category: 'Arm Extensors',
    angle: 'back',
    exercises: ['Overhead Tricep Extension', 'Close-Grip Bench', 'Cable Dips'],
    role: 'Comprises 60% of upper arm mass; vital for lockout strength.',
  },
  quads: {
    name: 'Quadriceps (Thighs)',
    category: 'Lower Push',
    angle: 'front',
    exercises: ['Barbell Back Squat', 'Leg Press', 'Bulgarian Split Squats'],
    role: 'Largest kinetic force generator in human physiology.',
  },
  hamstrings: {
    name: 'Hamstrings',
    category: 'Lower Pull',
    angle: 'back',
    exercises: ['Romanian Deadlift', 'Lying Leg Curls', 'Nordic Curls'],
    role: 'Hip extension, deceleration, and knee joint protection.',
  },
  glutes: {
    name: 'Gluteus Maximus',
    category: 'Posterior Kinetic Chain',
    angle: 'back',
    exercises: ['Barbell Hip Thrusts', 'Romanian Deadlifts', 'Bulgarian Split Squats'],
    role: 'Primary hip extensor and pelvic stabilizer for sprint and heavy lift.',
  },
  core: {
    name: 'Abdominals & Core',
    category: 'Trunk Stabilization',
    angle: 'front',
    exercises: ['Hanging Leg Raises', 'Ab Wheel Rollouts', 'Cable Chops'],
    role: 'Spinal alignment and rotational kinetic transmission.',
  },
  calves: {
    name: 'Calves (Gastrocnemius)',
    category: 'Lower Kinematics',
    angle: 'back',
    exercises: ['Standing Calf Raises', 'Seated Calf Raises'],
    role: 'High-endurance shock absorber and vertical takeoff engine.',
  },
};

export const BodyAnalysisView: React.FC<BodyAnalysisViewProps> = ({ muscleStatuses }) => {
  const activeMuscles =
    muscleStatuses && muscleStatuses.length > 0 ? muscleStatuses : DEFAULT_PRIMED_MUSCLES;
  const [viewAngle, setViewAngle] = useState<'front' | 'back'>('front');
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<MuscleGroup>('chest');

  const selectedMuscle =
    activeMuscles.find((m) => m.muscle === selectedMuscleKey) || activeMuscles[0];
  const meta = MUSCLE_METADATA[selectedMuscleKey] || MUSCLE_METADATA.chest;

  const avgReadiness = Math.round(
    activeMuscles.reduce((acc, m) => acc + m.recoveryPct, 0) / activeMuscles.length
  );

  const primedCount = activeMuscles.filter((m) => m.state === 'primed').length;
  const recoveringCount = activeMuscles.filter((m) => m.state === 'recovering').length;
  const fatiguedCount = activeMuscles.filter((m) => m.state === 'fatigued').length;

  const getMuscleStatus = (key: MuscleGroup) => {
    return activeMuscles.find((m) => m.muscle === key);
  };

  const getMuscleColor = (key: MuscleGroup, isSelected: boolean) => {
    const status = getMuscleStatus(key);
    if (!status) return '#E2E8F0';

    if (isSelected) {
      return status.state === 'primed' ? '#237A5D' : status.state === 'fatigued' ? '#DC2626' : '#E07A5F';
    }

    if (status.state === 'fatigued') return '#FED7D7';
    if (status.state === 'recovering') return '#FDE6D8';
    return '#D7ECE4';
  };

  const getMuscleStroke = (key: MuscleGroup, isSelected: boolean) => {
    if (isSelected) return '#181C1B';
    const status = getMuscleStatus(key);
    if (!status) return '#CAD7D2';
    if (status.state === 'fatigued') return '#E57373';
    if (status.state === 'recovering') return '#E4A88B';
    return '#9BB7AC';
  };

  const handleSelectMuscle = (key: MuscleGroup) => {
    setSelectedMuscleKey(key);
    const targetMeta = MUSCLE_METADATA[key];
    if (targetMeta && targetMeta.angle !== viewAngle) {
      setViewAngle(targetMeta.angle);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Hero Muscular Readiness Bento Summary */}
      <View style={styles.readinessHeroCard}>
        <View style={styles.heroLeftCol}>
          <View style={styles.heroPillBadge}>
            <Text style={styles.heroPillBadgeText}>BIOMECHANICAL RECOVERY</Text>
          </View>
          <Text style={styles.heroMainTitle}>Muscular Readiness</Text>
          <Text style={styles.heroSubText}>
            {recoveringCount > 0 || fatiguedCount > 0
              ? `${recoveringCount + fatiguedCount} muscle groups currently regenerating tissue fibers.`
              : 'All muscle groups fully repaired with zero residual strain debt.'}
          </Text>

          {/* Micro Status Indicators */}
          <View style={styles.heroChipsRow}>
            <View style={styles.statusPillMint}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.statusPillText}>{primedCount} Primed</Text>
            </View>
            {recoveringCount > 0 && (
              <View style={styles.statusPillPeach}>
                <View style={[styles.statusDot, { backgroundColor: '#F97316' }]} />
                <Text style={styles.statusPillText}>{recoveringCount} Repairing</Text>
              </View>
            )}
            {fatiguedCount > 0 && (
              <View style={styles.statusPillRose}>
                <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.statusPillText}>{fatiguedCount} Fatigued</Text>
              </View>
            )}
          </View>
        </View>

        {/* Circular SVG Gauge (Scandinavian Bento Style) */}
        <View style={styles.heroRingBox}>
          <Svg width="84" height="84" viewBox="0 0 84 84">
            <Circle
              cx="42"
              cy="42"
              r="34"
              stroke="#E3EFEA"
              strokeWidth="7"
              fill="none"
            />
            <Circle
              cx="42"
              cy="42"
              r="34"
              stroke={avgReadiness >= 85 ? '#237A5D' : avgReadiness >= 65 ? '#E07A5F' : '#DC2626'}
              strokeWidth="7"
              strokeDasharray="213.6"
              strokeDashoffset={213.6 - (213.6 * avgReadiness) / 100}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 42 42)"
            />
          </Svg>
          <View style={styles.heroRingInnerDisk}>
            <Text style={styles.heroRingValue}>{avgReadiness}%</Text>
            <Text style={styles.heroRingLabel}>READY</Text>
          </View>
        </View>
      </View>

      {/* 2. Interactive View Angle Switcher */}
      <View style={styles.segmentedControlContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, viewAngle === 'front' && styles.segmentBtnActive]}
          onPress={() => {
            setViewAngle('front');
            if (MUSCLE_METADATA[selectedMuscleKey].angle !== 'front') {
              setSelectedMuscleKey('chest');
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, viewAngle === 'front' && styles.segmentBtnTextActive]}>
            Front Anatomy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, viewAngle === 'back' && styles.segmentBtnActive]}
          onPress={() => {
            setViewAngle('back');
            if (MUSCLE_METADATA[selectedMuscleKey].angle !== 'back') {
              setSelectedMuscleKey('back');
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentBtnText, viewAngle === 'back' && styles.segmentBtnTextActive]}>
            Back Anatomy
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Anatomical Vector Heatmap Canvas */}
      <View style={styles.anatomyCanvasCard}>
        {/* Soft Background Biometric Aura */}
        <View style={styles.auraGlow} />

        {/* Legend Overlay Banner */}
        <View style={styles.canvasLegendBar}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#237A5D' }]} />
            <Text style={styles.legendLabel}>Primed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E07A5F' }]} />
            <Text style={styles.legendLabel}>Repairing</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
            <Text style={styles.legendLabel}>Fatigued</Text>
          </View>
        </View>

        {/* Scaled Anatomical Human Vector Graphic */}
        <Svg width="270" height="360" viewBox="0 0 270 360" style={styles.anatomySvg}>
          <Defs>
            <LinearGradient id="boneShading" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#E6ECE9" stopOpacity="0.85" />
            </LinearGradient>
          </Defs>

          {viewAngle === 'front' ? (
            /* FRONT ANATOMY MODEL */
            <G>
              {/* Head & Cranium */}
              <Path
                d="M 135 16 C 122 16, 114 26, 114 42 C 114 58, 124 70, 135 70 C 146 70, 156 58, 156 42 C 156 26, 148 16, 135 16 Z"
                fill="url(#boneShading)"
                stroke="#B8C8C2"
                strokeWidth="1.5"
              />
              {/* Neck & Cervical Axis */}
              <Path
                d="M 127 66 L 125 84 L 145 84 L 143 66 Z"
                fill="#DEE7E3"
                stroke="#CAD7D2"
                strokeWidth="1"
              />

              {/* Trapezius / Collarbone */}
              <Path
                d="M 125 84 C 100 86, 80 92, 65 106 L 73 114 C 89 102, 107 96, 125 94 Z"
                fill="#EDF3F0"
                stroke="#CAD7D2"
                strokeWidth="1"
              />
              <Path
                d="M 145 84 C 170 86, 190 92, 205 106 L 197 114 C 181 102, 163 96, 145 94 Z"
                fill="#EDF3F0"
                stroke="#CAD7D2"
                strokeWidth="1"
              />

              {/* Left Shoulder (Deltoid) */}
              <Path
                d="M 65 106 C 54 115, 50 132, 56 150 C 63 154, 73 152, 78 141 C 80 127, 80 115, 73 114 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke={getMuscleStroke('shoulders', selectedMuscleKey === 'shoulders')}
                strokeWidth={selectedMuscleKey === 'shoulders' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('shoulders')}
              />

              {/* Right Shoulder (Deltoid) */}
              <Path
                d="M 205 106 C 216 115, 220 132, 214 150 C 207 154, 197 152, 192 141 C 190 127, 190 115, 197 114 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke={getMuscleStroke('shoulders', selectedMuscleKey === 'shoulders')}
                strokeWidth={selectedMuscleKey === 'shoulders' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('shoulders')}
              />

              {/* Left Bicep */}
              <Path
                d="M 56 150 C 51 168, 49 188, 58 208 C 65 210, 71 202, 73 188 C 75 170, 78 154, 78 141 Z"
                fill={getMuscleColor('biceps', selectedMuscleKey === 'biceps')}
                stroke={getMuscleStroke('biceps', selectedMuscleKey === 'biceps')}
                strokeWidth={selectedMuscleKey === 'biceps' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('biceps')}
              />

              {/* Right Bicep */}
              <Path
                d="M 214 150 C 219 168, 221 188, 212 208 C 205 210, 199 202, 197 188 C 195 170, 192 154, 192 141 Z"
                fill={getMuscleColor('biceps', selectedMuscleKey === 'biceps')}
                stroke={getMuscleStroke('biceps', selectedMuscleKey === 'biceps')}
                strokeWidth={selectedMuscleKey === 'biceps' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('biceps')}
              />

              {/* Left Pectoral (Chest) */}
              <Path
                d="M 133 98 C 107 98, 83 105, 77 127 C 79 144, 102 156, 133 150 Z"
                fill={getMuscleColor('chest', selectedMuscleKey === 'chest')}
                stroke={getMuscleStroke('chest', selectedMuscleKey === 'chest')}
                strokeWidth={selectedMuscleKey === 'chest' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('chest')}
              />

              {/* Right Pectoral (Chest) */}
              <Path
                d="M 137 98 C 163 98, 187 105, 193 127 C 191 144, 168 156, 137 150 Z"
                fill={getMuscleColor('chest', selectedMuscleKey === 'chest')}
                stroke={getMuscleStroke('chest', selectedMuscleKey === 'chest')}
                strokeWidth={selectedMuscleKey === 'chest' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('chest')}
              />

              {/* Sculpted Abdominals (Core) */}
              <G onPress={() => handleSelectMuscle('core')}>
                {/* Upper Abs */}
                <Rect
                  x="115"
                  y="158"
                  width="18"
                  height="16"
                  rx="5"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke={getMuscleStroke('core', selectedMuscleKey === 'core')}
                  strokeWidth={selectedMuscleKey === 'core' ? 2 : 1}
                />
                <Rect
                  x="137"
                  y="158"
                  width="18"
                  height="16"
                  rx="5"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke={getMuscleStroke('core', selectedMuscleKey === 'core')}
                  strokeWidth={selectedMuscleKey === 'core' ? 2 : 1}
                />

                {/* Mid Abs */}
                <Rect
                  x="115"
                  y="177"
                  width="18"
                  height="16"
                  rx="5"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke={getMuscleStroke('core', selectedMuscleKey === 'core')}
                  strokeWidth={selectedMuscleKey === 'core' ? 2 : 1}
                />
                <Rect
                  x="137"
                  y="177"
                  width="18"
                  height="16"
                  rx="5"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke={getMuscleStroke('core', selectedMuscleKey === 'core')}
                  strokeWidth={selectedMuscleKey === 'core' ? 2 : 1}
                />

                {/* Lower Abs */}
                <Rect
                  x="117"
                  y="196"
                  width="17"
                  height="16"
                  rx="5"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke={getMuscleStroke('core', selectedMuscleKey === 'core')}
                  strokeWidth={selectedMuscleKey === 'core' ? 2 : 1}
                />
                <Rect
                  x="136"
                  y="196"
                  width="17"
                  height="16"
                  rx="5"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke={getMuscleStroke('core', selectedMuscleKey === 'core')}
                  strokeWidth={selectedMuscleKey === 'core' ? 2 : 1}
                />
              </G>

              {/* Obliques */}
              <Path
                d="M 98 156 C 92 177, 94 202, 106 218 L 114 214 C 106 197, 104 176, 108 156 Z"
                fill="#EDF3F0"
                stroke="#CAD7D2"
                strokeWidth="1"
              />
              <Path
                d="M 172 156 C 178 177, 176 202, 164 218 L 156 214 C 164 197, 166 176, 162 156 Z"
                fill="#EDF3F0"
                stroke="#CAD7D2"
                strokeWidth="1"
              />

              {/* Pelvis & Hip Structure */}
              <Path
                d="M 106 218 L 164 218 C 158 232, 148 242, 135 244 C 122 242, 112 232, 106 218 Z"
                fill="#DEE7E3"
                stroke="#CAD7D2"
                strokeWidth="1"
              />

              {/* Left Quadricep (Thigh) */}
              <Path
                d="M 106 224 C 95 248, 89 285, 100 324 C 108 326, 119 322, 125 303 C 129 278, 131 251, 129 232 Z"
                fill={getMuscleColor('quads', selectedMuscleKey === 'quads')}
                stroke={getMuscleStroke('quads', selectedMuscleKey === 'quads')}
                strokeWidth={selectedMuscleKey === 'quads' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('quads')}
              />

              {/* Right Quadricep (Thigh) */}
              <Path
                d="M 164 224 C 175 248, 181 285, 170 324 C 162 326, 151 322, 145 303 C 141 278, 139 251, 141 232 Z"
                fill={getMuscleColor('quads', selectedMuscleKey === 'quads')}
                stroke={getMuscleStroke('quads', selectedMuscleKey === 'quads')}
                strokeWidth={selectedMuscleKey === 'quads' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('quads')}
              />

              {/* Left Shin & Calf (Anterior) */}
              <Path
                d="M 100 328 C 96 338, 97 348, 104 354 L 118 350 C 122 342, 122 334, 120 328 Z"
                fill="#E6EFEA"
                stroke="#CAD7D2"
                strokeWidth="1"
              />
              {/* Right Shin & Calf (Anterior) */}
              <Path
                d="M 170 328 C 174 338, 173 348, 166 354 L 152 350 C 148 342, 148 334, 150 328 Z"
                fill="#E6EFEA"
                stroke="#CAD7D2"
                strokeWidth="1"
              />
            </G>
          ) : (
            /* BACK ANATOMY MODEL */
            <G>
              {/* Head / Occipital Base */}
              <Path
                d="M 135 16 C 122 16, 114 26, 114 42 C 114 58, 124 70, 135 70 C 146 70, 156 58, 156 42 C 156 26, 148 16, 135 16 Z"
                fill="url(#boneShading)"
                stroke="#B8C8C2"
                strokeWidth="1.5"
              />

              {/* Trapezius Cape / Diamond */}
              <Path
                d="M 135 70 L 105 90 L 73 114 L 120 138 L 135 148 L 150 138 L 197 114 L 165 90 Z"
                fill={getMuscleColor('back', selectedMuscleKey === 'back')}
                stroke={getMuscleStroke('back', selectedMuscleKey === 'back')}
                strokeWidth={selectedMuscleKey === 'back' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('back')}
              />

              {/* Rear Deltoids */}
              <Path
                d="M 73 114 C 59 122, 53 138, 59 150 C 65 152, 75 146, 79 136 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke={getMuscleStroke('shoulders', selectedMuscleKey === 'shoulders')}
                strokeWidth={selectedMuscleKey === 'shoulders' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('shoulders')}
              />
              <Path
                d="M 197 114 C 211 122, 217 138, 211 150 C 205 152, 195 146, 191 136 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke={getMuscleStroke('shoulders', selectedMuscleKey === 'shoulders')}
                strokeWidth={selectedMuscleKey === 'shoulders' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('shoulders')}
              />

              {/* Left Tricep */}
              <Path
                d="M 59 150 C 55 168, 53 186, 61 204 C 67 206, 73 198, 75 182 C 77 165, 79 150, 79 136 Z"
                fill={getMuscleColor('triceps', selectedMuscleKey === 'triceps')}
                stroke={getMuscleStroke('triceps', selectedMuscleKey === 'triceps')}
                strokeWidth={selectedMuscleKey === 'triceps' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('triceps')}
              />
              {/* Right Tricep */}
              <Path
                d="M 211 150 C 215 168, 217 186, 209 204 C 203 206, 197 198, 195 182 C 193 165, 191 150, 191 136 Z"
                fill={getMuscleColor('triceps', selectedMuscleKey === 'triceps')}
                stroke={getMuscleStroke('triceps', selectedMuscleKey === 'triceps')}
                strokeWidth={selectedMuscleKey === 'triceps' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('triceps')}
              />

              {/* Latissimus Dorsi (Lats) */}
              <Path
                d="M 120 138 C 101 152, 93 178, 107 212 L 131 210 L 135 148 Z"
                fill={getMuscleColor('back', selectedMuscleKey === 'back')}
                stroke={getMuscleStroke('back', selectedMuscleKey === 'back')}
                strokeWidth={selectedMuscleKey === 'back' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('back')}
              />
              <Path
                d="M 150 138 C 169 152, 177 178, 163 212 L 139 210 L 135 148 Z"
                fill={getMuscleColor('back', selectedMuscleKey === 'back')}
                stroke={getMuscleStroke('back', selectedMuscleKey === 'back')}
                strokeWidth={selectedMuscleKey === 'back' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('back')}
              />

              {/* Gluteal Complex */}
              <Path
                d="M 106 218 C 100 237, 102 257, 118 264 C 128 266, 132 252, 134 228 Z"
                fill={getMuscleColor('glutes', selectedMuscleKey === 'glutes')}
                stroke={getMuscleStroke('glutes', selectedMuscleKey === 'glutes')}
                strokeWidth={selectedMuscleKey === 'glutes' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('glutes')}
              />
              <Path
                d="M 164 218 C 170 237, 168 257, 152 264 C 142 266, 138 252, 136 228 Z"
                fill={getMuscleColor('glutes', selectedMuscleKey === 'glutes')}
                stroke={getMuscleStroke('glutes', selectedMuscleKey === 'glutes')}
                strokeWidth={selectedMuscleKey === 'glutes' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('glutes')}
              />

              {/* Hamstrings */}
              <Path
                d="M 110 264 C 100 282, 98 307, 104 326 C 112 327, 122 321, 128 301 C 130 281, 132 264, 128 252 Z"
                fill={getMuscleColor('hamstrings', selectedMuscleKey === 'hamstrings')}
                stroke={getMuscleStroke('hamstrings', selectedMuscleKey === 'hamstrings')}
                strokeWidth={selectedMuscleKey === 'hamstrings' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('hamstrings')}
              />
              <Path
                d="M 160 264 C 170 282, 172 307, 166 326 C 158 327, 148 321, 142 301 C 140 281, 138 264, 142 252 Z"
                fill={getMuscleColor('hamstrings', selectedMuscleKey === 'hamstrings')}
                stroke={getMuscleStroke('hamstrings', selectedMuscleKey === 'hamstrings')}
                strokeWidth={selectedMuscleKey === 'hamstrings' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('hamstrings')}
              />

              {/* Calves (Gastrocnemius & Soleus) */}
              <Path
                d="M 104 328 C 98 338, 99 350, 108 356 L 122 352 C 126 343, 126 333, 124 328 Z"
                fill={getMuscleColor('calves', selectedMuscleKey === 'calves')}
                stroke={getMuscleStroke('calves', selectedMuscleKey === 'calves')}
                strokeWidth={selectedMuscleKey === 'calves' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('calves')}
              />
              <Path
                d="M 166 328 C 172 338, 171 350, 162 356 L 148 352 C 144 343, 144 333, 146 328 Z"
                fill={getMuscleColor('calves', selectedMuscleKey === 'calves')}
                stroke={getMuscleStroke('calves', selectedMuscleKey === 'calves')}
                strokeWidth={selectedMuscleKey === 'calves' ? 2.5 : 1.2}
                onPress={() => handleSelectMuscle('calves')}
              />
            </G>
          )}

          {/* Glowing Animated Focal Pin on the Selected Muscle Target */}
          {viewAngle === 'front' && selectedMuscleKey === 'chest' && (
            <G>
              <Circle cx="135" cy="124" r="16" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="135" cy="124" r="6" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2.5" />
            </G>
          )}
          {viewAngle === 'front' && selectedMuscleKey === 'shoulders' && (
            <G>
              <Circle cx="67" cy="124" r="14" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="67" cy="124" r="5" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
          {viewAngle === 'front' && selectedMuscleKey === 'biceps' && (
            <G>
              <Circle cx="66" cy="176" r="14" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="66" cy="176" r="5" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
          {viewAngle === 'front' && selectedMuscleKey === 'core' && (
            <G>
              <Circle cx="135" cy="186" r="16" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="135" cy="186" r="6" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2.5" />
            </G>
          )}
          {viewAngle === 'front' && selectedMuscleKey === 'quads' && (
            <G>
              <Circle cx="114" cy="270" r="16" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="114" cy="270" r="6" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2.5" />
            </G>
          )}

          {viewAngle === 'back' && selectedMuscleKey === 'back' && (
            <G>
              <Circle cx="135" cy="165" r="16" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="135" cy="165" r="6" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2.5" />
            </G>
          )}
          {viewAngle === 'back' && selectedMuscleKey === 'triceps' && (
            <G>
              <Circle cx="69" cy="174" r="14" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="69" cy="174" r="5" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
          {viewAngle === 'back' && selectedMuscleKey === 'glutes' && (
            <G>
              <Circle cx="120" cy="245" r="16" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="120" cy="245" r="6" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2.5" />
            </G>
          )}
          {viewAngle === 'back' && selectedMuscleKey === 'hamstrings' && (
            <G>
              <Circle cx="118" cy="288" r="16" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="118" cy="288" r="6" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2.5" />
            </G>
          )}
          {viewAngle === 'back' && selectedMuscleKey === 'calves' && (
            <G>
              <Circle cx="114" cy="342" r="14" fill="rgba(35, 122, 93, 0.18)" />
              <Circle cx="114" cy="342" r="5" fill="#237A5D" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
        </Svg>
      </View>

      {/* 4. Selected Muscle Group Dossier Card (Positioned Cleanly Below Canvas) */}
      <View style={styles.muscleDetailCard}>
        <View style={styles.detailHeaderRow}>
          <View style={styles.detailTitleGroup}>
            <Text style={styles.detailCategory}>{meta.category}</Text>
            <Text style={styles.detailMuscleName}>{meta.name}</Text>
          </View>
          <View
            style={[
              styles.detailBadge,
              selectedMuscle.state === 'primed'
                ? styles.detailBadgeMint
                : selectedMuscle.state === 'fatigued'
                ? styles.detailBadgeRose
                : styles.detailBadgePeach,
            ]}
          >
            <Text
              style={[
                styles.detailBadgeText,
                selectedMuscle.state === 'primed'
                  ? styles.detailBadgeTextMint
                  : selectedMuscle.state === 'fatigued'
                  ? styles.detailBadgeTextRose
                  : styles.detailBadgeTextPeach,
              ]}
            >
              {selectedMuscle.state === 'primed'
                ? 'Ready to Load'
                : selectedMuscle.state === 'fatigued'
                ? 'Fatigued'
                : 'In Recovery'}
            </Text>
          </View>
        </View>

        {/* Progress Bar & Readiness Metric */}
        <View style={styles.recoveryProgressSection}>
          <View style={styles.recoveryProgressLabels}>
            <Text style={styles.recoveryProgressLabelText}>Tissue Recovery Score</Text>
            <Text style={styles.recoveryProgressPct}>{selectedMuscle.recoveryPct}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(8, selectedMuscle.recoveryPct)}%`,
                  backgroundColor:
                    selectedMuscle.state === 'primed'
                      ? '#237A5D'
                      : selectedMuscle.state === 'fatigued'
                      ? '#DC2626'
                      : '#E07A5F',
                },
              ]}
            />
          </View>
        </View>

        {/* Role & Functional Insight */}
        <Text style={styles.muscleRoleDesc}>{meta.role}</Text>

        {/* Dynamic Telemetry Status Strip */}
        <View style={styles.telemetryStrip}>
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryItemVal}>{selectedMuscle.lastTrainedDate}</Text>
            <Text style={styles.telemetryItemLabel}>Last Stimulus</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryItemVal}>
              {selectedMuscle.recommendedHoursRemaining > 0
                ? `${selectedMuscle.recommendedHoursRemaining}h`
                : '0h (Optimal)'}
            </Text>
            <Text style={styles.telemetryItemLabel}>Remaining Clock</Text>
          </View>
          <View style={styles.telemetryDivider} />
          <View style={styles.telemetryItem}>
            <Text style={styles.telemetryItemVal}>
              {selectedMuscle.state === 'primed' ? 'Push Hypertrophy' : 'Light Mobility'}
            </Text>
            <Text style={styles.telemetryItemLabel}>Today's Prescription</Text>
          </View>
        </View>

        {/* Recommended Exercise Chips */}
        <View style={styles.exercisesSection}>
          <Text style={styles.exercisesTitle}>Targeted Training Movements</Text>
          <View style={styles.exerciseChipsRow}>
            {meta.exercises.map((ex, idx) => (
              <View key={idx} style={styles.exerciseChip}>
                <Text style={styles.exerciseChipText}>✓ {ex}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 5. All Muscle Groups Interactive Bento Grid */}
      <View style={styles.bentoSectionHeader}>
        <Text style={styles.bentoSectionTitle}>Muscular Breakdown</Text>
        <Text style={styles.bentoSectionSub}>Tap any group to inspect</Text>
      </View>

      <View style={styles.muscleGrid}>
        {activeMuscles.map((m) => {
          const isSel = selectedMuscleKey === m.muscle;
          const isPrimed = m.state === 'primed';
          const isFatigued = m.state === 'fatigued';

          return (
            <TouchableOpacity
              key={m.muscle}
              style={[
                styles.gridCard,
                isSel && styles.gridCardSelected,
              ]}
              onPress={() => handleSelectMuscle(m.muscle)}
              activeOpacity={0.8}
            >
              <View style={styles.gridCardTop}>
                <Text style={[styles.gridCardName, isSel && styles.gridCardNameSelected]}>
                  {m.displayName}
                </Text>
                <View
                  style={[
                    styles.gridDot,
                    {
                      backgroundColor: isPrimed
                        ? '#10B981'
                        : isFatigued
                        ? '#EF4444'
                        : '#F97316',
                    },
                  ]}
                />
              </View>

              <View style={styles.gridCardBottom}>
                <Text style={styles.gridCardPct}>{m.recoveryPct}%</Text>
                <Text style={styles.gridCardStatus}>
                  {isPrimed ? 'Primed' : isFatigued ? 'Fatigued' : 'Repairing'}
                </Text>
              </View>

              <View style={styles.gridProgressTrack}>
                <View
                  style={[
                    styles.gridProgressFill,
                    {
                      width: `${Math.max(6, m.recoveryPct)}%`,
                      backgroundColor: isPrimed
                        ? '#237A5D'
                        : isFatigued
                        ? '#DC2626'
                        : '#E07A5F',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 40,
  },
  readinessHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  heroLeftCol: {
    flex: 1,
    paddingRight: 12,
  },
  heroPillBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F1EC',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  heroPillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#237A5D',
    letterSpacing: 0.5,
  },
  heroMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  heroSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  heroChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  statusPillMint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F9F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  statusPillPeach: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  statusPillRose: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  heroRingBox: {
    width: 84,
    height: 84,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingInnerDisk: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  heroRingLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.6,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEFEA',
    borderRadius: 16,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: '#181C1B',
    shadowColor: '#181C1B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#657770',
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  anatomyCanvasCard: {
    backgroundColor: '#F4F8F6',
    borderRadius: 24,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  auraGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#D7ECE4',
    opacity: 0.5,
    top: 50,
  },
  canvasLegendBar: {
    position: 'absolute',
    top: 14,
    right: 16,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.04)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  anatomySvg: {
    alignSelf: 'center',
  },
  muscleDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
    gap: 14,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailTitleGroup: {
    flex: 1,
    paddingRight: 10,
  },
  detailCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: '#237A5D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailMuscleName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  detailBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  detailBadgeMint: {
    backgroundColor: '#E8F9F1',
  },
  detailBadgePeach: {
    backgroundColor: '#FFF2EB',
  },
  detailBadgeRose: {
    backgroundColor: '#FEE2E2',
  },
  detailBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailBadgeTextMint: {
    color: '#059669',
  },
  detailBadgeTextPeach: {
    color: '#EA580C',
  },
  detailBadgeTextRose: {
    color: '#DC2626',
  },
  recoveryProgressSection: {
    gap: 6,
  },
  recoveryProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoveryProgressLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  recoveryProgressPct: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAEFEA',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  muscleRoleDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  telemetryStrip: {
    flexDirection: 'row',
    backgroundColor: '#F7FAF8',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.04)',
  },
  telemetryItem: {
    alignItems: 'center',
    flex: 1,
  },
  telemetryItemVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  telemetryItemLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8E4',
  },
  exercisesSection: {
    gap: 8,
  },
  exercisesTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  exerciseChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exerciseChip: {
    backgroundColor: '#EBF3F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  exerciseChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#237A5D',
  },
  bentoSectionHeader: {
    marginTop: 8,
    gap: 2,
  },
  bentoSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bentoSectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(24, 28, 27, 0.06)',
    gap: 8,
    shadowColor: '#141816',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  gridCardSelected: {
    borderColor: '#181C1B',
    borderWidth: 1.8,
    backgroundColor: '#FBFDFB',
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gridCardNameSelected: {
    fontWeight: '800',
    color: '#181C1B',
  },
  gridDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  gridCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  gridCardPct: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  gridCardStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  gridProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EAEFEA',
    overflow: 'hidden',
  },
  gridProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
