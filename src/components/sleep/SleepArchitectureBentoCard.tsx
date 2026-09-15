import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { sleepHistoryService } from '../../services/sleep/sleepHistoryService';
import type {
  SleepDebtAnalysis,
  SleepArchitectureBalance,
  SleepArchitectureBentoCardProps,
} from '../../types';

export const SleepArchitectureBentoCard: React.FC<SleepArchitectureBentoCardProps> = React.memo(({
  recovery,
  targetSleepHours = 8.0,
  onPress,
  style,
}) => {
  const { debtAnalysis, archBalance } = useMemo(() => {
    const debt: SleepDebtAnalysis = sleepHistoryService.getSleepDebtAnalysis(
      targetSleepHours,
      recovery.sleepDurationMinutes,
      recovery.sleepIndex,
      recovery.sleepEfficiencyPct,
      recovery.deepSleepPct,
      recovery.remSleepPct
    );

    const arch: SleepArchitectureBalance = sleepHistoryService.getSleepArchitectureBalance(
      recovery.sleepDurationMinutes,
      recovery.deepSleepPct,
      recovery.remSleepPct,
      recovery.lightSleepPct,
      recovery.awakePct,
      recovery.restingHeartRate,
      recovery.sleepHeartRateAvg,
      recovery.sleepHeartRateMin,
      recovery.sleepHeartRateMax
    );

    return { debtAnalysis: debt, archBalance: arch };
  }, [recovery, targetSleepHours]);

  const formatHoursMinutes = (minutes: number): string => {
    if (minutes <= 0) return '0h 00m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  // Color mappings based on debt status
  const debtBadgeStyle = useMemo(() => {
    switch (debtAnalysis.debtStatus) {
      case 'surplus':
      case 'rested':
        return {
          bg: '#EAF2EE',
          text: '#2C4A3E',
          border: '#CCE6DE',
        };
      case 'mild_debt':
        return {
          bg: '#FFF8E8',
          text: '#8F6118',
          border: '#F4E3BC',
        };
      case 'moderate_debt':
      case 'severe_debt':
      default:
        return {
          bg: '#FFF1E8',
          text: '#9C3D26',
          border: '#FCD7C8',
        };
    }
  }, [debtAnalysis.debtStatus]);

  const deepStatusColor = archBalance.deepEvaluation === 'optimal'
    ? '#2C4A3E'
    : archBalance.deepEvaluation === 'high'
    ? '#1F382E'
    : '#8F6118';

  const remStatusColor = archBalance.remEvaluation === 'optimal'
    ? '#4A3B66'
    : archBalance.remEvaluation === 'high'
    ? '#382B54'
    : '#8F6118';

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
    >
      {/* Top Header Row: Category Badge + Debt Status Pill + Action Arrow */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>SLEEP ARCHITECTURE & DEBT</Text>
          </View>
          <Text style={styles.headline}>7-Day Biological Equilibrium</Text>
        </View>

        <View style={styles.headerRight}>
          <View
            style={[
              styles.debtPill,
              { backgroundColor: debtBadgeStyle.bg, borderColor: debtBadgeStyle.border },
            ]}
          >
            <Text style={[styles.debtPillText, { color: debtBadgeStyle.text }]}>
              {debtAnalysis.debtStatusLabel}
            </Text>
          </View>

          {onPress && (
            <View style={styles.arrowCircle}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="#2C4A3E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          )}
        </View>
      </View>

      {/* 1. 4-Stage Architectural Breakdown: Awake, REM, Light, Deep with % and Duration */}
      <View style={styles.stageBreakdownCard}>
        <View style={styles.stageBreakdownHeader}>
          <Text style={styles.stageBreakdownTitle}>Sleep Stages & Proportion</Text>
          <Text style={styles.stageBreakdownDuration}>
            {formatHoursMinutes(recovery.sleepDurationMinutes)} Total
          </Text>
        </View>

        {/* Visual Segmented Hypnogram Proportion Bar */}
        <View style={styles.hypnogramTrack}>
          {archBalance.deepSleepPct > 0 && (
            <View
              style={[
                styles.hypnogramSegment,
                { width: `${archBalance.deepSleepPct}%`, backgroundColor: '#1F382E' },
              ]}
            />
          )}
          {archBalance.remSleepPct > 0 && (
            <View
              style={[
                styles.hypnogramSegment,
                { width: `${archBalance.remSleepPct}%`, backgroundColor: '#6C548F' },
              ]}
            />
          )}
          {archBalance.lightSleepPct > 0 && (
            <View
              style={[
                styles.hypnogramSegment,
                { width: `${archBalance.lightSleepPct}%`, backgroundColor: '#7FB3A0' },
              ]}
            />
          )}
          {archBalance.awakePct > 0 && (
            <View
              style={[
                styles.hypnogramSegment,
                { width: `${archBalance.awakePct}%`, backgroundColor: '#E06D53' },
              ]}
            />
          )}
        </View>

        {/* 4 Granular Stage Chips (Deep, REM, Light, Awake) */}
        <View style={styles.stagesGrid}>
          {/* Deep Sleep */}
          <View style={[styles.stageChip, { backgroundColor: '#F0F6F3', borderColor: '#CCE2D7' }]}>
            <View style={styles.stageChipTop}>
              <View style={[styles.stageDot, { backgroundColor: '#1F382E' }]} />
              <Text style={styles.stageChipLabel}>Deep</Text>
              <Text style={[styles.stageChipPct, { color: '#1F382E' }]}>{archBalance.deepSleepPct}%</Text>
            </View>
            <Text style={styles.stageChipVal}>{formatHoursMinutes(archBalance.deepSleepMinutes)}</Text>
          </View>

          {/* REM Sleep */}
          <View style={[styles.stageChip, { backgroundColor: '#F7F4FA', borderColor: '#E5DCF0' }]}>
            <View style={styles.stageChipTop}>
              <View style={[styles.stageDot, { backgroundColor: '#6C548F' }]} />
              <Text style={styles.stageChipLabel}>REM</Text>
              <Text style={[styles.stageChipPct, { color: '#6C548F' }]}>{archBalance.remSleepPct}%</Text>
            </View>
            <Text style={styles.stageChipVal}>{formatHoursMinutes(archBalance.remSleepMinutes)}</Text>
          </View>

          {/* Light Sleep */}
          <View style={[styles.stageChip, { backgroundColor: '#F2F8F6', borderColor: '#CFE6DD' }]}>
            <View style={styles.stageChipTop}>
              <View style={[styles.stageDot, { backgroundColor: '#5E9882' }]} />
              <Text style={styles.stageChipLabel}>Light</Text>
              <Text style={[styles.stageChipPct, { color: '#2C5A48' }]}>{archBalance.lightSleepPct}%</Text>
            </View>
            <Text style={styles.stageChipVal}>{formatHoursMinutes(archBalance.lightSleepMinutes)}</Text>
          </View>

          {/* Awake Time */}
          <View style={[styles.stageChip, { backgroundColor: '#FDF5F2', borderColor: '#F5DCD5' }]}>
            <View style={styles.stageChipTop}>
              <View style={[styles.stageDot, { backgroundColor: '#E06D53' }]} />
              <Text style={styles.stageChipLabel}>Awake</Text>
              <Text style={[styles.stageChipPct, { color: '#B8452D' }]}>{archBalance.awakePct}%</Text>
            </View>
            <Text style={styles.stageChipVal}>{formatHoursMinutes(archBalance.awakeMinutes)}</Text>
          </View>
        </View>
      </View>

      {/* Spacious Restorative Bento Sections (Stacked for optimal readability & breathing room) */}
      <View style={styles.pillarsContainer}>
        {/* 1. Physical Restoration Card (Deep Sleep) */}
        <View style={[styles.restorationCard, { backgroundColor: '#F4F8F6', borderColor: '#DCECE4' }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#E0EFE8' }]}>
                {/* Moon / Slow-Wave Icon */}
                <Svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    stroke="#1F382E"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.cardTitleCol}>
                <Text style={styles.cardTitle}>Physical Restoration</Text>
                <Text style={styles.cardSubtitle}>Slow-Wave Deep Sleep</Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardMetricBig}>{formatHoursMinutes(archBalance.deepSleepMinutes)}</Text>
              <View style={[styles.pctPill, { backgroundColor: '#CCE6DE' }]}>
                <Text style={[styles.pctPillText, { color: '#183B2E' }]}>
                  {archBalance.deepSleepPct}%
                </Text>
              </View>
            </View>
          </View>

          {/* Target Progress Bar Track */}
          <View style={styles.gaugeContainer}>
            <View style={styles.targetBarTrack}>
              <View
                style={[
                  styles.targetBarFill,
                  {
                    width: `${Math.min(100, Math.max(8, archBalance.deepSleepPct * 2.5))}%`,
                    backgroundColor: '#356A56',
                  },
                ]}
              />
              {/* Target Optimal Window Indicator: 15% - 25% (37.5% to 62.5%) */}
              <View style={[styles.targetWindowBracket, { left: '37.5%', width: '25%' }]} />
            </View>

            <View style={styles.gaugeMetaRow}>
              <Text style={styles.gaugeMetaTarget}>Optimal Target: 15% – 25%</Text>
              <View style={[styles.evalBadge, { backgroundColor: '#E2EFE9' }]}>
                <Text style={[styles.evalBadgeText, { color: deepStatusColor }]}>
                  {archBalance.deepEvaluationLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Descriptive Summary */}
          <Text style={styles.cardDescription}>
            {archBalance.physicalRestorationAdvice}
          </Text>
        </View>

        {/* 2. Cognitive Resilience Card (REM Sleep) */}
        <View style={[styles.restorationCard, { backgroundColor: '#F8F5FB', borderColor: '#E9E2F2' }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#EDE4F7' }]}>
                {/* Brain / Synapse Wave Icon */}
                <Svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"
                    stroke="#4F3B6B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"
                    stroke="#4F3B6B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.cardTitleCol}>
                <Text style={styles.cardTitle}>Cognitive Processing</Text>
                <Text style={styles.cardSubtitle}>REM Paradoxical Sleep</Text>
              </View>
            </View>

            <View style={styles.cardHeaderRight}>
              <Text style={styles.cardMetricBig}>{formatHoursMinutes(archBalance.remSleepMinutes)}</Text>
              <View style={[styles.pctPill, { backgroundColor: '#E2D5F2' }]}>
                <Text style={[styles.pctPillText, { color: '#3A2756' }]}>
                  {archBalance.remSleepPct}%
                </Text>
              </View>
            </View>
          </View>

          {/* Target Progress Bar Track */}
          <View style={styles.gaugeContainer}>
            <View style={styles.targetBarTrack}>
              <View
                style={[
                  styles.targetBarFill,
                  {
                    width: `${Math.min(100, Math.max(8, archBalance.remSleepPct * 2.5))}%`,
                    backgroundColor: '#6C548F',
                  },
                ]}
              />
              {/* Target Optimal Window Indicator: 20% - 25% (50% to 62.5%) */}
              <View style={[styles.targetWindowBracket, { left: '50%', width: '12.5%' }]} />
            </View>

            <View style={styles.gaugeMetaRow}>
              <Text style={styles.gaugeMetaTarget}>Optimal Target: 20% – 25%</Text>
              <View style={[styles.evalBadge, { backgroundColor: '#EFE7F8' }]}>
                <Text style={[styles.evalBadgeText, { color: remStatusColor }]}>
                  {archBalance.remEvaluationLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Descriptive Summary */}
          <Text style={styles.cardDescription}>
            {archBalance.cognitiveResilienceAdvice}
          </Text>
        </View>
      </View>

      {/* 3. Nocturnal Sleep Heart Rate & Autonomic Dip Card */}
      <View style={styles.nocturnalHrCard}>
        <View style={styles.nocturnalHrTop}>
          <View style={styles.nocturnalHrTitleRow}>
            <View style={styles.nocturnalHrIconBubble}>
              <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
                  stroke="#BE123C"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nocturnalHrTitle}>Nocturnal Sleep Heart Rate</Text>
              <Text style={styles.nocturnalHrSub}>Cardiovascular deceleration & autonomic dip</Text>
            </View>
          </View>

          {archBalance.cardiovascularDipLabel && (
            <View
              style={[
                styles.dipPill,
                {
                  backgroundColor:
                    archBalance.cardiovascularDipEvaluation === 'optimal'
                      ? '#DCFCE7'
                      : archBalance.cardiovascularDipEvaluation === 'shallow'
                      ? '#FEF3C7'
                      : '#EAF2EE',
                },
              ]}
            >
              <Text
                style={[
                  styles.dipPillText,
                  {
                    color:
                      archBalance.cardiovascularDipEvaluation === 'optimal'
                        ? '#15803D'
                        : archBalance.cardiovascularDipEvaluation === 'shallow'
                        ? '#B45309'
                        : '#2C4A3E',
                  },
                ]}
              >
                {archBalance.cardiovascularDipLabel}
              </Text>
            </View>
          )}
        </View>

        {/* 4-Stat Nocturnal Pulse Grid: Avg, Min (Dip), Max, Resting */}
        <View style={styles.nocturnalGrid}>
          <View style={styles.nocturnalStatItem}>
            <Text style={styles.nocturnalStatLabel}>AVG PULSE</Text>
            <Text style={styles.nocturnalStatVal}>
              {archBalance.sleepHeartRateAvg ? `${archBalance.sleepHeartRateAvg}` : '—'}
              <Text style={styles.nocturnalStatUnit}> bpm</Text>
            </Text>
            <Text style={styles.nocturnalStatDesc}>Mean nocturnal</Text>
          </View>

          <View style={styles.nocturnalStatItem}>
            <Text style={styles.nocturnalStatLabel}>LOWEST DIP</Text>
            <Text style={[styles.nocturnalStatVal, { color: '#047857' }]}>
              {archBalance.sleepHeartRateMin ? `${archBalance.sleepHeartRateMin}` : '—'}
              <Text style={styles.nocturnalStatUnit}> bpm</Text>
            </Text>
            <Text style={styles.nocturnalStatDesc}>Basal slow-wave</Text>
          </View>

          <View style={styles.nocturnalStatItem}>
            <Text style={styles.nocturnalStatLabel}>PEAK PULSE</Text>
            <Text style={styles.nocturnalStatVal}>
              {archBalance.sleepHeartRateMax ? `${archBalance.sleepHeartRateMax}` : '—'}
              <Text style={styles.nocturnalStatUnit}> bpm</Text>
            </Text>
            <Text style={styles.nocturnalStatDesc}>Arousal / dreams</Text>
          </View>

          <View style={styles.nocturnalStatItem}>
            <Text style={styles.nocturnalStatLabel}>RESTING RHR</Text>
            <Text style={styles.nocturnalStatVal}>
              {recovery.restingHeartRate > 0 ? `${recovery.restingHeartRate}` : '—'}
              <Text style={styles.nocturnalStatUnit}> bpm</Text>
            </Text>
            <Text style={styles.nocturnalStatDesc}>24-hour baseline</Text>
          </View>
        </View>

        {archBalance.cardiovascularAdvice ? (
          <Text style={styles.nocturnalAdviceText}>
            {archBalance.cardiovascularAdvice}
          </Text>
        ) : null}
      </View>

      {/* Somatic Recovery Coaching Banner */}
      <View style={styles.coachingBanner}>
        <View style={styles.coachingIconWrap}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke="#2C4A3E" strokeWidth="1.8" />
            <Path d="M12 8v5M12 16h.01" stroke="#2C4A3E" strokeWidth="2.2" strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={styles.coachingText}>
          {debtAnalysis.advice}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FAF5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#82654D',
    letterSpacing: 0.8,
  },
  headline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181C1B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debtPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  debtPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 14,
  },
  restorationCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181C1B',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7B827E',
    marginTop: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  cardMetricBig: {
    fontSize: 17,
    fontWeight: '800',
    color: '#181C1B',
  },
  pctPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pctPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  gaugeContainer: {
    marginBottom: 10,
  },
  targetBarTrack: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 6,
  },
  targetBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetWindowBracket: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  gaugeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gaugeMetaTarget: {
    fontSize: 10,
    fontWeight: '600',
    color: '#828C86',
  },
  evalBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  evalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#55615B',
    fontWeight: '500',
  },
  coachingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  coachingIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachingText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#384640',
    fontWeight: '500',
  },

  // 4-Stage Architectural Breakdown Card & Segmented Hypnogram
  stageBreakdownCard: {
    backgroundColor: '#FAFCFB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E6ECE9',
    marginBottom: 12,
  },
  stageBreakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stageBreakdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#181C1B',
  },
  stageBreakdownDuration: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B574C',
  },
  hypnogramTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  hypnogramSegment: {
    height: '100%',
  },
  stagesGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  stageChip: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  stageChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stageChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#55615B',
  },
  stageChipPct: {
    fontSize: 10,
    fontWeight: '800',
  },
  stageChipVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#181C1B',
  },

  // Nocturnal Sleep Heart Rate Card
  nocturnalHrCard: {
    backgroundColor: '#FFFBFB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 12,
  },
  nocturnalHrTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  nocturnalHrTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 160,
  },
  nocturnalHrIconBubble: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nocturnalHrTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181C1B',
  },
  nocturnalHrSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  dipPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dipPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  nocturnalGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#FEE8E8',
    marginBottom: 8,
    gap: 4,
  },
  nocturnalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  nocturnalStatLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nocturnalStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181C1B',
  },
  nocturnalStatUnit: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  nocturnalStatDesc: {
    fontSize: 8.5,
    color: '#64748B',
    marginTop: 1,
  },
  nocturnalAdviceText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#475569',
    fontWeight: '500',
  },
});
