// Castle Fortune — Book Event Handler Map
// Each handler receives a book event from the math-sdk
// and fires the appropriate emitter events to drive animations
// Handlers run in sequence — broadcastAsync waits for animations to finish

import { eventEmitter } from './eventEmitter.js';
import { getWinLevelData } from './winLevelMap.js';
import { gameState } from './stateGame.svelte.js';
import { countUp } from 'games/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Play win level sounds
 * @param {import('./winLevelMap').WinLevelData} winLevelData
 */
function playWinLevelSounds(winLevelData) {
  if (winLevelData.sound?.sfx) {
    eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
  }
  if (winLevelData.sound?.bgm) {
    eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
  }
  if (winLevelData.type === 'big') {
    eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_win_coinloop' });
  }
}

/**
 * Stop win level sounds and return to appropriate background music
 */
function stopWinLevelSounds() {
  eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_win_coinloop' });
  if (gameState.gameType === 'freegame') {
    eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
  } else {
    eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
  }
}

/**
 * Animate a set of symbol positions (used for win lines and scatter highlights)
 * @param {Array<{reel: number, row: number}>} positions
 */
async function animateSymbols(positions) {
  eventEmitter.broadcast({ type: 'boardShow' });
  await eventEmitter.broadcastAsync({
    type: 'boardAnimateSymbols',
    positions,
  });
}

// ── Book event handlers ───────────────────────────────────────────────────────

