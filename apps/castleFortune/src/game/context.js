// Castle Fortune — Context
// Calls createGame() from games/core with Castle Fortune's specific config
// Every future game does exactly the same thing with its own assets and handlers

import { createGame, getGame } from 'games/core';
import { bookEventHandlerMap } from './bookEventHandlerMap.js';
import { GAME_ASSETS }         from './assets.js';
import { eventEmitter }        from './eventEmitter.js';
import {
  BACKGROUND_RATIO,
  PORTRAIT_BACKGROUND_RATIO,
  DESKTOP_MAIN_SIZES,
  LANDSCAPE_MAIN_SIZES,
  PORTRAIT_MAIN_SIZES,
} from './stateLayout.svelte.js';

// Unique key for this game's Svelte context
const CONTEXT_KEY = 'castleFortune';

/**
 * Set up Castle Fortune's game context
 * Called once at the top of +page.svelte
 */
export function setContext() {
  return createGame({
    contextKey:          CONTEXT_KEY,
    assets:              GAME_ASSETS,
    bookEventHandlerMap,
    eventEmitter,
    defaultBetModeKey:   'base',
    layoutOptions: {
      backgroundRatio: {
        normal: BACKGROUND_RATIO,
        portrait: PORTRAIT_BACKGROUND_RATIO,
      },
      mainSizesMap: {
        desktop: DESKTOP_MAIN_SIZES,
        tablet: { width: 1000, height: 1000 },
        landscape: LANDSCAPE_MAIN_SIZES,
        portrait: PORTRAIT_MAIN_SIZES,
      },
    },
  });
}

/**
 * Get Castle Fortune's context from any child component
 */
export function getContext() {
  return getGame(CONTEXT_KEY);
}
