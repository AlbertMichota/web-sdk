// apps/my-slot/src/game/typesBookEvent.ts

type BookEventReveal = {
    index: number;
    type: 'reveal';
    board: { name: string; scatter?: boolean }[][];
    paddingPositions: number[];
    gameType: 'basegame' | 'freegame';
    anticipation: number[];
};

type BookEventSetTotalWin = {
    index: number;
    type: 'setTotalWin';
    amount: number;
};

type BookEventWinInfo = {
    index: number;
    type: 'winInfo';
    totalWin: number;
    wins: {
        symbol: string;
        kind: number;
        win: number;
        positions: { reel: number; row: number }[];
        meta: {
            lineIndex: number;
            multiplier: number;
            winWithoutMult: number;
            globalMult: number;
            lineMultiplier: number;
        };
    }[];
};

type BookEventFreeSpinTrigger = {
    index: number;
    type: 'freeSpinTrigger';
    totalFs: number;
    positions: { reel: number; row: number }[];
};

// Your unique event — scatters during freespins add more spins
type BookEventFreeSpinRetrigger = {
    index: number;
    type: 'freeSpinRetrigger';
    totalFs: number;
    positions: { reel: number; row: number }[];
};

type BookEventUpdateFreeSpin = {
    index: number;
    type: 'updateFreeSpin';
    amount: number;
    total: number;
};

type BookEventFreeSpinEnd = {
    index: number;
    type: 'freeSpinEnd';
    amount: number;
    winLevel: number;
};

type BookEventSetWin = {
    index: number;
    type: 'setWin';
    amount: number;
    winLevel: number;
};

// Your unique event — wild block with growth animation
type BookEventWildBlock = {
    index: number;
    type: 'wildBlock';
    reel: number;
    row: number;
    grewFrom: number[];
    finalSize: number;
    positions: [number, number][];
    multiplier: number;
};

// Your unique event — total multiplier for the spin
type BookEventWildMultiplier = {
    index: number;
    type: 'wildMultiplier';
    totalMultiplier: number;
};

// Your unique event — player hit the win cap
type BookEventWincap = {
    index: number;
    type: 'wincap';
    amount: number;
};

type BookEventFinalWin = {
    index: number;
    type: 'finalWin';
    amount: number;
};

export type BookEvent =
    | BookEventReveal
    | BookEventSetTotalWin
    | BookEventWinInfo
    | BookEventFreeSpinTrigger
    | BookEventFreeSpinRetrigger
    | BookEventUpdateFreeSpin
    | BookEventFreeSpinEnd
    | BookEventSetWin
    | BookEventWildBlock
    | BookEventWildMultiplier
    | BookEventWincap
    | BookEventFinalWin;

export type BookEventOfType<T> = Extract<BookEvent, { type: T }>;
export type BookEventContext = { bookEvents: BookEvent[] };