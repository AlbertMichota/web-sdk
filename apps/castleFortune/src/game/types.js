// Castle Fortune — Shared Type Definitions (JSDoc)
// Using JSDoc for type safety without TypeScript compilation

/**
 * @typedef {'basegame' | 'freegame' | 'superfreegame' | 'superbonus' | 'super_bonus'} GameType
 */

/**
 * A raw symbol on the board as received from the math-sdk
 * @typedef {Object} RawSymbol
 * @property {string}  name      - Symbol name e.g. 'H1', 'L3', 'W', 'S'
 * @property {boolean} [scatter] - True if this symbol is a scatter
 * @property {boolean} [wild]    - True if this symbol is a wild
 */

/**
 * A position on the board
 * @typedef {Object} Position
 * @property {number} reel - 0-indexed reel (column)
 * @property {number} row  - 0-indexed row
 */

/**
 * A winning line from the math-sdk
 * @typedef {Object} WinLine
 * @property {string}     symbol    - Winning symbol name
 * @property {number}     kind      - How many matched (3, 4, or 5)
 * @property {number}     win       - Win amount
 * @property {Position[]} positions - Board positions of the win
 * @property {Object}     meta      - Extra data (lineIndex, multiplier etc)
 */

/**
 * A wild block detected by the math-sdk
 * @typedef {Object} WildBlock
 * @property {number}     reel      - Top-left reel of the block
 * @property {number}     row       - Top-left row of the block
 * @property {number[]}   grewFrom  - Growth sequence e.g. [2] or [2,3] or [2,3,4]
 * @property {number}     finalSize - Final block size (2, 3, or 4)
 * @property {number[][]} positions - All [reel, row] positions in the block
 * @property {number}     multiplier - Multiplier rolled for this block
 */

/**
 * Symbol animation state
 * @typedef {'static' | 'spin' | 'land' | 'win' | 'postWinStatic'} SymbolState
 */

/**
 * Win level data for big win celebrations
 * @typedef {Object} WinLevelData
 * @property {number}      level           - Level number 1-10
 * @property {string}      alias           - e.g. 'big', 'mega', 'max'
 * @property {string}      type            - 'small' | 'medium' | 'big'
 * @property {string|null} text            - Display text e.g. 'BIG WIN'
 * @property {number}      presentDuration - How long to show in ms
 * @property {Object}      sound           - { sfx, bgm } sound aliases
 * @property {Object|null} animation       - { intro, idle, outro } spine animation names
 */

export {};
