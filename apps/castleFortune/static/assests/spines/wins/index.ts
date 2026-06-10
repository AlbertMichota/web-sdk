import { createAsset } from 'pixi-svelte';

import img from './win.webp';
import rawAtlas from './win.atlas?raw';
import spine from './win.json';

export default createAsset({ img, rawAtlas, spine });