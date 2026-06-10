<script>
  // Symbol.svelte
  // Renders a single symbol on the board using spine animations
  // Handles all symbol states: static, spin, land, win, postWinStatic
  // Used by Board.svelte — one instance per symbol cell

  import { Container, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { SYMBOL_INFO_MAP, SYMBOL_SIZE } from '../game/constants.js';
  import { getContext } from '../game/context.js';
  import SpineCenter from './SpineCenter.svelte';
  import SpineSkin from './SpineSkin.svelte';

  const context = getContext();
  const { stateApp } = context;

  // ── Props ──────────────────────────────────────────────────────────────────
  let {
    symbolName  = 'L5',   // e.g. 'H1', 'L3', 'W', 'S'
    state       = 'static', // 'static' | 'spin' | 'land' | 'win' | 'postWinStatic'
    animationKey = '',
    x           = 0,
    y           = 0,
    cellWidth   = SYMBOL_SIZE,
    cellHeight  = SYMBOL_SIZE,
    highlighted = false,  // true when this symbol is part of a winning line
  } = $props();

  // ── Symbol info lookup ─────────────────────────────────────────────────────
  // Get the display config for this symbol in its current state
  const symbolInfo = $derived(
    SYMBOL_INFO_MAP[symbolName]?.[state] ?? SYMBOL_INFO_MAP['L5'].static
  );

  // ── Spine config ───────────────────────────────────────────────────────────
  const spineConfig = $derived({
    assetKey:      symbolInfo.assetKey,
    animationName: symbolInfo.animationName,
    skinName:      symbolInfo.skinName, // only used by low symbols
    loop:          state === 'static' || state === 'spin',
    sizeRatios:    symbolInfo.sizeRatios,
  });

  // ── Size ───────────────────────────────────────────────────────────────────
  const symbolSize = $derived(Math.min(cellWidth, cellHeight));
  const spineData = $derived(stateApp.loadedAssets?.[spineConfig.assetKey]);
  const sourceWidth = $derived(spineData?.width ?? symbolSize);
  const sourceHeight = $derived(spineData?.height ?? symbolSize);
  const fitRatio = $derived(Math.min(spineConfig.sizeRatios.width, spineConfig.sizeRatios.height));
  const scaleValue = $derived((symbolSize * fitRatio) / Math.max(sourceWidth, sourceHeight));
  const scale = $derived({ x: scaleValue, y: scaleValue });
  const centerKey = $derived(`${symbolName}:${state}:${animationKey}:${spineConfig.assetKey}:${spineConfig.skinName ?? ''}`);
</script>

<Container {x} {y}>
  {#snippet spineChildren()}{/snippet}

  {#if stateApp.loaded && stateApp.loadedAssets[spineConfig.assetKey]}
    <SpineProvider
      key={spineConfig.assetKey}
      {scale}
      alpha={highlighted ? 1 : 0.85}
    >
      <SpineSkin skinName={spineConfig.skinName} />
      <SpineCenter {centerKey} {scaleValue} />
      {#if spineConfig.animationName}
        {#key `${spineConfig.assetKey}:${spineConfig.animationName}:${animationKey}`}
          <SpineTrack
            trackIndex={0}
            animationName={spineConfig.animationName}
            loop={spineConfig.loop}
          />
        {/key}
      {/if}
      {@render spineChildren()}</SpineProvider>
  {/if}
</Container>
