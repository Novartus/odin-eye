/**
 * Formatting Utilities
 * Standardized formatters for duration, numbers, percentages, and metrics.
 */

/**
 * Formats duration in seconds into 'mm:ss' (or 'h:mm:ss' if >= 1 hour).
 */
export const formatDuration = (totalSeconds: number): string => {
  const rounded = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;

  const minPad = String(minutes).padStart(hours > 0 ? 2 : 1, '0');
  const secPad = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${minPad}:${secPad}`;
  }
  return `${minPad}:${secPad}`;
};

/**
 * Formats duration in minutes into friendly string (e.g. "7h 42m" or "45m").
 */
export const formatMinutesFriendly = (minutes: number): string => {
  const rounded = Math.max(0, Math.round(minutes));
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Formats a number with standard thousand-separators (e.g. 12,345).
 */
export const formatNumber = (val: number, decimals = 0): string => {
  if (isNaN(val) || !isFinite(val)) return '0';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Formats a ratio or percentage safely (e.g. 0.854 -> "85%").
 * @param isRatio If true, multiplies by 100 before formatting. Default false.
 */
export const formatPercentage = (
  val: number,
  decimals = 0,
  isRatio = false
): string => {
  if (isNaN(val) || !isFinite(val)) return '0%';
  const num = isRatio ? val * 100 : val;
  return `${num.toFixed(decimals)}%`;
};
