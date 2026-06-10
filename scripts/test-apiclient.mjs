import { ApiClient } from '../shared/ApiClient.mjs';

const api = new ApiClient({ apiBase: 'http://127.0.0.1:8800/api/', sessionID: 'Plebeans:owner', lang: 'en', currency: 'USD' });

async function run() {
  console.log('[TEST] authenticate');
  const a = await api.authenticate();
  console.log(a);

  console.log('[TEST] balance');
  const b = await api.balance();
  console.log(b);

  console.log('[TEST] play BASE');
  const p1 = await api.play(400000, { mode: 'BASE' });
  console.log(p1);

  console.log('[TEST] end-round');
  const e = await api.endRound();
  console.log(e);

  console.log('[TEST] play BONUS with meta bookID=1');
  const p2 = await api.play(400000, { mode: 'BONUS', meta: { bookID: 1 } });
  console.log(p2);

  console.log('[TEST] end-round');
  const e2 = await api.endRound();
  console.log(e2);
}

run().catch((err) => {
  console.error('[TEST] Error', err);
  process.exit(1);
});