export const bookEventHandlerMap = {

  /**
   * Reels stop and board is revealed
   * Drives the reel spin and symbol land animations
   */
  reveal: async (bookEvent) => {
    gameState.gameType = bookEvent.gameType;

    await eventEmitter.broadcastAsync({
      type:           'boardReveal',
      board:          bookEvent.board,
      paddingPositions: bookEvent.paddingPositions,
      anticipation:   bookEvent.anticipation,
      gameType:       bookEvent.gameType,
    });

    // Reset scatter counter for this spin
    eventEmitter.broadcast({ type: 'scatterCounterReset' });
  },

  /**
   * Wild block formed — animate it growing from 2x2 up to final size
   * grewFrom drives the animation sequence:
   *   [2]       → just 2x2 forming
   *   [2, 3]    → 2x2 then expands to 3x3
   *   [2, 3, 4] → 2x2 then 3x3 then 4x4
   */
  wildBlock: async (bookEvent) => {
    const soundMap = {
      2: 'sfx_wildblock_2x2',
      3: 'sfx_wildblock_3x3',
      4: 'sfx_wildblock_4x4',
    };

    eventEmitter.broadcast({
      type: 'soundOnce',
      name: soundMap[bookEvent.finalSize] ?? 'sfx_wildblock_2x2',
    });

    await eventEmitter.broadcastAsync({
      type:       'wildBlockAnimate',
      reel:       bookEvent.reel,
      row:        bookEvent.row,
      grewFrom:   bookEvent.grewFrom,
      finalSize:  bookEvent.finalSize,
      positions:  bookEvent.positions,
      multiplier: bookEvent.multiplier,
    });
  },

  /**
   * Total multiplier for this spin — show on screen
   * Only fires when totalMultiplier > 1
   */
  wildMultiplier: async (bookEvent) => {
    if (bookEvent.totalMultiplier <= 1) return;

    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_show' });

    eventEmitter.broadcast({
      type:            'wildMultiplierShow',
      totalMultiplier: bookEvent.totalMultiplier,
    });

    await eventEmitter.broadcastAsync({ type: 'wildMultiplierAnimate' });
    eventEmitter.broadcast({ type: 'wildMultiplierHide' });
  },

  /**
   * Winning paylines — highlight each line one by one
   */
  winInfo: async (bookEvent) => {
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_win_small' });

    for (const win of bookEvent.wins) {
      await animateSymbols(win.positions);
    }
  },

  /**
   * Running total win amount update
   */
  setTotalWin: async (bookEvent) => {
    eventEmitter.broadcast({
      type:   'totalWinUpdate',
      amount: bookEvent.amount,
    });
  },

  /**
   * 3+ scatters landed in base game — trigger freespins
   */
  freeSpinTrigger: async (bookEvent) => {
    // Highlight scatter positions
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_freespin_trigger' });
    await animateSymbols(bookEvent.positions);

    // Hide UI and transition to freespins
    await eventEmitter.broadcastAsync({ type: 'uiHide' });
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_transition' });
    await eventEmitter.broadcastAsync({ type: 'transition' });

    // Show freespin intro screen
    eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_freespin_intro' });
    eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });

    await eventEmitter.broadcastAsync({
      type:         'freeSpinIntroUpdate',
      totalFreeSpins: bookEvent.totalFs,
    });

    // Switch game state to the bonus mode requested by the book event.
    gameState.gameType = bookEvent.gameType ?? 'freegame';

    // Hide intro and show counter
    eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
    eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
    eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
    eventEmitter.broadcast({
      type:    'freeSpinCounterUpdate',
      current: undefined,
      total:   bookEvent.totalFs,
    });

    await eventEmitter.broadcastAsync({ type: 'uiShow' });
  },

  /**
   * 2+ scatters during freespins — add more spins
   */
  freeSpinRetrigger: async (bookEvent) => {
    // Highlight scatter positions
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_freespin_retrigger' });
    await animateSymbols(bookEvent.positions);

    // Show retrigger banner
    await eventEmitter.broadcastAsync({
      type:         'freeSpinRetriggerShow',
      totalFreeSpins: bookEvent.totalFs,
    });
    eventEmitter.broadcast({ type: 'freeSpinRetriggerHide' });

    // Update counter
    eventEmitter.broadcast({
      type:    'freeSpinCounterUpdate',
      current: undefined,
      total:   bookEvent.totalFs,
    });
  },

  /**
   * Each individual freespin — update the counter
   */
  updateFreeSpin: async (bookEvent) => {
    eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
    eventEmitter.broadcast({
      type:    'freeSpinCounterUpdate',
      current: bookEvent.amount + 1,
      total:   bookEvent.total,
    });
  },

  /**
   * All freespins used — show total win and transition back
   */
  freeSpinEnd: async (bookEvent) => {
    const winLevelData = getWinLevelData(bookEvent.winLevel);

    await eventEmitter.broadcastAsync({ type: 'uiHide' });

    gameState.gameType = 'basegame';
    eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
    eventEmitter.broadcast({ type: 'freeSpinCounterHide' });

    // Show freespin total win outro
    eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_freespin_outro' });
    playWinLevelSounds(winLevelData);

    await eventEmitter.broadcastAsync({
      type:        'freeSpinOutroCountUp',
      amount:      bookEvent.amount,
      winLevelData,
    });

    stopWinLevelSounds();
    eventEmitter.broadcast({ type: 'freeSpinOutroHide' });

    // Transition back to base game
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_transition' });
    await eventEmitter.broadcastAsync({ type: 'transition' });
    await eventEmitter.broadcastAsync({ type: 'uiShow' });
  },

  /**
   * Win celebration — big win, mega win etc
   */
  setWin: async (bookEvent) => {
    const winLevelData = getWinLevelData(bookEvent.winLevel);

    eventEmitter.broadcast({ type: 'winShow' });
    playWinLevelSounds(winLevelData);

    await eventEmitter.broadcastAsync({
      type:        'winCountUp',
      amount:      bookEvent.amount,
      winLevelData,
    });

    stopWinLevelSounds();
    eventEmitter.broadcast({ type: 'winHide' });
  },

  /**
   * Player hit the maximum win cap
   */
  wincap: async (bookEvent) => {
    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_wincap' });

    await eventEmitter.broadcastAsync({
      type:   'wincapShow',
      amount: bookEvent.amount,
    });

    eventEmitter.broadcast({ type: 'wincapHide' });
  },

  /**
   * Round fully complete — nothing to do here
   * Balance update is handled by the RGS connection layer
   */
  finalWin: async (_bookEvent) => {
    // intentionally empty
  },
};
