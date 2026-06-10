<script>
  import { onDestroy } from 'svelte';
  import { Container, Rectangle, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import HideSpineSlot from './HideSpineSlot.svelte';
  import SetSpineAttachment from './SetSpineAttachment.svelte';
  import SpineSkin from './SpineSkin.svelte';
  import { hudOverlayState, toggleAutoSpinBox } from './hudOverlayState.svelte.js';
  import { playHudOnOffSound } from './hudSounds.svelte.js';
  import {
    HUD_CENTER_Y_RATIO,
    HUD_OFFSET_X,
    HUD_OFFSET_Y,
    getHudScale,
    hudAssetX,
    hudAssetY,
  } from './hudLayout.js';

  const AUTO_SPIN_ON_SKIN = 'autoSpinon';
  const AUTO_SPIN_OFF_SKIN = 'autoSpinoff';
  const AUTO_SPIN_OFFSET_X = 1130;
  const AUTO_SPIN_OFFSET_Y = -75;
  const AUTO_SPIN_HIT_SIZE = 180;
  const AUTO_SPIN_CLICK_ANIMATION_DURATION = 350;

  let autoSpinIsOn = $state(false);
  let autoSpinTargetOn = $state(false);
  let autoSpinAnimating = $state(false);
  let autoSpinPressCount = $state(0);
  let autoSpinAnimationTimeout;

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudCenterX = $derived(w / 2 + HUD_OFFSET_X * hudScale);
  const hudCenterY = $derived(h * HUD_CENTER_Y_RATIO + HUD_OFFSET_Y * hudScale);

  $effect(() => {
    if (hudOverlayState.autoSpinBoxVisible || autoSpinAnimating) return;
    autoSpinIsOn = false;
    autoSpinTargetOn = false;
  });

  function autoSpinX(offsetX = AUTO_SPIN_OFFSET_X) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function autoSpinY(offsetY = AUTO_SPIN_OFFSET_Y) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }

  function clickAutoSpin() {
    if (autoSpinAnimating) return;

    playHudOnOffSound();
    autoSpinTargetOn = !autoSpinIsOn;
    toggleAutoSpinBox();
    autoSpinAnimating = true;
    autoSpinPressCount += 1;

    clearTimeout(autoSpinAnimationTimeout);
    autoSpinAnimationTimeout = setTimeout(() => {
      autoSpinAnimating = false;
      autoSpinIsOn = autoSpinTargetOn;
    }, AUTO_SPIN_CLICK_ANIMATION_DURATION);
  }

  onDestroy(() => {
    clearTimeout(autoSpinAnimationTimeout);
  });
</script>

{#snippet spineChildren()}{/snippet}

{#if stateApp.loaded && stateApp.loadedAssets.HudAutoSpin}
  <Container
    x={autoSpinX()}
    y={autoSpinY()}
    scale={{ x: hudScale, y: hudScale }}
    zIndex={10}
  >
    {#if autoSpinAnimating}
      {#key autoSpinPressCount}
        <SpineProvider key="HudAutoSpin">
          <SpineSkin skinName={autoSpinTargetOn ? AUTO_SPIN_ON_SKIN : AUTO_SPIN_OFF_SKIN} />
          <SetSpineAttachment slotName="autospinOff" attachmentName="off" />
          <SetSpineAttachment slotName="autospinOn" attachmentName="on" />
          <SpineTrack trackIndex={0} animationName="animation" loop={false} />
          {@render spineChildren()}
        </SpineProvider>
      {/key}
    {:else if autoSpinIsOn}
      <SpineProvider key="HudAutoSpin">
        <SpineSkin skinName={AUTO_SPIN_ON_SKIN} />
        <HideSpineSlot slotName="autospinOff" />
        <SetSpineAttachment slotName="autospinOn" attachmentName="on" />
        {@render spineChildren()}
      </SpineProvider>
    {:else}
      <SpineProvider key="HudAutoSpin">
        <SpineSkin skinName={AUTO_SPIN_ON_SKIN} />
        <SetSpineAttachment slotName="autospinOff" attachmentName="off" />
        <HideSpineSlot slotName="autospinOn" />
        {@render spineChildren()}
      </SpineProvider>
    {/if}

    <Rectangle
      width={AUTO_SPIN_HIT_SIZE}
      height={AUTO_SPIN_HIT_SIZE}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerup={clickAutoSpin}
    />
  </Container>
{/if}
