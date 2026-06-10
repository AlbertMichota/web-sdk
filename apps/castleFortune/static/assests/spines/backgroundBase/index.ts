import { createAsset } from 'pixi-svelte';

import img from './BG.webp';
import rawAtlas from './BG/atlas?raw';
import spine from './BG.json';

export default createAsset({ img, rawAtlas, spine, preload: true }); 