<script>
  // WildBlock.svelte
  // Animates wild blocks forming on the board
  // 2x2 → optionally grows to 3x3 → optionally grows to 4x4
  // grewFrom drives the sequence: [2] [2,3] or [2,3,4]
  // Shows the block multiplier value after formation
  // Subscribes to: wildBlockAnimate

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics, Text, SpineProvider } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import { SYMBOL_SIZE, BOARD_WIDTH, BOARD_HEIGHT } from '../game/constants.js';

  const context = getContext();
  const { eventEmitter, stateApp, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  // Each active block on the board
  let blocks = $state(/** @type {Array<{
    reel: number,
    row: number,
    currentSize: number,
    finalSize: number,
    multiplier: number,
    opacity: number,
    showMultiplier: boolean,
  }>} */ ([]));

  // ── Board origin — same calculation as Board.svelte ───────────────────────
  const boardX = $derived(
    stateLayoutDerived.canvasSizes().width  / 2 - BOARD_WIDTH  / 2
  );
  const boardY = $derived(
    stateLayoutDerived.canvasSizes().height / 2 - BOARD_HEIGHT / 2
  );

  // ── Animate a single block growing through its sequence ───────────────────
  async function animateBlock(blockEvent) {
    const { reel, row, grewFrom, finalSize, multiplier } = blockEvent;

    // Add block to state at size 2x2
    const block = $state({
      reel,
      row,
      currentSize:   2,
      finalSize,
      multiplier,
      opacity:       0,
      showMultiplier: false,
    });

    blocks = [...blocks, block];

    // Fade in
    await animateValue(0, 1, 200, (v) => { block.opacity = v; });

    // Step through each growth stage in grewFrom
    for (const size of grewFrom) {
      block.currentSize = size;
      // Hold each stage so player can see it
      await wait(size === finalSize ? 400 : 300);

      // If there is a next size play a pulse effect
      if (size < finalSize) {
        await animateValue(1, 1.15, 150, (v) => { block.opacity = v; });
        await animateValue(1.15, 1, 150, (v) => { block.opacity = v; });
      }
    }

    // Show the multiplier badge
    block.showMultiplier = true;
    await wait(800);

    // Fade out
    await animateValue(1, 0, 300, (v) => { block.opacity = v; });

    // Remove from state
    blocks = blocks.filter(b => b !== block);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function animateValue(from, to, duration, onUpdate) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        onUpdate(from + (to - from) * progress);
        if (progress < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  // ── Block pixel dimensions ─────────────────────────────────────────────────
  function getBlockPixels(block) {
    const size = block.currentSize;
    return {
      x: block.reel * SYMBOL_SIZE,
      y: block.row  * SYMBOL_SIZE,
      w: size * SYMBOL_SIZE,
      h: size * SYMBOL_SIZE,
    };
  }

  // ── Color by block size ────────────────────────────────────────────────────
  const BLOCK_COLORS = {
    2: 0x4488FF, // blue   — 2x2
    3: 0xFF8844, // orange — 3x3
    4: 0xFF4444, // red    — 4x4
  };

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({
      // broadcastAsync waits for this — one block at a time
      wildBlockAnimate: async (blockEvent) => {
        await animateBlock(blockEvent);
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

<!-- Positioned over the board -->
<Container x={boardX} y={boardY} zIndex={35}>

  {#each blocks as block}
    {@const px = getBlockPixels(block)}
    {@const color = BLOCK_COLORS[block.currentSize] ?? 0x4488FF}

    <Container x={px.x} y={px.y} alpha={block.opacity}>

      <!-- Glowing border around the block -->
      <Graphics
        draw={(g) => {
          g.clear();

          // Outer glow
          g.lineStyle(6, color, 0.4);
          g.drawRect(-4, -4, px.w + 8, px.h + 8);

          // Inner border
          g.lineStyle(3, color, 1);
          g.drawRect(0, 0, px.w, px.h);

          // Semi-transparent fill
          g.beginFill(color, 0.15);
          g.drawRect(0, 0, px.w, px.h);
          g.endFill();
        }}
      />

      <!-- Wild block spine animation if asset loaded -->
      {#if stateApp.loaded && stateApp.loadedAssets['WildBlock']}
        <SpineProvider
          key="WildBlock"
          animationName="wild_block_{block.currentSize}x{block.currentSize}"
          loop={false}
          x={px.w / 2}
          y={px.h / 2}
          anchor={{ x: 0.5, y: 0.5 }}
          width={px.w}
          height={px.h}
        />
      {/if}

      <!-- Multiplier badge — shown after block forms -->
      {#if block.showMultiplier}
        <Container x={px.w / 2} y={px.h / 2}>

          <!-- Badge background -->
          <Graphics
            draw={(g) => {
              g.clear();
              g.beginFill(0x000000, 0.85);
              g.lineStyle(2, color, 1);
              g.drawRoundedRect(-50, -28, 100, 56, 12);
              g.endFill();
            }}
          />

          <!-- Multiplier value e.g. "8x" -->
          <Text
            text={`${block.multiplier}x`}
            anchor={{ x: 0.5, y: 0.5 }}
            style={{
              fontFamily:      'Arial',
              fontSize:        36,
              fontWeight:      'bold',
              fill:            color,
              stroke:          0x000000,
              strokeThickness: 4,
              dropShadow:      true,
              dropShadowDistance: 2,
            }}
          />

        </Container>
      {/if}

    </Container>
  {/each}

</Container>
