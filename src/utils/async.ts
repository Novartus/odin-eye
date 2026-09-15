/**
 * Async & Scheduling Utilities
 * Safe non-blocking execution and idle-task dispatching.
 */

/**
 * Executes a non-critical background task when the JavaScript event loop is idle.
 * Uses `requestIdleCallback` when available, falling back safely to a delayed `setTimeout`.
 * Returns a cancellation cleanup function suitable for `useEffect`.
 */
export const runWhenIdle = (
  callback: () => void,
  timeout = 250
): (() => void) => {
  const g: any = typeof globalThis !== 'undefined' ? globalThis : undefined;
  if (g && typeof g.requestIdleCallback === 'function') {
    const handle = g.requestIdleCallback(callback, { timeout });
    return () => {
      if (typeof g.cancelIdleCallback === 'function') {
        g.cancelIdleCallback(handle);
      }
    };
  }
  const timer = setTimeout(callback, 80);
  return () => clearTimeout(timer);
};

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
