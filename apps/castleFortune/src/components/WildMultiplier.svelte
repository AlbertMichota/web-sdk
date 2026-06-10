<script>
  // WildMultiplier.svelte
  // Shows the total spin multiplier after all wild blocks have been processed
  // Castle Fortune specific — single wilds add 2x each, blocks add their rolled value
  // Only shown when totalMultiplier > 1
  // Subscribes to: wildMultiplierShow, wildMultiplierAnimate, wildMultiplierHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics, Text } from 'pixi-svelte';
  import { getContext } from '../game/context.js';

  const context = getContext();
  const { eventEmitter, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible          = $state(false);
  let totalMultiplier  = $state(1);
  let opacity          = $state(0);
  let scale            = $state(0.5);

  // ── Position — center of screen slightly above middle ─────────────────────
  const cx = $derived(stateLayoutDerived.canvasSizes().width  / 2);
  const cy = $derived(stateLayoutDerived.canvasSizes().height / 2 - 80);

  // ── Pop in animation ───────────────────────────────────────────────────────
  async function popIn() {
    // Scale up with overshoot
    await animateValues({ opacity: [0, 1], scale: [0.5, 1.15] }, 200);
    await animateValues({ scale: [1.15, 1] }, 100);
  }

  // ── Pulse animation ────────────────────────────────────────────────────────
  async function pulse() {
    await animateValues({ scale: [1, 1.1] }, 150);
    await animateValues({ scale: [1.1, 1] }, 150);
    await new Promise(r => setTimeout(r, 600));
    await animateValues({ scale: [1, 1.1] }, 150);
    await animateValues({ scale: [1.1, 1] }, 150);
  }

  function animateValues(targets, duration) {
    return new Promise((resolve) => {
      const start  = performance.now();
      const froms  = {};
      const tos    = {};

      for (const [key, [from, to]] of Object.entries(targets)) {
        froms[key] = from;
        tos[key]   = to;
      }

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 2);

        for (const key of Object.keys(targets)) {
          const value = froms[key] + (tos[key] - froms[key]) * eased;
          if (key === 'opacity') opacity = value;
          if (key === 'scale')   scale   = value;
        }

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

      wildMultiplierShow: ({ totalMultiplier: mult }) => {
        totalMultiplier = mult;
        visible         = true;
        opacity         = 0;
        scale           = 0.5;
        popIn();
      },

      // broadcastAsync waits for this
      wildMultiplierAnimate: async () => {
        await pulse();
      },

      wildMultiplierHide: () => {
        visible         = false;
        opacity         = 0;
        scale           = 0.5;
        totalMultiplier = 1;
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible}
  <Container
    x={cx}
    y={cy}
    zIndex={45}
    alpha={opacity}
    scale={{ x: scale, y: scale }}
  >

    <!-- Outer glow ring -->
    <Graphics
      draw={(g) => {
        g.clear();
        g.lineStyle(4, 0xFFAA00, 0.5);
        g.drawCircle(0, 0, 90);
      }}
    />

    <!-- Main badge background -->
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0x1a0a00, 0.95);
        g.lineStyle(3, 0xFFD700, 1);
        g.drawCircle(0, 0, 80);
        g.endFill();
      }}
    />

    <!-- Label -->
    <Text
      text="MULTIPLIER"
      anchor={{ x: 0.5, y: 0.5 }}
      y={-28}
      style={{
        fontFamily: 'Arial',
        fontSize:   16,
        fill:       0xCCCCCC,
        letterSpacing: 2,
      }}
    />

    <!-- Multiplier value e.g. "12x" -->
    <Text
      text={`${totalMultiplier}x`}
      anchor={{ x: 0.5, y: 0.5 }}
      y={16}
      style={{
        fontFamily:      'Arial',
        fontSize:        56,
        fontWeight:      'bold',
        fill:            0xFFD700,
        stroke:          0x000000,
        strokeThickness: 6,
        dropShadow:      true,
        dropShadowDistance: 4,
        dropShadowColor: 0xFF8800,
      }}
    />

  </Container>
{/if}
