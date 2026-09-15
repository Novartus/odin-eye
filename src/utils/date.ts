/**
 * Date & Time Utilities
 * Centralized ISO and local date formatting, time parsing, and day computations.
 */

/**
 * Returns a 'YYYY-MM-DD' formatted date string in local time, optionally offset by a number of days.
 * @param offsetDays Positive for future days, negative for past days (default: 0).
 */
export const getTodayDateKey = (offsetDays = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  return formatDateKey(d);
};

/**
 * Formats any Date object into a standard 'YYYY-MM-DD' key.
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a standard time string ('HH:mm', 'HH:mm:ss', or 'hh:mm AM/PM') into 24-hour hour & minute numbers.
 * Returns null if format is unparseable.
 */
export const parseTime = (
  timeStr: string
): { hour: number; minute: number; hours: number; minutes: number } | null => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hour < 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return { hour, minute, hours: hour, minutes: minute };
};

/**
 * Formats hour and minute integers into a human-readable display string ('08:00 AM' or '20:00').
 */
export const formatDisplayTime = (
  hour: number,
  minute: number,
  is24Hour = false
): string => {
  const minPad = String(minute).padStart(2, '0');

  if (is24Hour) {
    return `${String(hour).padStart(2, '0')}:${minPad}`;
  }

  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(displayHour).padStart(2, '0')}:${minPad} ${period}`;
};

/**
 * Formats a Date object into human-readable header string (e.g. "Monday, September 14").
 */
export const formatHeaderDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns localized day name for a given date.
 */
export const getDayName = (
  date: Date,
  format: 'short' | 'long' = 'short'
): string => {
  return date.toLocaleDateString('en-US', { weekday: format });
};
