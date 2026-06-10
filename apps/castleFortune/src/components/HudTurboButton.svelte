<script>
  import { onDestroy } from 'svelte';
  import { Container, Rectangle, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { stateBet, stateBetDerived } from 'state-shared';
  import { getContext } from '../game/context.js';
  import SetSpineAttachment from './SetSpineAttachment.svelte';
  import SpineSkin from './SpineSkin.svelte';
  import { closeHudBoxes } from './hudOverlayState.svelte.js';
  import { playHudOnOffSound } from './hudSounds.svelte.js';
  import {
    HUD_CENTER_Y_RATIO,
    HUD_OFFSET_X,
    HUD_OFFSET_Y,
    getHudScale,
    hudAssetX,
    hudAssetY,
  } from './hudLayout.js';

  const TURBO_BUTTON_SKIN = 'turboButtonon';
  const TURBO_BUTTON_OFFSET_X = 1130;
  const TURBO_BUTTON_OFFSET_Y = 75;
  const TURBO_BUTTON_HIT_SIZE = 180;
  const TURBO_CLICK_ANIMATION_DURATION = 350;
  let turboAnimating = $state(false);
  let turboPressCount = $state(0);
  let turboAnimationTimeout;
  const active = $derived(stateBet.isTurbo);

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudCenterX = $derived(w / 2 + HUD_OFFSET_X * hudScale);
  const hudCenterY = $derived(h * HUD_CENTER_Y_RATIO + HUD_OFFSET_Y * hudScale);

  function turboButtonX(offsetX = TURBO_BUTTON_OFFSET_X) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function turboButtonY(offsetY = TURBO_BUTTON_OFFSET_Y) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }

  function toggleTurbo() {
    if (turboAnimating) return;

    const nextActive = !stateBet.isTurbo;

    closeHudBoxes();
    playHudOnOffSound();
     turboAnimating = true;
    turboPressCount += 1;
    stateBetDerived.updateIsTurbo(nextActive, { persistent: true });

    clearTimeout(turboAnimationTimeout);
    turboAnimationTimeout = setTimeout(() => {
      turboAnimating = false;
    }, TURBO_CLICK_ANIMATION_DURATION);
  }

  onDestroy(() => {
    clearTimeout(turboAnimationTimeout);
  });
</script>

{#snippet spineChildren()}{/snippet}

{#if stateApp.loaded && stateApp.loadedAssets.HudTurboButton}
  <Container
    x={turboButtonX()}
    y={turboButtonY()}
    scale={{ x: hudScale, y: hudScale }}
    zIndex={10}
  >
    <SpineProvider key="HudTurboButton">
      <SpineSkin skinName={TURBO_BUTTON_SKIN} />

      {#if active || turboAnimating}
        <SetSpineAttachment slotName="autospinOff" attachmentName={null} />
        <SetSpineAttachment slotName="autospinOn" attachmentName="on" />
      {:else}
        <SetSpineAttachment slotName="autospinOff" attachmentName="off" />
        <SetSpineAttachment slotName="autospinOn" attachmentName={null} />
      {/if}

      {#if turboAnimating}
        {#key turboPressCount}
          <SpineTrack trackIndex={0} animationName="animation" loop={false} />
        {/key}
      {/if}

      {@render spineChildren()}
    </SpineProvider>

    <Rectangle
      width={TURBO_BUTTON_HIT_SIZE}
      height={TURBO_BUTTON_HIT_SIZE}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerup={toggleTurbo}
    />
  </Container>
{/if}
