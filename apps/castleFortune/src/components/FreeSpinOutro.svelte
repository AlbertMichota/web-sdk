<script>
  // FreeSpinOutro.svelte
  // Full screen outro shown when freespins end
  // Counts up the total win amount
  // Subscribes to: freeSpinOutroShow, freeSpinOutroCountUp, freeSpinOutroHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics, Text } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import { countUp } from 'games/utils';;

  const context = getContext();
  const { eventEmitter, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible       = $state(false);
  let displayAmount = $state(0);
  let opacity       = $state(0);

  // ── Position ───────────────────────────────────────────────────────────────
  const w  = $derived(stateLayoutDerived.canvasSizes().width);
  const h  = $derived(stateLayoutDerived.canvasSizes().height);
  const cx = $derived(w / 2);
  const cy = $derived(h / 2);

  const formattedAmount = $derived(displayAmount.toFixed(2));

  // ── Fade animation ─────────────────────────────────────────────────────────
  function animateOpacity(from, to, duration) {
    return new Promise((resolve) => {
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        opacity = from + (to - from) * progress;
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

      freeSpinOutroShow: async () => {
        visible       = true;
        displayAmount = 0;
        await animateOpacity(0, 1, 400);
      },

      // broadcastAsync waits for this — counts up the total win
      freeSpinOutroCountUp: async ({ amount, winLevelData }) => {
        await countUp({
          from:     0,
          to:       amount,
          duration: winLevelData?.presentDuration ?? 3000,
          onUpdate: (v) => { displayAmount = v; },
        });
        // Hold on screen after count finishes
        await new Promise(r => setTimeout(r, 1000));
      },

      freeSpinOutroHide: async () => {
        await animateOpacity(1, 0, 400);
        visible       = false;
        displayAmount = 0;
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible}
  <Container zIndex={50}>

    <!-- Dark overlay -->
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0x000000, 0.88 * opacity);
        g.drawRect(0, 0, w, h);
        g.endFill();
      }}
    />

    <Container x={cx} y={cy} alpha={opacity}>

      <Text
        text="FEATURE WIN"
        anchor={{ x: 0.5, y: 0.5 }}
        y={-80}
        style={{
          fontFamily:      'Arial',
          fontSize:        52,
          fontWeight:      'bold',
          fill:            0xFFD700,
          stroke:          0x000000,
          strokeThickness: 6,
          dropShadow:      true,
          dropShadowDistance: 4,
        }}
      />

      <Text
        text="YOU WON"
        anchor={{ x: 0.5, y: 0.5 }}
        y={-20}
        style={{
          fontFamily: 'Arial',
          fontSize:   32,
          fill:       0xCCCCCC,
        }}
      />

      <!-- Total win amount counting up -->
      <Text
        text={formattedAmount}
        anchor={{ x: 0.5, y: 0.5 }}
        y={60}
        style={{
          fontFamily:      'Arial',
          fontSize:        80,
          fontWeight:      'bold',
          fill:            0xFFFFFF,
          stroke:          0x000000,
          strokeThickness: 8,
          dropShadow:      true,
          dropShadowDistance: 6,
        }}
      />

    </Container>
  </Container>
{/if}
