<script>
  import { onDestroy } from 'svelte';
  import { Container, Rectangle, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import SetSpineAttachment from './SetSpineAttachment.svelte';
  import SpineSkin from './SpineSkin.svelte';
  import { closeHudBoxes } from './hudOverlayState.svelte.js';
  import { playBetSizeSound } from './hudSounds.svelte.js';
  import {
    HUD_CENTER_Y_RATIO,
    HUD_OFFSET_X,
    HUD_OFFSET_Y,
    getHudScale,
    hudAssetX,
    hudAssetY,
  } from './hudLayout.js';

  const BET_HIGHER_SKIN = 'betHigher';
  const BET_HIGHER_OFFSET_X = 625;
  const BET_HIGHER_OFFSET_Y = 0;
  const BET_HIGHER_HIT_SIZE = 140;
  const BET_CLICK_ANIMATION_DURATION = 350;
  let betHigherPressed = $state(false);
  let betHigherAnimating = $state(false);
  let betHigherPressCount = $state(0);
  let betHigherAnimationTimeout;
  const betHigherActive = $derived(betHigherPressed || betHigherAnimating);

  const BET_LOWER_SKIN = 'betLower';
  const BET_LOWER_OFFSET_X = 305;
  const BET_LOWER_OFFSET_Y = 0;
  const BET_LOWER_HIT_SIZE = 140;
  let betLowerPressed = $state(false);
  let betLowerAnimating = $state(false);
  let betLowerPressCount = $state(0);
  let betLowerAnimationTimeout;
  const betLowerActive = $derived(betLowerPressed || betLowerAnimating);

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudCenterX = $derived(w / 2 + HUD_OFFSET_X * hudScale);
  const hudCenterY = $derived(h * HUD_CENTER_Y_RATIO + HUD_OFFSET_Y * hudScale);

  function betHigherX(offsetX = BET_HIGHER_OFFSET_X) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function betHigherY(offsetY = BET_HIGHER_OFFSET_Y) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }

  function betLowerX(offsetX = BET_LOWER_OFFSET_X) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function betLowerY(offsetY = BET_LOWER_OFFSET_Y) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }

  function pressBetHigher() {
    closeHudBoxes();
    playBetSizeSound();
    betHigherPressed = true;
    betHigherAnimating = true;
    betHigherPressCount += 1;

    clearTimeout(betHigherAnimationTimeout);
    betHigherAnimationTimeout = setTimeout(() => {
      betHigherAnimating = false;
    }, BET_CLICK_ANIMATION_DURATION);
  }

  function pressBetLower() {
    closeHudBoxes();
    playBetSizeSound();
    betLowerPressed = true;
    betLowerAnimating = true;
    betLowerPressCount += 1;

    clearTimeout(betLowerAnimationTimeout);
    betLowerAnimationTimeout = setTimeout(() => {
      betLowerAnimating = false;
    }, BET_CLICK_ANIMATION_DURATION);
  }

  onDestroy(() => {
    clearTimeout(betHigherAnimationTimeout);
    clearTimeout(betLowerAnimationTimeout);
  });
</script>

{#snippet spineChildren()}{/snippet}

{#if stateApp.loaded && stateApp.loadedAssets.HudBetHigher}
  <Container
    x={betHigherX()}
    y={betHigherY()}
    scale={{ x: hudScale, y: hudScale }}
    zIndex={10}
  >
    <SpineProvider key="HudBetHigher" alpha={betHigherActive ? 0 : 1}>
      <SpineSkin skinName={BET_HIGHER_SKIN} />
      <SetSpineAttachment slotName="autospinOff" attachmentName="off" />
      <SetSpineAttachment slotName="autospinOn" attachmentName={null} />
      {@render spineChildren()}
    </SpineProvider>

    {#key betHigherPressCount}
      <SpineProvider key="HudBetHigher" alpha={betHigherActive ? 1 : 0}>
        <SpineSkin skinName={BET_HIGHER_SKIN} />
        <SetSpineAttachment slotName="autospinOff" attachmentName={null} />
        <SetSpineAttachment slotName="autospinOn" attachmentName="on" />
        <SpineTrack trackIndex={0} animationName="animation" loop={false} />
        {@render spineChildren()}
      </SpineProvider>
    {/key}

    <Rectangle
      width={BET_HIGHER_HIT_SIZE}
      height={BET_HIGHER_HIT_SIZE}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerout={() => { betHigherPressed = false; }}
      onpointerdown={pressBetHigher}
      onpointerup={() => { betHigherPressed = false; }}
      onpointerupoutside={() => { betHigherPressed = false; }}
    />
  </Container>
{/if}

{#if stateApp.loaded && stateApp.loadedAssets.HudBetLower}
  <Container
    x={betLowerX()}
    y={betLowerY()}
    scale={{ x: hudScale, y: hudScale }}
    zIndex={10}
  >
    <SpineProvider key="HudBetLower" alpha={betLowerActive ? 0 : 1}>
      <SpineSkin skinName={BET_LOWER_SKIN} />
      <SetSpineAttachment slotName="autospinOff" attachmentName="off" />
      <SetSpineAttachment slotName="autospinOn" attachmentName={null} />
      {@render spineChildren()}
    </SpineProvider>

    {#key betLowerPressCount}
      <SpineProvider key="HudBetLower" alpha={betLowerActive ? 1 : 0}>
        <SpineSkin skinName={BET_LOWER_SKIN} />
        <SetSpineAttachment slotName="autospinOff" attachmentName={null} />
        <SetSpineAttachment slotName="autospinOn" attachmentName="on" />
        <SpineTrack trackIndex={0} animationName="animation" loop={false} />
        {@render spineChildren()}
      </SpineProvider>
    {/key}

    <Rectangle
      width={BET_LOWER_HIT_SIZE}
      height={BET_LOWER_HIT_SIZE}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerout={() => { betLowerPressed = false; }}
      onpointerdown={pressBetLower}
      onpointerup={() => { betLowerPressed = false; }}
      onpointerupoutside={() => { betLowerPressed = false; }}
    />
  </Container>
{/if}
