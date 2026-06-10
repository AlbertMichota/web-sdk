import { createAsset } from 'pixi-svelte';

import lettersImg from './blue_font.webp';
import lettersFont from './blue_font.json?raw';

import numbersImg from './blue_numbers.webp';
import numbersFont from './blue_numbers.json';

export const blueFontLetters = createAsset({
  img: lettersImg,
  font: lettersFont,
});

export const blueFontNumbers = createAsset({
  img: numbersImg,
  font: numbersFont,
});