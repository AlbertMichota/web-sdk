#!/usr/bin/env node
// Copy slot intro spine assets into the app public assets folder for local dev
import fs from 'fs/promises';
import path from 'path';

// Use current working directory as repo root to avoid import.meta.url path quirks on Windows
const repoRoot = process.cwd();
// Copy entire slotintro folder (all subfolders) so multiple intro variants are published
const src = path.join(repoRoot, 'apps', 'Crypto_Reapers', 'src', 'Assets', 'slotintro');
const dest = path.join(repoRoot, 'apps', 'Crypto_Reapers', 'public', 'assets', 'slotintro');

async function ensureDir(p) {
  try { await fs.mkdir(p, { recursive: true }); } catch (e) { }
}

async function copyRecursive(s, d) {
  try {
    const entries = await fs.readdir(s, { withFileTypes: true });
    for (const e of entries) {
      const srcPath = path.join(s, e.name);
      const dstPath = path.join(d, e.name);
      if (e.isDirectory()) {
        await ensureDir(dstPath);
        await copyRecursive(srcPath, dstPath);
      } else if (e.isFile()) {
        await fs.copyFile(srcPath, dstPath);
        console.log('copied', srcPath, '→', dstPath);
      }
    }
  } catch (err) {
    console.error('copy error', err && err.message ? err.message : err);
    process.exitCode = 2;
  }
}

(async () => {
  try {
    // check source exists
    await fs.access(src);
  } catch (e) {
    console.error('source not found:', src);
    process.exit(1);
  }
  await ensureDir(dest);
  await copyRecursive(src, dest);
  console.log('publish complete');
})();
