import { readFileSync } from 'node:fs';
import { EventSequencer } from '../shared/EventSequencer.mjs';

const books = JSON.parse(readFileSync('apicheck/books_base.json', 'utf8'));
const events = books[0].events;

function playReelAnimation(ev) {
  const rows = ev?.board?.length || 0;
  const duration = 300 + rows * 100;
  console.log('[SEQ] reveal start', { rows, duration });
  return new Promise((resolve) => setTimeout(() => {
    console.log('[SEQ] reveal end');
    resolve();
  }, duration));
}

function updateWinUI(ev) {
  console.log('[SEQ] setTotalWin', ev.amount);
}

async function main() {
  const seq = new EventSequencer(events, {
    handlers: {
      reveal: playReelAnimation,
      settotalwin: updateWinUI,
      '*': () => Promise.resolve(),
    },
    onEventStart: (ev, i) => console.log('[SEQ] start', i, ev.type),
    onEventEnd: (ev, i) => console.log('[SEQ] end', i, ev.type),
    onProgress: ({ index, total }) => console.log(`[SEQ] ${index + 1}/${total}`),
    stepDelay: 25,
  });

  const result = await seq.play();
  console.log('[SEQ] complete', result);

  console.log('[SEQ] turbo mode');
  seq.setTurbo(true);
  await seq.play(0);
}

main().catch((e) => {
  console.error('[SEQ] error', e);
  process.exit(1);
});
