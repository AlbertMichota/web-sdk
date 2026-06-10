<script>
  // Background.svelte
  // Renders the game background art
  // Switches between base game and freespin backgrounds
  // Listens to gameState.gameType to know which to show

  import { Container, SpineProvider, SpineTrack, Graphics, Sprite } from 'pixi-svelte';
  import { getContext }         from '../game/context.js';
  import { gameState }          from '../game/stateGame.svelte.js';

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  // ── Layout ─────────────────────────────────────────────────────────────────
  const w  = $derived(stateLayoutDerived.canvasSizes().width);
  const h  = $derived(stateLayoutDerived.canvasSizes().height);
  const cx = $derived(w / 2);
  const cy = $derived(h / 2);

  // ── Which background to show ───────────────────────────────────────────────
  const bgKey = $derived(
    ['superfreegame', 'superbonus', 'super_bonus'].includes(gameState.gameType)
      ? 'background_super'
      : gameState.gameType === 'freegame'
        ? 'background_free'
        : 'background_base'
  );
  const isStillBackground = $derived(
    ['background_free', 'background_super'].includes(bgKey)
  );

  // ── Scale to fill canvas keeping aspect ratio ─────────────────────────────
  // Background images are 1920x1080 — scale to cover the canvas
  const BG_NATIVE_WIDTH  = 1920;
  const BG_NATIVE_HEIGHT = 1080;
  const BG_ANIMATION_TIME_SCALE = 0.5;

  const bgScale = $derived(
    Math.max(w / BG_NATIVE_WIDTH, h / BG_NATIVE_HEIGHT)
  );
</script>

<Container zIndex={0}>
  {#snippet spineChildren()}{/snippet}

  {#if stateApp.loaded && stateApp.loadedAssets[bgKey] && isStillBackground}
    <Sprite
      key={bgKey}
      x={cx}
      y={cy}
      anchor={{ x: 0.5, y: 0.5 }}
      width={BG_NATIVE_WIDTH * bgScale}
      height={BG_NATIVE_HEIGHT * bgScale}
    />
  {:else if stateApp.loaded && stateApp.loadedAssets[bgKey]}
    <SpineProvider
      key={bgKey}
      x={cx}
      y={cy}
      scale={{ x: bgScale, y: bgScale }}
    >
      <SpineTrack
        trackIndex={0}
        animationName="animation"
        loop={true}
        timeScale={BG_ANIMATION_TIME_SCALE}
      />
      {@render spineChildren()}
    </SpineProvider>
  {:else}
    <!-- Fallback solid colour while assets load or if background missing -->
    <Graphics
      draw={(g) => {
        g.clear();
        g.beginFill(
          gameState.gameType === 'freegame' ? 0x0a0a2a : 0x0a0c10,
          1
        );
        g.drawRect(0, 0, w, h);
        g.endFill();
      }}
    />
  {/if}
</Container>
