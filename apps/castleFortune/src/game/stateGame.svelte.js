// Castle Fortune — Game State
// Central reactive state for the game
// Uses Svelte 5 $state rune for reactivity
// Imported by components that need to read or write game state

import { INITIAL_BOARD, SCATTER_LAND_SOUND_MAP, SPIN_OPTIONS_DEFAULT, SPIN_OPTIONS_FAST } from './constants.js';
import { eventEmitter } from './eventEmitter.js';

// ── Game state ────────────────────────────────────────────────────────────────

export const gameState = $state({
  // Current game mode — changes when freespins start/end
  gameType: /** @type {'basegame'|'freegame'|'superfreegame'|'superbonus'|'super_bonus'} */ ('basegame'),

  // The live board — 5 reels x 6 rows (4 visible + 1 padding each side)
  // Updated by the reveal book event
  board: INITIAL_BOARD.map((reel) => [...reel]),

  // How many scatters have landed this spin
  // Used to pick the right landing sound
  scatterCount: 0,

  // Wild blocks present on the current board
  // Populated by wildBlock book events, cleared on next reveal
  wildBlocks: /** @type {import('./typesBookEvent').WildBlockEvent[]} */ ([]),

  // Total multiplier for the current spin
  // Set by wildMultiplier book event, reset on next reveal
  currentMultiplier: 1,

  // Whether the stop button is active during freespins
  stopButtonEnabled: false,

  // Freespin counter state
  freeSpins: {
    current: 0,
    total:   0,
    visible: false,
  },
});

// ── Scatter landing sound helper ───────────────────────────────────────────────

/**
 * Get the correct scatter landing sound based on how many have landed
 * @returns {string} Sound alias
 */
export function getScatterLandSound() {
  const count = Math.max(1, Math.min(5, gameState.scatterCount));
  return SCATTER_LAND_SOUND_MAP[count];
}

// ── Symbol land handler ───────────────────────────────────────────────────────
// Called by the reel system each time a symbol lands on the board

/**
 * @param {{ name: string }} rawSymbol
 */
export function onSymbolLand(rawSymbol) {
  if (rawSymbol.name === 'S') {
    gameState.scatterCount += 1;
    eventEmitter.broadcast({ type: 'soundOnce', name: getScatterLandSound() });
    eventEmitter.broadcast({ type: 'scatterCounterIncrease' });
  }

  if (rawSymbol.name === 'W') {
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_wild_land' });
  }
}

// ── Spin options helper ───────────────────────────────────────────────────────

/**
 * Returns the correct spin physics based on turbo mode
 * @param {boolean} isTurbo
 */
export function getSpinOptions(isTurbo) {
  return isTurbo ? SPIN_OPTIONS_FAST : SPIN_OPTIONS_DEFAULT;
}

// ── State reset helpers ────────────────────────────────────────────────────────

/**
 * Reset per-spin state before each new spin
 */
export function resetSpinState() {
  gameState.scatterCount     = 0;
  gameState.wildBlocks       = [];
  gameState.currentMultiplier = 1;
}
