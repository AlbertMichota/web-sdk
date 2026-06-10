<script>
  // Board.svelte
  // The 5x4 reel grid — the core visual of Castle Fortune
  // Handles reel spinning, symbol landing, win highlighting
  // Listens to boardReveal and boardAnimateSymbols emitter events

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics } from 'pixi-svelte';
  import { createReelForSpinning } from 'utils-slots';
  import _ from 'lodash';
  import { stateBet } from 'state-shared';

  import Symbol from './Symbol.svelte';
  import { getContext }       from '../game/context.js';
  import { gameState, onSymbolLand, getSpinOptions, resetSpinState } from '../game/stateGame.svelte.js';
  import {
    NUM_REELS,
    INITIAL_BOARD,
    NUM_VISIBLE_ROWS,
  } from '../game/constants.js';
  import config from '../game/config.js';
  import { REEL_GRID_NATIVE, REEL_SAFE_ZONE_NATIVE, REEL_SYMBOL_GRID_NATIVE } from '../game/reelLayout.js';

  const context = getContext();
  const { eventEmitter } = context;

  // ── Highlighted positions ──────────────────────────────────────────────────
  // Set by boardAnimateSymbols, cleared after animation
  let highlightedPositions = $state(/** @type {Array<{reel:number,row:number}>} */ ([]));

  const boardX = REEL_GRID_NATIVE.x;
  const boardY = REEL_GRID_NATIVE.y;
  const symbolGridX = REEL_SYMBOL_GRID_NATIVE.x;
  const symbolGridY = REEL_SYMBOL_GRID_NATIVE.y;
  const cellWidth = REEL_SYMBOL_GRID_NATIVE.width / NUM_REELS;
  const cellHeight = REEL_SYMBOL_GRID_NATIVE.height / NUM_VISIBLE_ROWS;
  const maskX = symbolGridX + REEL_SAFE_ZONE_NATIVE.offsetX;
  const maskY = symbolGridY + REEL_SAFE_ZONE_NATIVE.offsetY;
  const maskWidth = REEL_SYMBOL_GRID_NATIVE.width - REEL_SAFE_ZONE_NATIVE.offsetX - REEL_SAFE_ZONE_NATIVE.shrinkRight;
  const maskHeight = REEL_SYMBOL_GRID_NATIVE.height - REEL_SAFE_ZONE_NATIVE.offsetY - REEL_SAFE_ZONE_NATIVE.shrinkBottom;

  // ── Create reels ───────────────────────────────────────────────────────────
  // One reel per column, each with its own spin state
  const reels = _.range(NUM_REELS).map((reelIndex) => {
    const reel = createReelForSpinning({
      reelIndex,
      symbolHeight: cellHeight,
      initialSymbols: INITIAL_BOARD[reelIndex],
      initialSymbolState: 'static',

      onReelStopping: () => {
        eventEmitter.broadcast({
          type:      'soundOnce',
          name:      'sfx_reel_stop',
          forcePlay: !stateBet.isTurbo,
        });
      },

      onSymbolLand: ({ rawSymbol }) => {
        onSymbolLand(rawSymbol);
      },
    });

    // Use turbo or normal spin options
    reel.reelState.spinOptions = () =>
      getSpinOptions(stateBet.isTurbo);

    return reel;
  });

  // ── Board layout position ──────────────────────────────────────────────────
  // ── Check if a position is highlighted ────────────────────────────────────
  function isHighlighted(reelIndex, rowIndex) {
    return highlightedPositions.some(
      (p) => p.reel === reelIndex && p.row === rowIndex
    );
  }

  // ── Animate a set of symbol positions ─────────────────────────────────────
  // Called for winning paylines — highlights them one at a time
  // Returns a promise so broadcastAsync waits for it
  async function animateSymbolPositions(positions) {
    highlightedPositions = positions;
    // Hold the highlight for a moment
    await new Promise(r => setTimeout(r, 600));
    highlightedPositions = [];
  }

  async function spinToBoard({ board, paddingBoard, paddingPositions, anticipation }) {
    const globalSpinType = stateBet.isTurbo ? 'fast' : 'normal';
    const hasAnticipation = anticipation?.some(Boolean) ?? false;
    const firstAnticipatedReelIndex = anticipation?.findIndex(Boolean) ?? -1;

    reels.reduce((previousPaddingSize, reel, reelIndex) => {
      const noStop = hasAnticipation && reelIndex >= firstAnticipatedReelIndex;
      const isAnticipated = (anticipation?.[reelIndex] ?? 0) > 0;
      const spinType = isAnticipated ? 'anticipated' : noStop ? 'normal' : globalSpinType;

      return reel.prepareToSpin({
        noStop,
        spinType,
        symbols: board[reelIndex],
        paddingReel: paddingBoard?.[reelIndex] ?? board[reelIndex],
        paddingPosition: paddingPositions?.[reelIndex] ?? 0,
        previousPaddingSize,
        onSpinFinishing: () => {
          reel.onReelStopping();

          const nextReelIndex = reelIndex + 1;
          const isNextReelAnticipated = (anticipation?.[nextReelIndex] ?? 0) > 0;
          if (isNextReelAnticipated) reels[nextReelIndex].reelState.anticipating = true;
        },
      });
    }, 0);

    const spinStartTime = performance.now();
    await Promise.all(reels.map((reel) => reel.spin()));
    console.log(`Reel movement time: ${((performance.now() - spinStartTime) / 1000).toFixed(2)}s`);
  }

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;
  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({

      // Spin the reels and reveal the result board
      boardReveal: async ({ board, paddingPositions, anticipation, gameType }) => {
        resetSpinState();

        // Use the correct padding reels for this game type
        const paddingBoard = config.paddingReels[gameType] ?? [];

        await spinToBoard({ board, paddingBoard, paddingPositions, anticipation });
      },

      boardFastDrop: () => {
        reels.forEach((reel) => reel.stop());
      },

      // Show the board (unhide after UI transitions)
      boardShow: () => {
        // Board is always visible — nothing to do here
        // Can be used later to handle special hide/show cases
      },

      // Highlight winning symbol positions
      boardAnimateSymbols: async ({ positions }) => {
        await animateSymbolPositions(positions);
      },

      // Reset scatter counter between spins
      scatterCounterReset: () => {
        gameState.scatterCount = 0;
      },
    });
  });

  onDestroy(() => {
    unsubscribe?.();
  });
</script>

<Container x={boardX} y={boardY} zIndex={10}>
  <Graphics
    isMask={true}
    draw={(g) => {
      g.rect(maskX, maskY, maskWidth, maskHeight);
      g.fill(0xffffff);
    }}
  />

  <Container>
    {#each reels as reel, reelIndex}
      {#each reel.reelState.symbols as symbol}
        {@const symbolY = symbol.symbolY()}
        {@const rowIndex = Math.floor(symbol.symbolY() / cellHeight)}

        <!-- Render only the four visible board rows, not the padding rows. -->
        {#if symbolY >= 0 && symbolY <= REEL_SYMBOL_GRID_NATIVE.height}
          <Symbol
            symbolName={symbol.rawSymbol.name}
            state={symbol.symbolState}
            x={symbolGridX + reelIndex * cellWidth + cellWidth / 2}
            y={symbolGridY + symbolY}
            {cellWidth}
            {cellHeight}
            highlighted={isHighlighted(reelIndex, rowIndex)}
          />
        {/if}
      {/each}
    {/each}
  </Container>
</Container>
