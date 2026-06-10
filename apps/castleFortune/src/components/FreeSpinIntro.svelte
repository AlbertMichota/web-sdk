<script>
  // FreeSpinIntro.svelte
  // Full screen intro shown when freespins are triggered
  // Displays how many freespins were awarded
  // Subscribes to: freeSpinIntroShow, freeSpinIntroUpdate, freeSpinIntroHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics, Text } from 'pixi-svelte';
  import { getContext } from '../game/context.js';

  const context = getContext();
  const { eventEmitter, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible     = $state(false);
  let totalSpins  = $state(0);
  let opacity     = $state(0);

  // ── Position ───────────────────────────────────────────────────────────────
  const w  = $derived(stateLayoutDerived.canvasSizes().width);
  const h  = $derived(stateLayoutDerived.canvasSizes().height);
  const cx = $derived(w / 2);
  const cy = $derived(h / 2);

  // ── Fade in animation ──────────────────────────────────────────────────────
  function fadeIn() {
    return new Promise((resolve) => {
      const start = performance.now();
      const duration = 400;
      function tick(now) {
        opacity = Math.min((now - start) / duration, 1);
        if (opacity < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({

      freeSpinIntroShow: () => {
        visible = true;
        opacity = 0;
        fadeIn();
      },

      // broadcastAsync waits for this — holds intro on screen long enough to read
      freeSpinIntroUpdate: async ({ totalFreeSpins }) => {
        totalSpins = totalFreeSpins;
        // Hold the intro for 2 seconds so player can read it
        await new Promise(r => setTimeout(r, 2000));
      },

      freeSpinIntroHide: () => {
        visible = false;
        opacity = 0;
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
        g.beginFill(0x000000, 0.85 * opacity);
        g.drawRect(0, 0, w, h);
        g.endFill();
      }}
    />

    <!-- Intro text -->
    <Container x={cx} y={cy} alpha={opacity}>

      <Text
        text="FREE SPINS"
        anchor={{ x: 0.5, y: 0.5 }}
        y={-60}
        style={{
          fontFamily:      'Arial',
          fontSize:        80,
          fontWeight:      'bold',
          fill:            0xFFD700,
          stroke:          0x000000,
          strokeThickness: 8,
          dropShadow:      true,
          dropShadowDistance: 6,
        }}
      />

      <Text
        text={String(totalSpins)}
        anchor={{ x: 0.5, y: 0.5 }}
        y={40}
        style={{
          fontFamily:      'Arial',
          fontSize:        120,
          fontWeight:      'bold',
          fill:            0xFFFFFF,
          stroke:          0x000000,
          strokeThickness: 10,
          dropShadow:      true,
          dropShadowDistance: 8,
        }}
      />

      <Text
        text="SPINS AWARDED"
        anchor={{ x: 0.5, y: 0.5 }}
        y={130}
        style={{
          fontFamily:      'Arial',
          fontSize:        36,
          fill:            0xCCCCCC,
          stroke:          0x000000,
          strokeThickness: 4,
        }}
      />

    </Container>
  </Container>
{/if}
