// Full Month Interactive Calendar View for Medication Reminders
// Allows navigating through any month/year and picking dates with adherence dot indicators

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../theme/colors';
import { medicationService } from '../../services/medication/medicationService';
import { getTodayDateKey } from '../../utils';
import type { FullMonthCalendarViewProps } from '../../types';

export const FullMonthCalendarView: React.FC<FullMonthCalendarViewProps> = ({
  selectedDateKey,
  onSelectDate,
  onClose,
}) => {
  // Current viewing month and year based on selectedDateKey
  const initialDate = useMemo(() => {
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateKey]);

  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth() + 1); // 1-12

  const todayKey = getTodayDateKey();

  // Get adherence map for this month: dateKey -> { total, taken }
  const adherenceMap = useMemo(() => {
    return medicationService.getMonthAdherenceMap(viewYear, viewMonth);
  }, [viewYear, viewMonth]);

  const monthName = useMemo(() => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const [y, m] = todayKey.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m);
    onSelectDate(todayKey);
  };

  // Build calendar matrix (days array of 35 or 42 slots)
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth - 1, 0).getDate();

    const cells: {
      dayNum: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Preceding month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevM = viewMonth === 1 ? 12 : viewMonth - 1;
      const prevY = viewMonth === 1 ? viewYear - 1 : viewYear;
      const key = `${prevY}-${String(prevM).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNum: day,
        dateKey: key,
        isCurrentMonth: false,
        isToday: key === todayKey,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const key = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNum: d,
        dateKey: key,
        isCurrentMonth: true,
        isToday: key === todayKey,
      });
    }

    // Trailing days to complete grid to 35 or 42
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let r = 1; r <= remaining; r++) {
      const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
      const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
      const key = `${nextY}-${String(nextM).padStart(2, '0')}-${String(r).padStart(2, '0')}`;
      cells.push({
        dayNum: r,
        dateKey: key,
        isCurrentMonth: false,
        isToday: key === todayKey,
      });
    }

    return cells;
  }, [viewYear, viewMonth, todayKey]);

  return (
    <View style={styles.container}>
      {/* Month Navigator Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.arrowBtn} onPress={handlePrevMonth} activeOpacity={0.7}>
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke={Colors.textPrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <View style={styles.monthTitleGroup}>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity onPress={handleJumpToToday} style={styles.todayPill} activeOpacity={0.7}>
            <Text style={styles.todayPillText}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity style={styles.arrowBtn} onPress={handleNextMonth} activeOpacity={0.7}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M9 5l7 7-7 7" stroke={Colors.textPrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={styles.collapseBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.collapseText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekDaysRow}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <Text key={d} style={styles.weekDayLabel}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar Month Grid */}
      <View style={styles.gridContainer}>
        {calendarCells.map((cell) => {
          const isSelected = cell.dateKey === selectedDateKey;
          const adherence = adherenceMap[cell.dateKey];
          const hasDoses = adherence && adherence.total > 0;
          const allTaken = hasDoses && adherence.taken === adherence.total;

          return (
            <TouchableOpacity
              key={cell.dateKey}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                cell.isToday && !isSelected && styles.dayCellToday,
              ]}
              onPress={() => onSelectDate(cell.dateKey)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNum,
                  !cell.isCurrentMonth && styles.dayNumDimmed,
                  isSelected && styles.dayNumSelected,
                ]}
              >
                {cell.dayNum}
              </Text>

              {/* Adherence Dot */}
              <View style={styles.dotContainer}>
                {hasDoses && (
                  <View
                    style={[
                      styles.adherenceDot,
                      {
                        backgroundColor: isSelected
                          ? '#FFFFFF'
                          : allTaken
                          ? '#10B981'
                          : '#007AFF',
                      },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Calendar Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendLabel}>All Taken</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendLabel}>Scheduled</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
          <Text style={styles.legendLabel}>Rest Day</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F5',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 74, 62, 0.08)',
    marginBottom: 16,
    shadowColor: '#1F342C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  todayPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAF2EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseBtn: {
    backgroundColor: '#1A1D1C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  collapseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#1A1D1C',
    shadowColor: '#1A1D1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: '#2C4A3E',
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  dayNumDimmed: {
    color: '#CBD5E1',
    fontWeight: '400',
  },
  dayNumSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dotContainer: {
    height: 6,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adherenceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
