#!/usr/bin/env node
/**
 * PNG Sequence → Spine 3.8 JSON + .atlas generator (pretty-printed)
 * - Packs all frames into as few atlas PNGs as possible (default)
 * - Builds a minimal frame-swap animation using a single slot and attachment timeline
 *
 * Usage:
 *   node scripts/spine-seq/index.mjs \
 *     --src <framesDir> [--out <outDir>] [--subdir spine] \
 *     [--name <skeletonName>] [--anim <animName>] [--slot <slotName>] \
 *     [--fps 24] [--pack 1] [--maxSize 2048] [--padding 2]
 *
 * Defaults:
 *   --src    apps/Crypto_Reapers/src/Assets/anticipation
 *   --out    <src>
 *   --subdir spine               (outputs go to <out>/<subdir>)
 *   --name   anticipation
 *   --anim   play
 *   --slot   seq
 *   --fps    24
 *   --pack   1                   (pack all frames into few atlas PNGs)
 *   --maxSize 2048               (max atlas edge when packing; auto-bumps if a frame is larger)
 *   --padding 2                  (pixels between regions when packing)
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    const v = (i + 1 < argv.length && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
    args[k] = v;
  }
  return args;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function isPng(file) {
  return /\.png$/i.test(file);
}

function naturalSortNames(a, b) {
  const rx = /(\d+)|(\D+)/g;
  const ax = a.toLowerCase().match(rx) || [];
  const bx = b.toLowerCase().match(rx) || [];
  const len = Math.max(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const ac = ax[i] || '';
    const bc = bx[i] || '';
    const an = ac.match(/^\d+$/) ? parseInt(ac, 10) : NaN;
    const bn = bc.match(/^\d+$/) ? parseInt(bc, 10) : NaN;
    const bothNum = Number.isFinite(an) && Number.isFinite(bn);
    if (bothNum) {
      if (an !== bn) return an - bn;
    } else {
      if (ac !== bc) return ac < bc ? -1 : 1;
    }
  }
  return 0;
}

function readPngSizeSync(filePath) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (!Number.isFinite(width) || !Number.isFinite(height)) throw new Error('Invalid PNG');
    return { width, height };
  } finally {
    fs.closeSync(fd);
  }
}

function buildSpineJson({ names, fps, slotName, animName, imagesPath, w, h, spineVersion = 'auto' }) {
  const dt = 1 / fps;
  const firstAttachment = names[0];
  // Version mapping: pixi-spine v3 -> Spine 3.8.x ; v4 -> Spine 4.1.x
  const sv = spineVersion;
  const spineVer = (sv && sv !== 'auto') ? sv : '3.8.75';
  const json = {
    skeleton: {
      spine: spineVer,
      images: imagesPath || './',
      width: w || 0,
      height: h || 0
    },
    bones: [ { name: 'root' } ],
    slots: [ { name: slotName, bone: 'root', attachment: firstAttachment } ],
    skins: [ {
      name: 'default',
      attachments: {
        [slotName]: names.reduce((acc, n) => { acc[n] = { name: n }; return acc; }, {})
      }
    } ],
    animations: {
      [animName]: {
        slots: {
          [slotName]: {
            attachment: names.map((n, i) => i === 0 ? { name: n } : { time: +(i * dt).toFixed(4), name: n })
          }
        }
      }
    }
  };
  return json;
}

function buildAtlasPagesStandalone({ names, dims }) {
  const pages = [];
  for (let i = 0; i < names.length; i++) {
    const base = names[i];
    const { width, height } = dims[i] || { width: 0, height: 0 };
    pages.push({ file: `${base}.png`, width, height, regions: [ { name: base, x: 0, y: 0, w: width, h: height } ] });
  }
  return pages;
}

function atlasTextFromPages(pages) {
  const lines = [];
  for (const p of pages) {
    lines.push(
      `${p.file}`,
      `size: ${p.width},${p.height}`,
      `format: RGBA8888`,
      `filter: Linear,Linear`,
      `repeat: none`,
      ''
    );
    for (const r of p.regions) {
      lines.push(
        `${r.name}`,
        `  rotate: false`,
        `  xy: ${r.x}, ${r.y}`,
        `  size: ${r.w}, ${r.h}`,
        `  orig: ${r.w}, ${r.h}`,
        `  offset: 0, 0`,
        `  index: -1`,
        ''
      );
    }
  }
  return lines.join(os.EOL);
}

function nextPow2(n) {
  let p = 1; while (p < n) p <<= 1; return p;
}

function shelfPack(items, { maxSize = 2048, padding = 2 }) {
  const sorted = [...items].sort((a, b) => b.h - a.h || b.w - a.w);
  const pages = [];
  const newPage = () => ({ width: 0, height: 0, shelves: [], regions: [] });
  let page = newPage();
  const canPlaceInShelf = (shelf, it) => (shelf.x + it.w <= maxSize) && (it.h <= shelf.h);
  for (const it of sorted) {
    if (it.w > maxSize || it.h > maxSize) {
      throw new Error(`Frame '${it.name}' (${it.w}x${it.h}) exceeds maxSize ${maxSize}`);
    }
    let placed = false;
    for (const shelf of page.shelves) {
      if (canPlaceInShelf(shelf, it)) {
        const x = shelf.x; const y = shelf.y;
        page.regions.push({ name: it.name, x, y, w: it.w, h: it.h });
        shelf.x += it.w + padding;
        page.width = Math.max(page.width, shelf.x);
        placed = true; break;
      }
    }
    if (placed) continue;
    const nextHeight = page.height + it.h + (page.shelves.length ? padding : 0);
    if (nextHeight <= maxSize) {
      const shelf = { y: page.height, x: it.w + padding, h: it.h };
      page.shelves.push(shelf);
      page.regions.push({ name: it.name, x: 0, y: shelf.y, w: it.w, h: it.h });
      page.height = nextHeight;
      page.width = Math.max(page.width, shelf.x);
      continue;
    }
    pages.push(page); page = newPage();
    const shelf = { y: 0, x: it.w + padding, h: it.h };
    page.shelves.push(shelf);
    page.regions.push({ name: it.name, x: 0, y: 0, w: it.w, h: it.h });
    page.height = it.h; page.width = Math.max(page.width, shelf.x);
  }
  if (page.regions.length) pages.push(page);
  for (const p of pages) {
    p.width = Math.max(1, Math.min(maxSize, p.width | 0));
    p.height = Math.max(1, Math.min(maxSize, p.height | 0));
  }
  return pages;
}

async function renderPackedPages({ srcDir, pages, outDir, baseName = 'skeleton' }) {
  const JimpMod = await import('jimp');
  const Jimp = JimpMod.default || JimpMod;
  const pageFiles = [];
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const pageImage = await new Jimp(p.width, p.height, 0x00000000);
    for (const r of p.regions) {
      const imgPath = path.join(srcDir, `${r.name}.png`);
      const img = await Jimp.read(imgPath);
      if (img.bitmap.width !== r.w || img.bitmap.height !== r.h) img.resize(r.w, r.h);
      pageImage.composite(img, r.x, r.y);
    }
    const file = pages.length === 1 ? `${baseName}.png` : `${baseName}-${i}.png`;
    await pageImage.writeAsync(path.join(outDir, file));
    pageFiles.push(file); p.file = file;
  }
  return pageFiles;
}

async function main() {
  const args = parseArgs(process.argv);
  const src = path.resolve(args.src || 'apps/Crypto_Reapers/src/Assets/anticipation');
  const outRoot = path.resolve(args.out || src);
  const outSubdir = String(args.subdir || 'spine');
  const out = path.join(outRoot, outSubdir);

  const animName = String(args.anim || 'play');
  const slotName = String(args.slot || 'seq');
  const fps = Math.max(1, parseInt(args.fps || '24', 10));
  const imagesPath = './'; // pages live next to atlas
  const pack = String(args.pack ?? '1') !== '0';
  let maxSize = Math.max(64, parseInt(args.maxSize || '2048', 10));
  const padding = Math.max(0, parseInt(args.padding || '2', 10));
  let spineVersion = String(args.spineVersion || 'auto');

  if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    console.error(`[png-seq-to-spine] Source directory not found: ${src}`);
    process.exit(1);
  }

  const files = fs.readdirSync(src).filter(isPng).sort(naturalSortNames);
  if (files.length === 0) {
    console.error(`[png-seq-to-spine] No PNG files found in: ${src}`);
    process.exit(2);
  }

  const names = files.map(f => path.basename(f, path.extname(f)));
  const dims = files.map(f => readPngSizeSync(path.join(src, f)));
  const { width: w, height: h } = dims[0] || { width: 0, height: 0 };

  // Auto-bump maxSize if any frame exceeds it (to nearest pow2, capped at 8192)
  if (pack) {
    const maxFrameW = Math.max(...dims.map(d => d.width));
    const maxFrameH = Math.max(...dims.map(d => d.height));
    const needed = Math.max(maxFrameW, maxFrameH);
    if (needed > maxSize) {
      const bumped = Math.min(8192, Math.max(64, nextPow2(needed)));
      console.warn(`[png-seq-to-spine] maxSize ${maxSize} is smaller than a frame (${needed}). Auto-increasing to ${bumped}.`);
      maxSize = bumped;
    }
  }

  // Auto-detect Spine version from the app's pixi-spine major if possible
  if (spineVersion === 'auto') {
    try {
      // Try to read the Crypto_Reapers package.json if src path contains it
      const appRoot = src.includes('apps/crypto_reapers') || src.includes('apps\\crypto_reapers')
        ? path.resolve(src.split(/apps[\\/]/i)[0], 'apps', 'Crypto_Reapers')
        : path.resolve('apps', 'Crypto_Reapers');
      const pkgPath = path.join(appRoot, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const dep = (pkg.dependencies && pkg.dependencies['pixi-spine']) || '';
        const m = String(dep).match(/^(\^|~)?(\d+)\./);
        const major = m ? parseInt(m[2], 10) : 3;
        spineVersion = major >= 4 ? '4.1.08' : '3.8.75';
      } else {
        spineVersion = '3.8.75';
      }
    } catch {
      spineVersion = '3.8.75';
    }
  }

  const spineJson = buildSpineJson({ names, fps, slotName, animName, imagesPath, w, h, spineVersion });

  ensureDir(out);
  const jsonPath = path.join(out, 'skeleton.json');
  const atlasPath = path.join(out, 'skeleton.atlas');
  fs.writeFileSync(jsonPath, JSON.stringify(spineJson, null, 2), 'utf8');

  if (pack) {
    const items = names.map((n, i) => ({ name: n, w: dims[i].width, h: dims[i].height }));
    const pages = shelfPack(items, { maxSize, padding });
    await renderPackedPages({ srcDir: src, pages, outDir: out, baseName: 'skeleton' });
    fs.writeFileSync(atlasPath, atlasTextFromPages(pages), 'utf8');
  } else {
    const pages = buildAtlasPagesStandalone({ names, dims });
    fs.writeFileSync(atlasPath, atlasTextFromPages(pages), 'utf8');
  }

  console.log(`[png-seq-to-spine] Wrote`);
  console.log(`  JSON : ${jsonPath}`);
  console.log(`  ATLAS: ${atlasPath}`);
  console.log(`[png-seq-to-spine] Frames: ${files.length}, fps: ${fps}, slot: ${slotName}, anim: ${animName}`);
  console.log(`[png-seq-to-spine] Spine version: ${spineVersion}`);
}

main().catch((err) => {
  console.error('[png-seq-to-spine] Error:', err && err.stack || err);
  process.exit(10);
});
