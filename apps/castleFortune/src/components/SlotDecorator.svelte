// .storybook/preview.js
import { setContext } from 'svelte';

export const decorators = [
  (Story) => {
    // Manually provide the context your component is looking for
    setContext('your-context-key', { 
      stateApp: { /* mock your PixiJS app object here */ } 
    });
    return Story();
  },
];