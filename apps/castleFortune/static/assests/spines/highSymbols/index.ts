import { createAsset } from 'pixi-svelte';

import H1img   from './H1.webp';
import H1atlas from './H1.atlas?raw';
import H1json  from './H1.json';

import H2img   from './H2.webp';
import H2atlas from './H2.atlas?raw';
import H2json  from './H2.json';

import H3img   from './H3.webp';
import H3atlas from './H3.atlas?raw';
import H3json  from './H3.json';

import H4img   from './H4.webp';
import H4atlas from './H4.atlas?raw';
import H4json  from './H4.json';

export const H1 = createAsset({ img: H1img, rawAtlas: H1atlas, spines: { H1: H1json } });
export const H2 = createAsset({ img: H2img, rawAtlas: H2atlas, spines: { H2: H2json } });
export const H3 = createAsset({ img: H3img, rawAtlas: H3atlas, spines: { H3: H3json } });
export const H4 = createAsset({ img: H4img, rawAtlas: H4atlas, spines: { H4: H4json } });