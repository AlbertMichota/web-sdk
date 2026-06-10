// stories/data/base_books.js
// Test books for Castle Fortune base game scenarios
// Each book is an array of events exactly as the math-sdk outputs them
// Used by storybook stories to simulate game outcomes without a real backend

// ── Shared board helpers ───────────────────────────────────────────────────

// A simple 5x4 board (6 rows including padding) with no wins
const BLANK_BOARD = [
  [{ name: 'L1' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'H3' }, { name: 'L4' }, { name: 'H4' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }],
  [{ name: 'L2' }, { name: 'L5' }, { name: 'L3' }, { name: 'H2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'L4' }, { name: 'H4' }, { name: 'L2' }, { name: 'L5' }, { name: 'L3' }, { name: 'H3' }],
  [{ name: 'L5' }, { name: 'L2' }, { name: 'H3' }, { name: 'L4' }, { name: 'L1' }, { name: 'L5' }],
];

// A board with H1 across all 5 reels on row 1 (payline 2) — big win
const H1_FIVE_OF_A_KIND_BOARD = [
  [{ name: 'L3' }, { name: 'H1' }, { name: 'L5' }, { name: 'L2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'L4' }, { name: 'H1' }, { name: 'H4' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }],
  [{ name: 'L2' }, { name: 'H1' }, { name: 'L3' }, { name: 'H2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'L1' }, { name: 'H1' }, { name: 'L2' }, { name: 'L5' }, { name: 'L3' }, { name: 'H3' }],
  [{ name: 'L5' }, { name: 'H1' }, { name: 'H3' }, { name: 'L4' }, { name: 'L1' }, { name: 'L5' }],
];

// A board with 3 scatters landing to trigger freespins
const SCATTER_TRIGGER_BOARD = [
  [{ name: 'L1' }, { name: 'L3' }, { name: 'S', scatter: true }, { name: 'L2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'H3' }, { name: 'L4' }, { name: 'H4' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }],
  [{ name: 'L2' }, { name: 'L5' }, { name: 'S', scatter: true }, { name: 'H2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'L4' }, { name: 'H4' }, { name: 'L2' }, { name: 'L5' }, { name: 'S', scatter: true }, { name: 'H3' }],
  [{ name: 'L5' }, { name: 'L2' }, { name: 'H3' }, { name: 'L4' }, { name: 'L1' }, { name: 'L5' }],
];

// A board with a 2x2 wild block on reels 3-4, rows 1-2
const WILD_BLOCK_2X2_BOARD = [
  [{ name: 'L1' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'H3' }, { name: 'L4' }, { name: 'H4' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }],
  [{ name: 'L2' }, { name: 'L5' }, { name: 'L3' }, { name: 'H2' }, { name: 'L4' }, { name: 'L1' }],
  [{ name: 'L4' }, { name: 'W' },  { name: 'W' },  { name: 'L5' }, { name: 'L3' }, { name: 'H3' }],
  [{ name: 'L5' }, { name: 'W' },  { name: 'W' },  { name: 'L4' }, { name: 'L1' }, { name: 'L5' }],
];

// Wincap board
const WINCAP_BOARD = [
  [{ name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }],
  [{ name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }],
  [{ name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }],
  [{ name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }],
  [{ name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }, { name: 'H1' }],
];

// ── Test books ────────────────────────────────────────────────────────────

/**
 * Zero win — reels spin and nothing happens
 */
export const BOOK_BASE_ZERO_WIN = [
  {
    type:             'reveal',
    board:            BLANK_BOARD,
    paddingPositions: [0, 0, 0, 0, 0],
    gameType:         'basegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:   'setTotalWin',
    amount: 0,
  },
  {
    type:   'finalWin',
    amount: 0,
  },
];

/**
 * Small win — a few paylines hit
 */
export const BOOK_BASE_SMALL_WIN = [
  {
    type:             'reveal',
    board:            BLANK_BOARD,
    paddingPositions: [10, 20, 30, 40, 50],
    gameType:         'basegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:     'winInfo',
    totalWin: 2.5,
    wins: [
      {
        symbol:    'L3',
        kind:      3,
        win:       1.5,
        positions: [{ reel: 0, row: 1 }, { reel: 1, row: 1 }, { reel: 2, row: 1 }],
        meta:      { lineIndex: 2, multiplier: 1, winWithoutMult: 1.5, globalMult: 1, lineMultiplier: 1 },
      },
      {
        symbol:    'L4',
        kind:      3,
        win:       1.0,
        positions: [{ reel: 0, row: 2 }, { reel: 1, row: 2 }, { reel: 2, row: 2 }],
        meta:      { lineIndex: 3, multiplier: 1, winWithoutMult: 1.0, globalMult: 1, lineMultiplier: 1 },
      },
    ],
  },
  {
    type:   'setTotalWin',
    amount: 2.5,
  },
  {
    type:     'setWin',
    amount:   2.5,
    winLevel: 3,
  },
  {
    type:   'finalWin',
    amount: 2.5,
  },
];

/**
 * Big win — H1 five of a kind
 */
export const BOOK_BASE_BIG_WIN = [
  {
    type:             'reveal',
    board:            H1_FIVE_OF_A_KIND_BOARD,
    paddingPositions: [5, 15, 25, 35, 45],
    gameType:         'basegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:     'winInfo',
    totalWin: 25,
    wins: [
      {
        symbol:    'H1',
        kind:      5,
        win:       25,
        positions: [
          { reel: 0, row: 1 },
          { reel: 1, row: 1 },
          { reel: 2, row: 1 },
          { reel: 3, row: 1 },
          { reel: 4, row: 1 },
        ],
        meta: { lineIndex: 2, multiplier: 1, winWithoutMult: 25, globalMult: 1, lineMultiplier: 1 },
      },
    ],
  },
  {
    type:   'setTotalWin',
    amount: 25,
  },
  {
    type:     'setWin',
    amount:   25,
    winLevel: 6,
  },
  {
    type:   'finalWin',
    amount: 25,
  },
];

/**
 * Wild block 2x2 — forms on reels 3-4
 */
export const BOOK_BASE_WILD_BLOCK_2X2 = [
  {
    type:             'reveal',
    board:            WILD_BLOCK_2X2_BOARD,
    paddingPositions: [0, 0, 0, 0, 0],
    gameType:         'basegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:       'wildBlock',
    reel:       3,
    row:        1,
    grewFrom:   [2],
    finalSize:  2,
    positions:  [[3, 1], [3, 2], [4, 1], [4, 2]],
    multiplier: 3,
  },
  {
    type:            'wildMultiplier',
    totalMultiplier: 3,
  },
  {
    type:     'winInfo',
    totalWin: 9,
    wins: [
      {
        symbol:    'L3',
        kind:      3,
        win:       3,
        positions: [{ reel: 0, row: 1 }, { reel: 1, row: 1 }, { reel: 2, row: 1 }],
        meta:      { lineIndex: 2, multiplier: 3, winWithoutMult: 1, globalMult: 1, lineMultiplier: 3 },
      },
    ],
  },
  {
    type:   'setTotalWin',
    amount: 9,
  },
  {
    type:     'setWin',
    amount:   9,
    winLevel: 4,
  },
  {
    type:   'finalWin',
    amount: 9,
  },
];

/**
 * Wild block growing 2x2 → 3x3
 */
export const BOOK_BASE_WILD_BLOCK_3X3 = [
  {
    type:             'reveal',
    board:            BLANK_BOARD,
    paddingPositions: [0, 0, 0, 0, 0],
    gameType:         'basegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:       'wildBlock',
    reel:       1,
    row:        1,
    grewFrom:   [2, 3],
    finalSize:  3,
    positions:  [[1,1],[1,2],[1,3],[2,1],[2,2],[2,3],[3,1],[3,2],[3,3]],
    multiplier: 7,
  },
  {
    type:            'wildMultiplier',
    totalMultiplier: 7,
  },
  {
    type:   'setTotalWin',
    amount: 14,
  },
  {
    type:     'setWin',
    amount:   14,
    winLevel: 5,
  },
  {
    type:   'finalWin',
    amount: 14,
  },
];

/**
 * Freespin trigger — 3 scatters land
 */
export const BOOK_BASE_FREESPIN_TRIGGER = [
  {
    type:             'reveal',
    board:            SCATTER_TRIGGER_BOARD,
    paddingPositions: [0, 0, 0, 0, 0],
    gameType:         'basegame',
    anticipation:     [0, 0, 1, 2, 0],
  },
  {
    type:      'setTotalWin',
    amount:    0,
  },
  {
    type:      'freeSpinTrigger',
    totalFs:   10,
    positions: [
      { reel: 0, row: 2 },
      { reel: 2, row: 2 },
      { reel: 3, row: 4 },
    ],
  },
];

/**
 * Wincap — maximum win hit
 */
export const BOOK_BASE_WINCAP = [
  {
    type:             'reveal',
    board:            WINCAP_BOARD,
    paddingPositions: [0, 0, 0, 0, 0],
    gameType:         'basegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:   'wincap',
    amount: 10000,
  },
  {
    type:   'setTotalWin',
    amount: 10000,
  },
  {
    type:   'finalWin',
    amount: 10000,
  },
];

// ── Named export map — used by storybook stories ───────────────────────────
export const BASE_BOOKS = {
  'zero_win':          BOOK_BASE_ZERO_WIN,
  'small_win':         BOOK_BASE_SMALL_WIN,
  'big_win':           BOOK_BASE_BIG_WIN,
  'wild_block_2x2':    BOOK_BASE_WILD_BLOCK_2X2,
  'wild_block_3x3':    BOOK_BASE_WILD_BLOCK_3X3,
  'freespin_trigger':  BOOK_BASE_FREESPIN_TRIGGER,
  'wincap':            BOOK_BASE_WINCAP,
};
