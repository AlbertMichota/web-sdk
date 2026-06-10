const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'apps', 'Crypto_Reapers', 'public', 'assets', 'slotintro');
function walk(dir) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) out.push(...walk(full));
    else if (/\.png$/i.test(it.name)) out.push(full);
  }
  return out;
}
function readPng(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 24) return null;
  const sig = buf.toString('binary', 0, 8);
  if (sig !== '\u0089PNG\r\n\u001a\n') return null;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { w, h, size: buf.length };
}
const files = walk(base);
if (!files.length) {
  console.error('No PNGs found under', base);
  process.exit(1);
}
for (const f of files) {
  try {
    const info = readPng(f);
    if (info) console.log(`${f}\t${info.w}x${info.h}\t${info.size}`);
    else console.log(`ERR: ${f} - not a PNG or unreadable`);
  } catch (e) {
    console.log(`ERR: ${f} - ${e.message}`);
  }
}
