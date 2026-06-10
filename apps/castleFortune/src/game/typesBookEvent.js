// Castle Fortune — Book Event Type Definitions (JSDoc)
// These are the exact shapes of events output by the Castle Fortune math-sdk
// Every event in a book must match one of these shapes
// bookEventHandlerMap.js handles each one

/**
 * Board is revealed after reels stop spinning
 * @typedef {Object} RevealEvent
 * @property {'reveal'} type
 * @property {Array<Array<{name: string, scatter?: boolean}>>} board - 5 reels x 6 rows (includes padding)
 * @property {number[]} paddingPositions - Reel strip position for each reel
 * @property {'basegame'|'freegame'|'superfreegame'|'superbonus'|'super_bonus'} gameType
 * @property {number[]} anticipation - 0 = no anticipation, 1+ = slow down reel
 */

/**
 * Running total win amount update
 * @typedef {Object} SetTotalWinEvent
 * @property {'setTotalWin'} type
 * @property {number} amount
 */

/**
 * Winning paylines to highlight
 * @typedef {Object} WinInfoEvent
 * @property {'winInfo'} type
 * @property {number} totalWin
 * @property {Array<{symbol: string, kind: number, win: number, positions: Array<{reel: number, row: number}>, meta: Object}>} wins
 */

/**
 * Scatter triggered freespins
 * @typedef {Object} FreeSpinTriggerEvent
 * @property {'freeSpinTrigger'} type
 * @property {number} totalFs - Total freespins awarded
 * @property {'freegame'|'superfreegame'|'superbonus'|'super_bonus'} [gameType] - Bonus mode to enter
 * @property {Array<{reel: number, row: number}>} positions - Scatter positions
 */

/**
 * Scatters landed during freespins — adds more spins
 * @typedef {Object} FreeSpinRetriggerEvent
 * @property {'freeSpinRetrigger'} type
 * @property {number} totalFs - New total after retrigger
 * @property {Array<{reel: number, row: number}>} positions - Scatter positions
 */

/**
 * Current freespin count update
 * @typedef {Object} UpdateFreeSpinEvent
 * @property {'updateFreeSpin'} type
 * @property {number} amount - Current spin number (0-indexed)
 * @property {number} total  - Total spins in this round
 */

/**
 * Freespins round ended
 * @typedef {Object} FreeSpinEndEvent
 * @property {'freeSpinEnd'} type
 * @property {number} amount   - Total win from freespins
 * @property {number} winLevel - Win level 1-10
 */

/**
 * Win celebration (big win, super win etc)
 * @typedef {Object} SetWinEvent
 * @property {'setWin'} type
 * @property {number} amount
 * @property {number} winLevel - Win level 1-10
 */

/**
 * Wild block formed on the board
 * grewFrom shows the growth sequence:
 *   [2]       = just a 2x2 block
 *   [2, 3]    = 2x2 grew to 3x3
 *   [2, 3, 4] = 2x2 grew to 3x3 grew to 4x4
 * @typedef {Object} WildBlockEvent
 * @property {'wildBlock'} type
 * @property {number} reel       - Top-left reel of block
 * @property {number} row        - Top-left row of block
 * @property {number[]} grewFrom - Growth sequence
 * @property {number} finalSize  - Final size (2, 3, or 4)
 * @property {number[][]} positions - All [reel, row] positions in block
 * @property {number} multiplier - Multiplier for this block
 */

/**
 * Total multiplier applied to this spin's win
 * Only emitted when totalMultiplier > 1
 * @typedef {Object} WildMultiplierEvent
 * @property {'wildMultiplier'} type
 * @property {number} totalMultiplier
 */

/**
 * Player hit the maximum win cap
 * @typedef {Object} WincapEvent
 * @property {'wincap'} type
 * @property {number} amount - The capped win amount
 */

/**
 * Round is fully complete — balance has been updated
 * @typedef {Object} FinalWinEvent
 * @property {'finalWin'} type
 * @property {number} amount
 */

/**
 * Union of all possible book events
 * @typedef {
 *   RevealEvent |
 *   SetTotalWinEvent |
 *   WinInfoEvent |
 *   FreeSpinTriggerEvent |
 *   FreeSpinRetriggerEvent |
 *   UpdateFreeSpinEvent |
 *   FreeSpinEndEvent |
 *   SetWinEvent |
 *   WildBlockEvent |
 *   WildMultiplierEvent |
 *   WincapEvent |
 *   FinalWinEvent
 * } BookEvent
 */

export {};
