<script>
  import { Container, SpineProvider, SpineTrack } from 'pixi-svelte';
  import { getContext } from '../game/context.js';
  import { reelAnimationState } from './reelAnimationState.svelte.js';

  const context = getContext();
  const { stateApp } = context;
</script>

<Container zIndex={0}>
  {#snippet spineChildren()}{/snippet}

  {#if stateApp.loaded && stateApp.loadedAssets.Reel}
    <SpineProvider
      key="Reel"
    >
      {#if reelAnimationState.spinActiveKey > 0}
        {#key reelAnimationState.spinActiveKey}
          <SpineTrack
            trackIndex={0}
            animationName="spin active"
            loop={false}
          />
        {/key}
      {/if}
      {@render spineChildren()}
    </SpineProvider>
  {/if}
</Container>
