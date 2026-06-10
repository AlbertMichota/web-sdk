// apps/my-slot/src/game/config.ts

export const GAME_ID = 'LemonLabs_1_96';
export const PROVIDER_NAME = 'Lemon_Labs';
export const WORKING_NAME = 'Castle Fortune';

// Grid
export const NUM_REELS = 5;
export const NUM_ROWS = 4; // your game is 5x4, not 5x3 like the lines example

// Symbols - must match exactly what your math-sdk outputs
export const SYMBOLS = ['W', 'S', 'H1', 'H2', 'H3', 'H4', 'L1', 'L2', 'L3', 'L4', 'L5'];
export const WILD_SYMBOL = 'W';
export const SCATTER_SYMBOL = 'S';

// Paytable - copied directly from your python config
export const PAYTABLE: Record<string, Record<number, number>> = {
  W:  { 5: 25,  4: 10,  3: 5 },
  H1: { 5: 25,  4: 10,  3: 5 },
  H2: { 5: 10,  4: 4,   3: 2 },
  H3: { 5: 7,   4: 2,   3: 1 },
  H4: { 5: 5,   4: 1.5, 3: 0.5 },
  L1: { 5: 3,   4: 0.7, 3: 0.3 },
  L2: { 5: 2,   4: 0.5, 3: 0.2 },
  L3: { 5: 2,   4: 0.5, 3: 0.2 },
  L4: { 5: 1,   4: 0.3, 3: 0.1 },
  L5: { 5: 0.5, 4: 0.2, 3: 0.05 },
};

// Paylines - copied from your python config
export const PAYLINES: Record<number, number[]> = {
  1:  [0, 0, 0, 0, 0],
  2:  [1, 1, 1, 1, 1],
  3:  [2, 2, 2, 2, 2],
  4:  [3, 3, 3, 3, 3],
  5:  [0, 1, 2, 1, 0],
  6:  [1, 2, 3, 2, 1],
  7:  [3, 2, 1, 2, 3],
  8:  [2, 1, 0, 1, 2],
  9:  [0, 1, 2, 3, 3],
  10: [0, 0, 1, 2, 3],
  11: [3, 2, 1, 0, 0],
  12: [3, 3, 2, 1, 0],
  13: [0, 1, 1, 1, 2],
  14: [2, 1, 1, 1, 0],
  15: [1, 2, 2, 2, 1],
  16: [2, 3, 3, 3, 2],
  17: [1, 0, 0, 0, 1],
  18: [2, 3, 2, 3, 2],
  19: [1, 0, 1, 0, 1],
  20: [0, 2, 0, 2, 0],
  21: [3, 1, 3, 1, 3],
  22: [0, 3, 1, 3, 0],
  23: [3, 0, 2, 0, 3],
  24: [1, 2, 3, 2, 3],
  25: [2, 1, 0, 1, 0],
};

// Freespin triggers - how many scatters trigger how many spins
export const FREESPIN_TRIGGERS: Record<string, Record<number, number>> = {
  basegame: { 3: 10, 4: 15, 5: 20 },
  freegame: { 2: 3,  3: 5,  4: 10, 5: 15 },
};

// Win cap
export const WIN_CAP = 10000.0;

// Wild multiplier base value
export const WILD_MULTIPLIER = 2;

// Bet modes
export const BET_MODES = {
  base:  { cost: 1.0,   buyBonus: false },
  bonus: { cost: 100.0, buyBonus: true  },
};