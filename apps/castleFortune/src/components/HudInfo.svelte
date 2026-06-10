<script>
  import { Container, Rectangle, SpineProvider } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import SetSpineAttachment from './SetSpineAttachment.svelte';
  import SpineSkin from './SpineSkin.svelte';
  import { toggleInfoBox } from './hudOverlayState.svelte.js';
  import { playHudOnOffSound } from './hudSounds.svelte.js';
  import {
    HUD_CENTER_Y_RATIO,
    HUD_OFFSET_X,
    HUD_OFFSET_Y,
    getHudScale,
    hudAssetX,
    hudAssetY,
  } from './hudLayout.js';

  const INFO_SKIN = 'infovolume';
  const INFO_OFFSET_X = -622;
  const INFO_OFFSET_Y = 0;
  const INFO_HIT_SIZE = 160;
  let hovered = $state(false);
  let pressed = $state(false);
  const active = $derived(hovered || pressed);

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudCenterX = $derived(w / 2 + HUD_OFFSET_X * hudScale);
  const hudCenterY = $derived(h * HUD_CENTER_Y_RATIO + HUD_OFFSET_Y * hudScale);

  function infoX(offsetX = INFO_OFFSET_X) {
    return hudAssetX(hudCenterX, hudScale, offsetX);
  }

  function infoY(offsetY = INFO_OFFSET_Y) {
    return hudAssetY(hudCenterY, hudScale, offsetY);
  }
</script>

{#snippet spineChildren()}{/snippet}

{#if stateApp.loaded && stateApp.loadedAssets.HudInfo}
  <Container
    x={infoX()}
    y={infoY()}
    scale={{ x: hudScale, y: hudScale }}
    zIndex={10}
  >
    <SpineProvider key="HudInfo" alpha={active ? 0 : 1}>
      <SpineSkin skinName={INFO_SKIN} />
      <SetSpineAttachment slotName="off" attachmentName="off" />
      <SetSpineAttachment slotName="on" attachmentName={null} />
      {@render spineChildren()}
    </SpineProvider>

    <SpineProvider key="HudInfo" alpha={active ? 1 : 0}>
      <SpineSkin skinName={INFO_SKIN} />
      <SetSpineAttachment slotName="off" attachmentName={null} />
      <SetSpineAttachment slotName="on" attachmentName="on" />
      {@render spineChildren()}
    </SpineProvider>

    <Rectangle
      width={INFO_HIT_SIZE}
      height={INFO_HIT_SIZE}
      anchor={{ x: 0.5, y: 0.5 }}
      backgroundAlpha={0}
      eventMode="static"
      cursor="pointer"
      onpointerover={() => { hovered = true; }}
      onpointerout={() => {
        hovered = false;
        pressed = false;
      }}
      onpointerdown={() => { pressed = true; }}
      onpointerup={() => {
        pressed = false;
        playHudOnOffSound();
        toggleInfoBox();
      }}
      onpointerupoutside={() => { pressed = false; }}
    />
  </Container>
{/if}
