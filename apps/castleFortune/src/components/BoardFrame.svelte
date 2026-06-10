<script>
  // BoardFrame.svelte
  // Decorative frame around the reel board
  // Shows a glow effect during freespins
  // Listens to boardFrameGlowShow / boardFrameGlowHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, SpineProvider, Sprite } from 'pixi-svelte';
  import { getContext }          from '../game/context.js';
  import { BOARD_WIDTH, BOARD_HEIGHT } from '../game/constants.js';

  const context = getContext();
  const { eventEmitter, stateApp, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let glowVisible = $state(false);

  // ── Position ───────────────────────────────────────────────────────────────
  const frameX = $derived(
    stateLayoutDerived.canvasSizes().width  / 2
  );
  const frameY = $derived(
    stateLayoutDerived.canvasSizes().height / 2
  );

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({
      boardFrameGlowShow: () => { glowVisible = true;  },
      boardFrameGlowHide: () => { glowVisible = false; },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

<Container x={frameX} y={frameY} zIndex={30} anchor={{ x: 0.5, y: 0.5 }}>

  <!-- Base frame — always visible -->
  {#if stateApp.loaded && stateApp.loadedAssets['board_frame']}
    <Sprite
      key="board_frame"
      anchor={{ x: 0.5, y: 0.5 }}
      width={BOARD_WIDTH + 40}
      height={BOARD_HEIGHT + 40}
    />
  {/if}

  <!-- Freespin glow — only visible during freespins -->
  {#if glowVisible && stateApp.loaded && stateApp.loadedAssets['board_frame_glow']}
    <Sprite
      key="board_frame_glow"
      anchor={{ x: 0.5, y: 0.5 }}
      width={BOARD_WIDTH + 60}
      height={BOARD_HEIGHT + 60}
    />
  {/if}

</Container>
