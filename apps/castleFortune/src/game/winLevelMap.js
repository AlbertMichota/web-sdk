// Castle Fortune — Win Level Map
// Maps win levels to display data including spine skin names
// Skins available in WinAnimations spine: Nice, Big, Huge, Insane

const SECOND = 1000;

export const WIN_LEVEL_MAP = {
  1: {
    level:           1,
    alias:           'zero',
    type:            'small',
    text:            null,
    skin:            null,
    presentDuration: 0,
    sound:           { sfx: null, bgm: null },
  },
  2: {
    level:           2,
    alias:           'standard',
    type:            'small',
    text:            null,
    skin:            null,
    presentDuration: 0.6 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  3: {
    level:           3,
    alias:           'small',
    type:            'small',
    text:            null,
    skin:            null,
    presentDuration: 1 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  4: {
    level:           4,
    alias:           'nice',
    type:            'medium',
    text:            null,
    skin:            null,
    presentDuration: 1.5 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  5: {
    level:           5,
    alias:           'substantial',
    type:            'medium',
    text:            null,
    skin:            null,
    presentDuration: 2 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  6: {
    level:           6,
    alias:           'nice_win',
    type:            'big',
    text:            'NICE WIN',
    skin:            'Nice',
    presentDuration: 4 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  7: {
    level:           7,
    alias:           'big_win',
    type:            'big',
    text:            'BIG WIN',
    skin:            'Big',
    presentDuration: 6 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  8: {
    level:           8,
    alias:           'huge_win',
    type:            'big',
    text:            'HUGE WIN',
    skin:            'Huge',
    presentDuration: 8 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  9: {
    level:           9,
    alias:           'insane_win',
    type:            'big',
    text:            'INSANE WIN',
    skin:            'Insane',
    presentDuration: 10 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
  10: {
    level:           10,
    alias:           'max',
    type:            'big',
    text:            'INSANE WIN',
    skin:            'Insane',
    presentDuration: 12 * SECOND,
    sound:           { sfx: null, bgm: null },
  },
};

export function getWinLevelData(level) {
  return WIN_LEVEL_MAP[level] ?? WIN_LEVEL_MAP[1];
}