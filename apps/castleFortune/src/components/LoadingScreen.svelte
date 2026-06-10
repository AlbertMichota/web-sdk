<script>
  // LoadingScreen.svelte
  // Shown while game assets are loading
  // Displays a progress bar that fills as assets load
  // Replaced by the game once stateApp.loaded becomes true

  import { Container, Graphics, Text } from 'pixi-svelte';
  import { getContext } from '../game/context.js';

  const context = getContext();
  const { stateApp, stateLayoutDerived } = context;

  // ── Layout ─────────────────────────────────────────────────────────────────
  const w  = $derived(stateLayoutDerived.canvasSizes().width);
  const h  = $derived(stateLayoutDerived.canvasSizes().height);
  const cx = $derived(w / 2);
  const cy = $derived(h / 2);

  // ── Progress ───────────────────────────────────────────────────────────────
  const rawProgress = $derived(stateApp.loadingProgress ?? 0);
  const progressRatio = $derived(Math.min(Math.max(rawProgress > 1 ? rawProgress / 100 : rawProgress, 0), 1));
  const progressText = $derived(`${Math.round(progressRatio * 100)}%`);

  // Bar dimensions
  const BAR_WIDTH  = 300;
  const BAR_HEIGHT = 8;
  const BAR_FILL   = $derived(BAR_WIDTH * progressRatio);
</script>

<Container zIndex={100}>

  <!-- Full screen black background -->
  <Graphics
    draw={(g) => {
      g.clear();
      g.beginFill(0x000000, 1);
      g.drawRect(0, 0, w, h);
      g.endFill();
    }}
  />

  <!-- Game title -->
  <Text
    text="CASTLE FORTUNE"
    x={cx}
    y={cy - 80}
    anchor={{ x: 0.5, y: 0.5 }}
    style={{
      fontFamily:      'Arial',
      fontSize:        48,
      fontWeight:      'bold',
      fill:            0xFFD700,
      stroke:          0x000000,
      strokeThickness: 6,
      letterSpacing:   4,
    }}
  />

  <!-- Progress bar track -->
  <Graphics
    x={cx - BAR_WIDTH / 2}
    y={cy}
    draw={(g) => {
      g.clear();
      // Track background
      g.beginFill(0x222222, 1);
      g.drawRoundedRect(0, 0, BAR_WIDTH, BAR_HEIGHT, 4);
      g.endFill();
      // Fill
      if (BAR_FILL > 0) {
        g.beginFill(0xFFD700, 1);
        g.drawRoundedRect(0, 0, BAR_FILL, BAR_HEIGHT, 4);
        g.endFill();
      }
    }}
  />

  <!-- Progress percentage text -->
  <Text
    text={progressText}
    x={cx}
    y={cy + 28}
    anchor={{ x: 0.5, y: 0 }}
    style={{
      fontFamily: 'Arial',
      fontSize:   14,
      fill:       0x888888,
    }}
  />

  <!-- Loading label -->
  <Text
    text="LOADING..."
    x={cx}
    y={cy - 24}
    anchor={{ x: 0.5, y: 0.5 }}
    style={{
      fontFamily:  'Arial',
      fontSize:    14,
      fill:        0x555555,
      letterSpacing: 3,
    }}
  />

</Container>
