<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  const { Story } = defineMeta({
    title: 'Castle Fortune / MODE_BONUS / book',
    component: Game,
  });
</script>

<script>
  import { StoryLocale, StoryGameTemplate, templateArgs } from 'components-storybook';
  import Game from '../components/Game.svelte';
  import { setContext, getContext } from '../game/context.js';
  import { BONUS_BOOKS } from './data/bonus_books.js';

  setContext();
  const { bookPlayer } = getContext();
</script>

{#snippet template(args)}
  <StoryGameTemplate
    skipLoadingScreen={args.skipLoadingScreen}
    action={async () => { await args.action?.(args.data); }}
  >
    <StoryLocale lang="en">
      <Game />
    </StoryLocale>
  </StoryGameTemplate>
{/snippet}

<Story name="component (loadingScreen)">
  <StoryLocale lang="en">
    <Game />
  </StoryLocale>
</Story>

<Story
  name="single_spin_win"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BONUS_BOOKS['single_spin_win']); } })}
  {template}
/>

<Story
  name="retrigger"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BONUS_BOOKS['retrigger']); } })}
  {template}
/>

<Story
  name="wild_blocks"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BONUS_BOOKS['wild_blocks']); } })}
  {template}
/>

<Story
  name="freespin_end"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BONUS_BOOKS['freespin_end']); } })}
  {template}
/>

<Story
  name="full_round"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BONUS_BOOKS['full_round']); } })}
  {template}
/>