// Castle Fortune — Constants
// Symbol display map, board dimensions, spin physics

// ── Board dimensions ──────────────────────────────────────────────────────────
// Each reel has 4 visible rows + 1 padding top + 1 padding bottom = 6 total
export const NUM_REELS       = 5;
export const NUM_VISIBLE_ROWS = 4;
export const NUM_TOTAL_ROWS  = 6; // includes padding rows

export const SYMBOL_SIZE = 120; // px — size of each symbol cell
export const REEL_PADDING = 0.53; // overlap between symbols during spin

// ── Board pixel sizes ─────────────────────────────────────────────────────────
export const BOARD_WIDTH  = SYMBOL_SIZE * NUM_REELS;
export const BOARD_HEIGHT = SYMBOL_SIZE * NUM_VISIBLE_ROWS;

// ── Initial board state ───────────────────────────────────────────────────────
// 5 reels x 6 rows (4 visible + 1 padding top + 1 padding bottom)
// Row 0 and row 5 are padding — never visible to the player
export const INITIAL_BOARD = [
  [{ name: 'L1' }, { name: 'H2' }, { name: 'L3' }, { name: 'H4' }, { name: 'L5' }, { name: 'L2' }],
  [{ name: 'H1' }, { name: 'L4' }, { name: 'H3' }, { name: 'L2' }, { name: 'H2' }, { name: 'L1' }],
  [{ name: 'L3' }, { name: 'H1' }, { name: 'L5' }, { name: 'H3' }, { name: 'L4' }, { name: 'H4' }],
  [{ name: 'H4' }, { name: 'L2' }, { name: 'H2' }, { name: 'L1' }, { name: 'H3' }, { name: 'L3' }],
  [{ name: 'L2' }, { name: 'H3' }, { name: 'L1' }, { name: 'H1' }, { name: 'L3' }, { name: 'H2' }],
];

// ── High symbols list ─────────────────────────────────────────────────────────
export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4'];
export const LOW_SYMBOLS  = ['L1', 'L2', 'L3', 'L4', 'L5'];

// ── Scatter sound index ───────────────────────────────────────────────────────
// Maps scatter land count to which landing sound to play
export const SCATTER_LAND_SOUND_MAP = {
  1: 'sfx_scatter_land_1',
  2: 'sfx_scatter_land_2',
  3: 'sfx_scatter_land_3',
  4: 'sfx_scatter_land_4',
  5: 'sfx_scatter_land_5',
};

// ── Spin physics ──────────────────────────────────────────────────────────────
const SPIN_SHARED = {
  reelBounceBackSpeed:              0.15,
  reelSpinSpeedBeforeBounce:        4,
  reelPaddingMultiplierNormal:      1.2,
  reelPaddingMultiplierAnticipated: 10,
  reelSpinDelay:                    145, // ms between each reel starting
};

export const SPIN_OPTIONS_DEFAULT = {
  ...SPIN_SHARED,
  reelPreSpinSpeed:   2,
  reelSpinSpeed:      3,
  reelBounceSizeMulti: 0.3,
};

export const SPIN_OPTIONS_FAST = {
  ...SPIN_SHARED,
  reelPreSpinSpeed:   5,
  reelSpinSpeed:      5,
  reelBounceSizeMulti: 0.05,
};

export const MOTION_BLUR_VELOCITY = 31;
const SYMBOL_FIT_RATIO = 1.08;
const LOW_SYMBOL_FIT_RATIO = 2.5;
const HIGH_SYMBOL_FIT_RATIO_MAP = {
  H1: 1.5,
  H2: 1,
  H3: 1.8,
  H4: 1.4,
};
const HIGH_SYMBOL_LAND_ANIMATION_MAP = {
  H1: 'animation',
  H2: 'fall',
  H3: 'animation',
  H4: 'animation',
};

// ── Symbol display map ────────────────────────────────────────────────────────
// Defines how each symbol looks in each state
// type: 'spine' uses spine animation, 'sprite' uses a static image
//
// States:
//   static      — symbol sitting still on the board
//   spin        — symbol during reel spin (usually same as static)
//   land        — animation that plays when the reel stops
//   win         — animation that plays when this symbol is part of a win
//   postWinStatic — what to show after win animation finishes

