<script>
  // Game.svelte — Castle Fortune
  // Root component — all components mounted here in z-order

  import { App, Container } from 'pixi-svelte';
  import { getContext } from '../game/context.js';

  // Week 2
  import Sound             from './Sound.svelte';
  import Transition        from './Transition.svelte';
  import BoardFrame        from './BoardFrame.svelte';
  import ReelScene         from './ReelScene.svelte';

  // Week 3
  import Win               from './Win.svelte';
  import FreeSpinIntro     from './FreeSpinIntro.svelte';
  import FreeSpinCounter   from './FreeSpinCounter.svelte';
  import FreeSpinOutro     from './FreeSpinOutro.svelte';
  import FreeSpinRetrigger from './FreeSpinRetrigger.svelte';
  import UI                from './UI.svelte';
  import EnableGameActor   from './EnableGameActor.svelte';

  // Week 4
  import WildBlock         from './WildBlock.svelte';
  import WildMultiplier    from './WildMultiplier.svelte';
  import Wincap            from './Wincap.svelte';

  // Missing pieces
  import Background        from './Background.svelte';
  import LoadingScreen     from './LoadingScreen.svelte';
  import StartScreen       from './StartScreen.svelte';
  import { playBaseMusic } from './hudSounds.svelte.js';

  const { showStartScreen = false } = $props();

  const context = getContext();
  const { eventEmitter, stateApp, stateLayoutDerived } = context;

  const width  = $derived(stateLayoutDerived.canvasSizes().width);
  const height = $derived(stateLayoutDerived.canvasSizes().height);
  let startScreenVisible = $state(showStartScreen);
  let startScreenExiting = $state(false);

  $effect(() => {
    if (stateApp.loaded && !startScreenVisible) {
      playBaseMusic();
    }
  });

  async function continueFromStartScreen() {
    if (startScreenExiting) return;
    startScreenExiting = true;

    const exitStartScreen = () => {
      startScreenVisible = false;
    };

    eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_transition' });
    await eventEmitter.broadcastAsync({
      type: 'transition',
      onCovered: exitStartScreen,
    });
    exitStartScreen();
  }
</script>

<App {width} {height}>
  <EnableGameActor />

  {#if !stateApp.loaded}
    <!-- Loading screen — shown while assets load -->
    <LoadingScreen />

  {:else if startScreenVisible}

    <StartScreen onContinue={continueFromStartScreen} />

  {:else}

    <!-- z=0:  Background art -->
    <Background />

    <!-- z=5: Reel art and symbols -->
    <ReelScene />

    <!-- z=30: Board frame and freespin glow -->
    <BoardFrame />

    <!-- z=35: Wild block formations -->
    <WildBlock />

    <!-- z=40: Win celebrations -->
    <Win />

    <!-- z=45: Wild multiplier badge -->
    <WildMultiplier />

    <!-- z=50: Freespin UI -->
    <FreeSpinIntro />
    <FreeSpinCounter />
    <FreeSpinOutro />
    <FreeSpinRetrigger />

    <!-- z=70: Win cap screen -->
    <Wincap />

    <!-- z=80: Game UI — spin button, bet controls -->
    <UI />

  {/if}

  <!-- z=120: Screen transitions -->
  <Transition />

</App>

<!-- Always mounted regardless of load state -->
<Sound />
