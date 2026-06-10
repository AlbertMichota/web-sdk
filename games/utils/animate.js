// games/utils/animate.js
// Promise-based animation helpers
// Used by components to signal when an animation is complete

/**
 * Returns a promise that resolves when a spine animation completes
 * @param {object} spineObject - PixiJS spine instance
 * @param {string} animationName
 * @param {boolean} loop - If true resolves after first full loop
 * @returns {Promise<void>}
 */
export function waitForSpineAnimation(spineObject, animationName, loop = false) {
  return new Promise((resolve) => {
    const entry = spineObject.state.setAnimation(0, animationName, loop);
    if (loop) {
      // For looping animations resolve after one full cycle
      entry.listener = {
        complete: () => resolve(),
      };
    } else {
      entry.listener = {
        complete: () => resolve(),
      };
    }
  });
}

/**
 * Returns a promise that resolves after a CSS transition ends on an element
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
export function waitForTransition(element) {
  return new Promise((resolve) => {
    element.addEventListener('transitionend', () => resolve(), { once: true });
  });
}

/**
 * Count a number up from start to end over a given duration
 * Calls onUpdate every frame with the current value
 * @param {object} options
 * @param {number}   options.from
 * @param {number}   options.to
 * @param {number}   options.duration - ms
 * @param {(value: number) => void} options.onUpdate
 * @param {() => void} [options.onComplete]
 * @returns {Promise<void>}
 */
export function countUp({ from, to, duration, onUpdate, onComplete }) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const range = to - from;

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = from + range * eased;

      onUpdate(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        onUpdate(to);
        onComplete?.();
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}