// High symbols — each has their own spine file
const makeHighSymbol = (key) => {
  const fitRatio = HIGH_SYMBOL_FIT_RATIO_MAP[key] ?? SYMBOL_FIT_RATIO;
  const landAnimationName = HIGH_SYMBOL_LAND_ANIMATION_MAP[key] ?? 'land';

  return {
    static:        { type: 'spine', assetKey: key, animationName: undefined, sizeRatios: { width: fitRatio, height: fitRatio } },
    spin:          { type: 'spine', assetKey: key, animationName: undefined, sizeRatios: { width: fitRatio, height: fitRatio } },
    land:          { type: 'spine', assetKey: key, animationName: landAnimationName, sizeRatios: { width: fitRatio, height: fitRatio } },
    win:           { type: 'spine', assetKey: key, animationName: 'hit',     sizeRatios: { width: fitRatio, height: fitRatio } },
    postWinStatic: { type: 'spine', assetKey: key, animationName: undefined, sizeRatios: { width: fitRatio, height: fitRatio } },
  };
};

// Low symbols — all share one atlas, use skin switching for different letters
const makeLowSymbol = (key) => ({
  static:        { type: 'spine', assetKey: 'LowSymbols', skinName: key, animationName: undefined, sizeRatios: { width: LOW_SYMBOL_FIT_RATIO, height: LOW_SYMBOL_FIT_RATIO } },
  spin:          { type: 'spine', assetKey: 'LowSymbols', skinName: key, animationName: undefined, sizeRatios: { width: LOW_SYMBOL_FIT_RATIO, height: LOW_SYMBOL_FIT_RATIO } },
  land:          { type: 'spine', assetKey: 'LowSymbols', skinName: key, animationName: 'fall',     sizeRatios: { width: LOW_SYMBOL_FIT_RATIO, height: LOW_SYMBOL_FIT_RATIO } },
  win:           { type: 'spine', assetKey: 'LowSymbols', skinName: key, animationName: 'hit',      sizeRatios: { width: LOW_SYMBOL_FIT_RATIO, height: LOW_SYMBOL_FIT_RATIO } },
  postWinStatic: { type: 'spine', assetKey: 'LowSymbols', skinName: key, animationName: undefined, sizeRatios: { width: LOW_SYMBOL_FIT_RATIO, height: LOW_SYMBOL_FIT_RATIO } },
});

export const SYMBOL_INFO_MAP = {
  // ── High symbols (individual spine files) ───────────────────────────────
  H1: makeHighSymbol('H1'),
  H2: makeHighSymbol('H2'),
  H3: makeHighSymbol('H3'),
  H4: makeHighSymbol('H4'),

  // ── Low symbols (shared spine atlas, skin switching) ────────────────────
  L1: makeLowSymbol('L1'),
  L2: makeLowSymbol('L2'),
  L3: makeLowSymbol('L3'),
  L4: makeLowSymbol('L4'),
  L5: makeLowSymbol('L5'),

  // ── Wild symbol ─────────────────────────────────────────────────────────
  W: {
    static:        { type: 'spine', assetKey: 'Wild', animationName: 'static',      sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    spin:          { type: 'spine', assetKey: 'Wild', animationName: 'static',      sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    land:          { type: 'spine', assetKey: 'Wild', animationName: 'land',        sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    win:           { type: 'spine', assetKey: 'Wild', animationName: 'win',         sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    postWinStatic: { type: 'spine', assetKey: 'Wild', animationName: 'post_win',    sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
  },

  // ── Scatter symbol ───────────────────────────────────────────────────────
  S: {
    static:        { type: 'spine', assetKey: 'Scatter', animationName: 'static',      sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    spin:          { type: 'spine', assetKey: 'Scatter', animationName: 'spin',        sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    land:          { type: 'spine', assetKey: 'Scatter', animationName: 'land',        sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    win:           { type: 'spine', assetKey: 'Scatter', animationName: 'win',         sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
    postWinStatic: { type: 'spine', assetKey: 'Scatter', animationName: 'static',      sizeRatios: { width: SYMBOL_FIT_RATIO, height: SYMBOL_FIT_RATIO } },
  },
};

// ── Z-index layers ────────────────────────────────────────────────────────────
export const Z_INDEX = {
  background:   0,
  board:        10,
  symbols:      20,
  winLines:     30,
  wildBlocks:   40,
  ui:           50,
  transitions:  60,
  bigWin:       70,
};
