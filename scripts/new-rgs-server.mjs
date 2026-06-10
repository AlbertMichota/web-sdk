#!/usr/bin/env node
// Simple mimic RGS server (no external deps)
// Endpoints
//  - POST /api/wallet/authenticate
//  - POST /api/wallet/balance
//  - POST /api/wallet/play
//  - POST /api/wallet/end-round
//  - POST /api/bet/event (noop)
//  - GET  /api/bet/replay/:game/:version/:mode/:event
//  - POST /api/game/search (force a specific book; no balance change)
//  - GET  /api/health
// Reads books from ../apicheck/*.json or *.jsonl

import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT || process.argv[2] || 8800);
const API_PREFIX = '/api';
const START_BALANCE = 2_000_000; // $2 in 6dp minor units

// Utility: CORS headers for browser requests
function writeCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readJsonBody(req) {
  return new Promise((resolveBody) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolveBody(data ? JSON.parse(data) : {});
      } catch {
        resolveBody({});
      }
    });
  });
}

// Book loader
const apicheckDir = resolve(__dirname, '..', 'apicheck');

function readJsonFile(path) {
  try {
    const raw = readFileSync(path, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function readJsonlFile(path) {
  try {
    const raw = readFileSync(path, 'utf8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    return lines.map((l) => JSON.parse(l));
  } catch (e) {
    return null;
  }
}

function findFirstExisting(paths) {
  for (const p of paths) if (existsSync(p)) return p;
  return null;
}

function loadBooksForMode(mode) {
  const key = String(mode || 'BASE').toLowerCase();
  const nameMap = {
    base: ['books_base.jsonl', 'books_base.json'],
    bonus: ['books_bonus.jsonl', 'books_bonus.json'],
    respin: ['respin.jsonl', 'respin.json'],
    // Map extra_chance to bonus_hunt dataset per request
    'extra_chance': ['books_bonus_hunt.jsonl', 'books_bonus_hunt.json'],
    'bonus_hunt': ['books_bonus_hunt.jsonl', 'books_bonus_hunt.json'],
    // Map bonus_4 to dead_carnival dataset per request
    'bonus_4': ['books_dead_carnival.jsonl', 'books_dead_carnival.json'],
    'dead_carnival': ['books_dead_carnival.jsonl', 'books_dead_carnival.json'],
    'rising_dead': ['books_rising_dead.jsonl', 'books_rising_dead.json'],
  };

  const candidates = nameMap[key] || nameMap['base'];
  const searchRoots = [apicheckDir, join(apicheckDir, 'Nieuwe map'), join(apicheckDir, 'old')];

  for (const root of searchRoots) {
    for (const file of candidates) {
      const full = join(root, file);
      if (existsSync(full)) {
        const data = file.endsWith('.jsonl') ? readJsonlFile(full) : readJsonFile(full);
        if (Array.isArray(data) && data.length) return data;
      }
    }
  }
  // Fallback: try any books_*.json in apicheck root
  try {
    const any = readdirSync(apicheckDir).filter((f) => f.startsWith('books_') && f.endsWith('.json'));
    for (const f of any) {
      const data = readJsonFile(join(apicheckDir, f));
      if (Array.isArray(data) && data.length) return data;
    }
  } catch {}
  return [];
}

function getCostMultiplier(mode, book) {
  const key = String(mode || 'BASE').toLowerCase();
  // Only extra_chance is allowed to take betCost from the book
  if (key === 'extra_chance') {
    const fromBook = Number(book?.betCost);
    if (Number.isFinite(fromBook) && fromBook > 0) return fromBook;
    return 2; // default ante
  }
  if (key === 'respin') return 50;
  // Buys use fixed multipliers (ignore any per-book betCost)
  if (key === 'bonus') return 100;
  if (key === 'bonus_4') return 200;
  return 1;
}

function selectBook(books, meta, mode) {
  if (!Array.isArray(books) || books.length === 0) return null;
  // Filter by explicit criteria when available for mode-specific selection
  const modeKey = String(mode || '').toLowerCase();
  if (modeKey === 'bonus' || modeKey === 'bonus_4' || modeKey === 'bonus_hunt') {
    const criteriaFiltered = books.filter((b) => String(b?.criteria || '').toLowerCase().includes('bonus'));
    if (criteriaFiltered.length) books = criteriaFiltered;
  }
  const byId = Number(meta?.bookID ?? meta?.id);
  if (!Number.isNaN(byId)) {
    const got = books.find((b) => Number(b?.id) === byId);
    if (got) return got;
  }
  // Try by gameType if provided (best-effort heuristic)
  const gameType = meta?.gameType;
  if (gameType) {
    const hasType = books.find((b) => {
      try {
        const ev = b?.events || b?.state || [];
        return ev.some((e) => e?.gameType === gameType);
      } catch {}
      return false;
    });
    if (hasType) return hasType;
  }
  // Mode-aware preference: for BONUS, favor books containing a bonus trigger or freegame content,
  // and when multiple exist pick the one with highest finalWin/payoutMultiplier.
  if (modeKey === 'bonus' || modeKey === 'bonus_4' || modeKey === 'bonus_hunt') {
    const bonusCandidates = books.filter((b) => {
      try {
        const ev = b?.events || b?.state || [];
        const hasTrigger = ev.some((e) => e?.type === 'freeSpinTrigger' || e?.type === 'bonusModeSelected');
        const hasFree = ev.some((e) => e?.gameType === 'freegame');
        return hasTrigger || hasFree;
      } catch {}
      return false;
    });
    if (bonusCandidates.length === 1) return bonusCandidates[0];
    if (bonusCandidates.length > 1) {
      // Rank by finalWin then payoutMultiplier, descending
      const ranked = [...bonusCandidates].sort((a, b) => {
        const fa = getFinalWinAmountBooks(a) || 0;
        const fb = getFinalWinAmountBooks(b) || 0;
        if (fb !== fa) return fb - fa;
        const pa = typeof a?.payoutMultiplier === 'number' ? a.payoutMultiplier : 0;
        const pb = typeof b?.payoutMultiplier === 'number' ? b.payoutMultiplier : 0;
        return pb - pa;
      });
      return ranked[0];
    }
  }
  // random fallback
  return books[(Math.random() * books.length) | 0];
}

function getFinalWinAmountBooks(book) {
  try {
    const events = book?.events || book?.state || [];
    const fin = [...events].reverse().find((e) => e?.type === 'finalWin' && typeof e?.amount === 'number');
    if (fin) return fin.amount; // in book units (100 => $1)
  } catch {}
  return 0;
}

function derivePayoutMultiplier(book, amountApiUnits) {
  // Convert player's bet to USD
  const API_MULT = 1_000_000; // API_AMOUNT_MULTIPLIER
  const BOOK_MULT = 100; // BOOK_AMOUNT_MULTIPLIER
  const betUsd = (Number(amountApiUnits) || 0) / API_MULT;

  // Prefer deriving from finalWin amount relative to this bet
  const finBooks = getFinalWinAmountBooks(book);
  if (finBooks > 0 && betUsd > 0) {
    const winUsd = finBooks / BOOK_MULT;
    return winUsd / betUsd; // payout / bet
  }

  // Fallbacks: attempt to use any provided book-level multiplier heuristically
  const raw = book?.payoutMultiplier;
  if (typeof raw === 'number') {
    // Some books store as book units (100 => 1x). Convert to USD multiplier first.
    const perUsdBet = raw >= 100 ? raw / 100 : raw; // true multiplier per $1 bet
    if (betUsd > 0) return perUsdBet / 1; // multiplier already relative to bet amount
    return perUsdBet;
  }
  return 0;
}

function selectReplayBook(books, event, mode) {
  if (!Array.isArray(books) || books.length === 0) return null;
  const eventStr = String(event ?? '').trim();
  const eventNum = Number(eventStr);
  if (Number.isFinite(eventNum)) {
    const exact = books.find((book) => Number(book?.id) === eventNum || Number(book?.eventID) === eventNum || Number(book?.eventId) === eventNum);
    if (exact) return exact;
    const zeroIdx = Math.max(0, Math.floor(eventNum));
    if (books[zeroIdx]) return books[zeroIdx];
    if (zeroIdx > 0 && books[zeroIdx - 1]) return books[zeroIdx - 1];
    return books[zeroIdx % books.length];
  }
  return selectBook(books, { id: eventStr, bookID: eventStr }, mode);
}

// In-memory session store
const sessions = new Map();
let nextBetId = Math.floor(Math.random() * 2 ** 31);

function json(res, status, data) {
  writeCors(res);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function okStatus() {
  return { statusCode: 'SUCCESS', statusMessage: 'OK' };
}

function ensureSession(sessionID, currency = 'USD') {
  let s = sessions.get(sessionID);
  if (!s) {
    s = { balance: START_BALANCE, currency, round: null, events: [] };
    sessions.set(sessionID, s);
  }
  return s;
}

function handleAuthenticate(body, res) {
  const { sessionID, language } = body || {};
  if (!sessionID) return json(res, 400, { error: 'ERR_IS' });
  const s = ensureSession(sessionID);
  const config = {
    gameID: '',
    minBet: 100000, // $0.10
    maxBet: 1000000000, // $1000
    stepBet: 10000, // $0.01 steps
    defaultBetLevel: 400000, // $1.00
    betLevels: [
      100000, 200000, 400000, 600000, 800000, 1000000,
      1200000, 1400000, 1600000, 1800000, 2000000, 3000000,
      4000000, 5000000, 6000000, 7000000, 8000000, 9000000,
      10000000, 12000000, 14000000, 16000000, 18000000, 20000000,
      30000000, 40000000, 50000000, 75000000, 100000000,
      150000000, 200000000, 250000000, 300000000, 350000000,
      400000000, 450000000, 500000000, 750000000, 1000000000,
    ],
    betModes: {
      BASE: { mode: 'BASE', costMultiplier: 1, feature: false },
      respin: { mode: 'respin', costMultiplier: 50, feature: true },
    },
    jurisdiction: {
      socialCasino: false,
      disabledFullscreen: false,
      disabledTurbo: false,
      disabledSuperTurbo: false,
      disabledAutoplay: false,
      disabledSlamstop: false,
      disabledSpacebar: false,
      disabledBuyFeature: false,
      displayNetPosition: false,
      displayRTP: false,
      displaySessionTimer: false,
      minimumRoundDuration: 0,
    },
  };
  return json(res, 200, {
    status: okStatus(),
    balance: { amount: s.balance, currency: s.currency },
    round: s.round ? { ...s.round } : null,
    config,
  });
}

function handleBalance(body, res) {
  const { sessionID } = body || {};
  if (!sessionID) return json(res, 400, { error: 'ERR_IS' });
  const s = ensureSession(sessionID);
  return json(res, 200, { balance: { amount: s.balance, currency: s.currency }, status: okStatus() });
}

function handlePlay(body, res) {
  const { sessionID, amount, currency = 'USD', mode = 'BASE', meta } = body || {};
  if (!sessionID) return json(res, 400, { error: 'ERR_IS' });
  if (!Number.isFinite(amount) || amount <= 0) return json(res, 400, { error: 'ERR_VAL' });

  const s = ensureSession(sessionID, currency);
  // Update currency for the session based on the play request
  if (currency && s.currency !== currency) s.currency = currency;
  if (s.balance < amount) return json(res, 400, { error: 'ERR_IPB', message: 'Insufficient balance' });

  const books = loadBooksForMode(mode);
  const book = selectBook(books, meta, mode) || {};
  const costMultiplier = getCostMultiplier(mode, book);
  const debit = Math.max(0, Math.round(amount * costMultiplier));
  try {
    const dbgAmtUsd = (Number(amount) || 0) / 1_000_000;
    const dbgDebUsd = debit / 1_000_000;
    console.log(`[RGS] /wallet/play mode=${mode} base=$${dbgAmtUsd.toFixed(2)} mult=${costMultiplier} debit=$${dbgDebUsd.toFixed(2)}`);
  } catch {}
  // debit immediately based on mode cost (server-side charge)
  s.balance -= debit;
  const payoutMult = derivePayoutMultiplier(book, amount);
  const payout = Math.max(0, Math.round(payoutMult * amount));
  const events = book?.events || book?.state || [];
  const betID = ++nextBetId;
  s.round = {
    roundID: betID,
    betID,
    amount,
    payout,
    payoutMultiplier: payoutMult,
    active: true,
    state: events,
    mode,
    event: '0',
    // debug fields for verification (units in API minor units)
    costMultiplierApplied: costMultiplier,
    debitApplied: debit,
    baseAmountReceived: amount,
  };

  return json(res, 200, {
    status: okStatus(),
    balance: { amount: s.balance, currency: s.currency },
    round: { ...s.round },
  });
}

function handleEndRound(body, res) {
  const { sessionID } = body || {};
  if (!sessionID) return json(res, 400, { error: 'ERR_IS' });
  const s = ensureSession(sessionID);
  if (!s.round) return json(res, 400, { error: 'ERR_BNF' });

  // credit payout and close round
  const payout = Number(s.round?.payout || 0);
  if (payout > 0) s.balance += payout;
  // Clear the round entirely so subsequent authenticate returns round: null
  s.round = null;

  return json(res, 200, {
    status: okStatus(),
    balance: { amount: s.balance, currency: s.currency },
    round: s.round ? { ...s.round } : undefined,
  });
}

function handleReplay(_body, res, { mode, event }) {
  const books = loadBooksForMode(mode);
  const book = selectReplayBook(books, event, mode);
  if (!book) return json(res, 404, { error: 'ERR_BNF', message: 'Replay round not found' });

  const events = Array.isArray(book?.events) ? book.events : (Array.isArray(book?.state) ? book.state : []);
  return json(res, 200, {
    payoutMultiplier: derivePayoutMultiplier(book, 1_000_000),
    costMultiplier: getCostMultiplier(mode, book),
    state: events,
  });
}

function handleBetEvent(body, res) {
  const { sessionID, event } = body || {};
  if (!sessionID) return json(res, 400, { error: 'ERR_IS' });
  const s = ensureSession(sessionID);
  s.events.push(String(event ?? ''));
  return json(res, 200, { status: okStatus() });
}

function handleSearch(body, res) {
  // Force endpoint used by dev tools; does not mutate balance or session
  const { mode = 'BASE', search = {} } = body || {};
  const books = loadBooksForMode(mode);
  const book = selectBook(books, search, mode) || {};
  // Derive multiplier in a consistent way using a notional $1 bet (1_000_000 api units)
  const payoutMult = derivePayoutMultiplier(book, 1_000_000);
  const events = book?.events || book?.state || [];
  return json(res, 200, {
    balance: null,
    round: {
      roundID: undefined,
      amount: undefined,
      payout: undefined,
      payoutMultiplier: payoutMult,
      active: false,
      mode,
      event: null,
      state: events,
    },
    error: null,
  });
}

const server = http.createServer(async (req, res) => {
  writeCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (req.method === 'GET' && path === API_PREFIX + '/health') {
      return json(res, 200, { ok: 1, port: PORT });
    }

    const replayMatch = req.method === 'GET'
      ? path.match(new RegExp(`^${API_PREFIX}/bet/replay/([^/]+)/([^/]+)/([^/]+)/([^/]+)$`))
      : null;
    if (replayMatch) {
      const [, game, version, mode, event] = replayMatch;
      return handleReplay({}, res, {
        game: decodeURIComponent(game || ''),
        version: decodeURIComponent(version || ''),
        mode: decodeURIComponent(mode || ''),
        event: decodeURIComponent(event || ''),
      });
    }

    if (req.method === 'POST' && path === API_PREFIX + '/wallet/authenticate') {
      const body = await readJsonBody(req);
      return handleAuthenticate(body, res);
    }
    if (req.method === 'POST' && path === API_PREFIX + '/wallet/balance') {
      const body = await readJsonBody(req);
      return handleBalance(body, res);
    }
    if (req.method === 'POST' && path === API_PREFIX + '/wallet/play') {
      const body = await readJsonBody(req);
      return handlePlay(body, res);
    }
    if (req.method === 'POST' && path === API_PREFIX + '/wallet/end-round') {
      const body = await readJsonBody(req);
      return handleEndRound(body, res);
    }
    if (req.method === 'POST' && path === API_PREFIX + '/bet/event') {
      const body = await readJsonBody(req);
      return handleBetEvent(body, res);
    }
    if (req.method === 'POST' && path === API_PREFIX + '/game/search') {
      const body = await readJsonBody(req);
      return handleSearch(body, res);
    }

    // not found
    res.statusCode = 404;
    res.end('Not found');
  } catch (e) {
    console.error('[RGS] Error:', e);
    json(res, 500, { error: 'ERR_UE' });
  }
});

server.listen(PORT, () => {
  const url = `http://127.0.0.1:${PORT}${API_PREFIX}/`;
  console.log(`[RGS] Mimic server listening on ${url}`);
});
