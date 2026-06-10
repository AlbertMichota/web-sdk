<script>
  // Transition.svelte
  // Full-screen wipe used when entering and exiting freespins
  // Subscribes to the 'transition' emitter event
  // broadcastAsync means the book player waits for the animation to finish

  import { onMount, onDestroy } from 'svelte';
  import { Container, Graphics, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import { playFlameTransitionSound } from './hudSounds.svelte.js';

  const context  = getContext();
  const { eventEmitter, stateApp, stateLayoutDerived } = context;

  // ── State ──────────────────────────────────────────────────────────────────
  let visible   = $state(false);
  let opacity   = $state(0);
  let playCount = $state(0);
  const TRANSITION_TOTAL_DURATION = 600;
  const TRANSITION_COVERED_DELAY = 500;

  // ── Transition animation ───────────────────────────────────────────────────
  // Fades in, holds briefly, then fades out
  // Returns a promise so broadcastAsync can await it

  async function runTransition(event = {}) {
    visible = true;
    playCount += 1;
    opacity = 1;
    playFlameTransitionSound();
    let covered = false;

    const coveredTimeout = setTimeout(() => {
      covered = true;
      event.onCovered?.();
    }, event.coveredDelay ?? TRANSITION_COVERED_DELAY);

    await new Promise(r => setTimeout(r, event.duration ?? TRANSITION_TOTAL_DURATION));
    clearTimeout(coveredTimeout);
    if (!covered) event.onCovered?.();
    visible = false;
  }

  // ── Event subscriptions ────────────────────────────────────────────────────
  let unsubscribe;

  onMount(() => {
    unsubscribe = eventEmitter.subscribeMany({
      // bookEventHandlerMap calls broadcastAsync({ type: 'transition' })
      // returning a promise here makes the book player wait
      transition: (event) => runTransition(event),
    });
  });

  onDestroy(() => unsubscribe?.());
</script>

{#if visible}
  <Container zIndex={120}>
    {#if stateApp.loadedAssets.TransitionFlame}
      {#key playCount}
        <SpineProvider
          key="TransitionFlame"
          x={stateLayoutDerived.canvasSizes().width / 2}
          y={stateLayoutDerived.canvasSizes().height / 2}
          scale={{
            x: Math.max(stateLayoutDerived.canvasSizes().width / 1280, stateLayoutDerived.canvasSizes().height / 720),
            y: Math.max(stateLayoutDerived.canvasSizes().width / 1280, stateLayoutDerived.canvasSizes().height / 720),
          }}
        >
          <SpineTrack trackIndex={0} animationName="animation" loop={false} />
        </SpineProvider>
      {/key}
    {:else}
      <Graphics
        draw={(g) => {
          const w = stateLayoutDerived.canvasSizes().width;
          const h = stateLayoutDerived.canvasSizes().height;
          g.clear();
          g.beginFill(0x000000, opacity);
          g.drawRect(0, 0, w, h);
          g.endFill();
        }}
      />
    {/if}
  </Container>
{/if}
