<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  const { Story } = defineMeta({
    title: 'Castle Fortune / MODE_BASE / book',
  });
</script>

<script lang="ts">
  import { StoryLocale, StoryGameTemplate, type TemplateArgs, templateArgs } from 'components-storybook';
  import Game from '../components/Game.svelte';
  import { setContext } from '../game/context.js';
  import { BASE_BOOKS } from './data/base_books.js';
  setContext();

  import { getContext } from '../game/context.js';
  const { bookPlayer } = getContext();
</script>

{#snippet template(args: TemplateArgs<any>)}
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
  name="zero_win"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BASE_BOOKS['zero_win']); } })}
  {template}
/>

<Story
  name="small_win"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BASE_BOOKS['small_win']); } })}
  {template}
/>

<Story
  name="big_win"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BASE_BOOKS['big_win']); } })}
  {template}
/>

<Story
  name="wild_block_2x2"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BASE_BOOKS['wild_block_2x2']); } })}
  {template}
/>

<Story
  name="wild_block_3x3"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BASE_BOOKS['wild_block_3x3']); } })}
  {template}
/>

<Story
  name="freespin_trigger"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BASE_BOOKS['freespin_trigger']); } })}
  {template}
/>

<Story
  name="wincap"
  args={templateArgs({ skipLoadingScreen: true, data: {}, action: async () => { await bookPlayer.playBook(BASE_BOOKS['wincap']); } })}
  {template}
/>