<script>
  // FreeSpinRetrigger.svelte
  // Banner shown briefly when scatters land during freespins adding more spins
  // Unique to Castle Fortune — freegame retrigger threshold is 2+ scatters
  // Subscribes to: freeSpinRetriggerShow, freeSpinRetriggerHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics, Text } from 'pixi-svelte';
  import { getContext } from '../game/context.js';

  const context = getContext();
  const { eventEmitter, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible    = $state(false);
  let totalSpins = $state(0);
  let opacity    = $state(0);

  // ── Position — center of screen ───────────────────────────────────────────
  const cx = $derived(stateLayoutDerived.canvasSizes().width  / 2);
  const cy = $derived(stateLayoutDerived.canvasSizes().height / 2);

  // ── Animate in then out ────────────────────────────────────────────────────
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

      // broadcastAsync waits for this — shows banner then resolves
      freeSpinRetriggerShow: async ({ totalFreeSpins }) => {
        totalSpins = totalFreeSpins;
        visible    = true;
        await animateOpacity(0, 1, 300);
        // Hold on screen
        await new Promise(r => setTimeout(r, 1500));
        await animateOpacity(1, 0, 300);
        visible = false;
      },

      freeSpinRetriggerHide: () => {
        visible = false;
        opacity = 0;
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible}
  <Container x={cx} y={cy} zIndex={55}>

    <!-- Banner background -->
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0x1a0a3a, 0.95 * opacity);
        g.lineStyle(3, 0xFFD700, opacity);
        g.drawRoundedRect(-220, -70, 440, 140, 16);
        g.endFill();
      }}
    />

    <!-- Retrigger text -->
    <Text
      text="RETRIGGER!"
      anchor={{ x: 0.5, y: 0.5 }}
      y={-24}
      alpha={opacity}
      style={{
        fontFamily:      'Arial',
        fontSize:        48,
        fontWeight:      'bold',
        fill:            0xFFD700,
        stroke:          0x000000,
        strokeThickness: 5,
        dropShadow:      true,
        dropShadowDistance: 3,
      }}
    />

    <!-- New total spins -->
    <Text
      text={`${totalSpins} FREE SPINS`}
      anchor={{ x: 0.5, y: 0.5 }}
      y={28}
      alpha={opacity}
      style={{
        fontFamily:      'Arial',
        fontSize:        28,
        fill:            0xFFFFFF,
        stroke:          0x000000,
        strokeThickness: 3,
      }}
    />

  </Container>
{/if}
