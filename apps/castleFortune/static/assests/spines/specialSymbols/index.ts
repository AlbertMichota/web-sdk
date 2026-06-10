import { creatAsset } from 'pixi-svelte';

import Wimg from './W.webp';
import WAtlas from 'W.atlas?raw';
import WJson from 'W.json';

import FSimg from './S.webp';
import FSAtlas from './S.atlas';
import FSJson from 'S.json';

export const W = createAsset({ img: Wimg, rawAtlas: WAtlas, spines: { W: WJson } });
export const FS = createAsset({ img: FSimg, rawAtlas: FSAtlas, spines: { FS: FSJson } });
