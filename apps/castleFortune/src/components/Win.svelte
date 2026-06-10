<script>
  // Win.svelte
  // Big win celebration screen using the WinAnimations spine
  // Switches skin based on win level: Nice, Big, Huge, Insane
  // One animation called 'animation' plays on loop while counting up
  // Subscribes to: winShow, winCountUp, winHide

  import { onMount, onDestroy } from 'svelte';
  import { Container, SpineProvider, Text } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import { countUp } from 'games/utils';

  const context = getContext();
  const { eventEmitter, stateApp, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible       = $state(false);
  let displayAmount = $state(0);
  let winLevelData  = $state(null);

  // ── Position — center of canvas ───────────────────────────────────────────
  const cx = $derived(stateLayoutDerived.canvasSizes().width  / 2);
  const cy = $derived(stateLayoutDerived.canvasSizes().height / 2);

  // ── Formatted amount ───────────────────────────────────────────────────────
  const formattedAmount = $derived(displayAmount.toFixed(2));

  // ── Animate count up ──────────────────────────────────────────────────────
  async function animateCountUp(amount, levelData) {
    winLevelData  = levelData;
    displayAmount = 0;
    visible       = true;

    await countUp({
      from:     0,
      to:       amount,
      duration: levelData.presentDuration,
      onUpdate: (v) => { displayAmount = v; },
    });
  }

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({

      winShow: () => {
        visible = true;
      },

      winCountUp: async ({ amount, winLevelData: levelData }) => {
        await animateCountUp(amount, levelData);
      },

      winHide: () => {
        visible       = false;
        winLevelData  = null;
        displayAmount = 0;
      },
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible && winLevelData?.skin}
  <Container x={cx} y={cy} zIndex={40}>

    <!-- Win spine animation — skin switches per win level -->
    {#if stateApp.loaded && stateApp.loadedAssets['WinAnimations']}
      <SpineProvider
        key="WinAnimations"
        animationName="animation"
        skin={winLevelData.skin}
        loop={true}
        anchor={{ x: 0.5, y: 0.5 }}
        width={750}
        height={505}
      />
    {:else}
      <!-- Fallback text if spine not loaded -->
      <Text
        text={winLevelData.text ?? ''}
        anchor={{ x: 0.5, y: 0.5 }}
        y={-60}
        style={{
          fontFamily:      'Arial',
          fontSize:        72,
          fontWeight:      'bold',
          fill:            0xFFD700,
          stroke:          0x000000,
          strokeThickness: 6,
        }}
      />
    {/if}

    <!-- Win amount counting up -->
    <Text
      text={formattedAmount}
      anchor={{ x: 0.5, y: 0 }}
      y={80}
      style={{
        fontFamily:      'Arial',
        fontSize:        56,
        fontWeight:      'bold',
        fill:            0xFFFFFF,
        stroke:          0x000000,
        strokeThickness: 5,
        dropShadow:      true,
        dropShadowDistance: 3,
      }}
    />

  </Container>
{/if}
