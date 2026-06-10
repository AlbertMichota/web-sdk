<script>
  import { onDestroy, onMount } from 'svelte';
  import { Container, Rectangle, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import { toggleBonusOptions } from './hudOverlayState.svelte.js';
  import { hudSoundState } from './hudSoundState.svelte.js';
  import {
    HUD_CENTER_Y_RATIO,
    HUD_OFFSET_X,
    HUD_OFFSET_Y,
    getHudScale,
    hudAssetX,
    hudAssetY,
  } from './hudLayout.js';

  const BONUS_BUTTON_OFFSET_X = -925;
  const BONUS_BUTTON_OFFSET_Y = 0;
  const BONUS_BUTTON_HIT_SIZE = 220;
  const BONUS_CLICK_ANIMATION_DURATION = 350;
  const BONUS_LEMON_SOUND_SRC = '/assests/audio/HUD/bonusLemonSounds.MP3';

  let bonusAnimating = $state(false);
  let bonusPressCount = $state(0);
  let bonusAnimationTimeout;
  let bonusLemonAudio;

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudCenterX = $derived(w / 2 + HUD_OFFSET_X * hudScale);
  const hudCenterY = $derived(h * HUD_CENTER_Y_RATIO + HUD_OFFSET_Y * hudScale);

  function bonusButtonX(offsetX = BONUS_BUTTON_OFFSET_X) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function bonusButtonY(offsetY = BONUS_BUTTON_OFFSET_Y) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }

  function playBonusAnimation() {
    if (bonusLemonAudio) {
      bonusLemonAudio.currentTime = 0;
      bonusLemonAudio.volume = hudSoundState.soundEffectVolume;
      bonusLemonAudio.play().catch(() => {});
    }
    toggleBonusOptions();
    bonusAnimating = true;
    bonusPressCount += 1;

    clearTimeout(bonusAnimationTimeout);
    bonusAnimationTimeout = setTimeout(() => {
      bonusAnimating = false;
    }, BONUS_CLICK_ANIMATION_DURATION);
  }

  onMount(() => {
    bonusLemonAudio = new Audio(BONUS_LEMON_SOUND_SRC);
    bonusLemonAudio.preload = 'auto';
  });

  onDestroy(() => {
    clearTimeout(bonusAnimationTimeout);
    bonusLemonAudio?.pause();
  });
</script>

{#snippet spineChildren()}{/snippet}

{#if stateApp.loaded && stateApp.loadedAssets.HudBonusButton}
  <Container
    x={bonusButtonX()}
    y={bonusButtonY()}
    scale={{ x: hudScale, y: hudScale }}
    zIndex={10}
  >
    <SpineProvider key="HudBonusButton">
      <SpineTrack
        trackIndex={0}
        animationName="idle"
        loop={true}
        trackTime={8.3333}
      />
      {#if bonusAnimating}
        {#key bonusPressCount}
          <SpineTrack
            trackIndex={1}
            animationName="Clicked"
            loop={false}
          />
        {/key}
      {/if}
      {@render spineChildren()}
    </SpineProvider>

    <Rectangle
      width={BONUS_BUTTON_HIT_SIZE}
      height={BONUS_BUTTON_HIT_SIZE}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerup={playBonusAnimation}
    />
  </Container>
{/if}
