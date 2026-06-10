// games/utils/sequence.js
// Run an array of async tasks one after another
// Used by bookEventHandlerMap to animate wins one payline at a time

/**
 * Run an array of items through an async handler in sequence
 * Waits for each one to finish before starting the next
 * @template T
 * @param {T[]} items
 * @param {(item: T) => Promise<void>} handler
 * @returns {Promise<void>}
 */
export async function sequence(items, handler) {
  for (const item of items) {
    await handler(item);
  }
}

/**
 * Run an array of items through an async handler in parallel
 * All start at the same time, waits for all to finish
 * @template T
 * @param {T[]} items
 * @param {(item: T) => Promise<void>} handler
 * @returns {Promise<void>}
 */
export async function parallel(items, handler) {
  await Promise.all(items.map(handler));
}

/**
 * Wait for a given number of milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
