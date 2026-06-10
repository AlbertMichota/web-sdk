<script>
  // Wincap.svelte
  // Shown when the player hits the maximum win of 10,000x
  // Castle Fortune specific — wincap is 10,000x bet
  // Subscribes to: wincapShow, wincapHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics, Text } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import { countUp } from 'games/utils';

  const context = getContext();
  const { eventEmitter, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible       = $state(false);
  let displayAmount = $state(0);
  let opacity       = $state(0);
  let starsOpacity  = $state(0);

  // ── Position ───────────────────────────────────────────────────────────────
  const w  = $derived(stateLayoutDerived.canvasSizes().width);
  const h  = $derived(stateLayoutDerived.canvasSizes().height);
  const cx = $derived(w / 2);
  const cy = $derived(h / 2);

  const formattedAmount = $derived(displayAmount.toFixed(2));

  // ── Animate helpers ────────────────────────────────────────────────────────
  function animateOpacity(target, from, to, duration) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value    = from + (to - from) * progress;
        if (target === 'main')  opacity      = value;
        if (target === 'stars') starsOpacity = value;
        if (progress < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({

      // broadcastAsync waits for this — full wincap presentation
      wincapShow: async ({ amount }) => {
        visible       = true;
        displayAmount = 0;

        // Fade in overlay
        await animateOpacity('main', 0, 1, 500);

        // Stars burst in
        await animateOpacity('stars', 0, 1, 300);

        // Count up the win amount
        await countUp({
          from:     0,
          to:       amount,
          duration: 3000,
          onUpdate: (v) => { displayAmount = v; },
        });

        // Hold on screen
        await new Promise(r => setTimeout(r, 2000));
      },

      wincapHide: async () => {
        await animateOpacity('main', 1, 0, 400);
        visible       = false;
        opacity       = 0;
        starsOpacity  = 0;
        displayAmount = 0;
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible}
  <Container zIndex={70}>

    <!-- Full screen dark overlay -->
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0x000000, 0.92 * opacity);
        g.drawRect(0, 0, w, h);
        g.endFill();
      }}
    />

    <!-- Stars / sparkles background layer -->
    <Container alpha={starsOpacity}>
      {#each Array(12) as _, i}
        {@const angle  = (i / 12) * Math.PI * 2}
        {@const radius = 180 + (i % 3) * 40}
        <Graphics
          x={cx + Math.cos(angle) * radius}
          y={cy + Math.sin(angle) * radius}
          draw={(g) => {
            g.clear();
            g.beginFill(0xFFD700, 0.8);
            g.drawStar(0, 0, 5, 8, 3);
            g.endFill();
          }}
        />
      {/each}
    </Container>

    <!-- Main content -->
    <Container x={cx} y={cy} alpha={opacity}>

      <!-- MAX WIN badge -->
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x2a1500, 0.98);
          g.lineStyle(4, 0xFFD700, 1);
          g.drawRoundedRect(-200, -140, 400, 280, 24);
          g.endFill();

          // Inner accent line
          g.lineStyle(1, 0xFFAA00, 0.5);
          g.drawRoundedRect(-188, -128, 376, 256, 18);
        }}
      />

      <!-- MAX WIN label -->
      <Text
        text="MAX WIN"
        anchor={{ x: 0.5, y: 0.5 }}
        y={-90}
        style={{
          fontFamily:      'Arial',
          fontSize:        28,
          fontWeight:      'bold',
          fill:            0xFFAA00,
          letterSpacing:   6,
          stroke:          0x000000,
          strokeThickness: 3,
        }}
      />

      <!-- Congratulations text -->
      <Text
        text="CONGRATULATIONS!"
        anchor={{ x: 0.5, y: 0.5 }}
        y={-50}
        style={{
          fontFamily:      'Arial',
          fontSize:        22,
          fill:            0xCCCCCC,
          letterSpacing:   2,
        }}
      />

      <!-- Win amount counting up -->
      <Text
        text={formattedAmount}
        anchor={{ x: 0.5, y: 0.5 }}
        y={30}
        style={{
          fontFamily:      'Arial',
          fontSize:        72,
          fontWeight:      'bold',
          fill:            0xFFD700,
          stroke:          0x000000,
          strokeThickness: 8,
          dropShadow:      true,
          dropShadowDistance: 5,
          dropShadowColor: 0xFF8800,
        }}
      />

      <!-- 10,000x label -->
      <Text
        text="10,000× BET"
        anchor={{ x: 0.5, y: 0.5 }}
        y={100}
        style={{
          fontFamily: 'Arial',
          fontSize:   20,
          fill:       0x888888,
        }}
      />

    </Container>
  </Container>
{/if}
