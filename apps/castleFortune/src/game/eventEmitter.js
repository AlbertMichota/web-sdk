// Castle Fortune — Event Emitter
// Central broadcast system between game logic and components
// bookEventHandlerMap fires events here
// Svelte components subscribe and react to them

import { onMount } from 'svelte';

/**
 * Creates an event emitter with sync and async broadcast support
 */
function createEventEmitter() {
  // Map of event type → Set of listener functions
  const listeners = new Map();

  /**
   * Subscribe to an event type
   * @param {string} type - Event type to listen for
   * @param {Function} handler - Function to call when event fires
   * @returns {Function} Unsubscribe function
   */
  function subscribe(type, handler) {
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type).add(handler);

    // Return unsubscribe function
    return () => {
      listeners.get(type)?.delete(handler);
    };
  }

  /**
   * Subscribe to multiple events at once
   * Returns a single unsubscribe function that clears all
   * @param {Record<string, Function>} handlerMap - { eventType: handler }
   * @returns {Function} Unsubscribe all function
   */
  function subscribeMany(handlerMap) {
    const unsubs = Object.entries(handlerMap).map(([type, handler]) =>
      subscribe(type, handler)
    );
    return () => unsubs.forEach((unsub) => unsub());
  }

  /**
   * Subscribe to multiple events when a component mounts.
   * Matches the event emitter shape expected by shared UI/game helpers.
   * @param {Record<string, Function>} handlerMap
   */
  function subscribeOnMount(handlerMap) {
    return onMount(() => subscribeMany(handlerMap));
  }

  /**
   * Fire an event — all listeners are called synchronously
   * @param {{ type: string, [key: string]: any }} event
   */
  function broadcast(event) {
    const handlers = listeners.get(event.type);
    if (!handlers) return;
    for (const handler of handlers) {
      handler(event);
    }
  }

  /**
   * Fire an event and wait for all async listeners to complete
   * Used when an animation must finish before the next book event starts
   * @param {{ type: string, [key: string]: any }} event
   * @returns {Promise<void>}
   */
  async function broadcastAsync(event) {
    const handlers = listeners.get(event.type);
    if (!handlers) return;
    const promises = [];
    for (const handler of handlers) {
      const result = handler(event);
      if (result instanceof Promise) {
        promises.push(result);
      }
    }
    await Promise.all(promises);
  }

  /**
   * Remove all listeners for a given event type
   * @param {string} type
   */
  function clear(type) {
    listeners.delete(type);
  }

  /**
   * Remove all listeners for all event types
   */
  function clearAll() {
    listeners.clear();
  }

  return {
    subscribe,
    subscribeMany,
    subscribeOnMount,
    broadcast,
    broadcastAsync,
    clear,
    clearAll,
  };
}

// Single shared instance used across the entire game
export const eventEmitter = createEventEmitter();
