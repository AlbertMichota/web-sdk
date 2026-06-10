import { createAsset } from 'pixi-svelte';

import lettersImg from './plainCfFontWhite.webp';
import lettersFont from './plainCfFont.json';

import numbersImg from './numberplainCfFontWhite.webp';
import numbersFont from './plainCfNumbers.json';

export const whiteFontLetters = createAsset({
  img: lettersImg,
  font: lettersFont,
});

export const whiteFontNumbers = createAsset({
  img: numbersImg,
  font: numbersFont,
});
