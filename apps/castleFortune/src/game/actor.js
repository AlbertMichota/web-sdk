// actor.js
// Castle Fortune game actor
// The actor is the running instance of the xstate betting machine
// It is created inside createGame() via utils-xstate createPrimaryMachines()
// and stored in Svelte context — access it via getContext()
//
// This file provides helper functions for interacting with the actor
// from outside Svelte components (e.g. in storybook stories)

import { getContext } from './context.js';

/**
 * Send a bet action to the game actor
 * Equivalent to the player pressing the spin button
 */
export function sendBet() {
  const { stateXstate } = getContext();
  stateXstate.send({ type: 'BET' });
}

/**
 * Start autobetting for a given number of spins
 * @param {number} count - Number of autospins (0 = infinite)
 */
export function sendAutoBet(count = 0) {
  const { stateXstate } = getContext();
  stateXstate.send({ type: 'AUTOBET', count });
}

/**
 * Stop autobetting
 */
export function sendStopAutoBet() {
  const { stateXstate } = getContext();
  stateXstate.send({ type: 'STOP_AUTOBET' });
}

/**
 * Resume an unfinished bet (called on game load if a bet was interrupted)
 */
export function sendResumeBet() {
  const { stateXstate } = getContext();
  stateXstate.send({ type: 'RESUME_BET' });
}

/**
 * Check if the game is currently in a playing state
 * Used to disable the spin button during animations
 * @returns {boolean}
 */
export function isPlaying() {
  const { stateXstateDerived } = getContext();
  return stateXstateDerived.isPlaying();
}
