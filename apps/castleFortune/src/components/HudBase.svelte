<script>
  import { Sprite } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import {
    HUD_NATIVE_WIDTH,
    HUD_NATIVE_HEIGHT,
    HUD_BASE_OFFSET_X,
    HUD_BASE_OFFSET_Y,
    getHudScale,
    hudBottomAssetX,
    hudBottomAssetY,
  } from './hudLayout.js';

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);

  const hudScale = $derived(getHudScale(w, h));
  const hudWidth = $derived(HUD_NATIVE_WIDTH * hudScale);
  const hudHeight = $derived(HUD_NATIVE_HEIGHT * hudScale);
</script>

{#if stateApp.loaded && stateApp.loadedAssets.HudBase}
  <Sprite
    key="HudBase"
    x={hudBottomAssetX(w, hudScale, HUD_BASE_OFFSET_X)}
    y={hudBottomAssetY(h, hudScale, HUD_BASE_OFFSET_Y)}
    anchor={{ x: 0.5, y: 1 }}
    width={hudWidth}
    height={hudHeight}
    zIndex={0}
  />
{/if}
