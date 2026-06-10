/** @type {import('@storybook/svelte').Preview} */
import { setContext } from 'svelte';

const preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    backgrounds: {
      disable: true,
      default: 'dark',
      values: [{ name: 'dark', value: '#000000' }],
    },
  },
  decorators: [
    (Story) => {
      setContext('castle-fortune', {
        stateApp: {} // Mocking the stateApp object to prevent the crash
      });
      return Story();
    },
  ],
};

export default preview;