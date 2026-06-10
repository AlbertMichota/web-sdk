import { createAsset } from 'pixi-svelte';

import lettersImg from './gold_font.webp';
import lettersFont from './gold_font.json?raw';

import numbersImg from './gold_font_num.webp';
import numbersFont from './gold_font_num.json?raw';

export const GoldFontLetters = createAsset({
  img: lettersImg,
  font: lettersFont,
});

export const GoldFontNumbers = createAsset({
  img: numbersImg,
  font: numbersFont,
});