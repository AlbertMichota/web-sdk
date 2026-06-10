<script>
  // FreeSpinCounter.svelte
  // Shows current / total freespins during the freespin round
  // e.g. "5 / 15"
  // Subscribes to: freeSpinCounterShow, freeSpinCounterUpdate, freeSpinCounterHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, Text, Graphics } from 'pixi-svelte';
  import { getContext } from '../game/context.js';

  const context = getContext();
  const { eventEmitter, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible = $state(false);
  let current = $state(0);
  let total   = $state(0);

  // ── Position — top center of screen ───────────────────────────────────────
  const cx = $derived(stateLayoutDerived.canvasSizes().width / 2);

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({

      freeSpinCounterShow: () => {
        visible = true;
      },

      freeSpinCounterUpdate: ({ current: c, total: t }) => {
        if (c !== undefined) current = c;
        if (t !== undefined) total   = t;
      },

      freeSpinCounterHide: () => {
        visible  = false;
        current  = 0;
        total    = 0;
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible}
  <Container x={cx} y={40} zIndex={50}>

    <!-- Background pill -->
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(0x000000, 0.6);
        g.lineStyle(2, 0xFFD700, 1);
        g.drawRoundedRect(-100, -30, 200, 60, 30);
        g.endFill();
      }}
    />

    <!-- Counter text: "5 / 15" -->
    <Text
      text={`${current} / ${total}`}
      anchor={{ x: 0.5, y: 0.5 }}
      style={{
        fontFamily:      'Arial',
        fontSize:        32,
        fontWeight:      'bold',
        fill:            0xFFD700,
        stroke:          0x000000,
        strokeThickness: 4,
      }}
    />

    <!-- Label -->
    <Text
      text="FREE SPINS"
      anchor={{ x: 0.5, y: 0 }}
      y={26}
      style={{
        fontFamily: 'Arial',
        fontSize:   14,
        fill:       0xCCCCCC,
      }}
    />

  </Container>
{/if}
