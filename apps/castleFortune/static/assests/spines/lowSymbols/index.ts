import { createAsset } from 'pixi-svelte';

import img from '.lowSymbols.webp';
import rawAtlas from './lowSymbols.atlas?raw';
import L1 from './L1.json';
import L2 from './L2.json';
import L3 from './L3.json';
import L4 from './L4.json';
import L5 from './L5.json';

export default createAsset({
	img,
	rawAtlas,
	spines: {
		L1,
		L2,
		L3,
		L4,
    L5,
	},
});