<script>
  import { Container } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import {
    REEL_CENTER_Y_RATIO,
    REEL_HUD_RESERVED_RATIO,
    REEL_NATIVE_HEIGHT,
    REEL_NATIVE_WIDTH,
    REEL_SCENE_OFFSET_X,
    REEL_SCENE_OFFSET_Y,
    REEL_SCENE_SCALE_MULTIPLIER,
  } from '../game/reelLayout.js';
  import Reel from './Reel.svelte';
  import Board from './Board.svelte';

  const context = getContext();
  const { stateLayoutDerived } = context;

  const w = $derived(stateLayoutDerived.canvasSizes().width);
  const h = $derived(stateLayoutDerived.canvasSizes().height);
  const baseScale = $derived(
    Math.min(w / REEL_NATIVE_WIDTH, (h * (1 - REEL_HUD_RESERVED_RATIO)) / REEL_NATIVE_HEIGHT)
  );
  const scale = $derived(baseScale * REEL_SCENE_SCALE_MULTIPLIER);
  const x = $derived(w / 2 + REEL_SCENE_OFFSET_X * scale);
  const y = $derived(h * REEL_CENTER_Y_RATIO + REEL_SCENE_OFFSET_Y * scale);
</script>

<Container {x} {y} scale={{ x: scale, y: scale }} zIndex={5}>
  <Reel />
  <Board />
</Container>
