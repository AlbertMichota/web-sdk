<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Game from '../components/Game.svelte';

  const { Story } = defineMeta({
    title: 'Castle Fortune / Components',
    component: Game,
  });
</script>

<script>
  import { StoryLocale } from 'components-storybook';
  import { setContext } from '../game/context.js';
  setContext();
</script>

<Story name="component (loadingScreen)">
  <StoryLocale lang="en">
    <Game />
  </StoryLocale>
</Story>