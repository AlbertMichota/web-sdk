import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// pngjs is a lightweight decoder that gives normalized RGBA buffers
import { PNG } from 'pngjs';

async function readPngPixels(filePath) {
  const buffer = await fs.readFile(filePath);
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, data: png.data };
}

function hashPixels({ width, height, data }) {
  const h = crypto.createHash('sha256');
  h.update(String(width));
  h.update(String(height));
  h.update(data);
  return h.digest('hex');
}

function isPng(fileName) {
  return /\.png$/i.test(fileName);
}

async function findDuplicates(dir) {
  const entries = await fs.readdir(dir);
  const files = entries.filter(isPng).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  const results = [];
  const seen = new Map(); // hash -> { firstIndex, firstFile, occurrences: [{index,file}] }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(dir, file);
    const pixels = await readPngPixels(fullPath);
    const hash = hashPixels(pixels);

    if (!seen.has(hash)) {
      seen.set(hash, { firstIndex: i, firstFile: file, occurrences: [{ index: i, file }] });
    } else {
      const info = seen.get(hash);
      info.occurrences.push({ index: i, file });
      const loopLength = i - info.firstIndex;
      results.push({
        matchHash: hash,
        firstIndex: info.firstIndex,
        firstFile: info.firstFile,
        index: i,
        file,
        loopLength,
      });
    }
  }

  return { files, results, seen };
}

function formatOutput(dir, files, results) {
  if (files.length === 0) {
    return 'No PNG files found.';
  }
  if (results.length === 0) {
    return `Scanned ${files.length} frame(s) in ${dir}. No exact duplicates found.`;
  }
  const lines = [];
  lines.push(`Scanned ${files.length} frame(s) in ${dir}. Found ${results.length} duplicate match(es):`);
  for (const r of results) {
    lines.push(`- ${r.firstFile} == ${r.file} (indices ${r.firstIndex} -> ${r.index}, loop length ${r.loopLength} frame(s))`);
  }
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const dirArgIndex = args.findIndex(a => !a.startsWith('--'));
  const dir = dirArgIndex >= 0 ? args[dirArgIndex] : null;
  const outArgIndex = args.findIndex(a => a === '--out');
  const outPath = outArgIndex >= 0 && args[outArgIndex + 1] ? args[outArgIndex + 1] : null;

  if (!dir) {
    console.error('Usage: node scripts/find-duplicate-frames.mjs <directory> [--out <jsonPath>]');
    process.exit(1);
  }

  const absDir = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  try {
    const { files, results } = await findDuplicates(absDir);
    const text = formatOutput(dir, files, results);
    console.log(text);

    if (outPath) {
      const absOut = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
      const payload = { directory: dir, totalFrames: files.length, matches: results };
      await fs.writeFile(absOut, JSON.stringify(payload, null, 2), 'utf8');
      console.log(`\nSaved summary to: ${outPath}`);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(2);
  }
}

main();
