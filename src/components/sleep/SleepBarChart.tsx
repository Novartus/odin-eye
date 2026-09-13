import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DailySleepRecord } from '../../services/sleep/sleepHistoryService';

interface SleepBarChartProps {
  records: DailySleepRecord[];
  compact?: boolean;
  onSelectDay?: (record: DailySleepRecord) => void;
  accentVariant?: 'purple' | 'green';
}

export const SleepBarChart: React.FC<SleepBarChartProps> = ({
  records,
  compact = true,
  onSelectDay,
  accentVariant = 'purple',
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Target 8.5 hours (510 minutes) for 100% height calculation
  const TARGET_MINUTES = 510;
  const chartHeight = compact ? 52 : 110;
  const barWidth = compact ? 7 : 16;
  const isPurple = accentVariant === 'purple';

  return (
    <View style={[styles.container, compact ? styles.compactContainer : styles.expandedContainer]}>
      {/* Optional Top Tooltip in expanded mode */}
      {!compact && selectedIdx !== null && records[selectedIdx] && (
        <View style={styles.tooltipBox}>
          <Text style={styles.tooltipDay}>{records[selectedIdx].fullDayLabel} ({records[selectedIdx].date}):</Text>
          <Text style={[styles.tooltipVal, { color: isPurple ? '#7C3AED' : '#10B981' }]}>
            {Math.floor(records[selectedIdx].durationMinutes / 60)}h{' '}
            {records[selectedIdx].durationMinutes % 60}m
            {records[selectedIdx].sleepIndex > 0 && ` • Score: ${records[selectedIdx].sleepIndex}`}
          </Text>
        </View>
      )}

      {/* Bars Row */}
      <View style={[styles.barsRow, { height: chartHeight }]}>
        {records.map((item, idx) => {
          const isSelected = selectedIdx === idx || (selectedIdx === null && item.isToday);
          const hasData = item.durationMinutes > 0;

          // Proportional bar height (min 15% so a rounded pill is always aesthetically visible if data exists)
          const pct = hasData
            ? Math.min(100, Math.max(18, Math.round((item.durationMinutes / TARGET_MINUTES) * 100)))
            : 10;

          // Color palette matching the reference image
          let barBg = '#F1F5F9';
          if (hasData) {
            if (isPurple) {
              if (item.isToday) {
                barBg = '#6D28D9'; // Deep vibrant purple for today
              } else if (pct >= 85) {
                barBg = '#8B5CF6'; // Medium-high purple
              } else if (pct >= 70) {
                barBg = '#A78BFA'; // Medium purple
              } else {
                barBg = '#C4B5FD'; // Soft lavender
              }
            } else {
              // Green variant for steps
              if (item.isToday) {
                barBg = '#059669'; // Deep emerald for today
              } else if (pct >= 85) {
                barBg = '#10B981';
              } else if (pct >= 70) {
                barBg = '#34D399';
              } else {
                barBg = '#6EE7B7';
              }
            }
          }

          return (
            <TouchableOpacity
              key={`${item.date}-${idx}`}
              style={styles.barColumn}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedIdx(idx);
                if (onSelectDay) onSelectDay(item);
              }}
            >
              {/* Background Track & Active Pill */}
              <View style={[styles.track, { height: chartHeight, width: barWidth }]}>
                <View
                  style={[
                    styles.pill,
                    {
                      height: `${pct}%`,
                      width: barWidth,
                      backgroundColor: barBg,
                      opacity: isSelected ? 1 : 0.85,
                      transform: [{ scaleY: isSelected && !compact ? 1.03 : 1 }],
                    },
                  ]}
                />
              </View>

              {/* Day Letter Label */}
              <Text
                style={[
                  styles.dayLabel,
                  item.isToday && (isPurple ? styles.todayLabelPurple : styles.todayLabelGreen),
                  compact && styles.compactDayLabel,
                ]}
              >
                {item.dayLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  compactContainer: {
    marginTop: 10,
  },
  expandedContainer: {
    marginVertical: 14,
    paddingHorizontal: 8,
  },
  tooltipBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignSelf: 'center',
  },
  tooltipDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tooltipVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  track: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pill: {
    borderRadius: 12,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  compactDayLabel: {
    fontSize: 9,
    marginTop: 3,
  },
  todayLabelPurple: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  todayLabelGreen: {
    color: '#059669',
    fontWeight: '800',
  },
});
