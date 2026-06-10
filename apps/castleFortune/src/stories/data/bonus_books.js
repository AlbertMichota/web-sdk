// stories/data/bonus_books.js
// Test books for Castle Fortune freespin (bonus) game scenarios
// These simulate what happens DURING freespins — after the trigger

// ── Shared boards ──────────────────────────────────────────────────────────

const FREEGAME_BOARD_WIN = [
  [{ name: 'L2' }, { name: 'H2' }, { name: 'L4' }, { name: 'L1' }, { name: 'L3' }, { name: 'L5' }],
  [{ name: 'L4' }, { name: 'H2' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }, { name: 'L4' }],
  [{ name: 'H3' }, { name: 'H2' }, { name: 'L5' }, { name: 'L3' }, { name: 'L4' }, { name: 'L2' }],
  [{ name: 'L5' }, { name: 'L3' }, { name: 'L2' }, { name: 'L4' }, { name: 'L1' }, { name: 'H3' }],
  [{ name: 'L1' }, { name: 'L4' }, { name: 'H3' }, { name: 'L2' }, { name: 'L5' }, { name: 'L1' }],
];

const FREEGAME_BOARD_RETRIGGER = [
  [{ name: 'L2' }, { name: 'S', scatter: true }, { name: 'L4' }, { name: 'L1' }, { name: 'L3' }, { name: 'L5' }],
  [{ name: 'L4' }, { name: 'L3' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }, { name: 'L4' }],
  [{ name: 'H3' }, { name: 'L5' }, { name: 'L5' }, { name: 'S', scatter: true }, { name: 'L4' }, { name: 'L2' }],
  [{ name: 'L5' }, { name: 'L3' }, { name: 'L2' }, { name: 'L4' }, { name: 'L1' }, { name: 'H3' }],
  [{ name: 'L1' }, { name: 'L4' }, { name: 'H3' }, { name: 'L2' }, { name: 'L5' }, { name: 'L1' }],
];

const FREEGAME_BOARD_WITH_WILDS = [
  [{ name: 'W' },  { name: 'L3' }, { name: 'W' },  { name: 'L1' }, { name: 'L3' }, { name: 'L5' }],
  [{ name: 'L4' }, { name: 'L3' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }, { name: 'L4' }],
  [{ name: 'W' },  { name: 'L5' }, { name: 'L5' }, { name: 'L3' }, { name: 'L4' }, { name: 'L2' }],
  [{ name: 'L5' }, { name: 'L3' }, { name: 'W' },  { name: 'L4' }, { name: 'L1' }, { name: 'H3' }],
  [{ name: 'L1' }, { name: 'L4' }, { name: 'H3' }, { name: 'L2' }, { name: 'L5' }, { name: 'L1' }],
];

// ── Test books ────────────────────────────────────────────────────────────

/**
 * Single freespin with a small win
 * This simulates one spin during the freespin round
 */
export const BOOK_BONUS_SINGLE_SPIN_WIN = [
  {
    type:             'reveal',
    board:            FREEGAME_BOARD_WIN,
    paddingPositions: [10, 20, 30, 40, 50],
    gameType:         'freegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:   'updateFreeSpin',
    amount: 0,
    total:  10,
  },
  {
    type:     'winInfo',
    totalWin: 8,
    wins: [
      {
        symbol:    'H2',
        kind:      3,
        win:       8,
        positions: [
          { reel: 0, row: 1 },
          { reel: 1, row: 1 },
          { reel: 2, row: 1 },
        ],
        meta: { lineIndex: 2, multiplier: 1, winWithoutMult: 8, globalMult: 1, lineMultiplier: 1 },
      },
    ],
  },
  {
    type:   'setTotalWin',
    amount: 8,
  },
];

/**
 * Freespin retrigger — 2 scatters land adding 3 more spins
 */
export const BOOK_BONUS_RETRIGGER = [
  {
    type:             'reveal',
    board:            FREEGAME_BOARD_RETRIGGER,
    paddingPositions: [5, 15, 25, 35, 45],
    gameType:         'freegame',
    anticipation:     [0, 0, 1, 2, 0],
  },
  {
    type:   'updateFreeSpin',
    amount: 4,
    total:  10,
  },
  {
    type:      'freeSpinRetrigger',
    totalFs:   13,
    positions: [
      { reel: 0, row: 1 },
      { reel: 2, row: 3 },
    ],
  },
  {
    type:   'setTotalWin',
    amount: 0,
  },
];

/**
 * Freespin with wild blocks and multiplier
 */
