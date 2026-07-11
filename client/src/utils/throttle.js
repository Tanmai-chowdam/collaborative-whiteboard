/**
 * Throttle function - limits how often a function can be called.
 * Reduces WebSocket event frequency for cursor movements.
 * Instead of 60 events/sec, limits to ~20 events/sec.
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  let timer = null;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, delay - (now - lastCall));
    }
  };
}