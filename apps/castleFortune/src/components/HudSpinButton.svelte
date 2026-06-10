<script>
  import { Container, Rectangle, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import SetSpineAttachment from './SetSpineAttachment.svelte';
  import { BASE_BOOKS } from '../stories/data/base_books.js';
  import { closeHudBoxes } from './hudOverlayState.svelte.js';
  import { triggerReelSpinActive } from './reelAnimationState.svelte.js';
  import { playSpinButtonSound } from './hudSounds.svelte.js';
  import {
    HUD_CENTER_Y_RATIO,
    HUD_OFFSET_X,
    HUD_OFFSET_Y,
    getHudScale,
    hudAssetX,
    hudAssetY,
  } from './hudLayout.js';

  const SPIN_BUTTON_OFFSET_X = 895;
  const SPIN_BUTTON_OFFSET_Y = 0;
  const SPIN_BUTTON_HIT_SIZE = 320;
  const SPIN_ANIMATION_TIME_SCALE = 1;
  let spinAnimating = $state(false);
  let spinBookPlaying = $state(false);
  let fastDropRequested = $state(false);
  let spinPressCount = $state(0);

  const context = getContext();
  const { bookPlayer, eventEmitter, stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudCenterX = $derived(w / 2 + HUD_OFFSET_X * hudScale);
  const hudCenterY = $derived(h * HUD_CENTER_Y_RATIO + HUD_OFFSET_Y * hudScale);

  function spinButtonX(offsetX = SPIN_BUTTON_OFFSET_X) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function spinButtonY(offsetY = SPIN_BUTTON_OFFSET_Y) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }

  async function playSpinAnimation() {
    if (spinBookPlaying) {
      if (!fastDropRequested) {
        fastDropRequested = true;
        eventEmitter.broadcast({ type: 'boardFastDrop' });
      }
      return;
    }

    if (spinAnimating) return;

    closeHudBoxes();
    playSpinButtonSound();
    triggerReelSpinActive();
    spinAnimating = true;
    spinBookPlaying = true;
    fastDropRequested = false;
    spinPressCount += 1;

    try {
      await bookPlayer.playBook(BASE_BOOKS['zero_win']);
    } catch (error) {
      console.error('[HudSpinButton] Failed to play base book', error);
    } finally {
      spinAnimating = false;
      spinBookPlaying = false;
      fastDropRequested = false;
    }
  }
</script>

{#snippet spineChildren()}{/snippet}

{#if stateApp.loaded && stateApp.loadedAssets.HudSpinButton}
  <Container
    x={spinButtonX()}
    y={spinButtonY()}
    scale={{ x: hudScale, y: hudScale }}
    zIndex={10}
  >
    <SpineProvider key="HudSpinButton">
      <SetSpineAttachment slotName="SpinBase" attachmentName="SpinBase" />
      <SetSpineAttachment slotName="spinOff" attachmentName="spinOff" />
      <SetSpineAttachment slotName="spinOn" attachmentName={null} />
      {@render spineChildren()}
    </SpineProvider>

    {#if spinAnimating}
      <SpineProvider key="HudSpinButton">
        {#key spinPressCount}
          <SpineTrack
            trackIndex={0}
            animationName="animation"
            loop={false}
            animationStart={0}
            trackTime={0}
            timeScale={SPIN_ANIMATION_TIME_SCALE}
          />
        {/key}
        {@render spineChildren()}
      </SpineProvider>
    {/if}

    <Rectangle
      width={SPIN_BUTTON_HIT_SIZE}
      height={SPIN_BUTTON_HIT_SIZE}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerup={playSpinAnimation}
    />
  </Container>
{/if}