export const BOOK_BONUS_WILD_BLOCKS = [
  {
    type:             'reveal',
    board:            FREEGAME_BOARD_WITH_WILDS,
    paddingPositions: [0, 0, 0, 0, 0],
    gameType:         'freegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type:   'updateFreeSpin',
    amount: 2,
    total:  10,
  },
  {
    type:       'wildBlock',
    reel:       0,
    row:        1,
    grewFrom:   [2],
    finalSize:  2,
    positions:  [[0,1],[0,2],[1,1],[1,2]],
    multiplier: 4,
  },
  {
    type:            'wildMultiplier',
    totalMultiplier: 8,
  },
  {
    type:     'winInfo',
    totalWin: 32,
    wins: [
      {
        symbol:    'L2',
        kind:      4,
        win:       4,
        positions: [
          { reel: 0, row: 1 },
          { reel: 1, row: 1 },
          { reel: 2, row: 1 },
          { reel: 3, row: 1 },
        ],
        meta: { lineIndex: 2, multiplier: 8, winWithoutMult: 0.5, globalMult: 1, lineMultiplier: 8 },
      },
    ],
  },
  {
    type:   'setTotalWin',
    amount: 32,
  },
];

/**
 * Freespins end — full outro sequence
 */
export const BOOK_BONUS_END = [
  {
    type:     'freeSpinEnd',
    amount:   365,
    winLevel: 7,
  },
  {
    type:   'finalWin',
    amount: 365,
  },
];

/**
 * Complete freespin round — trigger through to end
 * This is the full sequence used for the MODE_BONUS story
 */
export const BOOK_BONUS_FULL_ROUND = [
  // Base game spin that triggers freespins
  {
    type:             'reveal',
    board: [
      [{ name: 'L1' }, { name: 'L3' }, { name: 'S', scatter: true }, { name: 'L2' }, { name: 'L4' }, { name: 'L1' }],
      [{ name: 'H3' }, { name: 'L4' }, { name: 'H4' }, { name: 'L3' }, { name: 'L5' }, { name: 'L2' }],
      [{ name: 'L2' }, { name: 'L5' }, { name: 'S', scatter: true }, { name: 'H2' }, { name: 'L4' }, { name: 'L1' }],
      [{ name: 'L4' }, { name: 'H4' }, { name: 'L2' }, { name: 'S', scatter: true }, { name: 'L3' }, { name: 'H3' }],
      [{ name: 'L5' }, { name: 'L2' }, { name: 'H3' }, { name: 'L4' }, { name: 'L1' }, { name: 'L5' }],
    ],
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
      { reel: 3, row: 3 },
    ],
  },
  // Freespin 1 — small win
  {
    type:             'reveal',
    board:            FREEGAME_BOARD_WIN,
    paddingPositions: [10, 20, 30, 40, 50],
    gameType:         'freegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  {
    type: 'updateFreeSpin', amount: 0, total: 10,
  },
  {
    type: 'winInfo', totalWin: 8,
    wins: [{
      symbol: 'H2', kind: 3, win: 8,
      positions: [{ reel: 0, row: 1 }, { reel: 1, row: 1 }, { reel: 2, row: 1 }],
      meta: { lineIndex: 2, multiplier: 1, winWithoutMult: 8, globalMult: 1, lineMultiplier: 1 },
    }],
  },
  { type: 'setTotalWin', amount: 8 },
  // Freespin 2 — wild blocks
  {
    type:             'reveal',
    board:            FREEGAME_BOARD_WITH_WILDS,
    paddingPositions: [0, 0, 0, 0, 0],
    gameType:         'freegame',
    anticipation:     [0, 0, 0, 0, 0],
  },
  { type: 'updateFreeSpin', amount: 1, total: 10 },
  {
    type: 'wildBlock', reel: 0, row: 1, grewFrom: [2], finalSize: 2,
    positions: [[0,1],[0,2],[1,1],[1,2]], multiplier: 4,
  },
  { type: 'wildMultiplier', totalMultiplier: 8 },
  {
    type: 'winInfo', totalWin: 32,
    wins: [{
      symbol: 'L2', kind: 4, win: 32,
      positions: [{ reel:0,row:1},{reel:1,row:1},{reel:2,row:1},{reel:3,row:1}],
      meta: { lineIndex: 2, multiplier: 8, winWithoutMult: 4, globalMult: 1, lineMultiplier: 8 },
    }],
  },
  { type: 'setTotalWin', amount: 40 },
  // End
  { type: 'freeSpinEnd', amount: 40, winLevel: 5 },
  { type: 'finalWin', amount: 40 },
];

// ── Named export map ───────────────────────────────────────────────────────
export const BONUS_BOOKS = {
  'single_spin_win': BOOK_BONUS_SINGLE_SPIN_WIN,
  'retrigger':       BOOK_BONUS_RETRIGGER,
  'wild_blocks':     BOOK_BONUS_WILD_BLOCKS,
  'freespin_end':    BOOK_BONUS_END,
  'full_round':      BOOK_BONUS_FULL_ROUND,
};
