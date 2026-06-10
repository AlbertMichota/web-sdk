import fs from 'fs';
import path from 'path';
import texPacker from 'free-tex-packer-core';
 
function nextPow2(n) {
  const p = Math.pow(2, Math.ceil(Math.log2(n)));
  return p;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const [key, maybeVal] = token.slice(2).split('=');
      if (maybeVal !== undefined) {
        args[key] = maybeVal;
      } else {
        const next = argv[i + 1];
        if (next && !next.startsWith('--')) {
          args[key] = next;
          i++;
        } else {
          args[key] = true;
        }
      }
    }
  }
  return args;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function naturalCompare(a, b) {
  const ax = [];
  const bx = [];
  a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => ax.push([$1 || Infinity, $2 || '']));
  b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => bx.push([$1 || Infinity, $2 || '']));
  while (ax.length && bx.length) {
    const an = ax.shift();
    const bn = bx.shift();
    const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if (nn) return nn;
  }
  return ax.length - bx.length;
}

function gatherImages(srcDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  const files = entries
    .filter(d => d.isFile())
    .map(d => d.name)
    .filter(name => name.toLowerCase().endsWith('.png') || name.toLowerCase().endsWith('.jpg') || name.toLowerCase().endsWith('.jpeg'))
    .sort(naturalCompare);
  return files.map(name => {
    const full = path.join(srcDir, name);
    return {
      path: name,
      contents: fs.readFileSync(full)
    };
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const defaultSrc = path.join('apps', 'Crypto_Reapers', 'src', 'Assets', 'anticipation');
  const srcDir = path.resolve(args.src || defaultSrc);
  const outDir = path.resolve(args.out || srcDir);
  const sheetName = args.name || path.basename(srcDir) || 'spritesheet';
  const maxSize = Number(args.maxSize || 4096);
  const padding = Number(args.padding || 2);

  if (!fs.existsSync(srcDir)) {
    console.error(`[pixi-spritesheet] Source directory does not exist: ${srcDir}`);
    process.exit(1);
  }

  const images = gatherImages(srcDir);
  if (images.length === 0) {
    console.error(`[pixi-spritesheet] No images found in: ${srcDir}`);
    console.error('Add PNG/JPG frames and re-run.');
    process.exit(2);
  }

  ensureDir(outDir);

  const options = {
    textureName: sheetName,
    width: maxSize,
    height: maxSize,
    fixedSize: false,
    powerOfTwo: true,
    allowRotation: false,
    padding,
    allowTrim: true,
    trimMode: 'trim',
    exporter: 'Pixi',
    detectSubImage: false,
    // Use library default packing algorithm
  };

  console.log(`[pixi-spritesheet] Packing ${images.length} images from ${srcDir}`);
  texPacker(images, options, (files, error) => {
    if (error && /Invalid size/.test(error.description || '')) {
      const m = /Min:\s*(\d+)x(\d+)/.exec(error.description);
      if (m) {
        const minW = parseInt(m[1], 10);
        const minH = parseInt(m[2], 10);
        const newW = nextPow2(Math.max(options.width, minW));
        const newH = nextPow2(Math.max(options.height, minH));
        console.log(`[pixi-spritesheet] Retrying with size ${newW}x${newH}...`);
        const retryOptions = { ...options, width: newW, height: newH };
        return texPacker(images, retryOptions, (files2, err2) => {
          if (err2) {
            console.error('[pixi-spritesheet] Pack error:', err2);
            process.exit(3);
          }
          if (!files2 || files2.length === 0) {
            console.error('[pixi-spritesheet] No output files produced.');
            process.exit(4);
          }
          for (const file of files2) {
            const outPath = path.join(outDir, file.name);
            fs.writeFileSync(outPath, file.buffer);
            console.log(`[pixi-spritesheet] Wrote ${outPath}`);
          }
          console.log('[pixi-spritesheet] Done.');
        });
      }
      console.error('[pixi-spritesheet] Pack error:', error);
      process.exit(3);
    }
    if (error) {
      console.error('[pixi-spritesheet] Pack error:', error);
      process.exit(3);
    }
    if (!files || files.length === 0) {
      console.error('[pixi-spritesheet] No output files produced.');
      process.exit(4);
    }
    for (const file of files) {
      const outPath = path.join(outDir, file.name);
      fs.writeFileSync(outPath, file.buffer);
      console.log(`[pixi-spritesheet] Wrote ${outPath}`);
    }
    console.log('[pixi-spritesheet] Done.');
  });
}

main().catch(err => {
  console.error('[pixi-spritesheet] Error:', err);
  process.exit(10);
});
