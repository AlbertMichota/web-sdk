import { createAsset } from 'pixi-svelte';

import lettersImg from './red_font.webp';
import lettersFont from './red_font.json?raw';

import numbersImg from './red_numbers.webp';
import numbersFont from './red_numbers.json';

export const redFontLetters = createAsset({
  img: lettersImg,
  font: lettersFont,
});

export const redFontNumbers = createAsset({
  img: numbersImg,
  font: numbersFont,
});