// games/core/createGame.js
// Main factory function every game calls from its context.js
// Wires together StakeEngine packages and registers all required contexts

import { setContext as setSvelteContext, getContext as getSvelteContext } from 'svelte';
import { createApp, setContextApp }                from 'pixi-svelte';
import { createLayout, setContextLayout }          from 'utils-layout';
import {
  createGameActor,
  createIntermediateMachines,
  createPrimaryMachines,
  createXstate,
  setContextXstate,
} from 'utils-xstate';
import { setContextEventEmitter }                  from 'utils-event-emitter';
import { createEventEmitter }                      from './createEventEmitter.js';
import { createBookPlayer }                        from './createBookPlayer.js';
import { createSoundManager }                      from '../ui/createSoundManager.js';

const DEFAULT_LAYOUT_OPTIONS = {
  backgroundRatio: {
    normal: 2039 / 1000,
    portrait: 1242 / 2208,
  },
  mainSizesMap: {
    desktop: { width: 1422, height: 800 },
    tablet: { width: 1000, height: 1000 },
    landscape: { width: 1600, height: 900 },
    portrait: { width: 800, height: 1422 },
  },
};

/**
 * @param {{
 *   contextKey: string,
 *   assets: object[],
 *   bookEventHandlerMap: Record<string, Function>,
 *   eventEmitter?: object,
 *   defaultBetModeKey?: string,
 *   getRgsConfig?: Function,
 *   layoutOptions?: {
 *     backgroundRatio: { normal: number; portrait: number; },
 *     mainSizesMap: Record<string, { width: number; height: number; }>,
 *   },
 * }} options
 */
export function createGame(options) {
  const {
    contextKey,
    assets,
    bookEventHandlerMap,
    eventEmitter: providedEventEmitter,
    defaultBetModeKey = 'base',
    getRgsConfig      = defaultGetRgsConfig,
    layoutOptions     = DEFAULT_LAYOUT_OPTIONS,
  } = options;

  // ── Event emitter ──────────────────────────────────────────────────────────
  const eventEmitter = providedEventEmitter ?? createEventEmitter();

  // ── Book player ────────────────────────────────────────────────────────────
  const bookPlayer = createBookPlayer({ bookEventHandlerMap });

  // ── PixiJS app — only takes assets ────────────────────────────────────────
  const { stateApp } = createApp({ assets });

  // ── Layout ─────────────────────────────────────────────────────────────────
  const { stateLayout, stateLayoutDerived } = createLayout(layoutOptions);

  // ── Sound manager ──────────────────────────────────────────────────────────
  const { sound: soundManager } = createSoundManager({ eventEmitter });

  // ── XState betting machine ─────────────────────────────────────────────────
  const { stateXstate, stateXstateDerived } = createXstate();
  const primaryMachines = createPrimaryMachines({
    onResumeGameActive: (betToResume) => betToResume,
    onResumeGameInactive: (betToResume) => {
      if (betToResume?.state) bookPlayer.playBook(betToResume.state);
    },
    onNewGameStart: async () => undefined,
    onNewGameError: () => undefined,
    onPlayGame: async (bet) => {
      if (bet?.state) await bookPlayer.playBook(bet.state);
    },
    checkIsBonusGame: (bet) => Boolean(bet?.active),
  });
  const intermediateMachines = createIntermediateMachines(primaryMachines);
  const gameActor = createGameActor(intermediateMachines);

  // ── Register all four required StakeEngine contexts ────────────────────────
  setContextApp({ stateApp });
  setContextEventEmitter({ eventEmitter });
  setContextLayout({ stateLayout, stateLayoutDerived });
  setContextXstate({ stateXstate, stateXstateDerived });

  // ── Store in game-specific Svelte context ──────────────────────────────────
  const context = {
    eventEmitter,
    bookPlayer,
    stateApp,
    stateLayout,
    stateLayoutDerived,
    soundManager,
    gameActor,
    stateXstate,
    stateXstateDerived,
  };

  setSvelteContext(contextKey, context);

  return context;
}

export function getGame(contextKey) {
  return getSvelteContext(contextKey);
}

function defaultGetRgsConfig() {
  const params = new URLSearchParams(window.location.search);
  return {
    sessionID: params.get('sessionID') ?? 'dev-session',
    currency:  params.get('currency')  ?? 'USD',
    rgsUrl:    params.get('rgs_url')   ?? '',
    lang:      params.get('lang')      ?? 'en',
  };
}
