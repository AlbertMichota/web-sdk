// apps/my-slot/src/game/bookEventHandlerMap.ts

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet, stateUi } from 'state-shared';
import { sequence } from 'utils-shared/sequence';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';
import config from './config';

// ── Sound helpers ─────────────────────────────────────────────────────────────

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
    if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
    if (winLevelData?.sound?.sfx) {
        eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
    }
    if (winLevelData?.sound?.bgm) {
        eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
    }
    if (winLevelData?.type === 'big') {
        eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });
    }
};

const winLevelSoundsStop = () => {
    eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
    if (stateGame.gameType === 'freegame') {
        eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
    } else {
        eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
    }
    eventEmitter.broadcastAsync({ type: 'uiShow' });
};

// ── Symbol animation helper ───────────────────────────────────────────────────

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
    eventEmitter.broadcast({ type: 'boardShow' });
    await eventEmitter.broadcastAsync({
        type: 'boardWithAnimateSymbols',
        symbolPositions: positions,
    });
};

// ── Book event handlers ───────────────────────────────────────────────────────

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {

    // Reels spin and land — board is revealed
    reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
        const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
        if (isBonusGame) {
            eventEmitter.broadcast({ type: 'stopButtonEnable' });
            recordBookEvent({ bookEvent });
        }

        stateGame.gameType = bookEvent.gameType;
        await stateGameDerived.enhancedBoard.spin({
            revealEvent: bookEvent,
            paddingBoard: config.paddingReels[bookEvent.gameType],
        });
        eventEmitter.broadcast({ type: 'soundScatterCounterClear' });
    },

    // Wild block lands — animate it growing from 2x2 up to its final size
    // grewFrom [2] = just 2x2
    // grewFrom [2,3] = 2x2 grows to 3x3
    // grewFrom [2,3,4] = 2x2 grows to 3x3 grows to 4x4
    wildBlock: async (bookEvent: BookEventOfType<'wildBlock'>) => {
        const soundMap: Record<number, string> = {
            2: 'sfx_wildblock_2x2',
            3: 'sfx_wildblock_3x3',
            4: 'sfx_wildblock_4x4',
        };
        eventEmitter.broadcast({
            type: 'soundOnce',
            name: soundMap[bookEvent.finalSize] ?? 'sfx_wildblock_2x2',
        });
        await eventEmitter.broadcastAsync({
            type: 'wildBlockAnimate',
            reel:       bookEvent.reel,
            row:        bookEvent.row,
            grewFrom:   bookEvent.grewFrom,
            finalSize:  bookEvent.finalSize,
            positions:  bookEvent.positions,
            multiplier: bookEvent.multiplier,
        });
    },

    // Total multiplier summary — show the combined multiplier on screen
    wildMultiplier: async (bookEvent: BookEventOfType<'wildMultiplier'>) => {
        if (bookEvent.totalMultiplier <= 1) return; // nothing to show for 1x
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_multiplier_show' });
        eventEmitter.broadcast({
            type: 'wildMultiplierShow',
            totalMultiplier: bookEvent.totalMultiplier,
        });
        await eventEmitter.broadcastAsync({ type: 'wildMultiplierAnimate' });
        eventEmitter.broadcast({ type: 'wildMultiplierHide' });
    },

    // Winning paylines highlight one by one
    winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_winlevel_small' });
        await sequence(bookEvent.wins, async (win) => {
            await animateSymbols({ positions: win.positions });
        });
    },

    // Running total win amount — updates the win counter in state
    setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
        stateBet.winBookEventAmount = bookEvent.amount;
    },

    // 3+ scatters land — trigger freespins intro and transition
    freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
        // Animate the scatter positions first
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
        await animateSymbols({ positions: bookEvent.positions });

        // Transition into freespins
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_superfreespin' });
        await eventEmitter.broadcastAsync({ type: 'uiHide' });
        await eventEmitter.broadcastAsync({ type: 'transition' });

        // Show freespin intro screen
        eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
        eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs' });
        eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
        await eventEmitter.broadcastAsync({
            type: 'freeSpinIntroUpdate',
            totalFreeSpins: bookEvent.totalFs,
        });

        // Switch to freegame mode and show counter
        stateGame.gameType = 'freegame';
        eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
        eventEmitter.broadcast({ type: 'boardFrameGlowShow' });
        eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
        stateUi.freeSpinCounterShow = true;
        eventEmitter.broadcast({
            type: 'freeSpinCounterUpdate',
            current: undefined,
            total: bookEvent.totalFs,
        });
        stateUi.freeSpinCounterTotal = bookEvent.totalFs;
        await eventEmitter.broadcastAsync({ type: 'uiShow' });
        await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
        eventEmitter.broadcast({ type: 'drawerFold' });
    },

    // 2+ scatters land during freespins — add more spins
    freeSpinRetrigger: async (bookEvent: BookEventOfType<'freeSpinRetrigger'>) => {
        // Animate the scatter positions
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
        await animateSymbols({ positions: bookEvent.positions });

        // Show retrigger banner and update counter
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_retrigger' });
        await eventEmitter.broadcastAsync({
            type: 'freeSpinRetriggerShow',
            totalFreeSpins: bookEvent.totalFs,
        });
        eventEmitter.broadcast({ type: 'freeSpinRetriggerHide' });

        // Update the spin counter with the new total
        eventEmitter.broadcast({
            type: 'freeSpinCounterUpdate',
            current: undefined,
            total: bookEvent.totalFs,
        });
        stateUi.freeSpinCounterTotal = bookEvent.totalFs;
    },

    // Each freespin — update the spin counter
    updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
        eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
        stateUi.freeSpinCounterShow = true;
        eventEmitter.broadcast({
            type: 'freeSpinCounterUpdate',
            current: bookEvent.amount + 1,
            total: bookEvent.total,
        });
        stateUi.freeSpinCounterCurrent = bookEvent.amount + 1;
        stateUi.freeSpinCounterTotal = bookEvent.total;
    },

    // Freespins end — show total win outro and transition back to base game
    freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
        const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

        await eventEmitter.broadcastAsync({ type: 'uiHide' });
        stateGame.gameType = 'basegame';
        eventEmitter.broadcast({ type: 'boardFrameGlowHide' });
        eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel' });
        winLevelSoundsPlay({ winLevelData });
        await eventEmitter.broadcastAsync({
            type: 'freeSpinOutroCountUp',
            amount: bookEvent.amount,
            winLevelData,
        });
        winLevelSoundsStop();
        eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
        eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
        stateUi.freeSpinCounterShow = false;
        await eventEmitter.broadcastAsync({ type: 'transition' });
        await eventEmitter.broadcastAsync({ type: 'uiShow' });
        await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
        eventEmitter.broadcast({ type: 'drawerButtonHide' });
    },

    // Win celebration — big win / mega win etc
    setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
        const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

        eventEmitter.broadcast({ type: 'winShow' });
        winLevelSoundsPlay({ winLevelData });
        await eventEmitter.broadcastAsync({
            type: 'winUpdate',
            amount: bookEvent.amount,
            winLevelData,
        });
        winLevelSoundsStop();
        eventEmitter.broadcast({ type: 'winHide' });
    },

    // Wincap hit — player has reached the maximum win
    wincap: async (bookEvent: BookEventOfType<'wincap'>) => {
        eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_wincap' });
        await eventEmitter.broadcastAsync({
            type: 'wincapShow',
            amount: bookEvent.amount,
        });
        eventEmitter.broadcast({ type: 'wincapHide' });
    },

    // Final win — round is fully complete, do nothing
    finalWin: async (_bookEvent: BookEventOfType<'finalWin'>) => {
        // Round ends here — balance update is handled by ts-client
    },
};