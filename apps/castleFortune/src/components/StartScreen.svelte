<script>
  import { Container, Rectangle, Sprite, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import SpineSkin from './SpineSkin.svelte';

  const { onContinue = () => {} } = $props();

  const START_BG_NATIVE_WIDTH = 1672;
  const START_BG_NATIVE_HEIGHT = 941;
  const START_LOGO_NATIVE_WIDTH = 1536;
  const START_LOGO_NATIVE_HEIGHT = 1024;
  const START_NATIVE_WIDTH = 1672;
  const START_NATIVE_HEIGHT = 941;
  const START_CENTER_Y_RATIO = 0.5;
  const START_SCENE_OFFSET_X = 0;
  const START_SCENE_OFFSET_Y = 0;
  const START_SCENE_SCALE_MULTIPLIER = 1;

  const START_BACKGROUND_OFFSET_X = 0;
  const START_BACKGROUND_OFFSET_Y = 0;
  const START_BACKGROUND_SCALE = 1;

  const START_LOGO_OFFSET_X = 0;
  const START_LOGO_OFFSET_Y = 10;
  const START_LOGO_SCALE = 0.5;
  const START_LOGO_Y_RATIO = 0.23;

  const START_BANNERS_OFFSET_X = 0;
  const START_BANNERS_OFFSET_Y = 0;
  const START_BANNERS_SCALE = 0.578;
  const START_BANNERS_Y_RATIO = 0.58;

  const START_PRESS_OFFSET_X = 0;
  const START_PRESS_OFFSET_Y = 70;
  const START_PRESS_SCALE = 0.8;

  const BANNER_OPTIONS = [
    { skin: 'banner1', offsetX: -520, offsetY: -10 },
    { skin: 'banner2', offsetX: 0, offsetY: 50 },
    { skin: 'banner3', offsetX: 520, offsetY: -10 },
  ];

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);
  const cx = $derived(w / 2);
  const cy = $derived(h / 2);
  const coverScale = $derived(Math.max(w / START_BG_NATIVE_WIDTH, h / START_BG_NATIVE_HEIGHT));
  const baseScale = $derived(Math.min(w / START_NATIVE_WIDTH, h / START_NATIVE_HEIGHT));
  const layoutScale = $derived(baseScale * START_SCENE_SCALE_MULTIPLIER);
  const layoutCenterX = $derived(w / 2 + START_SCENE_OFFSET_X * layoutScale);
  const layoutCenterY = $derived(h * START_CENTER_Y_RATIO + START_SCENE_OFFSET_Y * layoutScale);

  function backgroundX(offsetX = 0) {
    return cx + offsetX * coverScale;
  }

  function backgroundY(offsetY = 0) {
    return cy + offsetY * coverScale;
  }

  function startX(offsetX = 0) {
    return layoutCenterX + offsetX * layoutScale;
  }

  function startY(yRatio = 0.5, offsetY = 0) {
    return layoutCenterY + (yRatio - START_CENTER_Y_RATIO) * START_NATIVE_HEIGHT * layoutScale + offsetY * layoutScale;
  }

  function startScale(baseScale = 1, scale = layoutScale) {
    return scale * baseScale;
  }

  const backgroundScale = $derived(startScale(START_BACKGROUND_SCALE, coverScale));
  const logoScale = $derived(startScale(START_LOGO_SCALE));
  const logoWidth = $derived(START_LOGO_NATIVE_WIDTH * logoScale);
  const logoHeight = $derived(START_LOGO_NATIVE_HEIGHT * logoScale);
  const logoY = $derived(startY(START_LOGO_Y_RATIO, START_LOGO_OFFSET_Y));

  const bannerScale = $derived(startScale(START_BANNERS_SCALE));
  const bannerY = $derived(startY(START_BANNERS_Y_RATIO, START_BANNERS_OFFSET_Y));

  const pressScale = $derived(startScale(START_PRESS_SCALE));
</script>

{#snippet spineChildren()}{/snippet}

<Container zIndex={100} sortableChildren={true}>
  {#if stateApp.loadedAssets.StartBackground}
    <Sprite
      key="StartBackground"
      x={backgroundX(START_BACKGROUND_OFFSET_X)}
      y={backgroundY(START_BACKGROUND_OFFSET_Y)}
      anchor={{ x: 0.5, y: 0.5 }}
      width={START_BG_NATIVE_WIDTH * backgroundScale}
      height={START_BG_NATIVE_HEIGHT * backgroundScale}
      zIndex={0}
    />
  {/if}

  {#if stateApp.loadedAssets.StartLogo}
    <Sprite
      key="StartLogo"
      x={startX(START_LOGO_OFFSET_X)}
      y={logoY}
      anchor={{ x: 0.5, y: 0.5 }}
      width={logoWidth}
      height={logoHeight}
      zIndex={2}
    />
  {/if}

  {#if stateApp.loadedAssets.StartBanners}
    {#each BANNER_OPTIONS as banner (banner.skin)}
      <SpineProvider
        key="StartBanners"
        x={startX(START_BANNERS_OFFSET_X + banner.offsetX)}
        y={bannerY + banner.offsetY * layoutScale}
        scale={{ x: bannerScale, y: bannerScale }}
        zIndex={3}
      >
        <SpineSkin skinName={banner.skin} />
        <SpineTrack trackIndex={0} animationName="animation" loop={true} />
        {@render spineChildren()}
      </SpineProvider>
    {/each}
  {/if}

  {#if stateApp.loadedAssets.StartPressContinue}
    <SpineProvider
      key="StartPressContinue"
      x={startX(START_PRESS_OFFSET_X)}
      y={startY(0.5, START_PRESS_OFFSET_Y)}
      scale={{ x: pressScale, y: pressScale }}
      zIndex={4}
    >
      <SpineTrack trackIndex={0} animationName="animation" loop={true} />
      {@render spineChildren()}
    </SpineProvider>
  {/if}

  <Rectangle
    x={cx}
    y={cy}
    width={w}
    height={h}
    anchor={{ x: 0.5, y: 0.5 }}
    backgroundAlpha={0}
    eventMode="static"
    cursor="pointer"
    zIndex={10}
    onpointerup={onContinue}
  />
</Container>
