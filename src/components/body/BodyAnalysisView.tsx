import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Rect, G } from 'react-native-svg';
import { MuscleRecoveryStatus, MuscleGroup } from '../../types/health';
import { Colors } from '../../theme/colors';

interface BodyAnalysisViewProps {
  muscleStatuses: MuscleRecoveryStatus[];
}

const DEFAULT_PRIMED_MUSCLES: MuscleRecoveryStatus[] = [
  { muscle: 'chest', displayName: 'Chest', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'back', displayName: 'Back', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'shoulders', displayName: 'Shoulders', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'quads', displayName: 'Quads', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'hamstrings', displayName: 'Hamstrings', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'biceps', displayName: 'Biceps', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'triceps', displayName: 'Triceps', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'core', displayName: 'Core', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
  { muscle: 'calves', displayName: 'Calves', recoveryPct: 100, state: 'primed', lastTrainedDate: '5+ days ago', hoursElapsed: 120, recommendedHoursRemaining: 0 },
];

export const BodyAnalysisView: React.FC<BodyAnalysisViewProps> = ({ muscleStatuses }) => {
  const activeMuscles = (muscleStatuses && muscleStatuses.length > 0) ? muscleStatuses : DEFAULT_PRIMED_MUSCLES;
  const [viewAngle, setViewAngle] = useState<'front' | 'back'>('front');
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<MuscleGroup>('chest');

  const selectedMuscle =
    activeMuscles.find((m) => m.muscle === selectedMuscleKey) ||
    activeMuscles[0];

  const avgReadiness = Math.round(
    activeMuscles.reduce((acc, m) => acc + m.recoveryPct, 0) / activeMuscles.length
  );

  const getMuscleStatus = (key: MuscleGroup) => {
    return activeMuscles.find((m) => m.muscle === key);
  };

  const getMuscleColor = (key: MuscleGroup, isSelected: boolean) => {
    const status = getMuscleStatus(key);
    if (!status) return '#E2E8F0';

    if (isSelected) {
      return status.state === 'primed' ? '#2C4A3E' : '#EF4444';
    }

    if (status.state === 'fatigued') return 'rgba(239, 68, 68, 0.45)';
    if (status.state === 'recovering') return 'rgba(245, 158, 11, 0.45)';
    return 'rgba(44, 74, 62, 0.2)'; // Primed organic sage tone
  };

  // 25 histogram bars for bottom spectrum
  const histogramHeights = [
    25, 30, 20, 35, 45, 60, 40, 55, 70, 65, 80, 75, 90, 85, 95, 88, 70, 60, 50, 45, 35, 30, 25, 20, 15,
  ];

  return (
    <View style={styles.container}>
      {/* View Switcher: Front / Back (Matches High-End Medical & Fitness Apps) */}
      <View style={styles.angleToggleContainer}>
        <TouchableOpacity
          style={[styles.angleBtn, viewAngle === 'front' && styles.angleBtnActive]}
          onPress={() => {
            setViewAngle('front');
            setSelectedMuscleKey('chest');
          }}
        >
          <Text style={[styles.angleText, viewAngle === 'front' && styles.angleTextActive]}>
            Front Anatomy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.angleBtn, viewAngle === 'back' && styles.angleBtnActive]}
          onPress={() => {
            setViewAngle('back');
            setSelectedMuscleKey('back');
          }}
        >
          <Text style={[styles.angleText, viewAngle === 'back' && styles.angleTextActive]}>
            Back Anatomy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Holographic Body Card */}
      <View style={styles.canvasCard}>
        <View style={styles.glowBackdrop} />

        {/* High-Definition Anatomical Vector Model */}
        <Svg width="260" height="340" viewBox="0 0 260 340" style={styles.svg}>
          <Defs>
            {/* Soft body outline gradient */}
            <LinearGradient id="bodyShading" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <Stop offset="60%" stopColor="#F1F5F9" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.75" />
            </LinearGradient>

            {/* Glowing Accent Gradient */}
            <LinearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#007AFF" stopOpacity="0.9" />
            </LinearGradient>

            {/* Fatigued Repair Gradient */}
            <LinearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#F87171" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#EF4444" stopOpacity="0.95" />
            </LinearGradient>
          </Defs>

          {viewAngle === 'front' ? (
            /* FRONT ANATOMY BODY */
            <G>
              {/* Head & Neck Contour */}
              <Path
                d="M 130 18 C 118 18, 110 28, 110 42 C 110 58, 120 70, 130 70 C 140 70, 150 58, 150 42 C 150 28, 142 18, 130 18 Z"
                fill="url(#bodyShading)"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <Path
                d="M 122 66 L 120 84 L 140 84 L 138 66 Z"
                fill="#E2E8F0"
              />

              {/* Trapezius / Collarbone */}
              <Path
                d="M 120 84 C 95 86, 75 92, 60 106 L 68 114 C 84 102, 102 96, 120 94 Z"
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <Path
                d="M 140 84 C 165 86, 185 92, 200 106 L 192 114 C 176 102, 158 96, 140 94 Z"
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              {/* Left Deltoid (Shoulder) */}
              <Path
                d="M 60 106 C 50 114, 46 130, 52 148 C 58 152, 68 150, 72 140 C 74 126, 74 114, 68 114 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke={selectedMuscleKey === 'shoulders' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'shoulders' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('shoulders')}
              />

              {/* Right Deltoid (Shoulder) */}
              <Path
                d="M 200 106 C 210 114, 214 130, 208 148 C 202 152, 192 150, 188 140 C 186 126, 186 114, 192 114 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke={selectedMuscleKey === 'shoulders' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'shoulders' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('shoulders')}
              />

              {/* Left Bicep / Arm */}
              <Path
                d="M 52 148 C 48 165, 46 185, 54 206 C 60 208, 66 200, 68 186 C 70 168, 72 152, 72 140 Z"
                fill={getMuscleColor('biceps', selectedMuscleKey === 'biceps')}
                stroke={selectedMuscleKey === 'biceps' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'biceps' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('biceps')}
              />

              {/* Right Bicep / Arm */}
              <Path
                d="M 208 148 C 212 165, 214 185, 206 206 C 200 208, 194 200, 192 186 C 190 168, 188 152, 188 140 Z"
                fill={getMuscleColor('biceps', selectedMuscleKey === 'biceps')}
                stroke={selectedMuscleKey === 'biceps' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'biceps' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('biceps')}
              />

              {/* Left Pectoral (Chest Plate) */}
              <Path
                d="M 128 98 C 104 98, 80 105, 74 126 C 76 142, 98 154, 128 148 Z"
                fill={getMuscleColor('chest', selectedMuscleKey === 'chest')}
                stroke={selectedMuscleKey === 'chest' ? '#EF4444' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'chest' ? 2.5 : 1}
                onPress={() => setSelectedMuscleKey('chest')}
              />

              {/* Right Pectoral (Chest Plate) */}
              <Path
                d="M 132 98 C 156 98, 180 105, 186 126 C 184 142, 162 154, 132 148 Z"
                fill={getMuscleColor('chest', selectedMuscleKey === 'chest')}
                stroke={selectedMuscleKey === 'chest' ? '#EF4444' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'chest' ? 2.5 : 1}
                onPress={() => setSelectedMuscleKey('chest')}
              />

              {/* Core / Abdominals - Sculpted 6-pack */}
              <G onPress={() => setSelectedMuscleKey('core')}>
                {/* Upper Abs */}
                <Rect
                  x="110" y="156" width="18" height="15" rx="4"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke="#CBD5E1" strokeWidth="0.8"
                />
                <Rect
                  x="132" y="156" width="18" height="15" rx="4"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke="#CBD5E1" strokeWidth="0.8"
                />

                {/* Mid Abs */}
                <Rect
                  x="110" y="174" width="18" height="15" rx="4"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke="#CBD5E1" strokeWidth="0.8"
                />
                <Rect
                  x="132" y="174" width="18" height="15" rx="4"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke="#CBD5E1" strokeWidth="0.8"
                />

                {/* Lower Abs */}
                <Rect
                  x="112" y="192" width="17" height="16" rx="4"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke="#CBD5E1" strokeWidth="0.8"
                />
                <Rect
                  x="131" y="192" width="17" height="16" rx="4"
                  fill={getMuscleColor('core', selectedMuscleKey === 'core')}
                  stroke="#CBD5E1" strokeWidth="0.8"
                />
              </G>

              {/* Obliques / Waist Flanks */}
              <Path
                d="M 94 154 C 88 175, 90 200, 102 216 L 110 212 C 102 195, 100 174, 104 154 Z"
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />
              <Path
                d="M 166 154 C 172 175, 170 200, 158 216 L 150 212 C 158 195, 160 174, 156 154 Z"
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />

              {/* Pelvis & Hips */}
              <Path
                d="M 102 216 L 158 216 C 152 230, 142 240, 130 242 C 118 240, 108 230, 102 216 Z"
                fill="#E2E8F0"
                stroke="#CBD5E1"
                strokeWidth="1"
              />

              {/* Left Quadriceps (Thigh) */}
              <Path
                d="M 102 222 C 92 245, 86 280, 96 320 C 104 322, 114 318, 120 300 C 124 275, 126 248, 124 230 Z"
                fill={getMuscleColor('quads', selectedMuscleKey === 'quads')}
                stroke={selectedMuscleKey === 'quads' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'quads' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('quads')}
              />

              {/* Right Quadriceps (Thigh) */}
              <Path
                d="M 158 222 C 168 245, 174 280, 164 320 C 156 322, 146 318, 140 300 C 136 275, 134 248, 136 230 Z"
                fill={getMuscleColor('quads', selectedMuscleKey === 'quads')}
                stroke={selectedMuscleKey === 'quads' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'quads' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('quads')}
              />
            </G>
          ) : (
            /* BACK ANATOMY BODY */
            <G>
              {/* Head / Back of Neck */}
              <Path
                d="M 130 18 C 118 18, 110 28, 110 42 C 110 58, 120 70, 130 70 C 140 70, 150 58, 150 42 C 150 28, 142 18, 130 18 Z"
                fill="url(#bodyShading)"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />

              {/* Trapezius Cape / Diamond */}
              <Path
                d="M 130 70 L 100 90 L 68 114 L 115 138 L 130 148 L 145 138 L 192 114 L 160 90 Z"
                fill={getMuscleColor('back', selectedMuscleKey === 'back')}
                stroke={selectedMuscleKey === 'back' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'back' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('back')}
              />

              {/* Rear Deltoids */}
              <Path
                d="M 68 114 C 54 122, 48 138, 54 150 C 60 152, 70 146, 74 136 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke="#CBD5E1"
                strokeWidth="1"
                onPress={() => setSelectedMuscleKey('shoulders')}
              />
              <Path
                d="M 192 114 C 206 122, 212 138, 206 150 C 200 152, 190 146, 186 136 Z"
                fill={getMuscleColor('shoulders', selectedMuscleKey === 'shoulders')}
                stroke="#CBD5E1"
                strokeWidth="1"
                onPress={() => setSelectedMuscleKey('shoulders')}
              />

              {/* Triceps (Back of Arms) */}
              <Path
                d="M 54 150 C 50 168, 48 186, 56 204 C 62 206, 68 198, 70 182 C 72 165, 74 150, 74 136 Z"
                fill={getMuscleColor('triceps', selectedMuscleKey === 'triceps')}
                stroke={selectedMuscleKey === 'triceps' ? '#EF4444' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'triceps' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('triceps')}
              />
              <Path
                d="M 206 150 C 210 168, 212 186, 204 204 C 198 206, 192 198, 190 182 C 188 165, 186 150, 186 136 Z"
                fill={getMuscleColor('triceps', selectedMuscleKey === 'triceps')}
                stroke={selectedMuscleKey === 'triceps' ? '#EF4444' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'triceps' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('triceps')}
              />

              {/* Latissimus Dorsi (Lats / Back Wings) */}
              <Path
                d="M 115 138 C 96 152, 88 178, 102 212 L 126 210 L 130 148 Z"
                fill={getMuscleColor('back', selectedMuscleKey === 'back')}
                stroke={selectedMuscleKey === 'back' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'back' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('back')}
              />
              <Path
                d="M 145 138 C 164 152, 172 178, 158 212 L 134 210 L 130 148 Z"
                fill={getMuscleColor('back', selectedMuscleKey === 'back')}
                stroke={selectedMuscleKey === 'back' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'back' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('back')}
              />

              {/* Glutes */}
              <Path
                d="M 102 216 C 96 235, 98 255, 114 262 C 124 264, 128 250, 130 226 Z"
                fill="#CBD5E1"
                stroke="#94A3B8"
                strokeWidth="1"
              />
              <Path
                d="M 158 216 C 164 235, 162 255, 146 262 C 136 264, 132 250, 130 226 Z"
                fill="#CBD5E1"
                stroke="#94A3B8"
                strokeWidth="1"
              />

              {/* Hamstrings */}
              <Path
                d="M 106 262 C 96 280, 94 305, 100 325 C 108 326, 118 320, 124 300 C 126 280, 128 262, 124 250 Z"
                fill={getMuscleColor('hamstrings', selectedMuscleKey === 'hamstrings')}
                stroke={selectedMuscleKey === 'hamstrings' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'hamstrings' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('hamstrings')}
              />
              <Path
                d="M 154 262 C 164 280, 166 305, 160 325 C 152 326, 142 320, 136 300 C 134 280, 132 262, 136 250 Z"
                fill={getMuscleColor('hamstrings', selectedMuscleKey === 'hamstrings')}
                stroke={selectedMuscleKey === 'hamstrings' ? '#007AFF' : '#CBD5E1'}
                strokeWidth={selectedMuscleKey === 'hamstrings' ? 2 : 1}
                onPress={() => setSelectedMuscleKey('hamstrings')}
              />
            </G>
          )}

          {/* Focal Glowing Hotspot Pin on the Selected Muscle */}
          {viewAngle === 'front' && selectedMuscleKey === 'chest' && (
            <G>
              <Circle cx="130" cy="120" r="14" fill="rgba(239, 68, 68, 0.2)" />
              <Circle cx="130" cy="120" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
          {viewAngle === 'front' && selectedMuscleKey === 'shoulders' && (
            <G>
              <Circle cx="62" cy="122" r="12" fill="rgba(0, 122, 255, 0.2)" />
              <Circle cx="62" cy="122" r="5" fill="#007AFF" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
          {viewAngle === 'front' && selectedMuscleKey === 'core' && (
            <G>
              <Circle cx="130" cy="180" r="14" fill="rgba(16, 185, 129, 0.2)" />
              <Circle cx="130" cy="180" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
          {viewAngle === 'front' && selectedMuscleKey === 'quads' && (
            <G>
              <Circle cx="110" cy="265" r="14" fill="rgba(16, 185, 129, 0.2)" />
              <Circle cx="110" cy="265" r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
          {viewAngle === 'back' && selectedMuscleKey === 'back' && (
            <G>
              <Circle cx="130" cy="160" r="14" fill="rgba(0, 122, 255, 0.2)" />
              <Circle cx="130" cy="160" r="6" fill="#007AFF" stroke="#FFFFFF" strokeWidth="2" />
            </G>
          )}
        </Svg>

        {/* Floating Tooltip Card (Exact match to Dribbble design reference!) */}
        <View style={styles.floatingTooltip}>
          <View style={styles.tooltipHeader}>
            <View
              style={[
                styles.tooltipIndicatorDot,
                { backgroundColor: selectedMuscle.state === 'primed' ? '#10B981' : '#EF4444' },
              ]}
            />
            <Text style={styles.tooltipTargetTitle}>{selectedMuscle.displayName}</Text>
          </View>

          <View style={styles.tooltipScoreRow}>
            <Text style={styles.tooltipScoreNum}>{selectedMuscle.recoveryPct}</Text>
            <Text style={styles.tooltipScoreUnit}>%</Text>
            <View
              style={[
                styles.tooltipTrendBadge,
                { backgroundColor: selectedMuscle.state === 'primed' ? '#E8F9F1' : '#FEE2E2' },
              ]}
            >
              <Text
                style={[
                  styles.tooltipTrendText,
                  { color: selectedMuscle.state === 'primed' ? '#10B981' : '#EF4444' },
                ]}
              >
                {selectedMuscle.state === 'primed' ? '↑ Ready' : '⏳ Repair'}
              </Text>
            </View>
          </View>

          <Text style={styles.tooltipExplain}>
            {selectedMuscle.state === 'fatigued'
              ? `${selectedMuscle.recommendedHoursRemaining}h recovery clock remaining.`
              : 'Muscular fibers 100% recovered with 0 active fatigue debt.'}
          </Text>
        </View>
      </View>

      {/* Spectrum Bar Chart Card (Matches Bottom of Screen 3 in Reference Image) */}
      <View style={styles.spectrumCard}>
        <View style={styles.spectrumHeader}>
          <View>
            <Text style={styles.spectrumTitle}>Muscular Readiness Index</Text>
            <Text style={styles.spectrumSub}>
              {activeMuscles.some(m => m.state !== 'primed')
                ? 'Triangulated from Hevy tonnage & recovery hours'
                : 'No recent strain in 5+ days • All muscle groups primed'}
            </Text>
          </View>
          <View style={styles.spectrumBadge}>
            <Text style={styles.spectrumBadgeText}>{avgReadiness}%</Text>
          </View>
        </View>

        {/* Barcode / Histogram Spectrum with Needle Cursor */}
        <View style={styles.histogramBox}>
          {histogramHeights.map((h, i) => {
            const isNeedle = i === 15; // Active cursor marker
            return (
              <View key={i} style={styles.histCol}>
                <View
                  style={[
                    styles.histBar,
                    {
                      height: h * 0.45,
                      backgroundColor: isNeedle ? '#EF4444' : '#E2E8F0',
                    },
                  ]}
                />
                {isNeedle && (
                  <View style={styles.needleTag}>
                    <Text style={styles.needleTagText}>{avgReadiness}%</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Quick Muscle Selector Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.musclePillsScroll}
        >
          {activeMuscles.map((m) => {
            const isSel = selectedMuscleKey === m.muscle;
            const isPrimed = m.state === 'primed';
            return (
              <TouchableOpacity
                key={m.muscle}
                style={[styles.muscleChip, isSel && styles.muscleChipActive]}
                onPress={() => {
                  setSelectedMuscleKey(m.muscle);
                  if (m.muscle === 'back' || m.muscle === 'triceps' || m.muscle === 'hamstrings') {
                    setViewAngle('back');
                  } else {
                    setViewAngle('front');
                  }
                }}
              >
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: isPrimed ? '#10B981' : '#EF4444' },
                  ]}
                />
                <Text style={[styles.chipText, isSel && styles.chipTextActive]}>
                  {m.displayName}
                </Text>
                <Text style={styles.chipPct}>{m.recoveryPct}%</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 20,
  },
  angleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAF2EE',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  angleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  angleBtnActive: {
    backgroundColor: '#1A1D1C',
    shadowColor: '#1A1D1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  angleText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  angleTextActive: {
    color: '#FFFFFF',
  },
  canvasCard: {
    backgroundColor: '#F4F7F5',
    borderRadius: 24,
    paddingVertical: 14,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowBackdrop: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D5E5DF',
    opacity: 0.5,
    top: 60,
  },
  svg: {
    alignSelf: 'center',
  },
  floatingTooltip: {
    position: 'absolute',
    bottom: 16,
    right: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    width: 170,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tooltipIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  tooltipTargetTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tooltipScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 4,
  },
  tooltipScoreNum: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tooltipScoreUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tooltipTrendBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tooltipTrendText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tooltipExplain: {
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 13,
  },
  spectrumCard: {
    backgroundColor: '#EDE8F5',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#5E4E8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(94, 78, 138, 0.08)',
  },
  spectrumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  spectrumTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E1A29',
  },
  spectrumSub: {
    fontSize: 11,
    color: '#524B6F',
    marginTop: 2,
  },
  spectrumBadge: {
    backgroundColor: 'rgba(94, 78, 138, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  spectrumBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5E4E8A',
  },
  histogramBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 55,
    paddingBottom: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(94, 78, 138, 0.1)',
  },
  histCol: {
    alignItems: 'center',
    position: 'relative',
  },
  histBar: {
    width: 5,
    borderRadius: 2.5,
  },
  needleTag: {
    position: 'absolute',
    top: -18,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  needleTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  musclePillsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  muscleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    gap: 6,
  },
  muscleChipActive: {
    backgroundColor: '#D5E5DF',
    borderColor: '#2C4A3E',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#385348',
  },
  chipTextActive: {
    color: '#141816',
    fontWeight: '800',
  },
  chipPct: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
