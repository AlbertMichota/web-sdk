// games/core/createEventEmitter.js
// Factory function — each game creates its own isolated emitter instance
// No global state — two games running side by side won't interfere

import { onMount } from 'svelte';

/**
 * @typedef {Object} EventEmitter
 * @property {(type: string, handler: Function) => Function} subscribe
 * @property {(handlerMap: Record<string, Function>) => Function} subscribeMany
 * @property {(event: {type: string, [key: string]: any}) => void} broadcast
 * @property {(event: {type: string, [key: string]: any}) => Promise<void>} broadcastAsync
 * @property {(type: string) => void} clear
 * @property {() => void} clearAll
 */

/**
 * Create a new isolated event emitter
 * @returns {EventEmitter}
 */
export function createEventEmitter() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  function subscribe(type, handler) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(handler);
    return () => listeners.get(type)?.delete(handler);
  }

  function subscribeMany(handlerMap) {
    const unsubs = Object.entries(handlerMap).map(([type, handler]) =>
      subscribe(type, handler)
    );
    return () => unsubs.forEach((u) => u());
  }

  function subscribeOnMount(handlerMap) {
    return onMount(() => subscribeMany(handlerMap));
  }

  function broadcast(event) {
    const handlers = listeners.get(event.type);
    if (!handlers) return;
    for (const handler of handlers) handler(event);
  }

  async function broadcastAsync(event) {
    const handlers = listeners.get(event.type);
    if (!handlers) return;
    const promises = [];
    for (const handler of handlers) {
      const result = handler(event);
      if (result instanceof Promise) promises.push(result);
    }
    await Promise.all(promises);
  }

  function clear(type) { listeners.delete(type); }
  function clearAll()  { listeners.clear(); }

  return { subscribe, subscribeMany, subscribeOnMount, broadcast, broadcastAsync, clear, clearAll };
}
