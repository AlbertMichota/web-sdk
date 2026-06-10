// stateXstate.svelte.js
// Exposes the xstate betting machine state for Castle Fortune
// The actual machine is created in games/core/createGame.js via utils-xstate
// Components import getContext() to access stateXstate directly
// This file documents the shape of the state for reference

/**
 * stateXstate shape — created by utils-xstate createPrimaryMachines()
 * Access via: const { stateXstate, stateXstateDerived } = getContext()
 *
 * stateXstate = $state({
 *   value: string  — current machine state name
 * })
 *
 * stateXstateDerived = {
 *   matchesXstate:   (state: string) => boolean
 *   isRendering:     () => boolean  — loading assets
 *   isIdle:          () => boolean  — waiting for player input
 *   isBetting:       () => boolean  — single bet in progress
 *   isAutoBetting:   () => boolean  — autobet running
 *   isResumingBet:   () => boolean  — resuming unfinished bet
 *   isForcingResult: () => boolean  — force result mode
 *   isPlaying:       () => boolean  — any non-idle state
 * }
 *
 * To trigger a bet from a component:
 *   stateXstate.send({ type: 'BET' })
 *
 * To start autobet:
 *   stateXstate.send({ type: 'AUTOBET', count: 10 })
 *
 * To stop autobet:
 *   stateXstate.send({ type: 'STOP_AUTOBET' })
 */

// ── Bet mode helpers ──────────────────────────────────────────────────────
// Castle Fortune has two bet modes: base and bonus (buy bonus)

export const BET_MODE_KEYS = {
  BASE:  'base',
  BONUS: 'bonus',
};

/**
 * Check if the current bet mode is buy bonus
 * @param {string} activeBetModeKey
 * @returns {boolean}
 */
export function isBuyBonus(activeBetModeKey) {
  return activeBetModeKey === BET_MODE_KEYS.BONUS;
}
