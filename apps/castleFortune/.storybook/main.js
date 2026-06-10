import { main } from 'config-storybook';

export default {
  ...main,
  stories: ['../src/**/*.stories.@(js|ts|svelte)'],
  staticDirs: ['../static'],
};